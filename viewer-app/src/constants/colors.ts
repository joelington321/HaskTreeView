/**
 * Cores para componentes conectados (árvores desconexas)
 * Usadas para destacar visualmente diferentes grupos de arquivos
 */
export const COMPONENT_COLORS = [
  'rgba(0, 150, 255, 0.3)',
  'rgba(255, 150, 0, 0.3)',
  'rgba(0, 255, 150, 0.3)',
  'rgba(255, 0, 150, 0.3)',
  'rgba(150, 0, 255, 0.3)',
  'rgba(255, 255, 0, 0.3)',
  'rgba(0, 255, 255, 0.3)',
] as const;

/**
 * Cores de borda para componentes conectados
 * Versão mais opaca das cores de preenchimento
 */
export const COMPONENT_BORDER_COLORS = [
  'rgba(0, 150, 255, 0.8)',
  'rgba(255, 150, 0, 0.8)',
  'rgba(0, 255, 150, 0.8)',
  'rgba(255, 0, 150, 0.8)',
  'rgba(150, 0, 255, 0.8)',
  'rgba(255, 255, 0, 0.8)',
  'rgba(0, 255, 255, 0.8)',
] as const;
