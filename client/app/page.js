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

const EXCHANGE_ORDER = ['binance', 'okx', 'bybit', 'bitget', 'kucoin', 'mexc', 'bitfinex'];
const EXCHANGE_LABELS = { binance: 'B', okx: 'O', bybit: 'By', bitget: 'Bit', kucoin: 'Ku', mexc: 'Mx', bitfinex: 'Bfx' };
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
  // Group by normalized symbol for comparison
  const symbolGroups = entries.reduce((acc, item) => {
    const normalized = String(item.symbol).replace('-', '').toUpperCase();
    (acc[normalized] ??= []).push(item);
    return acc;
  }, {});

  const quoteOf = (symbol) => {
  const s = String(symbol).toUpperCase();
  if (s.endsWith('USDT')) return 'USDT';
  if (s.endsWith('ETH')) return 'ETH';
  if (s.endsWith('BTC')) return 'BTC';
  return 'OTHER';
};
const groupLabel = (quote) => {
  if (quote === 'USDT') return 'USDT pairs';
  if (quote === 'ETH') return 'ETH pairs';
  if (quote === 'BTC') return 'BTC pairs';
  return 'Other pairs';
};
const symbolList = Object.keys(symbolGroups).sort((a, b) => {
  const qa = quoteOf(a);
  const qb = quoteOf(b);
  if (qa !== qb) return qa.localeCompare(qb);
  return String(a).localeCompare(String(b));
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
            <div style={{ overflow: 'auto', maxHeight: '70vh', border: '1px solid #eee', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ddd' }}>
                    <th style={{ padding: '0.35rem', position: 'sticky', left: 0, top: 0, background: '#fff', zIndex: 4, fontWeight: 'bold' }}>Symbol</th>
                    {EXCHANGE_ORDER.map(ex => <th key={ex} style={{ padding: '0.35rem', textTransform: 'capitalize', position: 'sticky', top: 0, background: '#fff', zIndex: 2 }}>{ex}</th>)}
                    {EXCHANGE_PAIRS.map(([a, b]) => (
                      <th key={`${a}-${b}`} style={{ padding: '0.35rem', position: 'sticky', top: 0, background: '#fff', zIndex: 2 }}>
                        Diff ({EXCHANGE_LABELS[a]} vs {EXCHANGE_LABELS[b]})
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {symbolList.flatMap((symbol, index) => {
                    const group = quoteOf(symbol);
                    const prevGroup = index > 0 ? quoteOf(symbolList[index - 1]) : null;
                    const isGroupStart = group !== prevGroup;
                    const rows = [];
                    const items = symbolGroups[symbol];
                    const prices = {
                      binance: items.find(i => i.exchange === 'binance')?.price,
                      okx: items.find(i => i.exchange === 'okx')?.price,
                      bybit: items.find(i => i.exchange === 'bybit')?.price,
                      bitget: items.find(i => i.exchange === 'bitget')?.price,
                      kucoin: items.find(i => i.exchange === 'kucoin')?.price,
                      mexc: items.find(i => i.exchange === 'mexc')?.price,
                      bitfinex: items.find(i => i.exchange === 'bitfinex')?.price,
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

                    if (isGroupStart) {
                      rows.push(
                        <tr key={`group-${group}`}>
                          <td colSpan={1 + EXCHANGE_ORDER.length + EXCHANGE_PAIRS.length} style={{ padding: '0.35rem', fontWeight: 'bold', background: '#f3f4f6' }}>
                            {groupLabel(group)}
                          </td>
                        </tr>
                      );
                    }
                    rows.push(
                      <tr key={symbol} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '0.35rem', fontWeight: 'bold', position: 'sticky', left: 0, background: '#fff', zIndex: 1 }}>{symbol}</td>
                        <td style={{ padding: '0.35rem' }}>${formatNumber(prices.binance)}</td>
                        <td style={{ padding: '0.35rem' }}>${formatNumber(prices.okx)}</td>
                        <td style={{ padding: '0.35rem' }}>${formatNumber(prices.bybit)}</td>
                        <td style={{ padding: '0.35rem' }}>${formatNumber(prices.bitget)}</td>
                        <td style={{ padding: '0.35rem' }}>${formatNumber(prices.kucoin)}</td>
                        <td style={{ padding: '0.35rem' }}>${formatNumber(prices.mexc)}</td>
                        <td style={{ padding: '0.35rem' }}>${formatNumber(prices.bitfinex)}</td>
                        {EXCHANGE_PAIRS.map(([a, b]) => {
                          const d = calcDiff(prices[a], prices[b]);
                          return (
                            <td key={`${a}-${b}`} style={{ padding: '0.35rem', color: d.color }}>
                              {d.text}
                            </td>
                          );
                        })}
                      </tr>
                    );
                    return rows;
                  })}
                </tbody>
              </table>
            </div>
          </section>

        </>
      )}
    </main>
  );
}
