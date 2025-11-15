'use client';

import { useSchedulingStore } from '@/lib/scheduling-store';

interface FiltersProps {
  clients: string[];
  pms: string[];
  teams: string[];
  people: Array<{ id: number; firstname: string; lastname: string }>;
}

export function Filters({ clients, pms, teams, people }: FiltersProps) {
  const filters = useSchedulingStore((state) => state.filters);
  const setFilter = useSchedulingStore((state) => state.setFilter);
  const resetFilters = useSchedulingStore((state) => state.resetFilters);

  return (
    <div className="mb-4 rounded-lg bg-[#dedede] px-4 pt-2 pb-4">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-800">Filtri</h3>
        <button
          onClick={resetFilters}
          className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
        >
          Reset
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Filtro Cliente */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Cliente
          </label>
          <select
            value={filters.client}
            onChange={(e) => setFilter('client', e.target.value)}
            className="w-full rounded border border-gray-500 px-3 py-2 text-sm text-black focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Tutti</option>
            {clients.map((client) => (
              <option key={client} value={client}>
                {client}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro PM */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            PM
          </label>
          <select
            value={filters.pm}
            onChange={(e) => setFilter('pm', e.target.value)}
            className="w-full rounded border border-gray-500 px-3 py-2 text-sm text-black focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Tutti</option>
            {pms.map((pm) => (
              <option key={pm} value={pm}>
                {pm}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro Persona */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Risorsa
          </label>
          <select
            value={filters.personId ?? ''}
            onChange={(e) =>
              setFilter(
                'personId',
                e.target.value ? parseInt(e.target.value, 10) : null
              )
            }
            className="w-full rounded border border-gray-500 px-3 py-2 text-sm text-black focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Tutti</option>
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.lastname} {person.firstname}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro Team */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Team
          </label>
          <select
            value={filters.team}
            onChange={(e) => setFilter('team', e.target.value)}
            className="w-full rounded border border-gray-500 px-3 py-2 text-sm text-black focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Tutti</option>
            {teams.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
