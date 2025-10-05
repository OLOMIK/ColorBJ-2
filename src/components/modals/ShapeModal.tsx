import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';
import { getTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface ShapeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddShape: (type: ShapeType, color: string, size: number) => void;
}

export type ShapeType = 'rectangle' | 'circle' | 'triangle' | 'star' | 'arrow';

const shapes: { type: ShapeType; label: keyof typeof import('@/lib/i18n').translations.en }[] = [
  { type: 'rectangle', label: 'rectangle' },
  { type: 'circle', label: 'circle' },
  { type: 'triangle', label: 'triangle' },
  { type: 'star', label: 'star' },
  { type: 'arrow', label: 'arrow' },
];

export function ShapeModal({ open, onOpenChange, onAddShape }: ShapeModalProps) {
  const { settings } = useApp();
  const [selectedShape, setSelectedShape] = useState<ShapeType>('rectangle');
  const [color, setColor] = useState('#000000');
  const [size, setSize] = useState(100);
  
  const t = (key: keyof typeof import('@/lib/i18n').translations.en) => 
    getTranslation(settings.language, key);

  const handleApply = () => {
    onAddShape(selectedShape, color, size);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('insertShape')}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Select Shape</Label>
            <div className="grid grid-cols-5 gap-2">
              {shapes.map(shape => (
                <button
                  key={shape.type}
                  onClick={() => setSelectedShape(shape.type)}
                  className={cn(
                    'aspect-square p-4 border-2 rounded-lg transition-all flex items-center justify-center',
                    selectedShape === shape.type
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <ShapePreview type={shape.type} />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('pickColor')}</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-10 cursor-pointer w-16"
                />
                <Input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Size</Label>
              <Input
                type="number"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                min={20}
                max={500}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('cancel')}
          </Button>
          <Button onClick={handleApply}>
            {t('clickToPlace')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ShapePreview({ type }: { type: ShapeType }) {
  const size = 32;
  const color = 'currentColor';

  switch (type) {
    case 'rectangle':
      return <div className="w-8 h-8 border-2 border-current" />;
    case 'circle':
      return <div className="w-8 h-8 border-2 border-current rounded-full" />;
    case 'triangle':
      return <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-b-[28px] border-b-current" />;
    case 'star':
      return <span className="text-2xl">★</span>;
    case 'arrow':
      return <span className="text-2xl">→</span>;
  }
}
