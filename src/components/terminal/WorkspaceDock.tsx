import React from 'react';
import {
  ShieldCheck,
  Flame,
  Percent,
  ArrowRightLeft,
  Radar,
  Terminal,
  Grid,
  Columns,
  Layers,
  RotateCcw,
  Plus
} from 'lucide-react';
import { useWindowManager } from '../../context/WindowManagerContext';
import { WindowId, LayoutPreset } from '../../types/window';

const ICONS: Record<string, React.ElementType> = {
  ShieldCheck,
  Flame,
  Percent,
  ArrowRightLeft,
  Radar,
  Terminal
};

export const WorkspaceDock: React.FC = () => {
  const {
    windows,
    activeWindowId,
    bringToFront,
    restoreWindow,
    openWindow,
    applyPreset,
    resetWorkspace
  } = useWindowManager();

  const handleWindowClick = (id: WindowId) => {
    const win = windows[id];
    if (!win.isOpen) {
      openWindow(id);
    } else if (win.isMinimized) {
      restoreWindow(id);
    } else {
      bringToFront(id);
    }
  };

  const windowList = Object.values(windows);

  return (
    <footer className="h-13 bg-white/95 dark:bg-[#0c0c16]/95 border-t border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between z-30 shrink-0 backdrop-blur-md">
      {/* Left: Window Taskbar Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto py-1">
        {windowList.map((win) => {
          const Icon = ICONS[win.iconName] || Terminal;
          const isActive = activeWindowId === win.id && !win.isMinimized && win.isOpen;
          const isMin = win.isMinimized && win.isOpen;
          const isClosed = !win.isOpen;

          return (
            <button
              key={win.id}
              onClick={() => handleWindowClick(win.id)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 border ${
                isActive
                  ? 'bg-purple-600 text-white border-purple-500 shadow-sm shadow-purple-600/20'
                  : isMin
                  ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                  : isClosed
                  ? 'bg-slate-100/50 dark:bg-slate-900/50 text-slate-400 border-dashed border-slate-300 dark:border-slate-800 hover:text-slate-600'
                  : 'bg-white dark:bg-[#141424] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{win.title}</span>
              {isMin && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Minimized in dock" />
              )}
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Right: Layout Preset Selectors & Reset */}
      <div className="hidden sm:flex items-center space-x-1.5 pl-4 border-l border-slate-200 dark:border-slate-800 shrink-0">
        <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Presets:</span>
        <button
          onClick={() => applyPreset('grid')}
          className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer"
          title="2x2 Tiled Grid"
        >
          <Grid className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => applyPreset('split')}
          className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer"
          title="Split View (Veritas & Cascade)"
        >
          <Columns className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => applyPreset('cascade')}
          className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer"
          title="Cascade Floating Windows"
        >
          <Layers className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={resetWorkspace}
          className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer ml-1"
          title="Reset Workspace Layout"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </footer>
  );
};
