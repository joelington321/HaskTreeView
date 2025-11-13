/**
 * Constantes de UI e renderização
 */
export const UI_CONSTANTS = {
  /** Padding ao redor dos componentes conectados */
  COMPONENT_BOUNDARY_PADDING: 40,
  
  /** Raio das bordas arredondadas dos componentes */
  COMPONENT_BORDER_RADIUS: 20,
  
  /** Tamanho da seta em conexões simples */
  ARROW_SIZE: 10,
  
  /** Tamanho da seta em conexões bidirecionais */
  ARROW_SIZE_BIDIRECTIONAL: 12,
  
  /** Ângulo de abertura da seta (em radianos) */
  ARROW_SPREAD: Math.PI / 6,
  
  /** Espaçamento entre linhas em conexões bidirecionais */
  BIDIRECTIONAL_LINE_SPACING: 4,
  
  /** Raio das bordas arredondadas de nós isolados */
  NODE_CORNER_RADIUS: 4,
  
  /** Multiplicador de tamanho para nós isolados */
  ISOLATED_NODE_SIZE_MULTIPLIER: 1.4,
  
  /** Cor de nós isolados */
  ISOLATED_NODE_COLOR: '#888',
  
  /** Cor de borda de nós isolados */
  ISOLATED_NODE_BORDER_COLOR: '#666',
  
  /** Largura da borda dos nós */
  NODE_BORDER_WIDTH: 2,
  
  /** Largura da linha tracejada dos componentes */
  COMPONENT_BORDER_WIDTH: 2,
  
  /** Padrão de tracejado [comprimento, espaço] */
  DASH_PATTERN: [5, 5] as [number, number],
  
  /** Tamanho da fonte do nome do arquivo */
  FILE_NAME_FONT_SIZE: 12,
  
  /** Família da fonte */
  FONT_FAMILY: 'monospace',
  
  /** Tamanho da fonte do label do componente */
  COMPONENT_LABEL_FONT_SIZE: 14,
  
  /** Offset vertical do texto do nome do arquivo */
  FILE_NAME_VERTICAL_OFFSET: 15,
  
  /** Offset vertical do label do componente */
  COMPONENT_LABEL_VERTICAL_OFFSET: -10,
  
  /** Opacidade de elementos não destacados */
  UNHIGHLIGHTED_OPACITY: 0.1,
  
  /** Opacidade de elementos destacados */
  HIGHLIGHTED_OPACITY: 1.0,
  
  /** Largura da borda do texto dos nomes dos nós */
  TEXT_STROKE_WIDTH: 1,
  
  /** Limites de zoom */
  ZOOM_MIN: 0.1,
  ZOOM_MAX: 3.0,
  
  /** Fator de zoom por scroll */
  ZOOM_FACTOR: 0.9,
  ZOOM_FACTOR_INVERSE: 1.1,
  
  /** Posição inicial do viewport */
  INITIAL_VIEWPORT_OFFSET_Y: 100,
  
  /** Posição Y de nós isolados */
  ISOLATED_NODES_Y_POSITION: -300,
  
  /** Espaçamento entre nós isolados (multiplicador do horizontalSpacing) */
  ISOLATED_NODES_SPACING_MULTIPLIER: 0.7,
} as const;
