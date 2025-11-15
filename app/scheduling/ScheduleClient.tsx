'use client';

import { useEffect, useState, useTransition } from 'react';
import { useSchedulingStore } from '@/lib/scheduling-store';
import { Filters } from '@/components/schedule/Filters';
import { ScheduleTable } from '@/components/schedule/ScheduleTable';
import { MonthNavigation } from '@/components/schedule/MonthNavigation';
import { getScheduling } from './actions';
import type { SchedulingData } from './actions';

interface ScheduleClientProps {
  initialData: SchedulingData;
  initialMonth: number;
  initialYear: number;
}

export function ScheduleClient({
  initialData,
  initialMonth,
  initialYear,
}: ScheduleClientProps) {
  const [data, setData] = useState<SchedulingData>(initialData);
  const [month, setMonth] = useState(initialMonth);
  const [year, setYear] = useState(initialYear);
  const [isPending, startTransition] = useTransition();

  const setAllocations = useSchedulingStore((state) => state.setAllocations);
  const setDailyTotals = useSchedulingStore((state) => state.setDailyTotals);
  const setMonthYear = useSchedulingStore((state) => state.setMonthYear);

  // Inizializza lo store con i dati del server
  useEffect(() => {
    setAllocations(data.allocations);
    setDailyTotals(data.dailyTotals);
    setMonthYear(month, year);
  }, [data, month, year, setAllocations, setDailyTotals, setMonthYear]);

  const handleMonthChange = (newMonth: number, newYear: number) => {
    startTransition(async () => {
      const newData = await getScheduling(newMonth, newYear);
      setData(newData);
      setMonth(newMonth);
      setYear(newYear);
    });
  };

  return (
    <div className="space-y-4">
      {/* Navigazione Mese */}
      <MonthNavigation
        month={month}
        year={year}
        onMonthChange={handleMonthChange}
      />

      {/* Filtri */}
      <Filters clients={data.clients} pms={data.pms} people={data.people} />

      {/* Tabella */}
      {isPending ? (
        <div className="flex h-96 items-center justify-center rounded-lg border border-gray-300 bg-gray-50">
          <div className="text-center">
            <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
            <p className="text-sm text-gray-600">Caricamento dati...</p>
          </div>
        </div>
      ) : (
        <ScheduleTable rows={data.rows} month={month} year={year} />
      )}
    </div>
  );
}
