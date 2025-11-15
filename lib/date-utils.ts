/**
 * Utility functions for date manipulation and calendar calculations
 */

/**
 * Restituisce il numero di giorni in un mese
 */
export function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Restituisce un array di tutti i giorni del mese come stringhe ISO (YYYY-MM-DD)
 * Esclude sabato e domenica
 */
export function getDaysOfMonth(month: number, year: number): string[] {
  const daysCount = getDaysInMonth(month, year);
  const days: string[] = [];
  
  for (let day = 1; day <= daysCount; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    // Escludi weekend (sabato = 6, domenica = 0)
    if (!isWeekend(dateStr)) {
      days.push(dateStr);
    }
  }
  
  return days;
}

/**
 * Restituisce il numero della settimana per una data specifica (1-5 o 6)
 */
export function getWeekOfMonth(dateStr: string): number {
  const date = new Date(dateStr);
  const day = date.getDate();
  return Math.ceil(day / 7);
}

/**
 * Restituisce un oggetto con le settimane del mese e i giorni corrispondenti
 * Formato: { week: number, days: string[] }[]
 * Usa il numero di settimana ISO 8601 (standard europeo)
 */
export interface WeekData {
  week: number;
  days: string[];
  label: string;
}

export function getWeeksOfMonth(month: number, year: number): WeekData[] {
  const days = getDaysOfMonth(month, year);
  const weeks: Map<number, string[]> = new Map();
  
  days.forEach(day => {
    const weekNum = getISOWeek(day);
    if (!weeks.has(weekNum)) {
      weeks.set(weekNum, []);
    }
    weeks.get(weekNum)!.push(day);
  });
  
  return Array.from(weeks.entries()).map(([week, days]) => ({
    week,
    days,
    label: `W${week}`,
  }));
}

/**
 * Formatta una data ISO in formato giorno/mese (es: "15/1")
 */
export function formatDayMonth(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getDate()}/${date.getMonth() + 1}`;
}

/**
 * Formatta una data ISO in formato completo (es: "15 Gennaio 2025")
 */
export function formatDateFull(dateStr: string): string {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  };
  return date.toLocaleDateString('it-IT', options);
}

/**
 * Restituisce il nome del mese
 */
export function getMonthName(month: number): string {
  const date = new Date(2000, month - 1, 1);
  return date.toLocaleDateString('it-IT', { month: 'long' });
}

/**
 * Restituisce il giorno della settimana (0 = Domenica, 1 = Lunedì, ...)
 */
export function getDayOfWeek(dateStr: string): number {
  return new Date(dateStr).getDay();
}

/**
 * Restituisce il nome breve del giorno della settimana (Lun, Mar, Mer, ...)
 */
export function getDayName(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('it-IT', { weekday: 'short' });
}

/**
 * Calcola il numero della settimana ISO 8601 (standard europeo)
 * Le settimane iniziano di lunedì e la prima settimana dell'anno contiene il 4 gennaio
 */
export function getISOWeek(dateStr: string): number {
  const date = new Date(dateStr);
  const thursday = new Date(date.getTime());
  
  // Imposta la data al giovedì della stessa settimana
  thursday.setDate(date.getDate() + (4 - (date.getDay() || 7)));
  
  // Primo gennaio dell'anno del giovedì
  const yearStart = new Date(thursday.getFullYear(), 0, 1);
  
  // Calcola il numero di settimana
  const weekNumber = Math.ceil((((thursday.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  
  return weekNumber;
}

/**
 * Verifica se una data è un weekend
 */
export function isWeekend(dateStr: string): boolean {
  const day = getDayOfWeek(dateStr);
  return day === 0 || day === 6;
}

/**
 * Genera la chiave univoca per una allocazione
 */
export function getAllocationKey(projectId: number, personId: number, date: string): string {
  return `${projectId}-${personId}-${date}`;
}

/**
 * Parsifica la chiave univoca di allocazione
 */
export function parseAllocationKey(key: string): { projectId: number; personId: number; date: string } | null {
  const parts = key.split('-');
  if (parts.length < 3) return null;
  
  const projectId = parseInt(parts[0], 10);
  const personId = parseInt(parts[1], 10);
  const date = parts.slice(2).join('-');
  
  return { projectId, personId, date };
}

/**
 * Ottiene il mese e l'anno correnti
 */
export function getCurrentMonthYear(): { month: number; year: number } {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
}

/**
 * Crea una data ISO string dal giorno, mese e anno
 */
export function createISODate(day: number, month: number, year: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
