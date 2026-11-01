import WebSocket from 'ws';

const DEFAULT_SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'XRPUSDT'];
const RECONNECT_DELAY_MS = 3000;

export class BybitPriceStream {
  constructor({ symbols = DEFAULT_SYMBOLS, baseUrl = 'wss://stream.bybit.com/v5/public/spot' } = {}) {
    this.symbols = symbols.map((s) => s.toUpperCase());
    this.baseUrl = baseUrl;
    this.latest = new Map();
    this.listeners = new Set();
    this.ws = null;
    this.stopped = false;
  }

  onUpdate(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  start() {
    this.stopped = false;
    this.connect();
  }

  stop() {
    this.stopped = true;
    if (this.ws) {
      this.ws.removeAllListeners();
      this.ws.close();
      this.ws = null;
    }
  }

  connect() {
    if (this.stopped) return;

    const ws = new WebSocket(this.baseUrl);
    this.ws = ws;

    ws.on('open', () => {
      console.log(`[bybit] connected: ${this.baseUrl}`);
      ws.send(
        JSON.stringify({
          op: 'subscribe',
          args: this.symbols.map((s) => `tickers.${s}`),
        })
      );
    });

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (!msg.data || !msg.topic || !msg.topic.startsWith('tickers.')) return;

        const data = msg.data;
        const symbol = (data.symbol ?? msg.topic.split('.')[1]).toUpperCase();
        const price = Number(data.lastPrice);
        const pct = Number(data.price24hPcnt);
        const changePercent = Number.isFinite(pct) ? pct * 100 : 0;

        const update = {
          exchange: 'bybit',
          symbol,
          price,
          changePercent,
          high: Number(data.highPrice24h),
          low: Number(data.lowPrice24h),
          volume: Number(data.volume24h),
          updatedAt: Date.now(),
        };

        this.latest.set(symbol, update);
        for (const listener of this.listeners) {
          listener(update);
        }
      } catch (err) {
        console.error('[bybit] parse error:', err.message);
      }
    });

    ws.on('close', () => {
      console.warn('[bybit] connection closed; reconnecting...');
      if (!this.stopped) {
        setTimeout(() => this.connect(), RECONNECT_DELAY_MS);
      }
    });

    ws.on('error', (err) => {
      console.error('[bybit] error:', err.message);
      ws.close();
    });
  }

  snapshot() {
    return Array.from(this.latest.values());
  }
}
