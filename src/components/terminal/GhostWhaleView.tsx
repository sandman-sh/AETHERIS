import React, { useState, useEffect } from 'react';
import {
  Radar,
  Eye,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Search,
  CheckCircle,
  Copy,
  ExternalLink
} from 'lucide-react';
import { cmcApi } from '../../services/cmcApi';
import { DexTrendingAnalysis } from '../../types';

export const GhostWhaleView: React.FC = () => {
  const [tokens, setTokens] = useState<DexTrendingAnalysis[]>([]);
  const [selectedToken, setSelectedToken] = useState<DexTrendingAnalysis | null>(null);
  const [filter, setFilter] = useState<'all' | 'verified' | 'suspicious'>('all');
  const [copiedAddr, setCopiedAddr] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    cmcApi.getTrendingDex().then((res) => {
      setTokens(res);
      if (res.length > 0) setSelectedToken(res[0]);
      setLoading(false);
    });
  }, []);

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddr(address);
    setTimeout(() => setCopiedAddr(null), 2000);
  };

  const filteredTokens = tokens.filter((t) => {
    if (filter === 'verified') return t.security_flag === 'VERIFIED';
    if (filter === 'suspicious') return t.security_flag === 'SUSPICIOUS_VOLUME';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 rounded-lg">
            <Radar className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            GhostWhale: Multi-Chain DEX Smart Money &amp; Wash-Trading Sentinel
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
          Automated forensic surveillance of trending on-chain decentralized liquidity pools. Detects synthetic bot wash-trading, whale concentration, and organic smart money accumulation using <span className="font-mono text-purple-600 dark:text-purple-400">/v1/dex/tokens/trending/list</span> and <span className="font-mono text-purple-600 dark:text-purple-400">/v1/dex/holders/detail</span>.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121222] shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Scanned Trending Pools</div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1 num-tabular">1,420 Pools</div>
          <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">Across Solana, Base, Arbitrum</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121222] shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Flagged Wash Trading Pools</div>
          <div className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1 num-tabular">28.4%</div>
          <div className="text-xs text-rose-500 mt-1">Abnormal Vol/Liquidity &gt; 25x</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121222] shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Organic Whale Inflows</div>
          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 num-tabular">$48.2 Million</div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Verified low-Gini distribution</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121222] shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Forensic Algorithm Status</div>
          <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1 flex items-center space-x-1.5">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <span>Active v4.2</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">Autonomous MCP watcher</div>
        </div>
      </div>

      {/* Selected Token Forensic Inspection */}
      {selectedToken && (
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121222] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <span>{selectedToken.token_name} ({selectedToken.token_symbol})</span>
                <span className="text-xs font-mono bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded">
                  {selectedToken.chain}
                </span>
              </div>
              <div className="text-xs text-slate-500 font-mono mt-0.5 flex items-center space-x-2">
                <span>Contract: {selectedToken.contract_address ? selectedToken.contract_address.slice(0, 10) : ''}...</span>
                <button
                  onClick={() => handleCopy(selectedToken.contract_address)}
                  className="hover:text-purple-600 dark:hover:text-purple-400 transition"
                  title="Copy Address"
                >
                  <Copy className="w-3.5 h-3.5 inline" />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  selectedToken.security_flag === 'VERIFIED'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                }`}
              >
                {selectedToken.security_flag === 'VERIFIED' ? 'ORGANIC VERIFIED' : 'HIGH WASH PROBABILITY'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-50 dark:bg-[#18182c] rounded-xl border border-slate-200 dark:border-slate-800/80">
              <div className="text-slate-500">Organic Trust Score</div>
              <div className="text-xl font-bold font-mono text-purple-600 dark:text-purple-400 mt-1">
                {selectedToken.organic_trust_score} / 100
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Based on wallet entropy</div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-[#18182c] rounded-xl border border-slate-200 dark:border-slate-800/80">
              <div className="text-slate-500">Wash Trading Probability</div>
              <div
                className={`text-xl font-bold font-mono mt-1 ${
                  selectedToken.wash_trading_probability_pct > 50
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {selectedToken.wash_trading_probability_pct}%
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Repeat transaction loops</div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-[#18182c] rounded-xl border border-slate-200 dark:border-slate-800/80">
              <div className="text-slate-500">Vol / Liquidity Ratio</div>
              <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
                {selectedToken.vol_to_liq_ratio}x
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">&gt;20x indicates bot churn</div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-[#18182c] rounded-xl border border-slate-200 dark:border-slate-800/80">
              <div className="text-slate-500">Smart Whale Inflow</div>
              <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                {selectedToken.insider_accumulation_detected ? 'Accumulation Detected' : 'No Organic Inflows'}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Net cluster balance change</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Trending Multi-Chain DEX Forensic Leaderboard
          </h2>
          <div className="flex space-x-2 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md font-medium transition ${
                filter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              All Pools
            </button>
            <button
              onClick={() => setFilter('verified')}
              className={`px-3 py-1 rounded-md font-medium transition ${
                filter === 'verified'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Organic Only
            </button>
            <button
              onClick={() => setFilter('suspicious')}
              className={`px-3 py-1 rounded-md font-medium transition ${
                filter === 'suspicious'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              Suspicious Only
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121222] shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#18182c] border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Trending Pair</th>
                <th className="py-3 px-4">Chain</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">24h Volume</th>
                <th className="py-3 px-4">Pool Liquidity</th>
                <th className="py-3 px-4">Vol / Liq Ratio</th>
                <th className="py-3 px-4">Wash Risk %</th>
                <th className="py-3 px-4">Forensic Trust Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredTokens.map((item) => (
                <tr
                  key={item.token_symbol}
                  onClick={() => setSelectedToken(item)}
                  className={`cursor-pointer transition hover:bg-purple-50/50 dark:hover:bg-purple-950/20 ${
                    selectedToken?.token_symbol === item.token_symbol ? 'bg-purple-50/80 dark:bg-purple-950/40' : ''
                  }`}
                >
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                    <div>{item.token_name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{item.token_symbol}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{item.chain}</td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 dark:text-slate-100 num-tabular">
                    ${item.price_usd.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-800 dark:text-slate-200 num-tabular">
                    ${(item.volume_24h_usd / 1000000).toFixed(2)}M
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-800 dark:text-slate-200 num-tabular">
                    ${(item.liquidity_usd / 1000000).toFixed(2)}M
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold num-tabular">
                    <span className={item.vol_to_liq_ratio > 20 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}>
                      {item.vol_to_liq_ratio}x
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold num-tabular">
                    <span className={item.wash_trading_probability_pct > 50 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                      {item.wash_trading_probability_pct}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        item.security_flag === 'VERIFIED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                      }`}
                    >
                      {item.security_flag}
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
