'use client';

import { useSchedulingStore } from '@/lib/scheduling-store';
import MultipleSelector, { Option } from '@/components/ui/multiple-selector';

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

  // Map data to Option[]
  const clientOptions: Option[] = clients.map((client) => ({
    value: client,
    label: client,
  }));
  const pmOptions: Option[] = pms.map((pm) => ({ value: pm, label: pm }));
  const teamOptions: Option[] = teams.map((team) => ({
    value: team,
    label: team,
  }));
  const peopleOptions: Option[] = people.map((person) => ({
    value: String(person.id),
    label: `${person.lastname} ${person.firstname}`,
  }));

  // Convert filter values to Option[] for controlled MultipleSelector (multi-select)
  const selectedClients = clientOptions.filter((o) =>
    filters.client?.includes(o.value)
  );
  const selectedPMs = pmOptions.filter((o) => filters.pm?.includes(o.value));
  const selectedTeams = teamOptions.filter((o) =>
    filters.team?.includes(o.value)
  );
  const selectedPeople = peopleOptions.filter(
    (o) =>
      Array.isArray(filters.personId) &&
      filters.personId.includes(Number(o.value))
  );

  return (
    <div className="relative z-50 mb-4 rounded-lg px-4 pt-2 pb-4">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-sm font-bold text-white">Filtri</h3>
        <button
          onClick={resetFilters}
          className="rounded-lg bg-red-200 px-3 py-1 text-sm text-red-950"
        >
          Reset
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Filtro Cliente */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-500">
            Cliente
          </label>
          <MultipleSelector
            options={clientOptions}
            value={selectedClients}
            onChange={(opts) =>
              setFilter(
                'client',
                opts.map((o) => o.value)
              )
            }
            placeholder="Tutti"
          />
        </div>

        {/* Filtro PM */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-500">
            PM
          </label>
          <MultipleSelector
            options={pmOptions}
            value={selectedPMs}
            onChange={(opts) =>
              setFilter(
                'pm',
                opts.map((o) => o.value)
              )
            }
            placeholder="Tutti"
          />
        </div>

        {/* Filtro Persona */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-500">
            Risorsa
          </label>
          <MultipleSelector
            options={peopleOptions}
            value={selectedPeople}
            onChange={(opts) =>
              setFilter(
                'personId',
                opts.map((o) => Number(o.value))
              )
            }
            placeholder="Tutti"
          />
        </div>

        {/* Filtro Team */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-500">
            Team
          </label>
          <MultipleSelector
            options={teamOptions}
            value={selectedTeams}
            onChange={(opts) =>
              setFilter(
                'team',
                opts.map((o) => o.value)
              )
            }
            placeholder="Tutti"
          />
        </div>
      </div>
    </div>
  );
}
