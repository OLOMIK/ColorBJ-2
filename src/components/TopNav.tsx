import { User, Brush } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getTranslation } from '@/lib/i18n';
import { useApp } from '@/contexts/AppContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TopNavProps {
  onFileMenuClick: () => void;
  onInfoMenuClick: () => void;
  onSettingsClick: () => void;
  onExportClick: () => void;
}

export function TopNav({ onFileMenuClick, onInfoMenuClick, onSettingsClick, onExportClick}: TopNavProps) {
  const { settings } = useApp();
  const t = (key: keyof typeof import('@/lib/i18n').translations.en) => 
    getTranslation(settings.language, key);

  return (
    <nav className="h-14 border-b border-border bg-card flex items-center justify-between px-4">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold grid grid-cols-[auto_2fr]"><Brush /> {t('appName')}</span>
        </div>
        
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                {t('file')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={onFileMenuClick}>
                {t('newFile')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log('todo')}>
                {t('open')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onFileMenuClick}>
                {t('save')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExportClick}>
                {t('export')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="sm" onClick={onInfoMenuClick}>
            {t('info')}
          </Button>
          
          <Button variant="ghost" size="sm" onClick={onSettingsClick}>
            {t('settings')}
          </Button>
        </div>
      </div>
      
    </nav>
  );
}
