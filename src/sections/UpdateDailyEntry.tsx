import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Save, Plus, Trash2, Calendar, FileText,
  AlertTriangle, CheckCircle2,
  //  ChevronRight,
  RefreshCw, Search, Lock,
  User, Mail,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useMasterData } from '@/context/MasterDataContext';
import { defaultEntry } from '@/context/DailyEntryContext';
import * as api from '@/lib/api';
import type {
  DailyEntry as DailyEntryType,
  SafetyEntry, CustomerRejection, OvertimeEntry,
  SupplierRejection, CauseActionRow,
} from '@/types';

/* ─────────────────────── OWNERS ARRAY ─────────────────────── */
const OWNERS: { name: string; email: string }[] = [
  { name: '', email: '' },
  { name: 'Ashish', email: 'ashish.tiwari1@rsbglobal.com' },
  { name: 'Sudhir', email: 'sudhir.sahoo@rsbglobal.com' },
  { name: 'Brijesh', email: 'brijesh.singh@rsbglobal.com' },
  { name: 'Brijesh', email: 'brijesh.singh@rsbglobal.com' },
  { name: 'Brijesh', email: 'brijesh.singh@rsbglobal.com' },
  { name: 'Brijesh', email: 'brijesh.singh@rsbglobal.com' },
  { name: 'Brijesh', email: 'brijesh.singh@rsbglobal.com' },
  { name: 'OM', email: 'om.chand@rsbglobal.com' },
  { name: 'Rakesh', email: 'rakesh.pal@rsbglobal.com' },
  { name: 'OM', email: 'om.chand@rsbglobal.com' },
  { name: 'Dipti', email: 'dipti.das@rsbglobal.com' },
  { name: 'Dipti', email: 'dipti.das@rsbglobal.com' },
  { name: 'Sudhir', email: 'sudhir.sahoo@rsbglobal.com' },
  { name: 'Ashish', email: 'ashish.tiwari1@rsbglobal.com' },
  { name: 'Avinash', email: 'avinash.choudhary@rsbglobal.com' },
  { name: 'Avinash', email: 'avinash.choudhary@rsbglobal.com' },
  { name: 'Avinash', email: 'avinash.choudhary@rsbglobal.com' },
  { name: 'Avinash', email: 'avinash.choudhary@rsbglobal.com' },
  { name: 'Avinash', email: 'avinash.choudhary@rsbglobal.com' },
  { name: 'Abhishek', email: 'abhishek.pal@rsbglobal.com' },
  { name: 'OM', email: 'om.chand@rsbglobal.com' },
  { name: 'Ashish', email: 'ashish.tiwari1@rsbglobal.com' },
  { name: 'Ashish', email: 'ashish.tiwari1@rsbglobal.com' },
  { name: 'Sudhir', email: 'sudhir.sahoo@rsbglobal.com' },
  { name: 'Abhishek', email: 'abhishek.pal@rsbglobal.com' },
  { name: 'Sudhir', email: 'sudhir.sahoo@rsbglobal.com' },
  { name: 'Sudhir', email: 'sudhir.sahoo@rsbglobal.com' },
  { name: 'Vikash', email: 'vikas.kumar@rsbglobal.com' },
  { name: 'Shantanu', email: 'santanu.singh@rsbglobal.com' },
  { name: 'Nihar', email: 'nihar.khuntia@rsbglobal.com' },
  { name: 'Rupesh', email: 'Rupesh.pandey@rsbglobal.com' },
  { name: 'Dipti', email: 'dipti.das@rsbglobal.com' },
  { name: 'Manager', email: '' },
];
const getOwner = (n: number) => OWNERS[n] || { name: '', email: '' };
const emptyCauseAction = (ownerIdx?: number): CauseActionRow => ({
  cause: '', action: '', responsible: ownerIdx ? getOwner(ownerIdx).name : '', targetDate: '',
});
const clampPct = (v: number) => Math.min(100, Math.max(0, v));
const numVal = (v: number): string | number => (v === 0 ? '' : v);

/* ═══════════════════════ DATE PICKER SCREEN ═══════════════════════ */
function DatePickerScreen({
  onFetch,
}: {
  onFetch: (date: string) => Promise<void>;
}) {
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  const handleFetch = async () => {
    if (!selected) return;
    setLoading(true);
    await onFetch(selected);
    setLoading(false);
  };

  return (
    <div className="date-popup-overlay">
      <div className="date-popup-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)' }}>
            <Search className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#1A1A1A]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Update Daily Record
            </h2>
            <p className="text-xs text-gray-400 font-medium">Select the date of the record to update</p>
          </div>
        </div>

        <div className="mb-6">
          <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-2">Date</label>
          <input
            type="date"
            value={selected}
            max={today}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full h-11 px-4 border-2 border-[#D4D4D4] rounded-lg text-sm font-medium text-[#1A1A1A] transition-all duration-200 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          {selected && (
            <p className="mt-2 text-xs text-blue-500 font-semibold">
              {new Date(selected + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
              })}
            </p>
          )}
        </div>

        <button
          disabled={!selected || loading}
          onClick={handleFetch}
          className="w-full h-11 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200"
          style={{
            background: selected ? 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)' : '#E5E5E5',
            color: selected ? '#fff' : '#999',
            cursor: selected ? 'pointer' : 'not-allowed',
            boxShadow: selected ? '0 4px 14px rgba(59,130,246,0.35)' : 'none',
          }}
        >
          {loading
            ? <><RefreshCw className="w-4 h-4 animate-spin" /> Fetching…</>
            : <><Search className="w-4 h-4" /> Fetch Record</>}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────── LAYOUT PRIMITIVES ─────────────────────── */
interface SectionRowProps {
  number: number;
  title: string;
  target?: string;
  status?: 'ok' | 'nok' | 'na';
  onAdd?: () => void;
  children: React.ReactNode;
  highlight?: boolean;
  disabled?: boolean; // ← cumulative rows
  secondNumber?: number;
}

function SectionRow({ number, title, target, status, onAdd, children, highlight, disabled, secondNumber }: SectionRowProps) {
  const ownerName = getOwner(number).name;
  const ownerEmail = getOwner(number).email;
  const bgClass = disabled
    ? 'bg-slate-100'
    : highlight
      ? 'section-row-highlight'
      : number % 2 === 0 ? 'section-row-even' : 'section-row-odd';

  return (
    <div className={`flex items-start gap-0 border-b border-[#E8E8E8] transition-all duration-200 ${bgClass} ${disabled ? 'opacity-70' : 'hover:bg-blue-50/10'}`}>
      <div className={`flex w-[200px] shrink-0 items-start gap-2 px-2 py-2.5 self-stretch ${disabled ? 'bg-slate-400' : 'bg-[#C9A962]'}`}>
        <div className="flex mt-0.5 items-center gap-0.5 shrink-0">
          <span className="text-[10px] font-bold text-white bg-[#1A1A1A] rounded w-5 h-5 flex items-center justify-center">
            {number}
          </span>
          {secondNumber && (
            <>
              <span className="text-[8px] text-[#1A1A1A]/60">/</span>
              <span className="text-[10px] font-bold text-white bg-[#1A1A1A] rounded w-5 h-5 flex items-center justify-center">
                {secondNumber}
              </span>
            </>
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <h3 className="text-[10px] font-bold text-[#1A1A1A] leading-tight break-words">{title}</h3>
          {target && <span className="text-[9px] text-[#1A1A1A]/70 font-medium mt-0.5">Target: {target}</span>}
          {disabled && (
            <span className="flex items-center gap-0.5 text-[8px] text-white/70 font-bold mt-0.5">
              <Lock className="w-2.5 h-2.5" /> Cumulative (read-only)
            </span>
          )}
        </div>
      </div>

      <div className="pt-3 px-1.5 min-w-[22px] shrink-0">
        {status === 'ok' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
        {status === 'nok' && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
      </div>

      <div className="flex-1 min-w-0 py-2 pr-2">
        {children}
      </div>

      <div className="flex items-center gap-0.5 pt-1.5 pr-1.5 shrink-0">
        {onAdd && !disabled && (
          <Button variant="ghost" size="icon" className="h-6 w-6 text-[#C9A962] hover:bg-[#C9A962]/10" onClick={onAdd} title="Add Row">
            <Plus className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-300 hover:text-gray-500 hover:bg-gray-100" title={`Owner: ${ownerName}`}>
          <User className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-300 hover:text-[#C9A962] hover:bg-[#C9A962]/10"
          onClick={() => toast.success(`Email sent to ${ownerName} (${ownerEmail})`)} title="Notify">
          <Mail className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

interface EntryRowProps { children: React.ReactNode; onRemove?: () => void; className?: string; }
function EntryRow({ children, onRemove, className = "" }: EntryRowProps) {
  return (
    <div className={`group flex items-start gap-1.5 mb-1.5 last:mb-0 w-full ${className}`}>
      <div className="flex-1 min-w-0 w-full">{children}</div>
      {onRemove && (
        <Button variant="ghost" size="icon"
          className="h-6 w-6 text-red-300 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 hover:bg-red-50 shrink-0 mt-5"
          onClick={onRemove}>
          <Trash2 className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

interface FieldProps { label: string; children: React.ReactNode; className?: string; }
function Field({ label, children, className = "" }: FieldProps) {
  return (
    <div className={`flex flex-col gap-0.5 ${className}`}>
      <span className="text-[9px] uppercase font-bold text-gray-400 px-0.5 tracking-wider whitespace-nowrap">{label}</span>
      {children}
    </div>
  );
}

function StatusBadge({ ok, okText = 'OK', nokText = 'MISS' }: { ok: boolean; okText?: string; nokText?: string }) {
  return (
    <div className={`h-7 flex items-center px-2 rounded text-[9px] font-extrabold border transition-colors ${
      ok ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200 animate-pulse'
    }`}>
      {ok ? okText : nokText}
    </div>
  );
}

function DateIconField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9px] uppercase font-bold text-gray-400 px-0.5 tracking-wider">Date</span>
      <div className="relative flex items-center justify-center">
        <input ref={ref} type="date" value={value} onChange={(e) => onChange(e.target.value)}
          className={`date-icon-only ${value ? 'has-date' : ''}`}
          title={value ? new Date(value + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Pick date'} />
      </div>
    </div>
  );
}

function CauseActionFields({
  row, onChange, machines, suppliers, customers, departments,
  showMachine, showSupplier, showDepartment, showInternalExternal,
  internalOptions, showCustomerWhenExternal,
}: {
  row: CauseActionRow; onChange: (updated: CauseActionRow) => void;
  machines?: { id: string; name: string }[]; suppliers?: { id: string; name: string }[];
  customers?: { id: string; name: string }[]; departments?: { id: string; name: string; code: string }[];
  showMachine?: boolean; showSupplier?: boolean; showDepartment?: boolean;
  showInternalExternal?: boolean; internalOptions?: string[]; showCustomerWhenExternal?: boolean;
}) {
  const isInternal = row.internalExternal === 'internal';
  const isExternal = row.internalExternal === 'external';
  return (
    <div className="flex items-end gap-1.5 w-full animate-in slide-in-from-left-2 duration-300">
      {showMachine && machines && (
        <Field label="Machine" className="shrink-0">
          <Select value={row.machineId || ''} onValueChange={(v) => onChange({ ...row, machineId: v })}>
            <SelectTrigger className="h-7 text-[10px] font-semibold w-[90px]"><SelectValue placeholder="Machine" /></SelectTrigger>
            <SelectContent>{machines.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
      )}
      {showSupplier && suppliers && (
        <Field label="Supplier" className="shrink-0">
          <Select value={row.supplierId || ''} onValueChange={(v) => onChange({ ...row, supplierId: v })}>
            <SelectTrigger className="h-7 text-[10px] font-semibold w-[90px]"><SelectValue placeholder="Supplier" /></SelectTrigger>
            <SelectContent>{suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
      )}
      {showDepartment && departments && (
        <Field label="Dept" className="shrink-0">
          <Select value={row.departmentId || ''} onValueChange={(v) => onChange({ ...row, departmentId: v })}>
            <SelectTrigger className="h-7 text-[10px] font-semibold w-[75px]"><SelectValue placeholder="Dept" /></SelectTrigger>
            <SelectContent>{departments.map(d => <SelectItem key={d.id} value={d.id}>{d.code}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
      )}
      {showInternalExternal && (
        <Field label="Type" className="shrink-0">
          <Select value={row.internalExternal || ''} onValueChange={(v) => onChange({ ...row, internalExternal: v as 'internal' | 'external', palletCategory: '' })}>
            <SelectTrigger className="h-7 text-[10px] font-semibold w-[80px]"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="internal">Internal</SelectItem>
              <SelectItem value="external">External</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      )}
      {showInternalExternal && isInternal && (
        <Field label="Category" className="shrink-0">
          <Select value={row.palletCategory || ''} onValueChange={(v) => onChange({ ...row, palletCategory: v })}>
            <SelectTrigger className="h-7 text-[10px] font-semibold w-[100px]"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              {(internalOptions || ['Process', 'FG', 'Line Feeding']).map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
      )}
      {showInternalExternal && isExternal && showCustomerWhenExternal && customers && (
        <Field label="Customer" className="shrink-0">
          <Select value={row.customerId || ''} onValueChange={(v) => onChange({ ...row, customerId: v })}>
            <SelectTrigger className="h-7 text-[10px] font-semibold w-[100px]"><SelectValue placeholder="Customer" /></SelectTrigger>
            <SelectContent>{customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
      )}
      <Field label="Why / Cause" className="flex-[3] min-w-0">
        <Input value={row.cause} onChange={(e) => onChange({ ...row, cause: e.target.value })}
          className="h-7 text-[10px] font-medium border-red-200 bg-red-50/30 focus:ring-1 focus:ring-red-300 w-full" placeholder="Root cause / reason..." />
      </Field>
      <Field label="Action" className="flex-[1] min-w-0">
        <Input value={row.action} onChange={(e) => onChange({ ...row, action: e.target.value })}
          className="h-7 text-[10px] font-medium border-amber-200 bg-amber-50/30 focus:ring-1 focus:ring-amber-300 w-full" placeholder="Action..." />
      </Field>
      <Field label="Resp." className="shrink-0">
        <Input value={row.responsible} onChange={(e) => onChange({ ...row, responsible: e.target.value })}
          className="h-7 text-[10px] font-medium w-[88px]" placeholder="Who" />
      </Field>
      <DateIconField value={row.targetDate} onChange={(v) => onChange({ ...row, targetDate: v })} />
    </div>
  );
}

/* ═══════════════════════ MAIN COMPONENT ═══════════════════════ */
export default function UpdateDailyEntry() {
  const { partTypes, customers, suppliers, machines, departments } = useMasterData();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [formData, setFormData] = useState<DailyEntryType>({ ...defaultEntry });
  const [isSaving, setIsSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // — Fetch record for given date —
  const handleFetch = useCallback(async (date: string) => {
    setNotFound(false);
    try {
      const record = await api.getReport(date);
      setFormData({ ...defaultEntry, ...record });
      setSelectedDate(date);
      toast.success(`Record loaded for ${date}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('404') || msg.toLowerCase().includes('not found')) {
        setNotFound(true);
        toast.error(`No record found for ${date}. You can only update existing records.`);
      } else {
        toast.error(`Failed to load: ${msg}`);
      }
    }
  }, []);

  // — Auto-calculate cumulative OT (display only) —
  useEffect(() => {
    const yesterdayOT = formData.overtime.reduce((sum, ot) => sum + ot.hours, 0);
    const todayCumulative = formData.cumulativeOT.previousTotal + yesterdayOT;
    setFormData(prev => ({
      ...prev,
      cumulativeOT: { ...prev.cumulativeOT, yesterdayOT, todayCumulative }
    }));
  }, [formData.overtime, formData.cumulativeOT.previousTotal]);

  // — Auto-populate Production Plan Adherence —
  useEffect(() => {
    const totalTarget = partTypes.reduce((sum, _, i) => sum + (formData.production[i]?.target || 0), 0);
    const totalActual = partTypes.reduce((sum, _, i) => sum + (formData.production[i]?.actual || 0), 0);
    if (totalTarget > 0) {
      const pct = clampPct(Math.round((totalActual / totalTarget) * 100));
      setFormData(prev => ({ ...prev, productionPlanAdherence: { ...prev.productionPlanAdherence, actual: pct } }));
    }
  }, [formData.production, partTypes]);

  // — Auto-toggle PDI Issue from PDI Ratio —
  useEffect(() => {
    const ratio = formData.qualityRatios.pdiRatio;
    if (ratio > 0 && ratio < 100) {
      setFormData(prev => ({ ...prev, pdiIssues: { ...prev.pdiIssues, hasIssue: true } }));
    }
  }, [formData.qualityRatios.pdiRatio]);

  const trimSupplierRejections = useCallback(() => {
    setFormData(prev => {
      const filled = prev.supplierRejections.filter(r => r.supplierId || r.reason.trim());
      if (filled.length !== prev.supplierRejections.length) {
        return { ...prev, supplierRejectionCount: filled.length, supplierRejections: filled };
      }
      return prev;
    });
  }, []);

  const handleUpdate = async () => {
    if (!selectedDate) return;
    setIsSaving(true);
    try {
      await api.updateReport({ ...formData, date: selectedDate });
      toast.success('Record updated successfully!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Update failed: ${msg}`);
    } finally {
      setIsSaving(false);
    }
  };

  /* helpers */
  const totalSafetyCount = formData.safety.reduce((s, e) => s + e.count, 0);
  const hasSafetyIssue = totalSafetyCount > 0;
  const hasCustomerRejection = formData.customerRejectionCount > 0;
  const cycleTimeSum = formData.cycleTime.front + formData.cycleTime.rear;
  const isCycleTimeHigh = cycleTimeSum > 2;
  const isPerManLow = formData.perManPerDay.actual > 0 && formData.perManPerDay.actual < 6;
  const totalOTHours = formData.overtime.reduce((s, e) => s + e.hours, 0);
  const hasOT = totalOTHours > 0;
  const totalProdTarget = partTypes.reduce((sum, _, i) => sum + (formData.production[i]?.target || 0), 0);
  const totalProdActual = partTypes.reduce((sum, _, i) => sum + (formData.production[i]?.actual || 0), 0);
  const prdDept = departments.find(d => d.code === 'PRD');

  const updateCA = (arr: CauseActionRow[], idx: number, updated: CauseActionRow) => {
    const n = [...arr]; n[idx] = updated; return n;
  };
  const ensureCA = (arr: CauseActionRow[], count: number, ownerIdx: number): CauseActionRow[] => {
    if (count <= 0) return [];
    const r = [...arr];
    while (r.length < count) r.push(emptyCauseAction(ownerIdx));
    return r.slice(0, count);
  };

  if (!selectedDate) {
    return (
      <>
        <DatePickerScreen onFetch={handleFetch} />
        {notFound && (
          <div className="flex items-center justify-center px-4 pt-4">
            <Card className="p-6 text-center max-w-sm w-full border-red-200 bg-red-50">
              <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
              <p className="font-semibold text-red-700">No record found for that date.</p>
              <p className="text-sm text-red-500 mt-1">Only existing records can be updated. Use Daily Entry to create a new one.</p>
            </Card>
          </div>
        )}
      </>
    );
  }

  const formattedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="animate-fade-in max-w-full mx-auto">

      {/* ═══ Main Table ═══ */}
      <div className="daily-entry-card">
        {/* Header */}
        <div className="daily-entry-header px-4 py-3" style={{ background: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-blue-400" />
              <h1 className="text-xs font-semibold text-white">
                Update Record — <span className="text-blue-300">{formattedDate}</span>
              </h1>
            </div>
            <button
              onClick={() => { setSelectedDate(null); setNotFound(false); }}
              className="text-[10px] text-white/40 hover:text-blue-300 transition-colors font-medium flex items-center gap-1"
            >
              <Calendar className="w-3 h-3" /> Change Date
            </button>
          </div>
        </div>

        {/* Sections */}
        <div className="divide-y divide-gray-100 bg-[#dbd8d8ff]">

          {/* ══ 1. Safety ══ */}
          <SectionRow number={1} title="Accident / Incident / Near Miss" target="0"
            status={hasSafetyIssue ? 'nok' : 'ok'}
            onAdd={() => setFormData(prev => ({ ...prev, safety: [...prev.safety, { type: 'accidents', incidentType: 'others', count: 0, causeActions: [] } as SafetyEntry] }))}>
            {(formData.safety.length === 0
              ? [{ type: 'accidents', incidentType: 'others', count: 0, causeActions: [] } as SafetyEntry]
              : formData.safety
            ).map((entry, idx) => (
              <div key={idx}>
                <EntryRow onRemove={formData.safety.length > 0 ? () => setFormData(prev => ({ ...prev, safety: prev.safety.filter((_, i) => i !== idx) })) : undefined}>
                  <div className="flex items-end gap-2 flex-wrap">
                    <Field label="Type" className="shrink-0">
                      <Select value={entry.type} onValueChange={(v) => {
                        const u = [...formData.safety]; const ti = formData.safety.length === 0 ? 0 : idx;
                        u[ti] = { ...entry, type: v as SafetyEntry['type'] };
                        setFormData(prev => ({ ...prev, safety: u }));
                      }}>
                        <SelectTrigger className="h-7 text-[10px] font-semibold w-[95px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="accidents">Accident</SelectItem>
                          <SelectItem value="incidents">Incident</SelectItem>
                          <SelectItem value="nearMiss">Near Miss</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Incident" className="shrink-0">
                      <Select value={entry.incidentType} onValueChange={(v) => {
                        const u = [...formData.safety]; const ti = formData.safety.length === 0 ? 0 : idx;
                        u[ti] = { ...entry, incidentType: v as SafetyEntry['incidentType'] };
                        setFormData(prev => ({ ...prev, safety: u }));
                      }}>
                        <SelectTrigger className="h-7 text-[10px] font-semibold w-[85px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="machine">Machine</SelectItem>
                          <SelectItem value="others">Others</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Count" className="shrink-0">
                      <Input type="number" value={numVal(entry.count)}
                        onChange={(e) => {
                          const count = parseInt(e.target.value) || 0;
                          const u = [...formData.safety]; const ti = formData.safety.length === 0 ? 0 : idx;
                          u[ti] = { ...entry, count, causeActions: ensureCA(entry.causeActions, count, 1) };
                          setFormData(prev => ({ ...prev, safety: u }));
                        }}
                        className={`h-7 text-[10px] font-bold w-[55px] text-center ${entry.count > 0 ? 'border-red-300 bg-red-50 text-red-700' : ''}`} />
                    </Field>
                  </div>
                </EntryRow>
                {entry.count > 0 && entry.causeActions.map((ca, caIdx) => (
                  <div key={caIdx} className="ml-2 mt-1 w-full">
                    <CauseActionFields row={ca} onChange={(updated) => {
                      const newCA = updateCA(entry.causeActions, caIdx, updated);
                      const u = [...formData.safety]; const ti = formData.safety.length === 0 ? 0 : idx;
                      u[ti] = { ...entry, causeActions: newCA };
                      setFormData(prev => ({ ...prev, safety: u }));
                    }} />
                  </div>
                ))}
              </div>
            ))}
          </SectionRow>

          {/* ══ 2. Customer Rejection ══ */}
          <SectionRow number={2} title="Customer Rejection (TML | ALW | PNR)" target="0 PPM"
            status={hasCustomerRejection ? 'nok' : 'ok'}>
            <EntryRow>
              <div className="flex items-end gap-2 flex-wrap">
                <Field label="Count" className="shrink-0">
                  <Input type="number" value={numVal(formData.customerRejectionCount)}
                    onChange={(e) => {
                      const count = parseInt(e.target.value) || 0;
                      const rejections: CustomerRejection[] = Array.from({ length: count }, (_, i) =>
                        formData.customerRejections[i] || { customerId: '', reason: '' });
                      setFormData(prev => ({ ...prev, customerRejectionCount: count, customerRejections: rejections }));
                    }}
                    className={`h-7 text-[10px] font-bold w-[55px] text-center ${hasCustomerRejection ? 'border-red-300 bg-red-50 text-red-700' : ''}`} />
                </Field>
              </div>
            </EntryRow>
            {formData.customerRejections.map((r, idx) => (
              <EntryRow key={idx} className="ml-2 mt-1">
                <div className="flex items-end gap-2 flex-wrap w-full">
                  <Field label="Customer" className="shrink-0">
                    <Select value={r.customerId} onValueChange={(v) => {
                      const u = [...formData.customerRejections]; u[idx] = { ...r, customerId: v };
                      setFormData(prev => ({ ...prev, customerRejections: u }));
                    }}>
                      <SelectTrigger className="h-7 text-[10px] font-semibold w-[110px]"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{customers.filter(c => c.isActive).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <Field label="Reason" className="flex-1 min-w-0">
                    <Input value={r.reason} onChange={(e) => {
                      const u = [...formData.customerRejections]; u[idx] = { ...r, reason: e.target.value };
                      setFormData(prev => ({ ...prev, customerRejections: u }));
                    }} className="h-7 text-[10px] font-medium border-red-200 bg-red-50/30 w-full" placeholder="Rejection reason..." />
                  </Field>
                </div>
              </EntryRow>
            ))}
          </SectionRow>

          {/* ══ 3. Production ══ */}
          <SectionRow number={3} title="Last Day Production" target="—">
            <div className="flex border border-[#E5E5E5] h-full rounded overflow-hidden">
              {[...partTypes.map((p, idx) => ({ label: p.name, key: idx })), { label: 'Total', key: 'total' }].map((col, idx, all) => {
                const isTotal = col.key === 'total';
                const tgt = isTotal ? totalProdTarget : (formData.production[col.key as number]?.target || 0);
                const act = isTotal ? totalProdActual : (formData.production[col.key as number]?.actual || 0);
                return (
                  <div key={col.label} className={`flex-1 min-w-[100px] h-full flex flex-col ${idx < all.length - 1 ? 'border-r border-[#E5E5E5]' : ''}`}>
                    <div className="text-[10px] font-bold text-center py-2 bg-gray-50 border-b border-[#E5E5E5] text-[#1A1A1A]">{col.label}</div>
                    <div className="flex">
                      <div className="flex-1 border-r border-[#E5E5E5]">
                        <Input type="number" value={numVal(tgt)} disabled={isTotal}
                          onChange={(e) => {
                            const u = [...formData.production]; const fi = col.key as number;
                            while (u.length <= fi) u.push({ partTypeId: partTypes[u.length]?.id || '', target: 0, actual: 0 });
                            u[fi] = { ...u[fi], target: parseInt(e.target.value) || 0 };
                            setFormData(prev => ({ ...prev, production: u }));
                          }}
                          className={`h-8 border-0 rounded-none text-center text-[10px] font-medium shadow-none focus:ring-0 ${isTotal ? 'bg-gray-50 font-bold text-gray-700' : ''}`} placeholder="T" />
                      </div>
                      <div className="flex-1">
                        <Input type="number" value={numVal(act)} disabled={isTotal}
                          onChange={(e) => {
                            const u = [...formData.production]; const fi = col.key as number;
                            while (u.length <= fi) u.push({ partTypeId: partTypes[u.length]?.id || '', target: 0, actual: 0 });
                            u[fi] = { ...u[fi], actual: parseInt(e.target.value) || 0 };
                            setFormData(prev => ({ ...prev, production: u }));
                          }}
                          className={`h-8 border-0 rounded-none text-center text-[10px] font-medium shadow-none focus:ring-0 ${isTotal ? 'bg-gray-50 font-bold text-emerald-700' : ''}`} placeholder="A" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionRow>

          {/* ══ 4. Cycle Time ══ */}
          <SectionRow number={4} title="Cycle Time (Front / Rear)" target="< 2 Min"
            status={cycleTimeSum === 0 ? 'na' : (isCycleTimeHigh ? 'nok' : 'ok')}>
            <EntryRow>
              <div className="flex items-end gap-2 flex-wrap">
                <Field label="Front (min)" className="shrink-0">
                  <Input type="number" step="0.01" value={numVal(formData.cycleTime.front)}
                    onChange={(e) => setFormData(prev => ({ ...prev, cycleTime: { ...prev.cycleTime, front: parseFloat(e.target.value) || 0 } }))}
                    className="h-7 text-[10px] font-semibold w-[65px]" />
                </Field>
                <Field label="Rear (min)" className="shrink-0">
                  <Input type="number" step="0.01" value={numVal(formData.cycleTime.rear)}
                    onChange={(e) => setFormData(prev => ({ ...prev, cycleTime: { ...prev.cycleTime, rear: parseFloat(e.target.value) || 0 } }))}
                    className="h-7 text-[10px] font-semibold w-[65px]" />
                </Field>
                <Field label="Total" className="shrink-0">
                  <Input value={cycleTimeSum.toFixed(2)} disabled
                    className={`h-7 text-[10px] font-bold w-[60px] text-center ${isCycleTimeHigh ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`} />
                </Field>
              </div>
            </EntryRow>
            {isCycleTimeHigh && formData.cycleTime.causeActions.length === 0 && (() => {
              setFormData(prev => ({ ...prev, cycleTime: { ...prev.cycleTime, causeActions: [emptyCauseAction(4)] } })); return null;
            })()}
            {isCycleTimeHigh && formData.cycleTime.causeActions.map((ca, caIdx) => (
              <div key={caIdx} className="mt-1 w-full">
                <CauseActionFields row={ca} onChange={(u) => setFormData(prev => ({ ...prev, cycleTime: { ...prev.cycleTime, causeActions: updateCA(prev.cycleTime.causeActions, caIdx, u) } }))} />
              </div>
            ))}
          </SectionRow>

          {/* ══ 5. Per Man Per Day ══ */}
          <SectionRow number={5} title="Per Man Per Day Qty (Yesterday)" target="6"
            status={formData.perManPerDay.actual === 0 ? 'na' : (isPerManLow ? 'nok' : 'ok')}
            onAdd={() => setFormData(prev => ({ ...prev, perManPerDay: { ...prev.perManPerDay, causeActions: [...prev.perManPerDay.causeActions, emptyCauseAction(5)] } }))}>
            <EntryRow>
              <div className="flex items-end gap-2 flex-wrap">
                <Field label="Actual" className="shrink-0">
                  <Input type="number" step="0.01" value={numVal(formData.perManPerDay.actual)}
                    onChange={(e) => setFormData(prev => ({ ...prev, perManPerDay: { ...prev.perManPerDay, actual: parseFloat(e.target.value) || 0 } }))}
                    className={`h-7 text-[10px] font-bold w-[60px] text-center ${isPerManLow ? 'border-red-300 bg-red-50 text-red-700' : ''}`} />
                </Field>
                <Field label="Target" className="shrink-0">
                  <Input value="6" disabled className="h-7 text-[10px] font-bold w-[50px] text-center bg-gray-50" />
                </Field>
              </div>
            </EntryRow>
            {isPerManLow && formData.perManPerDay.causeActions.length === 0 && (() => {
              setFormData(prev => ({ ...prev, perManPerDay: { ...prev.perManPerDay, causeActions: [emptyCauseAction(5)] } })); return null;
            })()}
            {isPerManLow && formData.perManPerDay.causeActions.map((ca, caIdx) => (
              <div key={caIdx} className="mt-1 w-full">
                <EntryRow onRemove={formData.perManPerDay.causeActions.length > 1 ? () => setFormData(prev => ({ ...prev, perManPerDay: { ...prev.perManPerDay, causeActions: prev.perManPerDay.causeActions.filter((_, i) => i !== caIdx) } })) : undefined}>
                  <CauseActionFields row={ca} onChange={(u) => setFormData(prev => ({ ...prev, perManPerDay: { ...prev.perManPerDay, causeActions: updateCA(prev.perManPerDay.causeActions, caIdx, u) } }))} />
                </EntryRow>
              </div>
            ))}
          </SectionRow>

          {/* ══ 6. Last Day OT Hours ══ */}
          <SectionRow number={6} title="Last Day OT Hours" target="0" status={hasOT ? 'nok' : 'ok'}
            onAdd={() => setFormData(prev => ({ ...prev, overtime: [...prev.overtime, { departmentId: '', hours: 0, reason: '' } as OvertimeEntry] }))}>
            {(formData.overtime.length === 0 ? [{ departmentId: '', hours: 0, reason: '' }] : formData.overtime).map((entry, idx) => {
              const hasHours = entry.hours > 0;
              const isPRD = prdDept && entry.departmentId === prdDept.id;
              return (
                <EntryRow key={idx} onRemove={formData.overtime.length > 0 ? () => setFormData(prev => ({ ...prev, overtime: prev.overtime.filter((_, i) => i !== idx) })) : undefined}>
                  <div className="flex items-end gap-2 flex-wrap w-full">
                    <Field label="Department" className="shrink-0">
                      <Select value={entry.departmentId} onValueChange={(v) => {
                        const u = [...formData.overtime]; const ti = formData.overtime.length === 0 ? 0 : idx;
                        u[ti] = { ...entry, departmentId: v, machineId: '' };
                        setFormData(prev => ({ ...prev, overtime: u }));
                      }}>
                        <SelectTrigger className="h-7 text-[10px] font-semibold w-[110px]"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{departments.map(d => <SelectItem key={d.id} value={d.id}>{d.code}</SelectItem>)}</SelectContent>
                      </Select>
                    </Field>
                    {isPRD && (
                      <Field label="Machine" className="shrink-0">
                        <Select value={entry.machineId || ''} onValueChange={(v) => {
                          const u = [...formData.overtime]; const ti = formData.overtime.length === 0 ? 0 : idx;
                          u[ti] = { ...entry, machineId: v };
                          setFormData(prev => ({ ...prev, overtime: u }));
                        }}>
                          <SelectTrigger className="h-7 text-[10px] font-semibold w-[100px]"><SelectValue placeholder="Machine" /></SelectTrigger>
                          <SelectContent>{machines.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </Field>
                    )}
                    <Field label="Hours" className="shrink-0">
                      <Input type="number" step="0.5" value={numVal(entry.hours)}
                        onChange={(e) => {
                          const u = [...formData.overtime]; const ti = formData.overtime.length === 0 ? 0 : idx;
                          u[ti] = { ...entry, hours: parseFloat(e.target.value) || 0 };
                          setFormData(prev => ({ ...prev, overtime: u }));
                        }}
                        className={`h-7 text-[10px] font-bold w-[60px] text-center ${hasHours ? 'border-red-300 bg-red-50 text-red-700' : ''}`} />
                    </Field>
                    {hasHours && (
                      <Field label="Reason" className="flex-1 min-w-0">
                        <Input value={entry.reason} onChange={(e) => {
                          const u = [...formData.overtime]; const ti = formData.overtime.length === 0 ? 0 : idx;
                          u[ti] = { ...entry, reason: e.target.value };
                          setFormData(prev => ({ ...prev, overtime: u }));
                        }} className="h-7 text-[10px] font-medium border-amber-200 bg-amber-50/30 w-full" placeholder="Why OT needed?" />
                      </Field>
                    )}
                  </div>
                </EntryRow>
              );
            })}
          </SectionRow>

          {/* ══ 7. Cumulative OT — DISABLED (read-only) ══ */}
          <SectionRow number={7} title="Cumulative OT Hours" target="0" highlight disabled>
            <EntryRow>
              <div className="flex items-end gap-2 flex-wrap">
                <Field label="Prev Total" className="shrink-0">
                  <Input value={numVal(formData.cumulativeOT.previousTotal)} disabled className="h-7 text-[10px] font-bold bg-gray-100 w-[70px] text-center" />
                </Field>
                <Field label="Yesterday" className="shrink-0">
                  <Input value={numVal(formData.cumulativeOT.yesterdayOT)} disabled className="h-7 text-[10px] font-bold bg-gray-100 w-[70px] text-center" />
                </Field>
                <Field label="Cumulative" className="shrink-0">
                  <Input value={numVal(formData.cumulativeOT.todayCumulative)} disabled className="h-7 text-[10px] font-extrabold bg-amber-50 border-amber-200 text-amber-700 w-[70px] text-center" />
                </Field>
              </div>
            </EntryRow>
          </SectionRow>

          {/* ══ 8. Dispatch ══ */}
          <SectionRow number={8} title="Last Day Dispatch (TML | ALW | PNR)" target="—"
            onAdd={() => setFormData(prev => ({ ...prev, dispatch: [...prev.dispatch, { customerId: '', quantity: 0 }] }))}>
            {(formData.dispatch.length === 0 ? [{ customerId: '', quantity: 0 }] : formData.dispatch).map((entry, idx) => (
              <EntryRow key={idx} onRemove={formData.dispatch.length > 0 ? () => setFormData(prev => ({ ...prev, dispatch: prev.dispatch.filter((_, i) => i !== idx) })) : undefined}>
                <div className="flex items-end gap-2 flex-wrap w-full">
                  <Field label="Customer" className="shrink-0">
                    <Select value={entry.customerId} onValueChange={(v) => {
                      const u = [...formData.dispatch]; const ti = formData.dispatch.length === 0 ? 0 : idx;
                      u[ti] = { ...entry, customerId: v };
                      setFormData(prev => ({ ...prev, dispatch: u }));
                    }}>
                      <SelectTrigger className="h-7 text-[10px] font-semibold w-[100px]"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{customers.filter(c => c.isActive).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <Field label="Qty" className="shrink-0">
                    <Input type="number" value={numVal(entry.quantity)}
                      onChange={(e) => {
                        const u = [...formData.dispatch]; const ti = formData.dispatch.length === 0 ? 0 : idx;
                        u[ti] = { ...entry, quantity: parseInt(e.target.value) || 0 };
                        setFormData(prev => ({ ...prev, dispatch: u }));
                      }}
                      className="h-7 text-[10px] font-semibold w-[80px]" />
                  </Field>
                </div>
              </EntryRow>
            ))}
          </SectionRow>

          {/* ══ 9. Prod Plan Adherence ══ */}
          {(() => {
            const m = formData.productionPlanAdherence;
            const missed = m.actual > 0 && m.actual < 95;
            return (
              <SectionRow number={9} title="Prod. Plan Adherence % (Yesterday)" target="95%"
                status={m.actual === 0 ? 'na' : (missed ? 'nok' : 'ok')}
                onAdd={() => setFormData(prev => ({ ...prev, productionPlanAdherence: { ...prev.productionPlanAdherence, causeActions: [...prev.productionPlanAdherence.causeActions, emptyCauseAction(9)] } }))}>
                <EntryRow>
                  <div className="flex items-end gap-2 flex-wrap">
                    <Field label="Actual %" className="shrink-0">
                      <Input type="number" value={numVal(m.actual)} min={0} max={100}
                        onChange={(e) => setFormData(prev => ({ ...prev, productionPlanAdherence: { ...prev.productionPlanAdherence, actual: clampPct(parseFloat(e.target.value) || 0) } }))}
                        className={`h-7 text-[10px] font-bold w-[70px] text-center ${missed ? 'border-red-300 bg-red-50 text-red-700' : ''}`} />
                    </Field>
                    <Field label="Target" className="shrink-0">
                      <Input value="95%" disabled className="h-7 text-[10px] font-bold w-[60px] text-center bg-gray-50" />
                    </Field>
                  </div>
                </EntryRow>
                {missed && m.causeActions.length === 0 && (() => { setFormData(prev => ({ ...prev, productionPlanAdherence: { ...prev.productionPlanAdherence, causeActions: [emptyCauseAction(9)] } })); return null; })()}
                {missed && m.causeActions.map((ca, caIdx) => (
                  <div key={caIdx} className="mt-1 w-full">
                    <EntryRow onRemove={m.causeActions.length > 1 ? () => setFormData(prev => ({ ...prev, productionPlanAdherence: { ...prev.productionPlanAdherence, causeActions: prev.productionPlanAdherence.causeActions.filter((_, i) => i !== caIdx) } })) : undefined}>
                      <CauseActionFields row={ca} onChange={(u) => setFormData(prev => ({ ...prev, productionPlanAdherence: { ...prev.productionPlanAdherence, causeActions: updateCA(prev.productionPlanAdherence.causeActions, caIdx, u) } }))} />
                    </EntryRow>
                  </div>
                ))}
              </SectionRow>
            );
          })()}

          {/* ══ 10. Schedule Adherence ══ */}
          {(() => {
            const m = formData.scheduleAdherence;
            const missed = m.actual > 0 && m.actual < 100;
            return (
              <SectionRow number={10} title="OTIF Schedule Adherence % (Yesterday)" target="100%"
                status={m.actual === 0 ? 'na' : (missed ? 'nok' : 'ok')}
                onAdd={() => setFormData(prev => ({ ...prev, scheduleAdherence: { ...prev.scheduleAdherence, causeActions: [...prev.scheduleAdherence.causeActions, emptyCauseAction(10)] } }))}>
                <EntryRow>
                  <div className="flex items-end gap-2 flex-wrap">
                    <Field label="Actual %" className="shrink-0">
                      <Input type="number" min={0} max={100} value={numVal(m.actual)}
                        onChange={(e) => setFormData(prev => ({ ...prev, scheduleAdherence: { ...prev.scheduleAdherence, actual: clampPct(parseFloat(e.target.value) || 0) } }))}
                        className={`h-7 text-[10px] font-bold w-[70px] text-center ${missed ? 'border-red-300 bg-red-50 text-red-700' : ''}`} />
                    </Field>
                    <Field label="Target" className="shrink-0">
                      <Input value="100%" disabled className="h-7 text-[10px] font-bold w-[60px] text-center bg-gray-50" />
                    </Field>
                  </div>
                </EntryRow>
                {missed && m.causeActions.length === 0 && (() => { setFormData(prev => ({ ...prev, scheduleAdherence: { ...prev.scheduleAdherence, causeActions: [emptyCauseAction(10)] } })); return null; })()}
                {missed && m.causeActions.map((ca, caIdx) => (
                  <div key={caIdx} className="mt-1 w-full">
                    <EntryRow onRemove={m.causeActions.length > 1 ? () => setFormData(prev => ({ ...prev, scheduleAdherence: { ...prev.scheduleAdherence, causeActions: prev.scheduleAdherence.causeActions.filter((_, i) => i !== caIdx) } })) : undefined}>
                      <CauseActionFields row={ca} onChange={(u) => setFormData(prev => ({ ...prev, scheduleAdherence: { ...prev.scheduleAdherence, causeActions: updateCA(prev.scheduleAdherence.causeActions, caIdx, u) } }))} />
                    </EntryRow>
                  </div>
                ))}
              </SectionRow>
            );
          })()}

          {/* ══ 11. Material Shortage Loss ══ */}
          {(() => {
            const m = formData.materialShortageLoss;
            const missed = m.actual > 0;
            return (
              <SectionRow number={11} title="Prod. Hours Loss for Material Shortage" target="0"
                status={missed ? 'nok' : 'ok'}
                onAdd={() => setFormData(prev => ({ ...prev, materialShortageLoss: { ...prev.materialShortageLoss, causeActions: [...prev.materialShortageLoss.causeActions, emptyCauseAction(11)] } }))}>
                <EntryRow>
                  <div className="flex items-end gap-2 flex-wrap">
                    <Field label="Actual" className="shrink-0">
                      <Input type="number" value={numVal(m.actual)}
                        onChange={(e) => setFormData(prev => ({ ...prev, materialShortageLoss: { ...prev.materialShortageLoss, actual: parseFloat(e.target.value) || 0 } }))}
                        className={`h-7 text-[10px] font-bold w-[70px] text-center ${missed ? 'border-red-300 bg-red-50 text-red-700' : ''}`} />
                    </Field>
                  </div>
                </EntryRow>
                {missed && m.causeActions.length === 0 && (() => { setFormData(prev => ({ ...prev, materialShortageLoss: { ...prev.materialShortageLoss, causeActions: [emptyCauseAction(11)] } })); return null; })()}
                {missed && m.causeActions.map((ca, caIdx) => (
                  <div key={caIdx} className="mt-1 w-full">
                    <EntryRow onRemove={m.causeActions.length > 1 ? () => setFormData(prev => ({ ...prev, materialShortageLoss: { ...prev.materialShortageLoss, causeActions: prev.materialShortageLoss.causeActions.filter((_, i) => i !== caIdx) } })) : undefined}>
                      <CauseActionFields row={ca} onChange={(u) => setFormData(prev => ({ ...prev, materialShortageLoss: { ...prev.materialShortageLoss, causeActions: updateCA(prev.materialShortageLoss.causeActions, caIdx, u) } }))} />
                    </EntryRow>
                  </div>
                ))}
              </SectionRow>
            );
          })()}

          {/* ══ 12. Line Quality Issue ══ */}
          {(() => {
            const m = formData.lineQualityIssues;
            return (
              <SectionRow number={12} title="Line Quality Issue" target="0" status={m.actual > 0 ? 'nok' : 'ok'}>
                <EntryRow>
                  <div className="flex items-end gap-2 flex-wrap">
                    <Field label="Actual" className="shrink-0">
                      <Input type="number" value={numVal(m.actual)}
                        onChange={(e) => {
                          const actual = parseInt(e.target.value) || 0;
                          setFormData(prev => ({ ...prev, lineQualityIssues: { ...prev.lineQualityIssues, actual, causeActions: ensureCA(prev.lineQualityIssues.causeActions, actual, 12) } }));
                        }}
                        className={`h-7 text-[10px] font-bold w-[70px] text-center ${m.actual > 0 ? 'border-red-300 bg-red-50 text-red-700' : ''}`} />
                    </Field>
                  </div>
                </EntryRow>
                {m.causeActions.map((ca, caIdx) => (
                  <div key={caIdx} className="mt-1 w-full">
                    <CauseActionFields row={ca} onChange={(u) => setFormData(prev => ({ ...prev, lineQualityIssues: { ...prev.lineQualityIssues, causeActions: updateCA(prev.lineQualityIssues.causeActions, caIdx, u) } }))} showMachine machines={machines} />
                  </div>
                ))}
              </SectionRow>
            );
          })()}

          {/* ══ 13. Incoming Material ══ */}
          {(() => {
            const m = formData.incomingMaterialQualityImpact;
            return (
              <SectionRow number={13} title="Poor Incoming Material Impact" target="0" status={m.actual > 0 ? 'nok' : 'ok'}>
                <EntryRow>
                  <div className="flex items-end gap-2 flex-wrap">
                    <Field label="Actual" className="shrink-0">
                      <Input type="number" value={numVal(m.actual)}
                        onChange={(e) => {
                          const actual = parseInt(e.target.value) || 0;
                          setFormData(prev => ({ ...prev, incomingMaterialQualityImpact: { ...prev.incomingMaterialQualityImpact, actual, causeActions: ensureCA(prev.incomingMaterialQualityImpact.causeActions, actual, 13) } }));
                        }}
                        className={`h-7 text-[10px] font-bold w-[70px] text-center ${m.actual > 0 ? 'border-red-300 bg-red-50 text-red-700' : ''}`} />
                    </Field>
                  </div>
                </EntryRow>
                {m.causeActions.map((ca, caIdx) => (
                  <div key={caIdx} className="mt-1 w-full">
                    <CauseActionFields row={ca} onChange={(u) => setFormData(prev => ({ ...prev, incomingMaterialQualityImpact: { ...prev.incomingMaterialQualityImpact, causeActions: updateCA(prev.incomingMaterialQualityImpact.causeActions, caIdx, u) } }))} showSupplier suppliers={suppliers} />
                  </div>
                ))}
              </SectionRow>
            );
          })()}

          {/* ══ 14. Absenteeism ══ */}
          {(() => {
            const m = formData.absenteeism;
            return (
              <SectionRow number={14} title="Unauthorised Absenteeism" target="0" status={m.actual > 0 ? 'nok' : 'ok'}>
                <EntryRow>
                  <Field label="Actual" className="shrink-0">
                    <Input type="number" value={numVal(m.actual)}
                      onChange={(e) => {
                        const actual = parseInt(e.target.value) || 0;
                        setFormData(prev => ({ ...prev, absenteeism: { ...prev.absenteeism, actual, causeActions: ensureCA(prev.absenteeism.causeActions, actual, 14) } }));
                      }}
                      className={`h-7 text-[10px] font-bold w-[70px] text-center ${m.actual > 0 ? 'border-red-300 bg-red-50 text-red-700' : ''}`} />
                  </Field>
                </EntryRow>
                {m.causeActions.map((ca, caIdx) => (
                  <div key={caIdx} className="mt-1 w-full">
                    <CauseActionFields row={ca} onChange={(u) => setFormData(prev => ({ ...prev, absenteeism: { ...prev.absenteeism, causeActions: updateCA(prev.absenteeism.causeActions, caIdx, u) } }))} />
                  </div>
                ))}
              </SectionRow>
            );
          })()}

          {/* ══ 15. Machine Breakdown ══ */}
          {(() => {
            const m = formData.machineBreakdown;
            const missed = m.actual > 30;
            return (
              <SectionRow number={15} title="Machine Breakdown" target="30 min max"
                status={m.actual === 0 ? 'na' : (missed ? 'nok' : 'ok')}
                onAdd={() => setFormData(prev => ({ ...prev, machineBreakdown: { ...prev.machineBreakdown, causeActions: [...prev.machineBreakdown.causeActions, emptyCauseAction(15)] } }))}>
                <EntryRow>
                  <div className="flex items-end gap-2 flex-wrap">
                    <Field label="Actual (min)" className="shrink-0">
                      <Input type="number" value={numVal(m.actual)}
                        onChange={(e) => setFormData(prev => ({ ...prev, machineBreakdown: { ...prev.machineBreakdown, actual: parseFloat(e.target.value) || 0 } }))}
                        className={`h-7 text-[10px] font-bold w-[70px] text-center ${missed ? 'border-red-300 bg-red-50 text-red-700' : ''}`} />
                    </Field>
                    {m.actual > 0 && m.actual <= 30 && (
                      <Field label="Machine" className="shrink-0">
                        <Select value={m.causeActions[0]?.machineId || ''} onValueChange={(v) => {
                          const u = [...m.causeActions];
                          if (u.length === 0) u.push(emptyCauseAction(15));
                          u[0] = { ...u[0], machineId: v };
                          setFormData(prev => ({ ...prev, machineBreakdown: { ...prev.machineBreakdown, causeActions: u } }));
                        }}>
                          <SelectTrigger className="h-7 text-[10px] font-semibold w-[100px]"><SelectValue placeholder="Machine" /></SelectTrigger>
                          <SelectContent>{machines.map(mc => <SelectItem key={mc.id} value={mc.id}>{mc.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </Field>
                    )}
                  </div>
                </EntryRow>
                {missed && m.causeActions.length === 0 && (() => { setFormData(prev => ({ ...prev, machineBreakdown: { ...prev.machineBreakdown, causeActions: [emptyCauseAction(15)] } })); return null; })()}
                {missed && m.causeActions.map((ca, caIdx) => (
                  <div key={caIdx} className="mt-1 w-full">
                    <EntryRow onRemove={m.causeActions.length > 1 ? () => setFormData(prev => ({ ...prev, machineBreakdown: { ...prev.machineBreakdown, causeActions: prev.machineBreakdown.causeActions.filter((_, i) => i !== caIdx) } })) : undefined}>
                      <CauseActionFields row={ca} onChange={(u) => setFormData(prev => ({ ...prev, machineBreakdown: { ...prev.machineBreakdown, causeActions: updateCA(prev.machineBreakdown.causeActions, caIdx, u) } }))} showMachine machines={machines} />
                    </EntryRow>
                  </div>
                ))}
              </SectionRow>
            );
          })()}

          {/* ══ 16. Unit Consumption (KVAH) — cumulative read-only ══ */}
          <SectionRow number={16} title="Unit Consumption (KVAH)" target="—" highlight disabled>
            <EntryRow>
              <div className="flex items-end gap-2 flex-wrap">
                <Field label="Cumulative" className="shrink-0">
                  <Input value={numVal(formData.utilities.cumulativeElectricity)} disabled className="h-7 text-[10px] font-bold bg-gray-100 w-[90px] text-center" />
                </Field>
                <Field label="Shift" className="shrink-0">
                  <Select value={formData.utilities.electricityShift} onValueChange={(v) => setFormData(prev => ({ ...prev, utilities: { ...prev.utilities, electricityShift: v } }))}>
                    <SelectTrigger className="h-7 text-[10px] font-semibold w-[70px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A</SelectItem><SelectItem value="AB">AB</SelectItem><SelectItem value="ABC">ABC</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Reading" className="shrink-0">
                  <Input type="number" value={numVal(formData.utilities.electricityKVAH)}
                    onChange={(e) => setFormData(prev => ({ ...prev, utilities: { ...prev.utilities, electricityKVAH: parseFloat(e.target.value) || 0 } }))}
                    className="h-7 text-[10px] font-semibold w-[90px]" />
                </Field>
              </div>
            </EntryRow>
          </SectionRow>

          {/* ══ 17. Diesel Consumption — cumulative read-only ══ */}
          <SectionRow number={17} title="Diesel Consumption (LTR)" target="0" highlight disabled>
            <EntryRow>
              <div className="flex items-end gap-2 flex-wrap">
                <Field label="Cumulative" className="shrink-0">
                  <Input value={numVal(formData.utilities.cumulativeDiesel)} disabled className="h-7 text-[10px] font-bold bg-gray-100 w-[90px] text-center" />
                </Field>
                <Field label="Shift" className="shrink-0">
                  <Select value={formData.utilities.dieselShift} onValueChange={(v) => setFormData(prev => ({ ...prev, utilities: { ...prev.utilities, dieselShift: v } }))}>
                    <SelectTrigger className="h-7 text-[10px] font-semibold w-[70px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A</SelectItem><SelectItem value="AB">AB</SelectItem><SelectItem value="ABC">ABC</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Reading" className="shrink-0">
                  <Input type="number" value={numVal(formData.utilities.dieselLTR)}
                    onChange={(e) => setFormData(prev => ({ ...prev, utilities: { ...prev.utilities, dieselLTR: parseFloat(e.target.value) || 0 } }))}
                    className="h-7 text-[10px] font-semibold w-[90px]" />
                </Field>
              </div>
            </EntryRow>
          </SectionRow>

          {/* ══ 18. Power Factor ══ */}
          <SectionRow number={18} title="Power Factor" target="95–99"
            status={formData.utilities.powerFactor >= 95 ? 'ok' : (formData.utilities.powerFactor === 0 ? 'na' : 'nok')}>
            <EntryRow>
              <div className="flex items-end gap-2 flex-wrap">
                <Field label="Value (0-100)" className="shrink-0">
                  <Input type="number" min={0} max={100} value={numVal(formData.utilities.powerFactor)}
                    onChange={(e) => setFormData(prev => ({ ...prev, utilities: { ...prev.utilities, powerFactor: clampPct(parseFloat(e.target.value) || 0) } }))}
                    className={`h-7 text-[10px] font-bold w-[70px] text-center ${formData.utilities.powerFactor > 0 && formData.utilities.powerFactor < 95 ? 'border-red-300 bg-red-50 text-red-700' : ''}`} />
                </Field>
                <div className="mt-5">
                  <StatusBadge ok={formData.utilities.powerFactor >= 95} okText="95-99" nokText="LOW" />
                </div>
              </div>
            </EntryRow>
          </SectionRow>

          {/* ══ 19. Sales — cumulative read-only ══ */}
          <SectionRow number={19} title="Sales Values (Last Day & Cumm)" target="—" disabled>
            <EntryRow>
              <div className="flex items-end gap-2 flex-wrap">
                <Field label="Daily (₹L)" className="shrink-0">
                  <Input type="number" value={numVal(formData.sales.dailySales)}
                    onChange={(e) => setFormData(prev => ({ ...prev, sales: { ...prev.sales, dailySales: parseFloat(e.target.value) || 0 } }))}
                    className="h-7 text-[10px] font-semibold w-[80px]" />
                </Field>
                <Field label="Cumulative (₹L)" className="shrink-0">
                  <Input value={numVal(formData.sales.cumulativeSales)} disabled className="h-7 text-[10px] font-bold bg-gray-100 w-[80px] text-center" />
                </Field>
              </div>
            </EntryRow>
          </SectionRow>

          {/* ══ 20. Training — cumulative read-only ══ */}
          <SectionRow number={20} title="Training Hours" target="30 mins" highlight disabled>
            <EntryRow>
              <div className="flex items-end gap-2 flex-wrap">
                <Field label="Cumulative Hrs" className="shrink-0">
                  <Input value={numVal(formData.training.cumulativeHours)} disabled className="h-7 text-[10px] font-bold bg-gray-100 w-[80px] text-center" />
                </Field>
                <Field label="Training Hours" className="shrink-0">
                  <Input type="number" value={numVal(formData.training.dailyHours)}
                    onChange={(e) => setFormData(prev => ({ ...prev, training: { ...prev.training, dailyHours: parseFloat(e.target.value) || 0 } }))}
                    className="h-7 text-[10px] font-semibold w-[80px]" />
                </Field>
                <Field label="Topic" className="flex-1 min-w-0">
                  <Input value={formData.training.topic}
                    onChange={(e) => setFormData(prev => ({ ...prev, training: { ...prev.training, topic: e.target.value } }))}
                    className="h-7 text-[10px] font-medium w-full" placeholder="Training topic..." />
                </Field>
              </div>
            </EntryRow>
          </SectionRow>

          {/* ══ 21. 1st Pass OK Ratio ══ */}
          <SectionRow number={21} title="Last Day 1st Pass OK Ratio" target="100%"
            status={formData.qualityRatios.firstPassOKRatio === 0 ? 'na' : (formData.qualityRatios.firstPassOKRatio < 100 ? 'nok' : 'ok')}
            onAdd={formData.qualityRatios.firstPassOKRatio > 0 && formData.qualityRatios.firstPassOKRatio < 100 ? () => setFormData(prev => ({ ...prev, qualityRatios: { ...prev.qualityRatios, firstPassCauseActions: [...prev.qualityRatios.firstPassCauseActions, emptyCauseAction(21)] } })) : undefined}>
            <EntryRow>
              <Field label="Actual %" className="shrink-0">
                <Input type="number" min={0} max={100} value={numVal(formData.qualityRatios.firstPassOKRatio)}
                  onChange={(e) => setFormData(prev => ({ ...prev, qualityRatios: { ...prev.qualityRatios, firstPassOKRatio: clampPct(parseFloat(e.target.value) || 0) } }))}
                  className={`h-7 text-[10px] font-bold w-[70px] text-center ${formData.qualityRatios.firstPassOKRatio > 0 && formData.qualityRatios.firstPassOKRatio < 100 ? 'border-red-300 bg-red-50 text-red-700' : ''}`} />
              </Field>
            </EntryRow>
            {formData.qualityRatios.firstPassOKRatio > 0 && formData.qualityRatios.firstPassOKRatio < 100 && (
              <>
                {formData.qualityRatios.firstPassCauseActions.length === 0 && (() => { setFormData(prev => ({ ...prev, qualityRatios: { ...prev.qualityRatios, firstPassCauseActions: [emptyCauseAction(21)] } })); return null; })()}
                {formData.qualityRatios.firstPassCauseActions.map((ca, caIdx) => (
                  <div key={caIdx} className="mt-1 w-full">
                    <EntryRow onRemove={formData.qualityRatios.firstPassCauseActions.length > 1 ? () => setFormData(prev => ({ ...prev, qualityRatios: { ...prev.qualityRatios, firstPassCauseActions: prev.qualityRatios.firstPassCauseActions.filter((_, i) => i !== caIdx) } })) : undefined}>
                      <CauseActionFields row={ca} onChange={(u) => setFormData(prev => ({ ...prev, qualityRatios: { ...prev.qualityRatios, firstPassCauseActions: updateCA(prev.qualityRatios.firstPassCauseActions, caIdx, u) } }))} />
                    </EntryRow>
                  </div>
                ))}
              </>
            )}
          </SectionRow>

          {/* ══ 22. 1st Pass OK Ratio - PDI ══ */}
          <SectionRow number={22} title="Last Day 1st Pass OK Ratio - PDI" target="100%"
            status={formData.qualityRatios.pdiRatio === 0 ? 'na' : (formData.qualityRatios.pdiRatio < 100 ? 'nok' : 'ok')}>
            <EntryRow>
              <Field label="Actual %" className="shrink-0">
                <Input type="number" min={0} max={100} value={numVal(formData.qualityRatios.pdiRatio)}
                  onChange={(e) => setFormData(prev => ({ ...prev, qualityRatios: { ...prev.qualityRatios, pdiRatio: clampPct(parseFloat(e.target.value) || 0) } }))}
                  className={`h-7 text-[10px] font-bold w-[70px] text-center ${formData.qualityRatios.pdiRatio > 0 && formData.qualityRatios.pdiRatio < 100 ? 'border-red-300 bg-red-50 text-red-700' : ''}`} />
              </Field>
            </EntryRow>
          </SectionRow>

          {/* ══ 23. PDI Issue ══ */}
          {(() => {
            const data = formData.pdiIssues;
            const shouldShow = formData.qualityRatios.pdiRatio > 0 && formData.qualityRatios.pdiRatio < 100;
            return (
              <SectionRow number={23} title="Last Day PDI Issue" target="0"
                status={data.hasIssue || shouldShow ? 'nok' : 'ok'}
                onAdd={() => { trimSupplierRejections(); setFormData(prev => ({ ...prev, pdiIssues: { ...prev.pdiIssues, causeActions: [...prev.pdiIssues.causeActions, emptyCauseAction(23)] } })); }}>
                <EntryRow>
                  <div className="flex items-center gap-2">
                    <Switch checked={data.hasIssue} onCheckedChange={(v) => { trimSupplierRejections(); setFormData(prev => ({ ...prev, pdiIssues: { ...prev.pdiIssues, hasIssue: v } })); }} />
                    <span className={`text-[9px] font-extrabold ${data.hasIssue ? 'text-red-600' : 'text-emerald-600'}`}>{data.hasIssue ? 'YES' : 'NO'}</span>
                    {shouldShow && <span className="text-[9px] text-amber-600 italic font-medium">← auto from #22</span>}
                  </div>
                </EntryRow>
                {(data.hasIssue || shouldShow) && data.causeActions.length === 0 && (() => { setFormData(prev => ({ ...prev, pdiIssues: { ...prev.pdiIssues, causeActions: [emptyCauseAction(23)] } })); return null; })()}
                {(data.hasIssue || shouldShow) && data.causeActions.map((ca, caIdx) => (
                  <div key={caIdx} className="mt-1 w-full">
                    <EntryRow onRemove={data.causeActions.length > 1 ? () => setFormData(prev => ({ ...prev, pdiIssues: { ...prev.pdiIssues, causeActions: prev.pdiIssues.causeActions.filter((_, i) => i !== caIdx) } })) : undefined}>
                      <CauseActionFields row={ca} onChange={(u) => setFormData(prev => ({ ...prev, pdiIssues: { ...prev.pdiIssues, causeActions: updateCA(prev.pdiIssues.causeActions, caIdx, u) } }))} />
                    </EntryRow>
                  </div>
                ))}
              </SectionRow>
            );
          })()}

          {/* ══ 24. Supplier Rejection ══ */}
          <SectionRow number={24} title="Last Day Supplier Rejection" target="0 PPM"
            status={formData.supplierRejectionCount > 0 ? 'nok' : 'ok'}>
            <EntryRow>
              <div className="flex items-end gap-2 flex-wrap">
                <Field label="Quantity" className="shrink-0">
                  <Input type="number" value={numVal(formData.supplierRejectionCount)}
                    onChange={(e) => {
                      const count = parseInt(e.target.value) || 0;
                      const rejections: SupplierRejection[] = Array.from({ length: count }, (_, i) =>
                        formData.supplierRejections[i] || { supplierId: '', reason: '' });
                      setFormData(prev => ({ ...prev, supplierRejectionCount: count, supplierRejections: rejections }));
                    }}
                    className={`h-7 text-[10px] font-bold w-[60px] text-center ${formData.supplierRejectionCount > 0 ? 'border-red-300 bg-red-50 text-red-700' : ''}`} />
                </Field>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-amber-600 hover:bg-amber-50" onClick={trimSupplierRejections} title="Cleanup empty rows">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </EntryRow>
            {formData.supplierRejections.map((entry, idx) => (
              <EntryRow key={idx} className="ml-2 mt-1">
                <div className="flex items-end gap-2 flex-wrap w-full">
                  <Field label="Supplier" className="shrink-0">
                    <Select value={entry.supplierId} onValueChange={(v) => {
                      const u = [...formData.supplierRejections]; u[idx] = { ...entry, supplierId: v };
                      setFormData(prev => ({ ...prev, supplierRejections: u }));
                    }}>
                      <SelectTrigger className="h-7 text-[10px] font-semibold w-[110px]"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{suppliers.filter(s => s.isActive).map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </Field>
                  <Field label="Reason" className="flex-1 min-w-0">
                    <Input value={entry.reason} onChange={(e) => {
                      const u = [...formData.supplierRejections]; u[idx] = { ...entry, reason: e.target.value };
                      setFormData(prev => ({ ...prev, supplierRejections: u }));
                    }} className="h-7 text-[10px] font-medium border-red-200 bg-red-50/30 w-full" placeholder="Rejection reason..." />
                  </Field>
                </div>
              </EntryRow>
            ))}
          </SectionRow>

          {/* ══ 25. Field Complaints ══ */}
          {(() => {
            const data = formData.fieldComplaints;
            return (
              <SectionRow number={25} title="Last Day Field Complaints / Issues" target="0 Nos"
                status={data.hasIssue ? 'nok' : 'ok'}
                onAdd={() => { trimSupplierRejections(); setFormData(prev => ({ ...prev, fieldComplaints: { ...prev.fieldComplaints, causeActions: [...prev.fieldComplaints.causeActions, emptyCauseAction(25)] } })); }}>
                <EntryRow>
                  <div className="flex items-center gap-2">
                    <Switch checked={data.hasIssue} onCheckedChange={(v) => { trimSupplierRejections(); setFormData(prev => ({ ...prev, fieldComplaints: { ...prev.fieldComplaints, hasIssue: v } })); }} />
                    <span className={`text-[9px] font-extrabold ${data.hasIssue ? 'text-red-600' : 'text-emerald-600'}`}>{data.hasIssue ? 'YES' : 'NO'}</span>
                  </div>
                </EntryRow>
                {data.hasIssue && data.causeActions.length === 0 && (() => { setFormData(prev => ({ ...prev, fieldComplaints: { ...prev.fieldComplaints, causeActions: [emptyCauseAction(25)] } })); return null; })()}
                {data.hasIssue && data.causeActions.map((ca, caIdx) => (
                  <div key={caIdx} className="mt-1 w-full">
                    <EntryRow onRemove={data.causeActions.length > 1 ? () => setFormData(prev => ({ ...prev, fieldComplaints: { ...prev.fieldComplaints, causeActions: prev.fieldComplaints.causeActions.filter((_, i) => i !== caIdx) } })) : undefined}>
                      <CauseActionFields row={ca} onChange={(u) => setFormData(prev => ({ ...prev, fieldComplaints: { ...prev.fieldComplaints, causeActions: updateCA(prev.fieldComplaints.causeActions, caIdx, u) } }))} />
                    </EntryRow>
                  </div>
                ))}
              </SectionRow>
            );
          })()}

          {/* ══ 26. SOP Non-adherence ══ */}
          {(() => {
            const data = formData.sopNonAdherence;
            return (
              <SectionRow number={26} title="SOP Non-adherence (LPA Audit)" target="—"
                status={data.hasIssue ? 'nok' : 'ok'}
                onAdd={() => setFormData(prev => ({ ...prev, sopNonAdherence: { ...prev.sopNonAdherence, causeActions: [...prev.sopNonAdherence.causeActions, emptyCauseAction(26)] } }))}>
                <EntryRow>
                  <div className="flex items-center gap-2">
                    <Switch checked={data.hasIssue} onCheckedChange={(v) => setFormData(prev => ({ ...prev, sopNonAdherence: { ...prev.sopNonAdherence, hasIssue: v } }))} />
                    <span className={`text-[9px] font-extrabold ${data.hasIssue ? 'text-red-600' : 'text-emerald-600'}`}>{data.hasIssue ? 'YES' : 'NO'}</span>
                  </div>
                </EntryRow>
                {data.hasIssue && data.causeActions.length === 0 && (() => { setFormData(prev => ({ ...prev, sopNonAdherence: { ...prev.sopNonAdherence, causeActions: [emptyCauseAction(26)] } })); return null; })()}
                {data.hasIssue && data.causeActions.map((ca, caIdx) => (
                  <div key={caIdx} className="mt-1 w-full">
                    <EntryRow onRemove={data.causeActions.length > 1 ? () => setFormData(prev => ({ ...prev, sopNonAdherence: { ...prev.sopNonAdherence, causeActions: prev.sopNonAdherence.causeActions.filter((_, i) => i !== caIdx) } })) : undefined}>
                      <CauseActionFields row={ca} onChange={(u) => setFormData(prev => ({ ...prev, sopNonAdherence: { ...prev.sopNonAdherence, causeActions: updateCA(prev.sopNonAdherence.causeActions, caIdx, u) } }))} showDepartment departments={departments} />
                    </EntryRow>
                  </div>
                ))}
              </SectionRow>
            );
          })()}

          {/* ══ 27. Fixture Issues ══ */}
          {(() => {
            const data = formData.fixtureIssues;
            return (
              <SectionRow number={27} title="Line Issue / Stop Due to Fixtures" target="0"
                status={data.hasIssue ? 'nok' : 'ok'}
                onAdd={() => setFormData(prev => ({ ...prev, fixtureIssues: { ...prev.fixtureIssues, causeActions: [...prev.fixtureIssues.causeActions, emptyCauseAction(27)] } }))}>
                <EntryRow>
                  <div className="flex items-center gap-2">
                    <Switch checked={data.hasIssue} onCheckedChange={(v) => setFormData(prev => ({ ...prev, fixtureIssues: { ...prev.fixtureIssues, hasIssue: v } }))} />
                    <span className={`text-[9px] font-extrabold ${data.hasIssue ? 'text-red-600' : 'text-emerald-600'}`}>{data.hasIssue ? 'YES' : 'NO'}</span>
                  </div>
                </EntryRow>
                {data.hasIssue && data.causeActions.length === 0 && (() => { setFormData(prev => ({ ...prev, fixtureIssues: { ...prev.fixtureIssues, causeActions: [emptyCauseAction(27)] } })); return null; })()}
                {data.hasIssue && data.causeActions.map((ca, caIdx) => (
                  <div key={caIdx} className="mt-1 w-full">
                    <EntryRow onRemove={data.causeActions.length > 1 ? () => setFormData(prev => ({ ...prev, fixtureIssues: { ...prev.fixtureIssues, causeActions: prev.fixtureIssues.causeActions.filter((_, i) => i !== caIdx) } })) : undefined}>
                      <CauseActionFields row={ca} onChange={(u) => setFormData(prev => ({ ...prev, fixtureIssues: { ...prev.fixtureIssues, causeActions: updateCA(prev.fixtureIssues.causeActions, caIdx, u) } }))} showMachine machines={machines} />
                    </EntryRow>
                  </div>
                ))}
              </SectionRow>
            );
          })()}

          {/* ══ 28. Pallet / Trolley ══ */}
          {(() => {
            const data = formData.palletTrolleyIssues;
            return (
              <SectionRow number={28} title="Pallet / Trolley Issue (Int. & Ext.)" target="0"
                status={data.hasIssue ? 'nok' : 'ok'}
                onAdd={() => setFormData(prev => ({ ...prev, palletTrolleyIssues: { ...prev.palletTrolleyIssues, causeActions: [...prev.palletTrolleyIssues.causeActions, emptyCauseAction(28)] } }))}>
                <EntryRow>
                  <div className="flex items-center gap-2">
                    <Switch checked={data.hasIssue} onCheckedChange={(v) => setFormData(prev => ({ ...prev, palletTrolleyIssues: { ...prev.palletTrolleyIssues, hasIssue: v } }))} />
                    <span className={`text-[9px] font-extrabold ${data.hasIssue ? 'text-red-600' : 'text-emerald-600'}`}>{data.hasIssue ? 'YES' : 'NO'}</span>
                  </div>
                </EntryRow>
                {data.hasIssue && data.causeActions.length === 0 && (() => { setFormData(prev => ({ ...prev, palletTrolleyIssues: { ...prev.palletTrolleyIssues, causeActions: [emptyCauseAction(28)] } })); return null; })()}
                {data.hasIssue && data.causeActions.map((ca, caIdx) => (
                  <div key={caIdx} className="mt-1 w-full">
                    <EntryRow onRemove={data.causeActions.length > 1 ? () => setFormData(prev => ({ ...prev, palletTrolleyIssues: { ...prev.palletTrolleyIssues, causeActions: prev.palletTrolleyIssues.causeActions.filter((_, i) => i !== caIdx) } })) : undefined}>
                      <CauseActionFields row={ca} onChange={(u) => setFormData(prev => ({ ...prev, palletTrolleyIssues: { ...prev.palletTrolleyIssues, causeActions: updateCA(prev.palletTrolleyIssues.causeActions, caIdx, u) } }))} showInternalExternal internalOptions={['Process', 'FG', 'Line Feeding']} showCustomerWhenExternal customers={customers.filter(c => c.isActive)} />
                    </EntryRow>
                  </div>
                ))}
              </SectionRow>
            );
          })()}

          {/* ══ 29. Material Shortage Issue ══ */}
          {(() => {
            const data = formData.materialShortageIssue;
            const qty = data.quantity || 0;
            return (
              <SectionRow number={29} title="Material Shortage Issue" target="0" status={qty > 0 ? 'nok' : 'ok'}>
                <EntryRow>
                  <Field label="Quantity" className="shrink-0">
                    <Input type="number" value={numVal(qty)}
                      onChange={(e) => {
                        const quantity = parseInt(e.target.value) || 0;
                        setFormData(prev => ({ ...prev, materialShortageIssue: { ...prev.materialShortageIssue, quantity, hasIssue: quantity > 0, causeActions: ensureCA(prev.materialShortageIssue.causeActions, quantity, 29) } }));
                      }}
                      className={`h-7 text-[10px] font-bold w-[60px] text-center ${qty > 0 ? 'border-red-300 bg-red-50 text-red-700' : ''}`} />
                  </Field>
                </EntryRow>
                {data.causeActions.map((ca, caIdx) => (
                  <div key={caIdx} className="mt-1 ml-2 w-full">
                    <CauseActionFields row={ca} onChange={(u) => setFormData(prev => ({ ...prev, materialShortageIssue: { ...prev.materialShortageIssue, causeActions: updateCA(prev.materialShortageIssue.causeActions, caIdx, u) } }))} />
                  </div>
                ))}
              </SectionRow>
            );
          })()}

          {/* ══ 30. Other Critical Issue ══ */}
          {(() => {
            const data = formData.otherCriticalIssue;
            return (
              <SectionRow number={30} title="Other Critical Issue" target="0"
                status={data.hasIssue ? 'nok' : 'ok'}
                onAdd={() => setFormData(prev => ({ ...prev, otherCriticalIssue: { ...prev.otherCriticalIssue, causeActions: [...prev.otherCriticalIssue.causeActions, emptyCauseAction(30)] } }))}>
                <EntryRow>
                  <div className="flex items-center gap-2">
                    <Switch checked={data.hasIssue} onCheckedChange={(v) => setFormData(prev => ({ ...prev, otherCriticalIssue: { ...prev.otherCriticalIssue, hasIssue: v } }))} />
                    <span className={`text-[9px] font-extrabold ${data.hasIssue ? 'text-red-600' : 'text-emerald-600'}`}>{data.hasIssue ? 'YES' : 'NO'}</span>
                  </div>
                </EntryRow>
                {data.hasIssue && data.causeActions.length === 0 && (() => { setFormData(prev => ({ ...prev, otherCriticalIssue: { ...prev.otherCriticalIssue, causeActions: [emptyCauseAction(30)] } })); return null; })()}
                {data.hasIssue && data.causeActions.map((ca, caIdx) => (
                  <div key={caIdx} className="mt-1 w-full">
                    <EntryRow onRemove={data.causeActions.length > 1 ? () => setFormData(prev => ({ ...prev, otherCriticalIssue: { ...prev.otherCriticalIssue, causeActions: prev.otherCriticalIssue.causeActions.filter((_, i) => i !== caIdx) } })) : undefined}>
                      <CauseActionFields row={ca} onChange={(u) => setFormData(prev => ({ ...prev, otherCriticalIssue: { ...prev.otherCriticalIssue, causeActions: updateCA(prev.otherCriticalIssue.causeActions, caIdx, u) } }))} />
                    </EntryRow>
                  </div>
                ))}
              </SectionRow>
            );
          })()}

          {/* ══ 31. Others ══ */}
          <SectionRow number={31} title="Others" target="—">
            <EntryRow>
              <Field label="Remarks / Notes" className="flex-1 min-w-0">
                <Input value={formData.otherField1} onChange={(e) => setFormData(prev => ({ ...prev, otherField1: e.target.value }))}
                  className="h-7 text-[10px] font-medium w-full" placeholder="Additional notes..." />
              </Field>
            </EntryRow>
          </SectionRow>

          {/* ══ 32. Others 2 ══ */}
          <SectionRow number={32} title="Others" target="—">
            <EntryRow>
              <Field label="Remarks / Notes" className="flex-1 min-w-0">
                <Input value={formData.otherField2} onChange={(e) => setFormData(prev => ({ ...prev, otherField2: e.target.value }))}
                  className="h-7 text-[10px] font-medium w-full" placeholder="Additional notes..." />
              </Field>
            </EntryRow>
          </SectionRow>

        </div>
      </div>

      {/* ═══ Sticky Update Bar ═══ */}
      <div className="sticky bottom-3 mt-3 mx-1 rounded-xl border border-blue-500/20 px-4 py-3 flex justify-between items-center"
        style={{
          background: 'rgba(26, 26, 42, 0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
        }}>
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-400" />
          <span className="text-white/60 text-xs font-medium">{formattedDate}</span>
          <span className="text-[10px] text-blue-400/60 italic font-medium">(updating)</span>
        </div>
        <Button onClick={handleUpdate} disabled={isSaving} size="sm"
          className="h-8 text-xs font-semibold px-5"
          style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)', color: '#fff', boxShadow: '0 4px 14px rgba(59,130,246,0.4)' }}>
          <Save className="w-3.5 h-3.5 mr-1.5" />
          {isSaving ? 'Updating...' : 'Update Record'}
        </Button>
      </div>
    </div>
  );
}
