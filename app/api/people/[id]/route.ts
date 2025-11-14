import { NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { people } from '../../../../db/schema/index';
import { eq } from 'drizzle-orm/sql/expressions/conditions';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
});
const db = drizzle(pool);

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const numId = Number(id);
  if (!numId)
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  try {
    await db.delete(people).where(eq(people.id, numId));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Errore eliminazione' }, { status: 500 });
  }
}
