import { useEffect, useRef } from 'react';
import { GraphNode, GraphConnection, ConnectedComponent, ViewportState, CanvasConfig } from '@/types';
import { CanvasRenderer } from '@/rendering';
import { CanvasContainer } from './GraphCanvas.styles';

interface GraphCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  nodes: GraphNode[];
  connections: GraphConnection[];
  components: ConnectedComponent[];
  viewport: ViewportState;
  hoveredNodeId: string | null;
  config: CanvasConfig;
  handlers: {
    onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    onMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    onMouseUp: () => void;
    onClick: (e: React.MouseEvent<HTMLCanvasElement>) => void;
    onWheel: (e: React.WheelEvent<HTMLCanvasElement>) => void;
  };
}

export function GraphCanvas({
  canvasRef,
  nodes,
  connections,
  components,
  viewport,
  hoveredNodeId,
  config,
  handlers,
}: GraphCanvasProps) {
  const rendererRef = useRef<CanvasRenderer | null>(null);

  // Inicializar o canvas quando o componente é montado
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const parent = canvas.parentElement;
    if (!parent) return;

    // Redimensionar canvas para preencher o container
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
  }, []); // Executar apenas na montagem

  // Inicializar o renderer
  useEffect(() => {
    if (!canvasRef.current) return;

    if (!rendererRef.current) {
      rendererRef.current = new CanvasRenderer(canvasRef.current, config);
    }
  }, [canvasRef, config]);

  // Renderizar o grafo
  useEffect(() => {
    if (!rendererRef.current) return;

    rendererRef.current.render({
      nodes,
      connections,
      components,
      viewport,
      hoveredNodeId,
    });
  }, [nodes, connections, components, viewport, hoveredNodeId]);

  return (
    <CanvasContainer>
      <canvas
        ref={canvasRef}
        {...handlers}
        style={{ cursor: hoveredNodeId ? 'pointer' : 'grab' }}
      />
    </CanvasContainer>
  );
}
