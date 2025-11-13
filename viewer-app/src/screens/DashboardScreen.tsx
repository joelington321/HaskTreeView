import { useState, useEffect } from 'react';
import { GraphNode, LayoutType } from '../types';
import { useGraphData, useCanvasInteraction } from '../hooks';
import { Sidebar, Legend, Stats } from '../components/atoms';
import { Controls, InfoPanel } from '../components/molecules';
import { UnusedPanel } from '../components/molecules/UnusedPanel/UnusedPanel';
import { GraphCanvas } from '../components/organisms';
import { WelcomeModal } from '../components/organisms/WelcomeModal/WelcomeModal';
import { DEFAULT_CANVAS_CONFIG } from '../constants';
import { ScreenContainer, ContentArea } from './DashboardScreen.styles';

export function DashboardScreen() {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [layoutType, setLayoutType] = useState<LayoutType>('hierarchical');
  const [viewMode, setViewMode] = useState<'tree' | 'unused'>('tree');
  
  const { 
    data,
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

  // Reinicializar canvas quando voltar para a view de árvore
  useEffect(() => {
    if (viewMode === 'tree') {
      // Pequeno delay para garantir que o canvas foi montado
      const timer = setTimeout(() => {
        resetView();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [viewMode, resetView]);

  const handleLayoutChange = (newLayout: LayoutType) => {
    setLayoutType(newLayout);
    changeLayout(newLayout);
  };

  const handleFileSelect = (file: File) => {
    loadFromFile(file);
  };

  const handleRecentFileSelect = (path: string) => {
    loadFromUrl(path);
  };

  // Extrair projectRoot do fileRegistry (sempre em fileRegistry["0"])
  const projectRoot = data?.fileRegistry?.["0"];

  // Extrair dados de unused do JSON carregado
  const unusedStyles = data?.unusedStyles?.map(s => ({
    name: s.name,
    file: data?.fileRegistry?.[s.fileId] || s.fileId,
  })) || [];

  const unusedExports = data?.unusedExports?.map(e => ({
    name: e.name,
    type: e.type,
    file: data?.fileRegistry?.[e.fileId] || e.fileId,
    canBeInternal: e.canBeInternal,
  })) || [];

  console.log('Unused Styles:', unusedStyles);
  console.log('Unused Exports:', unusedExports);
  console.log('Raw data:', data);

  // Mostrar modal de boas-vindas se não houver dados carregados
  if (!data) {
    return (
      <WelcomeModal
        onFileSelect={handleFileSelect}
        onRecentFileSelect={handleRecentFileSelect}
      />
    );
  }

  return (
    <ScreenContainer>
      <Sidebar 
        viewMode={viewMode} 
        setViewMode={setViewMode}
        onFileLoad={loadFromFile}
      />
      <ContentArea>
        {viewMode === 'tree' ? (
          <>
            <Controls
              onReset={resetView}
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
            <InfoPanel node={selectedNode} nodes={nodes} projectRoot={projectRoot} />
            <Stats stats={stats} />
            <Legend />
          </>
        ) : (
          <UnusedPanel 
            unusedStyles={unusedStyles} 
            unusedExports={unusedExports}
            projectRoot={projectRoot}
          />
        )}
      </ContentArea>
    </ScreenContainer>
  );
}
