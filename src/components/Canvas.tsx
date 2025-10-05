import { useRef, useEffect, useState, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';

export function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const compositeCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null);

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
  } = useApp();

  const activeLayer = layers.find(l => l.id === activeLayerId);

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

  const { setBrushColor } = useApp();

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
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={handleEyedropper}
          className="absolute top-0 left-0 opacity-0"
          style={{ 
            maxWidth: '100%',
            height: 'auto',
            pointerEvents: activeTool === 'select' ? 'none' : 'auto'
          }}
        />
      </div>
    </div>
  );
}
