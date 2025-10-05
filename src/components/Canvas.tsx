import { useRef, useEffect, useState, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { drawShape } from '@/lib/shapes';

type CanvasProps = {
  /** Called when the visible composite canvas is mounted or resized. */
  onCompositeReady?: (canvas: HTMLCanvasElement | null) => void;
};

export function Canvas({ onCompositeReady }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const compositeCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null);
  const [selection, setSelection] = useState<{
    start: { x: number; y: number };
    end: { x: number; y: number };
    imageData?: ImageData;
  } | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isDraggingSelection, setIsDraggingSelection] = useState(false);
  const [copiedImageData, setCopiedImageData] = useState<ImageData | null>(null);

  const {
    canvasWidth,
    canvasHeight,
    backgroundColor,
    layers,
    activeLayerId,
    activeTool,
    brushColor,
    brushSize,
    settings,
    updateLayerCanvas,
    pendingAction,
    setPendingAction,
    setBrushColor,
  } = useApp();

  const activeLayer = layers.find(l => l.id === activeLayerId);

  // Let parent know about the composite canvas
  useEffect(() => {
    if (onCompositeReady) onCompositeReady(compositeCanvasRef.current);
    return () => {
      if (onCompositeReady) onCompositeReady(null);
    };
  }, [onCompositeReady, canvasWidth, canvasHeight]);

  // Composite all layers
  useEffect(() => {
    const compositeCanvas = compositeCanvasRef.current;
    if (!compositeCanvas) return;

    const ctx = compositeCanvas.getContext('2d');
    if (!ctx) return;

    // Clear composite
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw all visible layers in order
    [...layers]
      .sort((a, b) => a.order - b.order)
      .filter(layer => layer.visible)
      .forEach(layer => {
        ctx.globalAlpha = layer.opacity;
        ctx.drawImage(layer.canvas, 0, 0);
      });

    ctx.globalAlpha = 1;
  }, [layers, backgroundColor, canvasWidth, canvasHeight]);

  const getMousePos = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number) => {
    if (!lastPos) {
      setLastPos({ x, y });
      return;
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize;

    if (activeTool === 'brush') {
      ctx.strokeStyle = brushColor;
      ctx.globalCompositeOperation = 'source-over';
    } else if (activeTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
    }

    if (settings.lineSmoothing) {
      ctx.beginPath();
      ctx.moveTo(lastPos.x, lastPos.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      ctx.fillStyle = brushColor;
      ctx.fillRect(x - brushSize / 2, y - brushSize / 2, brushSize, brushSize);
    }

    setLastPos({ x, y });
  }, [activeTool, brushColor, brushSize, lastPos, settings.lineSmoothing]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool !== 'brush' && activeTool !== 'eraser') return;
    if (!activeLayer) return;

    const pos = getMousePos(e);
    if (!pos) return;

    setIsDrawing(true);
    setLastPos(pos);

    // Draw a dot at the starting position
    const ctx = activeLayer.canvas.getContext('2d');
    if (ctx) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = brushSize;

      if (activeTool === 'brush') {
        ctx.strokeStyle = brushColor;
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = brushColor;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (activeTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, [activeTool, activeLayer, brushColor, brushSize, getMousePos]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !activeLayer) return;
    if (activeTool !== 'brush' && activeTool !== 'eraser') return;

    const pos = getMousePos(e);
    if (!pos) return;

    const ctx = activeLayer.canvas.getContext('2d');
    if (ctx) {
      draw(ctx, pos.x, pos.y);
      updateLayerCanvas(activeLayer.id, activeLayer.canvas);
    }
  }, [isDrawing, activeLayer, activeTool, draw, getMousePos, updateLayerCanvas]);

  const handleMouseUp = useCallback(() => {
    setIsDrawing(false);
    setLastPos(null);
  }, []);

  const handleEyedropper = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool !== 'eyedropper') return;

    const compositeCanvas = compositeCanvasRef.current;
    if (!compositeCanvas) return;

    const pos = getMousePos(e);
    if (!pos) return;

    const ctx = compositeCanvas.getContext('2d');
    if (!ctx) return;

    const pixel = ctx.getImageData(pos.x, pos.y, 1, 1).data;
    const color = `#${[pixel[0], pixel[1], pixel[2]]
      .map(x => x.toString(16).padStart(2, '0'))
      .join('')}`;

    setBrushColor(color);
  }, [activeTool, getMousePos, setBrushColor]);

  // Handle pending actions (text, shapes)
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!pendingAction || !activeLayer) return;

    const pos = getMousePos(e);
    if (!pos) return;

    const ctx = activeLayer.canvas.getContext('2d');
    if (!ctx) return;

    if (pendingAction.type === 'text' && pendingAction.data.text) {
      ctx.font = `${pendingAction.data.size}px ${pendingAction.data.font}`;
      ctx.fillStyle = pendingAction.data.color || '#000000';
      ctx.fillText(pendingAction.data.text, pos.x, pos.y);
      updateLayerCanvas(activeLayer.id, activeLayer.canvas);
      setPendingAction(null);
    } else if (pendingAction.type === 'shape') {
      drawShape(
        ctx,
        pendingAction.data.shapeType || 'rectangle',
        pos.x,
        pos.y,
        pendingAction.data.shapeSize || 100,
        pendingAction.data.shapeColor || '#000000'
      );
      updateLayerCanvas(activeLayer.id, activeLayer.canvas);
      setPendingAction(null);
    }
  }, [pendingAction, activeLayer, getMousePos, updateLayerCanvas, setPendingAction]);

  // Selection tool handlers
  const handleSelectionStart = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool !== 'select' || !activeLayer) return;

    const pos = getMousePos(e);
    if (!pos) return;

    // Check if clicking inside existing selection
    if (selection) {
      const { start, end } = selection;
      const minX = Math.min(start.x, end.x);
      const maxX = Math.max(start.x, end.x);
      const minY = Math.min(start.y, end.y);
      const maxY = Math.max(start.y, end.y);

    if (pos.x >= minX && pos.x <= maxX && pos.y >= minY && pos.y <= maxY) {
        setIsDraggingSelection(true);
        setLastPos(pos);
        return;
      }
    }

    setIsSelecting(true);
    setSelection({ start: pos, end: pos });
  }, [activeTool, activeLayer, selection, getMousePos]);

  const handleSelectionMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!activeLayer) return;
    const pos = getMousePos(e);
    if (!pos) return;

    if (isSelecting && selection) {
      setSelection({ ...selection, end: pos });
    } else if (isDraggingSelection && selection && lastPos) {
      const dx = pos.x - lastPos.x;
      const dy = pos.y - lastPos.y;

      setSelection({
        start: { x: selection.start.x + dx, y: selection.start.y + dy },
        end: { x: selection.end.x + dx, y: selection.end.y + dy },
        imageData: selection.imageData,
      });
      setLastPos(pos);
    }
  }, [isSelecting, isDraggingSelection, selection, lastPos, activeLayer, getMousePos]);

  const handleSelectionEnd = useCallback(() => {
    if (isSelecting && selection && activeLayer) {
      // Capture the selected area
      const ctx = activeLayer.canvas.getContext('2d');
      if (ctx) {
        const minX = Math.min(selection.start.x, selection.end.x);
        const maxX = Math.max(selection.start.x, selection.end.x);
        const minY = Math.min(selection.start.y, selection.end.y);
        const maxY = Math.max(selection.start.y, selection.end.y);
        const width = maxX - minX;
        const height = maxY - minY;

        if (width > 0 && height > 0) {
          const imageData = ctx.getImageData(minX, minY, width, height);
          setSelection({ ...selection, imageData });
        }
      }
    }
    setIsSelecting(false);
    setIsDraggingSelection(false);
    setLastPos(null);
  }, [isSelecting, selection, activeLayer]);

  // Keyboard handlers for copy/paste
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeLayer || activeTool !== 'select') return;

      const ctx = activeLayer.canvas.getContext('2d');
      if (!ctx) return;

      // Copy: Ctrl/Cmd + C
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selection?.imageData) {
        setCopiedImageData(selection.imageData);
        e.preventDefault();
      }

      // Paste: Ctrl/Cmd + V
      if ((e.ctrlKey || e.metaKey) && e.key === 'v' && copiedImageData) {
        const minX = Math.min(selection?.start.x || 50, selection?.end.x || 50);
        const minY = Math.min(selection?.start.y || 50, selection?.end.y || 50);
        ctx.putImageData(copiedImageData, minX + 20, minY + 20);
        updateLayerCanvas(activeLayer.id, activeLayer.canvas);
        e.preventDefault();
      }

      // Delete: Delete/Backspace
      if ((e.key === 'Delete' || e.key === 'Backspace') && selection) {
        const minX = Math.min(selection.start.x, selection.end.x);
        const maxX = Math.max(selection.start.x, selection.end.x);
        const minY = Math.min(selection.start.y, selection.end.y);
        const maxY = Math.max(selection.start.y, selection.end.y);
        ctx.clearRect(minX, minY, maxX - minX, maxY - minY);
        updateLayerCanvas(activeLayer.id, activeLayer.canvas);
        setSelection(null);
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLayer, activeTool, selection, copiedImageData, updateLayerCanvas]);

  // Draw selection rectangle on composite canvas
  useEffect(() => {
    const compositeCanvas = compositeCanvasRef.current;
    if (!compositeCanvas || !selection || activeTool !== 'select') return;

    const ctx = compositeCanvas.getContext('2d');
    if (!ctx) return;

    // Redraw composite
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    [...layers]
      .sort((a, b) => a.order - b.order)
      .filter(layer => layer.visible)
      .forEach(layer => {
        ctx.globalAlpha = layer.opacity;
        ctx.drawImage(layer.canvas, 0, 0);
      });
    ctx.globalAlpha = 1;

    // Draw selection rectangle
    const minX = Math.min(selection.start.x, selection.end.x);
    const maxX = Math.max(selection.start.x, selection.end.x);
    const minY = Math.min(selection.start.y, selection.end.y);
    const maxY = Math.max(selection.start.y, selection.end.y);

    ctx.strokeStyle = '#10b9cc';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
    ctx.setLineDash([]);
  }, [selection, activeTool, layers, backgroundColor, canvasWidth, canvasHeight]);

  return (
    <div className="flex-1 flex items-center justify-center bg-canvas-bg overflow-auto p-8">
      <div className="relative shadow-2xl">
        {/* Composite canvas - visible */}
        <canvas
          ref={compositeCanvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className="border border-border rounded-lg bg-white"
          style={{ 
            maxWidth: '100%', 
            height: 'auto',
            cursor: activeTool === 'eyedropper' ? 'crosshair' : 
                   (activeTool === 'brush' || activeTool === 'eraser') ? 'crosshair' : 'default'
          }}
        />
        
        {/* Drawing canvas - invisible overlay */}
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          onMouseDown={(e) => {
            if (activeTool === 'select') {
              handleSelectionStart(e);
            } else {
              handleMouseDown(e);
            }
          }}
          onMouseMove={(e) => {
            if (activeTool === 'select') {
              handleSelectionMove(e);
            } else {
              handleMouseMove(e);
            }
          }}
          onMouseUp={() => {
            if (activeTool === 'select') {
              handleSelectionEnd();
            } else {
              handleMouseUp();
            }
          }}
          onMouseLeave={() => {
            if (activeTool === 'select') {
              handleSelectionEnd();
            } else {
              handleMouseUp();
            }
          }}
          onClick={(e) => {
            if (activeTool === 'eyedropper') {
              handleEyedropper(e);
            } else if (pendingAction) {
              handleCanvasClick(e);
            }
          }}
          className="absolute top-0 left-0 opacity-0"
          style={{ 
            maxWidth: '100%',
            height: 'auto',
            pointerEvents: 'auto',
            cursor: pendingAction ? 'crosshair' : 
                   activeTool === 'select' ? 'default' :
                   activeTool === 'eyedropper' ? 'crosshair' : 
                   (activeTool === 'brush' || activeTool === 'eraser') ? 'crosshair' : 'default'
          }}
        />
      </div>
    </div>
  );
}
