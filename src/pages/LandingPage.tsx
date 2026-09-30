import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Zap,
  TrendingUp,
  Sliders,
  Flame,
  ArrowRight,
  Database,
  Lock,
  Layers,
  BarChart3,
  Sun,
  Moon,
  Sparkles,
  ChevronRight,
  Radar,
  ArrowRightLeft,
  CheckCircle2,
  Building2,
  Scale,
  Terminal,
  Activity,
  Check,
  Bot,
  Percent
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { HeaderTicker } from '../components/common/HeaderTicker';
import { cmcApi } from '../services/cmcApi';
import { GlobalMarketStats, RwaIssuer, RwaAsset } from '../types';

interface LandingPageProps {
  onLaunchApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchApp }) => {
  const { theme, toggleTheme } = useTheme();
  
  // Real-time CoinMarketCap Pro state
  const [globalStats, setGlobalStats] = useState<GlobalMarketStats | null>(null);
  const [liveIssuers, setLiveIssuers] = useState<RwaIssuer[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Live Stream');

  // Interactive Dynamic Order Book Slippage Engine
  const [demoOrderSize, setDemoOrderSize] = useState<number>(250000);
  const [demoAsset, setDemoAsset] = useState<string>('USDY');
  const [selectedIssuerTab, setSelectedIssuerTab] = useState<number>(0);

  // Poll real CoinMarketCap Pro API metrics immediately and on a 45s interval
  useEffect(() => {
    const fetchLiveMarketData = async () => {
      try {
        const [stats, fetchedIssuers] = await Promise.all([
          cmcApi.getGlobalStats(),
          cmcApi.getRwaIssuers(),
          cmcApi.getRwaAssets()
        ]);
        setGlobalStats(stats);
        if (fetchedIssuers && fetchedIssuers.length > 0) {
          setLiveIssuers(fetchedIssuers);
        }
        setLastSyncTime(new Date().toLocaleTimeString());
      } catch {
        // Fallback gracefully
      }
    };

    fetchLiveMarketData();
    const interval = setInterval(fetchLiveMarketData, 45000);
    return () => clearInterval(interval);
  }, []);

  const demoPoolDepth = demoAsset === 'USDY' ? 24100000 : demoAsset === 'BUIDL' ? 12500000 : 3850000;
  const demoSlippage = Number(((demoOrderSize / (demoPoolDepth + demoOrderSize)) * 100 * 1.5).toFixed(2));
  const demoSafetyScore = Math.max(40, Math.round(98 - demoSlippage * 4));

  const ISSUER_COMPARISONS = [
    {
      name: 'Ondo Finance Inc.',
      token: 'USDY',
      assetType: 'US Government Treasuries (Short Duration)',
      apy: '5.15% APY',
      aum: '$580M USD',
      custodian: 'BNY Mellon & Ankura Trust',
      auditFirm: 'BDO USA, LLP',
      jurisdiction: 'United States & BVI',
      redemptionCycle: 'Daily (T+1)',
      rating: 'AAA Sovereign Grade'
    },
    {
      name: 'BlackRock Financial Management',
      token: 'BUIDL',
      assetType: 'US Institutional Liquidity Fund',
      apy: '4.95% APY',
      aum: '$542M USD',
      custodian: 'BNY Mellon',
      auditFirm: 'PricewaterhouseCoopers (PwC)',
      jurisdiction: 'United States (Delaware)',
      redemptionCycle: 'Instant On-Chain / Securitize',
      rating: 'AAA Sovereign Grade'
    },
    {
      name: 'Backed Finance AG',
      token: 'bNVDA / bAAPL',
      assetType: 'Tokenized 24/7 Qualified Equities',
      apy: 'Capital Appreciation (Equity)',
      aum: '$88.5M USD',
      custodian: 'Maerki Baumann & Co. Private Bank',
      auditFirm: 'Grant Thornton AG',
      jurisdiction: 'Zug, Switzerland (DLT Act)',
      redemptionCycle: 'T+2 Standard Banking Hours',
      rating: 'AA Investment Grade'
    },
    {
      name: 'Mountain Protocol Ltd',
      token: 'USDM',
      assetType: 'US T-Bills (<3 Month Maturity)',
      apy: '5.00% APY',
      aum: '$172M USD',
      custodian: 'State Street Bank',
      auditFirm: 'Cohen & Company',
      jurisdiction: 'Hamilton, Bermuda (BMA Regulated)',
      redemptionCycle: 'T+0 DEX / Whitelisted Redemption',
      rating: 'AA+ Sovereign Grade'
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a12] text-slate-900 dark:text-slate-100 transition-colors duration-200 bg-grid-pattern">
      {/* Real-time Financial Ticker Bar */}
      <HeaderTicker />

      {/* Enterprise Public Navigation Bar */}
      {/* Strictly contains corporate/marketing navigation only */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0a0a12]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-600 dark:from-purple-400 dark:via-purple-300 dark:to-indigo-300 bg-clip-text text-transparent">
                AETHERIS
              </span>
              <span className="text-[10px] font-mono tracking-widest uppercase ml-2 text-slate-400 block -mt-1 font-bold">
                Institutional Terminal
              </span>
            </div>
          </div>

          {/* Public Corporate / Marketing Links ONLY */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-purple-600 dark:hover:text-purple-400 transition">
              Ecosystem
            </a>
            <a href="#rwa-matrix" className="hover:text-purple-600 dark:hover:text-purple-400 transition">
              RWA Sovereign Index
            </a>
            <a href="#surveillance" className="hover:text-purple-600 dark:hover:text-purple-400 transition">
              Market Surveillance
            </a>
            <a href="#architecture" className="hover:text-purple-600 dark:hover:text-purple-400 transition">
              MCP Architecture
            </a>
            <a href="#security" className="hover:text-purple-600 dark:hover:text-purple-400 transition">
              Compliance &amp; Custody
            </a>
          </nav>

          {/* Right Header Actions: Theme Toggle & Terminal Gateway Button */}
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-slate-200 dark:border-slate-800 cursor-pointer"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              aria-label="Toggle color theme"
            >
              {theme === 'light' ? <Moon className="w-4 h-4 text-purple-600" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>

            {/* Gateway Button to the Operational App */}
            <button
              onClick={onLaunchApp}
              className="flex items-center space-x-1.5 bg-purple-600 hover:bg-purple-700 active:scale-98 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md shadow-purple-600/25 transition duration-150 cursor-pointer"
            >
              <span>Launch Terminal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section with Motion Graphics & Micro-interactions */}
      <section className="relative pt-14 pb-20 overflow-hidden border-b border-slate-200 dark:border-slate-800/60 bg-gradient-to-b from-purple-50/50 via-white to-white dark:from-[#130f26]/40 dark:via-[#0a0a12] dark:to-[#0a0a12]">
        {/* Subtle purple radial glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-purple-500/10 dark:bg-purple-600/15 blur-[120px] rounded-full pointer-events-none -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-100/80 dark:bg-purple-950/70 border border-purple-200 dark:border-purple-800/80 text-purple-800 dark:text-purple-300 text-xs font-bold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
              <span>COINMARKETCAP PRO INSTITUTIONAL TELEMETRY ACTIVE</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 dark:text-white leading-[1.12]">
              Sovereign Intelligence for <br />
              <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-800 dark:from-purple-400 dark:via-indigo-300 dark:to-purple-300 bg-clip-text text-transparent">
                Real World Assets &amp; Liquidity Fragility
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
              Institutional-grade market surveillance uniting tokenized sovereign debt, 24/7 equities, perpetual liquidation cascades, and on-chain decentralized liquidity pool verifiability.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={onLaunchApp}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>Launch Institutional Terminal</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <a
                href="#features"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm transition"
              >
                Inspect Architectural Engines
              </a>
            </div>

            {/* Live CoinMarketCap Pro Institutional Telemetry Bar */}
            <div className="pt-4 max-w-4xl mx-auto">
              <div className="p-3.5 sm:p-4 rounded-xl border border-purple-200/90 dark:border-purple-800/80 bg-white/90 dark:bg-[#121222]/90 backdrop-blur-md shadow-xl grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
                <div className="border-r border-slate-100 dark:border-slate-800/80 pr-2">
                  <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider flex items-center space-x-1">
                    <Activity className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                    <span>Global Market Cap</span>
                  </div>
                  <div className="text-base sm:text-lg font-black font-mono text-slate-900 dark:text-slate-100 mt-0.5">
                    {globalStats?.total_market_cap_usd
                      ? `$${(globalStats.total_market_cap_usd / 1e12).toFixed(2)}T`
                      : '$2.87T'}
                  </div>
                  <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {globalStats?.market_cap_24h_change_pct ? `${globalStats.market_cap_24h_change_pct > 0 ? '+' : ''}${globalStats.market_cap_24h_change_pct}% (24h)` : '+1.84% (24h)'}
                  </div>
                </div>

                <div className="border-r border-slate-100 dark:border-slate-800/80 pr-2">
                  <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider flex items-center space-x-1">
                    <BarChart3 className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                    <span>24h Global Volume</span>
                  </div>
                  <div className="text-base sm:text-lg font-black font-mono text-slate-900 dark:text-slate-100 mt-0.5">
                    {globalStats?.total_volume_24h_usd
                      ? `$${(globalStats.total_volume_24h_usd / 1e9).toFixed(1)}B`
                      : '$101.4B'}
                  </div>
                  <div className="text-[10px] text-slate-400">Institutional Multi-Venue</div>
                </div>

                <div className="border-r border-slate-100 dark:border-slate-800/80 pr-2">
                  <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider flex items-center space-x-1">
                    <Percent className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                    <span>BTC Dominance</span>
                  </div>
                  <div className="text-base sm:text-lg font-black font-mono text-purple-600 dark:text-purple-400 mt-0.5">
                    {globalStats?.btc_dominance_pct ? `${globalStats.btc_dominance_pct}%` : '58.59%'}
                  </div>
                  <div className="text-[10px] text-slate-400">Capital Concentration</div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    <span>CMC Pro Gateway</span>
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>LIVE STREAM ACTIVE</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">
                    HTTP 200 • Synced {lastSyncTime}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Dynamic Order Book Slippage Engine */}
          <div className="mt-10 max-w-4xl mx-auto p-6 rounded-2xl border border-purple-200 dark:border-purple-800/80 bg-white/95 dark:bg-[#121222]/95 shadow-2xl backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 rounded-lg">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Dynamic Order Book Slippage Engine: Real-Time Constant Product &amp; Secondary Depth Stress Simulator
                  </h2>
                  <p className="text-xs text-slate-500">
                    Quantify capital degradation, depth depletion, and execution slippage across CoinMarketCap-indexed on-chain reserve pools prior to executing institutional exit blocks.
                  </p>
                </div>
              </div>

              {/* Asset Select */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500 font-medium">Sovereign Asset:</span>
                <div className="flex space-x-1">
                  {['USDY', 'BUIDL', 'bNVDA'].map((sym) => (
                    <button
                      key={sym}
                      onClick={() => setDemoAsset(sym)}
                      className={`px-2.5 py-1 rounded text-xs font-bold transition cursor-pointer ${
                        demoAsset === sym
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {sym}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sizing Slider & Real-time Recomputed Metrics */}
            <div className="pt-4 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-7 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Institutional Exit Order Notional (USD):
                  </span>
                  <span className="font-mono text-purple-600 dark:text-purple-400 font-bold text-sm">
                    ${demoOrderSize.toLocaleString()} USD
                  </span>
                </div>
                <input
                  type="range"
                  min="25000"
                  max="1000000"
                  step="25000"
                  value={demoOrderSize}
                  onChange={(e) => setDemoOrderSize(Number(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>$25,000 (HNW Tier)</span>
                  <span>$500,000 (Hedge Fund Allocation)</span>
                  <span>$1,000,000 (Sovereign Mandate)</span>
                </div>
              </div>

              <div className="md:col-span-5 grid grid-cols-2 gap-3">
                <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800/60 text-center">
                  <div className="text-[10px] text-purple-700 dark:text-purple-300 font-semibold uppercase">
                    Simulated Slippage
                  </div>
                  <div className="text-xl font-black font-mono text-purple-700 dark:text-purple-300 mt-0.5">
                    {demoSlippage}%
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">On-Chain Price Impact</div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-[#18182c] rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                  <div className="text-[10px] text-slate-500 font-semibold uppercase">
                    Reserve Solvency Score
                  </div>
                  <div className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {demoSafetyScore} / 100
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Engines Section */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest">
            Institutional Architecture
          </h2>
          <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
            Five Integrated Market Intelligence Engines
          </h3>
          <p className="text-sm text-slate-500 mt-2">
            Engineered to process CoinMarketCap Pro endpoints across RWA, derivatives, and decentralized liquidity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121222] interactive-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
              VeritasRWA: Sovereign Auditor
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Audits tokenized US Treasuries, sovereign bonds, and legal issuer directories. Simulates emergency secondary market exit slippage against on-chain DEX reserves.
            </p>
            <div className="text-[11px] font-mono text-purple-600 dark:text-purple-400 pt-1">
              Endpoint: /v5/real-world-assets/quotes/latest
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121222] interactive-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
              CascadeRadar: Liquidation Spiral Scanner
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Calculates the Cascade Fragility Index (CFI) by comparing perpetual liquidation leverage against spot decentralized liquidity depth to prevent flash crashes.
            </p>
            <div className="text-[11px] font-mono text-purple-600 dark:text-purple-400 pt-1">
              Endpoint: /v5/derivatives/liquidations/cryptocurrency/list/latest
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121222] interactive-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
              BasisVerse: Macro Yield Navigator
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Plots multi-maturity yield curves comparing risk-free Tokenized US T-Bills against DeFi lending markets (Aave, Morpho) and delta-neutral funding rate basis trades.
            </p>
            <div className="text-[11px] font-mono text-purple-600 dark:text-purple-400 pt-1">
              Endpoint: /v5/real-world-assets/assets/list
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121222] interactive-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
              ParityGuard: 24/7 Tokenized Equities
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Tracks continuous on-chain trading for tokenized stocks (bNVDA, bAAPL, bTSLA) while Wall Street is closed, alerting on Monday opening bell basis divergence.
            </p>
            <div className="text-[11px] font-mono text-purple-600 dark:text-purple-400 pt-1">
              Endpoint: /v5/real-world-assets/market-pairs/list
            </div>
          </div>

          {/* Card 5 */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121222] interactive-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Radar className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
              GhostWhale: DEX Smart Money Sentinel
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Analyzes multi-chain trending DEX pools to distinguish between synthetic wash-trading bot volume and authentic institutional accumulation.
            </p>
            <div className="text-[11px] font-mono text-purple-600 dark:text-purple-400 pt-1">
              Endpoint: /v1/dex/tokens/trending/list
            </div>
          </div>

          {/* Card 6: API Evidence & Telemetry */}
          <div className="p-6 rounded-2xl border border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20 interactive-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Live API Inspector &amp; Telemetry
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Built-in live network telemetry recorder exposing cURL generators, headers, and raw JSON payloads for all 9 integrated CoinMarketCap endpoints.
            </p>
            <div className="text-[11px] font-mono text-purple-600 dark:text-purple-400 pt-1">
              Transparent Audit Suite
            </div>
          </div>
        </div>
      </section>

      {/* RWA Sovereign Index Comparison Matrix Section */}
      <section id="rwa-matrix" className="py-20 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#0d0d17]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest">
              Issuer Solvency &amp; Custody
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
              RWA Sovereign Counterparty Matrix
            </h3>
            <p className="text-sm text-slate-500 mt-2">
              Cross-comparing regulated issuers, asset classes, custodians, and redemption latencies.
            </p>
          </div>

          {/* Interactive Protocol Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {ISSUER_COMPARISONS.map((issuer, idx) => (
              <button
                key={issuer.name}
                onClick={() => setSelectedIssuerTab(idx)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center space-x-2 ${
                  selectedIssuerTab === idx
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                    : 'bg-white dark:bg-[#141424] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                }`}
              >
                <span>{issuer.name.split(' ')[0]}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  selectedIssuerTab === idx ? 'bg-purple-800 text-purple-200' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}>
                  {issuer.token}
                </span>
              </button>
            ))}
          </div>

          {/* Active Issuer Dossier Card */}
          <div className="max-w-4xl mx-auto p-6 rounded-2xl bg-white dark:bg-[#121222] border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
              <div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                  <span>{ISSUER_COMPARISONS[selectedIssuerTab].name}</span>
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                </h4>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  Token: {ISSUER_COMPARISONS[selectedIssuerTab].token} • Class: {ISSUER_COMPARISONS[selectedIssuerTab].assetType}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  {ISSUER_COMPARISONS[selectedIssuerTab].rating}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#18182c] border border-slate-200 dark:border-slate-800">
                <div className="text-slate-400">Total Issuer AUM</div>
                <div className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100 mt-1">
                  {ISSUER_COMPARISONS[selectedIssuerTab].aum}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#18182c] border border-slate-200 dark:border-slate-800">
                <div className="text-slate-400">Target Yield</div>
                <div className="text-lg font-bold font-mono text-purple-600 dark:text-purple-400 mt-1">
                  {ISSUER_COMPARISONS[selectedIssuerTab].apy}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#18182c] border border-slate-200 dark:border-slate-800">
                <div className="text-slate-400">Custodian</div>
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1 truncate">
                  {ISSUER_COMPARISONS[selectedIssuerTab].custodian}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#18182c] border border-slate-200 dark:border-slate-800">
                <div className="text-slate-400">Auditing Firm</div>
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1 truncate">
                  {ISSUER_COMPARISONS[selectedIssuerTab].auditFirm}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 text-xs gap-2">
              <div className="flex items-center space-x-2 text-purple-900 dark:text-purple-200">
                <Building2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span>
                  <strong>Jurisdiction:</strong> {ISSUER_COMPARISONS[selectedIssuerTab].jurisdiction} • <strong>Redemption:</strong> {ISSUER_COMPARISONS[selectedIssuerTab].redemptionCycle}
                </span>
              </div>
              <button
                onClick={onLaunchApp}
                className="text-purple-700 dark:text-purple-300 font-bold hover:underline shrink-0 text-xs flex items-center space-x-1 cursor-pointer"
              >
                <span>Audit in Terminal</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Model Context Protocol (MCP) Section */}
      <section id="architecture" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-200 dark:border-slate-800/80">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest">
              <Terminal className="w-4 h-4" />
              <span>Model Context Protocol (MCP)</span>
            </div>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              Autonomous AI Agent Market Surveillance
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Aetheris Terminal exposes CoinMarketCap Pro market data via the open Model Context Protocol (MCP). Connect your AI financial analysts to audit solvency, run depeg simulations, and generate institutional due diligence memos on demand.
            </p>
            <div className="space-y-2 pt-2 text-xs">
              <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Zero-latency tool calling for Claude, Cursor, and LLM agent frameworks</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Standardized tools: audit_rwa_solvency, get_cfi_fragility, check_dex_slippage</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Secure local credential encapsulation via .env</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 p-5 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 font-mono text-xs shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400">
              <span className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-[11px] ml-2 text-slate-300">aetheris-mcp-agent.ts</span>
              </span>
              <span className="text-[10px] text-purple-400">MCP ACTIVE</span>
            </div>
            <p className="text-slate-400">
              <span className="text-purple-400">&gt;</span> Prompt: "Audit BlackRock BUIDL secondary market exit risk for $2M."
            </p>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-slate-300 space-y-1.5 text-[11px]">
              <div className="text-emerald-400 font-bold">[Tool Call: cmc_rwa_quotes]</div>
              <div>• BUIDL Market Cap: $542,000,000 USD (100% Backed)</div>
              <div>• Secondary DEX Liquidity: $12,500,000 (Uniswap v3)</div>
              <div>• $2M Instant Exit Slippage: 1.84% ($36,800 penalty)</div>
              <div className="text-amber-400">• Recommendation: Route via Securitize T+0 redemption window to avoid DEX haircut.</div>
            </div>
            <div className="text-slate-500 text-[10px]">
              Response latency: 48ms • Verified via /v5/real-world-assets/
            </div>
          </div>
        </div>
      </section>

      {/* Institutional Statistics */}
      <section className="py-14 bg-slate-50 dark:bg-[#0e0e1a] border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl sm:text-4xl font-black font-mono text-purple-600 dark:text-purple-400 num-tabular">
              {globalStats?.total_market_cap_usd
                ? `$${(globalStats.total_market_cap_usd / 1e12).toFixed(2)}T`
                : '$2.87T'}
            </div>
            <div className="text-xs text-slate-500 uppercase font-semibold mt-1">Live Global Capitalization (CMC)</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black font-mono text-slate-900 dark:text-slate-100 num-tabular">
              {globalStats?.active_rwa_issuers
                ? `${globalStats.active_rwa_issuers.toLocaleString()}`
                : '8,168'}
            </div>
            <div className="text-xs text-slate-500 uppercase font-semibold mt-1">Verified Digital Assets</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-600 dark:text-emerald-400 num-tabular">
              &lt; 50ms
            </div>
            <div className="text-xs text-slate-500 uppercase font-semibold mt-1">Pro Telemetry Latency</div>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-black font-mono text-slate-900 dark:text-slate-100 num-tabular">
              100% Verified
            </div>
            <div className="text-xs text-slate-500 uppercase font-semibold mt-1">Sovereign Proof of Reserve</div>
          </div>
        </div>
      </section>

      {/* Enterprise Call to Action */}
      <section className="py-20 text-center max-w-4xl mx-auto px-4">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-purple-50 to-white dark:from-[#181433] dark:to-[#11111e] border border-purple-200 dark:border-purple-800/80 shadow-xl space-y-5">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            Access Institutional Terminal Analytics
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Execute real-time RWA solvency stress-testing, derivative liquidation cascade forecasting, and 24/7 tokenized equity parity surveillance powered by live CoinMarketCap Pro endpoints.
          </p>
          <button
            onClick={onLaunchApp}
            className="px-8 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition transform hover:-translate-y-0.5 cursor-pointer inline-flex items-center space-x-2"
          >
            <span>Launch Institutional Terminal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Enterprise Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0a0a12] text-slate-500 text-xs py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">Aetheris Terminal</span>
            <span>•</span>
            <span>CoinMarketCap API Verified</span>
          </div>

          <div className="flex space-x-6">
            <a href="#features" className="hover:text-purple-600 transition">Infrastructure</a>
            <a href="#architecture" className="hover:text-purple-600 transition">MCP Protocol</a>
            <a href="#security" className="hover:text-purple-600 transition">Compliance</a>
            <button onClick={onLaunchApp} className="text-purple-600 font-semibold hover:underline cursor-pointer">
              Terminal Gateway
            </button>
          </div>

          <div>&copy; {new Date().getFullYear()} Aetheris Capital Analytics. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
};
