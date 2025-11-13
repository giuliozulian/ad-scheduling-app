import { pgTable, serial, timestamp, varchar } from 'drizzle-orm/pg-core';

export const people = pgTable('people', {
  id: serial('id').primaryKey(),
  firstname: varchar('firstname', { length: 100 }).notNull(),
  lastname: varchar('lastname', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  level: varchar('level', { length: 50 }),
  team: varchar('team', { length: 50 }),
  role: varchar('role', { length: 50 }),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
}); 

export type People = typeof people.$inferSelect;