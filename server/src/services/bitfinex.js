import { PriceStream } from './priceStream.js';
import { BASE_SYMBOLS, toBitfinexSymbol } from '../config/symbols.js';

const DEFAULT_SYMBOLS = BASE_SYMBOLS.map(toBitfinexSymbol);

export function createBitfinexStream(symbols = DEFAULT_SYMBOLS) {
  const normalized = symbols.map((s) => 't' + s.replace(/^t/i, '').toUpperCase());
  const channelSymbols = new Map();

  return new PriceStream({
    name: 'bitfinex',
    url: 'wss://api-pub.bitfinex.com/ws/2',
    subscribe: (ws) => {
      normalized.forEach((symbol) => {
        ws.send(JSON.stringify({ event: 'subscribe', channel: 'ticker', symbol }));
      });
    },
    parse: (raw) => {
      try {
        const msg = JSON.parse(raw);

        if (msg && msg.event === 'subscribed' && msg.chanId && msg.symbol) {
          channelSymbols.set(msg.chanId, msg.symbol);
          return [];
        }

        if (!Array.isArray(msg) || msg.length < 2) return [];

        const chanId = msg[0];
        const data = msg[1];
        if (!Array.isArray(data) || data.length < 10) return [];

        const symbol = channelSymbols.get(chanId);
        if (!symbol) return [];

        const base = symbol.slice(1, -3).toLowerCase();
        const normalizedSymbol = `${base}usdt`;

        const dailyChangePercent = Number(data[5]);
        const price = Number(data[6]);

        const update = {
          key: `bitfinex:${normalizedSymbol}`,
          exchange: 'bitfinex',
          symbol: normalizedSymbol,
          price,
          changePercent: Number.isFinite(dailyChangePercent) ? dailyChangePercent * 100 : 0,
          high: Number(data[8]),
          low: Number(data[9]),
          volume: Number(data[7]),
          updatedAt: Date.now(),
        };

        return [{ key: update.key, update }];
      } catch (e) {
        return [];
      }
    },
  });
}