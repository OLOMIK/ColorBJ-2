import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useApp } from '@/contexts/AppContext';
import { getTranslation } from '@/lib/i18n';

interface ResizeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResize: (width: number, height: number) => void;
}

export function ResizeModal({ open, onOpenChange, onResize }: ResizeModalProps) {
  const { canvasWidth, canvasHeight, settings } = useApp();
  const [width, setWidth] = useState(canvasWidth);
  const [height, setHeight] = useState(canvasHeight);
  const [maintainRatio, setMaintainRatio] = useState(true);
  
  const t = (key: keyof typeof import('@/lib/i18n').translations.en) => 
    getTranslation(settings.language, key);

  const aspectRatio = canvasWidth / canvasHeight;

  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth);
    if (maintainRatio) {
      setHeight(Math.round(newWidth / aspectRatio));
    }
  };

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight);
    if (maintainRatio) {
      setWidth(Math.round(newHeight * aspectRatio));
    }
  };

  const handleApply = () => {
    onResize(width, height);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('resizeImage')}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('width')}</Label>
              <Input
                type="number"
                value={width}
                onChange={(e) => handleWidthChange(Number(e.target.value))}
                min={100}
                max={4000}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('height')}</Label>
              <Input
                type="number"
                value={height}
                onChange={(e) => handleHeightChange(Number(e.target.value))}
                min={100}
                max={4000}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="maintainRatio"
              checked={maintainRatio}
              onCheckedChange={(checked) => setMaintainRatio(checked as boolean)}
            />
            <label
              htmlFor="maintainRatio"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t('maintainAspectRatio')}
            </label>
          </div>

          <div className="text-sm text-muted-foreground">
            Current: {canvasWidth} × {canvasHeight}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('cancel')}
          </Button>
          <Button onClick={handleApply}>
            {t('apply')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
