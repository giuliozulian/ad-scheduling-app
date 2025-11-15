import {
  pgTable,
  serial,
  timestamp,
  varchar,
  integer,
  date,
  real,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const people = pgTable('people', {
  id: serial('id').primaryKey(),
  firstname: varchar('firstname', { length: 100 }).notNull(),
  lastname: varchar('lastname', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  level: varchar('level', { length: 50 }),
  team: varchar('team', { length: 50 }),
  role: varchar('role', { length: 50 }),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

export type People = typeof people.$inferSelect;

export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  type: varchar('type', { length: 100 }).notNull(),
  client: varchar('client', { length: 255 }).notNull(),
  order: varchar('order', { length: 100 }).notNull(),
  pm: varchar('pm', { length: 100 }).notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

export type Project = typeof projects.$inferSelect;

export const projectAllocations = pgTable(
  'project_allocations',
  {
    id: serial('id').primaryKey(),
    projectId: integer('project_id')
      .references(() => projects.id, { onDelete: 'cascade' })
      .notNull(),
    personId: integer('person_id')
      .references(() => people.id, { onDelete: 'cascade' })
      .notNull(),
    date: date('date').notNull(),
    hours: real('hours').notNull().default(0),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow(),
  },
  (table) => ({
    unq: uniqueIndex('unique_project_day_person').on(
      table.projectId,
      table.personId,
      table.date
    ),
  })
);

export type ProjectAllocation = typeof projectAllocations.$inferSelect;
export type NewProjectAllocation = typeof projectAllocations.$inferInsert;
