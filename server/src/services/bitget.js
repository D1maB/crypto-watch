import { PriceStream } from './priceStream.js';
import { BASE_SYMBOLS, toBybitSymbol } from '../config/symbols.js';

const DEFAULT_SYMBOLS = BASE_SYMBOLS.map(toBybitSymbol);

export function createBitgetStream(symbols = DEFAULT_SYMBOLS) {
  const normalized = symbols.map((s) => s.toUpperCase());
  const args = normalized.map((instId) => ({ instType: 'SPOT', channel: 'ticker', instId }));

  return new PriceStream({
    name: 'bitget',
    url: 'wss://ws.bitget.com/v2/ws/public',
    subscribe: (ws) => {
      // Bitget expects a plain text ping for keep-alive.
      setInterval(() => {
        if (ws.readyState === 1) {
          ws.send('ping');
        }
      }, 30000);

      ws.send(JSON.stringify({ op: 'subscribe', args }));
    },
    parse: (raw) => {
      try {
        // Ignore pong responses.
        if (raw === 'pong' || raw === '"pong"') return [];

        const msg = JSON.parse(raw);

        if (msg.event === 'subscribe' || msg.event === 'pong') return [];
        if (!Array.isArray(msg.data)) return [];

        return msg.data.map((data) => {
          const price = Number(data.lastPr);
          const open = Number(data.open24h);
          const changePercent = open ? ((price - open) / open) * 100 : Number(data.change24h) * 100;

          const update = {
            key: `bitget:${data.instId.toLowerCase()}`,
            exchange: 'bitget',
            symbol: data.instId.toLowerCase(),
            price,
            changePercent,
            high: Number(data.high24h),
            low: Number(data.low24h),
            volume: Number(data.baseVolume),
            updatedAt: Date.now(),
          };
          return { key: update.key, update };
        });
      } catch (e) {
        return [];
      }
    },
  });
}