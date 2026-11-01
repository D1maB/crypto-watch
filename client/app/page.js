'use client';

import { useEffect, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000';

export default function Home() {
  const [prices, setPrices] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/prices`)
      .then((res) => res.json())
      .then(setPrices)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p>Error: {error}</p>;
  if (!prices) return <p>Loading…</p>;

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Crypto Watch</h1>
      <ul>
        {Object.entries(prices).map(([coin, data]) => (
          <li key={coin}>
            {coin}: ${data.usd?.toLocaleString()} ({data.usd_24h_change?.toFixed(2)}%)
          </li>
        ))}
      </ul>
    </main>
  );
}
