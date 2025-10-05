import { FileUp, Plus, Clipboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getTranslation } from '@/lib/i18n';
import { useApp } from '@/contexts/AppContext';

interface StartScreenProps {
  onOpenFile: () => void;
  onCreateNew: () => void;
  onPasteFromClipboard: () => void;
}

export function StartScreen({ onOpenFile, onCreateNew, onPasteFromClipboard }: StartScreenProps) {
  const { settings } = useApp();
  const t = (key: keyof typeof import('@/lib/i18n').translations.en) => 
    getTranslation(settings.language, key);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-8 p-8">
        <div>
          <h1 className="text-6xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            {t('appName')}
          </h1>
          <p className="text-xl text-muted-foreground">{t('welcome')}</p>
        </div>
        
        <div className="flex flex-col gap-4 min-w-[300px]">
          <Button
            size="lg"
            onClick={onOpenFile}
            className="h-16 text-lg"
          >
            <FileUp className="mr-2 h-5 w-5" />
            {t('openFile')}
          </Button>
          
          <Button
            size="lg"
            variant="secondary"
            onClick={onCreateNew}
            className="h-16 text-lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            {t('createNewProject')}
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            onClick={onPasteFromClipboard}
            className="h-16 text-lg"
          >
            <Clipboard className="mr-2 h-5 w-5" />
            {t('pasteFromClipboard')}
          </Button>
        </div>
      </div>
    </div>
  );
}
