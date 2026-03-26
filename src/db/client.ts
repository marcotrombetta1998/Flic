import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('Missing DATABASE_URL');
}

const sslConfig = process.env.NODE_ENV === 'production'
  ? { rejectUnauthorized: true }
  : process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false };
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: sslConfig });
export const db = drizzle(pool, { schema });
