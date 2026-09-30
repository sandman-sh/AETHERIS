import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Flame,
  Percent,
  ArrowRightLeft,
  Radar,
  Terminal,
  Sun,
  Moon,
  Grid,
  Columns,
  Layers,
  RotateCcw,
  Plus,
  Maximize2,
  Bell,
  Star,
  Bot
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { HeaderTicker } from '../components/common/HeaderTicker';
import { useWindowManager } from '../context/WindowManagerContext';
import { useAlerts } from '../context/AlertsContext';
import { AlertToastOverlay } from '../components/terminal/AlertToastOverlay';
import { AlertsDrawerModal } from '../components/terminal/AlertsDrawerModal';
import { WindowFrame } from '../components/terminal/WindowFrame';
import { WorkspaceDock } from '../components/terminal/WorkspaceDock';
import { VeritasRwaView } from '../components/terminal/VeritasRwaView';
import { CascadeRadarView } from '../components/terminal/CascadeRadarView';
import { BasisVerseView } from '../components/terminal/BasisVerseView';
import { ParityGuardView } from '../components/terminal/ParityGuardView';
import { GhostWhaleView } from '../components/terminal/GhostWhaleView';
import { ApiTelemetryView } from '../components/terminal/ApiTelemetryView';
import { ApiInspectorModal } from '../components/terminal/ApiInspectorModal';
import { cmcApi } from '../services/cmcApi';
import { GlobalMarketStats } from '../types';
import { WindowId } from '../types/window';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

interface TerminalPageProps {
  onBackToHome: () => void;
}

const TerminalWorkspaceInner: React.FC<TerminalPageProps> = ({ onBackToHome }) => {
  const { theme, toggleTheme } = useTheme();
  const { windows, openWindow, applyPreset, resetWorkspace } = useWindowManager();
  const { unreadCount, watchlist } = useAlerts();
  const [marketStats, setMarketStats] = useState<GlobalMarketStats | null>(null);
  const [isInspectorModalOpen, setIsInspectorModalOpen] = useState<boolean>(false);
  const [isAlertsDrawerOpen, setIsAlertsDrawerOpen] = useState<boolean>(false);
  const [addWindowDropdown, setAddWindowDropdown] = useState<boolean>(false);

  useEffect(() => {
    const fetchStats = () => {
      cmcApi.getGlobalStats().then(setMarketStats);
    };
    fetchStats();
    const interval = setInterval(fetchStats, 45000);
    return () => clearInterval(interval);
  }, []);

  const availableWindows: Array<{ id: WindowId; label: string }> = [
    { id: 'veritas', label: 'VeritasRWA (Solvency & Slippage)' },
    { id: 'cascade', label: 'CascadeRadar (Liquidation CFI)' },
    { id: 'basis', label: 'BasisVerse (Macro Yield Spreads)' },
    { id: 'parity', label: 'ParityGuard (24/7 Equities & Spreads)' },
    { id: 'ghost', label: 'GhostWhale (Forensic DEX Smart Money)' },
    { id: 'telemetry', label: 'CMC API Telemetry Proof Stream' }
  ];

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-100 dark:bg-[#090913] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 select-none">
      {/* Real-time Financial Ticker Bar */}
      <HeaderTicker />

      {/* Terminal Workstation Control Header */}
      <header className="h-14 bg-white/95 dark:bg-[#10101d]/95 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between z-50 shrink-0 backdrop-blur-md relative">
        {/* Brand & Market Stats Bar */}
        <div className="flex items-center space-x-5">
          <div
            onClick={onBackToHome}
            className="flex items-center space-x-2.5 cursor-pointer group"
            title="Return to Homepage"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white text-xs font-black shadow-md group-hover:scale-105 group-hover:shadow-purple-500/25 transition-all duration-150">
              A
            </div>
            <span className="font-black text-sm tracking-tight text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              AETHERIS <span className="text-purple-600 dark:text-purple-400 font-mono font-bold text-xs">WORKSTATION</span>
            </span>
          </div>

          {/* Live Macro Indicators */}
          {marketStats && (
            <div className="hidden lg:flex items-center space-x-4 text-xs">
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-400">Fear &amp; Greed:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 text-[11px]">
                  {marketStats.fear_and_greed_score} ({marketStats.fear_and_greed_sentiment})
                </span>
              </div>

              <div className="flex items-center space-x-1.5">
                <span className="text-slate-400">CMC MCap:</span>
                <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                  ${(marketStats.total_market_cap_usd / 1e12).toFixed(2)}T
                </span>
                <span className={`text-[10px] font-mono font-bold ${marketStats.market_cap_24h_change_pct >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {marketStats.market_cap_24h_change_pct >= 0 ? `+${marketStats.market_cap_24h_change_pct}%` : `${marketStats.market_cap_24h_change_pct}%`}
                </span>
              </div>

              <div className="flex items-center space-x-1.5">
                <span className="text-slate-400">BTC Dom:</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                  {marketStats.btc_dominance_pct}%
                </span>
              </div>

              <div className="flex items-center space-x-1.5">
                <span className="text-slate-400">24h Vol:</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                  ${(marketStats.total_volume_24h_usd / 1e9).toFixed(1)}B
                </span>
              </div>

              <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-[10px] font-mono text-emerald-700 dark:text-emerald-300 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>CMC PRO LIVE</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Actions: Add Window, Presets, Telemetry, Theme */}
        <div className="flex items-center space-x-2">
          {/* Add Window Dropdown */}
          <div className="relative">
            <button
              onClick={() => setAddWindowDropdown(!addWindowDropdown)}
              className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-purple-600" />
              <span>Add Window</span>
            </button>

            {addWindowDropdown && (
              <>
                <div
                  className="fixed inset-0 z-[9998]"
                  onClick={() => setAddWindowDropdown(false)}
                />
                <div className="absolute right-0 mt-1 w-68 bg-white dark:bg-[#151525] border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl py-2 z-[9999] text-xs divide-y divide-slate-100 dark:divide-slate-800/60">
                  <div className="px-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Available Engines
                  </div>
                  <div className="pt-1 space-y-0.5">
                    {availableWindows.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          openWindow(item.id);
                          setAddWindowDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-700 dark:text-slate-300 flex items-center justify-between transition cursor-pointer rounded-md mx-auto"
                      >
                        <span className="font-medium">{item.label}</span>
                        {windows[item.id].isOpen && !windows[item.id].isMinimized && (
                          <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.5 rounded">Open</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Watchlist Counter */}
          <div className="hidden xl:flex items-center space-x-1.5 text-xs px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900 rounded-lg font-medium">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span>Watchlist: {watchlist.length}</span>
          </div>

          {/* Alert Center Trigger */}
          <button
            onClick={() => setIsAlertsDrawerOpen(true)}
            className="relative p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer border border-slate-200 dark:border-slate-800"
            title="Open Risk Alert Center & Rules"
          >
            <Bell className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Quick Layout Presets in Header */}
          <div className="hidden sm:flex items-center space-x-1 border-l border-slate-200 dark:border-slate-800 pl-2">
            <button
              onClick={() => applyPreset('grid')}
              className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="2x2 Tiled Grid"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => applyPreset('split')}
              className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Split View"
            >
              <Columns className="w-4 h-4" />
            </button>
            <button
              onClick={() => applyPreset('cascade')}
              className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Cascade Windows"
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>

          {/* API Telemetry Modal Trigger */}
          <button
            onClick={() => setIsInspectorModalOpen(true)}
            className="flex items-center space-x-1.5 bg-purple-50 dark:bg-purple-950/70 hover:bg-purple-100 dark:hover:bg-purple-900/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/80 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden md:inline">API Inspector</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </button>

          {/* KIMO Copilot Trigger */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('kimo:toggle'))}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
            title="Ask KIMO AI Institutional Copilot"
          >
            <Bot className="w-3.5 h-3.5 text-purple-200 animate-pulse" />
            <span>Ask KIMO</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-slate-200 dark:border-slate-800 cursor-pointer"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4 text-purple-600" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>
        </div>
      </header>

      {/* Main Multi-Window Desktop Canvas Workspace */}
      <main
        className="flex-1 relative overflow-hidden bg-slate-50 dark:bg-[#090912] bg-grid-pattern isolate z-10"
        onClick={() => {
          if (addWindowDropdown) setAddWindowDropdown(false);
        }}
      >
        {/* Dynamic Window 1: VeritasRWA */}
        <WindowFrame id="veritas">
          <ErrorBoundary fallbackTitle="VeritasRWA Recovery">
            <VeritasRwaView />
          </ErrorBoundary>
        </WindowFrame>

        {/* Dynamic Window 2: CascadeRadar */}
        <WindowFrame id="cascade">
          <ErrorBoundary fallbackTitle="CascadeRadar Recovery">
            <CascadeRadarView />
          </ErrorBoundary>
        </WindowFrame>

        {/* Dynamic Window 3: BasisVerse */}
        <WindowFrame id="basis">
          <ErrorBoundary fallbackTitle="BasisVerse Recovery">
            <BasisVerseView />
          </ErrorBoundary>
        </WindowFrame>

        {/* Dynamic Window 4: ParityGuard */}
        <WindowFrame id="parity">
          <ErrorBoundary fallbackTitle="ParityGuard Recovery">
            <ParityGuardView />
          </ErrorBoundary>
        </WindowFrame>

        {/* Dynamic Window 5: GhostWhale */}
        <WindowFrame id="ghost">
          <ErrorBoundary fallbackTitle="GhostWhale Recovery">
            <GhostWhaleView />
          </ErrorBoundary>
        </WindowFrame>

        {/* Dynamic Window 6: CMC API Telemetry Stream */}
        <WindowFrame id="telemetry">
          <ErrorBoundary fallbackTitle="Telemetry Proof Recovery">
            <ApiTelemetryView />
          </ErrorBoundary>
        </WindowFrame>
      </main>

      {/* Persistent Bottom Workspace Taskbar & Dock */}
      <WorkspaceDock />

      {/* Real-time Alert Notification Toasts */}
      <AlertToastOverlay />

      {/* Modal Inspector View */}
      <ApiInspectorModal
        isOpen={isInspectorModalOpen}
        onClose={() => setIsInspectorModalOpen(false)}
      />

      {/* Alerts & Rules Configuration Drawer Modal */}
      <AlertsDrawerModal
        isOpen={isAlertsDrawerOpen}
        onClose={() => setIsAlertsDrawerOpen(false)}
      />
    </div>
  );
};

export const TerminalPage: React.FC<TerminalPageProps> = (props) => {
  return <TerminalWorkspaceInner {...props} />;
};
