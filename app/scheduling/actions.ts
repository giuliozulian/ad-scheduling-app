'use server';

import { db } from '@/db/db';
import { projectAllocations } from '@/db/schema';
import {
  getScheduleRows,
  getAllocations,
  getDailyTotals,
  getUniqueClients,
  getUniquePMs,
  getAllPeople,
} from '@/db/queries';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getAllocationKey } from '@/lib/date-utils';
import type { AllocationMap, DailyTotalsMap } from '@/lib/scheduling-store';

export interface SchedulingData {
  rows: Array<{
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
  }>;
  allocations: AllocationMap;
  dailyTotals: DailyTotalsMap;
  clients: string[];
  pms: string[];
  people: Array<{
    id: number;
    firstname: string;
    lastname: string;
    email: string;
  }>;
}

/**
 * Recupera tutti i dati di scheduling per un mese
 */
export async function getScheduling(
  month: number,
  year: number
): Promise<SchedulingData> {
  // Esegui query in parallelo
  const [rows, allocationsData, dailyTotalsData, clients, pms, people] =
    await Promise.all([
      getScheduleRows(month, year),
      getAllocations(month, year),
      getDailyTotals(month, year),
      getUniqueClients(),
      getUniquePMs(),
      getAllPeople(),
    ]);

  // Converti allocations in map
  const allocations: AllocationMap = {};
  allocationsData.forEach(
    (alloc: {
      projectId: number;
      personId: number;
      date: string;
      hours: number;
    }) => {
      const key = getAllocationKey(alloc.projectId, alloc.personId, alloc.date);
      allocations[key] = alloc.hours;
    }
  );

  // Converti daily totals in map
  const dailyTotals: DailyTotalsMap = {};
  dailyTotalsData.forEach(
    (total: { personId: number; date: string; totalHours: number }) => {
      const key = `${total.personId}-${total.date}`;
      dailyTotals[key] = total.totalHours;
    }
  );

  return {
    rows,
    allocations,
    dailyTotals,
    clients,
    pms,
    people: people.map(
      (p: {
        id: number;
        firstname: string;
        lastname: string;
        email: string;
      }) => ({
        id: p.id,
        firstname: p.firstname,
        lastname: p.lastname,
        email: p.email,
      })
    ),
  };
}

export interface SetHoursInput {
  projectId: number;
  personId: number;
  date: string;
  hours: number;
}

export interface SetHoursResult {
  success: boolean;
  error?: string;
  dailyTotal?: number;
}

/**
 * Imposta le ore per una specifica allocazione
 */
export async function setHours(input: SetHoursInput): Promise<SetHoursResult> {
  const { projectId, personId, date, hours } = input;

  // Validazione
  if (hours < 0 || hours > 8) {
    return {
      success: false,
      error: 'Le ore devono essere tra 0 e 8',
    };
  }

  // Validazione incrementi permessi (0, 0.5, 1, 1.5, 2, ... 8)
  if (hours % 0.5 !== 0) {
    return {
      success: false,
      error: 'Le ore devono essere incrementi di 0.5',
    };
  }

  try {
    // Upsert: inserisci o aggiorna
    if (hours === 0) {
      // Se le ore sono 0, elimina il record
      await db
        .delete(projectAllocations)
        .where(
          and(
            eq(projectAllocations.projectId, projectId),
            eq(projectAllocations.personId, personId),
            eq(projectAllocations.date, date)
          )
        );
    } else {
      // Prova a fare l'insert, se esiste già aggiorna
      await db
        .insert(projectAllocations)
        .values({
          projectId,
          personId,
          date,
          hours,
        })
        .onConflictDoUpdate({
          target: [
            projectAllocations.projectId,
            projectAllocations.personId,
            projectAllocations.date,
          ],
          set: {
            hours,
            updated_at: new Date(),
          },
        });
    }

    // Calcola il nuovo totale giornaliero per quella persona
    const dailyTotalsData = await db
      .select({
        personId: projectAllocations.personId,
        date: projectAllocations.date,
        totalHours: db.$count(projectAllocations.hours),
      })
      .from(projectAllocations)
      .where(
        and(
          eq(projectAllocations.personId, personId),
          eq(projectAllocations.date, date)
        )
      )
      .groupBy(projectAllocations.personId, projectAllocations.date);

    const dailyTotal =
      dailyTotalsData.length > 0 ? dailyTotalsData[0].totalHours : 0;

    // Revalidate la pagina scheduling
    revalidatePath('/scheduling');

    return {
      success: true,
      dailyTotal,
    };
  } catch (error) {
    console.error('Error setting hours:', error);
    return {
      success: false,
      error: 'Errore durante il salvataggio',
    };
  }
}

/**
 * Calcola il totale delle ore per una persona in un giorno specifico
 */
export async function getDailyTotalForPerson(
  personId: number,
  date: string
): Promise<number> {
  const result = await db
    .select({
      total: db.$count(projectAllocations.hours),
    })
    .from(projectAllocations)
    .where(
      and(
        eq(projectAllocations.personId, personId),
        eq(projectAllocations.date, date)
      )
    );

  return result.length > 0 ? result[0].total : 0;
}
