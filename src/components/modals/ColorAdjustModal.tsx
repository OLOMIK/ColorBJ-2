import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useApp } from '@/contexts/AppContext';
import { getTranslation } from '@/lib/i18n';

interface ColorAdjustModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (red: number, green: number, blue: number, gamma: number) => void;
}

export function ColorAdjustModal({ open, onOpenChange, onApply }: ColorAdjustModalProps) {
  const { settings } = useApp();
  const [red, setRed] = useState(0);
  const [green, setGreen] = useState(0);
  const [blue, setBlue] = useState(0);
  const [gamma, setGamma] = useState(1);
  
  const t = (key: keyof typeof import('@/lib/i18n').translations.en) => 
    getTranslation(settings.language, key);

  const handleApply = () => {
    onApply(red, green, blue, gamma);
    onOpenChange(false);
  };

  const handleReset = () => {
    setRed(0);
    setGreen(0);
    setBlue(0);
    setGamma(1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('adjustColors')}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t('red')}</Label>
              <span className="text-sm text-muted-foreground">{red > 0 ? '+' : ''}{red}</span>
            </div>
            <Slider
              value={[red]}
              onValueChange={(value) => setRed(value[0])}
              min={-100}
              max={100}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t('green')}</Label>
              <span className="text-sm text-muted-foreground">{green > 0 ? '+' : ''}{green}</span>
            </div>
            <Slider
              value={[green]}
              onValueChange={(value) => setGreen(value[0])}
              min={-100}
              max={100}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t('blue')}</Label>
              <span className="text-sm text-muted-foreground">{blue > 0 ? '+' : ''}{blue}</span>
            </div>
            <Slider
              value={[blue]}
              onValueChange={(value) => setBlue(value[0])}
              min={-100}
              max={100}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t('gamma')}</Label>
              <span className="text-sm text-muted-foreground">{gamma.toFixed(2)}</span>
            </div>
            <Slider
              value={[gamma]}
              onValueChange={(value) => setGamma(value[0])}
              min={0.1}
              max={3}
              step={0.1}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
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
