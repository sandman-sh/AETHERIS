import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Building2,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  Sliders,
  ExternalLink,
  Lock,
  Download,
  FileText,
  Star
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { cmcApi } from '../../services/cmcApi';
import { RwaAsset, RwaIssuer, DexLiquidityPool } from '../../types';
import { exportVeritasRwaCsv, openPrintableDossierWindow } from '../../utils/dossierExport';
import { useAlerts } from '../../context/AlertsContext';

export const VeritasRwaView: React.FC = () => {
  const [assets, setAssets] = useState<RwaAsset[]>([]);
  const [issuers, setIssuers] = useState<RwaIssuer[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedAsset, setSelectedAsset] = useState<RwaAsset | null>(null);
  const [exitOrderUsd, setExitOrderUsd] = useState<number>(500000);
  const [pools, setPools] = useState<DexLiquidityPool[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    const [fetchedAssets, fetchedIssuers] = await Promise.all([
      cmcApi.getRwaAssets(selectedType),
      cmcApi.getRwaIssuers()
    ]);
    setAssets(fetchedAssets);
    setIssuers(fetchedIssuers);
    if (!selectedAsset && fetchedAssets.length > 0) {
      setSelectedAsset(fetchedAssets[0]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [selectedType]);

  useEffect(() => {
    const handleSelectAsset = (e: Event) => {
      const customEvent = e as CustomEvent<{ symbol?: string }>;
      const sym = customEvent.detail?.symbol?.toUpperCase();
      if (!sym) return;
      const match = assets.find(
        (a) => a.symbol.toUpperCase() === sym || a.name.toLowerCase().includes(sym.toLowerCase())
      );
      if (match) {
        setSelectedAsset(match);
      }
    };

    const handleFilter = (e: Event) => {
      const customEvent = e as CustomEvent<{ filter?: string }>;
      const filter = customEvent.detail?.filter;
      if (filter) {
        setSelectedType(filter);
      }
    };

    const handleExitOrder = (e: Event) => {
      const customEvent = e as CustomEvent<{ amount?: number }>;
      const amount = Number(customEvent.detail?.amount);
      if (!isNaN(amount) && amount > 0) {
        setExitOrderUsd(amount);
      }
    };

    window.addEventListener('kimo:rwa_asset', handleSelectAsset);
    window.addEventListener('kimo:rwa_filter', handleFilter);
    window.addEventListener('kimo:exit_order', handleExitOrder);

    return () => {
      window.removeEventListener('kimo:rwa_asset', handleSelectAsset);
      window.removeEventListener('kimo:rwa_filter', handleFilter);
      window.removeEventListener('kimo:exit_order', handleExitOrder);
    };
  }, [assets]);

  useEffect(() => {
    if (selectedAsset) {
      cmcApi.getDexPoolsForAsset(selectedAsset.symbol).then((res) => {
        setPools(res);
      });
    }
  }, [selectedAsset]);

  // Calculate dynamic simulated slippage curve
  const calculateSlippage = (orderUsd: number, poolLiquidity: number) => {
    if (!poolLiquidity || poolLiquidity <= 0) return 0;
    const ratio = orderUsd / poolLiquidity;
    // Constant product XYK simulated impact model
    const slippage = (ratio / (1 + ratio)) * 100 * 1.5;
    return Number(slippage.toFixed(2));
  };

  const currentPoolLiquidity = selectedAsset?.onchain_dex_liquidity_usd || 15000000;
  const currentSlippage = calculateSlippage(exitOrderUsd, currentPoolLiquidity);

  // Generate curve data points for Recharts
  const curveData = [
    { order: '$50k', slippage: calculateSlippage(50000, currentPoolLiquidity) },
    { order: '$100k', slippage: calculateSlippage(100000, currentPoolLiquidity) },
    { order: '$250k', slippage: calculateSlippage(250000, currentPoolLiquidity) },
    { order: '$500k', slippage: calculateSlippage(500000, currentPoolLiquidity) },
    { order: '$1M', slippage: calculateSlippage(1000000, currentPoolLiquidity) },
    { order: '$2M', slippage: calculateSlippage(2000000, currentPoolLiquidity) },
    { order: '$5M', slippage: calculateSlippage(5000000, currentPoolLiquidity) }
  ];

  const { isWatchlisted, toggleWatchlist } = useAlerts();

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              VeritasRWA: Sovereign Solvency & Secondary Liquidity Auditor
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
            Stress-testing Real World Assets by cross-referencing CoinMarketCap RWA valuations (<span className="font-mono text-purple-600 dark:text-purple-400">/v5/real-world-assets/</span>) with on-chain DEX secondary pool depth (<span className="font-mono text-purple-600 dark:text-purple-400">/v1/dex/token/pools</span>) and legal issuer solvency.
          </p>
        </div>

        <div className="flex items-center space-x-2 self-start md:self-center">
          <button
            onClick={() => {
              if (selectedAsset) {
                exportVeritasRwaCsv({
                  asset: selectedAsset,
                  issuer: issuers.find((i) => i.issuer_id === selectedAsset.issuer_id),
                  pools,
                  exitOrderUsd,
                  slippagePct: currentSlippage,
                  curveData
                });
              }
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md font-medium transition cursor-pointer"
            title="Export Stress-Test Dataset to CSV"
          >
            <Download className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              if (selectedAsset) {
                openPrintableDossierWindow({
                  asset: selectedAsset,
                  issuer: issuers.find((i) => i.issuer_id === selectedAsset.issuer_id),
                  pools,
                  exitOrderUsd,
                  slippagePct: currentSlippage,
                  curveData
                });
              }
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded-md font-bold transition shadow-xs cursor-pointer"
            title="Generate Institutional PDF Audit Dossier"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Institutional PDF</span>
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

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121222] shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Tracked RWA TVL</div>
          <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1 num-tabular">$12.45 Billion</div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center space-x-1 mt-1 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.4% this quarter</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121222] shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Primary Secondary Liquidity</div>
          <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1 num-tabular">$142.8 Million</div>
          <div className="text-xs text-purple-600 dark:text-purple-400 mt-1 font-medium">
            Across Uniswap v3 & Curve Pools
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121222] shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Average US T-Bill RWA Yield</div>
          <div className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1 num-tabular">5.12% APY</div>
          <div className="text-xs text-slate-500 mt-1 font-medium">
            Backed by short-duration treasuries
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121222] shadow-xs">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Regulated Issuers Verified</div>
          <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1 num-tabular">48 Issuers</div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium flex items-center space-x-1">
            <Lock className="w-3 h-3" />
            <span>100% Custodian Audited</span>
          </div>
        </div>
      </div>

      {/* Interactive Exit Liquidity Stress-Tester */}
      <div className="p-5 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/40 dark:bg-[#16132b]/60 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-600 text-white rounded-lg shadow-xs">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <span>Institutional Exit Slippage Stress-Tester</span>
                <span className="bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded">
                  CMC PRO ON-CHAIN ENGINE
                </span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Simulate emergency liquidations outside traditional T+2 banking redemption windows to gauge real DEX price impact.
              </p>
            </div>
          </div>

          {/* Asset Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Target Asset:</span>
            <select
              value={selectedAsset?.symbol}
              onChange={(e) => {
                const found = assets.find((a) => a.symbol === e.target.value);
                if (found) setSelectedAsset(found);
              }}
              className="text-xs font-medium bg-white dark:bg-[#1f1f33] border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-purple-500"
            >
              {assets.map((a) => (
                <option key={a.rwa_id} value={a.symbol}>
                  {a.symbol} — {a.name}
                </option>
              ))}
            </select>

            {selectedAsset && (
              <button
                onClick={() => toggleWatchlist(selectedAsset.symbol)}
                className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 transition cursor-pointer"
                title={isWatchlisted(selectedAsset.symbol) ? 'Remove from Watchlist' : 'Add to Watchlist'}
              >
                <Star
                  className={`w-4 h-4 ${
                    isWatchlisted(selectedAsset.symbol)
                      ? 'fill-amber-400 text-amber-500'
                      : 'text-slate-400'
                  }`}
                />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Controls & Metrics */}
          <div className="lg:col-span-6 space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Instant Exit Order Size (USD):
                </span>
                <span className="font-mono text-purple-700 dark:text-purple-300 font-bold text-sm">
                  ${exitOrderUsd.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="10000"
                max="5000000"
                step="25000"
                value={exitOrderUsd}
                onChange={(e) => setExitOrderUsd(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                <span>$10,000 (Base)</span>
                <span>$1,000,000 (Tier-1)</span>
                <span>$2,500,000 (Fund)</span>
                <span>$5,000,000 (Sovereign Cap)</span>
              </div>
            </div>

            {/* Impact Calculation Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-white dark:bg-[#1a1a2e] border border-slate-200 dark:border-slate-800">
                <div className="text-[11px] text-slate-500">Projected Slippage</div>
                <div
                  className={`text-lg font-bold font-mono mt-0.5 ${
                    currentSlippage > 3 ? 'text-rose-600 dark:text-rose-400' : 'text-purple-600 dark:text-purple-400'
                  }`}
                >
                  {currentSlippage}%
                </div>
              </div>

              <div className="p-3 rounded-lg bg-white dark:bg-[#1a1a2e] border border-slate-200 dark:border-slate-800">
                <div className="text-[11px] text-slate-500">Value Realization</div>
                <div className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
                  ${Math.round(exitOrderUsd * (1 - currentSlippage / 100)).toLocaleString()}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-white dark:bg-[#1a1a2e] border border-slate-200 dark:border-slate-800">
                <div className="text-[11px] text-slate-500">Secondary Pool Depth</div>
                <div className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100 mt-0.5">
                  ${(currentPoolLiquidity / 1000000).toFixed(1)}M
                </div>
              </div>
            </div>

            {currentSlippage > 3.0 && (
              <div className="flex items-center space-x-2 text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  High slippage penalty ({currentSlippage}%). Institutional redemption directly through {selectedAsset?.issuer_name} (T+1) recommended for orders above $500k.
                </span>
              </div>
            )}
          </div>

          {/* Slippage Impact Curve Chart */}
          <div className="lg:col-span-6 bg-white dark:bg-[#1a1a2e] p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
              <span>Non-Linear DEX Slippage Curve</span>
              <span className="text-[11px] text-slate-400 font-mono">{selectedAsset?.symbol} Pools</span>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={curveData}>
                  <defs>
                    <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="order" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis unit="%" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Tooltip
                    formatter={(val: any) => [`${val}%`, 'Slippage']}
                    contentStyle={{ backgroundColor: '#1e1b4b', borderColor: '#4338ca', color: '#fff', fontSize: '11px', borderRadius: '8px' }}
                  />
                  <Area type="monotone" dataKey="slippage" stroke="#7c3aed" strokeWidth={2.5} fill="url(#purpleGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Main RWA Screener Table */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
            {['all', 'government_security', 'stock', 'commodity'].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition capitalize whitespace-nowrap ${
                  selectedType === t
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {t === 'all' ? 'All Asset Classes' : t.replace('_', ' ')}
              </button>
            ))}
          </div>
          <div className="text-xs text-slate-500 font-mono">
            Showing {assets.length} institutional assets
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121222] shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#18182c] border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Asset & Symbol</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Price (USD)</th>
                <th className="py-3 px-4">24h Change</th>
                <th className="py-3 px-4">Market Cap</th>
                <th className="py-3 px-4">Secondary DEX Liq</th>
                <th className="py-3 px-4">Proof of Reserve</th>
                <th className="py-3 px-4">Sovereign Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {assets.map((asset) => (
                <tr
                  key={asset.rwa_id}
                  onClick={() => setSelectedAsset(asset)}
                  className={`cursor-pointer transition hover:bg-purple-50/50 dark:hover:bg-purple-950/20 ${
                    selectedAsset?.rwa_id === asset.rwa_id ? 'bg-purple-50/80 dark:bg-purple-950/40' : ''
                  }`}
                >
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 dark:text-slate-100">{asset.name}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center space-x-1.5">
                      <span>{asset.symbol}</span>
                      <span>•</span>
                      <span>{asset.primary_chain}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-[10px] font-semibold border border-slate-200 dark:border-slate-700 uppercase">
                      {asset.asset_type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 dark:text-slate-100 num-tabular">
                    ${asset.price_usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold num-tabular">
                    <span
                      className={
                        asset.change_24h_pct >= 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }
                    >
                      {asset.change_24h_pct >= 0 ? `+${asset.change_24h_pct}%` : `${asset.change_24h_pct}%`}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-800 dark:text-slate-200 num-tabular">
                    ${(asset.market_cap_usd / 1000000).toFixed(1)}M
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300 num-tabular">
                    ${(asset.onchain_dex_liquidity_usd / 1000000).toFixed(2)}M
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{asset.backed_reserve_proof_pct}% Backed</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold px-2 py-0.5 rounded text-[11px] border border-purple-200 dark:border-purple-800">
                      {asset.sovereign_risk_rating}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Regulated Issuer Roster Table */}
      <div className="space-y-3 pt-2">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-purple-600" />
            <span>Regulated Issuer Registry & Custodian Disclosures</span>
          </h2>
          <p className="text-xs text-slate-500">
            Source: CoinMarketCap Pro Issuer Endpoints (<span className="font-mono text-purple-600 dark:text-purple-400">/v5/real-world-assets/issuers</span>)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {issuers.map((issuer) => (
            <div
              key={issuer.issuer_id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#141424] space-y-2.5 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center space-x-1.5">
                    <span>{issuer.name}</span>
                    {issuer.verified_status && <ShieldCheck className="w-4 h-4 text-emerald-500" />}
                  </h3>
                  <div className="text-[11px] text-slate-500">{issuer.jurisdiction}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400">Safety Score</div>
                  <div className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {issuer.counterparty_risk_score} / 100
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100 dark:border-slate-800/80">
                <div>
                  <span className="text-slate-400 text-[11px]">Custodian:</span>
                  <div className="font-medium text-slate-700 dark:text-slate-200">{issuer.custodian}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Auditing Firm:</span>
                  <div className="font-medium text-slate-700 dark:text-slate-200">{issuer.audit_firm}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Total AUM:</span>
                  <div className="font-mono font-medium text-slate-700 dark:text-slate-200">
                    ${(issuer.total_assets_under_management_usd / 1000000).toLocaleString()}M
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Redemption Cycle:</span>
                  <div className="font-medium text-purple-600 dark:text-purple-400">{issuer.redemption_cycle}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
