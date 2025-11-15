'use client';

import { useState, useTransition } from 'react';
import { useSchedulingStore } from '@/lib/scheduling-store';
import { setHours } from '@/app/scheduling/actions';
import { Dialog } from '@/components/ui/dialog';

interface DayCellProps {
  projectId: number;
  personId: number;
  date: string;
}

function getCellColor(hours: number, dailyTotal: number): string {
  // Sovrallocazione (più di 8h totali nel giorno)
  if (dailyTotal > 8) {
    return 'bg-purple-500 text-white';
  }

  // 8 ore = rosso
  if (hours === 8) {
    return 'bg-red-500 text-white';
  }

  // Tra 0.5 e 7.5 = giallo
  if (hours > 0 && hours < 8) {
    return 'bg-yellow-400 text-gray-900';
  }

  // 0 ore = verde chiaro
  return 'bg-green-100 text-gray-600 hover:bg-green-200';
}

export function DayCell({ projectId, personId, date }: DayCellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localHours, setLocalHours] = useState<number>(0);
  const [isPending, startTransition] = useTransition();

  const getHours = useSchedulingStore((state) => state.getHours);
  const getDailyTotal = useSchedulingStore((state) => state.getDailyTotal);
  const setHoursLocal = useSchedulingStore((state) => state.setHoursLocal);

  const hours = getHours(projectId, personId, date);
  const dailyTotal = getDailyTotal(personId, date);
  const cellColor = getCellColor(hours, dailyTotal);

  const handleOpen = () => {
    setLocalHours(hours);
    setIsOpen(true);
  };

  const handleSave = async () => {
    startTransition(async () => {
      const result = await setHours({
        projectId,
        personId,
        date,
        hours: localHours,
      });

      if (result.success) {
        // Aggiorna lo store locale
        setHoursLocal(projectId, personId, date, localHours);
        setIsOpen(false);
      } else {
        alert(result.error || 'Errore durante il salvataggio');
      }
    });
  };

  const quickSet = (value: number) => {
    setLocalHours(value);
  };

  return (
    <>
      <div
        className={`shrink-0 cursor-pointer border-r border-gray-200 px-2 py-1 text-center transition-all hover:opacity-80 ${cellColor}`}
        style={{ width: '64px', minHeight: '40px' }}
        onClick={handleOpen}
      >
        <div className="text-sm font-medium">{hours > 0 ? hours : ''}</div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Imposta Ore</h3>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Data: {new Date(date).toLocaleDateString('it-IT')}
            </label>

            {/* Number Input */}
            <div>
              <label className="mb-1 block text-sm text-gray-600">Ore:</label>
              <input
                type="number"
                min="0"
                max="8"
                step="0.5"
                value={localHours}
                onChange={(e) => setLocalHours(parseFloat(e.target.value) || 0)}
                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Slider */}
            <div>
              <label className="mb-1 block text-sm text-gray-600">
                Slider: {localHours}h
              </label>
              <input
                type="range"
                min="0"
                max="8"
                step="0.5"
                value={localHours}
                onChange={(e) => setLocalHours(parseFloat(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-blue-600"
              />
            </div>

            {/* Quick Buttons */}
            <div>
              <label className="mb-2 block text-sm text-gray-600">Quick:</label>
              <div className="flex gap-2">
                {[0, 0.5, 2, 4, 8].map((value) => (
                  <button
                    key={value}
                    onClick={() => quickSet(value)}
                    className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                      localHours === value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {value}h
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Totale giornaliero */}
          <div className="rounded bg-gray-100 p-2 text-sm">
            <span className="font-medium">Totale giorno:</span>{' '}
            <span
              className={
                dailyTotal > 8 ? 'font-bold text-red-600' : 'text-gray-700'
              }
            >
              {dailyTotal}h
            </span>
            {dailyTotal > 8 && (
              <span className="ml-2 text-xs text-red-600">
                (Sovrallocazione!)
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsOpen(false)}
              className="rounded bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
              disabled={isPending}
            >
              Annulla
            </button>
            <button
              onClick={handleSave}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              disabled={isPending}
            >
              {isPending ? 'Salvataggio...' : 'Salva'}
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
