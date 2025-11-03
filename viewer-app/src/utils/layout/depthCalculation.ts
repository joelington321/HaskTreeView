import { ConnectedComponent } from '@/types';
import { getComponentDependencies } from './nodeHelpers';

/**
 * Calcula profundidades dos nós usando BFS
 */
export function calculateDepthMap(
  componentDeps: ReturnType<typeof getComponentDependencies>,
  component: ConnectedComponent,
  startNodes: typeof componentDeps
): Record<string, number> {
  const depthMap: Record<string, number> = {};
  const queue: { id: string; depth: number; path: string[] }[] =
    startNodes.length > 0
      ? startNodes.map(node => ({ id: node.fileId, depth: 0, path: [] }))
      : [{ id: componentDeps[0].fileId, depth: 0, path: [] }];

  while (queue.length > 0) {
    const { id, depth, path } = queue.shift()!;

    if (depthMap[id] !== undefined && depthMap[id] <= depth) {
      continue;
    }

    if (path.includes(id)) {
      if (depthMap[id] === undefined) {
        depthMap[id] = depth;
      }
      continue;
    }

    depthMap[id] = depth;

    const node = componentDeps.find(d => d.fileId === id);
    if (node) {
      const newPath = [...path, id];
      node.imports.forEach(importId => {
        if (component.nodes.includes(importId)) {
          queue.push({ id: importId, depth: depth + 1, path: newPath });
        }
      });
    }
  }

  // Garantir que todos os nós tenham profundidade
  componentDeps.forEach(dep => {
    if (depthMap[dep.fileId] === undefined) {
      depthMap[dep.fileId] = 0;
    }
  });

  return depthMap;
}

/**
 * Agrupa nós por profundidade
 */
export function groupNodesByDepth<T extends { fileId: string }>(
  nodes: T[],
  depthMap: Record<string, number>
): Record<number, T[]> {
  const nodesByDepth: Record<number, T[]> = {};
  
  nodes.forEach(node => {
    const depth = depthMap[node.fileId];
    if (!nodesByDepth[depth]) {
      nodesByDepth[depth] = [];
    }
    nodesByDepth[depth].push(node);
  });

  return nodesByDepth;
}

/**
 * Calcula largura máxima de um componente baseado nos nós por profundidade
 */
export function calculateMaxWidth(
  nodesByDepth: Record<number, any[]>,
  horizontalSpacing: number
): number {
  let maxWidth = 0;
  
  Object.values(nodesByDepth).forEach(nodesAtDepth => {
    const width = (nodesAtDepth.length - 1) * horizontalSpacing;
    maxWidth = Math.max(maxWidth, width);
  });

  return maxWidth;
}
