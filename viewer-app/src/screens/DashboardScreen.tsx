import { useState } from 'react';
import { GraphNode, LayoutType } from '../types';
import { useGraphData, useCanvasInteraction } from '../hooks';
import { Header, Legend, Stats } from '../components/atoms';
import { Controls, InfoPanel } from '../components/molecules';
import { UnusedPanel } from '../components/molecules/UnusedPanel/UnusedPanel';
import { GraphCanvas } from '../components/organisms';
import { DEFAULT_CANVAS_CONFIG } from '../constants';
import { ScreenContainer } from './DashboardScreen.styles';

export function DashboardScreen() {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [layoutType, setLayoutType] = useState<LayoutType>('hierarchical');
  const [viewMode, setViewMode] = useState<'tree' | 'unused'>('tree');
  
  const { 
    nodes, 
    connections, 
    stats, 
    components, 
    currentLayout,
    loadFromFile, 
    loadFromUrl,
    changeLayout 
  } = useGraphData(DEFAULT_CANVAS_CONFIG, layoutType);

  const { canvasRef, viewport, nodesWithHover, hoveredNodeId, resetView, handlers } =
    useCanvasInteraction({
      nodes,
      onNodeClick: setSelectedNode,
    });

  const handleLoadExample = () => {
    loadFromUrl('../output/test-complex.json');
  };

  const handleLayoutChange = (newLayout: LayoutType) => {
    setLayoutType(newLayout);
    changeLayout(newLayout);
  };

  // MOCK: Substitua por dados reais do JSON
  const unusedStyles = [
    { name: 'LegendTest', file: 'Legend.styles.ts' },
    { name: 'Logo', file: 'Header.styles.ts' },
    { name: 'NavBar', file: 'Header.styles.ts' },
  ];
  const unusedExports = [
    { name: 'FileDependency', type: 'InterfaceExport', file: 'index.ts', canBeInternal: true },
    { name: 'NodeDrawOptions', type: 'InterfaceExport', file: 'NodeDrawer.ts', canBeInternal: true },
    { name: 'LayoutConfig', type: 'InterfaceExport', file: 'index.ts', canBeInternal: false },
  ];

  return (
    <ScreenContainer>
      <Header viewMode={viewMode} setViewMode={setViewMode} />
      {viewMode === 'tree' ? (
        <>
          <Controls
            onFileLoad={loadFromFile}
            onReset={resetView}
            onLoadExample={handleLoadExample}
            currentLayout={currentLayout}
            onLayoutChange={handleLayoutChange}
          />
          <GraphCanvas
            canvasRef={canvasRef}
            nodes={nodesWithHover}
            connections={connections}
            components={components}
            viewport={viewport}
            hoveredNodeId={hoveredNodeId}
            config={DEFAULT_CANVAS_CONFIG}
            handlers={handlers}
          />
          <InfoPanel node={selectedNode} nodes={nodes} />
          <Stats stats={stats} />
          <Legend />
        </>
      ) : (
        <UnusedPanel unusedStyles={unusedStyles} unusedExports={unusedExports} />
      )}
    </ScreenContainer>
  );
}
