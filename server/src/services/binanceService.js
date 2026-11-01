import WebSocket from 'ws';

const DEFAULT_SYMBOLS = ['btcusdt', 'ethusdt'];
const RECONNECT_DELAY_MS = 3000;

/**
 * Maintains a live map of Binance 24h ticker data for the given symbols.
 * Emits updates via the provided `onUpdate` callback.
 */
export class BinancePriceStream {
  constructor({ symbols = DEFAULT_SYMBOLS, baseUrl = 'wss://stream.binance.com:9443' } = {}) {
    this.symbols = symbols.map((s) => s.toLowerCase());
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

    const streams = this.symbols.map((s) => `${s}@ticker`).join('/');
    const url = `${this.baseUrl}/stream?streams=${streams}`;

    const ws = new WebSocket(url);
    this.ws = ws;

    ws.on('open', () => {
      console.log(`[binance] connected: ${url}`);
    });

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        const data = msg.data ?? msg;
        if (!data || !data.s) return;

        const symbol = data.s.toLowerCase();
        const update = {
          exchange: 'binance',
          symbol,
          price: Number(data.c),
          changePercent: Number(data.P),
          high: Number(data.h),
          low: Number(data.l),
          volume: Number(data.v),
          updatedAt: Date.now(),
        };

        this.latest.set(symbol, update);
        for (const listener of this.listeners) {
          listener(update);
        }
      } catch (err) {
        console.error('[binance] parse error:', err.message);
      }
    });

    ws.on('close', () => {
      console.warn('[binance] connection closed; reconnecting...');
      if (!this.stopped) {
        setTimeout(() => this.connect(), RECONNECT_DELAY_MS);
      }
    });

    ws.on('error', (err) => {
      console.error('[binance] error:', err.message);
      ws.close();
    });
  }

  snapshot() {
    return Array.from(this.latest.values());
  }
}
