import { useState } from 'react';
import { GraphNode, LayoutType } from './types';
import { useGraphData, useCanvasInteraction } from './hooks';
import { Header } from './components/Header';
import { Controls } from './components/Controls';
import { GraphCanvas } from './components/GraphCanvas';
import { InfoPanel } from './components/InfoPanel';
import { Stats } from './components/Stats';
import { Legend } from './components/Legend';
import { GlobalStyles } from './styles/GlobalStyles';
import { AppContainer } from './App.styles';
import { DEFAULT_CANVAS_CONFIG } from './constants';

function App() {
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
    <>
      <GlobalStyles />
      <AppContainer>
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
      </AppContainer>
    </>
  );
}

export default App;
