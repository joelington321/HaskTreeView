import { useState, useCallback } from 'react';
import { DependencyData, GraphNode, GraphConnection, GraphStats, ConnectedComponent, CanvasConfig, LayoutType } from '@/types';
import { detectCycles, getNodesInCycles } from '@/utils/cycleDetection';
import { findConnectedComponents } from '@/utils/componentDetection';
import { 
  calculateHierarchicalLayout, 
  calculateCircularLayout,
  calculateForceDirectedLayout,
  calculateCircularCompleteLayout,
  calculateRadialLayout,
  calculateLayeredLayout
} from '@/utils/layoutAlgorithms';

const DEFAULT_CONFIG: CanvasConfig = {
  nodeRadius: 20,
  nodeColor: '#fff',
  nodeHoverColor: '#0066cc',
  nodeCircularColor: '#ff3333',
  lineColor: '#fff',
  lineCircularColor: '#ff3333',
  lineWidth: 2,
  verticalSpacing: 150,
  horizontalSpacing: 200,
  componentSpacing: 250,
};

export function useGraphData(config: CanvasConfig = DEFAULT_CONFIG, layoutType: LayoutType = 'hierarchical') {
  const [data, setData] = useState<DependencyData | null>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [connections, setConnections] = useState<GraphConnection[]>([]);
  const [stats, setStats] = useState<GraphStats>({
    projectName: '-',
    totalFiles: 0,
    totalConnections: 0,
    disconnectedTrees: 0,
    cyclesDetected: 0,
    analyzedAt: '-',
  });
  const [components, setComponents] = useState<ConnectedComponent[]>([]);
  const [currentLayout, setCurrentLayout] = useState<LayoutType>(layoutType);

  const processData = useCallback(
    (newData: DependencyData, layout: LayoutType = currentLayout) => {
      setData(newData);

      // Detectar ciclos
      const cycles = detectCycles(newData);
      const nodesInCycles = getNodesInCycles(cycles);

      // Detectar componentes conectados
      const connectedComponents = findConnectedComponents(newData);

      // Calcular layout com base no tipo selecionado
      let graphNodes: GraphNode[];
      
      // Se todos os nós estão em um ciclo, usar layout circular
      if (nodesInCycles.size === newData.dependencies.length && cycles.length > 0 && layout === 'circular') {
        graphNodes = calculateCircularLayout(newData, cycles[0].nodes);
      } else {
        // Selecionar algoritmo de layout
        switch (layout) {
          case 'force-directed':
            graphNodes = calculateForceDirectedLayout(newData, connectedComponents, nodesInCycles, config);
            break;
          case 'circular':
            graphNodes = calculateCircularCompleteLayout(newData, connectedComponents, nodesInCycles, config);
            break;
          case 'radial':
            graphNodes = calculateRadialLayout(newData, connectedComponents, nodesInCycles, config);
            break;
          case 'layered':
            graphNodes = calculateLayeredLayout(newData, connectedComponents, nodesInCycles, config);
            break;
          case 'hierarchical':
          default:
            graphNodes = calculateHierarchicalLayout(newData, connectedComponents, nodesInCycles, config);
            break;
        }
      }

      // Criar conexões
      const graphConnections: GraphConnection[] = [];
      const processedPairs = new Set<string>();

      newData.dependencies.forEach((dep) => {
        dep.imports.forEach((importId) => {
          const from = graphNodes.find((n) => n.id === dep.fileId);
          const to = graphNodes.find((n) => n.id === importId);
          if (from && to) {
            // Verificar se é bidirecional
            const reverseExists = newData.dependencies.find(
              (d) => d.fileId === importId && d.imports.includes(dep.fileId)
            );

            const isBidirectional = reverseExists !== undefined;
            const pairKey = [dep.fileId, importId].sort().join('-');

            // Se é bidirecional e já foi processado, pular
            if (isBidirectional && processedPairs.has(pairKey)) {
              return;
            }

            // Verificar se ambos os nós estão em um ciclo
            const isCircular = from.isCircular && to.isCircular;

            graphConnections.push({
              from,
              to,
              isBidirectional,
              isCircular,
            });

            if (isBidirectional) {
              processedPairs.add(pairKey);
            }
          }
        });
      });

      setNodes(graphNodes);
      setConnections(graphConnections);
      setComponents(connectedComponents);
      setStats({
        projectName: newData.projectName,
        totalFiles: newData.dependencies.length,
        totalConnections: graphConnections.length,
        disconnectedTrees: connectedComponents.length,
        cyclesDetected: cycles.length,
        analyzedAt: newData.analyzedAt,
      });
    },
    [config, currentLayout]
  );

  const changeLayout = useCallback(
    (newLayout: LayoutType) => {
      setCurrentLayout(newLayout);
      if (data) {
        processData(data, newLayout);
      }
    },
    [data, processData]
  );

  const loadFromFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const jsonData = JSON.parse(event.target?.result as string);
          processData(jsonData);
        } catch (error) {
          console.error('Erro ao carregar JSON:', error);
          alert('Erro ao carregar JSON: ' + (error as Error).message);
        }
      };
      reader.readAsText(file);
    },
    [processData]
  );

  const loadFromUrl = useCallback(
    async (url: string) => {
      try {
        const response = await fetch(url);
        const jsonData = await response.json();
        processData(jsonData);
      } catch (error) {
        console.error('Erro ao carregar JSON:', error);
        alert('Erro ao carregar JSON: ' + (error as Error).message);
      }
    },
    [processData]
  );

  return {
    data,
    nodes,
    connections,
    stats,
    components,
    currentLayout,
    loadFromFile,
    loadFromUrl,
    changeLayout,
  };
}
