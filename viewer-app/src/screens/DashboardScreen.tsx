import { useState } from 'react';
import { GraphNode, LayoutType } from '../types';
import { useGraphData, useCanvasInteraction } from '../hooks';
import { Header, Legend, Stats } from '../components/atoms';
import { Controls, InfoPanel } from '../components/molecules';
import { GraphCanvas } from '../components/organisms';
import { DEFAULT_CANVAS_CONFIG } from '../constants';
import { ScreenContainer } from './DashboardScreen.styles';

export function DashboardScreen() {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [layoutType, setLayoutType] = useState<LayoutType>('hierarchical');
  
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

  return (
    <ScreenContainer>
      <Header />
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
    </ScreenContainer>
  );
}
