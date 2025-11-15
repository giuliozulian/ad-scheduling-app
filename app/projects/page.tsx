'use client';

import { Suspense } from 'react';
import ProjectTable from '../../components/ProjectTable';

export default function PeoplePage() {
  return (
    <main className="container mx-auto block">
      <h1 className="mb-2 text-lg font-bold text-black dark:text-zinc-50">
        Projects
      </h1>
      <Suspense fallback={<div>Loading...</div>}>
        <ProjectTable />
      </Suspense>
    </main>
  );
}
