import { PriceStream } from './priceStream.js';

const DEFAULT_SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'XRPUSDT'];

export function createBybitStream(symbols = DEFAULT_SYMBOLS) {
  const normalized = symbols.map((s) => s.toUpperCase());

  return new PriceStream({
    name: 'bybit',
    url: 'wss://stream.bybit.com/v5/public/spot',
    subscribe: (ws) => {
      ws.send(JSON.stringify({ op: 'subscribe', args: normalized.map((s) => `tickers.${s}`) }));
    },
    parse: (raw) => {
      const msg = JSON.parse(raw);
      if (!msg.data || !msg.topic || !msg.topic.startsWith('tickers.')) return [];

      const data = msg.data;
      const symbol = (data.symbol ?? msg.topic.split('.')[1]).toUpperCase();
      const price = Number(data.lastPrice);
      const pct = Number(data.price24hPcnt);
      const changePercent = Number.isFinite(pct) ? pct * 100 : 0;

      const update = {
        key: `bybit:${symbol}`,
        exchange: 'bybit',
        symbol,
        price,
        changePercent,
        high: Number(data.highPrice24h),
        low: Number(data.lowPrice24h),
        volume: Number(data.volume24h),
        updatedAt: Date.now(),
      };
      return [{ key: update.key, update }];
    },
  });
}
