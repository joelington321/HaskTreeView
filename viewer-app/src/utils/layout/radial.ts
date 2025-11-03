import { DependencyData, GraphNode, ConnectedComponent, CanvasConfig } from '@/types';
import { createGraphNode, getComponentDependencies, findRootNodes } from './nodeHelpers';

/**
 * Layout Radial: Árvore radial a partir do centro
 */
export function calculateRadialLayout(
  data: DependencyData,
  components: ConnectedComponent[],
  nodesInCycles: Set<string>,
  _config: CanvasConfig
): GraphNode[] {
  const nodes: GraphNode[] = [];

  components.forEach((component, compIndex) => {
    const componentDeps = getComponentDependencies(data, component);
    const roots = findRootNodes(componentDeps, component);
    const root = roots.length > 0 ? roots[0] : componentDeps[0];
    
    const angleOffset = (compIndex * 2 * Math.PI) / components.length;
    const centerX = compIndex * 600;
    const centerY = 0;

    // Calcular níveis usando BFS
    const levels = calculateRadialLevels(componentDeps, root, component);
    const nodesByLevel = groupNodesByLevel(componentDeps, levels);
    const maxLevel = Math.max(...Array.from(levels.values()));

    // Posicionar nós radialmente
    positionNodesRadially(
      nodes,
      nodesByLevel,
      maxLevel,
      angleOffset,
      centerX,
      centerY,
      data,
      nodesInCycles,
      compIndex
    );
  });

  return nodes;
}

/**
 * Calcula níveis radiais usando BFS
 */
function calculateRadialLevels(
  componentDeps: ReturnType<typeof getComponentDependencies>,
  root: typeof componentDeps[0],
  component: ConnectedComponent
): Map<string, number> {
  const levels = new Map<string, number>();
  const queue: string[] = [root.fileId];
  levels.set(root.fileId, 0);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentLevel = levels.get(current)!;
    const dep = componentDeps.find(d => d.fileId === current)!;

    dep.imports.forEach(importId => {
      if (!levels.has(importId) && component.nodes.includes(importId)) {
        levels.set(importId, currentLevel + 1);
        queue.push(importId);
      }
    });
  }

  return levels;
}

/**
 * Agrupa nós por nível radial
 */
function groupNodesByLevel(
  componentDeps: ReturnType<typeof getComponentDependencies>,
  levels: Map<string, number>
): Map<number, string[]> {
  const nodesByLevel = new Map<number, string[]>();
  
  componentDeps.forEach(dep => {
    const level = levels.get(dep.fileId) ?? 0;
    if (!nodesByLevel.has(level)) {
      nodesByLevel.set(level, []);
    }
    nodesByLevel.get(level)!.push(dep.fileId);
  });

  return nodesByLevel;
}

/**
 * Posiciona nós em layout radial
 */
function positionNodesRadially(
  nodes: GraphNode[],
  nodesByLevel: Map<number, string[]>,
  maxLevel: number,
  angleOffset: number,
  centerX: number,
  centerY: number,
  data: DependencyData,
  nodesInCycles: Set<string>,
  componentIndex: number
) {
  nodesByLevel.forEach((nodeIds, level) => {
    const radius = level === 0 ? 0 : (level / (maxLevel || 1)) * 400;
    const angleSpan = nodeIds.length === 1 ? 0 : Math.PI * 1.5;
    const angleStep = nodeIds.length === 1 ? 0 : angleSpan / (nodeIds.length - 1);
    const startAngle = angleOffset - angleSpan / 2;

    nodeIds.forEach((nodeId, index) => {
      const angle = startAngle + index * angleStep;
      const node = createGraphNode(
        nodeId,
        centerX + Math.cos(angle) * radius,
        centerY + Math.sin(angle) * radius,
        data,
        nodesInCycles,
        componentIndex
      );
      nodes.push(node);
    });
  });
}
