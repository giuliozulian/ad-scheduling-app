'use client';

import { useState, useTransition } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { setHours as saveAllocation } from '@/app/scheduling/actions';
import { useSchedulingStore } from '@/lib/scheduling-store';

interface AddAllocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: Array<{
    id: number;
    type: string;
    client: string;
    order: string;
  }>;
  people: Array<{
    id: number;
    firstname: string;
    lastname: string;
  }>;
}

export function AddAllocationDialog({
  open,
  onOpenChange,
  projects,
  people,
}: AddAllocationDialogProps) {
  const [projectId, setProjectId] = useState<number | null>(null);
  const [personId, setPersonId] = useState<number | null>(null);
  const [date, setDate] = useState('');
  const [hours, setHours] = useState(0);
  const [isPending, startTransition] = useTransition();

  const setHoursLocal = useSchedulingStore((state) => state.setHoursLocal);
  const getDailyTotal = useSchedulingStore((state) => state.getDailyTotal);

  const handleSave = async () => {
    if (!projectId || !personId || !date || hours <= 0) {
      alert('Compila tutti i campi obbligatori');
      return;
    }

    startTransition(async () => {
      const result = await saveAllocation({
        projectId,
        personId,
        date,
        hours,
      });

      if (result.success) {
        setHoursLocal(projectId, personId, date, hours);
        // Reset form
        setProjectId(null);
        setPersonId(null);
        setDate('');
        setHours(0);
        onOpenChange(false);
      } else {
        alert(result.error || 'Errore durante il salvataggio');
      }
    });
  };

  const dailyTotal = personId && date ? getDailyTotal(personId, date) : 0;
  const selectedProject = projects.find((p) => p.id === projectId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">
          Aggiungi Allocazione
        </h3>

        <div className="space-y-4">
          {/* Selezione Progetto */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Progetto *
            </label>
            <select
              value={projectId ?? ''}
              onChange={(e) =>
                setProjectId(e.target.value ? parseInt(e.target.value) : null)
              }
              className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
            >
              <option value="">Seleziona un progetto</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.client} - {project.order} ({project.type})
                </option>
              ))}
            </select>
          </div>

          {/* Info progetto selezionato */}
          {selectedProject && (
            <div className="rounded-lg bg-blue-50 p-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-medium text-gray-600">Cliente:</span>{' '}
                  <span className="text-gray-900">
                    {selectedProject.client}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Commessa:</span>{' '}
                  <span className="text-gray-900">{selectedProject.order}</span>
                </div>
              </div>
            </div>
          )}

          {/* Selezione Risorsa */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Risorsa *
            </label>
            <select
              value={personId ?? ''}
              onChange={(e) =>
                setPersonId(e.target.value ? parseInt(e.target.value) : null)
              }
              className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
            >
              <option value="">Seleziona una risorsa</option>
              {people.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.lastname} {person.firstname}
                </option>
              ))}
            </select>
          </div>

          {/* Selezione Data */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Data *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Slider ore */}
          <div className="rounded-lg border-2 border-gray-300 bg-white p-4">
            <label className="mb-3 block text-center text-lg font-semibold text-gray-900">
              Ore da allocare:{' '}
              <span className="text-2xl font-bold text-blue-600">{hours}h</span>
            </label>
            <input
              type="range"
              min="0"
              max="8"
              step="0.5"
              value={hours}
              onChange={(e) => setHours(parseFloat(e.target.value))}
              className="h-4 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-blue-600"
            />
            <div className="mt-2 flex justify-between text-xs text-gray-500">
              <span>0h</span>
              <span>2h</span>
              <span>4h</span>
              <span>6h</span>
              <span>8h</span>
            </div>
          </div>

          {/* Totale giornaliero */}
          {personId && date && (
            <div className="rounded-lg bg-gray-100 p-3 text-sm">
              <span className="font-medium text-gray-700">
                Totale ore nel giorno:
              </span>{' '}
              <span
                className={
                  dailyTotal + hours > 8
                    ? 'text-lg font-bold text-red-600'
                    : 'text-lg font-semibold text-gray-900'
                }
              >
                {dailyTotal + hours}h
              </span>
              {dailyTotal + hours > 8 && (
                <span className="ml-2 text-xs font-semibold text-red-600">
                  ⚠️ Sovrallocazione!
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-lg bg-gray-200 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-300 disabled:opacity-50"
            disabled={isPending}
          >
            Annulla
          </button>
          <button
            onClick={handleSave}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            disabled={isPending}
          >
            {isPending ? 'Salvataggio...' : 'Salva Allocazione'}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
