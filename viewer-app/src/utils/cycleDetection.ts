import { DependencyData, Cycle } from '@/types';

/**
 * Detecta ciclos no grafo de dependências usando DFS
 */
export function detectCycles(data: DependencyData): Cycle[] {
  const cycles: Cycle[] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function dfs(nodeId: string, path: string[]): void {
    if (recursionStack.has(nodeId)) {
      // Encontrou um ciclo
      const cycleStart = path.indexOf(nodeId);
      const cycle = path.slice(cycleStart);
      cycles.push({ nodes: cycle });
      return;
    }

    if (visited.has(nodeId)) return;

    visited.add(nodeId);
    recursionStack.add(nodeId);

    const node = data.dependencies.find((d) => d.fileId === nodeId);
    if (node) {
      node.imports.forEach((importId) => {
        dfs(importId, [...path, nodeId]);
      });
    }

    recursionStack.delete(nodeId);
  }

  data.dependencies.forEach((dep) => {
    if (!visited.has(dep.fileId)) {
      dfs(dep.fileId, []);
    }
  });

  return cycles;
}

/**
 * Retorna um Set com todos os IDs de nós que fazem parte de algum ciclo
 */
export function getNodesInCycles(cycles: Cycle[]): Set<string> {
  const nodesInCycles = new Set<string>();
  cycles.forEach((cycle) =>
    cycle.nodes.forEach((nodeId) => nodesInCycles.add(nodeId))
  );
  return nodesInCycles;
}
