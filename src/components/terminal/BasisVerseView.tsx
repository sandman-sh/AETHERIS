import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts';
import {
  TrendingUp,
  Percent,
  Calculator,
  ShieldCheck,
  Clock,
  Coins,
  ArrowUpRight,
  Info
} from 'lucide-react';
import { cmcApi } from '../../services/cmcApi';
import { MacroYieldComparison } from '../../types';

export const BasisVerseView: React.FC = () => {
  const [yields, setYields] = useState<MacroYieldComparison[]>([]);
  const [capitalUsd, setCapitalUsd] = useState<number>(100000);
  const [holdingDays, setHoldingDays] = useState<number>(180);
  const [selectedAsset, setSelectedAsset] = useState<string>('USDY');

  useEffect(() => {
    cmcApi.getMacroYields().then(setYields);
  }, []);

  // Multi-curve yield progression chart
  const yieldCurveData = [
    { maturity: '1D (Instant)', TBill_RWA: 5.0, DeFi_Lending: 6.82, Basis_Perp: 11.2, Fed_Benchmark: 4.88 },
    { maturity: '7D', TBill_RWA: 5.1, DeFi_Lending: 6.75, Basis_Perp: 12.45, Fed_Benchmark: 4.88 },
    { maturity: '30D', TBill_RWA: 5.15, DeFi_Lending: 6.6, Basis_Perp: 12.1, Fed_Benchmark: 4.88 },
    { maturity: '90D', TBill_RWA: 5.15, DeFi_Lending: 6.4, Basis_Perp: 11.8, Fed_Benchmark: 4.88 },
    { maturity: '180D', TBill_RWA: 5.12, DeFi_Lending: 6.3, Basis_Perp: 11.5, Fed_Benchmark: 4.85 },
    { maturity: '365D (1Y)', TBill_RWA: 5.15, DeFi_Lending: 6.2, Basis_Perp: 11.0, Fed_Benchmark: 4.8 }
  ];

  // Calculate net profit for current parameters
  const currentAsset = yields.find((y) => y.asset_symbol.includes(selectedAsset)) || yields[0];
  const grossYield = currentAsset ? (capitalUsd * (currentAsset.apy_pct / 100) * (holdingDays / 365)) : 0;
  const redemptionFee = currentAsset ? (capitalUsd * (currentAsset.redemption_fee_pct / 100)) : 0;
  const estimatedGasUsd = 25; // Typical L1/L2 mint & burn gas
  const netRealizedProfit = Math.max(0, grossYield - redemptionFee - estimatedGasUsd);
  const effectiveAnnualizedApr = ((netRealizedProfit / capitalUsd) * (365 / holdingDays)) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 rounded-lg">
            <Percent className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            BasisVerse: RWA vs. DeFi Yield-Curve & Macro Spread Navigator
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
          Visualizing the sovereign risk-free spread between tokenized US Treasuries (<span className="font-mono text-purple-600 dark:text-purple-400">/v5/real-world-assets/</span>), decentralized money markets, and delta-neutral funding rate basis arbitrage.
        </p>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121222] shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Risk-Free RWA Benchmark</div>
          <div className="text-xl font-bold font-mono text-purple-600 dark:text-purple-400 mt-1 num-tabular">5.15% APY</div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Ondo USDY (US T-Bills)</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121222] shadow-xs">
          <div className="text-xs text-slate-500 font-medium">DeFi Prime Rate (Aave v3)</div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1 num-tabular">6.82% APY</div>
          <div className="text-xs text-slate-500 mt-1">+1.67% spread above T-Bills</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121222] shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Delta-Neutral Basis Spread</div>
          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 num-tabular">12.45% APY</div>
          <div className="text-xs text-slate-500 mt-1">Ethena sUSDe Perp Basis</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121222] shadow-xs">
          <div className="text-xs text-slate-500 font-medium">TradFi 3M Treasury (Fed)</div>
          <div className="text-xl font-bold font-mono text-slate-800 dark:text-slate-200 mt-1 num-tabular">4.88% APR</div>
          <div className="text-xs text-purple-600 dark:text-purple-400 mt-1 font-medium">
            RWA tokens yield +27 bps excess
          </div>
        </div>
      </div>

      {/* Macro Yield Curve & Interactive Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Yield Curve Multi-Line Chart */}
        <div className="lg:col-span-7 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121222] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Cross-Domain Macro Yield Curves
              </h2>
              <p className="text-xs text-slate-500">
                Comparing TradFi benchmark, Tokenized US T-Bills, DeFi money market, and Perp Basis yields.
              </p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={yieldCurveData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                <XAxis dataKey="maturity" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis unit="%" tick={{ fontSize: 10, fill: '#94a3b8' }} domain={[4, 14]} />
                <Tooltip
                  formatter={(val: any) => [`${val}% APY`, '']}
                  contentStyle={{ backgroundColor: '#1e1b4b', borderColor: '#4338ca', color: '#fff', fontSize: '11px', borderRadius: '8px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="Basis_Perp" name="Perp Basis (sUSDe)" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="DeFi_Lending" name="DeFi Prime (Aave)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="TBill_RWA" name="RWA T-Bills (USDY)" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Fed_Benchmark" name="Fed 3M Benchmark" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Net Basis Yield Calculator */}
        <div className="lg:col-span-5 p-5 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/30 dark:bg-[#16132b]/50 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-purple-100 dark:border-purple-900/40 pb-3">
            <div className="p-1.5 bg-purple-600 text-white rounded-lg">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Institutional Yield & Basis Calculator
              </h2>
              <p className="text-[11px] text-slate-500">
                Calculates net realized profit after gas, slippage, and redemption friction.
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300 font-semibold mb-1">
                <span>Select Strategy:</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {['USDY', 'aUSDC', 'sUSDe'].map((sym) => (
                  <button
                    key={sym}
                    onClick={() => setSelectedAsset(sym)}
                    className={`py-1.5 px-2 rounded-lg font-semibold border text-center transition ${
                      selectedAsset === sym
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-white dark:bg-[#1f1f33] border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300 font-semibold mb-1">
                <span>Capital Allocation:</span>
                <span className="font-mono text-purple-700 dark:text-purple-300 font-bold">
                  ${capitalUsd.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="10000"
                max="1000000"
                step="10000"
                value={capitalUsd}
                onChange={(e) => setCapitalUsd(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300 font-semibold mb-1">
                <span>Hold Duration (Days):</span>
                <span className="font-mono text-purple-700 dark:text-purple-300 font-bold">
                  {holdingDays} Days
                </span>
              </div>
              <div className="flex space-x-2">
                {[30, 90, 180, 365].map((d) => (
                  <button
                    key={d}
                    onClick={() => setHoldingDays(d)}
                    className={`flex-1 py-1 rounded text-[11px] font-semibold border ${
                      holdingDays === d
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white dark:bg-[#1a1a2e] border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            </div>

            {/* Net Realization Box */}
            <div className="p-3 bg-white dark:bg-[#141424] rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 pt-2.5">
              <div className="flex justify-between items-center text-slate-500">
                <span>Gross Accrued Interest:</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                  +${Math.round(grossYield).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Redemption & Gas Fees:</span>
                <span className="font-mono text-rose-500">
                  -${Math.round(redemptionFee + estimatedGasUsd)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-slate-100">
                <span>Net Realized Profit:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">
                  +${Math.round(netRealizedProfit).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono">
                <span>Effective Net APR:</span>
                <span className="text-purple-600 dark:text-purple-400 font-bold">
                  {effectiveAnnualizedApr.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Yield Strategy Directory Table */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Yield Strategies & Sovereign Counterparty Ratings
        </h2>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121222] shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#18182c] border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Yield Vehicle</th>
                <th className="py-3 px-4">Asset Class</th>
                <th className="py-3 px-4">Gross APY</th>
                <th className="py-3 px-4">Liquidity Latency</th>
                <th className="py-3 px-4">Counterparty Risk</th>
                <th className="py-3 px-4">Redemption Fee</th>
                <th className="py-3 px-4">Net 1Y Return ($100k)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {yields.map((row) => (
                <tr key={row.asset_symbol} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                    <div>{row.asset_name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{row.asset_symbol}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{row.category}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-purple-600 dark:text-purple-400 text-sm num-tabular">
                    {row.apy_pct}%
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 flex items-center space-x-1.5 pt-4">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{row.liquidity_latency}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        row.counterparty_risk === 'Ultra-Low'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                          : row.counterparty_risk === 'Low'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                      }`}
                    >
                      {row.counterparty_risk}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                    {row.redemption_fee_pct === 0 ? '0.0% (Zero Fee)' : `${row.redemption_fee_pct}%`}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm num-tabular">
                    +${row.net_yield_100k_1y.toLocaleString()}
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
