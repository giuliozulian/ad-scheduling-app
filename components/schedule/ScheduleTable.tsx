'use client';

import { useRef, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useSchedulingStore } from '@/lib/scheduling-store';
import { getDaysOfMonth } from '@/lib/date-utils';
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
}: {
  filteredRows: ScheduleRow[];
  days: string[];
  parentRef: React.RefObject<HTMLDivElement | null>;
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
        width: '100%',
        position: 'relative',
      }}
    >
      {virtualRows.map((virtualRow) => {
        const row = filteredRows[virtualRow.index];

        return (
          <div
            key={virtualRow.key}
            className="absolute top-0 left-0 flex w-full border-b border-gray-200 hover:bg-gray-50"
            style={{
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {/* Colonne fisse */}
            <div className="sticky left-0 z-10 flex shrink-0 border-r border-gray-300 bg-white">
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
            <div className="flex">
              {days.map((day) => (
                <DayCell
                  key={day}
                  projectId={row.projectId}
                  personId={row.personId}
                  date={day}
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

  // Applica i filtri alle righe
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      // Filtro cliente
      if (filters.client && row.projectClient !== filters.client) {
        return false;
      }

      // Filtro PM
      if (filters.pm && row.projectPm !== filters.pm) {
        return false;
      }

      // Filtro persona
      if (filters.personId !== null && row.personId !== filters.personId) {
        return false;
      }

      // Ricerca testo
      if (filters.search) {
        const search = filters.search.toLowerCase();
        const searchableText = [
          row.projectType,
          row.projectClient,
          row.projectOrder,
          row.projectPm,
          row.personFirstname,
          row.personLastname,
        ]
          .join(' ')
          .toLowerCase();

        if (!searchableText.includes(search)) {
          return false;
        }
      }

      return true;
    });
  }, [rows, filters]);

  return (
    <div className="relative h-full overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm">
      {/* Header fisso */}
      <div className="sticky top-0 z-30 flex border-b border-gray-300 bg-gray-50">
        {/* Colonne fisse a sinistra */}
        <div className="shrink-0 border-r border-gray-300 bg-white">
          <div className="flex">
            <div className="w-32 border-r border-gray-200 px-2 py-2">
              <div className="text-xs font-semibold text-gray-700">
                Tipologia
              </div>
            </div>
            <div className="w-40 border-r border-gray-200 px-2 py-2">
              <div className="text-xs font-semibold text-gray-700">Cliente</div>
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
              <div className="text-xs font-semibold text-gray-700">Risorsa</div>
            </div>
          </div>
        </div>

        {/* Colonne giorni (scrollabili) */}
        <div className="flex-1 overflow-hidden">
          <WeekHeader month={month} year={year} />
        </div>
      </div>

      {/* Corpo tabella */}
      <div
        ref={parentRef}
        className="overflow-auto"
        style={{ height: 'calc(100vh - 300px)' }}
      >
        <VirtualizedRows
          filteredRows={filteredRows}
          days={days}
          parentRef={parentRef}
        />
      </div>

      {/* Info righe */}
      <div className="border-t border-gray-300 bg-gray-50 px-4 py-2">
        <div className="text-xs text-gray-600">
          Visualizzate{' '}
          <span className="font-semibold">{filteredRows.length}</span> righe di{' '}
          <span className="font-semibold">{rows.length}</span> totali
        </div>
      </div>
    </div>
  );
}
