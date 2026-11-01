import http from 'node:http';
import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { PORT, CLIENT_ORIGIN } from './config/env.js';
import { BinancePriceStream } from './services/binanceService.js';
import { OkxPriceStream } from './services/okxService.js';

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

const binance = new BinancePriceStream();
const okx = new OkxPriceStream();
binance.start();
okx.start();

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/prices', (_req, res) => {
  res.json([...binance.snapshot(), ...okx.snapshot()]);
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
  socket.send(JSON.stringify({ type: 'snapshot', data: [...binance.snapshot(), ...okx.snapshot()] }));
});

binance.onUpdate((update) => broadcast({ type: 'update', data: update }));
okx.onUpdate((update) => broadcast({ type: 'update', data: update }));

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

process.on('SIGTERM', () => {
  binance.stop();
  okx.stop();
  server.close(() => process.exit(0));
});
