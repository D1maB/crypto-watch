import express from 'express';
import cors from 'cors';
import { PORT, CLIENT_ORIGIN, COINGECKO_BASE } from './config/env.js';
import { fetchPrices } from './services/priceService.js';

const app = express();

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/prices', async (req, res) => {
  try {
    const coins = req.query.coins
      ? String(req.query.coins).split(',').map((c) => c.trim()).filter(Boolean)
      : undefined;
    const prices = await fetchPrices(coins, COINGECKO_BASE);
    res.json(prices);
  } catch (error) {
    res.status(502).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
