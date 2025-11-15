import { Suspense } from 'react';
import { getScheduling } from './actions';
import { ScheduleClient } from './ScheduleClient';

export default async function SchedulingPage() {
  const currentDate = new Date();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  const data = await getScheduling(month, year);

  return (
    <div className="container mx-auto pb-8">
      <div className="mb-2 flex items-center">
        <h1 className="text-xl font-bold">Scheduling</h1>
        <p className="mt-2 ml-auto text-xs text-white">
          Gestione allocazione risorse per progetto -{' '}
          {new Date(year, month - 1).toLocaleDateString('it-IT', {
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      <Suspense
        fallback={<div className="p-8 text-center">Caricamento...</div>}
      >
        <ScheduleClient
          initialData={data}
          initialMonth={month}
          initialYear={year}
        />
      </Suspense>
    </div>
  );
}
