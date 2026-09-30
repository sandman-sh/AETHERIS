import React, { useState, useEffect } from 'react';
import {
  Flame,
  AlertOctagon,
  TrendingDown,
  TrendingUp,
  Activity,
  Zap,
  Info,
  Layers,
  ArrowRight,
  Download,
  Radio,
  RefreshCw
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { cmcApi } from '../../services/cmcApi';
import { DerivativeMarketData } from '../../types';
import { liveStreamService, LiveLiquidationEvent } from '../../services/liveStreamService';
import { exportCascadeRadarCsv } from '../../utils/dossierExport';

export const CascadeRadarView: React.FC = () => {
  const [derivatives, setDerivatives] = useState<DerivativeMarketData[]>([]);
  const [selectedToken, setSelectedToken] = useState<DerivativeMarketData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [liveLiqs, setLiveLiqs] = useState<LiveLiquidationEvent[]>([
    { id: 'l1', symbol: 'SOL', side: 'LONG_LIQ', amountUsd: 184500, price: 117.40, timestamp: 'Live' },
    { id: 'l2', symbol: 'BTC', side: 'SHORT_LIQ', amountUsd: 420000, price: 84420, timestamp: 'Live' },
    { id: 'l3', symbol: 'ETH', side: 'LONG_LIQ', amountUsd: 96000, price: 2690.10, timestamp: 'Live' }
  ]);

  const loadData = () => {
    setLoading(true);
    cmcApi.getDerivativeMarkets().then((res) => {
      setDerivatives(res);
      if (res.length > 0) setSelectedToken(res[0]);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();

    const unsubscribe = liveStreamService.subscribeLiquidations((newLiq) => {
      setLiveLiqs((prev) => [newLiq, ...prev.slice(0, 7)]);
    });

    return unsubscribe;
  }, []);

  const chartData = (derivatives || []).map((d) => ({
    name: d.symbol || 'UNK',
    cfi: typeof d.cascade_fragility_index === 'number' ? d.cascade_fragility_index : 50,
    status: d.fragility_status || 'STABLE',
    openInterest: Math.round((d.open_interest_usd || 0) / 1000000),
    liquidations: Math.round((d.liquidations_24h_usd || 0) / 1000000)
  }));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CRITICAL':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-800';
      case 'ELEVATED':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'MODERATE':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300 border-yellow-300 dark:border-yellow-800';
      default:
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 rounded-lg">
              <Flame className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              CascadeRadar: Derivative Liquidation Spiral & DEX Depth Fragility Scanner
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
            Monitors when perpetual contract liquidation clusters vastly outpace spot decentralized pool depth, triggering sudden cascade crashes. Powered by <span className="font-mono text-purple-600 dark:text-purple-400">/v5/derivatives/liquidations/</span> and <span className="font-mono text-purple-600 dark:text-purple-400">/v1/dex/token/pools</span>.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start md:self-center">
          <button
            onClick={() => exportCascadeRadarCsv(derivatives)}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md font-medium transition cursor-pointer"
            title="Export Liquidation Fragility Dataset to CSV"
          >
            <Download className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={loadData}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md font-medium transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Real-time Streaming Liquidation Pulse Bar */}
      <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#111122] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
          <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
          <span>LIVE FUTURES LIQUIDATION STREAM:</span>
        </div>
        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto text-[11px] font-mono">
          {liveLiqs.slice(0, 4).map((liq) => (
            <span
              key={liq.id}
              className={`px-2 py-0.5 rounded shrink-0 font-semibold border ${
                liq.side === 'LONG_LIQ'
                  ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900'
                  : 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900'
              }`}
            >
              {liq.symbol} {liq.side === 'LONG_LIQ' ? '🔻 Long Liq' : '🔺 Short Liq'} ${Math.round(liq.amountUsd).toLocaleString()}
            </span>
          ))}
        </div>
      </div>

      {/* Critical Early Warning Banner */}
      {derivatives.some((d) => d.fragility_status === 'CRITICAL') && (
        <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/80 bg-rose-50/80 dark:bg-rose-950/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-rose-600 text-white rounded-lg animate-pulse shrink-0">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider flex items-center space-x-2">
                <span>Severe Liquidation Cascade Threat Detected</span>
                <span className="bg-rose-200 dark:bg-rose-900 px-2 py-0.5 rounded text-[10px]">CFI &gt; 8.0x</span>
              </div>
              <p className="text-xs text-rose-700 dark:text-rose-200 mt-0.5">
                $SOL-PERP displays $42.8M in 24h liquidation clusters with a fragile spot depth ratio. Any 4% downward wick will overwhelm on-chain DEX bids.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              const sol = derivatives.find((d) => d.symbol === 'SOL');
              if (sol) setSelectedToken(sol);
            }}
            className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold px-3 py-1.5 rounded-lg transition shrink-0 flex items-center space-x-1.5"
          >
            <span>Inspect SOL Risk</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121222] shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Aggregated 24h Liquidations</div>
          <div className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1 num-tabular">$157.0 Million</div>
          <div className="text-xs text-slate-500 mt-1">74% Longs / 26% Shorts</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121222] shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Highest Fragility Coin</div>
          <div className="text-xl font-bold font-mono text-purple-600 dark:text-purple-400 mt-1">SOL (8.74x CFI)</div>
          <div className="text-xs text-rose-500 mt-1 font-medium">Critical Fragility Level</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121222] shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Annualized Funding Skew</div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1 num-tabular">+14.8% APR</div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium flex items-center space-x-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Heavy Long Leverage Demand</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121222] shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Total Open Interest Tracked</div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1 num-tabular">$24.23 Billion</div>
          <div className="text-xs text-slate-500 mt-1">Across 4 major CEX venues</div>
        </div>
      </div>

      {/* Fragility Index Visualizer & Selected Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Fragility Comparison Chart */}
        <div className="lg:col-span-7 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121222] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Cascade Fragility Index (CFI) Comparison
              </h2>
              <p className="text-xs text-slate-500">
                Formula: Clustered Liquidations (±5% spot) ÷ On-Chain DEX Pool Liquidity
              </p>
            </div>
            <div className="flex items-center space-x-2 text-[11px]">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                <span>Critical (&gt;6x)</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                <span>Stable (&lt;3x)</span>
              </span>
            </div>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis unit="x" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  formatter={(val: any) => [`${val}x CFI`, 'Cascade Fragility']}
                  contentStyle={{ backgroundColor: '#1e1b4b', borderColor: '#4338ca', color: '#fff', fontSize: '11px', borderRadius: '8px' }}
                />
                <Bar dataKey="cfi" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.cfi > 6 ? '#ef4444' : entry.cfi > 3 ? '#f59e0b' : '#10b981'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Selected Asset Deep Dive */}
        <div className="lg:col-span-5 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121222] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <div className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <span>{selectedToken?.symbol} Derivative Dossier</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getStatusBadge(selectedToken?.fragility_status || '')}`}>
                  {selectedToken?.fragility_status}
                </span>
              </div>
              <div className="text-xs text-slate-500">{selectedToken?.derivative_pair} ({selectedToken?.exchange})</div>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500">Cascade Fragility Index:</span>
              <span className="font-mono font-bold text-sm text-purple-600 dark:text-purple-400">
                {selectedToken?.cascade_fragility_index}x
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500">24h Clustered Liquidations:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                ${(Number(selectedToken?.liquidations_24h_usd) / 1000000).toFixed(1)}M
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500">Long vs Short Liquidation Vol:</span>
              <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                ${(Number(selectedToken?.long_liquidation_vol_usd) / 1000000).toFixed(1)}M / ${(Number(selectedToken?.short_liquidation_vol_usd) / 1000000).toFixed(1)}M
              </span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500">Annualized Funding Rate:</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                +{selectedToken?.annualized_funding_rate_pct}% APR
              </span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-slate-500">Total Open Interest:</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                ${(Number(selectedToken?.open_interest_usd) / 1000000).toLocaleString()}M
              </span>
            </div>
          </div>

          <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-lg border border-purple-200 dark:border-purple-800/60 text-xs text-purple-900 dark:text-purple-200">
            <strong>Arbitrage Playbook:</strong> High positive funding rate ({selectedToken?.annualized_funding_rate_pct}%) enables a delta-neutral Cash &amp; Carry trade: Short the perpetual while buying spot on-chain.
          </div>
        </div>
      </div>

      {/* Derivative Surveillance Table */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Cross-Venue Perpetual Market Surveillance
        </h2>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121222] shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#18182c] border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Market Symbol</th>
                <th className="py-3 px-4">Venue Source</th>
                <th className="py-3 px-4">Perp Price</th>
                <th className="py-3 px-4">Spot Basis</th>
                <th className="py-3 px-4">Open Interest</th>
                <th className="py-3 px-4">Funding Rate (Ann.)</th>
                <th className="py-3 px-4">24h Liquidations</th>
                <th className="py-3 px-4">Cascade Fragility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {derivatives.map((item) => (
                <tr
                  key={item.symbol}
                  onClick={() => setSelectedToken(item)}
                  className={`cursor-pointer transition hover:bg-purple-50/50 dark:hover:bg-purple-950/20 ${
                    selectedToken?.symbol === item.symbol ? 'bg-purple-50/80 dark:bg-purple-950/40' : ''
                  }`}
                >
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                    <div>{item.symbol}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{item.derivative_pair}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{item.exchange}</td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 dark:text-slate-100 num-tabular">
                    ${item.perpetual_price.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-emerald-600 dark:text-emerald-400 num-tabular">
                    +{item.basis_pct}%
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-800 dark:text-slate-200 num-tabular">
                    ${(item.open_interest_usd / 1000000).toLocaleString()}M
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-purple-600 dark:text-purple-400 num-tabular">
                    +{item.annualized_funding_rate_pct}%
                  </td>
                  <td className="py-3.5 px-4 font-mono text-rose-600 dark:text-rose-400 num-tabular">
                    ${(item.liquidations_24h_usd / 1000000).toFixed(1)}M
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getStatusBadge(item.fragility_status)}`}>
                      {item.cascade_fragility_index}x • {item.fragility_status}
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
