import { 
  Brush, 
  Eraser, 
  Palette, 
  Trash2, 
  PaintBucket, 
  Type, 
  Shapes, 
  Sliders, 
  Maximize2, 
  Scissors, 
  Droplet,
  Layers,
  Sparkles,
  Pipette,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp, Tool } from '@/contexts/AppContext';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { getTranslation } from '@/lib/i18n';

interface ToolbarProps {
  onClearAll: () => void;
  onSetBoardColor: () => void;
  onInsertText: () => void;
  onInsertShape: () => void;
  onAdjustColors: () => void;
  onResize: () => void;
  onRemoveBackground: () => void;
  onInsertGradient: () => void;
  onToggleLayers: () => void;
  onGenerateImage: () => void;
}

export function Toolbar({
  onClearAll,
  onSetBoardColor,
  onInsertText,
  onInsertShape,
  onAdjustColors,
  onResize,
  onRemoveBackground,
  onInsertGradient,
  onToggleLayers,
  onGenerateImage,
}: ToolbarProps) {
  const { activeTool, setActiveTool, settings } = useApp();
  const t = (key: keyof typeof import('@/lib/i18n').translations.en) => 
    getTranslation(settings.language, key);

  const tools: { id: Tool; icon: React.ReactNode; label: keyof typeof import('@/lib/i18n').translations.en }[] = [
    { id: 'select', icon: <Sliders size={20} className="rotate-90" />, label: 'select' as const },
    { id: 'brush', icon: <Brush size={20} />, label: 'brush' },
    { id: 'eraser', icon: <Eraser size={20} />, label: 'eraser' },
    { id: 'colorPicker', icon: <Palette size={20} />, label: 'pickColor' },
  ];

  type ActionType = {
    icon: React.ReactNode;
    label: keyof typeof import('@/lib/i18n').translations.en;
    onClick: () => void;
  };

  const actions: ActionType[] = [
    { icon: <Trash2 size={20} />, label: 'clearAll', onClick: onClearAll },
    { icon: <PaintBucket size={20} />, label: 'boardColor', onClick: onSetBoardColor },
    { icon: <Type size={20} />, label: 'insertText', onClick: onInsertText },
    { icon: <Shapes size={20} />, label: 'insertShape', onClick: onInsertShape },
    { icon: <Sliders size={20} />, label: 'adjustColors', onClick: onAdjustColors },
    { icon: <Maximize2 size={20} />, label: 'resizeImage', onClick: onResize },
    { icon: <Scissors size={20} />, label: 'removeBackground', onClick: onRemoveBackground },
    { icon: <Droplet size={20} />, label: 'insertGradient', onClick: onInsertGradient },
    { icon: <Layers size={20} />, label: 'layersPanel', onClick: onToggleLayers },
    { icon: <Sparkles size={20} />, label: 'generateImage', onClick: onGenerateImage },
  ];

  const eyedropperAction = { 
    id: 'eyedropper' as Tool, 
    icon: <Pipette size={20} />, 
    label: 'eyedropper' as keyof typeof import('@/lib/i18n').translations.en
  };

  return (
    <TooltipProvider>
      <div className="w-16 bg-toolbar border-r border-border flex flex-col items-center py-4 gap-2">
        {tools.map((tool) => (
          <Tooltip key={tool.id}>
            <TooltipTrigger asChild>
              <Button
                variant={activeTool === tool.id ? 'toolbarActive' : 'toolbar'}
                size="icon"
                onClick={() => setActiveTool(tool.id)}
                className={cn(
                  'w-12 h-12 rounded-lg',
                  activeTool === tool.id && 'shadow-lg'
                )}
              >
                {tool.icon}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{t(tool.label)}</p>
            </TooltipContent>
          </Tooltip>
        ))}

        <div className="w-10 h-px bg-border my-2" />

        {actions.map((action, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <Button
                variant="toolbar"
                size="icon"
                onClick={action.onClick}
                className="w-12 h-12 rounded-lg"
              >
                {action.icon}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{t(action.label)}</p>
            </TooltipContent>
          </Tooltip>
        ))}

        <div className="w-10 h-px bg-border my-2" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeTool === eyedropperAction.id ? 'toolbarActive' : 'toolbar'}
              size="icon"
              onClick={() => setActiveTool(eyedropperAction.id)}
              className={cn(
                'w-12 h-12 rounded-lg',
                activeTool === eyedropperAction.id && 'shadow-lg'
              )}
            >
              {eyedropperAction.icon}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{t(eyedropperAction.label)}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
