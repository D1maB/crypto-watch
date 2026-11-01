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

const EXCHANGE_ORDER = ['binance', 'okx', 'bybit', 'bitget', 'kucoin'];
const EXCHANGE_LABELS = { binance: 'B', okx: 'O', bybit: 'By', bitget: 'Bit', kucoin: 'Ku' };
const EXCHANGE_PAIRS = EXCHANGE_ORDER.flatMap((a, i) =>
  EXCHANGE_ORDER.slice(i + 1).map((b) => [a, b])
);

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

  const entries = Object.values(prices);
  const grouped = entries.reduce((acc, item) => {
    const key = item.exchange ?? 'unknown';
    (acc[key] ??= []).push(item);
    return acc;
  }, {});

  // Group by normalized symbol for comparison
  const symbolGroups = entries.reduce((acc, item) => {
    const normalized = String(item.symbol).replace('-', '').toUpperCase();
    (acc[normalized] ??= []).push(item);
    return acc;
  }, {});

  const symbolList = Object.keys(symbolGroups).sort();

  const exchanges = Object.keys(grouped).sort((a, b) => {
    const ai = EXCHANGE_ORDER.indexOf(a);
    const bi = EXCHANGE_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ marginTop: 0 }}>Crypto Watch</h1>
      <p>Status: {status}</p>
      {entries.length === 0 ? (
        <p>Waiting for prices…</p>
      ) : (
        <>
          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>Price Comparison</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ddd' }}>
                    <th style={{ padding: '0.75rem' }}>Symbol</th>
                    {EXCHANGE_ORDER.map(ex => <th key={ex} style={{ padding: '0.75rem', textTransform: 'capitalize' }}>{ex}</th>)}
                    {EXCHANGE_PAIRS.map(([a, b]) => (
                      <th key={`${a}-${b}`} style={{ padding: '0.75rem' }}>
                        Diff ({EXCHANGE_LABELS[a]} vs {EXCHANGE_LABELS[b]})
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {symbolList.map(symbol => {
                    const items = symbolGroups[symbol];
                    const prices = {
                      binance: items.find(i => i.exchange === 'binance')?.price,
                      okx: items.find(i => i.exchange === 'okx')?.price,
                      bybit: items.find(i => i.exchange === 'bybit')?.price,
                      bitget: items.find(i => i.exchange === 'bitget')?.price,
                      kucoin: items.find(i => i.exchange === 'kucoin')?.price,
                    };

                    const calcDiff = (p1, p2) => {
                      if (!p1 || !p2) return { text: '—', num: null };
                      const diff = ((p1 - p2) / p2) * 100;
                      const absDiff = Math.abs(diff);
                      return {
                        text: diff.toFixed(4) + '%',
                        num: diff,
                        color: absDiff > 0.01 ? 'green' : 'inherit'
                      };
                    };

                    return (
                      <tr key={symbol} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{symbol}</td>
                        <td style={{ padding: '0.75rem' }}>${formatNumber(prices.binance)}</td>
                        <td style={{ padding: '0.75rem' }}>${formatNumber(prices.okx)}</td>
                        <td style={{ padding: '0.75rem' }}>${formatNumber(prices.bybit)}</td>
                        <td style={{ padding: '0.75rem' }}>${formatNumber(prices.bitget)}</td>
                        <td style={{ padding: '0.75rem' }}>${formatNumber(prices.kucoin)}</td>
                        {EXCHANGE_PAIRS.map(([a, b]) => {
                          const d = calcDiff(prices[a], prices[b]);
                          return (
                            <td key={`${a}-${b}`} style={{ padding: '0.75rem', color: d.color }}>
                              {d.text}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${exchanges.length}, minmax(240px, 1fr))`,
              gap: '1.5rem',
              alignItems: 'start',
            }}
          >
            {exchanges.map((exchange) => (
              <section
                key={exchange}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '12px',
                  padding: '1rem',
                  background: '#fafafa',
                }}
              >
                <h2 style={{ textTransform: 'capitalize', marginTop: 0 }}>
                  {exchange}
                </h2>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {grouped[exchange]
                    .sort((a, b) => String(a.symbol).localeCompare(String(b.symbol)))
                    .map((item) => {
                      const positive = item.changePercent >= 0;
                      return (
                        <li
                          key={itemKey(item)}
                          style={{
                            padding: '0.75rem',
                            marginBottom: '0.5rem',
                            border: '1px solid #e5e5e5',
                            borderRadius: '8px',
                            background: '#fff',
                          }}
                        >
                          <strong>{String(item.symbol).toUpperCase()}</strong>
                          <div>Price: ${formatNumber(item.price)}</div>
                          <div style={{ color: positive ? 'green' : 'red' }}>
                            24h: {positive ? '+' : ''}
                            {formatNumber(item.changePercent)}%
                          </div>
                        </li>
                      );
                    })}
                </ul>
              </section>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
