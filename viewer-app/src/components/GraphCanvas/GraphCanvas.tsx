import { useEffect } from 'react';
import { GraphNode, GraphConnection, ConnectedComponent, ViewportState, CanvasConfig } from '@/types';
import { applyOpacity, getFileName } from '@/utils/helpers';
import { COMPONENT_COLORS, COMPONENT_BORDER_COLORS, UI_CONSTANTS } from '@/constants';
import { CanvasContainer } from './GraphCanvas.styles';

interface GraphCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  nodes: GraphNode[];
  connections: GraphConnection[];
  components: ConnectedComponent[];
  viewport: ViewportState;
  hoveredNodeId: string | null;
  config: CanvasConfig;
  handlers: {
    onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    onMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    onMouseUp: () => void;
    onClick: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    onWheel: (e: React.WheelEvent<HTMLCanvasElement>) => void;
  };
}

export function GraphCanvas({
  canvasRef,
  nodes,
  connections,
  components,
  viewport,
  hoveredNodeId,
  config,
  handlers,
}: GraphCanvasProps) {
  // Renderizar o grafo
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Aplicar transformações
    ctx.save();
    ctx.translate(viewport.offsetX, viewport.offsetY);
    ctx.scale(viewport.scale, viewport.scale);

    // Desenhar contornos de componentes (se houver mais de um)
    if (components.length > 1) {
      drawComponentBoundaries(ctx, nodes, components);
    }

    // Detectar nós e conexões destacados
    const highlightedNodes = new Set<string>();
    const highlightedConnections = new Set<number>();

    if (hoveredNodeId) {
      const hoveredNode = nodes.find((n) => n.id === hoveredNodeId);
      if (hoveredNode) {
        highlightedNodes.add(hoveredNode.id);
        hoveredNode.imports.forEach((id) => highlightedNodes.add(id));
        hoveredNode.importedBy.forEach((id) => highlightedNodes.add(id));

        connections.forEach((conn, index) => {
          if (conn.from.id === hoveredNodeId || conn.to.id === hoveredNodeId) {
            highlightedConnections.add(index);
          }
        });
      }
    }

    // Desenhar conexões
    connections.forEach((conn, index) => {
      drawConnection(ctx, conn, config, !hoveredNodeId || highlightedConnections.has(index));
    });

    // Desenhar nós
    nodes.forEach((node) => {
      const isHighlighted = !hoveredNodeId || highlightedNodes.has(node.id);
      drawNode(ctx, node, config, isHighlighted, node.id === hoveredNodeId);
    });

    ctx.restore();
  }, [canvasRef, nodes, connections, components, viewport, hoveredNodeId, config]);

  return (
    <CanvasContainer>
      <canvas
        ref={canvasRef}
        {...handlers}
        style={{ cursor: hoveredNodeId ? 'pointer' : 'grab' }}
      />
    </CanvasContainer>
  );
}

// Função para desenhar os contornos dos componentes
function drawComponentBoundaries(
  ctx: CanvasRenderingContext2D,
  nodes: GraphNode[],
  components: ConnectedComponent[]
) {
  components.forEach((component) => {
    // Não desenhar contorno para componentes com apenas 1 nó
    if (component.nodes.length <= 1) return;

    const componentNodes = nodes.filter((node) => component.nodes.includes(node.id));
    if (componentNodes.length === 0) return;

    const padding = UI_CONSTANTS.COMPONENT_BOUNDARY_PADDING;
    const minX = Math.min(...componentNodes.map((n) => n.x)) - padding;
    const maxX = Math.max(...componentNodes.map((n) => n.x)) + padding;
    const minY = Math.min(...componentNodes.map((n) => n.y)) - padding;
    const maxY = Math.max(...componentNodes.map((n) => n.y)) + padding;

    const centerX = minX + (maxX - minX) / 2;

    const colorIndex = component.index % COMPONENT_COLORS.length;
    const fillColor = COMPONENT_COLORS[colorIndex];
    const strokeColor = COMPONENT_BORDER_COLORS[colorIndex];

    // Desenhar retângulo arredondado
    const radius = UI_CONSTANTS.COMPONENT_BORDER_RADIUS;
    ctx.beginPath();
    ctx.moveTo(minX + radius, minY);
    ctx.lineTo(maxX - radius, minY);
    ctx.arcTo(maxX, minY, maxX, minY + radius, radius);
    ctx.lineTo(maxX, maxY - radius);
    ctx.arcTo(maxX, maxY, maxX - radius, maxY, radius);
    ctx.lineTo(minX + radius, maxY);
    ctx.arcTo(minX, maxY, minX, maxY - radius, radius);
    ctx.lineTo(minX, minY + radius);
    ctx.arcTo(minX, minY, minX + radius, minY, radius);
    ctx.closePath();

    ctx.fillStyle = fillColor;
    ctx.fill();

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = UI_CONSTANTS.COMPONENT_BORDER_WIDTH;
    ctx.setLineDash(UI_CONSTANTS.DASH_PATTERN);
    ctx.stroke();
    ctx.setLineDash([]);

    // Desenhar label
    ctx.fillStyle = strokeColor;
    ctx.font = `bold ${UI_CONSTANTS.COMPONENT_LABEL_FONT_SIZE}px ${UI_CONSTANTS.FONT_FAMILY}`;
    ctx.textAlign = 'center';
    const label = `Árvore ${component.index + 1} (${component.nodes.length} nós)`;
    ctx.fillText(label, centerX, minY + UI_CONSTANTS.COMPONENT_LABEL_VERTICAL_OFFSET);
  });
}

// Função para desenhar uma conexão
function drawConnection(
  ctx: CanvasRenderingContext2D,
  conn: GraphConnection,
  config: CanvasConfig,
  isHighlighted: boolean
) {
  const opacity = isHighlighted ? UI_CONSTANTS.HIGHLIGHTED_OPACITY : UI_CONSTANTS.UNHIGHLIGHTED_OPACITY;
  const baseColor = conn.isCircular ? config.lineCircularColor : config.lineColor;
  ctx.strokeStyle = applyOpacity(baseColor, opacity);
  ctx.fillStyle = applyOpacity(baseColor, opacity);

  const angle = Math.atan2(conn.to.y - conn.from.y, conn.to.x - conn.from.x);
  const endX = conn.to.x - Math.cos(angle) * config.nodeRadius;
  const endY = conn.to.y - Math.sin(angle) * config.nodeRadius;

  if (conn.isBidirectional) {
    // Linha dupla para bidirecionais
    const spacing = UI_CONSTANTS.BIDIRECTIONAL_LINE_SPACING;
    const perpX = -Math.sin(angle) * spacing;
    const perpY = Math.cos(angle) * spacing;

    ctx.lineWidth = config.lineWidth;

    const startX = conn.from.x + Math.cos(angle) * config.nodeRadius;
    const startY = conn.from.y + Math.sin(angle) * config.nodeRadius;
    const finishX = conn.to.x - Math.cos(angle) * config.nodeRadius;
    const finishY = conn.to.y - Math.sin(angle) * config.nodeRadius;

    // Primeira linha
    ctx.beginPath();
    ctx.moveTo(startX + perpX, startY + perpY);
    ctx.lineTo(finishX + perpX, finishY + perpY);
    ctx.stroke();

    // Segunda linha
    ctx.beginPath();
    ctx.moveTo(startX - perpX, startY - perpY);
    ctx.lineTo(finishX - perpX, finishY - perpY);
    ctx.stroke();

    // Desenhar setas
    const arrowSize = UI_CONSTANTS.ARROW_SIZE_BIDIRECTIONAL;
    const arrowSpread = UI_CONSTANTS.ARROW_SPREAD;

    // Seta 1
    const arrow1X = finishX + perpX;
    const arrow1Y = finishY + perpY;
    ctx.beginPath();
    ctx.moveTo(arrow1X, arrow1Y);
    ctx.lineTo(
      arrow1X - arrowSize * Math.cos(angle - arrowSpread),
      arrow1Y - arrowSize * Math.sin(angle - arrowSpread)
    );
    ctx.lineTo(
      arrow1X - arrowSize * Math.cos(angle + arrowSpread),
      arrow1Y - arrowSize * Math.sin(angle + arrowSpread)
    );
    ctx.closePath();
    ctx.fill();

    // Seta 2
    const reverseAngle = angle + Math.PI;
    const arrow2X = startX - perpX;
    const arrow2Y = startY - perpY;
    ctx.beginPath();
    ctx.moveTo(arrow2X, arrow2Y);
    ctx.lineTo(
      arrow2X - arrowSize * Math.cos(reverseAngle - arrowSpread),
      arrow2Y - arrowSize * Math.sin(reverseAngle - arrowSpread)
    );
    ctx.lineTo(
      arrow2X - arrowSize * Math.cos(reverseAngle + arrowSpread),
      arrow2Y - arrowSize * Math.sin(reverseAngle + arrowSpread)
    );
    ctx.closePath();
    ctx.fill();
  } else {
    // Linha simples
    ctx.lineWidth = config.lineWidth;
    ctx.beginPath();
    ctx.moveTo(conn.from.x, conn.from.y);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Desenhar seta
    const arrowSize = UI_CONSTANTS.ARROW_SIZE;
    const arrowSpread = UI_CONSTANTS.ARROW_SPREAD;
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - arrowSize * Math.cos(angle - arrowSpread),
      endY - arrowSize * Math.sin(angle - arrowSpread)
    );
    ctx.lineTo(
      endX - arrowSize * Math.cos(angle + arrowSpread),
      endY - arrowSize * Math.sin(angle + arrowSpread)
    );
    ctx.closePath();
    ctx.fill();
  }
}

// Função para desenhar um nó
function drawNode(
  ctx: CanvasRenderingContext2D,
  node: GraphNode,
  config: CanvasConfig,
  isHighlighted: boolean,
  isHovered: boolean
) {
  const opacity = isHighlighted ? UI_CONSTANTS.HIGHLIGHTED_OPACITY : UI_CONSTANTS.UNHIGHLIGHTED_OPACITY;
  const isIsolated = node.imports.length === 0 && node.importedBy.length === 0;

  // Desenhar círculo (ou quadrado para nós isolados)
  if (isIsolated) {
    // Nós isolados: desenhar como quadrado com bordas arredondadas
    const size = config.nodeRadius * UI_CONSTANTS.ISOLATED_NODE_SIZE_MULTIPLIER;
    const cornerRadius = UI_CONSTANTS.NODE_CORNER_RADIUS;
    const x = node.x - size;
    const y = node.y - size;
    const width = size * 2;
    const height = size * 2;

    ctx.beginPath();
    ctx.moveTo(x + cornerRadius, y);
    ctx.lineTo(x + width - cornerRadius, y);
    ctx.arcTo(x + width, y, x + width, y + cornerRadius, cornerRadius);
    ctx.lineTo(x + width, y + height - cornerRadius);
    ctx.arcTo(x + width, y + height, x + width - cornerRadius, y + height, cornerRadius);
    ctx.lineTo(x + cornerRadius, y + height);
    ctx.arcTo(x, y + height, x, y + height - cornerRadius, cornerRadius);
    ctx.lineTo(x, y + cornerRadius);
    ctx.arcTo(x, y, x + cornerRadius, y, cornerRadius);
    ctx.closePath();
  } else {
    // Nós normais: círculo
    ctx.beginPath();
    ctx.arc(node.x, node.y, config.nodeRadius, 0, Math.PI * 2);
  }

  let fillColor: string;
  if (isHovered) {
    fillColor = config.nodeHoverColor;
  } else if (node.isCircular) {
    fillColor = config.nodeCircularColor;
  } else if (isIsolated) {
    fillColor = UI_CONSTANTS.ISOLATED_NODE_COLOR;
  } else {
    fillColor = config.nodeColor;
  }

  ctx.fillStyle = applyOpacity(fillColor, opacity);
  ctx.fill();
  ctx.strokeStyle = applyOpacity(isIsolated ? UI_CONSTANTS.ISOLATED_NODE_BORDER_COLOR : '#000', opacity);
  ctx.lineWidth = UI_CONSTANTS.NODE_BORDER_WIDTH;
  ctx.stroke();

  // Desenhar texto
  const textColor = node.isCircular ? config.nodeCircularColor : '#fff';
  ctx.fillStyle = applyOpacity(textColor, opacity);
  ctx.font = `${UI_CONSTANTS.FILE_NAME_FONT_SIZE}px ${UI_CONSTANTS.FONT_FAMILY}`;
  ctx.textAlign = 'center';
  const fileName = getFileName(node.filePath);
  ctx.fillText(fileName, node.x, node.y + config.nodeRadius + UI_CONSTANTS.FILE_NAME_VERTICAL_OFFSET);
}
