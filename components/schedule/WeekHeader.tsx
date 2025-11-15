'use client';

import { getWeeksOfMonth, formatDayMonth, getDayName } from '@/lib/date-utils';

interface WeekHeaderProps {
  month: number;
  year: number;
}

export function WeekHeader({ month, year }: WeekHeaderProps) {
  const weeks = getWeeksOfMonth(month, year);

  return (
    <div className="bg-white">
      {/* Riga settimane */}
      <div className="flex">
        {weeks.map((week, weekIndex) => (
          <div
            key={week.week}
            className={`shrink-0 bg-blue-50 ${
              weekIndex < weeks.length - 1 ? 'border-r-4 border-blue-300' : ''
            }`}
            style={{ width: `${week.days.length * 64}px` }}
          >
            <div className="px-2 py-2 text-center text-sm font-bold text-blue-900">
              {week.label}
            </div>
          </div>
        ))}
      </div>

      {/* Riga giorni */}
      <div className="flex">
        {weeks.map((week, weekIndex) => (
          <div key={week.week} className="flex">
            {week.days.map((day, dayIndex) => {
              const isLastDayOfWeek = dayIndex === week.days.length - 1;
              const isLastWeek = weekIndex === weeks.length - 1;

              return (
                <div
                  key={day}
                  className={`shrink-0 bg-gray-50 px-2 py-2 text-center ${
                    isLastDayOfWeek && !isLastWeek
                      ? 'border-r-4 border-blue-300'
                      : 'border-r border-gray-200'
                  }`}
                  style={{ width: '64px' }}
                >
                  <div className="text-[10px] font-semibold text-gray-500 uppercase">
                    {getDayName(day)}
                  </div>
                  <div className="text-xs font-medium text-gray-700">
                    {formatDayMonth(day)}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
