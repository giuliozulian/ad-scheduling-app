/**
 * Quick Test Checklist
 * Esegui questi test per verificare che tutto funzioni correttamente
 */

-- ========================================
-- 1. VERIFICA DATABASE
-- ========================================

-- Controlla che la tabella esista
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'project_allocations';

-- Controlla gli indici
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'project_allocations';

-- Controlla i vincoli
SELECT
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'project_allocations';

-- ========================================
-- 2. TEST INSERIMENTO DATI
-- ========================================

-- Inserisci un'allocazione di test
INSERT INTO project_allocations (project_id, person_id, date, hours)
VALUES (
  (SELECT id FROM projects LIMIT 1),
  (SELECT id FROM people LIMIT 1),
  CURRENT_DATE,
  4
)
ON CONFLICT (project_id, person_id, date) 
DO UPDATE SET hours = 4;

-- Verifica inserimento
SELECT 
  pa.*,
  p.firstname || ' ' || p.lastname as person_name,
  pr.client as project_client
FROM project_allocations pa
JOIN people p ON pa.person_id = p.id
JOIN projects pr ON pa.project_id = pr.id
LIMIT 5;

-- ========================================
-- 3. TEST QUERY AGGREGATE
-- ========================================

-- Totale ore per persona per giorno (verifica sovrallocazioni)
SELECT 
  p.firstname || ' ' || p.lastname as person,
  pa.date,
  SUM(pa.hours) as total_hours,
  CASE 
    WHEN SUM(pa.hours) > 8 THEN '⚠️ SOVRALLOCATO'
    WHEN SUM(pa.hours) = 8 THEN '✅ COMPLETO'
    ELSE '📊 PARZIALE'
  END as status
FROM project_allocations pa
JOIN people p ON pa.person_id = p.id
WHERE pa.date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY p.id, pa.date, p.firstname, p.lastname
ORDER BY pa.date DESC, total_hours DESC;

-- Totale ore per progetto
SELECT 
  pr.client,
  pr.order,
  COUNT(DISTINCT pa.person_id) as num_people,
  SUM(pa.hours) as total_hours
FROM project_allocations pa
JOIN projects pr ON pa.project_id = pr.id
WHERE pa.date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY pr.id, pr.client, pr.order
ORDER BY total_hours DESC;

-- ========================================
-- 4. TEST PERFORMANCE
-- ========================================

-- Spiega query principale (verifica uso indici)
EXPLAIN ANALYZE
SELECT DISTINCT
  projects.id as projectId,
  projects.type as projectType,
  projects.client as projectClient,
  projects.order as projectOrder,
  projects.pm as projectPm,
  people.id as personId,
  people.firstname as personFirstname,
  people.lastname as personLastname
FROM project_allocations
INNER JOIN projects ON project_allocations.project_id = projects.id
INNER JOIN people ON project_allocations.person_id = people.id
WHERE project_allocations.date >= '2025-01-01'
  AND project_allocations.date <= '2025-01-31';

-- ========================================
-- 5. TEST VALIDAZIONE
-- ========================================

-- Test vincolo unique (deve fallire se esiste già)
INSERT INTO project_allocations (project_id, person_id, date, hours)
VALUES (
  (SELECT id FROM projects LIMIT 1),
  (SELECT id FROM people LIMIT 1),
  CURRENT_DATE,
  8
);
-- Se fallisce con "duplicate key value violates unique constraint" = ✅ OK

-- Test foreign key (deve fallire con ID inesistente)
INSERT INTO project_allocations (project_id, person_id, date, hours)
VALUES (99999, 99999, CURRENT_DATE, 4);
-- Se fallisce con "violates foreign key constraint" = ✅ OK

-- Test hours valide
INSERT INTO project_allocations (project_id, person_id, date, hours)
VALUES (
  (SELECT id FROM projects LIMIT 1),
  (SELECT id FROM people LIMIT 1 OFFSET 1),
  CURRENT_DATE + INTERVAL '1 day',
  4.5  -- Test con 0.5
);

-- ========================================
-- 6. CLEANUP TEST DATA
-- ========================================

-- Rimuovi dati di test (opzionale)
DELETE FROM project_allocations 
WHERE date = CURRENT_DATE 
  AND hours = 4;

-- ========================================
-- 7. STATISTICHE FINALI
-- ========================================

-- Count totali
SELECT 
  (SELECT COUNT(*) FROM people) as total_people,
  (SELECT COUNT(*) FROM projects) as total_projects,
  (SELECT COUNT(*) FROM project_allocations) as total_allocations,
  (SELECT COUNT(DISTINCT date) FROM project_allocations) as days_with_allocations,
  (SELECT SUM(hours) FROM project_allocations) as total_hours_allocated;

-- Distribuzione ore
SELECT 
  hours,
  COUNT(*) as frequency,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM project_allocations), 2) as percentage
FROM project_allocations
GROUP BY hours
ORDER BY hours;

-- ========================================
-- ✅ CHECKLIST VERIFICA FRONTEND
-- ========================================

/*
  Dopo aver verificato il database, testa il frontend:

  1. Apri http://localhost:3000/scheduling
  
  2. Verifica rendering tabella:
     ✅ Header visibile (Tipologia, Cliente, Commessa, PM, Risorsa)
     ✅ Giorni del mese visibili
     ✅ Settimane (W1, W2, W3...) visibili
     ✅ Righe visualizzate correttamente
  
  3. Test filtri:
     ✅ Seleziona un cliente → righe filtrate
     ✅ Seleziona un PM → righe filtrate
     ✅ Seleziona una risorsa → righe filtrate
     ✅ Digita nel search → righe filtrate
     ✅ Click Reset → tutti i filtri resettati
  
  4. Test celle:
     ✅ Clic su cella → dialog aperto
     ✅ Slider funziona
     ✅ Input numerico funziona
     ✅ Quick buttons (0, 0.5, 2, 4, 8) funzionano
     ✅ Salva → dialog chiuso, DB aggiornato
     ✅ Cella colorata correttamente:
        - Verde se 0h
        - Giallo se 0.5-7.5h
        - Rosso se 8h
        - Viola se >8h totali
  
  5. Test navigazione:
     ✅ Click "Mese Successivo" → dati cambiano
     ✅ Click "Mese Precedente" → dati cambiano
     ✅ Click "Oggi" → torna al mese corrente
  
  6. Test performance:
     ✅ Scroll smooth (no lag)
     ✅ Apertura dialog veloce (<100ms)
     ✅ Salvataggio veloce (<300ms)
     ✅ Filtri applicati istantaneamente
  
  7. Test edge cases:
     ✅ Prova a inserire 12h → errore validazione
     ✅ Prova a inserire 3h → errore (non multiplo di 0.5)
     ✅ Inserisci 8h su progetto A + 4h su progetto B (stesso giorno/persona)
        → celle viola (sovrallocazione)
  
  8. Verifica console browser:
     ✅ Nessun errore JavaScript
     ✅ Nessun warning React
     ✅ Network requests OK (200)
  
  9. Test responsive (opzionale):
     ✅ Filtri responsive su mobile
     ✅ Scroll orizzontale funziona su mobile
     ✅ Dialog leggibile su mobile

  10. Database dopo modifiche frontend:
      ✅ SELECT * FROM project_allocations
         ORDER BY updated_at DESC LIMIT 10;
      ✅ Verifica che i dati salvati corrispondano
*/
