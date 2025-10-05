import { Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import { getTranslation } from '@/lib/i18n';
import { toast } from 'sonner';

interface LayersPanelProps {
  isOpen: boolean;
}

export function LayersPanel({ isOpen }: LayersPanelProps) {
  const { 
    layers, 
    activeLayerId, 
    setActiveLayer, 
    toggleLayerVisibility, 
    addLayer,
    deleteLayer,
    settings,
  } = useApp();

  const t = (key: keyof typeof import('@/lib/i18n').translations.en) => 
    getTranslation(settings.language, key);

  const handleAddLayer = () => {
    addLayer();
    toast.success(t('layerAdded'));
  };

  const handleDeleteLayer = (id: string) => {
    if (layers.length === 1) {
      toast.error('Cannot delete the last layer');
      return;
    }
    deleteLayer(id);
    toast.success(t('layerDeleted'));
  };

  if (!isOpen) return null;

  return (
    <div className="w-64 bg-card border-l border-border flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold">{t('layers')}</h2>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleAddLayer}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {[...layers].reverse().map((layer) => (
          <div
            key={layer.id}
            className={cn(
              'p-3 rounded-lg border transition-all cursor-pointer',
              activeLayerId === layer.id
                ? 'border-primary bg-primary/10'
                : 'border-border bg-muted/50 hover:bg-muted'
            )}
            onClick={() => setActiveLayer(layer.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLayerVisibility(layer.id);
                  }}
                  className="hover:text-primary transition-colors"
                >
                  {layer.visible ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4 opacity-50" />
                  )}
                </button>
                <span className="text-sm font-medium truncate">
                  {layer.name}
                </span>
              </div>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteLayer(layer.id);
                }}
                className="h-6 w-6 p-0"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>

            <div className="mt-2 h-12 bg-background rounded border border-border overflow-hidden">
              <canvas
                width={layer.canvas.width}
                height={layer.canvas.height}
                className="w-full h-full object-contain"
                ref={(ref) => {
                  if (ref) {
                    const ctx = ref.getContext('2d');
                    if (ctx) {
                      ctx.drawImage(
                        layer.canvas,
                        0,
                        0,
                        ref.width,
                        ref.height
                      );
                    }
                  }
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
