'use client';

import { getWeeksOfMonth, formatDayMonth } from '@/lib/date-utils';

interface WeekHeaderProps {
  month: number;
  year: number;
}

export function WeekHeader({ month, year }: WeekHeaderProps) {
  const weeks = getWeeksOfMonth(month, year);

  return (
    <div className="sticky top-0 z-20 border-b border-gray-300 bg-white">
      {/* Riga settimane */}
      <div className="flex">
        {weeks.map((week) => (
          <div
            key={week.week}
            className="shrink-0 border-r border-gray-300 bg-blue-50"
            style={{ width: `${week.days.length * 64}px` }}
          >
            <div className="px-2 py-1 text-center text-xs font-semibold text-blue-900">
              {week.label}
            </div>
          </div>
        ))}
      </div>

      {/* Riga giorni */}
      <div className="flex">
        {weeks.map((week) => (
          <div key={week.week} className="flex">
            {week.days.map((day) => (
              <div
                key={day}
                className="shrink-0 border-r border-gray-200 bg-gray-50 px-2 py-1 text-center"
                style={{ width: '64px' }}
              >
                <div className="text-xs font-medium text-gray-700">
                  {formatDayMonth(day)}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
