import { DependencyData, ConnectedComponent } from '@/types';

/**
 * Encontra componentes conectados (árvores desconexas) no grafo
 */
export function findConnectedComponents(data: DependencyData): ConnectedComponent[] {
  const visited = new Set<string>();
  const components: ConnectedComponent[] = [];

  // Criar um mapa de adjacência (bidirecional)
  const adjacencyMap = new Map<string, Set<string>>();
  data.dependencies.forEach((dep) => {
    if (!adjacencyMap.has(dep.fileId)) {
      adjacencyMap.set(dep.fileId, new Set());
    }

    // Adicionar importações
    dep.imports.forEach((importId) => {
      adjacencyMap.get(dep.fileId)!.add(importId);

      // Adicionar conexão reversa
      if (!adjacencyMap.has(importId)) {
        adjacencyMap.set(importId, new Set());
      }
      adjacencyMap.get(importId)!.add(dep.fileId);
    });

    // Adicionar importedBy
    dep.importedBy.forEach((importedById) => {
      adjacencyMap.get(dep.fileId)!.add(importedById);

      if (!adjacencyMap.has(importedById)) {
        adjacencyMap.set(importedById, new Set());
      }
      adjacencyMap.get(importedById)!.add(dep.fileId);
    });
  });

  // BFS para encontrar componentes
  function bfs(startNodeId: string): string[] {
    const component: string[] = [];
    const queue: string[] = [startNodeId];
    visited.add(startNodeId);

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      component.push(nodeId);

      const neighbors = adjacencyMap.get(nodeId) || new Set();
      neighbors.forEach((neighborId) => {
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push(neighborId);
        }
      });
    }

    return component;
  }

  // Encontrar todos os componentes
  data.dependencies.forEach((dep) => {
    if (!visited.has(dep.fileId)) {
      const componentNodes = bfs(dep.fileId);
      components.push({
        nodes: componentNodes,
        index: components.length,
      });
    }
  });

  return components;
}
