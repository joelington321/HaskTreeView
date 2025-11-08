import { GraphNode, ConnectedComponent } from '@/types';
import { COMPONENT_COLORS, COMPONENT_BORDER_COLORS, UI_CONSTANTS } from '@/constants';
import { drawRoundedRect } from '@/utils/canvasUtils';

/**
 * Classe responsável por desenhar contornos de componentes conectados
 */
export class ComponentDrawer {
  constructor(private ctx: CanvasRenderingContext2D) {}

  /**
   * Desenha os contornos de todos os componentes
   */
  drawComponents(nodes: GraphNode[], components: ConnectedComponent[]): void {
    // Não desenhar se houver apenas um componente
    if (components.length <= 1) return;

    components.forEach((component) => {
      // Não desenhar contorno para componentes com apenas 1 nó
      if (component.nodes.length <= 1) return;

      this.drawComponent(nodes, component);
    });
  }

  /**
   * Desenha o contorno de um componente específico
   */
  private drawComponent(nodes: GraphNode[], component: ConnectedComponent): void {
    const componentNodes = nodes.filter((node) =>
      component.nodes.includes(node.id)
    );

    if (componentNodes.length === 0) return;

    const bounds = this.calculateComponentBounds(componentNodes);
    const colorIndex = component.index % COMPONENT_COLORS.length;

    this.drawComponentBackground(bounds, colorIndex);
    this.drawComponentLabel(bounds, component, colorIndex);
  }

  /**
   * Calcula os limites (bounds) do componente
   */
  private calculateComponentBounds(nodes: GraphNode[]): {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    centerX: number;
  } {
    const padding = UI_CONSTANTS.COMPONENT_BOUNDARY_PADDING;
    const minX = Math.min(...nodes.map((n) => n.x)) - padding;
    const maxX = Math.max(...nodes.map((n) => n.x)) + padding;
    const minY = Math.min(...nodes.map((n) => n.y)) - padding;
    const maxY = Math.max(...nodes.map((n) => n.y)) + padding;
    const centerX = minX + (maxX - minX) / 2;

    return { minX, maxX, minY, maxY, centerX };
  }

  /**
   * Desenha o fundo e borda do componente
   */
  private drawComponentBackground(
    bounds: { minX: number; maxX: number; minY: number; maxY: number },
    colorIndex: number
  ): void {
    const fillColor = COMPONENT_COLORS[colorIndex];
    const strokeColor = COMPONENT_BORDER_COLORS[colorIndex];

    const width = bounds.maxX - bounds.minX;
    const height = bounds.maxY - bounds.minY;

    drawRoundedRect(
      this.ctx,
      bounds.minX,
      bounds.minY,
      width,
      height,
      UI_CONSTANTS.COMPONENT_BORDER_RADIUS
    );

    this.ctx.fillStyle = fillColor;
    this.ctx.fill();

    this.ctx.strokeStyle = strokeColor;
    this.ctx.lineWidth = UI_CONSTANTS.COMPONENT_BORDER_WIDTH;
    this.ctx.setLineDash(UI_CONSTANTS.DASH_PATTERN);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
  }

  /**
   * Desenha o label do componente
   */
  private drawComponentLabel(
    bounds: { minY: number; centerX: number },
    component: ConnectedComponent,
    colorIndex: number
  ): void {
    const strokeColor = COMPONENT_BORDER_COLORS[colorIndex];

    this.ctx.fillStyle = strokeColor;
    this.ctx.font = `bold ${UI_CONSTANTS.COMPONENT_LABEL_FONT_SIZE}px ${UI_CONSTANTS.FONT_FAMILY}`;
    this.ctx.textAlign = 'center';

    const label = `Árvore ${component.index + 1} (${component.nodes.length} nós)`;
    const y = bounds.minY + UI_CONSTANTS.COMPONENT_LABEL_VERTICAL_OFFSET;
    this.ctx.fillText(label, bounds.centerX, y);
  }
}
