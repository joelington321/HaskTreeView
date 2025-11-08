import { GraphConnection, CanvasConfig } from '@/types';
import { UI_CONSTANTS } from '@/constants';
import { applyOpacity, calculateAngle, drawArrow } from '../utils/canvasUtils';

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

    const endX = connection.to.x - Math.cos(angle) * this.config.nodeRadius;
    const endY = connection.to.y - Math.sin(angle) * this.config.nodeRadius;

    // Desenhar linha
    this.ctx.beginPath();
    this.ctx.moveTo(connection.from.x, connection.from.y);
    this.ctx.lineTo(endX, endY);
    this.ctx.stroke();

    // Desenhar seta
    drawArrow(
      this.ctx,
      endX,
      endY,
      angle,
      UI_CONSTANTS.ARROW_SIZE,
      UI_CONSTANTS.ARROW_SPREAD
    );
  }

  /**
   * Desenha uma conexão bidirecional (duas setas)
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

    const startX = connection.from.x + Math.cos(angle) * this.config.nodeRadius;
    const startY = connection.from.y + Math.sin(angle) * this.config.nodeRadius;
    const endX = connection.to.x - Math.cos(angle) * this.config.nodeRadius;
    const endY = connection.to.y - Math.sin(angle) * this.config.nodeRadius;

    // Primeira linha
    this.ctx.beginPath();
    this.ctx.moveTo(startX + perpX, startY + perpY);
    this.ctx.lineTo(endX + perpX, endY + perpY);
    this.ctx.stroke();

    // Segunda linha
    this.ctx.beginPath();
    this.ctx.moveTo(startX - perpX, startY - perpY);
    this.ctx.lineTo(endX - perpX, endY - perpY);
    this.ctx.stroke();

    // Seta 1 (para frente)
    drawArrow(
      this.ctx,
      endX + perpX,
      endY + perpY,
      angle,
      UI_CONSTANTS.ARROW_SIZE_BIDIRECTIONAL,
      UI_CONSTANTS.ARROW_SPREAD
    );

    // Seta 2 (para trás)
    const reverseAngle = angle + Math.PI;
    drawArrow(
      this.ctx,
      startX - perpX,
      startY - perpY,
      reverseAngle,
      UI_CONSTANTS.ARROW_SIZE_BIDIRECTIONAL,
      UI_CONSTANTS.ARROW_SPREAD
    );
  }
}
