import { config } from 'dotenv';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

if (process.env.NODE_ENV !== 'production') {
  config({ path: '.env' });
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

// Connessione standard per seed scripts
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export const seedDb = drizzle(pool);
export { pool };