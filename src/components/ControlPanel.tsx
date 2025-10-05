import { useApp } from '@/contexts/AppContext';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { getTranslation } from '@/lib/i18n';

export function ControlPanel() {
  const { 
    brushSize, 
    setBrushSize, 
    brushColor, 
    setBrushColor,
    activeTool,
    settings,
  } = useApp();

  const t = (key: keyof typeof import('@/lib/i18n').translations.en) => 
    getTranslation(settings.language, key);

  if (activeTool !== 'brush' && activeTool !== 'eraser') return null;

  return (
    <div className="absolute top-20 left-20 bg-card border border-border rounded-lg p-4 shadow-lg space-y-4 w-64">
      <div className="space-y-2">
        <Label>{t('penSize')}</Label>
        <Slider
          value={[brushSize]}
          onValueChange={(value) => setBrushSize(value[0])}
          min={1}
          max={50}
          step={1}
        />
        <div className="text-sm text-muted-foreground text-center">{brushSize}px</div>
      </div>

      {activeTool === 'brush' && (
        <div className="space-y-2">
          <Label>{t('pickColor')}</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={brushColor}
              onChange={(e) => setBrushColor(e.target.value)}
              className="h-10 cursor-pointer"
            />
            <Input
              type="text"
              value={brushColor}
              onChange={(e) => setBrushColor(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>
      )}
    </div>
  );
}
