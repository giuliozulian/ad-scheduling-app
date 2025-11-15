import { NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { projects } from '../../../../db/schema/index';
import { eq } from 'drizzle-orm';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
});
const db = drizzle(pool);

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const numId = Number(id);
  if (isNaN(numId)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }
  try {
    await db.delete(projects).where(eq(projects.id, numId));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Errore eliminazione' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const numId = Number(id);
  if (isNaN(numId)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }
  const body = await req.json();
  try {
    await db
      .update(projects)
      .set({
        type: body.type,
        client: body.client,
        order: body.order,
        pm: body.pm,
      })
      .where(eq(projects.id, numId));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Errore aggiornamento' },
      { status: 500 }
    );
  }
}
