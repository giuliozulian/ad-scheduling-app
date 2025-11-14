import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from './ui/table';
import { Pagination, PaginationItem } from './ui/pagination';
import { Button } from './ui/button';

// Types
interface Person {
  id: number;
  name: string;
  surname: string;
  email: string;
  level?: string;
  team?: string;
}

type SortDirection = 'asc' | 'desc';
type FilterKey = keyof Person;
type Filters = Partial<Record<FilterKey, string>>;

interface Column {
  key: FilterKey;
  label: string;
}

// Constants
const PAGE_SIZE = 40;
const COLUMNS: Column[] = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'surname', label: 'Surname' },
  { key: 'email', label: 'Email' },
  { key: 'team', label: 'Team' },
  { key: 'level', label: 'Livello' },
];

const SELECT_FILTER_KEYS: FilterKey[] = ['team', 'level'];

// Utility functions
const getUniqueValues = (items: Person[], key: FilterKey): string[] =>
  Array.from(
    new Set(items.map((item) => item[key]).filter(Boolean) as string[])
  );

const matchesFilter = (person: Person, key: string, value: string): boolean => {
  const field = person[key as FilterKey];
  if (field === undefined || field === null) return false;

  const fieldStr = String(field).toLowerCase();
  const valueStr = value.toLowerCase();

  return SELECT_FILTER_KEYS.includes(key as FilterKey)
    ? fieldStr === valueStr
    : fieldStr.includes(valueStr);
};

const compareValues = (a: unknown, b: unknown, dir: SortDirection): number => {
  if (typeof a === 'number' && typeof b === 'number') {
    return dir === 'asc' ? a - b : b - a;
  }
  const comparison = String(a).localeCompare(String(b));
  return dir === 'asc' ? comparison : -comparison;
};

// Custom hook for table logic
const useTableData = (people: Person[]) => {
  const [sortBy, setSortBy] = useState<FilterKey>('id');
  const [sortDir, setSortDir] = useState<SortDirection>('asc');
  const [filters, setFilters] = useState<Filters>({});
  const [page, setPage] = useState(1);

  const handleSort = useCallback((col: FilterKey) => {
    setSortBy((prev) => {
      if (prev === col) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        return prev;
      }
      setSortDir('asc');
      return col;
    });
    setPage(1);
  }, []);

  const handleFilterChange = useCallback((key: FilterKey, value: string) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  }, []);

  const filteredPeople = useMemo(
    () =>
      people.filter((person) =>
        Object.entries(filters).every(
          ([key, value]) => !value || matchesFilter(person, key, value)
        )
      ),
    [people, filters]
  );

  const sortedPeople = useMemo(
    () =>
      [...filteredPeople].sort((a, b) => {
        const aVal = a[sortBy] ?? '';
        const bVal = b[sortBy] ?? '';
        return compareValues(aVal, bVal, sortDir);
      }),
    [filteredPeople, sortBy, sortDir]
  );

  const totalPages = Math.max(1, Math.ceil(sortedPeople.length / PAGE_SIZE));
  const paginatedPeople = useMemo(
    () => sortedPeople.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [sortedPeople, page]
  );

  const uniqueOptions = useMemo(
    () => ({
      team: getUniqueValues(people, 'team'),
      level: getUniqueValues(people, 'level'),
    }),
    [people]
  );

  return {
    sortBy,
    sortDir,
    filters,
    page,
    totalPages,
    paginatedPeople,
    sortedPeople,
    uniqueOptions,
    handleSort,
    handleFilterChange,
    setPage,
  };
};

export default function PeopleTable() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPeople = async () => {
      try {
        const res = await fetch('/api/people');
        if (!res.ok) throw new Error('Errore nella fetch');
        const data = await res.json();
        setPeople(data);
      } catch (error) {
        console.error('Errore fetch /api/people:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPeople();
  }, []);

  const {
    sortBy,
    sortDir,
    filters,
    page,
    totalPages,
    paginatedPeople,
    sortedPeople,
    uniqueOptions,
    handleSort,
    handleFilterChange,
    setPage,
  } = useTableData(people);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500 dark:text-gray-400">Caricamento...</div>
      </div>
    );
  }

  return (
    <div className="mb-16 overflow-x-auto rounded-xl border border-gray-200 bg-white p-2 shadow-lg md:p-4 dark:border-gray-800 dark:bg-[#101014]">
      <Table className="min-w-full bg-white text-left text-xs md:text-sm dark:bg-[#18181b]">
        <TableHeader className="sticky top-0 z-10">
          <TableRow className="bg-gray-100 dark:bg-[#232326]">
            {COLUMNS.map((col) => (
              <TableHead
                key={col.key}
                className="hover:bg-black-100 cursor-pointer rounded-t px-3 py-3 font-semibold text-gray-700 transition-colors select-none dark:text-gray-200 dark:hover:bg-black/20"
                onClick={() => handleSort(col.key)}
                scope="col"
              >
                <span className="flex items-center gap-1">
                  {col.label}
                  {sortBy === col.key && (
                    <span className="dark:text-black-400 text-black-600 ml-1">
                      {sortDir === 'asc' ? (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M10 6l-4 4h8l-4-4z" />
                        </svg>
                      ) : (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M10 14l4-4H6l4 4z" />
                        </svg>
                      )}
                    </span>
                  )}
                </span>
              </TableHead>
            ))}
          </TableRow>
          <TableRow className="bg-gray-50 dark:bg-[#18181b]">
            {COLUMNS.map((col) => (
              <TableHead key={col.key} className="px-3 py-2">
                {col.key === 'team' ? (
                  <div className="relative flex items-center">
                    <svg
                      className="absolute top-1/2 left-2 -translate-y-1/2 text-gray-400"
                      width="14"
                      height="14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <select
                      value={filters.team ?? ''}
                      onChange={(e) =>
                        handleFilterChange('team', e.target.value)
                      }
                      className="dark:focus:ring-black-900 w-full rounded-lg border border-gray-300 bg-white py-1 pr-2 pl-7 text-xs text-gray-700 transition focus:ring-2 focus:ring-blue-300 focus:outline-none dark:border-gray-700 dark:bg-[#232326] dark:text-gray-200"
                    >
                      <option value="">Tutti i team</option>
                      {uniqueOptions.team.map((team) => (
                        <option key={team} value={team}>
                          {team}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : col.key === 'level' ? (
                  <div className="relative flex items-center">
                    <svg
                      className="absolute top-1/2 left-2 -translate-y-1/2 text-gray-400"
                      width="14"
                      height="14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="8" r="4" />
                      <path d="M6 21v-2a4 4 0 0 1 4-4h0a4 4 0 0 1 4 4v2" />
                    </svg>
                    <select
                      value={filters.level ?? ''}
                      onChange={(e) =>
                        handleFilterChange('level', e.target.value)
                      }
                      className="focus:ring-black-300 w-full rounded-lg border border-gray-300 bg-white py-1 pr-2 pl-7 text-xs text-gray-700 transition focus:ring-2 focus:outline-none dark:border-gray-700 dark:bg-[#232326] dark:text-gray-200 dark:focus:ring-blue-900"
                    >
                      <option value="">Tutti i livelli</option>
                      {uniqueOptions.level.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="relative flex items-center">
                    <svg
                      className="absolute top-1/2 left-2 -translate-y-1/2 text-gray-400"
                      width="14"
                      height="14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                      type="text"
                      value={filters[col.key] ?? ''}
                      onChange={(e) =>
                        handleFilterChange(col.key, e.target.value)
                      }
                      placeholder={`Filtra...`}
                      className="w-full rounded-lg border border-gray-300 bg-white py-1 pr-2 pl-7 text-xs text-gray-700 transition focus:ring-2 focus:ring-blue-300 focus:outline-none dark:border-gray-700 dark:bg-[#232326] dark:text-gray-200 dark:focus:ring-blue-900"
                      style={{ minWidth: 0 }}
                    />
                  </div>
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedPeople.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={COLUMNS.length}
                className="py-8 text-center text-gray-400 dark:text-gray-500"
              >
                Nessun risultato trovato
              </TableCell>
            </TableRow>
          ) : (
            paginatedPeople.map((person, idx) => (
              <TableRow
                key={person.id}
                className={
                  'transition hover:bg-blue-50 dark:hover:bg-[#232346]' +
                  (idx % 2 === 0
                    ? ' bg-white dark:bg-[#18181b]'
                    : ' bg-gray-50 dark:bg-[#232326]')
                }
              >
                <TableCell className="border-b border-gray-100 px-3 py-2 whitespace-nowrap text-gray-900 dark:border-gray-800 dark:bg-inherit dark:text-gray-100">
                  {person.id}
                </TableCell>
                <TableCell className="border-b border-gray-100 px-3 py-2 whitespace-nowrap text-gray-900 dark:border-gray-800 dark:bg-inherit dark:text-gray-100">
                  {person.name}
                </TableCell>
                <TableCell className="border-b border-gray-100 px-3 py-2 whitespace-nowrap text-gray-900 dark:border-gray-800 dark:bg-inherit dark:text-gray-100">
                  {person.surname}
                </TableCell>
                <TableCell className="border-b border-gray-100 px-3 py-2 font-medium whitespace-nowrap text-blue-700 dark:border-gray-800 dark:bg-inherit dark:text-blue-400">
                  {person.email}
                </TableCell>
                <TableCell className="border-b border-gray-100 px-3 py-2 whitespace-nowrap text-gray-900 dark:border-gray-800 dark:bg-inherit dark:text-gray-100">
                  {person.team ?? 'N/A'}
                </TableCell>
                <TableCell className="border-b border-gray-100 px-3 py-2 whitespace-nowrap text-gray-900 dark:border-gray-800 dark:bg-inherit dark:text-gray-100">
                  {person.level ?? 'N/A'}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {/* Pagination controls */}
      <Pagination className="mt-4 flex flex-col items-center justify-between gap-2 md:flex-row">
        <div className="mb-2 text-xs text-gray-500 md:mb-0 dark:bg-[#101014] dark:text-gray-400">
          Pagina {page} di {totalPages} — {sortedPeople.length} risultati
        </div>
        <ul className="flex gap-1">
          <PaginationItem>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(1)}
              disabled={page === 1}
              aria-label="Prima pagina"
            >
              «
            </Button>
          </PaginationItem>
          <PaginationItem>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Pagina precedente"
            >
              ‹
            </Button>
          </PaginationItem>
          <PaginationItem>
            <span className="px-2 py-1 font-mono text-xs dark:bg-[#101014] dark:text-gray-200">
              {page}
            </span>
          </PaginationItem>
          <PaginationItem>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              aria-label="Pagina successiva"
            >
              ›
            </Button>
          </PaginationItem>
          <PaginationItem>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              aria-label="Ultima pagina"
            >
              »
            </Button>
          </PaginationItem>
        </ul>
      </Pagination>
    </div>
  );
}
