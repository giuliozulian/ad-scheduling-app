# Modulo Resource Scheduling

Modulo completo di gestione allocazione risorse per progetti in Next.js 15+.

## 🚀 Funzionalità

- ✅ Tabella virtualizzata con scroll orizzontale e colonne fisse
- ✅ Visualizzazione per settimane e giorni del mese
- ✅ Celle colorate in base alle ore allocate:
  - 🟢 Verde: 0 ore
  - 🟡 Giallo: 0.5 - 7.5 ore
  - 🔴 Rosso: 8 ore
  - 🟣 Viola: sovrallocazione (>8h totali nel giorno)
- ✅ Dialog per modifica ore con:
  - Input numerico
  - Slider
  - Quick buttons (0, 0.5, 2, 4, 8)
  - Visualizzazione totale giornaliero
- ✅ Filtri per:
  - Cliente
  - PM
  - Risorsa
  - Ricerca testo libero
- ✅ Server Actions per salvataggio real-time
- ✅ Zustand store per gestione stato client
- ✅ TypeScript completo
- ✅ Drizzle ORM con PostgreSQL

## 📦 Dipendenze Richieste

```bash
pnpm add zustand @tanstack/react-virtual
```

## 🗄️ Database Setup

### 1. Esegui la migration

```sql
-- Esegui il file: db/migrations/0002_create_project_allocations.sql
```

Oppure genera la migration con Drizzle:

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

### 2. (Opzionale) Popola con dati di esempio

```bash
pnpm db:seed:allocations
```

## 📁 Struttura File

```
app/scheduling/
  ├── page.tsx                    # Server Component principale
  ├── ScheduleClient.tsx          # Client Component wrapper
  └── actions.ts                  # Server Actions

components/schedule/
  ├── ScheduleTable.tsx           # Tabella virtualizzata
  ├── DayCell.tsx                 # Cella editabile con dialog
  ├── WeekHeader.tsx              # Header settimane e giorni
  └── Filters.tsx                 # Filtri

lib/
  ├── scheduling-store.ts         # Zustand store
  └── date-utils.ts               # Utility date

db/
  ├── schema/index.ts             # Schema Drizzle (aggiornato)
  ├── queries.ts                  # Query ottimizzate
  └── migrations/
      └── 0002_create_project_allocations.sql
```

## 🎯 Utilizzo

### Accedi alla pagina

```
http://localhost:3000/scheduling
```

### API Actions

```typescript
// Server Action per recuperare dati
import { getScheduling } from '@/app/scheduling/actions';

const data = await getScheduling(month, year);

// Server Action per impostare ore
import { setHours } from '@/app/scheduling/actions';

const result = await setHours({
  projectId: 1,
  personId: 2,
  date: '2025-01-15',
  hours: 4
});
```

### Store Client

```typescript
import { useSchedulingStore } from '@/lib/scheduling-store';

// In un componente client
const filters = useSchedulingStore((state) => state.filters);
const setFilter = useSchedulingStore((state) => state.setFilter);
const getHours = useSchedulingStore((state) => state.getHours);
```

## 🎨 Personalizzazione Colori

Modifica i colori delle celle in `components/schedule/DayCell.tsx`:

```typescript
function getCellColor(hours: number, dailyTotal: number): string {
  if (dailyTotal > 8) return 'bg-purple-500 text-white';
  if (hours === 8) return 'bg-red-500 text-white';
  if (hours > 0 && hours < 8) return 'bg-yellow-400 text-gray-900';
  return 'bg-green-100 text-gray-600';
}
```

## 🔧 Configurazione

### Modificare i valori ore disponibili

In `components/schedule/DayCell.tsx`:

```typescript
{[0, 0.5, 2, 4, 8].map((value) => (
  // Quick buttons
))}
```

### Modificare larghezza colonne fisse

In `components/schedule/ScheduleTable.tsx`:

```typescript
<div className="w-32 ...">Tipologia</div>
<div className="w-40 ...">Cliente</div>
// etc.
```

### Modificare larghezza celle giorni

In `components/schedule/DayCell.tsx` e `WeekHeader.tsx`:

```typescript
style={{ width: '64px' }} // Modifica questo valore
```

## 🧪 Testing

### Dati Mock

Il seed `db/seeds/allocations.ts` genera dati random per testare:

- 5 progetti
- 10 persone
- 5-15 giorni allocati per persona/progetto
- Ore random: 0.5, 1, 2, 4, 8

## 📝 Note Tecniche

### Virtualizzazione

La tabella usa `@tanstack/react-virtual` per renderizzare solo le righe visibili:

- Migliore performance con centinaia di righe
- Scroll smooth
- Overscan di 5 righe per pre-rendering

### Ottimizzazioni Query

Le query in `db/queries.ts` sono ottimizzate con:

- Join efficienti
- Aggregazioni SQL
- Indici su project_id, person_id, date

### Gestione Stato

- **Server**: dati iniziali da PostgreSQL
- **Client**: Zustand per filtri e allocazioni
- **Sincronizzazione**: Server Actions aggiornano DB + store locale

## 🐛 Troubleshooting

### Errore "Module not found"

Verifica che il `tsconfig.json` abbia:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Allocazioni non si salvano

Controlla:

1. Tabella `project_allocations` esiste nel DB
2. Indice unique è stato creato
3. Foreign keys verso `projects` e `people` sono valide

### Virtualizzazione non funziona

Verifica di aver installato:

```bash
pnpm add @tanstack/react-virtual
```

## 📚 Riferimenti

- [Next.js 15 App Router](https://nextjs.org/docs)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Zustand](https://github.com/pmndrs/zustand)
- [TanStack Virtual](https://tanstack.com/virtual)
- [shadcn/ui](https://ui.shadcn.com/)
