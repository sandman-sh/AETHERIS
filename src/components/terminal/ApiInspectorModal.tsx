import React from 'react';
import { X, Terminal } from 'lucide-react';
import { ApiTelemetryView } from './ApiTelemetryView';

interface ApiInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiInspectorModal: React.FC<ApiInspectorModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#11111e] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden text-slate-900 dark:text-slate-100">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#161626]">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-950/80 rounded-lg text-purple-600 dark:text-purple-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center space-x-2">
                <span>CoinMarketCap API Telemetry &amp; Telemetry Proof</span>
                <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                  LIVE VERIFIED
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Transparent inspection of real endpoint calls, HTTP headers, payloads, and architectural feedback.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-hidden p-5">
          <ApiTelemetryView />
        </div>
      </div>
    </div>
  );
};
