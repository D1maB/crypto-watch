import { PriceStream } from './priceStream.js';
import { BASE_SYMBOLS, toOkxInstId } from '../config/symbols.js';

const DEFAULT_SYMBOLS = BASE_SYMBOLS.map(toOkxInstId);

async function getKucoinConnectionUrl() {
  const response = await fetch('https://api.kucoin.com/api/v1/bullet-public', {
    method: 'POST',
  });
  const json = await response.json();
  const token = json?.data?.token;
  const endpoint = json?.data?.instanceServers?.[0]?.endpoint;
  if (!token || !endpoint) {
    throw new Error('Failed to obtain KuCoin connection token');
  }
  // Ensure trailing slash handling for query string.
  const base = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;
  return `${base}/?token=${encodeURIComponent(token)}`;
}

export function createKucoinStream(symbols = DEFAULT_SYMBOLS) {
  const normalized = symbols.map((s) => s.toUpperCase());

  return new PriceStream({
    name: 'kucoin',
    url: getKucoinConnectionUrl,
    subscribe: (ws) => {
      // KuCoin heartbeat.
      setInterval(() => {
        if (ws.readyState === 1) {
          ws.send(JSON.stringify({ id: Date.now(), type: 'ping' }));
        }
      }, 18000);

      normalized.forEach((symbol) => {
        ws.send(JSON.stringify({
          id: Date.now(),
          type: 'subscribe',
          topic: `/market/ticker:${symbol}`,
          private: false,
          passphrase: '',
        }));
      });
    },
    parse: (raw) => {
      try {
        const msg = JSON.parse(raw);
        if (msg.type !== 'message' || !msg.data || !msg.topic) return [];

        const data = msg.data;
        if (!data.price) return [];

        const symbol = msg.topic.split(':')[1] || data.symbol;
        const price = Number(data.price);

        const update = {
          key: `kucoin:${symbol.toLowerCase()}`,
          exchange: 'kucoin',
          symbol: symbol.toLowerCase(),
          price,
          changePercent: 0,
          high: 0,
          low: 0,
          volume: 0,
          updatedAt: Date.now(),
        };
        return [{ key: update.key, update }];
      } catch (e) {
        return [];
      }
    },
  });
}