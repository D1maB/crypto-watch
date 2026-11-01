import { PriceStream } from './priceStream.js';
import { BASE_SYMBOLS, toOkxInstId, CROSS_PAIRS, formatCrossPair } from '../config/symbols.js';

const DEFAULT_INST_IDS = [...BASE_SYMBOLS.map(toOkxInstId), ...CROSS_PAIRS.map(formatCrossPair.okx)];

export function createOkxStream(instIds = DEFAULT_INST_IDS) {
  return new PriceStream({
    name: 'okx',
    url: 'wss://ws.okx.com:8443/ws/v5/public',
    subscribe: (ws) => {
      const args = instIds.map((instId) => ({ channel: 'tickers', instId }));
      ws.send(JSON.stringify({ op: 'subscribe', args }));
    },
    parse: (raw) => {
      const msg = JSON.parse(raw);
      if (!Array.isArray(msg.data)) return [];

      return msg.data.map((data) => {
        const price = Number(data.last);
        const open = Number(data.open24h);
        const changePercent = open ? ((price - open) / open) * 100 : 0;

        const update = {
          key: `okx:${data.instId}`,
          exchange: 'okx',
          instId: data.instId,
          symbol: data.instId,
          price,
          changePercent,
          high: Number(data.high24h),
          low: Number(data.low24h),
          volume: Number(data.vol24h),
          updatedAt: Date.now(),
        };
        return { key: update.key, update };
      });
    },
  });
}
