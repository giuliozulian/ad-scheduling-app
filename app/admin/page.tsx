import { Calendar, FolderKanban, PersonStanding } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen items-start justify-start">
      <main className="container mx-auto">
        <div className="flex flex-col items-start gap-8 text-base font-medium sm:flex-row">
          <Link
            className="flex min-h-40 w-1/3 items-center gap-4 rounded-lg border border-[#555] bg-[#333] p-12 text-2xl text-white hover:bg-[#444] focus:ring-2 focus:ring-[#666] focus:ring-offset-2 focus:outline-none"
            href="/admin/people"
          >
            <PersonStanding className="h-16 w-16 stroke-1" />
            <h2>People</h2>
          </Link>

          <Link
            className="flex min-h-40 w-1/3 items-center gap-4 rounded-lg border border-[#555] bg-[#333] p-12 text-2xl text-white hover:bg-[#444] focus:ring-2 focus:ring-[#666] focus:ring-offset-2 focus:outline-none"
            href="/admin/projects"
          >
            <FolderKanban className="h-16 w-16 stroke-1" />
            <h2>Projects</h2>
          </Link>

          <Link
            className="flex min-h-40 w-1/3 items-center gap-4 rounded-lg border border-[#555] bg-[#333] p-12 text-2xl text-white hover:bg-[#444] focus:ring-2 focus:ring-[#666] focus:ring-offset-2 focus:outline-none"
            href="/admin/scheduling"
          >
            <Calendar className="h-16 w-16 stroke-1" />
            <h2>Scheduling</h2>
          </Link>
        </div>
      </main>
    </div>
  );
}
