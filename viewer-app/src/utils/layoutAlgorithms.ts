import { DependencyData, GraphNode, ConnectedComponent, CanvasConfig } from '@/types';

/**
 * Calcula o layout hierárquico para os nós do grafo
 */
export function calculateHierarchicalLayout(
  data: DependencyData,
  components: ConnectedComponent[],
  nodesInCycles: Set<string>,
  config: CanvasConfig
): GraphNode[] {
  const nodes: GraphNode[] = [];
  let componentOffsetX = 0;

  // Processar cada componente separadamente
  components.forEach((component) => {
    const componentDeps = data.dependencies.filter((dep) =>
      component.nodes.includes(dep.fileId)
    );

    // Calcular profundidade para este componente
    const rootNodes = componentDeps.filter(
      (dep) =>
        dep.importedBy.length === 0 ||
        dep.importedBy.every((id) => !component.nodes.includes(id))
    );

    const depthMap: Record<string, number> = {};
    const queue:
      | { id: string; depth: number; path: string[] }[]
      | { id: string; depth: number; path: string[] }[] =
      rootNodes.length > 0
        ? rootNodes.map((node) => ({ id: node.fileId, depth: 0, path: [] }))
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

      const node = componentDeps.find((d) => d.fileId === id);
      if (node) {
        const newPath = [...path, id];
        node.imports.forEach((importId) => {
          if (component.nodes.includes(importId)) {
            queue.push({ id: importId, depth: depth + 1, path: newPath });
          }
        });
      }
    }

    componentDeps.forEach((dep) => {
      if (depthMap[dep.fileId] === undefined) {
        depthMap[dep.fileId] = 0;
      }
    });

    // Agrupar por profundidade
    const nodesByDepth: Record<number, typeof componentDeps> = {};
    componentDeps.forEach((dep) => {
      const depth = depthMap[dep.fileId];
      if (!nodesByDepth[depth]) nodesByDepth[depth] = [];
      nodesByDepth[depth].push(dep);
    });

    // Calcular largura máxima deste componente
    let maxWidth = 0;
    Object.values(nodesByDepth).forEach((nodesAtDepth) => {
      const width = (nodesAtDepth.length - 1) * config.horizontalSpacing;
      maxWidth = Math.max(maxWidth, width);
    });

    // Posicionar nós deste componente
    Object.keys(nodesByDepth)
      .map(Number)
      .sort((a, b) => a - b)
      .forEach((depth) => {
        const nodesAtDepth = nodesByDepth[depth];
        const totalWidth = (nodesAtDepth.length - 1) * config.horizontalSpacing;
        const startX = componentOffsetX - totalWidth / 2;

        nodesAtDepth.forEach((dep, index) => {
          const filePath = data.fileRegistry[dep.fileId] || dep.fileId;
          nodes.push({
            id: dep.fileId,
            x: startX + index * config.horizontalSpacing,
            y: depth * config.verticalSpacing,
            filePath: filePath,
            imports: dep.imports,
            importedBy: dep.importedBy,
            isCircular: nodesInCycles.has(dep.fileId),
            componentIndex: component.index,
          });
        });
      });

    // Avançar offset para o próximo componente
    componentOffsetX += maxWidth + config.componentSpacing;
  });

  return nodes;
}

/**
 * Calcula o layout circular para nós que formam um ciclo completo
 */
export function calculateCircularLayout(
  data: DependencyData,
  cycleNodes: string[],
  radius: number = 150
): GraphNode[] {
  const nodes: GraphNode[] = [];
  const angleStep = (2 * Math.PI) / cycleNodes.length;

  cycleNodes.forEach((nodeId, index) => {
    const angle = -Math.PI / 2 + index * angleStep; // Começar no topo
    const dep = data.dependencies.find((d) => d.fileId === nodeId);
    if (!dep) return;

    const filePath = data.fileRegistry[nodeId] || nodeId;

    nodes.push({
      id: nodeId,
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      filePath: filePath,
      imports: dep.imports,
      importedBy: dep.importedBy,
      isCircular: true,
      componentIndex: 0,
    });
  });

  return nodes;
}
