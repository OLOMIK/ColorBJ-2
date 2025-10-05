import { useState, useRef } from 'react';
import { AppProvider, useApp } from '@/contexts/AppContext';
import { StartScreen } from '@/components/StartScreen';
import { TopNav } from '@/components/TopNav';
import { Toolbar } from '@/components/Toolbar';
import { Canvas } from '@/components/Canvas';
import { LayersPanel } from '@/components/LayersPanel';
import { ControlPanel } from '@/components/ControlPanel';
import { toast } from 'sonner';
import { getTranslation } from '@/lib/i18n';

function PaintApp() {
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [layersPanelOpen, setLayersPanelOpen] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addLayer, settings, layers, activeLayerId, updateLayerCanvas } = useApp();

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
      const activeLayer = layers.find(l => l.id === activeLayerId);
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
              const activeLayer = layers.find(l => l.id === activeLayerId);
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

  const handleClearAll = () => {
    if (confirm(t('confirmClear'))) {
      const activeLayer = layers.find(l => l.id === activeLayerId);
      if (!activeLayer) return;

      const ctx = activeLayer.canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, activeLayer.canvas.width, activeLayer.canvas.height);
        updateLayerCanvas(activeLayer.id, activeLayer.canvas);
      }
      toast.success(t('canvasCleared'));
    }
  };

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
        onFileMenuClick={() => toast('File menu - Coming soon!')}
        onInfoMenuClick={() => toast('Info - Coming soon!')}
        onSettingsClick={() => toast('Settings - Coming soon!')}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <Toolbar
          onClearAll={handleClearAll}
          onSetBoardColor={() => toast('Board color - Coming soon!')}
          onInsertText={() => toast('Text tool - Coming soon!')}
          onInsertShape={() => toast('Shape tool - Coming soon!')}
          onAdjustColors={() => toast('Color adjust - Coming soon!')}
          onResize={() => toast('Resize - Coming soon!')}
          onRemoveBackground={() => toast('Remove BG - Coming soon!')}
          onInsertGradient={() => toast('Gradient - Coming soon!')}
          onToggleLayers={() => setLayersPanelOpen(!layersPanelOpen)}
          onGenerateImage={() => toast('Generate - Coming soon!')}
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
