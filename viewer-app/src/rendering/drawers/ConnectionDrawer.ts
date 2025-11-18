import { GraphConnection, CanvasConfig } from '@/types';
import { UI_CONSTANTS } from '@/constants';
import { applyOpacity, calculateAngle, drawArrow } from '@/utils/canvasUtils';

/**
 * Classe responsável por desenhar conexões entre nós
 */
export class ConnectionDrawer {
  constructor(
    private ctx: CanvasRenderingContext2D,
    private config: CanvasConfig
  ) {}

  /**
   * Desenha uma conexão entre dois nós
   */
  drawConnection(connection: GraphConnection, isHighlighted: boolean): void {
    if (connection.isBidirectional) {
      this.drawBidirectionalConnection(connection, isHighlighted);
    } else {
      this.drawSimpleConnection(connection, isHighlighted);
    }
  }

  /**
   * Desenha uma conexão simples (unidirecional)
   */
  private drawSimpleConnection(
    connection: GraphConnection,
    isHighlighted: boolean
  ): void {
    const opacity = isHighlighted
      ? UI_CONSTANTS.HIGHLIGHTED_OPACITY
      : UI_CONSTANTS.UNHIGHLIGHTED_OPACITY;

    const baseColor = connection.isCircular
      ? this.config.lineCircularColor
      : this.config.lineColor;

    this.ctx.strokeStyle = applyOpacity(baseColor, opacity);
    this.ctx.fillStyle = applyOpacity(baseColor, opacity);
    this.ctx.lineWidth = this.config.lineWidth;

    const angle = calculateAngle(
      connection.from.x,
      connection.from.y,
      connection.to.x,
      connection.to.y
    );

    const arrowOffset = UI_CONSTANTS.ARROW_SIZE;
    const lineGap = arrowOffset * 0.7;
    const arrowDistance = 2; // distância extra da seta em relação ao nó
    const startX = connection.from.x + Math.cos(angle) * this.config.nodeRadius;
    const startY = connection.from.y + Math.sin(angle) * this.config.nodeRadius;
    const endLineX = connection.to.x - Math.cos(angle) * (this.config.nodeRadius + lineGap);
    const endLineY = connection.to.y - Math.sin(angle) * (this.config.nodeRadius + lineGap);
    const endArrowX = connection.to.x - Math.cos(angle) * (this.config.nodeRadius + arrowDistance);
    const endArrowY = connection.to.y - Math.sin(angle) * (this.config.nodeRadius + arrowDistance);

    // Desenhar linha
    this.ctx.beginPath();
    this.ctx.moveTo(startX, startY);
    this.ctx.lineTo(endLineX, endLineY);
    this.ctx.stroke();

    // Desenhar seta (encostada no nó)
    drawArrow(
      this.ctx,
      endArrowX,
      endArrowY,
      angle,
      UI_CONSTANTS.ARROW_SIZE,
      UI_CONSTANTS.ARROW_SPREAD
    );
  }

  /**
   * Desenha uma conexão bidirecional (duas linhas paralelas com setas)
   */
  private drawBidirectionalConnection(
    connection: GraphConnection,
    isHighlighted: boolean
  ): void {
    const opacity = isHighlighted
      ? UI_CONSTANTS.HIGHLIGHTED_OPACITY
      : UI_CONSTANTS.UNHIGHLIGHTED_OPACITY;

    const baseColor = connection.isCircular
      ? this.config.lineCircularColor
      : this.config.lineColor;

    this.ctx.strokeStyle = applyOpacity(baseColor, opacity);
    this.ctx.fillStyle = applyOpacity(baseColor, opacity);
    this.ctx.lineWidth = this.config.lineWidth;

    const angle = calculateAngle(
      connection.from.x,
      connection.from.y,
      connection.to.x,
      connection.to.y
    );

    const spacing = UI_CONSTANTS.BIDIRECTIONAL_LINE_SPACING;
    const perpX = -Math.sin(angle) * spacing;
    const perpY = Math.cos(angle) * spacing;

    const arrowOffset = UI_CONSTANTS.ARROW_SIZE_BIDIRECTIONAL;
    const lineGap = arrowOffset * 0.7;
    const arrowDistance = 2;
    const startX = connection.from.x + Math.cos(angle) * this.config.nodeRadius;
    const startY = connection.from.y + Math.sin(angle) * this.config.nodeRadius;
    const endLineX = connection.to.x - Math.cos(angle) * (this.config.nodeRadius + lineGap);
    const endLineY = connection.to.y - Math.sin(angle) * (this.config.nodeRadius + lineGap);
    const endArrowX = connection.to.x - Math.cos(angle) * (this.config.nodeRadius + arrowDistance);
    const endArrowY = connection.to.y - Math.sin(angle) * (this.config.nodeRadius + arrowDistance);

    // Primeira linha (from -> to, linha superior)
    this.ctx.beginPath();
    this.ctx.moveTo(startX + perpX, startY + perpY);
    this.ctx.lineTo(endLineX + perpX, endLineY + perpY);
    this.ctx.stroke();

    // Seta da primeira linha (apontando para 'to', encostada no nó)
    drawArrow(
      this.ctx,
      endArrowX + perpX,
      endArrowY + perpY,
      angle,
      UI_CONSTANTS.ARROW_SIZE_BIDIRECTIONAL,
      UI_CONSTANTS.ARROW_SPREAD
    );

    // Segunda linha (to -> from, linha inferior)
    const startXRev = connection.to.x + Math.cos(angle + Math.PI) * this.config.nodeRadius;
    const startYRev = connection.to.y + Math.sin(angle + Math.PI) * this.config.nodeRadius;
    const endLineXRev = connection.from.x - Math.cos(angle + Math.PI) * (this.config.nodeRadius + lineGap);
    const endLineYRev = connection.from.y - Math.sin(angle + Math.PI) * (this.config.nodeRadius + lineGap);
    const endArrowXRev = connection.from.x - Math.cos(angle + Math.PI) * (this.config.nodeRadius + arrowDistance);
    const endArrowYRev = connection.from.y - Math.sin(angle + Math.PI) * (this.config.nodeRadius + arrowDistance);

    this.ctx.beginPath();
    this.ctx.moveTo(startXRev - perpX, startYRev - perpY);
    this.ctx.lineTo(endLineXRev - perpX, endLineYRev - perpY);
    this.ctx.stroke();

    // Seta da segunda linha (apontando para 'from', encostada no nó)
    drawArrow(
      this.ctx,
      endArrowXRev - perpX,
      endArrowYRev - perpY,
      angle + Math.PI,
      UI_CONSTANTS.ARROW_SIZE_BIDIRECTIONAL,
      UI_CONSTANTS.ARROW_SPREAD
    );
  }
}
