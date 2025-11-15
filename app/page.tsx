import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between px-16 py-32 sm:items-start">
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <Link
            className="flex h-12 w-full items-center justify-center rounded-full bg-blue-600 px-5 text-white transition-colors hover:bg-blue-700 md:w-[158px]"
            href="/people"
          >
            Vai alla tabella People
          </Link>
          <Link
            className="flex h-12 w-full items-center justify-center rounded-full bg-green-600 px-5 text-white transition-colors hover:bg-green-700 md:w-[158px]"
            href="/projects"
          >
            Vai alla tabella Projects
          </Link>
        </div>
      </main>
    </div>
  );
}
