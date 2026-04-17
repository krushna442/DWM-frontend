import React, { createContext, useContext, useState, useCallback } from 'react';
import type { DailyEntry, EmailNotification } from '@/types';
import { sampleDailyEntries } from '@/data/masterData';

interface DailyEntryContextType {
  entries: DailyEntry[];
  currentEntry: DailyEntry | null;
  setCurrentEntry: (entry: DailyEntry | null) => void;
  saveEntry: (entry: DailyEntry) => void;
  updateEntry: (id: string, entry: Partial<DailyEntry>) => void;
  deleteEntry: (id: string) => void;
  getEntryByDate: (date: string) => DailyEntry | undefined;
  getEntriesByDateRange: (startDate: string, endDate: string) => DailyEntry[];
  sendEmailNotification: (notification: Omit<EmailNotification, 'id' | 'sentAt'>) => void;
  emailHistory: EmailNotification[];
}

const DailyEntryContext = createContext<DailyEntryContextType | undefined>(undefined);

const defaultEntry: DailyEntry = {
  id: '',
  date: new Date().toISOString().split('T')[0],
  departmentId: '',
  createdBy: 'Admin',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  safety: [],
  customerRejectionCount: 0,
  customerRejections: [],
  production: [],
  cycleTime: { front: 0, rear: 0, causeActions: [] },
  perManPerDay: {
    target: 6,
    actual: 0,
    causeActions: [],
  },
  overtime: [],
  cumulativeOT: { previousTotal: 0, yesterdayOT: 0, todayCumulative: 0 },
  dispatch: [],
  productionPlanAdherence: {
    target: 95,
    actual: 0,
    causeActions: [],
  },
  scheduleAdherence: {
    target: 100,
    actual: 0,
    causeActions: [],
  },
  materialShortageLoss: {
    target: 0,
    actual: 0,
    causeActions: [],
  },
  lineQualityIssues: {
    target: 0,
    actual: 0,
    causeActions: [],
  },
  incomingMaterialQualityImpact: {
    target: 0,
    actual: 0,
    causeActions: [],
  },
  absenteeism: {
    target: 0,
    actual: 0,
    causeActions: [],
  },
  machineBreakdown: {
    target: 30,
    actual: 0,
    causeActions: [],
  },
  utilities: {
    electricityKVAH: 0,
    electricityShift: 'A',
    dieselLTR: 0,
    dieselShift: 'A',
    powerFactor: 0,
    cumulativeElectricity: 0,
    cumulativeDiesel: 0,
  },
  sales: { dailySales: 0, cumulativeSales: 0 },
  training: { dailyHours: 0, cumulativeHours: 0, topic: '' },
  qualityRatios: { firstPassOKRatio: 0, firstPassCauseActions: [], pdiRatio: 0, pdiCauseActions: [] },
  supplierRejectionCount: 0,
  supplierRejections: [],
  pdiIssues: { hasIssue: false, causeActions: [] },
  fieldComplaints: { hasIssue: false, causeActions: [] },
  sopNonAdherence: { hasIssue: false, causeActions: [] },
  fixtureIssues: { hasIssue: false, causeActions: [] },
  palletTrolleyIssues: { hasIssue: false, causeActions: [] },
  materialShortageIssue: { hasIssue: false, quantity: 0, causeActions: [] },
  otherCriticalIssue: { hasIssue: false, causeActions: [] },
};

export function DailyEntryProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<DailyEntry[]>(sampleDailyEntries as DailyEntry[]);
  const [currentEntry, setCurrentEntry] = useState<DailyEntry | null>(null);
  const [emailHistory, setEmailHistory] = useState<EmailNotification[]>([]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const saveEntry = useCallback((entry: DailyEntry) => {
    const newEntry = {
      ...entry,
      id: entry.id || generateId(),
      createdAt: entry.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEntries(prev => {
      const existingIndex = prev.findIndex(e => e.id === newEntry.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newEntry;
        return updated;
      }
      return [...prev, newEntry];
    });
  }, []);

  const updateEntry = useCallback((id: string, entryUpdate: Partial<DailyEntry>) => {
    setEntries(prev => 
      prev.map(e => e.id === id ? { ...e, ...entryUpdate, updatedAt: new Date().toISOString() } : e)
    );
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  const getEntryByDate = useCallback((date: string) => {
    return entries.find(e => e.date === date);
  }, [entries]);

  const getEntriesByDateRange = useCallback((startDate: string, endDate: string) => {
    return entries.filter(e => e.date >= startDate && e.date <= endDate);
  }, [entries]);

  const sendEmailNotification = useCallback((notification: Omit<EmailNotification, 'id' | 'sentAt'>) => {
    const newNotification: EmailNotification = {
      ...notification,
      id: generateId(),
      sentAt: new Date().toISOString(),
    };
    setEmailHistory(prev => [newNotification, ...prev]);
    // In a real app, this would call an API to send the email
    console.log('Email sent:', newNotification);
  }, []);

  return (
    <DailyEntryContext.Provider value={{
      entries,
      currentEntry,
      setCurrentEntry,
      saveEntry,
      updateEntry,
      deleteEntry,
      getEntryByDate,
      getEntriesByDateRange,
      sendEmailNotification,
      emailHistory,
    }}>
      {children}
    </DailyEntryContext.Provider>
  );
}

export function useDailyEntry() {
  const context = useContext(DailyEntryContext);
  if (context === undefined) {
    throw new Error('useDailyEntry must be used within a DailyEntryProvider');
  }
  return context;
}

export { defaultEntry };
