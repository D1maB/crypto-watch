import WebSocket from 'ws';

const DEFAULT_RECONNECT_DELAY_MS = 3000;

/**
 * Generic WebSocket price stream.
 *
 * Config:
 *  - name:        exchange name (for logging)
 *  - url:         websocket url
 *  - subscribe:   (ws) => void, called on open
 *  - parse:       (raw: string) => Array<{ key: string, update: object }>
 *  - reconnectDelay
 */
export class PriceStream {
  constructor({ name, url, subscribe, parse, reconnectDelay = DEFAULT_RECONNECT_DELAY_MS }) {
    this.name = name;
    this.url = url;
    this.subscribe = subscribe;
    this.parse = parse;
    this.reconnectDelay = reconnectDelay;

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

    const ws = new WebSocket(this.url);
    this.ws = ws;

    ws.on('open', () => {
      console.log(`[${this.name}] connected: ${this.url}`);
      this.subscribe(ws);
    });

    ws.on('message', (raw) => {
      try {
        const updates = this.parse(raw.toString());
        for (const { key, update } of updates) {
          this.latest.set(key, update);
          for (const listener of this.listeners) {
            listener(update);
          }
        }
      } catch (err) {
        console.error(`[${this.name}] parse error:`, err.message);
      }
    });

    ws.on('close', () => {
      console.warn(`[${this.name}] connection closed; reconnecting...`);
      if (!this.stopped) {
        setTimeout(() => this.connect(), this.reconnectDelay);
      }
    });

    ws.on('error', (err) => {
      console.error(`[${this.name}] error:`, err.message);
      ws.close();
    });
  }

  snapshot() {
    return Array.from(this.latest.values());
  }
}
