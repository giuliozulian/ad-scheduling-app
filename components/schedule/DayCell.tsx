'use client';

import { useState, useTransition } from 'react';
import { useSchedulingStore } from '@/lib/scheduling-store';
import { setHours, deleteAllocation } from '@/app/scheduling/actions';
import { Dialog } from '@/components/ui/dialog';

interface DayCellProps {
  projectId: number;
  personId: number;
  date: string;
  isWeekBoundary?: boolean;
  projectInfo?: {
    type: string;
    client: string;
    order: string;
    pm: string;
  };
  personInfo?: {
    firstname: string;
    lastname: string;
  };
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

export function DayCell({
  projectId,
  personId,
  date,
  isWeekBoundary = false,
  projectInfo,
  personInfo,
}: DayCellProps) {
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

  const handleDelete = async () => {
    if (!confirm('Sei sicuro di voler eliminare questa allocazione?')) {
      return;
    }

    startTransition(async () => {
      const result = await deleteAllocation({
        projectId,
        personId,
        date,
      });

      if (result.success) {
        // Aggiorna lo store locale rimuovendo l'allocazione
        setHoursLocal(projectId, personId, date, 0);
        setIsOpen(false);
      } else {
        alert(result.error || "Errore durante l'eliminazione");
      }
    });
  };

  return (
    <>
      <div
        className={`shrink-0 cursor-pointer px-2 py-1 text-center transition-all hover:opacity-80 ${cellColor} ${
          isWeekBoundary
            ? 'border-r-4 border-blue-300'
            : 'border-r border-gray-200'
        }`}
        style={{ width: '64px', minHeight: '40px' }}
        onClick={handleOpen}
      >
        <div className="text-sm font-medium">{hours > 0 ? hours : ''}</div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">
            Allocazione Ore
          </h3>

          <div className="space-y-4">
            {/* Informazioni Progetto e Persona */}
            <div className="space-y-3 rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
              <div>
                <div className="text-primary text-xs font-semibold tracking-wide uppercase">
                  Progetto
                </div>
                <div className="mt-1 space-y-1">
                  {projectInfo && (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">Cliente:</span>
                        <span className="font-semibold text-gray-900">
                          {projectInfo.client}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">Commessa:</span>
                        <span className="font-medium text-gray-800">
                          {projectInfo.order}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">Tipo:</span>
                        <span className="text-sm text-gray-700">
                          {projectInfo.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">PM:</span>
                        <span className="text-sm text-gray-700">
                          {projectInfo.pm}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="border-t border-blue-200 pt-2">
                <div className="text-primary text-xs font-semibold tracking-wide uppercase">
                  Risorsa
                </div>
                <div className="mt-1">
                  {personInfo && (
                    <span className="font-semibold text-gray-900">
                      {personInfo.lastname} {personInfo.firstname}
                    </span>
                  )}
                </div>
              </div>

              <div className="border-t border-blue-200 pt-2">
                <div className="text-primary text-xs font-semibold tracking-wide uppercase">
                  Data
                </div>
                <div className="mt-1 font-medium text-gray-900">
                  {new Date(date).toLocaleDateString('it-IT', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
            </div>

            {/* Slider */}
            <div className="rounded-lg border-2 border-gray-300 bg-white p-4">
              <label className="mb-3 block text-center text-lg font-semibold text-gray-900">
                Ore da allocare:{' '}
                <span className="text-primary text-2xl font-bold">
                  {localHours}h
                </span>
              </label>
              <input
                type="range"
                min="0"
                max="8"
                step="0.5"
                value={localHours}
                onChange={(e) => setLocalHours(parseFloat(e.target.value))}
                className="accent-primary h-4 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
              />
              <div className="mt-2 flex justify-between text-xs text-gray-500">
                <span>0h</span>
                <span>2h</span>
                <span>4h</span>
                <span>6h</span>
                <span>8h</span>
              </div>
            </div>
          </div>

          {/* Totale giornaliero */}
          <div className="rounded-lg bg-gray-100 p-3 text-sm">
            <span className="font-medium text-gray-700">
              Totale ore nel giorno:
            </span>{' '}
            <span
              className={
                dailyTotal > 8
                  ? 'text-lg font-bold text-red-600'
                  : 'text-lg font-semibold text-gray-900'
              }
            >
              {dailyTotal}h
            </span>
            {dailyTotal > 8 && (
              <span className="ml-2 text-xs font-semibold text-red-600">
                ⚠️ Sovrallocazione!
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between gap-3 pt-2">
            {/* Delete button - shown only if there are hours allocated */}
            {hours > 0 && (
              <button
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                disabled={isPending}
              >
                {isPending ? 'Eliminazione...' : 'Elimina'}
              </button>
            )}

            <div className="ml-auto flex gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg bg-gray-200 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-300 disabled:opacity-50"
                disabled={isPending}
              >
                Annulla
              </button>
              <button
                onClick={handleSave}
                className="bg-primary rounded-lg px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                disabled={isPending}
              >
                {isPending ? 'Salvataggio...' : 'Salva'}
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}
