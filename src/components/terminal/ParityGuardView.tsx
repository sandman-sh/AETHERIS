import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowRightLeft,
  Calendar,
  DollarSign,
  AlertCircle,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { cmcApi } from '../../services/cmcApi';
import { TokenizedEquitySpread } from '../../types';

export const ParityGuardView: React.FC = () => {
  const [equities, setEquities] = useState<TokenizedEquitySpread[]>([]);
  const [selectedEquity, setSelectedEquity] = useState<TokenizedEquitySpread | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    cmcApi.getTokenizedEquities().then((res) => {
      setEquities(res);
      if (res.length > 0) setSelectedEquity(res[0]);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 rounded-lg">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            ParityGuard: 24/7 Tokenized Equity &amp; Weekend Spread Engine
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
          Monitors after-hours and weekend price discovery for tokenized stocks (bNVDA, bTSLA, bAAPL, bSPY) trading 24/7 on decentralized rails against their Friday NYSE official close. Powered by <span className="font-mono text-purple-600 dark:text-purple-400">/v5/real-world-assets/market-pairs/list</span>.
        </p>
      </div>

      {/* Weekend Divergence Alert Banner */}
      <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-800/80 bg-purple-50/70 dark:bg-purple-950/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-600 text-white rounded-lg shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wider flex items-center space-x-2">
              <span>TradFi Markets Closed • Continuous On-Chain Discovery Active</span>
              <span className="bg-purple-200 dark:bg-purple-900 px-2 py-0.5 rounded text-[10px] text-purple-900 dark:text-purple-200 font-mono">
                24/7 DEX LIQUIDITY
              </span>
            </div>
            <p className="text-xs text-purple-900 dark:text-purple-200 mt-0.5">
              Tokenized NVIDIA ($bNVDA) is trading at <strong>$128.45 (+3.01% above Friday close)</strong> with $4.89M in weekend volume. Projected Monday opening bell gap: <strong>+$3.75</strong>.
            </p>
          </div>
        </div>
        <div className="text-xs font-mono bg-white dark:bg-[#1a1a2e] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 shrink-0 text-slate-700 dark:text-slate-300">
          NYSE Reopens in: <span className="font-bold text-purple-600 dark:text-purple-400">38h 14m</span>
        </div>
      </div>

      {/* Selected Stock Dossier Card */}
      {selectedEquity && (
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121222] shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <span>{selectedEquity.name} ({selectedEquity.ticker})</span>
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-mono font-semibold px-2 py-0.5 rounded">
                  {selectedEquity.token_symbol} on {selectedEquity.chain}
                </span>
              </div>
              <div className="text-xs text-slate-500">Trading Venue: {selectedEquity.dex_venue}</div>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-bold self-start sm:self-auto border ${
                selectedEquity.arbitrage_signal === 'SHORT ARBITRAGE'
                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                  : selectedEquity.arbitrage_signal === 'LONG ARBITRAGE'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                  : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300 dark:border-purple-800'
              }`}
            >
              SIGNAL: {selectedEquity.arbitrage_signal}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
            <div>
              <div className="text-slate-500">On-Chain DEX Price (24/7)</div>
              <div className="text-xl font-bold font-mono text-purple-600 dark:text-purple-400 mt-1 num-tabular">
                ${selectedEquity.onchain_price_usd.toFixed(2)}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Real-time DEX quote</div>
            </div>

            <div>
              <div className="text-slate-500">Friday TradFi Close</div>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1 num-tabular">
                ${selectedEquity.tradfi_nyse_close_usd.toFixed(2)}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">NYSE official 4 PM EST</div>
            </div>

            <div>
              <div className="text-slate-500">Weekend Basis Spread</div>
              <div
                className={`text-xl font-bold font-mono mt-1 num-tabular flex items-center space-x-1 ${
                  selectedEquity.weekend_premium_discount_pct >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {selectedEquity.weekend_premium_discount_pct >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>
                  {selectedEquity.weekend_premium_discount_pct >= 0
                    ? `+${selectedEquity.weekend_premium_discount_pct}%`
                    : `${selectedEquity.weekend_premium_discount_pct}%`}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">After-hours premium</div>
            </div>

            <div>
              <div className="text-slate-500">Implied Monday Open Gap</div>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1 num-tabular">
                {selectedEquity.implied_monday_open_gap_usd >= 0 ? `+$${selectedEquity.implied_monday_open_gap_usd.toFixed(2)}` : `-$${Math.abs(selectedEquity.implied_monday_open_gap_usd).toFixed(2)}`}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Expected pre-market gap</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Equities Table */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Tokenized Stock Parity &amp; Aftermarket Arbitrage Radar
        </h2>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121222] shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#18182c] border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Equity &amp; Ticker</th>
                <th className="py-3 px-4">Token Symbol</th>
                <th className="py-3 px-4">Host Chain</th>
                <th className="py-3 px-4">24/7 DEX Price</th>
                <th className="py-3 px-4">Friday TradFi Close</th>
                <th className="py-3 px-4">Weekend Spread</th>
                <th className="py-3 px-4">Weekend Volume</th>
                <th className="py-3 px-4">Arbitrage Opportunity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {equities.map((item) => (
                <tr
                  key={item.ticker}
                  onClick={() => setSelectedEquity(item)}
                  className={`cursor-pointer transition hover:bg-purple-50/50 dark:hover:bg-purple-950/20 ${
                    selectedEquity?.ticker === item.ticker ? 'bg-purple-50/80 dark:bg-purple-950/40' : ''
                  }`}
                >
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                    <div>{item.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">NYSE: {item.ticker}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-purple-600 dark:text-purple-400">
                    {item.token_symbol}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{item.chain}</td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 dark:text-slate-100 num-tabular">
                    ${item.onchain_price_usd.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500 num-tabular">
                    ${item.tradfi_nyse_close_usd.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold num-tabular">
                    <span
                      className={
                        item.weekend_premium_discount_pct >= 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }
                    >
                      {item.weekend_premium_discount_pct >= 0
                        ? `+${item.weekend_premium_discount_pct}%`
                        : `${item.weekend_premium_discount_pct}%`}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-800 dark:text-slate-200 num-tabular">
                    ${(item.weekend_volume_usd / 1000000).toFixed(2)}M
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        item.arbitrage_signal === 'SHORT ARBITRAGE'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                          : item.arbitrage_signal === 'LONG ARBITRAGE'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {item.arbitrage_signal}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
