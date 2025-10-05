import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useApp } from '@/contexts/AppContext';
import { getTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { settings, updateSettings } = useApp();
  
  const t = (key: keyof typeof import('@/lib/i18n').translations.en) => 
    getTranslation(settings.language, key);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('settings')}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('lineSmoothing')}</Label>
              <p className="text-sm text-muted-foreground">
                Enable smooth brush strokes
              </p>
            </div>
            <Switch
              checked={settings.lineSmoothing}
              onCheckedChange={(checked) => 
                updateSettings({ lineSmoothing: checked })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>{t('language')}</Label>
            <div className="flex gap-2">
              <Button
                variant={settings.language === 'en' ? 'default' : 'outline'}
                onClick={() => updateSettings({ language: 'en' })}
                className="flex-1"
              >
                English
              </Button>
              <Button
                variant={settings.language === 'pl' ? 'default' : 'outline'}
                onClick={() => updateSettings({ language: 'pl' })}
                className="flex-1"
              >
                Polski
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
