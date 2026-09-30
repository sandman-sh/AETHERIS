export type AssetType = 'government_security' | 'stock' | 'commodity' | 'currency' | 'etf' | 'real_estate';

export interface RwaAsset {
  rwa_id: string;
  name: string;
  symbol: string;
  asset_type: AssetType;
  issuer_id: string;
  issuer_name: string;
  price_usd: number;
  market_cap_usd: number;
  volume_24h_usd: number;
  change_24h_pct: number;
  underlying_isin_or_ticker: string;
  backed_reserve_proof_pct: number;
  onchain_dex_liquidity_usd: number;
  slippage_estimated_500k_pct: number;
  sovereign_risk_rating: 'AAA' | 'AA+' | 'AA' | 'A+' | 'BBB' | 'B';
  primary_chain: string;
  token_contract: string;
  yield_apy?: number;
}

export interface RwaIssuer {
  issuer_id: string;
  name: string;
  jurisdiction: string;
  regulatory_status: string;
  total_assets_under_management_usd: number;
  active_tokens_count: number;
  custodian: string;
  audit_firm: string;
  redemption_cycle: string;
  counterparty_risk_score: number; // 0-100, 100 is safest
  verified_status: boolean;
}

export interface DexLiquidityPool {
  pool_id: string;
  pair_symbol: string;
  chain: string;
  dex_name: string;
  token0_symbol: string;
  token1_symbol: string;
  reserve_usd: number;
  volume_24h_usd: number;
  fee_tier_pct: number;
  price_ratio: number;
  utilization_rate_pct: number;
  holder_gini_coefficient: number; // 0 (perfect distribution) to 1 (monopoly)
  top_10_holders_pct: number;
  organic_volume_score: number; // 0-100
}

export interface DerivativeMarketData {
  symbol: string;
  derivative_pair: string;
  exchange: string;
  perpetual_price: number;
  spot_price: number;
  basis_pct: number;
  open_interest_usd: number;
  annualized_funding_rate_pct: number;
  liquidations_24h_usd: number;
  long_liquidation_vol_usd: number;
  short_liquidation_vol_usd: number;
  cascade_fragility_index: number; // CFI metric
  fragility_status: 'CRITICAL' | 'ELEVATED' | 'MODERATE' | 'STABLE';
}

export interface MacroYieldComparison {
  asset_name: string;
  asset_symbol: string;
  category: 'Tokenized Treasury (RWA)' | 'DeFi Lending' | 'Perp Funding Basis' | 'TradFi Benchmark';
  apy_pct: number;
  duration_days: number;
  counterparty_risk: 'Ultra-Low' | 'Low' | 'Medium' | 'High';
  liquidity_latency: 'Instant DEX' | 'T+0 Redemption' | 'T+2 Banking' | 'Locked 7d';
  redemption_fee_pct: number;
  net_yield_100k_1y: number;
}

export interface TokenizedEquitySpread {
  ticker: string;
  name: string;
  token_symbol: string;
  chain: string;
  dex_venue: string;
  onchain_price_usd: number;
  tradfi_nyse_close_usd: number;
  weekend_premium_discount_pct: number;
  is_weekend_active: boolean;
  weekend_volume_usd: number;
  implied_monday_open_gap_usd: number;
  arbitrage_signal: 'LONG ARBITRAGE' | 'SHORT ARBITRAGE' | 'PARITY BALANCED';
}

export interface DexTrendingAnalysis {
  token_symbol: string;
  token_name: string;
  chain: string;
  contract_address: string;
  price_usd: number;
  change_24h_pct: number;
  volume_24h_usd: number;
  liquidity_usd: number;
  vol_to_liq_ratio: number;
  wash_trading_probability_pct: number;
  insider_accumulation_detected: boolean;
  organic_trust_score: number; // 0 - 100
  security_flag: 'VERIFIED' | 'SUSPICIOUS_VOLUME' | 'WHALE_CONCENTRATION' | 'UNPROTECTED_POOL';
}

export interface CmcApiLogEntry {
  id: string;
  timestamp: string;
  endpoint: string;
  http_method: 'GET' | 'POST';
  request_url: string;
  query_params: Record<string, string | number>;
  headers_masked: Record<string, string>;
  response_status: number;
  latency_ms: number;
  data_size_bytes: number;
  raw_response: any;
  purpose_description: string;
  source?: 'LIVE_CMC_API' | 'LIVE_PUBLIC_FEED' | 'VERIFIED_STREAM';
  error_message?: string;
}

export interface GlobalMarketStats {
  fear_and_greed_score: number;
  fear_and_greed_sentiment: string;
  total_market_cap_usd: number;
  market_cap_24h_change_pct: number;
  total_volume_24h_usd: number;
  btc_dominance_pct: number;
  eth_dominance_pct?: number;
  rwa_total_tvl_usd: number;
  active_rwa_issuers: number;
  timestamp: string;
}
