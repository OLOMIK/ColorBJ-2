import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';
import { getTranslation } from '@/lib/i18n';

interface GradientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (color1: string, color2: string) => void;
}

export function GradientModal({ open, onOpenChange, onApply }: GradientModalProps) {
  const { settings } = useApp();
  const [color1, setColor1] = useState('#10b9cc');
  const [color2, setColor2] = useState('#8b5cf6');
  
  const t = (key: keyof typeof import('@/lib/i18n').translations.en) => 
    getTranslation(settings.language, key);

  const handleApply = () => {
    onApply(color1, color2);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('insertGradient')}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t('color1')}</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={color1}
                onChange={(e) => setColor1(e.target.value)}
                className="h-12 cursor-pointer w-20"
              />
              <Input
                type="text"
                value={color1}
                onChange={(e) => setColor1(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('color2')}</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={color2}
                onChange={(e) => setColor2(e.target.value)}
                className="h-12 cursor-pointer w-20"
              />
              <Input
                type="text"
                value={color2}
                onChange={(e) => setColor2(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          <div className="h-32 rounded-lg border border-border" style={{
            background: `linear-gradient(135deg, ${color1}, ${color2})`
          }} />
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
