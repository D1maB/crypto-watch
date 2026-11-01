import WebSocket from 'ws';

const DEFAULT_INST_IDS = ['BTC-USDT', 'ETH-USDT'];
const RECONNECT_DELAY_MS = 3000;

export class OkxPriceStream {
  constructor({ instIds = DEFAULT_INST_IDS, baseUrl = 'wss://ws.okx.com:8443/ws/v5/public' } = {}) {
    this.instIds = instIds;
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
      console.log(`[okx] connected: ${this.baseUrl}`);
      const args = this.instIds.map((instId) => ({ channel: 'tickers', instId }));
      ws.send(JSON.stringify({ op: 'subscribe', args }));
    });

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (!msg.data || !Array.isArray(msg.data)) return;

        for (const data of msg.data) {
          const price = Number(data.last);
          const open = Number(data.open24h);
          const changePercent = open ? ((price - open) / open) * 100 : 0;

          const update = {
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

          this.latest.set(data.instId, update);
          for (const listener of this.listeners) {
            listener(update);
          }
        }
      } catch (err) {
        console.error('[okx] parse error:', err.message);
      }
    });

    ws.on('close', () => {
      console.warn('[okx] connection closed; reconnecting...');
      if (!this.stopped) {
        setTimeout(() => this.connect(), RECONNECT_DELAY_MS);
      }
    });

    ws.on('error', (err) => {
      console.error('[okx] error:', err.message);
      ws.close();
    });
  }

  snapshot() {
    return Array.from(this.latest.values());
  }
}
