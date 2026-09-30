import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Radio } from 'lucide-react';
import { liveStreamService, LivePriceTick } from '../../services/liveStreamService';

export const HeaderTicker: React.FC = () => {
  const [ticks, setTicks] = useState<Record<string, LivePriceTick>>(liveStreamService.getSnapshot());
  const [lastUpdatedSym, setLastUpdatedSym] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = liveStreamService.subscribePrices((newTicks) => {
      setTicks(newTicks);
      // find which symbol changed
      const changed = Object.values(newTicks).sort((a, b) => b.timestamp - a.timestamp)[0];
      if (changed && Date.now() - changed.timestamp < 1500) {
        setLastUpdatedSym(changed.symbol);
        const timer = setTimeout(() => setLastUpdatedSym(null), 1200);
        return () => clearTimeout(timer);
      }
    });
    return unsubscribe;
  }, []);

  const items = Object.values(ticks);

  return (
    <div className="w-full overflow-hidden bg-slate-50 dark:bg-[#0e0e1a] border-b border-slate-200 dark:border-slate-800 text-xs py-1.5 select-none flex items-center">
      {/* Live Indicator Pill */}
      <div className="hidden sm:flex items-center space-x-1.5 px-3 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-r border-slate-200 dark:border-slate-800 text-[10px] font-mono font-bold shrink-0 z-10">
        <Radio className="w-3 h-3 animate-pulse text-emerald-500" />
        <span>LIVE 24/7 STREAM</span>
      </div>

      <div className="overflow-hidden flex-1 relative">
        <div className="animate-ticker flex items-center space-x-8">
          {[...items, ...items].map((item, index) => {
            const isJustUpdated = lastUpdatedSym === item.symbol;
            return (
              <div
                key={`${item.symbol}-${index}`}
                className={`flex items-center space-x-2 shrink-0 px-2 py-0.5 rounded transition-all duration-300 ${
                  isJustUpdated
                    ? item.direction === 'UP'
                      ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500/40'
                    : ''
                }`}
              >
                <span className="font-semibold text-slate-800 dark:text-slate-200">{item.symbol}</span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">{item.name}</span>
                <span className="font-mono text-slate-900 dark:text-slate-100 font-semibold">{item.price}</span>
                <span
                  className={`flex items-center space-x-0.5 font-medium ${
                    item.change >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {item.change >= 0 ? <TrendingUp className="w-3 h-3 inline" /> : <TrendingDown className="w-3 h-3 inline" />}
                  <span>{item.change >= 0 ? `+${item.change}%` : `${item.change}%`}</span>
                </span>
                {item.badge && (
                  <span className="bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded text-[10px] font-semibold border border-purple-200 dark:border-purple-800">
                    {item.badge}
                  </span>
                )}
                <span className="text-slate-300 dark:text-slate-700 ml-4">•</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
