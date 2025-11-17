'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (!pathname) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav className="font-lg ml-auto flex gap-6">
      <Link
        href="/admin/people"
        className={`transition-colors ${
          isActive('/admin/people')
            ? 'font-bold text-white'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        People
      </Link>
      <Link
        href="/admin/projects"
        className={`transition-colors ${
          isActive('/admin/projects')
            ? 'font-bold text-white'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        Projects
      </Link>
      <Link
        href="/admin/scheduling"
        className={`transition-colors ${
          isActive('/admin/scheduling')
            ? 'font-bold text-white'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        Scheduling
      </Link>
    </nav>
  );
}
