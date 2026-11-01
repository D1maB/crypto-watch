'use client';

import { useEffect, useState } from 'react';

const WS_BASE = process.env.NEXT_PUBLIC_WS_BASE ?? 'ws://localhost:4000/ws';

function formatNumber(value, digits = 2) {
  if (value == null || Number.isNaN(value)) return '—';
  return value.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function itemKey(item) {
  return item.key ?? `${item.exchange}:${item.instId ?? item.symbol}`;
}

export default function Home() {
  const [prices, setPrices] = useState({});
  const [status, setStatus] = useState('connecting');

  useEffect(() => {
    const ws = new WebSocket(WS_BASE);

    ws.onopen = () => setStatus('live');
    ws.onclose = () => setStatus('disconnected');
    ws.onerror = () => setStatus('error');

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'snapshot') {
          const next = {};
          for (const item of msg.data ?? []) next[itemKey(item)] = item;
          setPrices(next);
        } else if (msg.type === 'update') {
          setPrices((prev) => ({ ...prev, [itemKey(msg.data)]: msg.data }));
        }
      } catch (err) {
        console.error('ws parse error', err);
      }
    };

    return () => ws.close();
  }, []);

  const entries = Object.values(prices).sort((a, b) =>
    `${a.exchange}${a.symbol}`.localeCompare(`${b.exchange}${b.symbol}`)
  );

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Crypto Watch</h1>
      <p>Status: {status}</p>
      {entries.length === 0 ? (
        <p>Waiting for prices…</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {entries.map((item) => {
            const positive = item.changePercent >= 0;
            return (
              <li
                key={itemKey(item)}
                style={{
                  padding: '1rem',
                  marginBottom: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                }}
              >
                <strong>
                  {item.exchange.toUpperCase()} — {String(item.symbol).toUpperCase()}
                </strong>
                <div>Price: ${formatNumber(item.price)}</div>
                <div style={{ color: positive ? 'green' : 'red' }}>
                  24h: {positive ? '+' : ''}
                  {formatNumber(item.changePercent)}%
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
