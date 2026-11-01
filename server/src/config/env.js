import 'dotenv/config';

export const PORT = Number(process.env.PORT ?? 4000);
export const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? 'http://localhost:3000';
