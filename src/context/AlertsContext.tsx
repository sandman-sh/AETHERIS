import React, { createContext, useContext, useState, useEffect } from 'react';

export type AlertMetric = 'CFI' | 'SLIPPAGE' | 'WEEKEND_SPREAD' | 'WASH_VOL';
export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export interface AlertRule {
  id: string;
  name: string;
  metric: AlertMetric;
  threshold: number;
  operator: '>';
  enabled: boolean;
  description: string;
}

export interface TerminalNotification {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  timestamp: string;
  read: boolean;
}

interface AlertsContextType {
  rules: AlertRule[];
  notifications: TerminalNotification[];
  unreadCount: number;
  soundEnabled: boolean;
  watchlist: string[];
  toggleWatchlist: (symbol: string) => void;
  isWatchlisted: (symbol: string) => boolean;
  toggleSound: () => void;
  toggleRule: (id: string) => void;
  updateThreshold: (id: string, newThreshold: number) => void;
  triggerAlert: (title: string, message: string, severity: AlertSeverity) => void;
  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

const DEFAULT_RULES: AlertRule[] = [
  {
    id: 'rule_cfi',
    name: 'Cascade Fragility Early Warning',
    metric: 'CFI',
    threshold: 8.0,
    operator: '>',
    enabled: true,
    description: 'Triggers when perpetual contract liquidation clusters exceed spot DEX depth by 8.0x'
  },
  {
    id: 'rule_slippage',
    name: 'RWA Secondary Run-Risk Slippage',
    metric: 'SLIPPAGE',
    threshold: 2.0,
    operator: '>',
    enabled: true,
    description: 'Triggers when a simulated exit order encounters >2.00% non-linear slippage'
  },
  {
    id: 'rule_weekend_spread',
    name: 'Tokenized Stock Weekend Basis Divergence',
    metric: 'WEEKEND_SPREAD',
    threshold: 2.5,
    operator: '>',
    enabled: true,
    description: 'Triggers when on-chain 24/7 tokenized stocks diverge >2.5% from Friday NYSE close'
  },
  {
    id: 'rule_wash_vol',
    name: 'GhostWhale Wash-Trading Filter',
    metric: 'WASH_VOL',
    threshold: 25.0,
    operator: '>',
    enabled: true,
    description: 'Triggers when trending DEX pool volume exceeds 25x its locked liquidity'
  }
];

const AlertsContext = createContext<AlertsContextType | null>(null);

export const AlertsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rules, setRules] = useState<AlertRule[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cmc_alert_rules');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return DEFAULT_RULES;
  });

  const [notifications, setNotifications] = useState<TerminalNotification[]>([
    {
      id: 'init_note_1',
      title: 'CascadeRadar Alert Active',
      message: 'SOL-PERP liquidation cluster exceeds secondary depth threshold (CFI 8.84x).',
      severity: 'CRITICAL',
      timestamp: new Date().toLocaleTimeString(),
      read: false
    },
    {
      id: 'init_note_2',
      title: 'ParityGuard Spread Alert',
      message: 'bNVDA weekend continuous on-chain trading is +3.01% above Friday NYSE close.',
      severity: 'WARNING',
      timestamp: new Date().toLocaleTimeString(),
      read: false
    }
  ]);

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const [watchlist, setWatchlist] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cmc_watchlist');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return ['USDY', 'BUIDL', 'bNVDA', 'SOL'];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cmc_alert_rules', JSON.stringify(rules));
    }
  }, [rules]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cmc_watchlist', JSON.stringify(watchlist));
    }
  }, [watchlist]);

  const playChime = () => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {}
  };

  const triggerAlert = (title: string, message: string, severity: AlertSeverity) => {
    const newNote: TerminalNotification = {
      id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title,
      message,
      severity,
      timestamp: new Date().toLocaleTimeString(),
      read: false
    };

    setNotifications((prev) => [newNote, ...prev.slice(0, 20)]);
    playChime();
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const toggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const updateThreshold = (id: string, newThreshold: number) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, threshold: newThreshold } : r))
    );
  };

  const toggleSound = () => {
    setSoundEnabled((prev) => !prev);
  };

  const toggleWatchlist = (symbol: string) => {
    setWatchlist((prev) =>
      prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]
    );
  };

  const isWatchlisted = (symbol: string) => {
    return watchlist.includes(symbol);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AlertsContext.Provider
      value={{
        rules,
        notifications,
        unreadCount,
        soundEnabled,
        watchlist,
        toggleWatchlist,
        isWatchlisted,
        toggleSound,
        toggleRule,
        updateThreshold,
        triggerAlert,
        dismissNotification,
        clearAllNotifications
      }}
    >
      {children}
    </AlertsContext.Provider>
  );
};

export const useAlerts = () => {
  const context = useContext(AlertsContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertsProvider');
  }
  return context;
};
