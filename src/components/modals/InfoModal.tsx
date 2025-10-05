import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { getTranslation } from '@/lib/i18n';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink } from 'lucide-react';

interface InfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InfoModal({ open, onOpenChange }: InfoModalProps) {
  const { settings } = useApp();
  
  const t = (key: keyof typeof import('@/lib/i18n').translations.en) => 
    getTranslation(settings.language, key);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('info')}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="about" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="whatsNew">{t('whatsNew')}</TabsTrigger>
            <TabsTrigger value="faq">{t('faq')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="about" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">ColorBJ 14.0</h3>
              <p className="text-sm text-muted-foreground">
                A fast, browser-based paint editor for simple drawing, text, shapes, layers, and image editing.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Authors</h4>
              <p className="text-sm text-muted-foreground">
                Created by the ColorBJ Team
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Community</h4>
              <Button variant="outline" asChild className="w-full">
                <a href="https://discord.gg/yPeEpfUceD" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Join our Discord
                </a>
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="whatsNew" className="space-y-3">
            <div className="space-y-2">
              <h4 className="font-medium">Version 14.0</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Added selection tool for moving and copying objects</li>
                <li>New shape insertion tools (rectangle, circle, star, arrow, triangle)</li>
                <li>Text tool with custom fonts and sizes</li>
                <li>Color adjustment controls (RGB + Gamma)</li>
                <li>Gradient fill tool</li>
                <li>Canvas resizing with aspect ratio lock</li>
                <li>Improved layer management</li>
                <li>Bilingual support (English/Polish)</li>
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="faq" className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">How do I add a new layer?</h4>
              <p className="text-sm text-muted-foreground">
                Click the Layers icon in the toolbar, then click the + button in the layers panel.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">How do I move objects?</h4>
              <p className="text-sm text-muted-foreground">
                Use the selection tool (first icon in toolbar), click and drag to select an area, then drag to move it.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Can I undo changes?</h4>
              <p className="text-sm text-muted-foreground">
                Undo/redo functionality is coming in a future update. For now, use layers to organize your work.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">What image formats can I export?</h4>
              <p className="text-sm text-muted-foreground">
                You can export your work as PNG, JPG, or WebP formats.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
