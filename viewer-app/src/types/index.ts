// Estrutura dos dados JSON carregados
export interface DependencyData {
  projectName: string;
  analyzedAt: string;
  fileRegistry: Record<string, string>;
  dependencies: FileDependency[];
}

export interface FileDependency {
  fileId: string;
  imports: string[];
  importedBy: string[];
}

// Estruturas internas da aplicação
export interface GraphNode {
  id: string;
  x: number;
  y: number;
  filePath: string;
  imports: string[];
  importedBy: string[];
  isCircular: boolean;
  componentIndex: number;
  hover?: boolean;
}

export interface GraphConnection {
  from: GraphNode;
  to: GraphNode;
  isBidirectional: boolean;
  isCircular: boolean;
}

export interface ConnectedComponent {
  nodes: string[];
  index: number;
}

export interface Cycle {
  nodes: string[];
}

export interface GraphStats {
  projectName: string;
  totalFiles: number;
  totalConnections: number;
  disconnectedTrees: number;
  cyclesDetected: number;
  analyzedAt: string;
}

export interface ViewportState {
  offsetX: number;
  offsetY: number;
  scale: number;
}

export interface CanvasConfig {
  nodeRadius: number;
  nodeColor: string;
  nodeHoverColor: string;
  nodeCircularColor: string;
  lineColor: string;
  lineCircularColor: string;
  lineWidth: number;
  verticalSpacing: number;
  horizontalSpacing: number;
  componentSpacing: number;
}
