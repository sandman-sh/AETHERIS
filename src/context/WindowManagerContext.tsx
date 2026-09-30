import React, { createContext, useContext, useState, useEffect } from 'react';
import { TerminalWindow, WindowId, LayoutPreset } from '../types/window';

interface WindowManagerContextType {
  windows: Record<WindowId, TerminalWindow>;
  activeWindowId: WindowId | null;
  bringToFront: (id: WindowId) => void;
  minimizeWindow: (id: WindowId) => void;
  maximizeWindow: (id: WindowId) => void;
  restoreWindow: (id: WindowId) => void;
  closeWindow: (id: WindowId) => void;
  openWindow: (id: WindowId) => void;
  updatePosition: (id: WindowId, x: number, y: number) => void;
  updateSize: (id: WindowId, width: number, height: number) => void;
  applyPreset: (preset: LayoutPreset) => void;
  resetWorkspace: () => void;
}

const WindowManagerContext = createContext<WindowManagerContextType | null>(null);

const DEFAULT_WINDOWS: Record<WindowId, TerminalWindow> = {
  veritas: {
    id: 'veritas',
    title: 'VeritasRWA',
    badge: 'Solvency & Slippage',
    iconName: 'ShieldCheck',
    x: 20,
    y: 20,
    width: 760,
    height: 580,
    zIndex: 10,
    isMinimized: false,
    isMaximized: false,
    isOpen: true,
    heartbeatCount: 0
  },
  cascade: {
    id: 'cascade',
    title: 'CascadeRadar',
    badge: 'Liquidation CFI',
    iconName: 'Flame',
    x: 800,
    y: 20,
    width: 720,
    height: 580,
    zIndex: 9,
    isMinimized: false,
    isMaximized: false,
    isOpen: true,
    heartbeatCount: 0
  },
  basis: {
    id: 'basis',
    title: 'BasisVerse',
    badge: 'Macro Yield Spreads',
    iconName: 'Percent',
    x: 60,
    y: 70,
    width: 760,
    height: 560,
    zIndex: 8,
    isMinimized: true,
    isMaximized: false,
    isOpen: true,
    heartbeatCount: 0
  },
  parity: {
    id: 'parity',
    title: 'ParityGuard',
    badge: '24/7 Equities & Spreads',
    iconName: 'ArrowRightLeft',
    x: 120,
    y: 110,
    width: 740,
    height: 540,
    zIndex: 7,
    isMinimized: true,
    isMaximized: false,
    isOpen: true,
    heartbeatCount: 0
  },
  ghost: {
    id: 'ghost',
    title: 'GhostWhale',
    badge: 'Forensic Smart Money',
    iconName: 'Radar',
    x: 180,
    y: 150,
    width: 740,
    height: 550,
    zIndex: 6,
    isMinimized: true,
    isMaximized: false,
    isOpen: true,
    heartbeatCount: 0
  },
  telemetry: {
    id: 'telemetry',
    title: 'CMC API Telemetry',
    badge: 'API Proof Stream',
    iconName: 'Terminal',
    x: 240,
    y: 90,
    width: 780,
    height: 560,
    zIndex: 5,
    isMinimized: true,
    isMaximized: false,
    isOpen: true,
    heartbeatCount: 0
  }
};

export const WindowManagerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [windows, setWindows] = useState<Record<WindowId, TerminalWindow>>(() => {
    return DEFAULT_WINDOWS;
  });
  const [activeWindowId, setActiveWindowId] = useState<WindowId | null>('veritas');
  const [topZIndex, setTopZIndex] = useState<number>(20);

  // Independent dynamic environment heartbeat for each window
  useEffect(() => {
    const interval = setInterval(() => {
      setWindows((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((key) => {
          const wId = key as WindowId;
          if (next[wId].isOpen) {
            next[wId] = {
              ...next[wId],
              heartbeatCount: next[wId].heartbeatCount + 1,
              lastTickTime: new Date().toLocaleTimeString()
            };
          }
        });
        return next;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const bringToFront = (id: WindowId) => {
    const nextZ = topZIndex + 1;
    setTopZIndex(nextZ);
    setActiveWindowId(id);
    setWindows((prev) => {
      const next = { ...prev };
      // Unmaximize any other window so it does not overlay this window
      Object.keys(next).forEach((k) => {
        const otherId = k as WindowId;
        if (otherId !== id && next[otherId].isMaximized) {
          next[otherId] = {
            ...next[otherId],
            isMaximized: false,
            x: next[otherId].prevX ?? 40,
            y: next[otherId].prevY ?? 40,
            width: next[otherId].prevWidth ?? 740,
            height: next[otherId].prevHeight ?? 560
          };
        }
      });

      next[id] = {
        ...next[id],
        zIndex: nextZ,
        isMinimized: false
      };
      return next;
    });
  };

  const minimizeWindow = (id: WindowId) => {
    setWindows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        isMinimized: true
      }
    }));
    if (activeWindowId === id) {
      // Find highest zIndex non-minimized window
      const remaining = Object.values(windows).filter((w) => w.id !== id && w.isOpen && !w.isMinimized);
      if (remaining.length > 0) {
        remaining.sort((a, b) => b.zIndex - a.zIndex);
        setActiveWindowId(remaining[0].id);
      } else {
        setActiveWindowId(null);
      }
    }
  };

  const maximizeWindow = (id: WindowId) => {
    setWindows((prev) => {
      const win = prev[id];
      if (win.isMaximized) {
        // Restore
        return {
          ...prev,
          [id]: {
            ...win,
            isMaximized: false,
            x: win.prevX ?? 40,
            y: win.prevY ?? 40,
            width: win.prevWidth ?? 740,
            height: win.prevHeight ?? 560
          }
        };
      } else {
        // Maximize
        return {
          ...prev,
          [id]: {
            ...win,
            isMaximized: true,
            prevX: win.x,
            prevY: win.y,
            prevWidth: win.width,
            prevHeight: win.height
          }
        };
      }
    });
    bringToFront(id);
  };

  const restoreWindow = (id: WindowId) => {
    bringToFront(id);
    setWindows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        isMinimized: false
      }
    }));
  };

  const closeWindow = (id: WindowId) => {
    setWindows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        isOpen: false
      }
    }));
  };

  const openWindow = (id: WindowId) => {
    const nextZ = topZIndex + 5;
    setTopZIndex(nextZ);
    setActiveWindowId(id);
    setWindows((prev) => {
      const next = { ...prev };
      // Unmaximize any other window that would overlay the new window
      Object.keys(next).forEach((k) => {
        const otherId = k as WindowId;
        if (otherId !== id && next[otherId].isMaximized) {
          next[otherId] = {
            ...next[otherId],
            isMaximized: false,
            x: next[otherId].prevX ?? 40,
            y: next[otherId].prevY ?? 40,
            width: next[otherId].prevWidth ?? 740,
            height: next[otherId].prevHeight ?? 560
          };
        }
      });

      const win = next[id];
      const screenW = typeof window !== 'undefined' ? window.innerWidth : 1400;
      const screenH = typeof window !== 'undefined' ? window.innerHeight : 900;
      
      let targetX = win.x;
      let targetY = win.y;

      const openWins = Object.values(next).filter((w) => w.id !== id && w.isOpen && !w.isMinimized);
      const isCoinciding = openWins.some((w) => Math.abs(w.x - targetX) < 25 && Math.abs(w.y - targetY) < 25);
      if (isCoinciding || targetX <= 0 || targetY <= 0) {
        targetX = 40 + (openWins.length * 35) % 250;
        targetY = 30 + (openWins.length * 35) % 180;
      }

      targetX = Math.min(Math.max(20, targetX), Math.max(20, screenW - win.width - 40));
      targetY = Math.min(Math.max(20, targetY), Math.max(20, screenH - win.height - 120));

      next[id] = {
        ...win,
        isOpen: true,
        isMinimized: false,
        isMaximized: false,
        zIndex: nextZ,
        x: targetX,
        y: targetY
      };
      return next;
    });
  };

  const updatePosition = (id: WindowId, x: number, y: number) => {
    setWindows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        x: Math.max(0, x),
        y: Math.max(0, y),
        isMaximized: false
      }
    }));
  };

  const updateSize = (id: WindowId, width: number, height: number) => {
    setWindows((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        width: Math.max(380, width),
        height: Math.max(280, height),
        isMaximized: false
      }
    }));
  };

  const applyPreset = (preset: LayoutPreset) => {
    const containerWidth = typeof window !== 'undefined' ? window.innerWidth - 60 : 1400;
    const containerHeight = typeof window !== 'undefined' ? window.innerHeight - 180 : 800;

    setWindows((prev) => {
      const next = { ...prev };
      const ids: WindowId[] = ['veritas', 'cascade', 'basis', 'parity', 'ghost', 'telemetry'];

      if (preset === 'grid') {
        const halfW = Math.max(480, Math.floor(containerWidth / 2) - 16);
        const halfH = Math.max(340, Math.floor(containerHeight / 2) - 16);

        next.veritas = { ...next.veritas, x: 10, y: 10, width: halfW, height: halfH, isOpen: true, isMinimized: false, isMaximized: false };
        next.cascade = { ...next.cascade, x: halfW + 24, y: 10, width: halfW, height: halfH, isOpen: true, isMinimized: false, isMaximized: false };
        next.basis = { ...next.basis, x: 10, y: halfH + 24, width: halfW, height: halfH, isOpen: true, isMinimized: false, isMaximized: false };
        next.parity = { ...next.parity, x: halfW + 24, y: halfH + 24, width: halfW, height: halfH, isOpen: true, isMinimized: false, isMaximized: false };
        next.ghost = { ...next.ghost, isMinimized: true };
        next.telemetry = { ...next.telemetry, isMinimized: true };
      } else if (preset === 'split') {
        const halfW = Math.max(480, Math.floor(containerWidth / 2) - 16);
        next.veritas = { ...next.veritas, x: 10, y: 10, width: halfW, height: containerHeight, isOpen: true, isMinimized: false, isMaximized: false };
        next.cascade = { ...next.cascade, x: halfW + 24, y: 10, width: halfW, height: containerHeight, isOpen: true, isMinimized: false, isMaximized: false };
        next.basis = { ...next.basis, isMinimized: true };
        next.parity = { ...next.parity, isMinimized: true };
      } else if (preset === 'cascade') {
        ids.forEach((id, index) => {
          next[id] = {
            ...next[id],
            x: 20 + index * 40,
            y: 20 + index * 40,
            width: Math.min(800, containerWidth - 100),
            height: Math.min(560, containerHeight - 80),
            isOpen: true,
            isMinimized: false,
            isMaximized: false,
            zIndex: 10 + index
          };
        });
      }

      return next;
    });
  };

  const resetWorkspace = () => {
    setWindows(DEFAULT_WINDOWS);
    setActiveWindowId('veritas');
  };

  return (
    <WindowManagerContext.Provider
      value={{
        windows,
        activeWindowId,
        bringToFront,
        minimizeWindow,
        maximizeWindow,
        restoreWindow,
        closeWindow,
        openWindow,
        updatePosition,
        updateSize,
        applyPreset,
        resetWorkspace
      }}
    >
      {children}
    </WindowManagerContext.Provider>
  );
};

export const useWindowManager = () => {
  const context = useContext(WindowManagerContext);
  if (!context) {
    throw new Error('useWindowManager must be used within a WindowManagerProvider');
  }
  return context;
};
