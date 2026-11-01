import { PriceStream } from './priceStream.js';
import { BASE_SYMBOLS, toBinanceSymbol, CROSS_PAIRS, formatCrossPair } from '../config/symbols.js';

const DEFAULT_SYMBOLS = [...BASE_SYMBOLS.map(toBinanceSymbol), ...CROSS_PAIRS.map(formatCrossPair.binance)];

export function createBinanceStream(symbols = DEFAULT_SYMBOLS) {
  const normalized = symbols.map((s) => s.toLowerCase());

  const tracked = new Set(normalized);

  return new PriceStream({
    name: 'binance',
    // Market-wide 24h ticker stream; individual symbols are filtered below.
    url: 'wss://stream.binance.com:9443/ws/!ticker@arr',
    subscribe: () => {},
    parse: (raw) => {
      let payload;
      try {
        payload = JSON.parse(raw);
      } catch (e) {
        return [];
      }

      const items = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [payload];
      const updates = [];

      for (const data of items) {
        if (!data || !data.s) continue;

        const symbol = String(data.s).toLowerCase();
        if (!tracked.has(symbol)) continue;

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
        updates.push({ key: update.key, update });
      }

      return updates;
    },
  });
}
