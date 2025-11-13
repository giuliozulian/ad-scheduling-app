'use client';

import { Suspense } from 'react';
import PeopleTable from '../../components/PeopleTable';

export default function PeoplePage() {
  return (
    <main className="container mx-auto block">
      <h1 className="mb-8 text-3xl font-bold text-black dark:text-zinc-50">
        People
      </h1>
      <Suspense fallback={<div>Loading...</div>}>
        <PeopleTable />
      </Suspense>
    </main>
  );
}
