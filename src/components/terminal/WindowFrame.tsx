import React, { useRef, useState } from 'react';
import {
  Minus,
  Square,
  Copy,
  X,
  ShieldCheck,
  Flame,
  Percent,
  ArrowRightLeft,
  Radar,
  Terminal,
  Activity,
  GripHorizontal
} from 'lucide-react';
import { useWindowManager } from '../../context/WindowManagerContext';
import { WindowId } from '../../types/window';

interface WindowFrameProps {
  id: WindowId;
  children: React.ReactNode;
}

const ICONS: Record<string, React.ElementType> = {
  ShieldCheck,
  Flame,
  Percent,
  ArrowRightLeft,
  Radar,
  Terminal
};

export const WindowFrame: React.FC<WindowFrameProps> = ({ id, children }) => {
  const {
    windows,
    activeWindowId,
    bringToFront,
    minimizeWindow,
    maximizeWindow,
    closeWindow,
    updatePosition,
    updateSize
  } = useWindowManager();

  const win = windows[id];
  const isFocused = activeWindowId === id;
  const Icon = ICONS[win.iconName] || Activity;

  // Dragging state
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Resizing state
  const resizeRef = useRef<{ startX: number; startY: number; initialW: number; initialH: number } | null>(null);
  const [isResizing, setIsResizing] = useState(false);

  if (!win.isOpen || win.isMinimized) {
    return null;
  }

  // Handle header pointer drag
  const handlePointerDownHeader = (e: React.PointerEvent) => {
    if (win.isMaximized) return; // Don't drag while maximized
    bringToFront(id);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: win.x,
      initialY: win.y
    };
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMoveHeader = (e: React.PointerEvent) => {
    if (!dragRef.current || !isDragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    updatePosition(id, dragRef.current.initialX + dx, dragRef.current.initialY + dy);
  };

  const handlePointerUpHeader = (e: React.PointerEvent) => {
    dragRef.current = null;
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (err) {}
  };

  // Handle bottom-right corner resize
  const handlePointerDownCorner = (e: React.PointerEvent) => {
    e.stopPropagation();
    bringToFront(id);
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialW: win.width,
      initialH: win.height
    };
    setIsResizing(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMoveCorner = (e: React.PointerEvent) => {
    if (!resizeRef.current || !isResizing) return;
    const dw = e.clientX - resizeRef.current.startX;
    const dh = e.clientY - resizeRef.current.startY;
    updateSize(id, resizeRef.current.initialW + dw, resizeRef.current.initialH + dh);
  };

  const handlePointerUpCorner = (e: React.PointerEvent) => {
    resizeRef.current = null;
    setIsResizing(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (err) {}
  };

  // Style attributes based on maximized vs floating
  const containerStyle: React.CSSProperties = win.isMaximized
    ? {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        zIndex: win.zIndex
      }
    : {
        position: 'absolute',
        left: `${win.x}px`,
        top: `${win.y}px`,
        width: `${win.width}px`,
        height: `${win.height}px`,
        zIndex: win.zIndex
      };

  return (
    <div
      style={containerStyle}
      onMouseDown={() => bringToFront(id)}
      className={`flex flex-col rounded-xl overflow-hidden border transition-shadow duration-150 bg-white dark:bg-[#11111f] select-none ${
        isFocused
          ? 'border-purple-500/80 dark:border-purple-500 shadow-xl shadow-purple-900/10 dark:shadow-purple-950/40 ring-1 ring-purple-500/30'
          : 'border-slate-200 dark:border-slate-800 shadow-md hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      {/* Institutional Window Title Bar */}
      <div
        onPointerDown={handlePointerDownHeader}
        onPointerMove={handlePointerMoveHeader}
        onPointerUp={handlePointerUpHeader}
        className={`px-3 py-2 border-b flex items-center justify-between cursor-move shrink-0 ${
          isFocused
            ? 'bg-purple-50/90 dark:bg-[#18182e] border-purple-200 dark:border-purple-800/80 text-purple-950 dark:text-purple-100'
            : 'bg-slate-100/80 dark:bg-[#141424] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
        }`}
      >
        {/* Left: Window Icon, Title, and Live Environment Pill */}
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="p-1 rounded bg-purple-600 text-white shrink-0">
            <Icon className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-xs truncate">{win.title}</span>
          <span className="hidden sm:inline bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-semibold px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
            {win.badge}
          </span>
          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>LIVE #{win.heartbeatCount}</span>
          </span>
        </div>

        {/* Right: Window Controls (Minimize, Maximize/Restore, Close) */}
        <div className="flex items-center space-x-1 shrink-0 ml-2" onPointerDown={(e) => e.stopPropagation()}>
          {/* Minimize */}
          <button
            onClick={() => minimizeWindow(id)}
            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
            title="Minimize to dock"
            aria-label="Minimize window"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          {/* Maximize / Restore */}
          <button
            onClick={() => maximizeWindow(id)}
            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
            title={win.isMaximized ? 'Restore floating window' : 'Maximize window'}
            aria-label="Maximize or restore window"
          >
            {win.isMaximized ? <Copy className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
          </button>

          {/* Close */}
          <button
            onClick={() => closeWindow(id)}
            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
            title="Close window"
            aria-label="Close window"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Window Body (Scrollable and Interactive) */}
      <div className="flex-1 overflow-y-auto p-4 select-text">
        {children}
      </div>

      {/* Resize Handle (Bottom-Right Corner) - disabled in maximized state */}
      {!win.isMaximized && (
        <div
          onPointerDown={handlePointerDownCorner}
          onPointerMove={handlePointerMoveCorner}
          onPointerUp={handlePointerUpCorner}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-end justify-end p-0.5 text-slate-400 hover:text-purple-600 transition"
          title="Drag to resize window"
        >
          <svg className="w-2.5 h-2.5 opacity-60" viewBox="0 0 10 10">
            <line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" strokeWidth="1.5" />
            <line x1="9" y1="5" x2="5" y2="9" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>
      )}
    </div>
  );
};
