import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Language } from '@/lib/i18n';

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  order: number;
  canvas: HTMLCanvasElement;
  opacity: number;
}

export type Tool = 
  | 'select' 
  | 'brush' 
  | 'eraser' 
  | 'colorPicker' 
  | 'text' 
  | 'shape' 
  | 'eyedropper';

export interface AppSettings {
  lineSmoothing: boolean;
  language: Language;
}

interface AppContextType {
  // Canvas state
  canvasWidth: number;
  canvasHeight: number;
  backgroundColor: string;
  setCanvasSize: (width: number, height: number) => void;
  setBackgroundColor: (color: string) => void;
  
  // Layers
  layers: Layer[];
  activeLayerId: string | null;
  addLayer: () => void;
  deleteLayer: (id: string) => void;
  setActiveLayer: (id: string) => void;
  toggleLayerVisibility: (id: string) => void;
  reorderLayers: (startIndex: number, endIndex: number) => void;
  updateLayerCanvas: (id: string, canvas: HTMLCanvasElement) => void;
  
  // Tools
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
  brushColor: string;
  setBrushColor: (color: string) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  
  // Settings
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  
  // Project
  projectName: string;
  setProjectName: (name: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [canvasWidth, setWidth] = useState(1400);
  const [canvasHeight, setHeight] = useState(1100);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [layers, setLayers] = useState<Layer[]>([]);
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<Tool>('brush');
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [projectName, setProjectName] = useState('Untitled');
  const [settings, setSettings] = useState<AppSettings>({
    lineSmoothing: true,
    language: 'en',
  });

  const setCanvasSize = useCallback((width: number, height: number) => {
    setWidth(width);
    setHeight(height);
  }, []);

  const addLayer = useCallback(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    const newLayer: Layer = {
      id: `layer-${Date.now()}`,
      name: `Layer ${layers.length + 1}`,
      visible: true,
      order: layers.length,
      canvas,
      opacity: 1,
    };
    
    setLayers(prev => [...prev, newLayer]);
    setActiveLayerId(newLayer.id);
  }, [canvasWidth, canvasHeight, layers.length]);

  const deleteLayer = useCallback((id: string) => {
    setLayers(prev => prev.filter(l => l.id !== id));
    if (activeLayerId === id) {
      setActiveLayerId(layers[0]?.id || null);
    }
  }, [activeLayerId, layers]);

  const setActiveLayer = useCallback((id: string) => {
    setActiveLayerId(id);
  }, []);

  const toggleLayerVisibility = useCallback((id: string) => {
    setLayers(prev =>
      prev.map(layer =>
        layer.id === id ? { ...layer, visible: !layer.visible } : layer
      )
    );
  }, []);

  const reorderLayers = useCallback((startIndex: number, endIndex: number) => {
    setLayers(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result.map((layer, index) => ({ ...layer, order: index }));
    });
  }, []);

  const updateLayerCanvas = useCallback((id: string, canvas: HTMLCanvasElement) => {
    setLayers(prev =>
      prev.map(layer =>
        layer.id === id ? { ...layer, canvas } : layer
      )
    );
  }, []);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    // Persist to localStorage
    localStorage.setItem('colorbjSettings', JSON.stringify({ ...settings, ...newSettings }));
  }, [settings]);

  // Initialize from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem('colorbjSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(parsed);
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
  }, []);

  const value: AppContextType = {
    canvasWidth,
    canvasHeight,
    backgroundColor,
    setCanvasSize,
    setBackgroundColor,
    layers,
    activeLayerId,
    addLayer,
    deleteLayer,
    setActiveLayer,
    toggleLayerVisibility,
    reorderLayers,
    updateLayerCanvas,
    activeTool,
    setActiveTool,
    brushColor,
    setBrushColor,
    brushSize,
    setBrushSize,
    settings,
    updateSettings,
    projectName,
    setProjectName,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
