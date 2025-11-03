import { DependencyData, GraphNode, ConnectedComponent, CanvasConfig } from '@/types';
import { createGraphNode, separateComponents, getComponentDependencies, findRootNodes } from './nodeHelpers';
import { calculateDepthMap, groupNodesByDepth, calculateMaxWidth } from './depthCalculation';

/**
 * Layout Hierárquico: Organiza nós em camadas baseado em dependências
 */
export function calculateHierarchicalLayout(
  data: DependencyData,
  components: ConnectedComponent[],
  nodesInCycles: Set<string>,
  config: CanvasConfig
): GraphNode[] {
  const nodes: GraphNode[] = [];
  let componentOffsetX = 0;

  const { connected, isolated } = separateComponents(components);

  // Processar componentes conectados
  connected.forEach(component => {
    const componentDeps = getComponentDependencies(data, component);
    const rootNodes = findRootNodes(componentDeps, component);
    const depthMap = calculateDepthMap(componentDeps, component, rootNodes);
    const nodesByDepth = groupNodesByDepth(componentDeps, depthMap);
    const maxWidth = calculateMaxWidth(nodesByDepth, config.horizontalSpacing);

    // Posicionar nós por profundidade
    Object.keys(nodesByDepth)
      .map(Number)
      .sort((a, b) => a - b)
      .forEach(depth => {
        const nodesAtDepth = nodesByDepth[depth];
        const totalWidth = (nodesAtDepth.length - 1) * config.horizontalSpacing;
        const startX = componentOffsetX - totalWidth / 2;

        nodesAtDepth.forEach((dep, index) => {
          const node = createGraphNode(
            dep.fileId,
            startX + index * config.horizontalSpacing,
            depth * config.verticalSpacing,
            data,
            nodesInCycles,
            component.index
          );
          nodes.push(node);
        });
      });

    componentOffsetX += maxWidth + config.componentSpacing;
  });

  // Posicionar nós isolados
  if (isolated.length > 0) {
    const isolatedY = -300;
    const isolatedSpacing = config.horizontalSpacing * 0.7;
    const totalIsolatedWidth = (isolated.length - 1) * isolatedSpacing;
    const startIsolatedX = -totalIsolatedWidth / 2;

    isolated.forEach((component, index) => {
      const node = createGraphNode(
        component.nodes[0],
        startIsolatedX + index * isolatedSpacing,
        isolatedY,
        data,
        nodesInCycles,
        component.index
      );
      nodes.push(node);
    });
  }

  return nodes;
}
