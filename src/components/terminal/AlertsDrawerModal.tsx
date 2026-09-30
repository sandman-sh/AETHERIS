import React, { useState } from 'react';
import {
  Bell,
  X,
  Volume2,
  VolumeX,
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle,
  Sliders,
  Trash2,
  Sparkles
} from 'lucide-react';
import { useAlerts, AlertRule, AlertSeverity } from '../../context/AlertsContext';

interface AlertsDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AlertsDrawerModal: React.FC<AlertsDrawerModalProps> = ({ isOpen, onClose }) => {
  const {
    rules,
    notifications,
    soundEnabled,
    toggleSound,
    toggleRule,
    updateThreshold,
    triggerAlert,
    dismissNotification,
    clearAllNotifications
  } = useAlerts();

  const [activeTab, setActiveTab] = useState<'notifications' | 'rules'>('notifications');

  if (!isOpen) return null;

  const getSeverityIcon = (sev: AlertSeverity) => {
    switch (sev) {
      case 'CRITICAL':
        return <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-purple-500 shrink-0" />;
    }
  };

  const getSeverityBadge = (sev: AlertSeverity) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'WARNING':
        return 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#11111e] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#161626]">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-950/80 rounded-lg text-purple-600 dark:text-purple-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center space-x-2">
                <span>Institutional Risk & Alert Center</span>
                <span className="bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-purple-300 dark:border-purple-800">
                  {notifications.length} Active
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure systemic thresholds, CFI liquidation spiral alerts, and secondary slippage limits.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={toggleSound}
              className={`p-2 rounded-lg border text-xs flex items-center space-x-1.5 transition ${
                soundEnabled
                  ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
              }`}
              title={soundEnabled ? 'Mute Audio Chime' : 'Enable Audio Chime'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Strip */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50/30 dark:bg-[#131322]">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition ${
              activeTab === 'notifications'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Live Risk Alerts ({notifications.length})
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition ${
              activeTab === 'rules'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Custom Threshold Rules ({rules.length})
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'notifications' ? (
            <div>
              <div className="flex items-center justify-between pb-3">
                <span className="text-xs text-slate-500">Real-time alerts triggered by streaming telemetry</span>
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center space-x-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All</span>
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                  No active risk violations detected. All parameters within safe institutional thresholds.
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((note) => (
                    <div
                      key={note.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#161628] flex items-start justify-between gap-3 shadow-xs"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="mt-0.5">{getSeverityIcon(note.severity)}</div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{note.title}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${getSeverityBadge(note.severity)}`}>
                              {note.severity}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{note.message}</p>
                          <div className="text-[10px] text-slate-400 font-mono mt-1">{note.timestamp}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => dismissNotification(note.id)}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Instant Test Alert Trigger */}
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500">Need to verify alert notifications &amp; audio chimes?</span>
                <button
                  onClick={() =>
                    triggerAlert(
                      'Manual Stress-Test Alert',
                      'Simulated run-risk breach of secondary DEX pool liquidity reserves ($1.5M exit).',
                      'WARNING'
                    )
                  }
                  className="px-3 py-1.5 text-xs bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/70 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg font-medium transition flex items-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Send Test Alert</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-xs text-slate-500">
                Adjust threshold triggers below. Rules evaluate continuously against incoming CoinMarketCap and on-chain telemetry.
              </div>

              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#161628] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100">{rule.name}</div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{rule.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={() => toggleRule(rule.id)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-purple-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center space-x-4 pt-1">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300 shrink-0">
                      Trigger when &gt;
                    </span>
                    <input
                      type="number"
                      step={rule.metric === 'CFI' || rule.metric === 'WASH_VOL' ? '0.5' : '0.1'}
                      value={rule.threshold}
                      onChange={(e) => updateThreshold(rule.id, parseFloat(e.target.value) || 0)}
                      className="w-24 px-2.5 py-1 text-xs font-mono font-bold bg-white dark:bg-[#10101d] border border-slate-300 dark:border-slate-700 rounded-md text-purple-600 dark:text-purple-400 focus:outline-hidden focus:ring-1 focus:ring-purple-500"
                    />
                    <span className="text-xs text-slate-400 font-mono">
                      {rule.metric === 'CFI' ? 'x multiplier' : rule.metric === 'WASH_VOL' ? 'x vol/liq' : '%'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
