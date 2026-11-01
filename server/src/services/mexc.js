import { PriceStream } from './priceStream.js';
import { BASE_SYMBOLS, toMexcSymbol } from '../config/symbols.js';

const DEFAULT_SYMBOLS = BASE_SYMBOLS.map(toMexcSymbol);

export function createMexcStream(symbols = DEFAULT_SYMBOLS) {
  const normalized = symbols.map((s) => s.toUpperCase());

  return new PriceStream({
    name: 'mexc',
    url: 'wss://wbs-api.mexc.com/ws',
    subscribe: (ws) => {
      normalized.forEach((symbol) => {
        ws.send(JSON.stringify({ method: 'SUBSCRIPTION', params: [`spot@public.ticker.v3.api@${symbol}`] }));
      });

      setInterval(() => {
        if (ws.readyState === 1) {
          ws.send(JSON.stringify({ method: 'PING' }));
        }
      }, 20000);
    },
    parse: (raw) => {
      try {
        if (raw === 'PONG' || raw === '"PONG"') return [];

        const msg = JSON.parse(raw);
        const payload = msg?.d ?? msg?.data;
        if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return [];
        if (!payload.s && !payload.symbol) return [];

        const symbol = String(payload.s ?? payload.symbol).toUpperCase();
        const price = Number(payload.c ?? payload.lastPrice ?? payload.last ?? payload.price);
        const changePercent = Number(payload.r ?? payload.R ?? payload.priceChangePercent ?? payload.changeRate ?? 0);
        const high = Number(payload.h ?? payload.high ?? payload.highPrice ?? 0);
        const low = Number(payload.l ?? payload.low ?? payload.lowPrice ?? 0);
        const volume = Number(payload.v ?? payload.volume ?? payload.baseVolume ?? payload.baseVol ?? 0);

        const update = {
          key: `mexc:${symbol.toLowerCase()}`,
          exchange: 'mexc',
          symbol: symbol.toLowerCase(),
          price,
          changePercent: Number.isFinite(changePercent) ? changePercent * (Math.abs(changePercent) < 1 ? 100 : 1) : 0,
          high: Number.isFinite(high) ? high : 0,
          low: Number.isFinite(low) ? low : 0,
          volume: Number.isFinite(volume) ? volume : 0,
          updatedAt: Date.now(),
        };

        return [{ key: update.key, update }];
      } catch (e) {
        return [];
      }
    },
  });
}