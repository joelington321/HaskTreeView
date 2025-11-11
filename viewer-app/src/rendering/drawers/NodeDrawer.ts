import { GraphNode, CanvasConfig } from '@/types';
import { UI_CONSTANTS } from '@/constants';
import { applyOpacity, drawRoundedRect } from '@/utils/canvasUtils';
import { getFileName } from '@/utils/helpers';

/**
 * Interface para opções de desenho de nós
 */
interface NodeDrawOptions {
  isHighlighted: boolean;
  isHovered: boolean;
}

/**
 * Classe responsável por desenhar nós no canvas
 */
export class NodeDrawer {
  constructor(
    private ctx: CanvasRenderingContext2D,
    private config: CanvasConfig
  ) {}

  /**
   * Desenha um nó no canvas
   */
  drawNode(node: GraphNode, options: NodeDrawOptions): void {
    const isIsolated = node.imports.length === 0 && node.importedBy.length === 0;

    if (isIsolated) {
      this.drawIsolatedNode(node, options);
    } else {
      this.drawConnectedNode(node, options);
    }

    this.drawNodeLabel(node, options);
  }

  /**
   * Desenha um nó isolado (quadrado com bordas arredondadas)
   */
  private drawIsolatedNode(node: GraphNode, options: NodeDrawOptions): void {
    const size = this.config.nodeRadius * UI_CONSTANTS.ISOLATED_NODE_SIZE_MULTIPLIER;
    const x = node.x - size;
    const y = node.y - size;
    const width = size * 2;
    const height = size * 2;

    drawRoundedRect(
      this.ctx,
      x,
      y,
      width,
      height,
      UI_CONSTANTS.NODE_CORNER_RADIUS
    );

    this.fillAndStrokeNode(node, options, true);
  }

  /**
   * Desenha um nó conectado (círculo)
   */
  private drawConnectedNode(node: GraphNode, options: NodeDrawOptions): void {
    this.ctx.beginPath();
    this.ctx.arc(node.x, node.y, this.config.nodeRadius, 0, Math.PI * 2);
    this.fillAndStrokeNode(node, options, false);
  }

  /**
   * Aplica preenchimento e borda ao nó
   */
  private fillAndStrokeNode(
    node: GraphNode,
    options: NodeDrawOptions,
    isIsolated: boolean
  ): void {
    const opacity = options.isHighlighted
      ? UI_CONSTANTS.HIGHLIGHTED_OPACITY
      : UI_CONSTANTS.UNHIGHLIGHTED_OPACITY;

    let fillColor: string;
    if (options.isHovered) {
      fillColor = this.config.nodeHoverColor;
    } else if (node.isCircular) {
      fillColor = this.config.nodeCircularColor;
    } else if (isIsolated) {
      fillColor = UI_CONSTANTS.ISOLATED_NODE_COLOR;
    } else {
      fillColor = this.config.nodeColor;
    }

    this.ctx.fillStyle = applyOpacity(fillColor, opacity);
    this.ctx.fill();

    const strokeColor = isIsolated
      ? UI_CONSTANTS.ISOLATED_NODE_BORDER_COLOR
      : '#000';
    this.ctx.strokeStyle = applyOpacity(strokeColor, opacity);
    this.ctx.lineWidth = UI_CONSTANTS.NODE_BORDER_WIDTH;
    this.ctx.stroke();
  }

  /**
   * Desenha o label (nome do arquivo) do nó
   */
  private drawNodeLabel(node: GraphNode, options: NodeDrawOptions): void {
    const opacity = options.isHighlighted
      ? UI_CONSTANTS.HIGHLIGHTED_OPACITY
      : UI_CONSTANTS.UNHIGHLIGHTED_OPACITY;

    const textColor = node.isCircular ? this.config.nodeCircularColor : '#fff';
    this.ctx.fillStyle = applyOpacity(textColor, opacity);
    this.ctx.font = `${UI_CONSTANTS.FILE_NAME_FONT_SIZE}px ${UI_CONSTANTS.FONT_FAMILY}`;
    this.ctx.textAlign = 'center';

    const fileName = getFileName(node.filePath);
    const y = node.y + this.config.nodeRadius + UI_CONSTANTS.FILE_NAME_VERTICAL_OFFSET;
    this.ctx.fillText(fileName, node.x, y);
  }
}
