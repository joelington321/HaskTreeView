import { GraphNode, GraphConnection, ConnectedComponent, ViewportState, CanvasConfig } from '@/types';
import { NodeDrawer } from './drawers/NodeDrawer';
import { ConnectionDrawer } from './drawers/ConnectionDrawer';
import { ComponentDrawer } from './drawers/ComponentDrawer';

/**
 * Interface para dados de renderização
 */
export interface RenderData {
  nodes: GraphNode[];
  connections: GraphConnection[];
  components: ConnectedComponent[];
  viewport: ViewportState;
  hoveredNodeId: string | null;
}

/**
 * Classe principal responsável por renderizar o grafo no canvas
 */
export class CanvasRenderer {
  private nodeDrawer: NodeDrawer;
  private connectionDrawer: ConnectionDrawer;
  private componentDrawer: ComponentDrawer;

  constructor(
    private canvas: HTMLCanvasElement,
    config: CanvasConfig
  ) {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Não foi possível obter o contexto 2D do canvas');
    }

    this.nodeDrawer = new NodeDrawer(ctx, config);
    this.connectionDrawer = new ConnectionDrawer(ctx, config);
    this.componentDrawer = new ComponentDrawer(ctx);
  }

  /**
   * Renderiza o grafo completo
   */
  render(data: RenderData): void {
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    // Limpar canvas
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Aplicar transformações de viewport
    ctx.save();
    ctx.translate(data.viewport.offsetX, data.viewport.offsetY);
    ctx.scale(data.viewport.scale, data.viewport.scale);

    // Desenhar componentes (se houver mais de um)
    this.componentDrawer.drawComponents(data.nodes, data.components);

    // Calcular elementos destacados
    const { highlightedNodes, highlightedConnections } = this.calculateHighlights(
      data.nodes,
      data.connections,
      data.hoveredNodeId
    );

    // Desenhar conexões
    data.connections.forEach((conn, index) => {
      const isHighlighted =
        !data.hoveredNodeId || highlightedConnections.has(index);
      this.connectionDrawer.drawConnection(conn, isHighlighted);
    });

    // Desenhar nós
    data.nodes.forEach((node) => {
      const isHighlighted = !data.hoveredNodeId || highlightedNodes.has(node.id);
      const isHovered = node.id === data.hoveredNodeId;
      this.nodeDrawer.drawNode(node, { isHighlighted, isHovered });
    });

    ctx.restore();
  }

  /**
   * Calcula quais nós e conexões devem ser destacados
   */
  private calculateHighlights(
    nodes: GraphNode[],
    connections: GraphConnection[],
    hoveredNodeId: string | null
  ): {
    highlightedNodes: Set<string>;
    highlightedConnections: Set<number>;
  } {
    const highlightedNodes = new Set<string>();
    const highlightedConnections = new Set<number>();

    if (!hoveredNodeId) {
      return { highlightedNodes, highlightedConnections };
    }

    const hoveredNode = nodes.find((n) => n.id === hoveredNodeId);
    if (!hoveredNode) {
      return { highlightedNodes, highlightedConnections };
    }

    // Adicionar nó em hover e suas dependências
    highlightedNodes.add(hoveredNode.id);
    hoveredNode.imports.forEach((id) => highlightedNodes.add(id));
    hoveredNode.importedBy.forEach((id) => highlightedNodes.add(id));

    // Adicionar conexões relacionadas
    connections.forEach((conn, index) => {
      if (conn.from.id === hoveredNodeId || conn.to.id === hoveredNodeId) {
        highlightedConnections.add(index);
      }
    });

    return { highlightedNodes, highlightedConnections };
  }

  /**
   * Atualiza a configuração do renderer
   */
  updateConfig(config: CanvasConfig): void {
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    this.nodeDrawer = new NodeDrawer(ctx, config);
    this.connectionDrawer = new ConnectionDrawer(ctx, config);
  }
}
