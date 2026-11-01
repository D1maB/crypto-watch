import 'dotenv/config';

export const PORT = Number(process.env.PORT ?? 4000);
export const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? 'http://localhost:3000';
export const COINGECKO_BASE = process.env.COINGECKO_BASE ?? 'https://api.coingecko.com/api/v3';
