const DEFAULT_COINS = ['bitcoin', 'ethereum'];

/**
 * Fetch current prices for the given coin ids from CoinGecko.
 * Returns a map of coinId -> { usd, usd_24h_change }.
 */
export async function fetchPrices(coinIds = DEFAULT_COINS, baseUrl) {
  const base = baseUrl ?? 'https://api.coingecko.com/api/v3';
  const ids = coinIds.join(',');
  const url = `${base}/simple/price?ids=${encodeURIComponent(ids)}&vs_currencies=usd&include_24hr_change=true`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Price fetch failed: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  return data;
}
