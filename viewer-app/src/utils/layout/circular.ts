import { DependencyData, GraphNode, ConnectedComponent, CanvasConfig } from '@/types';
import { createGraphNode } from './nodeHelpers';

/**
 * Layout Circular Simples: Nós específicos em um círculo
 */
export function calculateCircularLayout(
  data: DependencyData,
  cycleNodes: string[],
  radius: number = 150
): GraphNode[] {
  const nodes: GraphNode[] = [];
  const angleStep = (2 * Math.PI) / cycleNodes.length;

  cycleNodes.forEach((nodeId, index) => {
    const angle = -Math.PI / 2 + index * angleStep;
    const node = createGraphNode(
      nodeId,
      Math.cos(angle) * radius,
      Math.sin(angle) * radius,
      data,
      new Set(cycleNodes),
      0
    );
    nodes.push(node);
  });

  return nodes;
}

/**
 * Layout Circular Completo: Todos os nós em um grande círculo
 */
export function calculateCircularCompleteLayout(
  data: DependencyData,
  _components: ConnectedComponent[],
  nodesInCycles: Set<string>,
  _config: CanvasConfig
): GraphNode[] {
  const nodes: GraphNode[] = [];
  const allNodes = data.dependencies;
  const radius = Math.max(300, allNodes.length * 15);
  const angleStep = (2 * Math.PI) / allNodes.length;

  allNodes.forEach((dep, index) => {
    const angle = -Math.PI / 2 + index * angleStep;
    const node = createGraphNode(
      dep.fileId,
      Math.cos(angle) * radius,
      Math.sin(angle) * radius,
      data,
      nodesInCycles,
      0
    );
    nodes.push(node);
  });

  return nodes;
}
