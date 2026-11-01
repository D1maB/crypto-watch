import { PriceStream } from './priceStream.js';
import { BASE_SYMBOLS, toBinanceSymbol, CROSS_PAIRS, formatCrossPair } from '../config/symbols.js';

const DEFAULT_SYMBOLS = [...BASE_SYMBOLS.map(toBinanceSymbol), ...CROSS_PAIRS.map(formatCrossPair.binance)];

export function createBinanceStream(symbols = DEFAULT_SYMBOLS) {
  const normalized = symbols.map((s) => s.toLowerCase());

  return new PriceStream({
    name: 'binance',
    url: `wss://stream.binance.com:9443/stream?streams=${normalized.map((s) => `${s}@ticker`).join('/')}`,
    subscribe: () => {},
    parse: (raw) => {
      const msg = JSON.parse(raw);
      const data = msg.data ?? msg;
      if (!data || !data.s) return [];

      const symbol = data.s.toLowerCase();
      const update = {
        key: `binance:${symbol}`,
        exchange: 'binance',
        symbol,
        price: Number(data.c),
        changePercent: Number(data.P),
        high: Number(data.h),
        low: Number(data.l),
        volume: Number(data.v),
        updatedAt: Date.now(),
      };
      return [{ key: update.key, update }];
    },
  });
}
