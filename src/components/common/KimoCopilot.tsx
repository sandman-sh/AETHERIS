import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  X,
  Maximize2,
  Minimize2,
  Trash2,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Sliders,
  Terminal,
  Sun,
  Moon,
  Flame,
  Percent,
  Layers,
  HelpCircle
} from 'lucide-react';
import { kimoChat, ChatMessage } from '../../services/kimoChat';
import { KimoMarkdownRenderer, KimoAction } from '../../utils/kimoMarkdown';
import { useWindowManager } from '../../context/WindowManagerContext';
import { useTheme } from '../../context/ThemeContext';
import { WindowId, LayoutPreset } from '../../types/window';

interface KimoCopilotProps {
  onNavigate?: (route: 'home' | 'terminal') => void;
}

export const KimoCopilot: React.FC<KimoCopilotProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => kimoChat.getHistory());
  const [inputText, setInputText] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [lastExecutedActions, setLastExecutedActions] = useState<KimoAction[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // App control context hooks
  const windowManager = useWindowManager();
  const { theme, setTheme, toggleTheme } = useTheme();

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isSending]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Listen for custom trigger to open KIMO from header buttons
  useEffect(() => {
    const handleOpenKimo = (e: any) => {
      setIsOpen(true);
      if (e.detail?.prompt) {
        handleSendPrompt(e.detail.prompt);
      }
    };
    window.addEventListener('kimo:open', handleOpenKimo);
    return () => window.removeEventListener('kimo:open', handleOpenKimo);
  }, []);

  /**
   * Dispatches extracted KIMO actions to control the entire app
   */
  const executeActions = (actions: KimoAction[]) => {
    if (!actions || actions.length === 0) return;
    setLastExecutedActions(actions);

    actions.forEach((act) => {
      // 1. Window Management
      if (windowManager) {
        const wid = act.windowId as WindowId;
        if (act.type === 'OPEN_WINDOW' && wid) {
          windowManager.openWindow(wid);
          windowManager.bringToFront(wid);
        } else if (act.type === 'CLOSE_WINDOW' && wid) {
          windowManager.closeWindow(wid);
        } else if (act.type === 'MINIMIZE_WINDOW' && wid) {
          windowManager.minimizeWindow(wid);
        } else if (act.type === 'MAXIMIZE_WINDOW' && wid) {
          windowManager.maximizeWindow(wid);
        } else if (act.type === 'FOCUS_WINDOW' && wid) {
          windowManager.bringToFront(wid);
        } else if (act.type === 'RESET_WORKSPACE') {
          windowManager.resetWorkspace();
        } else if (act.type === 'APPLY_PRESET' && act.preset) {
          windowManager.applyPreset(act.preset as LayoutPreset);
        } else if (act.type === 'CLOSE_ALL') {
          ['veritas', 'cascade', 'basis', 'parity', 'ghost', 'telemetry'].forEach((id) => {
            windowManager.closeWindow(id as WindowId);
          });
        }
      }

      // 2. Theme Control
      if (act.type === 'SET_THEME' && act.theme) {
        setTheme(act.theme);
      }

      // 3. Navigation Control
      if (act.type === 'NAVIGATE' && act.route) {
        if (onNavigate) {
          onNavigate(act.route === 'terminal' ? 'terminal' : 'home');
        } else {
          window.location.hash = act.route === 'terminal' ? '/terminal' : '/';
        }
      }

      // 4. View Parameter Dispatchers (custom events)
      if (act.type === 'SET_RWA_ASSET' && act.symbol) {
        window.dispatchEvent(new CustomEvent('kimo:rwa_asset', { detail: { symbol: act.symbol } }));
      }
      if (act.type === 'SET_RWA_FILTER' && act.filter) {
        window.dispatchEvent(new CustomEvent('kimo:rwa_filter', { detail: { filter: act.filter } }));
      }
      if (act.type === 'SET_EXIT_ORDER' && act.amount) {
        window.dispatchEvent(new CustomEvent('kimo:exit_order', { detail: { amount: act.amount } }));
      }
      if (act.type === 'TRIGGER_REFRESH') {
        window.dispatchEvent(new CustomEvent('kimo:refresh'));
      }
      if (act.type === 'OPEN_TELEMETRY') {
        window.dispatchEvent(new CustomEvent('kimo:open_telemetry'));
      }
      if (act.type === 'OPEN_ALERTS') {
        window.dispatchEvent(new CustomEvent('kimo:open_alerts'));
      }
    });

    // Clear confirmation badge after 4 seconds
    setTimeout(() => {
      setLastExecutedActions([]);
    }, 4500);
  };

  const handleSendPrompt = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isSending) return;

    setInputText('');
    setIsSending(true);

    // Build context
    const openWins = windowManager
      ? Object.entries(windowManager.windows)
          .filter(([_, w]) => w.isOpen && !w.isMinimized)
          .map(([id]) => id)
      : [];

    const context = {
      theme,
      activeWindowId: windowManager?.activeWindowId,
      openWindows: openWins,
      currentRoute: window.location.hash.includes('terminal') ? 'terminal' : 'landing'
    };

    const result = await kimoChat.sendMessage(text, context);
    setMessages(kimoChat.getHistory());
    setIsSending(false);

    if (result.actions && result.actions.length > 0) {
      executeActions(result.actions);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendPrompt();
    }
  };

  const handleClearChat = () => {
    kimoChat.clearHistory();
    setMessages(kimoChat.getHistory());
    setLastExecutedActions([]);
  };

  const QUICK_PROMPTS = [
    { label: 'Open Cascade Radar', prompt: 'Open Cascade Radar and analyze liquidation risk' },
    { label: 'Switch to Dark Mode', prompt: 'Switch the application to dark mode' },
    { label: 'Switch to Light Mode', prompt: 'Switch the application to light mode' },
    { label: 'Simulate $1M Exit', prompt: 'Simulate a $1,000,000 exit order on USDY' },
    { label: 'Tile Workspace', prompt: 'Tile all windows in a tiled-quad layout' },
    { label: 'Check Macro Yields', prompt: 'Open BasisVerse and compare T-Bills against DeFi lending APY' },
    { label: 'Reset Windows', prompt: 'Reset workspace layout to default' }
  ];

  return (
    <>
      {/* Floating KIMO Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-50 flex items-center space-x-2.5 px-4 py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:to-indigo-800 text-white rounded-2xl shadow-xl shadow-purple-600/35 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-purple-400/30 group"
          title="Open KIMO AI Copilot"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white animate-bounce group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-purple-900 animate-ping" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-black text-xs tracking-wide">KIMO AI</span>
            <span className="text-[10px] text-purple-200/90 font-medium">DeepSeek Flash 4</span>
          </div>
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        </button>
      )}

      {/* Slide-out / Floating KIMO AI Copilot Panel */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-200 flex flex-col bg-white dark:bg-[#11111e] border border-purple-300 dark:border-purple-800/80 shadow-2xl rounded-2xl overflow-hidden ${
            isExpanded
              ? 'inset-4 sm:inset-10'
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[94vw] sm:w-[460px] h-[640px] max-h-[88vh]'
          }`}
        >
          {/* Header */}
          <div className="p-3.5 px-4 bg-gradient-to-r from-purple-900/90 via-[#181433] to-[#121024] text-white flex items-center justify-between border-b border-purple-800/50 shrink-0 select-none">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-600/40">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-black text-sm tracking-tight text-white flex items-center space-x-1.5">
                    <span>KIMO</span>
                    <span className="text-[10px] bg-purple-500/40 text-purple-200 px-1.5 py-0.2 rounded font-mono">
                      v4.0
                    </span>
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[10px] text-purple-300 font-mono">DeepSeek Flash 4 • Full Terminal Control</p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={handleClearChat}
                className="p-1.5 text-purple-300 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
                title="Clear conversation"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-purple-300 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer hidden sm:block"
                title={isExpanded ? 'Restore size' : 'Expand window'}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-purple-300 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
                title="Close Copilot"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action Execution Alert Banner */}
          {lastExecutedActions.length > 0 && (
            <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-[11px] font-semibold flex items-center space-x-2 shrink-0 animate-fadeIn">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="flex-1 truncate">
                Executed: {lastExecutedActions.map((a) => `${a.type}${a.windowId ? ` [${a.windowId}]` : ''}${a.theme ? ` [${a.theme}]` : ''}`).join(', ')}
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50 dark:bg-[#0c0c16]">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-2.5 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                      isUser
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-200 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                    }`}
                  >
                    {isUser ? 'U' : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs ${
                      isUser
                        ? 'bg-purple-600 text-white rounded-tr-xs shadow-md shadow-purple-600/20'
                        : 'bg-white dark:bg-[#151526] border border-slate-200 dark:border-slate-800 rounded-tl-xs shadow-xs text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    ) : (
                      <div className="space-y-2">
                        {/* Clean Markdown Rendering - Zero Asterisk Issues */}
                        <KimoMarkdownRenderer text={msg.displayText || msg.content} />

                        {/* Executed Action Pills */}
                        {msg.actions && msg.actions.length > 0 && (
                          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1.5">
                            {msg.actions.map((act, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-mono text-[10px] font-bold border border-purple-200 dark:border-purple-800"
                              >
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                                <span>{act.type.replace(/_/g, ' ')}</span>
                                {act.windowId && <span className="opacity-80">({act.windowId})</span>}
                                {act.theme && <span className="opacity-80">({act.theme})</span>}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div
                      className={`text-[9px] mt-1.5 opacity-60 font-mono ${
                        isUser ? 'text-purple-200 text-right' : 'text-slate-400'
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}

            {isSending && (
              <div className="flex items-start space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0 border border-purple-300 dark:border-purple-800">
                  <Bot className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="bg-white dark:bg-[#151526] border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-xs p-3 text-xs shadow-xs text-slate-500 flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" />
                  </div>
                  <span className="text-[11px] font-mono text-purple-600 dark:text-purple-400">
                    KIMO is analyzing terminal state...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Suggestion Chips */}
          <div className="p-2 px-3 bg-slate-100/70 dark:bg-[#0f0f1b] border-t border-slate-200 dark:border-slate-800/80 shrink-0 overflow-x-auto flex items-center space-x-1.5 no-scrollbar">
            <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0 mr-1 flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-purple-500" />
              <span>Prompt:</span>
            </span>
            {QUICK_PROMPTS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendPrompt(q.prompt)}
                disabled={isSending}
                className="px-2.5 py-1 bg-white dark:bg-[#1a1a2e] hover:bg-purple-50 dark:hover:bg-purple-950/60 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-semibold text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-300 whitespace-nowrap transition cursor-pointer shrink-0 disabled:opacity-50"
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white dark:bg-[#11111e] border-t border-slate-200 dark:border-slate-800 shrink-0">
            <div className="flex items-center space-x-2 bg-slate-50 dark:bg-[#161626] border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-1.5 focus-within:ring-1 focus-within:ring-purple-500 focus-within:border-purple-500 transition">
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask KIMO or give a command (e.g. 'open cascade radar')..."
                rows={1}
                disabled={isSending}
                className="flex-1 bg-transparent text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 resize-none focus:outline-hidden max-h-24 py-1"
              />
              <button
                onClick={() => handleSendPrompt()}
                disabled={!inputText.trim() || isSending}
                className="p-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white transition cursor-pointer shrink-0 shadow-md shadow-purple-600/30"
                title="Send message (Enter)"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center justify-between mt-1 px-1 text-[10px] text-slate-400">
              <span>Natural language controls windows, themes &amp; simulations</span>
              <span>Press Enter to send</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
