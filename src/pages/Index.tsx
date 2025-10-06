import { useState, useRef, useEffect, useCallback } from 'react';
import { AppProvider } from '@/contexts/AppContext';
import { useApp } from '@/contexts/AppContext';
import { StartScreen } from '@/components/StartScreen';
import { TopNav } from '@/components/TopNav';
import { Toolbar } from '@/components/Toolbar';
import { Canvas } from '@/components/Canvas';
import { LayersPanel } from '@/components/LayersPanel';
import { ControlPanel } from '@/components/ControlPanel';
import { BoardColorModal } from '@/components/modals/BoardColorModal';
import { TextModal } from '@/components/modals/TextModal';
import { ShapeModal, ShapeType } from '@/components/modals/ShapeModal';
import { ColorAdjustModal } from '@/components/modals/ColorAdjustModal';
import { ResizeModal } from '@/components/modals/ResizeModal';
import { GradientModal } from '@/components/modals/GradientModal';
import { InfoModal } from '@/components/modals/InfoModal';
import { SettingsModal } from '@/components/modals/SettingsModal';
import { toast } from 'sonner';
import { getTranslation } from '@/lib/i18n';
import { adjustColors } from '@/lib/colorAdjust';

function PaintApp() {
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [layersPanelOpen, setLayersPanelOpen] = useState(true);
  const [boardColorOpen, setBoardColorOpen] = useState(false);
  const [textModalOpen, setTextModalOpen] = useState(false);
  const [shapeModalOpen, setShapeModalOpen] = useState(false);
  const [colorAdjustOpen, setColorAdjustOpen] = useState(false);
  const [resizeModalOpen, setResizeModalOpen] = useState(false);
  const [gradientModalOpen, setGradientModalOpen] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    addLayer,
    settings,
    layers,
    activeLayerId,
    updateLayerCanvas,
    setPendingAction,
    setCanvasSize,
    backgroundColor,
    canvasWidth,
    canvasHeight,
  } = useApp();

  const t = (key: keyof typeof import('@/lib/i18n').translations.en) =>
    getTranslation(settings.language, key);

  const handleCreateNew = () => {
    setShowStartScreen(false);
    if (layers.length === 0) {
      addLayer();
      toast.success(t('canvasReady'));
    }
  };

  const handleOpenFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
      addLayer();
      const activeLayer = layers.find((l) => l.id === activeLayerId);
      if (!activeLayer) return;

      const ctx = activeLayer.canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        updateLayerCanvas(activeLayer.id, activeLayer.canvas);
      }

      setShowStartScreen(false);
      toast.success(t('fileOpened'));
    };
    img.src = URL.createObjectURL(file);
  };

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type);
            const img = new Image();
            img.onload = () => {
              addLayer();
              const activeLayer = layers.find((l) => l.id === activeLayerId);
              if (!activeLayer) return;

              const ctx = activeLayer.canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, 0, 0);
                updateLayerCanvas(activeLayer.id, activeLayer.canvas);
              }

              setShowStartScreen(false);
              toast.success(t('imagePasted'));
            };
            img.src = URL.createObjectURL(blob);
            return;
          }
        }
      }
      toast.error('No image found in clipboard');
    } catch (err) {
      toast.error('Failed to read clipboard');
    }
  };
  document.body.style.userSelect = "none";
  const handleClearAll = () => {
    if (confirm(t('confirmClear'))) {
      const activeLayer = layers.find((l) => l.id === activeLayerId);
      if (!activeLayer) return;

      const ctx = activeLayer.canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, activeLayer.canvas.width, activeLayer.canvas.height);
        updateLayerCanvas(activeLayer.id, activeLayer.canvas);
      }
      toast.success(t('canvasCleared'));
    }
  };

  const handleAddText = (text: string, font: string, size: number, color: string) => {
    setPendingAction({
      type: 'text',
      data: { text, font, size, color },
    });
    toast.info(t('clickToPlace'));
  };

  const handleAddShape = (type: ShapeType, color: string, size: number) => {
    setPendingAction({
      type: 'shape',
      data: { shapeType: type, shapeColor: color, shapeSize: size },
    });
    toast.info(t('clickToPlace'));
  };

  const handleColorAdjust = (red: number, green: number, blue: number, gamma: number) => {
    const activeLayer = layers.find((l) => l.id === activeLayerId);
    if (!activeLayer) return;

    adjustColors(activeLayer.canvas, red, green, blue, gamma);
    updateLayerCanvas(activeLayer.id, activeLayer.canvas);
    toast.success('Colors adjusted!');
  };

  const handleResize = (width: number, height: number) => {
    setCanvasSize(width, height);

    // Resize wszystkich warstw
    layers.forEach((layer) => {
      const newCanvas = document.createElement('canvas');
      newCanvas.width = width;
      newCanvas.height = height;
      const ctx = newCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(layer.canvas, 0, 0, width, height);
        updateLayerCanvas(layer.id, newCanvas);
      }
    });

    toast.success('Canvas resized!');
  };

  const handleGradient = (color1: string, color2: string) => {
    const activeLayer = layers.find((l) => l.id === activeLayerId);
    if (!activeLayer) return;

    const ctx = activeLayer.canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, activeLayer.canvas.width, activeLayer.canvas.height);
      gradient.addColorStop(0, color1);
      gradient.addColorStop(1, color2);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, activeLayer.canvas.width, activeLayer.canvas.height);
      updateLayerCanvas(activeLayer.id, activeLayer.canvas);
    }

    toast.success('Gradient applied!');
  };
  const exportPNG = useCallback(() => {
    try {
      const tmp = document.createElement('canvas');
      tmp.width = canvasWidth;
      tmp.height = canvasHeight;
      const ctx = tmp.getContext('2d');
      if (!ctx) {
        toast.error('Canvas context not available.');
        return;
      }

      // tło
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // warstwy
      [...layers]
        .sort((a, b) => a.order - b.order)
        .filter((layer) => layer.visible)
        .forEach((layer) => {
          ctx.globalAlpha = layer.opacity;
          ctx.drawImage(layer.canvas, 0, 0);
        });

      ctx.globalAlpha = 1;

      const dataUrl = tmp.toDataURL('image/png');
      const link = document.createElement('a');
      const date = new Date().toISOString().slice(0, 10);
      link.href = dataUrl;
      link.download = `colorbj-${date}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('Exported to PNG ✅');
    } catch (e) {
      console.error(e);
      toast.error('Export failed.');
    }
  }, [backgroundColor, canvasWidth, canvasHeight, layers]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        exportPNG();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [exportPNG]);

  if (showStartScreen) {
    return (
      <>
        <StartScreen
          onOpenFile={handleOpenFile}
          onCreateNew={handleCreateNew}
          onPasteFromClipboard={handlePasteFromClipboard}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelected}
        />
      </>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <TopNav
        onFileMenuClick={() => {
          toast('File menu');
        }}
        onInfoMenuClick={() => setInfoModalOpen(true)}
        onSettingsClick={() => setSettingsModalOpen(true)}
        onExportClick={exportPNG}
      />

      <div className="flex-1 flex overflow-hidden">
        <Toolbar
          onClearAll={handleClearAll}
          onSetBoardColor={() => setBoardColorOpen(true)}
          onInsertText={() => setTextModalOpen(true)}
          onInsertShape={() => setShapeModalOpen(true)}
          onAdjustColors={() => setColorAdjustOpen(true)}
          onResize={() => setResizeModalOpen(true)}
          onRemoveBackground={() => toast('Remove BG - Coming soon!')}
          onInsertGradient={() => setGradientModalOpen(true)}
          onToggleLayers={() => setLayersPanelOpen(!layersPanelOpen)}
          onGenerateImage={() => toast('Generate - Coming soon!')}
          // opcjonalnie: mały przycisk do eksportu w Toolbarze (jeśli chcesz)
          // onExportPNG={exportPNG}
        />

        <div className="flex-1 relative">
          <Canvas />
          <ControlPanel />

        </div>

        <LayersPanel isOpen={layersPanelOpen} />
      </div>

      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelected}
      />

      <BoardColorModal open={boardColorOpen} onOpenChange={setBoardColorOpen} />
      <TextModal open={textModalOpen} onOpenChange={setTextModalOpen} onAddText={handleAddText} />
      <ShapeModal open={shapeModalOpen} onOpenChange={setShapeModalOpen} onAddShape={handleAddShape} />
      <ColorAdjustModal open={colorAdjustOpen} onOpenChange={setColorAdjustOpen} onApply={handleColorAdjust} />
      <ResizeModal open={resizeModalOpen} onOpenChange={setResizeModalOpen} onResize={handleResize} />
      <GradientModal open={gradientModalOpen} onOpenChange={setGradientModalOpen} onApply={handleGradient} />
      <InfoModal open={infoModalOpen} onOpenChange={setInfoModalOpen} />
      <SettingsModal open={settingsModalOpen} onOpenChange={setSettingsModalOpen} />
    </div>
  );
}

const Index = () => {
  return (
    <AppProvider>
      <PaintApp />
    </AppProvider>
  );
};

export default Index;
