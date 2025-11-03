import { useState, useCallback, useRef, useEffect } from 'react';
import { GraphNode, ViewportState } from '@/types';

interface UseCanvasInteractionProps {
  nodes: GraphNode[];
  onNodeClick?: (node: GraphNode) => void;
}

export function useCanvasInteraction({ nodes, onNodeClick }: UseCanvasInteractionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [viewport, setViewport] = useState<ViewportState>({
    offsetX: 0,
    offsetY: 0,
    scale: 1,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Atualizar nós com estado de hover
  const nodesWithHover = nodes.map((node) => ({
    ...node,
    hover: node.id === hoveredNodeId,
  }));

  // Inicializar canvas com centralização
  const initCanvas = useCallback(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const parent = canvas.parentElement;
    if (!parent) return;

    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;

    if (nodes.length > 0) {
      const minX = Math.min(...nodes.map((n) => n.x));
      const maxX = Math.max(...nodes.map((n) => n.x));
      const centerX = (minX + maxX) / 2;
      
      setViewport({
        offsetX: canvas.width / 2 - centerX,
        offsetY: 100,
        scale: 1,
      });
    } else {
      setViewport({
        offsetX: canvas.width / 2,
        offsetY: 100,
        scale: 1,
      });
    }
  }, [nodes]);

  // Resetar visualização
  const resetView = useCallback(() => {
    initCanvas();
  }, [initCanvas]);

  // Converter coordenadas do mouse para coordenadas do canvas
  const getCanvasCoordinates = useCallback(
    (clientX: number, clientY: number) => {
      if (!canvasRef.current) return { x: 0, y: 0 };

      const rect = canvasRef.current.getBoundingClientRect();
      return {
        x: (clientX - rect.left - viewport.offsetX) / viewport.scale,
        y: (clientY - rect.top - viewport.offsetY) / viewport.scale,
      };
    },
    [viewport]
  );

  // Detectar nó sob o mouse
  const findNodeAtPosition = useCallback(
    (x: number, y: number, nodeRadius: number = 20): GraphNode | null => {
      for (const node of nodes) {
        const dist = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
        if (dist < nodeRadius) {
          return node;
        }
      }
      return null;
    },
    [nodes]
  );

  // Handlers de mouse
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setLastPosition({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvasCoords = getCanvasCoordinates(e.clientX, e.clientY);

      if (isDragging) {
        const deltaX = e.clientX - lastPosition.x;
        const deltaY = e.clientY - lastPosition.y;
        
        setViewport((prev: ViewportState) => ({
          ...prev,
          offsetX: prev.offsetX + deltaX,
          offsetY: prev.offsetY + deltaY,
        }));
        
        setLastPosition({ x: e.clientX, y: e.clientY });
      } else {
        // Detectar hover
        const node = findNodeAtPosition(canvasCoords.x, canvasCoords.y);
        setHoveredNodeId(node?.id || null);
      }
    },
    [isDragging, lastPosition, getCanvasCoordinates, findNodeAtPosition]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvasCoords = getCanvasCoordinates(e.clientX, e.clientY);
      const node = findNodeAtPosition(canvasCoords.x, canvasCoords.y);
      
      if (node && onNodeClick) {
        onNodeClick(node);
      }
    },
    [getCanvasCoordinates, findNodeAtPosition, onNodeClick]
  );

  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    
    setViewport((prev: ViewportState) => {
      const newScale = Math.max(0.1, Math.min(prev.scale * delta, 3));
      
      // Calcular a posição do mouse no espaço do canvas (antes do zoom)
      const mouseCanvasX = (mouseX - prev.offsetX) / prev.scale;
      const mouseCanvasY = (mouseY - prev.offsetY) / prev.scale;
      
      // Calcular novos offsets para manter o mouse na mesma posição do canvas
      const newOffsetX = mouseX - mouseCanvasX * newScale;
      const newOffsetY = mouseY - mouseCanvasY * newScale;
      
      return {
        scale: newScale,
        offsetX: newOffsetX,
        offsetY: newOffsetY,
      };
    });
  }, []);

  // Redimensionar canvas ao mudar o tamanho da janela
  useEffect(() => {
    const handleResize = () => {
      initCanvas();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initCanvas]);

  // Inicializar canvas quando os nós mudarem
  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  return {
    canvasRef,
    viewport,
    nodesWithHover,
    hoveredNodeId,
    isDragging,
    resetView,
    handlers: {
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onClick: handleClick,
      onWheel: handleWheel,
    },
  };
}
