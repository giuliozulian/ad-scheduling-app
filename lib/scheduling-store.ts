'use client';

import { create } from 'zustand';
import { getAllocationKey } from './date-utils';

export interface ScheduleFilters {
  client: string[];
  pm: string[];
  personId: number[];
  team: string[];
}

export interface AllocationMap {
  [key: string]: number; // key: "projectId-personId-date", value: hours
}

export interface DailyTotalsMap {
  [key: string]: number; // key: "personId-date", value: total hours
}

interface SchedulingState {
  // Filtri
  filters: ScheduleFilters;
  
  // Dati allocazioni
  allocations: AllocationMap;
  dailyTotals: DailyTotalsMap;
  
  // Mese/Anno corrente
  month: number;
  year: number;
  
  // Actions
  setFilter: (key: keyof ScheduleFilters, value: string[] | number[]) => void;
  resetFilters: () => void;
  
  setHoursLocal: (projectId: number, personId: number, date: string, hours: number) => void;
  setAllocations: (allocations: AllocationMap) => void;
  setDailyTotals: (totals: DailyTotalsMap) => void;
  
  setMonthYear: (month: number, year: number) => void;
  
  getHours: (projectId: number, personId: number, date: string) => number;
  getDailyTotal: (personId: number, date: string) => number;
}

const defaultFilters: ScheduleFilters = {
  client: [],
  pm: [],
  personId: [],
  team: [],
};

export const useSchedulingStore = create<SchedulingState>((set, get) => ({
  // Initial state
  filters: defaultFilters,
  allocations: {},
  dailyTotals: {},
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  
  // Filter actions
  setFilter: (key, value) => {
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
      },
    }));
  },
  
  resetFilters: () => {
    set({ filters: defaultFilters });
  },
  
  // Allocation actions
  setHoursLocal: (projectId, personId, date, hours) => {
    const key = getAllocationKey(projectId, personId, date);
    const dailyKey = `${personId}-${date}`;
    
    set((state) => {
      const oldHours = state.allocations[key] || 0;
      const currentTotal = state.dailyTotals[dailyKey] || 0;
      const newTotal = currentTotal - oldHours + hours;
      
      return {
        allocations: {
          ...state.allocations,
          [key]: hours,
        },
        dailyTotals: {
          ...state.dailyTotals,
          [dailyKey]: newTotal,
        },
      };
    });
  },
  
  setAllocations: (allocations) => {
    set({ allocations });
  },
  
  setDailyTotals: (totals) => {
    set({ dailyTotals: totals });
  },
  
  // Date navigation
  setMonthYear: (month, year) => {
    set({ month, year });
  },
  
  // Getters
  getHours: (projectId, personId, date) => {
    const key = getAllocationKey(projectId, personId, date);
    return get().allocations[key] || 0;
  },
  
  getDailyTotal: (personId, date) => {
    const key = `${personId}-${date}`;
    return get().dailyTotals[key] || 0;
  },
}));
