'use client';

import { useState, useTransition } from 'react';
import MultipleSelector from '@/components/ui/multiple-selector';
import { Dialog } from '@/components/ui/dialog';
import { setHours as saveAllocation } from '@/app/scheduling/actions';
import { useSchedulingStore } from '@/lib/scheduling-store';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import React from 'react';

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
  const [projectIds, setProjectIds] = useState<number[]>([]);
  const [personIds, setPersonIds] = useState<number[]>([]);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [hours, setHours] = useState(0);
  const [isPending, startTransition] = useTransition();

  const setHoursLocal = useSchedulingStore((state) => state.setHoursLocal);
  const getDailyTotal = useSchedulingStore((state) => state.getDailyTotal);

  const handleSave = async () => {
    if (
      projectIds.length === 0 ||
      personIds.length === 0 ||
      !date ||
      hours <= 0
    ) {
      alert('Compila tutti i campi obbligatori');
      return;
    }

    startTransition(async () => {
      let allSuccess = true;
      for (const projectId of projectIds) {
        for (const personId of personIds) {
          const result = await saveAllocation({
            projectId,
            personId,
            date: date.toISOString().slice(0, 10), // yyyy-mm-dd
            hours,
          });
          if (result.success) {
            setHoursLocal(
              projectId,
              personId,
              date.toISOString().slice(0, 10),
              hours
            );
          } else {
            allSuccess = false;
            alert(
              result.error ||
                `Errore durante il salvataggio per progetto ${projectId} e risorsa ${personId}`
            );
          }
        }
      }
      if (allSuccess) {
        // Reset form
        setProjectIds([]);
        setPersonIds([]);
        setDate(undefined);
        setHours(0);
        onOpenChange(false);
      }
    });
  };

  // Per la preview del totale giornaliero mostriamo il primo selezionato (se presente)
  const dailyTotal =
    personIds.length === 1 && date
      ? getDailyTotal(personIds[0], date.toISOString().slice(0, 10))
      : 0;
  const selectedProjects = projects.filter((p) => projectIds.includes(p.id));

  // Disabilita sabato e domenica
  const disableWeekends = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const isSaveDisabled =
    projectIds.length === 0 ||
    personIds.length === 0 ||
    !date ||
    hours <= 0 ||
    isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">
          Aggiungi Allocazione
        </h3>

        <div className="space-y-4">
          {/* Selezione Progetto (Multi) */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Progetti *
            </label>
            <MultipleSelector
              options={projects.map((project) => ({
                value: String(project.id),
                label: `${project.client} - ${project.order} (${project.type})`,
              }))}
              value={projects
                .filter((p) => projectIds.includes(p.id))
                .map((p) => ({
                  value: String(p.id),
                  label: `${p.client} - ${p.order} (${p.type})`,
                }))}
              onChange={(opts) =>
                setProjectIds(opts.map((o) => Number(o.value)))
              }
              inverted
              placeholder="Seleziona uno o più progetti"
            />
          </div>

          {/* Info progetti selezionati */}
          {selectedProjects.length > 0 && (
            <div className="rounded-lg bg-blue-50 p-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                {selectedProjects.map((proj) => (
                  <React.Fragment key={proj.id}>
                    <div>
                      <span className="font-medium text-gray-600">
                        Cliente:
                      </span>{' '}
                      <span className="text-gray-900">{proj.client}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">
                        Commessa:
                      </span>{' '}
                      <span className="text-gray-900">{proj.order}</span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* Selezione Risorsa (Multi) */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Risorse *
            </label>
            <MultipleSelector
              options={people.map((person) => ({
                value: String(person.id),
                label: `${person.lastname} ${person.firstname}`,
              }))}
              inverted
              value={people
                .filter((p) => personIds.includes(p.id))
                .map((p) => ({
                  value: String(p.id),
                  label: `${p.lastname} ${p.firstname}`,
                }))}
              onChange={(opts) =>
                setPersonIds(opts.map((o) => Number(o.value)))
              }
              placeholder="Seleziona una o più risorse"
            />
          </div>

          {/* Selezione Data */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Data *
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  className={`w-full justify-start text-left font-normal ${!date ? 'text-muted-foreground' : ''}`}
                >
                  {date ? (
                    format(date, 'dd/MM/yyyy', { locale: it })
                  ) : (
                    <span>Seleziona una data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  disabled={disableWeekends}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Slider ore */}
          <div className="rounded-lg border-2 border-gray-300 bg-white p-4">
            <label className="mb-3 block text-center text-lg font-semibold text-gray-900">
              Ore da allocare:{' '}
              <span className="text-primary text-2xl font-bold">{hours}h</span>
            </label>
            <input
              type="range"
              min="0"
              max="8"
              step="0.5"
              value={hours}
              onChange={(e) => setHours(parseFloat(e.target.value))}
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

          {/* Totale giornaliero (preview solo se una risorsa selezionata) */}
          {personIds.length === 1 && date && (
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
            className="bg-primary rounded-lg px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            disabled={isSaveDisabled}
          >
            {isPending ? 'Salvataggio...' : 'Salva Allocazione'}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
