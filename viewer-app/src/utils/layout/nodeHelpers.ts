import { DependencyData, GraphNode, ConnectedComponent } from '@/types';

/**
 * Cria um GraphNode a partir dos dados de dependência
 */
export function createGraphNode(
  nodeId: string,
  x: number,
  y: number,
  data: DependencyData,
  nodesInCycles: Set<string>,
  componentIndex: number
): GraphNode {
  const dep = data.dependencies.find(d => d.fileId === nodeId)!;
  const filePath = data.fileRegistry[nodeId] || nodeId;

  return {
    id: nodeId,
    x,
    y,
    filePath,
    imports: dep.imports,
    importedBy: dep.importedBy,
    isCircular: nodesInCycles.has(nodeId),
    componentIndex,
  };
}

/**
 * Separa componentes conectados de nós isolados
 */
export function separateComponents(components: ConnectedComponent[]) {
  return {
    connected: components.filter(comp => comp.nodes.length > 1),
    isolated: components.filter(comp => comp.nodes.length === 1),
  };
}

/**
 * Filtra dependências por componente
 */
export function getComponentDependencies(
  data: DependencyData,
  component: ConnectedComponent
) {
  return data.dependencies.filter(dep =>
    component.nodes.includes(dep.fileId)
  );
}

/**
 * Encontra nós raiz (sem importedBy ou todos importedBy fora do componente)
 */
export function findRootNodes(
  componentDeps: ReturnType<typeof getComponentDependencies>,
  component: ConnectedComponent
) {
  return componentDeps.filter(dep =>
    dep.importedBy.length === 0 ||
    dep.importedBy.every(id => !component.nodes.includes(id))
  );
}
