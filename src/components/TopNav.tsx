import { User } from 'lucide-react';
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
}

export function TopNav({ onFileMenuClick, onInfoMenuClick, onSettingsClick }: TopNavProps) {
  const { settings } = useApp();
  const t = (key: keyof typeof import('@/lib/i18n').translations.en) => 
    getTranslation(settings.language, key);

  return (
    <nav className="h-14 border-b border-border bg-card flex items-center justify-between px-4">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary">✏️ {t('appName')} {t('version')}</span>
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
              <DropdownMenuItem onClick={onFileMenuClick}>
                {t('open')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onFileMenuClick}>
                {t('save')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onFileMenuClick}>
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
      
      <Button variant="ghost" size="sm">
        <User className="mr-2 h-4 w-4" />
        {t('login')}
      </Button>
    </nav>
  );
}
