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
import { Dialog } from './ui/dialog';
import { Pencil } from 'lucide-react';

// Types
interface Project {
  id: number;
  type: string;
  client: string;
  order: string;
  pm: string;
}

type SortDirection = 'asc' | 'desc';
type FilterKey = keyof Project;
type Filters = Partial<Record<FilterKey, string>>;

interface Column {
  key: FilterKey;
  label: string;
}

// Constants
const PAGE_SIZE = 40;
const ACTION_COLUMN_LABEL = 'Azione';

const COLUMNS: Column[] = [
  { key: 'id', label: 'ID' },
  { key: 'type', label: 'Tipo' },
  { key: 'client', label: 'Cliente' },
  { key: 'order', label: 'Ordine' },
  { key: 'pm', label: 'PM' },
];

// Utility functions
const getUniqueValues = (items: Project[], key: FilterKey): string[] =>
  Array.from(
    new Set(items.map((item) => item[key]).filter(Boolean) as string[])
  );

const matchesFilter = (
  project: Project,
  key: string,
  value: string
): boolean => {
  const field = project[key as FilterKey];
  if (field === undefined || field === null) return false;
  const fieldStr = String(field).toLowerCase();
  const valueStr = value.toLowerCase();
  return fieldStr.includes(valueStr);
};

const compareValues = (a: unknown, b: unknown, dir: SortDirection): number => {
  if (typeof a === 'number' && typeof b === 'number') {
    return dir === 'asc' ? a - b : b - a;
  }
  const comparison = String(a).localeCompare(String(b));
  return dir === 'asc' ? comparison : -comparison;
};

// Custom hook for table logic
const useTableData = (projects: Project[]) => {
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

  const filteredProjects = useMemo(
    () =>
      projects.filter((project) =>
        Object.entries(filters).every(
          ([key, value]) => !value || matchesFilter(project, key, value)
        )
      ),
    [projects, filters]
  );

  const sortedProjects = useMemo(
    () =>
      [...filteredProjects].sort((a, b) => {
        const aVal = a[sortBy] ?? '';
        const bVal = b[sortBy] ?? '';
        return compareValues(aVal, bVal, sortDir);
      }),
    [filteredProjects, sortBy, sortDir]
  );

  const totalPages = Math.max(1, Math.ceil(sortedProjects.length / PAGE_SIZE));
  const paginatedProjects = useMemo(
    () => sortedProjects.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [sortedProjects, page]
  );

  const uniqueOptions = useMemo(
    () => ({
      type: getUniqueValues(projects, 'type'),
      client: getUniqueValues(projects, 'client'),
      pm: getUniqueValues(projects, 'pm'),
    }),
    [projects]
  );

  return {
    sortBy,
    sortDir,
    filters,
    page,
    totalPages,
    paginatedProjects,
    sortedProjects,
    uniqueOptions,
    handleSort,
    handleFilterChange,
    setPage,
  };
};

export default function ProjectTable() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo progetto?'))
      return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Errore eliminazione');
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("Errore durante l'eliminazione");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (project: Project) => {
    setEditProject(project);
    setEditModalOpen(true);
  };

  const handleSave = async (updated: Project) => {
    try {
      const res = await fetch(`/api/projects/${updated.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error('Errore modifica');
      setProjects((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
      setEditModalOpen(false);
    } catch {
      alert('Errore durante la modifica');
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/projects');
        if (!res.ok) throw new Error('Errore nella fetch');
        const data = await res.json();
        setProjects(data);
      } catch (error) {
        console.error('Errore fetch /api/projects:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const {
    sortBy,
    sortDir,
    filters,
    page,
    totalPages,
    paginatedProjects,
    sortedProjects,
    uniqueOptions,
    handleSort,
    handleFilterChange,
    setPage,
  } = useTableData(projects);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500 dark:text-gray-400">Caricamento...</div>
      </div>
    );
  }

  return (
    <div className="mb-16 overflow-x-auto rounded-xl border border-black/10 bg-white p-2 shadow-lg md:p-2 dark:border-black/10 dark:bg-[#222]">
      <Table className="min-w-full bg-white text-left text-xs md:text-sm dark:bg-[#18181b]">
        <TableHeader className="sticky top-0 z-10">
          <TableRow className="bg-gray-100 dark:bg-[#232326]">
            {COLUMNS.map((col) => (
              <TableHead
                key={col.key}
                className="hover:bg-black-100 cursor-pointer rounded-t px-3 py-3 font-semibold text-gray-700 transition-colors select-none dark:text-gray-200 dark:hover:bg-[#555]"
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
            <TableHead className="px-3 py-3 text-center font-semibold text-gray-700 dark:text-gray-200">
              {ACTION_COLUMN_LABEL}
            </TableHead>
          </TableRow>
          <TableRow className="bg-gray-50 dark:bg-[#18181b]">
            {COLUMNS.map((col) => (
              <TableHead key={col.key} className="px-3 py-2">
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
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedProjects.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={COLUMNS.length + 1}
                className="py-8 text-center text-gray-400 dark:text-gray-500"
              >
                Nessun risultato trovato
              </TableCell>
            </TableRow>
          ) : (
            paginatedProjects.map((project, idx) => (
              <TableRow
                key={project.id}
                className={
                  'transition hover:bg-blue-50 dark:hover:bg-[#444]' +
                  (idx % 2 === 0
                    ? ' bg-white dark:bg-[#18181b]'
                    : ' bg-gray-50 dark:bg-[#232326]')
                }
              >
                <TableCell className="border-b border-gray-100 px-3 py-2 whitespace-nowrap text-gray-900 dark:border-gray-800 dark:bg-inherit dark:text-gray-100">
                  {project.id}
                </TableCell>
                <TableCell className="border-b border-gray-100 px-3 py-2 whitespace-nowrap text-gray-900 dark:border-gray-800 dark:bg-inherit dark:text-gray-100">
                  {project.type}
                </TableCell>
                <TableCell className="border-b border-gray-100 px-3 py-2 whitespace-nowrap text-gray-900 dark:border-gray-800 dark:bg-inherit dark:text-gray-100">
                  {project.client}
                </TableCell>
                <TableCell className="border-b border-gray-100 px-3 py-2 whitespace-nowrap text-gray-900 dark:border-gray-800 dark:bg-inherit dark:text-gray-100">
                  {project.order}
                </TableCell>
                <TableCell className="border-b border-gray-100 px-3 py-2 whitespace-nowrap text-gray-900 dark:border-gray-800 dark:bg-inherit dark:text-gray-100">
                  {project.pm}
                </TableCell>
                <TableCell className="border-b border-gray-100 px-3 py-2 text-center dark:border-gray-800 dark:bg-inherit">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleDelete(project.id)}
                      disabled={deletingId === project.id}
                      className="flex items-center justify-center border-red-200 text-red-600 hover:bg-red-50 dark:border-red-700 dark:bg-[#333] dark:text-red-400 dark:hover:bg-red-900"
                      aria-label="Elimina"
                    >
                      {deletingId === project.id ? (
                        <span className="animate-pulse">...</span>
                      ) : (
                        <svg
                          width="18"
                          height="18"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      className="flex items-center justify-center border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:bg-[#333] dark:text-blue-400 dark:hover:bg-blue-900"
                      aria-label="Modifica"
                      onClick={() => handleEdit(project)}
                    >
                      <Pencil size={18} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {/* Pagination controls */}
      <Pagination className="mt-4 flex flex-col items-center justify-between gap-2 md:flex-row">
        <div className="mb-2 text-xs text-gray-500 md:mb-0 dark:bg-[#101014] dark:text-gray-400">
          Pagina {page} di {totalPages} — {sortedProjects.length} risultati
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
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <div className="mb-4 text-2xl font-bold text-gray-800 dark:text-gray-100">
          Modifica progetto
        </div>
        {editProject && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave(editProject);
            }}
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                Tipo
              </label>
              <input
                className="rounded border bg-inherit p-2 text-gray-900 dark:text-gray-100"
                value={editProject.type}
                onChange={(e) =>
                  setEditProject({ ...editProject, type: e.target.value })
                }
                placeholder="Tipo"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                Cliente
              </label>
              <input
                className="rounded border bg-inherit p-2 text-gray-900 dark:text-gray-100"
                value={editProject.client}
                onChange={(e) =>
                  setEditProject({ ...editProject, client: e.target.value })
                }
                placeholder="Cliente"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                Ordine
              </label>
              <input
                className="rounded border bg-inherit p-2 text-gray-900 dark:text-gray-100"
                value={editProject.order}
                onChange={(e) =>
                  setEditProject({ ...editProject, order: e.target.value })
                }
                placeholder="Ordine"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                PM
              </label>
              <input
                className="rounded border bg-inherit p-2 text-gray-900 dark:text-gray-100"
                value={editProject.pm}
                onChange={(e) =>
                  setEditProject({ ...editProject, pm: e.target.value })
                }
                placeholder="PM"
                required
              />
            </div>
            <div className="col-span-1 mt-2 flex justify-end gap-2 md:col-span-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setEditModalOpen(false)}
              >
                Annulla
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-blue-600 text-white"
              >
                Salva
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </div>
  );
}
