'use client';

import { getMonthName } from '@/lib/date-utils';

interface MonthNavigationProps {
  month: number;
  year: number;
  onMonthChange: (month: number, year: number) => void;
  onAddAllocation?: () => void;
}

export function MonthNavigation({
  month,
  year,
  onMonthChange,
  onAddAllocation,
}: MonthNavigationProps) {
  const handlePrevMonth = () => {
    if (month === 1) {
      onMonthChange(12, year - 1);
    } else {
      onMonthChange(month - 1, year);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      onMonthChange(1, year + 1);
    } else {
      onMonthChange(month + 1, year);
    }
  };

  const handleToday = () => {
    const now = new Date();
    onMonthChange(now.getMonth() + 1, now.getFullYear());
  };

  return (
    <div className="mt-4 flex items-center justify-between rounded-lg px-24">
      <button
        onClick={handlePrevMonth}
        className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-200"
      >
        ← Mese Precedente
      </button>

      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold text-white">
          {getMonthName(month)} {year}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handleToday}
            className="rounded bg-blue-100 px-3 py-1 text-sm text-blue-700 hover:bg-blue-200"
          >
            Oggi
          </button>
          {onAddAllocation && (
            <button
              onClick={onAddAllocation}
              className="bg-primary hover:text-primary rounded-3xl px-3 py-2 text-sm font-medium text-white hover:bg-white"
            >
              + Aggiungi Allocazione
            </button>
          )}
        </div>
      </div>

      <button
        onClick={handleNextMonth}
        className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-200"
      >
        Mese Successivo →
      </button>
    </div>
  );
}
