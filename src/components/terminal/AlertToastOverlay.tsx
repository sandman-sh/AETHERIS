import React from 'react';
import { X, ShieldAlert, AlertTriangle, Info } from 'lucide-react';
import { useAlerts, AlertSeverity } from '../../context/AlertsContext';

export const AlertToastOverlay: React.FC = () => {
  const { notifications, dismissNotification } = useAlerts();

  // Show only the 3 most recent unread/active notifications as toasts
  const activeToasts = notifications.slice(0, 3);

  if (activeToasts.length === 0) return null;

  const getIcon = (sev: AlertSeverity) => {
    switch (sev) {
      case 'CRITICAL':
        return <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />;
      default:
        return <Info className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />;
    }
  };

  return (
    <div className="fixed bottom-14 right-5 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full">
      {activeToasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#151525]/95 shadow-xl backdrop-blur-md flex items-start justify-between gap-3 text-slate-900 dark:text-slate-100 transition-all duration-200 animate-in slide-in-from-bottom-2"
        >
          <div className="flex items-start space-x-2.5">
            {getIcon(toast.severity)}
            <div>
              <div className="text-xs font-bold">{toast.title}</div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">{toast.message}</p>
              <div className="text-[9px] text-slate-400 font-mono mt-1">{toast.timestamp}</div>
            </div>
          </div>
          <button
            onClick={() => dismissNotification(toast.id)}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
