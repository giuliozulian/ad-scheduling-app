'use client';

import { useRef, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useSchedulingStore } from '@/lib/scheduling-store';
import { getDaysOfMonth, getWeeksOfMonth } from '@/lib/date-utils';
import { WeekHeader } from './WeekHeader';
import { DayCell } from './DayCell';

interface ScheduleRow {
  projectId: number;
  projectType: string;
  projectClient: string;
  projectOrder: string;
  projectPm: string;
  personId: number;
  personFirstname: string;
  personLastname: string;
  personTeam: string | null;
}

interface ScheduleTableProps {
  rows: ScheduleRow[];
  month: number;
  year: number;
}

function VirtualizedRows({
  filteredRows,
  days,
  parentRef,
  weekBoundaries,
}: {
  filteredRows: ScheduleRow[];
  days: string[];
  parentRef: React.RefObject<HTMLDivElement | null>;
  weekBoundaries: Set<string>;
}) {
  // Virtualizzazione delle righe
  const rowVirtualizer = useVirtualizer({
    count: filteredRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 48,
    overscan: 5,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();

  return (
    <div
      style={{
        height: `${rowVirtualizer.getTotalSize()}px`,
        position: 'relative',
      }}
    >
      {virtualRows.map((virtualRow) => {
        const row = filteredRows[virtualRow.index];

        return (
          <div
            key={virtualRow.key}
            className="absolute left-0 flex border-b border-gray-200 hover:bg-gray-50"
            style={{
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
              top: 0,
            }}
          >
            {/* Colonne fisse */}
            <div className="sticky left-0 z-10 flex shrink-0 border-r-2 border-gray-400 bg-white">
              <div className="w-32 border-r border-gray-200 px-2 py-2">
                <div className="truncate text-sm text-gray-800">
                  {row.projectType}
                </div>
              </div>
              <div className="w-40 border-r border-gray-200 px-2 py-2">
                <div className="truncate text-sm font-medium text-gray-900">
                  {row.projectClient}
                </div>
              </div>
              <div className="w-32 border-r border-gray-200 px-2 py-2">
                <div className="truncate text-sm text-gray-700">
                  {row.projectOrder}
                </div>
              </div>
              <div className="w-32 border-r border-gray-200 px-2 py-2">
                <div className="truncate text-sm text-gray-700">
                  {row.projectPm}
                </div>
              </div>
              <div className="w-40 px-2 py-2">
                <div className="truncate text-sm font-medium text-gray-900">
                  {row.personLastname} {row.personFirstname}
                </div>
              </div>
            </div>

            {/* Celle giorni */}
            <div className="flex shrink-0">
              {days.map((day) => (
                <DayCell
                  key={day}
                  projectId={row.projectId}
                  personId={row.personId}
                  date={day}
                  isWeekBoundary={weekBoundaries.has(day)}
                  projectInfo={{
                    type: row.projectType,
                    client: row.projectClient,
                    order: row.projectOrder,
                    pm: row.projectPm,
                  }}
                  personInfo={{
                    firstname: row.personFirstname,
                    lastname: row.personLastname,
                  }}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ScheduleTable({ rows, month, year }: ScheduleTableProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const filters = useSchedulingStore((state) => state.filters);

  const days = getDaysOfMonth(month, year);
  const weeks = getWeeksOfMonth(month, year);

  // Crea un set con i giorni che sono l'ultimo di ogni settimana
  const weekBoundaries = useMemo(() => {
    const boundaries = new Set<string>();
    weeks.forEach((week, index) => {
      // Aggiungi l'ultimo giorno di ogni settimana (tranne l'ultima)
      if (index < weeks.length - 1 && week.days.length > 0) {
        const lastDay = week.days[week.days.length - 1];
        boundaries.add(lastDay);
      }
    });
    return boundaries;
  }, [weeks]);

  // Applica i filtri alle righe
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      // Filtro cliente (multi)
      if (
        filters.client.length > 0 &&
        !filters.client.includes(row.projectClient)
      ) {
        return false;
      }

      // Filtro PM (multi)
      if (filters.pm.length > 0 && !filters.pm.includes(row.projectPm)) {
        return false;
      }

      // Filtro persona (multi)
      if (
        filters.personId.length > 0 &&
        !filters.personId.includes(row.personId)
      ) {
        return false;
      }

      // Filtro team (multi)
      if (
        filters.team.length > 0 &&
        !filters.team.includes(row.personTeam || '')
      ) {
        return false;
      }

      return true;
    });
  }, [rows, filters]);

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm">
      {/* Corpo tabella - scroll orizzontale e verticale */}
      <div
        ref={parentRef}
        className="flex-1 overflow-auto"
        style={{ height: 'calc(100vh - 300px)' }}
      >
        {/* Header fisso dentro lo scroll */}
        <div className="sticky top-0 z-20 flex border-b-2 border-gray-400 bg-gray-50">
          {/* Colonne fisse a sinistra */}
          <div className="sticky left-0 z-30 shrink-0 border-r-2 border-gray-400 bg-white">
            <div className="flex">
              <div className="w-32 border-r border-gray-200 px-2 py-2">
                <div className="text-xs font-semibold text-gray-700">
                  Tipologia
                </div>
              </div>
              <div className="w-40 border-r border-gray-200 px-2 py-2">
                <div className="text-xs font-semibold text-gray-700">
                  Cliente
                </div>
              </div>
              <div className="w-32 border-r border-gray-200 px-2 py-2">
                <div className="text-xs font-semibold text-gray-700">
                  Commessa
                </div>
              </div>
              <div className="w-32 border-r border-gray-200 px-2 py-2">
                <div className="text-xs font-semibold text-gray-700">PM</div>
              </div>
              <div className="w-40 px-2 py-2">
                <div className="text-xs font-semibold text-gray-700">
                  Risorsa
                </div>
              </div>
            </div>
          </div>

          {/* Header settimane */}
          <div className="shrink-0">
            <WeekHeader month={month} year={year} />
          </div>
        </div>

        {/* Righe dati */}
        <VirtualizedRows
          filteredRows={filteredRows}
          days={days}
          parentRef={parentRef}
          weekBoundaries={weekBoundaries}
        />
      </div>

      {/* Info righe */}
      <div className="shrink-0 border-t border-gray-300 bg-gray-50 px-4 py-2">
        <div className="text-xs text-gray-600">
          Visualizzate{' '}
          <span className="font-semibold">{filteredRows.length}</span> righe di{' '}
          <span className="font-semibold">{rows.length}</span> totali
        </div>
      </div>
    </div>
  );
}
