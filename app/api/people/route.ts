import { NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { people } from '../../../db/schema/index';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
});
const db = drizzle(pool);

export async function GET() {
  const result = await db
    .select({
      id: people.id,
      name: people.firstname,
      surname: people.lastname,
      email: people.email,
      team: people.team,
      level: people.level,
    })
    .from(people);
  return NextResponse.json(result);
}
