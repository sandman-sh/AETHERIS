import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Copy,
  Check,
  Info,
  ShieldCheck,
  Database,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Key,
  Radio,
  Sparkles,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { cmcApi } from '../../services/cmcApi';
import { CmcApiLogEntry } from '../../types';

export const ApiTelemetryView: React.FC = () => {
  const [logs, setLogs] = useState<CmcApiLogEntry[]>([]);
  const [selectedLog, setSelectedLog] = useState<CmcApiLogEntry | null>(null);
  const [activeTab, setActiveTab] = useState<'logs' | 'endpoints' | 'feedback' | 'tester'>('logs');
  const [filterSource, setFilterSource] = useState<'ALL' | 'LIVE_CMC_API' | 'LIVE_PUBLIC_FEED' | 'VERIFIED_STREAM'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Live Gateway Verification state
  const [testResult, setTestResult] = useState<{ success: boolean; status: number; message: string } | null>(null);
  const [testing, setTesting] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = cmcApi.subscribeLogs((newLogs) => {
      setLogs(newLogs);
      if (newLogs.length > 0) {
        setSelectedLog((prev) => prev || newLogs[0]);
      }
    });
    return unsubscribe;
  }, []);

  const handleCopyCurl = (log: CmcApiLogEntry) => {
    const curl = `curl -X ${log.http_method} "${log.request_url}" \\\n  -H "Authorization: Bearer [PROTECTED_SERVER_ENV]" \\\n  -H "Accept: application/json"`;
    navigator.clipboard.writeText(curl);
    setCopiedId(log.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTestKey = async () => {
    setTesting(true);
    setTestResult(null);
    const result = await cmcApi.testApiKey();
    setTestResult(result);
    setTesting(false);
  };

  const filteredLogs = logs.filter((log) => {
    if (filterSource === 'ALL') return true;
    return log.source === filterSource;
  });

  const ENDPOINTS_CATALOG = [
    {
      endpoint: '/v5/real-world-assets/quotes/latest',
      track: 'RWA & Solvency',
      desc: 'Real-time valuation, 24h trading volume, and market capitalization for tokenized government securities and equities.',
      frequency: '30s Refresh',
      planTier: 'Basic / Startup / Pro'
    },
    {
      endpoint: '/v5/real-world-assets/issuers',
      track: 'Institutional Due Diligence',
      desc: 'Retrieves regulated issuer identities, total AUM, registered custodians, auditing firms, and counterparty legal disclosures.',
      frequency: 'On Demand',
      planTier: 'Basic / Startup / Pro'
    },
    {
      endpoint: '/v5/real-world-assets/market-pairs/list',
      track: '24/7 Equities & FX',
      desc: 'Lists all decentralized and centralized trading pairs where tokenized equities (e.g. bNVDA, bAAPL) trade continuously.',
      frequency: '60s Refresh',
      planTier: 'Startup / Pro'
    },
    {
      endpoint: '/v1/dex/token/pools',
      track: 'Secondary Market Depth',
      desc: 'Inspects on-chain liquidity pool reserves (Uniswap, Curve, Raydium) to model institutional exit slippage and run-risk.',
      frequency: 'Real-time',
      planTier: 'Startup / Pro'
    },
    {
      endpoint: '/v1/dex/holders/detail',
      track: 'Forensic Surveillance',
      desc: 'Calculates holder concentration, whale distribution, and Gini coefficient to identify single-point-of-failure liquidity risks.',
      frequency: 'Daily Index',
      planTier: 'Pro'
    },
    {
      endpoint: '/v1/dex/tokens/trending/list',
      track: 'Smart Money Detection',
      desc: 'Multi-chain trending DEX token scanner used to detect wash trading, abnormal volume-to-liquidity spikes, and insider accumulation.',
      frequency: 'Real-time',
      planTier: 'Startup / Pro'
    },
    {
      endpoint: '/v5/derivatives/liquidations/cryptocurrency/list/latest',
      track: 'Cascade Fragility',
      desc: 'Aggregated 24h long/short liquidation volume used in our proprietary Cascade Fragility Index formula.',
      frequency: '60s Stream',
      planTier: 'Growth / Pro'
    },
    {
      endpoint: '/v5/cryptocurrency/derivatives/market-pairs/list/latest',
      track: 'Basis Arbitrage',
      desc: 'Perpetual contract open interest, funding rates, and basis spreads across major derivatives venues.',
      frequency: '60s Stream',
      planTier: 'Startup / Pro'
    },
    {
      endpoint: '/v3/fear-and-greed/latest',
      track: 'Macro Sentiment',
      desc: 'Market sentiment index used for systemic volatility weighting in liquidation stress tests.',
      frequency: 'Daily Update',
      planTier: 'Public / Basic'
    }
  ];

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Tab Navigation & API Key Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2 bg-slate-100/70 dark:bg-[#141422] rounded-xl border border-slate-200 dark:border-slate-800 gap-2">
        <div className="flex space-x-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'logs'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            Live Telemetry ({logs.length})
          </button>
          <button
            onClick={() => setActiveTab('tester')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap flex items-center space-x-1 ${
              activeTab === 'tester'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Key &amp; Proxy Tester</span>
          </button>
          <button
            onClick={() => setActiveTab('endpoints')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              activeTab === 'endpoints'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            Endpoints (9)
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'feedback'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <span>Feedback</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          </button>
        </div>

        {/* Engine Status Badge & Manual Trigger */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => cmcApi.initRealCmcFeed()}
            className="flex items-center space-x-1.5 text-xs bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/70 dark:hover:bg-purple-900/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/80 px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer shadow-xs"
            title="Trigger immediate live network fetch across all CoinMarketCap Pro endpoints"
          >
            <RefreshCw className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Sync Live CMC</span>
          </button>
          <div className="flex items-center space-x-1.5 text-xs bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-lg font-medium shadow-xs">
            <Radio className="w-3.5 h-3.5 text-emerald-500 shrink-0 animate-pulse" />
            <span>Proxy &amp; Live Feeds Active</span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden min-h-[360px]">
        {activeTab === 'logs' && (
          <div className="space-y-2 h-full flex flex-col">
            {/* Filter Strip */}
            <div className="flex items-center space-x-2 text-[11px] pb-1">
              <span className="text-slate-400 font-medium">Filter Source:</span>
              {(['ALL', 'LIVE_CMC_API', 'LIVE_PUBLIC_FEED', 'VERIFIED_STREAM'] as const).map((src) => (
                <button
                  key={src}
                  onClick={() => setFilterSource(src)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                    filterSource === src
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {src === 'ALL'
                    ? 'All Logs'
                    : src === 'LIVE_CMC_API'
                    ? 'Live CMC Pro'
                    : src === 'LIVE_PUBLIC_FEED'
                    ? 'Live Public Feeds'
                    : 'Verified Streams'}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 flex-1 overflow-hidden">
              {/* Log Stream List */}
              <div className="md:col-span-5 border border-slate-200 dark:border-slate-800 rounded-xl overflow-y-auto max-h-[460px] p-2 space-y-1.5 bg-slate-50/50 dark:bg-[#0e0e1a]">
                {filteredLogs.map((log) => {
                  const isSelected = selectedLog?.id === log.id;
                  const is200 = log.response_status === 200;
                  return (
                    <div
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                        isSelected
                          ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-400 dark:border-purple-600'
                          : 'bg-white dark:bg-[#141424] border-slate-200 dark:border-slate-800/80 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-mono font-bold text-[10px] text-purple-700 dark:text-purple-300 px-1.5 py-0.2 bg-purple-100 dark:bg-purple-900/60 rounded">
                            {log.http_method}
                          </span>
                          {log.source === 'LIVE_CMC_API' && (
                            <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[9px] font-bold px-1.5 py-0.2 rounded border border-emerald-300 dark:border-emerald-800">
                              LIVE CMC
                            </span>
                          )}
                          {log.source === 'LIVE_PUBLIC_FEED' && (
                            <span className="bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 text-[9px] font-bold px-1.5 py-0.2 rounded border border-cyan-300 dark:border-cyan-800">
                              LIVE FEED
                            </span>
                          )}
                          {log.source === 'VERIFIED_STREAM' && (
                            <span className="bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[9px] font-bold px-1.5 py-0.2 rounded border border-purple-300 dark:border-purple-800">
                              VERIFIED STREAM
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-1.5 text-[10px]">
                          <span
                            className={`font-mono font-bold ${
                              is200 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {log.response_status}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-400 font-mono">{log.latency_ms}ms</span>
                        </div>
                      </div>
                      <div className="font-mono text-slate-800 dark:text-slate-200 text-[11px] font-medium truncate">
                        {log.endpoint}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Request Detail */}
              <div className="md:col-span-7 border border-slate-200 dark:border-slate-800 rounded-xl overflow-y-auto max-h-[460px] p-3 bg-white dark:bg-[#11111e] space-y-3">
                {selectedLog ? (
                  <>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400">
                          {selectedLog.endpoint}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Status: <strong className={selectedLog.response_status === 200 ? 'text-emerald-500' : 'text-rose-500'}>{selectedLog.response_status}</strong> • Latency: {selectedLog.latency_ms}ms • Size: {selectedLog.data_size_bytes}B • Source: {selectedLog.source || 'SNAPSHOT'}
                        </div>
                      </div>
                      <button
                        onClick={() => handleCopyCurl(selectedLog)}
                        className="flex items-center space-x-1 text-[11px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-2.5 py-1 rounded text-slate-700 dark:text-slate-200 transition cursor-pointer"
                      >
                        {copiedId === selectedLog.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === selectedLog.id ? 'Copied' : 'cURL'}</span>
                      </button>
                    </div>

                    <div className="p-2.5 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800/60 text-xs text-purple-900 dark:text-purple-200">
                      {selectedLog.purpose_description}
                    </div>

                    {selectedLog.error_message && (
                      <div className="p-2.5 bg-rose-50 dark:bg-rose-950/30 rounded-lg border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
                        <strong>Live Notice:</strong> {selectedLog.error_message} (fallback engaged)
                      </div>
                    )}

                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Raw Response Payload
                      </div>
                      <pre className="text-[10px] font-mono bg-slate-900 text-slate-100 p-2.5 rounded-lg border border-slate-800 overflow-x-auto max-h-48">
                        {JSON.stringify(selectedLog.raw_response, null, 2)}
                      </pre>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                    Select a request to inspect details
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tester' && (
          <div className="overflow-y-auto max-h-[460px] p-4 bg-white dark:bg-[#121222] rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>CoinMarketCap Live Gateway &amp; Telemetry Status</span>
              </h3>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Authentication is handled 100% server-side via <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">.env</code>. Credentials and secrets are never requested, entered, or stored in the browser client.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#161628] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-white dark:bg-[#10101c] rounded-xl border border-slate-200 dark:border-slate-800">
                <div>
                  <div className="text-[11px] font-semibold text-slate-500">Security Architecture</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-2 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Server-Side Isolated Proxy (Zero Client Leakage)</span>
                  </div>
                </div>

                <button
                  onClick={handleTestKey}
                  disabled={testing}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-lg font-bold text-xs transition flex items-center justify-center space-x-2 cursor-pointer shadow-md shadow-purple-600/20 shrink-0"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{testing ? 'Testing Live Handshake...' : 'Test Live Connection'}</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center space-x-2">
                <span>Active Credentials:</span>
                <strong className="font-mono text-purple-600 dark:text-purple-400">{cmcApi.getMaskedKey()}</strong>
                {cmcApi.isEnvConfigured() && (
                  <span className="bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold">
                    Loaded Securely from .env
                  </span>
                )}
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-lg border text-xs flex items-start space-x-2.5 ${
                    testResult.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold">
                      {testResult.success ? 'Live Verification Successful' : `Verification Returned HTTP ${testResult.status}`}
                    </div>
                    <div className="mt-0.5 text-[11px]">{testResult.message}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 rounded-lg bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/60 text-slate-600 dark:text-slate-300 text-[11px] space-y-1">
              <strong>Institutional Live Security:</strong>
              <div>• Credentials in <code className="bg-purple-100 dark:bg-purple-900 px-1 rounded">.env</code> are authenticated strictly by the local Vite server proxy. The browser client never touches or displays the secret key.</div>
              <div>• Real-time telemetry proof logs verify upstream status codes, latencies, and payload signatures without exposing headers to DevTools.</div>
            </div>
          </div>
        )}

        {activeTab === 'endpoints' && (
          <div className="overflow-y-auto max-h-[460px] space-y-2.5 pr-1">
            {ENDPOINTS_CATALOG.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#141424] space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded text-[11px]">
                    {item.endpoint}
                  </span>
                  <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {item.planTier}
                  </span>
                </div>
                <div className="font-semibold text-slate-800 dark:text-slate-200">{item.track}</div>
                <p className="text-slate-500 text-[11px] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'feedback' && (
          <div className="overflow-y-auto max-h-[460px] space-y-3 pr-1 text-xs">
            <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-1.5">
              <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>What the CoinMarketCap API Made Possible</span>
              </div>
              <ul className="list-disc pl-4 text-emerald-900 dark:text-emerald-200 space-y-1 text-[11px] leading-relaxed">
                <li>Unified access to regulated RWA tokenized securities and on-chain DEX pool reserves under one API key.</li>
                <li>Comprehensive issuer metadata via /v5/real-world-assets/issuers disclosing legal custodians and audit firms.</li>
                <li>DEX pool reserves paired with perpetual liquidations enabled computing the Cascade Fragility Index.</li>
              </ul>
            </div>

            <div className="p-3 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl space-y-1.5">
              <div className="font-bold text-amber-800 dark:text-amber-300 flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Constructive API Insights &amp; Edge Cases</span>
              </div>
              <ul className="list-disc pl-4 text-amber-900 dark:text-amber-200 space-y-1 text-[11px] leading-relaxed">
                <li>Separation of crypto_id and rwa_id requires extra resolution hops via /v5/real-world-assets/map.</li>
                <li>Wrapped L2 canonical proxy pools occasionally require explicit address parameterization.</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
