import { DependencyData, GraphNode, ConnectedComponent, CanvasConfig } from '@/types';

export type LayoutFunction = (
  data: DependencyData,
  components: ConnectedComponent[],
  nodesInCycles: Set<string>,
  config: CanvasConfig
) => GraphNode[];

export interface LayoutContext {
  data: DependencyData;
  components: ConnectedComponent[];
  nodesInCycles: Set<string>;
  config: CanvasConfig;
}

export interface NodePosition {
  id: string;
  x: number;
  y: number;
}

export interface ComponentBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
}
