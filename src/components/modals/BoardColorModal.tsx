import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';
import { getTranslation } from '@/lib/i18n';

interface BoardColorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BoardColorModal({ open, onOpenChange }: BoardColorModalProps) {
  const { backgroundColor, setBackgroundColor, settings } = useApp();
  const [color, setColor] = useState(backgroundColor);
  
  const t = (key: keyof typeof import('@/lib/i18n').translations.en) => 
    getTranslation(settings.language, key);

  const handleApply = () => {
    setBackgroundColor(color);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('boardColor')}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t('pickColor')}</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-12 cursor-pointer"
              />
              <Input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-1"
              />
            </div>
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
