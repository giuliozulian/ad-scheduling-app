# Setup Completo Modulo Scheduling

Guida step-by-step per configurare il modulo di Resource Scheduling.

## 📋 Pre-requisiti

- PostgreSQL installato e in esecuzione
- Database esistente con tabelle `people` e `projects`
- Node.js 18+ e pnpm installati

## 🚀 Setup Rapido

### 1. Installa le dipendenze

```bash
cd /Volumes/Sites/Nextjs/ad-scheduling-app
pnpm add zustand @tanstack/react-virtual
```

### 2. Configura il database

#### Opzione A: Migration manuale (SQL)

```bash
# Connettiti al database PostgreSQL
psql -U your_username -d your_database

# Esegui la migration
\i db/migrations/0002_create_project_allocations.sql
```

#### Opzione B: Drizzle Kit (consigliato)

```bash
# Genera la migration dal schema
npx drizzle-kit generate

# Applica la migration
npx drizzle-kit migrate
```

### 3. Popola con dati di esempio (opzionale)

```bash
# Assicurati di avere già people e projects
pnpm db:seed:people
pnpm db:seed:project

# Genera allocazioni di esempio
pnpm db:seed:allocations
```

### 4. Avvia il server

```bash
pnpm dev
```

### 5. Accedi alla pagina

Apri il browser su: `http://localhost:3000/scheduling`

## 🔧 Configurazione Avanzata

### Personalizza i colori

Modifica `lib/scheduling-config.ts`:

```typescript
export const schedulingConfig = {
  colors: {
    empty: 'bg-green-100 text-gray-600',
    partial: 'bg-yellow-400 text-gray-900',
    full: 'bg-red-500 text-white',
    overallocated: 'bg-purple-500 text-white',
  },
};
```

### Personalizza le ore disponibili

In `lib/scheduling-config.ts`:

```typescript
export const schedulingConfig = {
  quickHours: [0, 0.5, 1, 2, 4, 6, 8], // Aggiungi 1 e 6
  hours: {
    min: 0,
    max: 8,
    step: 0.5,
  },
};
```

### Modifica larghezza colonne

In `lib/scheduling-config.ts`:

```typescript
export const schedulingConfig = {
  columns: {
    type: 'w-40',      // Più larga
    client: 'w-48',    // Più larga
    order: 'w-32',
    pm: 'w-32',
    resource: 'w-44',
  },
};
```

## 📊 Struttura Database

### Tabella `project_allocations`

```sql
CREATE TABLE project_allocations (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  person_id INTEGER NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hours REAL NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(project_id, person_id, date)
);
```

### Indici

```sql
CREATE INDEX idx_allocations_project ON project_allocations(project_id);
CREATE INDEX idx_allocations_person ON project_allocations(person_id);
CREATE INDEX idx_allocations_date ON project_allocations(date);
```

## 🎯 Test del Sistema

### 1. Verifica la creazione della tabella

```sql
SELECT COUNT(*) FROM project_allocations;
```

### 2. Test inserimento manuale

```sql
INSERT INTO project_allocations (project_id, person_id, date, hours)
VALUES (1, 1, '2025-01-15', 4);
```

### 3. Test query aggregata

```sql
SELECT person_id, date, SUM(hours) as total_hours
FROM project_allocations
WHERE date BETWEEN '2025-01-01' AND '2025-01-31'
GROUP BY person_id, date
HAVING SUM(hours) > 8;
```

## 🐛 Risoluzione Problemi

### Errore: "Cannot find module 'zustand'"

```bash
pnpm add zustand @tanstack/react-virtual
```

### Errore: "Table project_allocations does not exist"

```bash
# Verifica che la migration sia stata eseguita
psql -U your_username -d your_database -c "\dt"

# Se non esiste, esegui:
psql -U your_username -d your_database < db/migrations/0002_create_project_allocations.sql
```

### Errore: "foreign key constraint fails"

Verifica che le tabelle `projects` e `people` esistano e abbiano dati:

```sql
SELECT COUNT(*) FROM projects;
SELECT COUNT(*) FROM people;
```

### Le allocazioni non si salvano

1. Controlla i log del browser (Console)
2. Verifica che il server action sia accessibile
3. Controlla che il database accetti connessioni

```bash
# Test connessione
psql -U your_username -d your_database -c "SELECT 1"
```

### Performance lenta con molte righe

1. Verifica che gli indici siano stati creati:

```sql
SELECT indexname FROM pg_indexes WHERE tablename = 'project_allocations';
```

2. Riduci il numero di righe visualizzate usando i filtri

3. Aumenta l'overscan della virtualizzazione in `lib/scheduling-config.ts`:

```typescript
virtualization: {
  estimatedRowSize: 48,
  overscan: 10, // Aumenta da 5 a 10
}
```

## 📈 Performance Tips

### 1. Caching query ricorrenti

Aggiungi cache alle query in `db/queries.ts`:

```typescript
import { unstable_cache } from 'next/cache';

export const getUniqueClients = unstable_cache(
  async () => {
    const result = await db
      .selectDistinct({ client: projects.client })
      .from(projects)
      .orderBy(projects.client);
    return result.map((r: { client: string }) => r.client);
  },
  ['unique-clients'],
  { revalidate: 3600 } // Cache per 1 ora
);
```

### 2. Paginazione server-side

Per database molto grandi, implementa paginazione:

```typescript
export async function getScheduleRows(
  month: number, 
  year: number,
  page: number = 1,
  limit: number = 100
) {
  const offset = (page - 1) * limit;
  
  const result = await db
    .selectDistinct(/* ... */)
    .limit(limit)
    .offset(offset);
    
  return result;
}
```

### 3. Lazy loading filtri

Carica i filtri solo quando necessario:

```typescript
// In ScheduleClient.tsx
const [clients, setClients] = useState<string[]>([]);

useEffect(() => {
  async function loadFilters() {
    const data = await fetch('/api/scheduling/filters');
    setClients(await data.json());
  }
  loadFilters();
}, []);
```

## 🔐 Sicurezza

### Validazione Server-Side

In `app/scheduling/actions.ts`, la validazione è già implementata:

```typescript
// Validazione ore
if (hours < 0 || hours > 8) {
  return { success: false, error: 'Le ore devono essere tra 0 e 8' };
}

// Validazione incrementi
if (hours % 0.5 !== 0) {
  return { success: false, error: 'Le ore devono essere incrementi di 0.5' };
}
```

### Autenticazione

Aggiungi middleware per proteggere la route:

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Verifica autenticazione
  const token = request.cookies.get('auth-token');
  
  if (!token && request.nextUrl.pathname.startsWith('/scheduling')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}
```

## 📝 Checklist Setup

- [ ] Dipendenze installate (`zustand`, `@tanstack/react-virtual`)
- [ ] Migration eseguita (tabella `project_allocations` creata)
- [ ] Indici creati
- [ ] Dati di test popolati (opzionale)
- [ ] Server dev avviato
- [ ] Pagina `/scheduling` accessibile
- [ ] Filtri funzionanti
- [ ] Celle editabili
- [ ] Salvataggio ore funzionante
- [ ] Navigazione mesi funzionante

## 🎓 Next Steps

1. **Reportistica**: Aggiungi export Excel/PDF delle allocazioni
2. **Dashboard**: Crea una vista riepilogativa con grafici
3. **Notifiche**: Alert per sovrallocazioni
4. **Approvazione**: Workflow di approvazione PM
5. **Mobile**: Ottimizza la UI per mobile
6. **Real-time**: WebSocket per aggiornamenti live multi-utente

## 📚 Risorse

- [Documentazione completa](./SCHEDULING_README.md)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [Zustand Guide](https://github.com/pmndrs/zustand)
