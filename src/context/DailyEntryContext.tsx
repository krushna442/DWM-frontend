import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { DailyEntry } from '@/types';
import * as api from '@/lib/api';
import { toast } from 'sonner';

// ─── Generate / retrieve a stable session ID ──────────────────────────────────
function getSessionId(): string {
  const key = 'dwm_session_id';
  let sid = localStorage.getItem(key);
  if (!sid) {
    sid = 'sess_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(key, sid);
  }
  return sid;
}

const SESSION_ID = getSessionId();

// ─── Default blank entry ──────────────────────────────────────────────────────
export const defaultEntry: DailyEntry = {
  id: '',
  date: '',
  departmentId: '',
  createdBy: 'Admin',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  safety: [],
  customerRejectionCount: 0,
  customerRejections: [],
  production: [],
  cycleTime: { front: 0, rear: 0, causeActions: [] },
  perManPerDay: { target: 6, actual: 0, causeActions: [] },
  overtime: [],
  cumulativeOT: { previousTotal: 0, yesterdayOT: 0, todayCumulative: 0 },
  dispatch: [],
  productionPlanAdherence: { target: 95, actual: 0, causeActions: [] },
  scheduleAdherence: { target: 100, actual: 0, causeActions: [] },
  materialShortageLoss: { target: 0, actual: 0, causeActions: [] },
  lineQualityIssues: { target: 0, actual: 0, causeActions: [] },
  incomingMaterialQualityImpact: { target: 0, actual: 0, causeActions: [] },
  absenteeism: { target: 0, actual: 0, causeActions: [] },
  machineBreakdown: { target: 30, actual: 0, causeActions: [] },
  utilities: { electricityKVAH: 0, electricityShift: 'A', dieselLTR: 0, dieselShift: 'A', powerFactor: 0, cumulativeElectricity: 0, cumulativeDiesel: 0 },
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
  otherField1: '',
  otherField2: '',
};

// ─── Context type ─────────────────────────────────────────────────────────────
export interface PrevCumulatives {
  otHours: number;        // latest.cumulativeOT.todayCumulative
  electricity: number;    // latest.utilities.cumulativeElectricity + latest.utilities.electricityKVAH
  diesel: number;         // latest.utilities.cumulativeDiesel + latest.utilities.dieselLTR
  sales: number;          // latest.sales.cumulativeSales + latest.sales.dailySales
  trainingHours: number;  // latest.training.cumulativeHours + latest.training.dailyHours
}

interface DailyEntryContextType {
  /** True while checking for an existing draft on page load */
  isDraftLoading: boolean;
  /** Set when a draft was found — shows the restore banner */
  draftRestoredAt: string | null;
  /** True if the record for this draft's date is already in daily_report table */
  isAlreadySaved: boolean;
  /** Whether the user has selected a date (controls popup visibility) */
  selectedDate: string | null;
  /** Set a new date (triggers duplicate-date check) */
  selectDate: (date: string) => Promise<void>;
  /** The in-progress form data */
  formData: DailyEntry;
  setFormData: React.Dispatch<React.SetStateAction<DailyEntry>>;
  /** Previous day's cumulative bases — used to auto-compute today's cumulatives */
  prevCumulatives: PrevCumulatives;
  /** Auto-save the current form state as a draft (called on section blur) */
  autoSaveDraft: () => void;
  /** Final save — persists to main table, clears draft */
  saveEntry: () => Promise<void>;
  isSaving: boolean;
  lastEntry: DailyEntry | null;
  /** Reset the whole form (clear draft, go back to date popup) */
  resetForm: () => void;
}

const DailyEntryContext = createContext<DailyEntryContextType | undefined>(undefined);

export function DailyEntryProvider({ children }: { children: React.ReactNode }) {
  const [isDraftLoading, setIsDraftLoading] = useState(true);
  const [draftRestoredAt, setDraftRestoredAt] = useState<string | null>(null);
  const [isAlreadySaved, setIsAlreadySaved] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [formData, setFormData] = useState<DailyEntry>({ ...defaultEntry });
  const [isSaving, setIsSaving] = useState(false);
  const [prevCumulatives, setPrevCumulatives] = useState<PrevCumulatives>({
    otHours: 0, electricity: 0, diesel: 0, sales: 0, trainingHours: 0,
  });
  const [lastEntry, setLastEntry] = useState<DailyEntry | null>(null);

  // Debounce timer for auto-save
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      try {
        // ALWAYS fetch the latest saved record to compute cumulative bases
        try {
          const latest = await api.getLatestReport();
          if (latest) {
            const bases: PrevCumulatives = {
              otHours:      (latest.cumulativeOT?.todayCumulative   || 0),
              electricity:  (latest.utilities?.cumulativeElectricity || 0) + (latest.utilities?.electricityKVAH || 0),
              diesel:       (latest.utilities?.cumulativeDiesel      || 0) + (latest.utilities?.dieselLTR      || 0),
              sales:        (latest.sales?.cumulativeSales           || 0) + (latest.sales?.dailySales         || 0),
              trainingHours:(latest.training?.cumulativeHours        || 0) + (latest.training?.dailyHours      || 0),
            };
            setPrevCumulatives(bases);
            // We use functional update. If a draft doesn't overwrite it, this provides a fallback default
            setFormData(prev => ({
              ...prev,
              cumulativeOT: { ...prev.cumulativeOT, previousTotal: bases.otHours },
            }));
            setLastEntry(latest);
          }
        } catch { /* no previous record — ignore */ }

        // Then, check for existing draft to restore user's active work
        const draft = await api.getDraft(SESSION_ID);
        if (draft && draft.data) {
          setFormData(prev => ({ ...prev, ...draft.data }));
          setSelectedDate(draft.report_date);
          setDraftRestoredAt(draft.updated_at);
          setIsAlreadySaved(draft.alreadySaved);
        }
      } catch {
        // Backend offline — ignore
      } finally {
        setIsDraftLoading(false);
      }
    })();
  }, []);

  // ── Select a date (date popup CTA) ──────────────────────────────────────────
  const selectDate = useCallback(async (date: string) => {
    try {
      const { exists } = await api.checkDate(date);
      if (exists) {
        toast.error(`A report already exists for ${date}. Go to History to view it.`, {
          duration: 5000,
        });
        return;
      }
    } catch {
      // Backend offline — allow anyway, will fail on save
    }
    setSelectedDate(date);
    setFormData(prev => ({ ...prev, date }));
  }, []);

  // ── Auto-save to draft (called on section blur) ──────────────────────────────
  const autoSaveDraft = useCallback(() => {
    if (!selectedDate) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      try {
        await api.saveDraft(SESSION_ID, selectedDate, formData);
      } catch {
        // Non-fatal — silent
      }
    }, 500);
  }, [selectedDate, formData]);

  // ── Final Save ──────────────────────────────────────────────────────────────
  const saveEntry = useCallback(async () => {
    if (!selectedDate) { toast.error('No date selected'); return; }
    setIsSaving(true);
    try {
      await api.saveReport({ ...formData, date: selectedDate }, SESSION_ID);
      setDraftRestoredAt(null);
      toast.success('Daily report saved successfully!');
    } catch (err) {
      toast.error(`Save failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  }, [formData, selectedDate]);

  // ── Reset (clear draft + go back to date popup) ──────────────────────────────
  const resetForm = useCallback(async () => {
    try { await api.deleteDraft(SESSION_ID); } catch { /* ignore */ }
    setSelectedDate(null);
    setFormData({ ...defaultEntry });
    setDraftRestoredAt(null);
    setIsAlreadySaved(false);
  }, []);

  return (
    <DailyEntryContext.Provider value={{
      isDraftLoading,
      draftRestoredAt,
      selectedDate,
      selectDate,
      formData,
      setFormData,
      prevCumulatives,
      autoSaveDraft,
      saveEntry,
      isSaving,
      resetForm,
      isAlreadySaved,
      lastEntry
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
