import { useState } from 'react';
import { GraphNode, CanvasConfig } from './types';
import { useGraphData } from './hooks/useGraphData';
import { useCanvasInteraction } from './hooks/useCanvasInteraction';
import { Header } from './components/Header';
import { Controls } from './components/Controls';
import { GraphCanvas } from './components/GraphCanvas';
import { InfoPanel } from './components/InfoPanel';
import { Stats } from './components/Stats';
import { Legend } from './components/Legend';
import './App.css';

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

function App() {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const { nodes, connections, stats, components, loadFromFile, loadFromUrl } =
    useGraphData(DEFAULT_CONFIG);

  const { canvasRef, viewport, nodesWithHover, hoveredNodeId, resetView, handlers } =
    useCanvasInteraction({
      nodes,
      onNodeClick: setSelectedNode,
    });

  const handleLoadExample = () => {
    loadFromUrl('../output/test-complex.json');
  };

  return (
    <div className="app">
      <Header />
      <Controls
        onFileLoad={loadFromFile}
        onReset={resetView}
        onLoadExample={handleLoadExample}
      />
      <GraphCanvas
        canvasRef={canvasRef}
        nodes={nodesWithHover}
        connections={connections}
        components={components}
        viewport={viewport}
        hoveredNodeId={hoveredNodeId}
        config={DEFAULT_CONFIG}
        handlers={handlers}
      />
      <InfoPanel node={selectedNode} nodes={nodes} />
      <Stats stats={stats} />
      <Legend />
    </div>
  );
}

export default App;
