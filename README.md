# crypto-watch

Real-time cryptocurrency price tracker. Streams tickers from Binance, OKX, and Bybit over WebSocket and displays them on a Next.js page.

## Run (Docker only)

```bash
docker compose up
```

First run installs dependencies inside containers (a couple of minutes). Subsequent runs reuse the persisted volumes and start quickly. No rebuild needed.

- Client: http://localhost:3000
- API: http://localhost:4000
- Health: http://localhost:4000/health
- Prices: http://localhost:4000/api/prices

Stop:

```bash
docker compose down
```

Reset dependencies/volumes:

```bash
docker compose down -v
```

## Stack

- Server: Node.js + Express + `ws`
- Client: Next.js (App Router)
- Exchanges: Binance, OKX, Bybit public WebSocket tickers
- Tickers: BTC, ETH, SOL, XRP (USDT pairs)
