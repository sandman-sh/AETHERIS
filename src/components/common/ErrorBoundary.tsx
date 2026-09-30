import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Terminal, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Aetheris Terminal ErrorBoundary caught error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.hash = '/';
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 text-slate-100 p-6 select-none">
          <div className="max-w-xl w-full p-6 sm:p-8 rounded-2xl bg-[#121224] border border-rose-500/40 shadow-2xl space-y-5">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {this.props.fallbackTitle || 'Workspace Recovery Triggered'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  An unexpected component exception was safely intercepted by the Sovereign Guard.
                </p>
              </div>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-lg bg-black/60 border border-slate-800 font-mono text-xs text-rose-300 overflow-x-auto max-h-40">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-purple-600/30 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Application</span>
              </button>
              <button
                onClick={() => {
                  window.location.hash = '/';
                  this.setState({ hasError: false, error: null, errorInfo: null });
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center space-x-2 transition cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return to Homepage</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
