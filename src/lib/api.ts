/**
 * Central API service layer — all backend calls go through here.
 * Backend base URL: http://localhost:3000/api
 */

import type { DailyEntry, PartType, Customer, Supplier, Machine, Department } from '@/types';

const BASE = 'http://localhost:3000/api';

// ─── Generic fetch helper ─────────────────────────────────────────────────────
async function req<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'API error');
  return json.data as T;
}

// ─── Reports ──────────────────────────────────────────────────────────────────

/** Check if a report already exists for a given date */
export async function checkDate(date: string): Promise<{ exists: boolean }> {
  return req('GET', `/reports/check/${date}`);
}

/** Fetch the most recent report (to prefill cumulative fields) */
export async function getLatestReport(): Promise<DailyEntry | null> {
  try {
    return req('GET', '/reports/latest');
  } catch {
    return null;
  }
}

/** Fetch a report by date (for History/Update page) */
export async function getReport(date: string): Promise<DailyEntry> {
  return req('GET', `/reports/${date}`);
}

/** Save (upsert) a full daily entry. Optionally pass sessionId to clear draft. */
export async function saveReport(
  entry: DailyEntry,
  sessionId?: string
): Promise<DailyEntry> {
  return req('POST', '/reports', {
    ...entry,
    report_date: entry.date,
    sessionId,
  });
}

/** Update a full report (same as save, no draft clearing) */
export async function updateReport(entry: DailyEntry): Promise<DailyEntry> {
  return req('POST', '/reports', {
    ...entry,
    report_date: entry.date,
  });
}

/** List reports (paginated) */
export async function listReports(page = 1, limit = 30): Promise<{
  data: DailyEntry[];
  total: number;
  page: number;
  limit: number;
}> {
  return req('GET', `/reports?page=${page}&limit=${limit}`);
}

// ─── Draft ────────────────────────────────────────────────────────────────────

/** Get the current draft for this session */
export async function getDraft(
  sessionId: string
): Promise<{ report_date: string; data: DailyEntry; updated_at: string; alreadySaved: boolean } | null> {
  try {
    return req('GET', `/draft/${sessionId}`);
  } catch {
    return null;
  }
}

/** Auto-save draft for a session */
export async function saveDraft(
  sessionId: string,
  report_date: string,
  data: DailyEntry
): Promise<void> {
  await req('POST', `/draft/${sessionId}`, { report_date, data });
}

/** Clear draft (called on final save) */
export async function deleteDraft(sessionId: string): Promise<void> {
  await req('DELETE', `/draft/${sessionId}`);
}

// ─── Master Data ──────────────────────────────────────────────────────────────

export interface MasterDataPayload {
  partTypes: PartType[];
  customers: Customer[];
  suppliers: Supplier[];
  machines: Machine[];
  departments: Department[];
}

type RawList = {
  list_key: string;
  items: (PartType | Customer | Supplier | Machine | Department)[];
};

/**
 * Fetch all master data from the backend (items are now objects, same as frontend types).
 */
export async function getMasterData(): Promise<MasterDataPayload> {
  const lists: RawList[] = await req('GET', '/master');

  function getList<T>(key: string): T[] {
    const list = lists.find(l => l.list_key === key);
    return (list?.items || []) as T[];
  }

  return {
    partTypes:   getList<PartType>('part_types'),
    customers:   getList<Customer>('customers'),
    suppliers:   getList<Supplier>('suppliers'),
    machines:    getList<Machine>('machines'),
    departments: getList<Department>('departments'),
  };
}

/** Upsert a single master data item (add or update by id) */
export async function upsertMasterItem<T extends { id: string }>(
  listKey: string,
  item: T
): Promise<{ list_key: string; items: T[] }> {
  return req('POST', `/master/${listKey}/items`, { item });
}

/** Delete a master data item by id */
export async function deleteMasterItem(
  listKey: string,
  id: string
): Promise<{ list_key: string; items: unknown[] }> {
  return req('DELETE', `/master/${listKey}/items`, { id });
}

/** Replace entire master data list */
export async function replaceMasterList<T>(
  listKey: string,
  items: T[]
): Promise<{ list_key: string; items: T[] }> {
  return req('PUT', `/master/${listKey}`, { items });
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface AnalyticsResult {
  month?: string;
  from?: string;
  to?: string;
  report_count: number;
  analytics: unknown;
}



/** Monthly analytics for all fields */
export async function getMonthlyAnalytics(monthKey: string): Promise<AnalyticsResult> {
  return req('GET', `/analytics/${monthKey}`);
}

/** Monthly analytics for a single field */
export async function getFieldAnalytics(
  monthKey: string,
  fieldName: string
): Promise<AnalyticsResult> {
  return req('GET', `/analytics/${monthKey}/${fieldName}`);
}

/** Range analytics across a date window */
export async function getRangeAnalytics(
  from: string,
  to: string
): Promise<AnalyticsResult> {
  return req('GET', `/analytics/range?from=${from}&to=${to}`);
}

// ─── Mail Notifications ───────────────────────────────────────────────────────

export interface NotifyOwnerPayload {
  ownerName: string;
  ownerEmail: string;
  sectionNumber: number;
  sectionTitle: string;
  date: string;
  data: unknown;
}

/** Send a notification email to a section owner */
export async function notifyOwner(payload: NotifyOwnerPayload): Promise<{ message: string }> {
  return req('POST', '/mail/notify', payload);
}
