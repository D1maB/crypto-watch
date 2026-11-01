// Shared base-asset list (USDT-quoted) available across all supported exchanges.
// Kept as base assets so each stream can format them for its own symbol convention.
export const BASE_SYMBOLS = [
  'BTC', 'ETH', 'TRX', 'BNB', 'SOL', 'NEAR', 'PEPE', 'UNI', 'XRP', 'XPL',
  'LINK', 'AVAX', 'HYPE', 'SUI', 'ENA', 'AAVE', 'DOGE', 'CELO', 'WLD', 'TRUMP',
  'G', 'ADA', 'ZRO', 'FET', 'LTC', 'ARB', 'XLM', 'INJ', 'ZAMA', 'ONDO',
  'STX', 'BCH', 'PUMP', 'MORPHO', 'GRAM', 'HBAR', 'ASTER', 'STRK', 'FIL', 'TIA',
  'EIGEN', 'APT', 'PENGU', 'ATOM', 'ICP', 'NIGHT', 'PENDLE', 'SEI', 'DOT', 'WLFI',
];

export const toBinanceSymbol = (base) => `${base}USDT`.toLowerCase();
export const toBybitSymbol = (base) => `${base}USDT`;
export const toOkxInstId = (base) => `${base}-USDT`;
export const toBitfinexSymbol = (base) => `t${base}USD`;
export const toMexcSymbol = (base) => `${base}USDT`;

// Optional cross pairs (base/quote) available on most major exchanges.
export const CROSS_PAIRS = [
  { base: 'BNB', quote: 'ETH' },
  { base: 'LINK', quote: 'ETH' },
  { base: 'SOL', quote: 'ETH' },
  { base: 'TRX', quote: 'ETH' },
  { base: 'XRP', quote: 'ETH' },
  { base: 'ADA', quote: 'ETH' },
  { base: 'ARB', quote: 'ETH' },
  { base: 'ZEC', quote: 'ETH' },
  { base: 'LTC', quote: 'ETH' },
  { base: 'AAVE', quote: 'ETH' },
];

export const formatCrossPair = {
  binance: ({ base, quote }) => `${base}${quote}`.toLowerCase(),
  bybit: ({ base, quote }) => `${base}${quote}`.toUpperCase(),
  bitget: ({ base, quote }) => `${base}${quote}`.toUpperCase(),
  mexc: ({ base, quote }) => `${base}${quote}`.toUpperCase(),
  okx: ({ base, quote }) => `${base}-${quote}`.toUpperCase(),
  kucoin: ({ base, quote }) => `${base}-${quote}`.toUpperCase(),
  bitfinex: ({ base, quote }) => `t${base.toUpperCase()}${quote.toUpperCase()}`,
};