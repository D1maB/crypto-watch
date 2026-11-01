import http from 'node:http';
import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { PORT, CLIENT_ORIGIN } from './config/env.js';
import { createBinanceStream } from './services/binance.js';
import { createOkxStream } from './services/okx.js';
import { createBybitStream } from './services/bybit.js';
import { createBitgetStream } from './services/bitget.js';
import { createKucoinStream } from './services/kucoin.js';
import { createMexcStream } from './services/mexc.js';
import { createBitfinexStream } from './services/bitfinex.js';

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

const binance = createBinanceStream();
const okx = createOkxStream();
const bybit = createBybitStream();
const bitget = createBitgetStream();
const kucoin = createKucoinStream();
const mexc = createMexcStream();
const bitfinex = createBitfinexStream();
binance.start();
okx.start();
bybit.start();
bitget.start();
kucoin.start();
mexc.start();
bitfinex.start();

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/prices', (_req, res) => {
  res.json([...binance.snapshot(), ...okx.snapshot(), ...bybit.snapshot(), ...bitget.snapshot(), ...kucoin.snapshot(), ...mexc.snapshot(), ...bitfinex.snapshot()]);
});

const server = http.createServer(app);

const wss = new WebSocketServer({ server, path: '/ws' });

function broadcast(payload) {
  const message = JSON.stringify(payload);
  for (const client of wss.clients) {
    if (client.readyState === 1) {
      client.send(message);
    }
  }
}

wss.on('connection', (socket) => {
  socket.send(JSON.stringify({ type: 'snapshot', data: [...binance.snapshot(), ...okx.snapshot(), ...bybit.snapshot(), ...bitget.snapshot(), ...kucoin.snapshot(), ...mexc.snapshot(), ...bitfinex.snapshot()] }));
});

binance.onUpdate((update) => broadcast({ type: 'update', data: update }));
okx.onUpdate((update) => broadcast({ type: 'update', data: update }));
bybit.onUpdate((update) => broadcast({ type: 'update', data: update }));
bitget.onUpdate((update) => broadcast({ type: 'update', data: update }));
kucoin.onUpdate((update) => broadcast({ type: 'update', data: update }));
mexc.onUpdate((update) => broadcast({ type: 'update', data: update }));
bitfinex.onUpdate((update) => broadcast({ type: 'update', data: update }));

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

process.on('SIGTERM', () => {
  binance.stop();
  okx.stop();
  bybit.stop();
  bitget.stop();
  kucoin.stop();
  mexc.stop();
  bitfinex.stop();
  server.close(() => process.exit(0));
});
