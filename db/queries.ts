import { db } from './db';
import { people, projects, projectAllocations } from './schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';

export interface ScheduleRow {
  projectId: number;
  projectType: string;
  projectClient: string;
  projectOrder: string;
  projectPm: string;
  personId: number;
  personFirstname: string;
  personLastname: string;
  personEmail: string;
  personLevel: string | null;
  personTeam: string | null;
  personRole: string | null;
}

export interface AllocationData {
  projectId: number;
  personId: number;
  date: string;
  hours: number;
}

export interface DailyTotals {
  personId: number;
  date: string;
  totalHours: number;
}

/**
 * Recupera tutte le righe di scheduling (progetti × persone) per il mese
 */
export async function getScheduleRows(
  month: number,
  year: number
): Promise<ScheduleRow[]> {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0);
  const endDateStr = `${year}-${String(month).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

  // Trova tutte le coppie progetto-persona che hanno almeno un'allocazione nel mese
  const result = await db
    .selectDistinct({
      projectId: projects.id,
      projectType: projects.type,
      projectClient: projects.client,
      projectOrder: projects.order,
      projectPm: projects.pm,
      personId: people.id,
      personFirstname: people.firstname,
      personLastname: people.lastname,
      personEmail: people.email,
      personLevel: people.level,
      personTeam: people.team,
      personRole: people.role,
    })
    .from(projectAllocations)
    .innerJoin(projects, eq(projectAllocations.projectId, projects.id))
    .innerJoin(people, eq(projectAllocations.personId, people.id))
    .where(
      and(
        gte(projectAllocations.date, startDate),
        lte(projectAllocations.date, endDateStr)
      )
    )
    .orderBy(
      projects.client,
      projects.order,
      people.lastname,
      people.firstname
    );

  return result;
}

/**
 * Recupera tutte le allocazioni per il mese
 */
export async function getAllocations(
  month: number,
  year: number
): Promise<AllocationData[]> {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0);
  const endDateStr = `${year}-${String(month).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

  const result = await db
    .select({
      projectId: projectAllocations.projectId,
      personId: projectAllocations.personId,
      date: projectAllocations.date,
      hours: projectAllocations.hours,
    })
    .from(projectAllocations)
    .where(
      and(
        gte(projectAllocations.date, startDate),
        lte(projectAllocations.date, endDateStr)
      )
    );

  return result;
}

/**
 * Calcola i totali giornalieri per ogni persona (per identificare sovrallocazioni)
 */
export async function getDailyTotals(
  month: number,
  year: number
): Promise<DailyTotals[]> {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0);
  const endDateStr = `${year}-${String(month).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

  const result = await db
    .select({
      personId: projectAllocations.personId,
      date: projectAllocations.date,
      totalHours: sql<number>`SUM(${projectAllocations.hours})`.as(
        'total_hours'
      ),
    })
    .from(projectAllocations)
    .where(
      and(
        gte(projectAllocations.date, startDate),
        lte(projectAllocations.date, endDateStr)
      )
    )
    .groupBy(projectAllocations.personId, projectAllocations.date);

  return result;
}

/**
 * Recupera tutti i clienti unici
 */
export async function getUniqueClients(): Promise<string[]> {
  const result = await db
    .selectDistinct({ client: projects.client })
    .from(projects)
    .orderBy(projects.client);

  return result.map((r: { client: string }) => r.client);
}

/**
 * Recupera tutti i PM unici
 */
export async function getUniquePMs(): Promise<string[]> {
  const result = await db
    .selectDistinct({ pm: projects.pm })
    .from(projects)
    .orderBy(projects.pm);

  return result.map((r: { pm: string }) => r.pm);
}

/**
 * Recupera tutte le persone
 */
export async function getAllPeople() {
  return await db
    .select()
    .from(people)
    .orderBy(people.lastname, people.firstname);
}

/**
 * Recupera tutti i team unici
 */
export async function getUniqueTeams(): Promise<string[]> {
  const result = await db
    .selectDistinct({ team: people.team })
    .from(people)
    .where(sql`${people.team} IS NOT NULL`)
    .orderBy(people.team);

  return result
    .map((r: { team: string | null }) => r.team)
    .filter((team): team is string => team !== null);
}
