import { NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { projects } from '../../../db/schema/index';

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
      id: projects.id,
      type: projects.type,
      client: projects.client,
      order: projects.order,
      pm: projects.pm,
    })
    .from(projects);
  return NextResponse.json(result);
}
