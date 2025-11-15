/**
 * Esempi di utilizzo API Scheduling
 * Questi esempi mostrano come utilizzare il modulo in altri componenti
 */

// ============================================
// 1. UTILIZZO SERVER ACTIONS
// ============================================

// In un Server Component
import { getScheduling } from '@/app/scheduling/actions';

export default async function MyServerComponent() {
  // Recupera dati scheduling per gennaio 2025
  const data = await getScheduling(1, 2025);

  console.log('Righe:', data.rows.length);
  console.log('Allocazioni:', Object.keys(data.allocations).length);
  console.log('Clienti:', data.clients);
  console.log('PM:', data.pms);

  return <div>...</div>;
}

// ============================================
// 2. UTILIZZO CLIENT STORE
// ============================================

('use client');

import { useSchedulingStore } from '@/lib/scheduling-store';

export function MyClientComponent() {
  // Accedi allo stato
  const filters = useSchedulingStore((state) => state.filters);
  const allocations = useSchedulingStore((state) => state.allocations);

  // Accedi alle actions
  const setFilter = useSchedulingStore((state) => state.setFilter);
  const getHours = useSchedulingStore((state) => state.getHours);
  const setHoursLocal = useSchedulingStore((state) => state.setHoursLocal);

  // Esempi d'uso
  const handleFilterClient = (client: string) => {
    setFilter('client', client);
  };

  const handleSetHours = (
    projectId: number,
    personId: number,
    date: string,
    hours: number
  ) => {
    setHoursLocal(projectId, personId, date, hours);
  };

  const hours = getHours(1, 2, '2025-01-15'); // progetto 1, persona 2, data

  return (
    <div>
      <p>Ore allocate: {hours}</p>
      <button onClick={() => handleFilterClient('Volkswagen')}>
        Filtra per Volkswagen
      </button>
    </div>
  );
}

// ============================================
// 3. SALVATAGGIO ORE CON SERVER ACTION
// ============================================

('use client');

import { setHours } from '@/app/scheduling/actions';
import { useSchedulingStore } from '@/lib/scheduling-store';
import { useState, useTransition } from 'react';

export function SaveHoursExample() {
  const [isPending, startTransition] = useTransition();
  const setHoursLocal = useSchedulingStore((state) => state.setHoursLocal);

  const handleSave = async () => {
    startTransition(async () => {
      const result = await setHours({
        projectId: 1,
        personId: 2,
        date: '2025-01-15',
        hours: 4,
      });

      if (result.success) {
        console.log('Salvato! Totale giornaliero:', result.dailyTotal);
        // Aggiorna store locale
        setHoursLocal(1, 2, '2025-01-15', 4);
      } else {
        console.error('Errore:', result.error);
      }
    });
  };

  return (
    <button onClick={handleSave} disabled={isPending}>
      {isPending ? 'Salvataggio...' : 'Salva 4 ore'}
    </button>
  );
}

// ============================================
// 4. UTILIZZO UTILITY DATE
// ============================================

import {
  getDaysInMonth,
  getDaysOfMonth,
  getWeeksOfMonth,
  formatDayMonth,
  getAllocationKey,
} from '@/lib/date-utils';

// Quanti giorni ha gennaio 2025?
const daysCount = getDaysInMonth(1, 2025); // 31

// Array di tutte le date di gennaio
const days = getDaysOfMonth(1, 2025);
// ['2025-01-01', '2025-01-02', ..., '2025-01-31']

// Settimane del mese
const weeks = getWeeksOfMonth(1, 2025);
// [
//   { week: 1, days: ['2025-01-01', ...], label: 'W1' },
//   { week: 2, days: [...], label: 'W2' },
//   ...
// ]

// Formatta data
const formatted = formatDayMonth('2025-01-15'); // "15/1"

// Chiave univoca allocazione
const key = getAllocationKey(1, 2, '2025-01-15'); // "1-2-2025-01-15"

// ============================================
// 5. QUERY DIRETTE AL DATABASE
// ============================================

import { db } from '@/db/db';
import { projectAllocations, projects, people } from '@/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

// Recupera allocazioni per una persona specifica
async function getAllocationsForPerson(
  personId: number,
  startDate: string,
  endDate: string
) {
  return await db
    .select({
      date: projectAllocations.date,
      hours: projectAllocations.hours,
      projectClient: projects.client,
      projectOrder: projects.order,
    })
    .from(projectAllocations)
    .innerJoin(projects, eq(projectAllocations.projectId, projects.id))
    .where(
      and(
        eq(projectAllocations.personId, personId),
        gte(projectAllocations.date, startDate),
        lte(projectAllocations.date, endDate)
      )
    )
    .orderBy(projectAllocations.date);
}

// Recupera allocazioni per un progetto specifico
async function getAllocationsForProject(
  projectId: number,
  month: number,
  year: number
) {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0);
  const endDateStr = `${year}-${String(month).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

  return await db
    .select({
      date: projectAllocations.date,
      hours: projectAllocations.hours,
      personName: people.firstname,
      personLastname: people.lastname,
    })
    .from(projectAllocations)
    .innerJoin(people, eq(projectAllocations.personId, people.id))
    .where(
      and(
        eq(projectAllocations.projectId, projectId),
        gte(projectAllocations.date, startDate),
        lte(projectAllocations.date, endDateStr)
      )
    )
    .orderBy(people.lastname, projectAllocations.date);
}

// ============================================
// 6. COMPONENTE CUSTOM CON SCHEDULING
// ============================================

('use client');

import { useSchedulingStore } from '@/lib/scheduling-store';
import { useMemo } from 'react';

export function PersonWorkloadSummary({ personId }: { personId: number }) {
  const allocations = useSchedulingStore((state) => state.allocations);
  const dailyTotals = useSchedulingStore((state) => state.dailyTotals);

  // Calcola totale ore per questa persona
  const totalHours = useMemo(() => {
    return Object.entries(allocations).reduce((sum, [key, hours]) => {
      if (key.includes(`-${personId}-`)) {
        return sum + hours;
      }
      return sum;
    }, 0);
  }, [allocations, personId]);

  // Trova giorni con sovrallocazione
  const overallocatedDays = useMemo(() => {
    return Object.entries(dailyTotals).filter(([key, total]) => {
      return key.startsWith(`${personId}-`) && total > 8;
    }).length;
  }, [dailyTotals, personId]);

  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-semibold">Workload Summary</h3>
      <p>Totale ore allocate: {totalHours}h</p>
      <p className={overallocatedDays > 0 ? 'font-bold text-red-600' : ''}>
        Giorni sovrallocati: {overallocatedDays}
      </p>
    </div>
  );
}

// ============================================
// 7. HOOK CUSTOM PER FILTRI
// ============================================

('use client');

import { useSchedulingStore } from '@/lib/scheduling-store';

export function useSchedulingFilters() {
  const filters = useSchedulingStore((state) => state.filters);
  const setFilter = useSchedulingStore((state) => state.setFilter);
  const resetFilters = useSchedulingStore((state) => state.resetFilters);

  const setClient = (client: string) => setFilter('client', client);
  const setPM = (pm: string) => setFilter('pm', pm);
  const setPerson = (personId: number | null) =>
    setFilter('personId', personId);
  const setSearch = (search: string) => setFilter('search', search);

  return {
    filters,
    setClient,
    setPM,
    setPerson,
    setSearch,
    resetFilters,
  };
}

// Utilizzo
export function MyFilterComponent() {
  const { filters, setClient, resetFilters } = useSchedulingFilters();

  return (
    <div>
      <select
        value={filters.client}
        onChange={(e) => setClient(e.target.value)}
      >
        <option value="">Tutti</option>
        <option value="Volkswagen">Volkswagen</option>
      </select>
      <button onClick={resetFilters}>Reset</button>
    </div>
  );
}

// ============================================
// 8. ESPORTAZIONE DATI
// ============================================

('use client');

import { useSchedulingStore } from '@/lib/scheduling-store';

export function ExportSchedule() {
  const allocations = useSchedulingStore((state) => state.allocations);

  const handleExportCSV = () => {
    const csv = ['Project ID,Person ID,Date,Hours'];

    Object.entries(allocations).forEach(([key, hours]) => {
      const [projectId, personId, date] = key.split('-');
      csv.push(`${projectId},${personId},${date},${hours}`);
    });

    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scheduling-${new Date().toISOString()}.csv`;
    a.click();
  };

  const handleExportJSON = () => {
    const json = JSON.stringify(allocations, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scheduling-${new Date().toISOString()}.json`;
    a.click();
  };

  return (
    <div className="flex gap-2">
      <button onClick={handleExportCSV}>Export CSV</button>
      <button onClick={handleExportJSON}>Export JSON</button>
    </div>
  );
}

// ============================================
// 9. STATISTICHE SCHEDULING
// ============================================

('use client');

import { useSchedulingStore } from '@/lib/scheduling-store';
import { useMemo } from 'react';

export function SchedulingStats() {
  const allocations = useSchedulingStore((state) => state.allocations);
  const dailyTotals = useSchedulingStore((state) => state.dailyTotals);

  const stats = useMemo(() => {
    const totalAllocations = Object.keys(allocations).length;
    const totalHours = Object.values(allocations).reduce(
      (sum, h) => sum + h,
      0
    );
    const avgHours = totalHours / totalAllocations || 0;

    const overallocations = Object.values(dailyTotals).filter(
      (t) => t > 8
    ).length;

    const hoursDistribution = Object.values(allocations).reduce(
      (acc, hours) => {
        acc[hours] = (acc[hours] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>
    );

    return {
      totalAllocations,
      totalHours,
      avgHours: avgHours.toFixed(2),
      overallocations,
      hoursDistribution,
    };
  }, [allocations, dailyTotals]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Statistiche</h2>
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded bg-blue-100 p-4">
          <div className="text-2xl font-bold">{stats.totalAllocations}</div>
          <div className="text-sm">Allocazioni</div>
        </div>
        <div className="rounded bg-green-100 p-4">
          <div className="text-2xl font-bold">{stats.totalHours}h</div>
          <div className="text-sm">Ore Totali</div>
        </div>
        <div className="rounded bg-yellow-100 p-4">
          <div className="text-2xl font-bold">{stats.avgHours}h</div>
          <div className="text-sm">Media Ore</div>
        </div>
        <div className="rounded bg-red-100 p-4">
          <div className="text-2xl font-bold">{stats.overallocations}</div>
          <div className="text-sm">Sovrallocazioni</div>
        </div>
      </div>

      <div>
        <h3 className="mb-2 font-semibold">Distribuzione Ore</h3>
        {Object.entries(stats.hoursDistribution).map(([hours, count]) => (
          <div key={hours} className="flex justify-between border-b py-1">
            <span>{hours}h</span>
            <span>{count} allocazioni</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// 10. API ROUTE PERSONALIZZATA
// ============================================

// app/api/scheduling/summary/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/db/db';
import { projectAllocations } from '@/db/schema';
import { sql } from 'drizzle-orm';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = parseInt(searchParams.get('month') || '1');
  const year = parseInt(searchParams.get('year') || '2025');

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0);
  const endDateStr = `${year}-${String(month).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

  const summary = await db
    .select({
      totalHours: sql<number>`SUM(${projectAllocations.hours})`,
      totalAllocations: sql<number>`COUNT(*)`,
      avgHours: sql<number>`AVG(${projectAllocations.hours})`,
    })
    .from(projectAllocations)
    .where(
      sql`${projectAllocations.date} >= ${startDate} AND ${projectAllocations.date} <= ${endDateStr}`
    );

  return NextResponse.json(summary[0]);
}

// Utilizzo in componente
async function fetchSummary(month: number, year: number) {
  const res = await fetch(
    `/api/scheduling/summary?month=${month}&year=${year}`
  );
  return await res.json();
}
