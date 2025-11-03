import { DependencyData, GraphNode, ConnectedComponent, CanvasConfig } from '@/types';
import { createGraphNode, getComponentDependencies } from './nodeHelpers';

/**
 * Layout em Camadas (Sugiyama): DAG hierárquico otimizado
 */
export function calculateLayeredLayout(
  data: DependencyData,
  components: ConnectedComponent[],
  nodesInCycles: Set<string>,
  config: CanvasConfig
): GraphNode[] {
  const nodes: GraphNode[] = [];
  let componentOffsetX = 0;

  components.forEach(component => {
    const componentDeps = getComponentDependencies(data, component);
    const layers = calculateTopologicalLayers(componentDeps, component);
    const maxWidth = Math.max(...layers.map(l => l.length));
    const componentWidth = maxWidth * config.horizontalSpacing;

    // Posicionar nós por camada
    layers.forEach((layer, layerIndex) => {
      const layerWidth = (layer.length - 1) * config.horizontalSpacing;
      const startX = componentOffsetX - layerWidth / 2;

      layer.forEach((nodeId, index) => {
        const node = createGraphNode(
          nodeId,
          startX + index * config.horizontalSpacing,
          layerIndex * config.verticalSpacing,
          data,
          nodesInCycles,
          component.index
        );
        nodes.push(node);
      });
    });

    componentOffsetX += componentWidth + config.componentSpacing;
  });

  return nodes;
}

/**
 * Calcula camadas usando ordenação topológica
 */
function calculateTopologicalLayers(
  componentDeps: ReturnType<typeof getComponentDependencies>,
  component: ConnectedComponent
): string[][] {
  const inDegree = new Map<string, number>();
  const layers: string[][] = [];
  
  // Calcular grau de entrada
  componentDeps.forEach(dep => {
    const degree = dep.importedBy.filter(id => 
      component.nodes.includes(id)
    ).length;
    inDegree.set(dep.fileId, degree);
  });

  // Processar camadas
  while (inDegree.size > 0) {
    const layer = Array.from(inDegree.entries())
      .filter(([_, degree]) => degree === 0)
      .map(([id]) => id);

    if (layer.length === 0) {
      // Ciclo detectado, pegar nós restantes
      layer.push(...Array.from(inDegree.keys()));
    }

    layers.push(layer);
    
    // Remover nós da camada e atualizar graus
    layer.forEach(id => {
      inDegree.delete(id);
      const dep = componentDeps.find(d => d.fileId === id)!;
      dep.imports.forEach(importId => {
        if (inDegree.has(importId)) {
          inDegree.set(importId, inDegree.get(importId)! - 1);
        }
      });
    });
  }

  return layers;
}
