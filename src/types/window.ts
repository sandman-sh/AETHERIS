export type WindowId = 'veritas' | 'cascade' | 'basis' | 'parity' | 'ghost' | 'telemetry';

export type LayoutPreset = 'grid' | 'split' | 'cascade' | 'focus';

export interface TerminalWindow {
  id: WindowId;
  title: string;
  badge: string;
  iconName: string;
  x: number;
  y: number;
  width: number;
  height: number;
  prevX?: number;
  prevY?: number;
  prevWidth?: number;
  prevHeight?: number;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  isOpen: boolean;
  lastTickTime?: string;
  heartbeatCount: number;
}
