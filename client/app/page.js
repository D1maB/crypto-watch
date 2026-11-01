'use client';

import { useEffect, useRef, useState } from 'react';
import { WATCH_APPEND_DIFF_THRESHOLD } from '../config/watch.js';

const WS_BASE = process.env.NEXT_PUBLIC_WS_BASE ?? 'ws://localhost:4000/ws';

function formatNumber(value, digits = 4) {
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
  const [showComparison, setShowComparison] = useState(false);
  const [watchSymbols, setWatchSymbols] = useState([]);
  const [watchMinutes] = useState(20);
  const [watching, setWatching] = useState(false);
  const [watchStartAt, setWatchStartAt] = useState(null);
  const [watchSampleCount, setWatchSampleCount] = useState(0);
  const [watchRemaining, setWatchRemaining] = useState(0);
  const prevPricesRef = useRef(new Map());
  const watchingRef = useRef(false);
  const watchSymbolsRef = useRef(new Set());
  const watchIntervalRef = useRef(null);

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
          for (const item of msg.data ?? []) {
            const key = itemKey(item);
            next[key] = { ...item, rtChangePercent: null };
            prevPricesRef.current.set(key, item.price);
          }
          setPrices(next);
        } else if (msg.type === 'update') {
          const key = itemKey(msg.data);
          const prev = prevPricesRef.current.get(key);
          const price = Number(msg.data.price);
          const rtChangePercent =
            Number.isFinite(prev) && Number.isFinite(price) && prev !== 0
              ? ((price - prev) / prev) * 100
              : null;
          prevPricesRef.current.set(key, price);
          setPrices((prev) => ({ ...prev, [key]: { ...msg.data, rtChangePercent } }));

          const normalizedSymbol = String(msg.data.symbol ?? '').replace('-', '').toUpperCase();
          if (watchingRef.current && watchSymbolsRef.current.has(normalizedSymbol)) {
            const samplePrice = Number(msg.data.price);
            if (Number.isFinite(samplePrice)) {
              setWatchSampleCount((prev) => prev + 1);
            }
          }
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

  const allExchangePairs = Object.entries(symbolGroups).flatMap(([symbol, items]) => {
    const prices = items
      .map((item) => ({ ex: item.exchange, price: Number(item.price) }))
      .filter((item) => Number.isFinite(item.price));
    const pairs = [];
    for (let i = 0; i < prices.length; i += 1) {
      for (let j = i + 1; j < prices.length; j += 1) {
        const a = prices[i];
        const b = prices[j];
        const diff = ((b.price - a.price) / a.price) * 100;
        pairs.push({ symbol, exA: a.ex, priceA: a.price, exB: b.ex, priceB: b.price, diff });
      }
    }
    return pairs;
  }).sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff)).filter((item) => Math.abs(item.diff) < 20);

  const crossMovers = allExchangePairs.slice(0, 2);

  const [watchedMovers, setWatchedMovers] = useState([]);
  useEffect(() => {
    const qualifying = allExchangePairs.filter((item) => Math.abs(item.diff) > WATCH_APPEND_DIFF_THRESHOLD);
    setWatchedMovers((prev) => {
      const keyOf = (item) => `${item.symbol}-${item.exA}-${item.exB}`;
      const freshByKey = new Map(qualifying.map((item) => [keyOf(item), item]));
      const updated = prev
        .map((item) => {
          const fresh = freshByKey.get(keyOf(item)) ?? item;
          const currentDiff = Number.isFinite(fresh.diff) ? fresh.diff : item.diff;
          if (!Number.isFinite(currentDiff) || Math.abs(currentDiff) >= 20) return null;
          const previousMax = Number.isFinite(item.maxDiff) ? item.maxDiff : (Number.isFinite(item.firstDiff) ? item.firstDiff : currentDiff);
          const nextMax = Math.abs(currentDiff) > Math.abs(previousMax) ? currentDiff : previousMax;
          return {
            ...fresh,
            addedAt: item.addedAt ?? Date.now(),
            firstDiff: item.firstDiff ?? fresh.diff,
            maxDiff: nextMax,
          };
        })
        .filter(Boolean);
      const existing = new Set(updated.map(keyOf));
      const additions = qualifying
        .filter((item) => !existing.has(keyOf(item)))
        .map((item) => ({ ...item, addedAt: Date.now(), firstDiff: item.diff, maxDiff: item.diff }));
      return [...updated, ...additions].slice(-12);
    });
  }, [allExchangePairs]);

  const liveWatchedMovers = watchedMovers
    .map((item) => {
      const key = `${item.symbol}-${item.exA}-${item.exB}`;
      const fresh = allExchangePairs.find((candidate) => `${candidate.symbol}-${candidate.exA}-${candidate.exB}` === key) ?? item;
      const currentDiff = Number.isFinite(fresh.diff) ? fresh.diff : item.diff;
      const previousMax = Number.isFinite(item.maxDiff) ? item.maxDiff : (Number.isFinite(item.firstDiff) ? item.firstDiff : currentDiff);
      const nextMax = Math.abs(currentDiff) > Math.abs(previousMax) ? currentDiff : previousMax;
      return { ...fresh, addedAt: item.addedAt ?? Date.now(), firstDiff: item.firstDiff ?? fresh.diff, maxDiff: nextMax };
    })
    .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));

  const groupedWatchedMovers = liveWatchedMovers.reduce((acc, item) => {
    const key = String(item.symbol).toUpperCase();
    (acc[key] ??= []).push(item);
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

  useEffect(() => {
    if (!watching) {
      if (watchIntervalRef.current) {
        clearInterval(watchIntervalRef.current);
        watchIntervalRef.current = null;
      }
      return;
    }

    const endAt = Date.now() + watchMinutes * 60 * 1000;
    setWatchRemaining(watchMinutes * 60);
    watchIntervalRef.current = setInterval(() => {
      const remainingMs = Math.max(0, endAt - Date.now());
      setWatchRemaining(Math.ceil(remainingMs / 1000));
      if (remainingMs <= 0) {
        setWatching(false);
        watchingRef.current = false;
        watchSymbolsRef.current = new Set();
        setWatchSymbols([]);
        if (watchIntervalRef.current) clearInterval(watchIntervalRef.current);
        watchIntervalRef.current = null;
      }
    }, 1000);

    return () => {
      if (watchIntervalRef.current) clearInterval(watchIntervalRef.current);
    };
  }, [watching, watchMinutes]);

  const stopWatch = () => {
    watchingRef.current = false;
    setWatching(false);
    watchSymbolsRef.current = new Set();
    setWatchSymbols([]);
  };

  useEffect(() => {
    const qualifying = [...new Set(crossMovers
      .map((item) => String(item.symbol).replace('-', '').toUpperCase()))].slice(0, 2);
    const newSymbols = qualifying.filter((symbol) => !watchSymbolsRef.current.has(symbol));

    if (newSymbols.length > 0) {
      newSymbols.forEach((symbol) => watchSymbolsRef.current.add(symbol));
      setWatchSymbols([...watchSymbolsRef.current]);
    }

    if (!watching && watchSymbolsRef.current.size > 0) {
      watchingRef.current = true;
      setWatchStartAt(Date.now());
      setWatchSampleCount(0);
      setWatching(true);
    }
  }, [entries, watching]);

  return (
    <main style={{ padding: '1rem', fontFamily: 'sans-serif', fontSize: '1rem' }}>
      <h1 style={{ marginTop: 0 }}>Crypto Watch</h1>
      <p>Status: {status} · Tickers: {symbolList.length}</p>
      <section style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>Watch Ticker</h2>
        <p style={{ margin: '0 0 0.75rem', fontSize: '0.925rem', color: '#666' }}>New items are appended when an exchange pair differs by more than {WATCH_APPEND_DIFF_THRESHOLD}%.</p>
        {liveWatchedMovers.length === 0 ? (
          <p style={{ margin: 0 }}>Waiting for realtime exchange differences...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(240px, 1fr))', gap: '1rem' }}>
            {Object.entries(groupedWatchedMovers).map(([symbol, items]) => {
              const representative = items[0];
              const positive = (representative?.diff ?? 0) >= 0;
              return (
                <div
                  key={symbol}
                  style={{
                    padding: '1rem',
                    border: `1px solid ${positive ? '#bbf7d0' : '#fecaca'}`,
                    borderRadius: '12px',
                    background: positive ? 'linear-gradient(135deg, #f0fdf4, #ecfeff)' : 'linear-gradient(135deg, #fef2f2, #fff7ed)',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <strong style={{ fontSize: '1rem' }}>
                      {symbol}
                      <span style={{ marginLeft: '0.5rem', fontSize: '0.925rem', fontWeight: 'bold', display: 'inline-flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <span style={{ color: (items[0]?.firstDiff ?? 0) >= 0 ? '#16a34a' : '#dc2626' }}>
                          {(items[0]?.firstDiff ?? 0) >= 0 ? '+' : ''}
                          {(items[0]?.firstDiff ?? 0).toFixed(2)}%
                          <span style={{ marginLeft: '0.35rem', color: '#666', fontWeight: 'normal', fontSize: '0.7rem' }}>
                            (first diff: {String(items[0]?.exA ?? '').toUpperCase()} → {String(items[0]?.exB ?? '').toUpperCase()})
                          </span>
                        </span>
                        <span style={{ color: (items.reduce((max, item) => Math.abs(item.diff) > Math.abs(max.diff) ? item : max, items[0])?.diff ?? 0) >= 0 ? '#16a34a' : '#dc2626' }}>
                          {(() => {
                            const max = items.reduce((current, item) => Math.abs(item.diff) > Math.abs(current.diff) ? item : current, items[0]);
                            return `${max.diff >= 0 ? '+' : ''}${max.diff.toFixed(2)}%`;
                          })()}
                          <span style={{ marginLeft: '0.35rem', color: '#666', fontWeight: 'normal', fontSize: '0.7rem' }}>
                            (max diff: {String(items.reduce((current, item) => Math.abs(item.diff) > Math.abs(current.diff) ? item : current, items[0]).exA ?? '').toUpperCase()} → {String(items.reduce((current, item) => Math.abs(item.diff) > Math.abs(current.diff) ? item : current, items[0]).exB ?? '').toUpperCase()})
                          </span>
                        </span>
                      </span>
                    </strong>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
                      {(() => {
                        const addedAt = items.reduce((earliest, item) => Math.min(earliest, item.addedAt ?? Date.now()), Infinity);
                        const elapsed = Math.max(0, Math.floor((Date.now() - addedAt) / 1000));
                        return (
                          <span style={{ padding: '0.25rem 0.5rem', borderRadius: '999px', background: '#2563eb', color: '#fff', fontSize: '0.925rem', fontWeight: 'bold' }}>
                            {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  <div style={{ display: 'grid', gap: '0.5rem' }}>
                    {items.map((item, idx) => (
                      <div
                        key={`${item.symbol}-${item.exA}-${item.exB}-${idx}`}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}
                      >
                        <div style={{ textAlign: 'left', flex: 1 }}>
                          <div style={{ fontSize: '0.875rem', color: '#555', textTransform: 'capitalize' }}>{item.exA}</div>
                          <div style={{ fontWeight: 'bold' }}>${formatNumber(item.priceA)}</div>
                        </div>
                        <div style={{ fontSize: '1.2rem', color: '#666' }}>&rarr;</div>
                        <div style={{ textAlign: 'left', flex: 1 }}>
                          <div style={{ fontSize: '0.875rem', color: '#555', textTransform: 'capitalize' }}>{item.exB}</div>
                          <div style={{ fontWeight: 'bold' }}>${formatNumber(item.priceB)}</div>
                        </div>
                        <div style={{ textAlign: 'left', flex: 1 }}>
                          <div style={{ fontSize: '0.875rem', color: '#555' }}>diff</div>
                          <div style={{ fontWeight: 'bold', color: item.diff >= 0 ? '#16a34a' : '#dc2626' }}>
                            {item.diff >= 0 ? '+' : ''}
                            {item.diff.toFixed(2)}%
                          </div>

                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>{watchSampleCount} samples recorded</div>
                </div>
              );
            })}
          </div>
        )}
        {watching && (
          <div style={{ marginTop: '0.75rem' }}>
            <button onClick={stopWatch} style={{ padding: '0.35rem 0.65rem', border: '1px solid #ddd', borderRadius: '8px', background: '#fff', cursor: 'pointer' }}>
              Stop
            </button>
          </div>
        )}
      </section>
      {crossMovers.length > 0 && (
        <section style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ marginBottom: '0.5rem' }}>Realtime Top Movers</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {crossMovers.map((item, idx) => {
              const positive = item.diff >= 0;
              return (
                <li
                  key={`${item.symbol}-${item.exA}-${item.exB}-${idx}`}
                  style={{
                    flex: '1 1 260px',
                    padding: '1rem',
                    border: `1px solid ${positive ? '#bbf7d0' : '#fecaca'}`,
                    borderRadius: '12px',
                    background: positive ? 'linear-gradient(135deg, #f0fdf4, #ecfeff)' : 'linear-gradient(135deg, #fef2f2, #fff7ed)',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <strong style={{ fontSize: '1rem' }}>{String(item.symbol).toUpperCase()}</strong>
                    <span
                      style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '999px',
                        background: positive ? '#16a34a' : '#dc2626',
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: '0.85rem',
                      }}
                    >
                      {positive ? '+' : ''}
                      {item.diff.toFixed(2)}%
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <div style={{ textAlign: 'left', flex: 1 }}>
                      <div style={{ fontSize: '0.875rem', color: '#555', textTransform: 'capitalize' }}>{item.exA}</div>
                      <div style={{ fontWeight: 'bold' }}>${formatNumber(item.priceA)}</div>
                    </div>
                    <div style={{ fontSize: '1.2rem', color: '#666' }}>&rarr;</div>
                    <div style={{ textAlign: 'left', flex: 1 }}>
                      <div style={{ fontSize: '0.875rem', color: '#555', textTransform: 'capitalize' }}>{item.exB}</div>
                      <div style={{ fontWeight: 'bold' }}>${formatNumber(item.priceB)}</div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
      {entries.length === 0 ? (
        <p>Waiting for prices…</p>
      ) : (
        <>
          <button
            onClick={() => setShowComparison((value) => !value)}
            style={{ marginBottom: '1rem', padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: '8px', background: '#fff', cursor: 'pointer' }}
          >
            {showComparison ? 'Hide' : 'Show'} Price Comparison Table
          </button>
          {showComparison ? (
            <section style={{ marginBottom: '3rem' }}>
              <h2 style={{ marginBottom: '1rem' }}>Price Comparison ({symbolList.length} tickers)</h2>
            <div style={{ overflow: 'auto', maxHeight: '70vh', border: '1px solid #eee', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.925rem', whiteSpace: 'nowrap' }}>
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
                      if (!p1 || !p2 || Number(p1) <= 0 || Number(p2) <= 0) return { text: '—', num: null };
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
          ) : null}

        </>
      )}
    </main>
  );
}
