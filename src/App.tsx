import React, { useState, useEffect } from 'react';
import { LandingPage } from './pages/LandingPage';
import { TerminalPage } from './pages/TerminalPage';
import { WindowManagerProvider } from './context/WindowManagerContext';
import { AlertsProvider } from './context/AlertsContext';
import { KimoCopilot } from './components/common/KimoCopilot';

export function App() {
  // 1st page is homepage by default
  const [currentView, setCurrentView] = useState<'home' | 'terminal'>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('terminal') || hash.includes('app')) {
        return 'terminal';
      }
    }
    return 'home';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('terminal') || hash.includes('app')) {
        setCurrentView('terminal');
      } else {
        setCurrentView('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateToTerminal = () => {
    window.location.hash = '/terminal';
    setCurrentView('terminal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToHome = () => {
    window.location.hash = '/';
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AlertsProvider>
      <WindowManagerProvider>
        <div className="w-full min-h-screen bg-white dark:bg-[#0a0a12] transition-colors duration-200 relative">
          {currentView === 'home' ? (
            <LandingPage onLaunchApp={navigateToTerminal} />
          ) : (
            <>
              <TerminalPage onBackToHome={navigateToHome} />
              {/* KIMO Institutional AI Copilot - strictly accessible inside main app only */}
              <KimoCopilot
                onNavigate={(view) => {
                  if (view === 'terminal') {
                    navigateToTerminal();
                  } else {
                    navigateToHome();
                  }
                }}
              />
            </>
          )}
        </div>
      </WindowManagerProvider>
    </AlertsProvider>
  );
}

export default App;
