/**
 * Configurazione modulo Scheduling
 * Personalizza i valori per adattare il modulo alle tue esigenze
 */

export const schedulingConfig = {
  // Larghezze colonne fisse (in px o classi Tailwind)
  columns: {
    type: 'w-32',      // Tipologia
    client: 'w-40',    // Cliente
    order: 'w-32',     // Commessa
    pm: 'w-32',        // PM
    resource: 'w-40',  // Risorsa
  },

  // Larghezza celle giorni (in px)
  dayCell: {
    width: 64,
    minHeight: 40,
  },

  // Valori ore disponibili nei quick buttons
  quickHours: [0, 0.5, 2, 4, 8],

  // Limiti ore
  hours: {
    min: 0,
    max: 8,
    step: 0.5,
  },

  // Colori celle (classi Tailwind)
  colors: {
    empty: 'bg-green-100 text-gray-600 hover:bg-green-200',         // 0 ore
    partial: 'bg-yellow-400 text-gray-900',                         // 0.5 - 7.5 ore
    full: 'bg-red-500 text-white',                                  // 8 ore
    overallocated: 'bg-purple-500 text-white',                      // Sovrallocazione
  },

  // Altezza tabella
  table: {
    height: 'calc(100vh - 300px)',
    headerHeight: 80,
  },

  // Virtualizzazione
  virtualization: {
    estimatedRowSize: 48,
    overscan: 5,
  },

  // Formato date
  dateFormat: {
    locale: 'it-IT',
    monthFormat: { month: 'long', year: 'numeric' } as Intl.DateTimeFormatOptions,
    dayFormat: { day: 'numeric', month: 'numeric' } as Intl.DateTimeFormatOptions,
  },

  // Testi UI (i18n)
  labels: {
    title: 'Resource Scheduling',
    subtitle: 'Gestione allocazione risorse per progetto',
    filters: {
      client: 'Cliente',
      pm: 'PM',
      resource: 'Risorsa',
      search: 'Cerca',
      searchPlaceholder: 'Tipologia, cliente, commessa...',
      reset: 'Reset',
      all: 'Tutti',
    },
    table: {
      type: 'Tipologia',
      client: 'Cliente',
      order: 'Commessa',
      pm: 'PM',
      resource: 'Risorsa',
    },
    dialog: {
      title: 'Imposta Ore',
      dateLabel: 'Data',
      hoursLabel: 'Ore',
      sliderLabel: 'Slider',
      quickLabel: 'Quick',
      dailyTotal: 'Totale giorno',
      overallocation: 'Sovrallocazione!',
      cancel: 'Annulla',
      save: 'Salva',
      saving: 'Salvataggio...',
    },
    navigation: {
      prevMonth: '← Mese Precedente',
      nextMonth: 'Mese Successivo →',
      today: 'Oggi',
    },
    footer: {
      showing: 'Visualizzate',
      of: 'di',
      total: 'totali',
      rows: 'righe',
    },
  },
};

export type SchedulingConfig = typeof schedulingConfig;
