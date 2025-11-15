'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav className="font-lg ml-auto flex gap-6 font-bold">
      <Link
        href="/people"
        className={`transition-colors ${
          isActive('/people') ? 'text-white' : 'text-gray-400 hover:text-white'
        }`}
      >
        People
      </Link>
      <Link
        href="/projects"
        className={`transition-colors ${
          isActive('/projects')
            ? 'text-white'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        Projects
      </Link>
    </nav>
  );
}
