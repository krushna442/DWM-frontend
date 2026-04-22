import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Save,
  Plus,
  Trash2,
  Calendar,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  RotateCcw,
  Clock,
  User,
  Mail,
  Loader2,
  Send,
} from 'lucide-react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useDailyEntry } from '@/context/DailyEntryContext';
import { useMasterData } from '@/context/MasterDataContext';
import { notifyOwner as notifyOwnerApi } from '@/lib/api';
import type {
  // DailyEntry as DailyEntryType,
  SafetyEntry,
  CustomerRejection,
  OvertimeEntry,
  SupplierRejection,
  CauseActionRow,
} from '@/types';

/* ─── clamp percentage input ─── */

/* ─── clamp percentage input ─── */
const clampPct = (v: number) => Math.min(100, Math.max(0, v));

/* ─── Number input helper: removes leading zeros ─── */
const numVal = (v: number): string | number => (v === 0 ? '' : v);

/* ═══════════════════════ DATE POPUP ═══════════════════════ */
function DateSelectionPopup({ onSelect }: { onSelect: (date: string) => void }) {
  const [selected, setSelected] = useState('');
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="w-[20%] mx-auto mt-[100px]">
      <div className="date-popup-card">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #C9A962 0%, #e8c97a 100%)' }}>
            <Calendar className="w-5 h-5 text-[#1A1A1A]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#1A1A1A]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Select Report Date
            </h2>
            <p className="text-xs text-gray-400 font-medium">Choose the date for today's daily entry</p>
          </div>
        </div>

        {/* Date input */}
        <div className="mb-6">
          <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-2">
            Date
          </label>
          <input
            type="date"
            value={selected}
            max={today}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full h-11 px-4 border-2 border-[#D4D4D4] rounded-lg text-sm font-medium text-[#1A1A1A] transition-all duration-200 focus:border-[#C9A962] focus:outline-none focus:ring-2 focus:ring-[#C9A962]/20"
          />
          {selected && (
            <p className="mt-2 text-xs text-[#C9A962] font-semibold">
              {new Date(selected + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
              })}
            </p>
          )}
        </div>

        {/* CTA */}
        <button
          disabled={!selected}
          onClick={() => onSelect(selected)}
          className="w-full h-11 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200"
          style={{
            background: selected
              ? 'linear-gradient(135deg, #C9A962 0%, #e8c97a 100%)'
              : '#E5E5E5',
            color: selected ? '#1A1A1A' : '#999',
            cursor: selected ? 'pointer' : 'not-allowed',
            boxShadow: selected ? '0 4px 14px rgba(201,169,98,0.35)' : 'none',
          }}
        >
          <span>Open Daily Entry</span>
          <ChevronRight className="w-4 h-4" />
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
  secondNumber?: number;
  sectionData?: unknown;
  date?: string;
  showOwner?: boolean;
}

function SectionRow({ number, title, target, status, onAdd, children, highlight, secondNumber, sectionData, date, showOwner = true }: SectionRowProps) {
  const { deptOwners } = useMasterData();
  const owner = deptOwners.find(o => o.sl === number) || { name: '', email: '' };
  const ownerName = owner.name;
  const ownerEmail = owner.email;
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const rowColors = [
    'bg-blue-50',
    'bg-emerald-50',
    'bg-violet-50',
    'bg-amber-50',
    'bg-fuchsia-50',
    'bg-cyan-50',
    'bg-rose-50',
    'bg-teal-50',
    'bg-indigo-50',
    'bg-lime-50'
  ];

  const bgClass = highlight
    ? 'bg-yellow-100'
    : rowColors[number % rowColors.length];

  const handleNotifyClick = () => {
    if (!ownerEmail) {
      toast.error('No email configured for this section owner.');
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmSend = async () => {
    setIsSending(true);
    try {
      await notifyOwnerApi({
        ownerName,
        ownerEmail,
        sectionNumber: number,
        sectionTitle: title,
        date: date || new Date().toISOString().split('T')[0],
        data: sectionData,
      });
      toast.success(`Notification sent to ${ownerName} (${ownerEmail})`);
    } catch (err: any) {
      toast.error(`Failed to send: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSending(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <div className={`flex items-start gap-0 border-b border-white transition-all duration-200 hover:brightness-95 ${bgClass}`}>
        {/* Number + Title + Target */}
        <div className="flex w-[200px] shrink-0 items-start gap-2 px-2 py-2.5 bg-[#00BCD4] self-stretch">
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
            <h3 className="text-[10px] font-bold text-gray950 leading-tight break-words">
              {title}
            </h3>
            {target && (
              <span className="text-[9px] text-gray-950/70 font-medium mt-0.5">Target: {target}</span>
            )}
          </div>
        </div>

        {/* Status indicator */}
        <div className="pt-3 px-1.5 min-w-[22px] shrink-0">
          {status === 'ok' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
          {status === 'nok' && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
        </div>

        {/* Inputs area */}
        <div className="flex-1 min-w-0 py-2 pr-2">
          {children}
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-0.5 pt-1.5 pr-1.5 shrink-0">
          {onAdd && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-[#C9A962] hover:bg-[#C9A962]/10"
              onClick={onAdd}
              title="Add Row"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          )}
         {showOwner &&( <><Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            title={`Owner: ${ownerName}`}
          >
            <User className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-gray-500 hover:text-[#C9A962] hover:bg-[#C9A962]/10"
            onClick={handleNotifyClick}
            title={`Notify ${ownerName}`}
          >
            <Mail className="h-3.5 w-3.5" />
          </Button></>)}
        </div>
      </div>

      {/* ─── Confirmation Modal Overlay ─── */}
      {showConfirm && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
          onClick={() => !isSending && setShowConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 pt-6 pb-4 flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg, #C9A962 0%, #e8c97a 100%)' }}
              >
                <Send className="w-5 h-5 text-[#1A1A1A]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#1A1A1A]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Send Notification
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Email will be sent to the section owner</p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 pb-4">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-4 h-4 text-[#C9A962]" />
                  <span className="text-sm font-semibold text-[#1A1A1A]">{ownerName}</span>
                  <span className="text-xs text-gray-400">({ownerEmail})</span>
                </div>
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs font-medium text-gray-500">Section #{number}</span>
                    <p className="text-sm font-semibold text-[#1A1A1A] leading-snug">{title}</p>
                    {date && (
                      <span className="text-xs text-[#C9A962] font-medium mt-1 block">
                        Report Date: {new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                          weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                Are you sure you want to notify <strong className="text-[#1A1A1A]">{ownerName}</strong> about this section?
                The current data will be included in the email.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="px-6 pb-6 flex items-center gap-3">
              <button
                disabled={isSending}
                onClick={() => setShowConfirm(false)}
                className="flex-1 h-10 rounded-xl font-semibold text-sm border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={isSending}
                onClick={handleConfirmSend}
                className="flex-1 h-10 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200"
                style={{
                  background: 'linear-gradient(135deg, #C9A962 0%, #e8c97a 100%)',
                  color: '#1A1A1A',
                  boxShadow: '0 4px 14px rgba(201,169,98,0.35)',
                }}
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Yes, Notify
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

interface EntryRowProps {
  children: React.ReactNode;
  onRemove?: () => void;
  className?: string;
}

function EntryRow({ children, onRemove, className = "" }: EntryRowProps) {
  return (
    <div className={`group flex items-start gap-1.5 mb-1.5 last:mb-0 w-full ${className}`}>
      <div className="flex-1 min-w-0 w-full">
        {children}
      </div>
      {onRemove && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-red-300 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 hover:bg-red-50 shrink-0 mt-5"
          onClick={onRemove}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

interface FieldProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

function Field({ label, children, className = "" }: FieldProps) {
  return (
    <div className={`flex flex-col gap-0.5 ${className}`}>
      <span className="text-[9px] uppercase font-bold text-gray-900 px-0.5 tracking-wider whitespace-nowrap">{label}</span>
      {children}
    </div>
  );
}

/* ─── Inline status badge ─── */
function StatusBadge({ ok, okText = 'OK', nokText = 'MISS' }: { ok: boolean; okText?: string; nokText?: string }) {
  return (
    <div className={`h-7 flex items-center px-2 rounded text-[9px] font-extrabold border transition-colors ${
      ok
        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
        : 'bg-red-50 text-red-600 border-red-200 animate-pulse'
    }`}>
      {ok ? okText : nokText}
    </div>
  );
}

/* ─── Calendar icon-only date field ─── */
function DateIconField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[9px] uppercase font-bold text-gray-400 px-0.5 tracking-wider">Date</span>
      <div className="relative flex items-center justify-center">
        <input
          ref={ref}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`date-icon-only ${value ? 'has-date' : ''}`}
          title={value ? new Date(value + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Pick date'}
        />
      </div>
    </div>
  );
}

/* ─── Cause/Action fields — wide cause, compact action/resp/date ─── */
function CauseActionFields({
  row, onChange, machines, suppliers, customers, departments,
  showMachine, showSupplier, showDepartment, showInternalExternal,
  internalOptions, showCustomerWhenExternal,
}: {
  row: CauseActionRow;
  onChange: (updated: CauseActionRow) => void;
  machines?: { id: string; name: string ; code: string}[];
  suppliers?: { id: string; name: string }[];
  customers?: { id: string; name: string }[];
  departments?: { id: string; name: string; code: string }[];
  showMachine?: boolean;
  showSupplier?: boolean;
  showDepartment?: boolean;
  showInternalExternal?: boolean;
  internalOptions?: string[];
  showCustomerWhenExternal?: boolean;
}) {
  const isInternal = row.internalExternal === 'internal';
  const isExternal = row.internalExternal === 'external';

  return (
    <div className="flex items-end gap-1.5 w-full animate-in slide-in-from-left-2 duration-300">
      {/* Optional contextual dropdowns - compact */}
      {showMachine && machines && (
        <Field label="Machine" className="shrink-0">
          <Select value={row.machineId || ''} onValueChange={(v) => onChange({ ...row, machineId: v })}>
            <SelectTrigger className="h-7 text-[10px] font-semibold w-[120px]">
              <SelectValue placeholder="Machine" />
            </SelectTrigger>
            <SelectContent>
              {machines.map(m => (
                <SelectItem key={m.id} value={m.id}>{m.code}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      )}
      {showSupplier && suppliers && (
        <Field label="Supplier" className="shrink-0">
          <Select value={row.supplierId || ''} onValueChange={(v) => onChange({ ...row, supplierId: v })}>
            <SelectTrigger className="h-7 text-[10px] font-semibold w-[90px]">
              <SelectValue placeholder="Supplier" />
            </SelectTrigger>
            <SelectContent>
              {suppliers.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      )}
      {showDepartment && departments && (
        <Field label="Dept" className="shrink-0">
          <Select value={row.departmentId || ''} onValueChange={(v) => onChange({ ...row, departmentId: v })}>
            <SelectTrigger className="h-7 text-[10px] font-semibold w-[75px]">
              <SelectValue placeholder="Dept" />
            </SelectTrigger>
            <SelectContent>
              {departments.map(d => (
                <SelectItem key={d.id} value={d.id}>{d.code}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      )}
      {showInternalExternal && (
        <Field label="Type" className="shrink-0">
          <Select value={row.internalExternal || ''} onValueChange={(v) => onChange({ ...row, internalExternal: v as any, palletCategory: '' })}>
            <SelectTrigger className="h-7 text-[10px] font-semibold w-[80px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="internal">Internal</SelectItem>
              <SelectItem value="external">External</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      )}
      {/* Internal: show category dropdown (Process, FG, Line Feeding) */}
      {showInternalExternal && isInternal && (
        <Field label="Category" className="shrink-0">
          <Select value={row.palletCategory || ''} onValueChange={(v) => onChange({ ...row, palletCategory: v })}>
            <SelectTrigger className="h-7 text-[10px] font-semibold w-[100px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {(internalOptions || ['Process', 'FG', 'Line Feeding']).map(opt => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      )}
      {/* External: show customer dropdown */}
      {showInternalExternal && isExternal && showCustomerWhenExternal && customers && (
        <Field label="Customer" className="shrink-0">
          <Select value={row.customerId || ''} onValueChange={(v) => onChange({ ...row, customerId: v })}>
            <SelectTrigger className="h-7 text-[10px] font-semibold w-[100px]">
              <SelectValue placeholder="Customer" />
            </SelectTrigger>
            <SelectContent>
              {customers.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      )}

      {/* Cause (Why) — takes maximum space */}
      <Field label="Why / Cause" className="flex-[3] min-w-0">
        <Input
          value={row.cause}
          onChange={(e) => onChange({ ...row, cause: e.target.value })}
          className="h-7 text-[10px] font-medium border-red-200 bg-red-50/30 focus:ring-1 focus:ring-red-300 w-full"
          placeholder="Root cause / reason..."
        />
      </Field>

      {/* Action — compact */}
      <Field label="Action" className="flex-[1] min-w-0">
        <Input
          value={row.action}
          onChange={(e) => onChange({ ...row, action: e.target.value })}
          className="h-7 text-[10px] font-medium border-amber-200 bg-amber-50/30 focus:ring-1 focus:ring-amber-300 w-full"
          placeholder="Action..."
        />
      </Field>

      {/* Responsible — very compact */}
      <Field label="Resp." className="shrink-0">
        <Input
          value={row.responsible}
          onChange={(e) => onChange({ ...row, responsible: e.target.value })}
          className="h-7 text-[10px] font-medium w-[88px]"
          placeholder="Who"
        />
      </Field>

      {/* Date — icon only */}
      <DateIconField
        value={row.targetDate}
        onChange={(v) => onChange({ ...row, targetDate: v })}
      />
    </div>
  );
}


const formatSalesValue = (value:number) => {
  if (!value) return 0;

  if (value > 99) {
    return (value / 100).toFixed(2) + " Cr";
  }
  return value.toFixed(2) + " L";
};

const formatDateTime = (dateString?: string, onlyDate = false) => {
    if (!dateString) return "-";
    const cleanDate = dateString.endsWith("Z") ? dateString.slice(0, -1) : dateString;
    const d = new Date(cleanDate);
    if (isNaN(d.getTime())) return dateString;

    const day = String(d.getDate()).padStart(2, "0");
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const month = monthNames[d.getMonth()];
    const year = d.getFullYear();

    if (onlyDate) return `${day} ${month} ${year}`;

    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${day} ${month} ${year}, ${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
};

/* ═══════════════════════ MAIN COMPONENT ═══════════════════════ */

export default function DailyEntry() {
  const {
    isDraftLoading, draftRestoredAt,
    selectedDate, selectDate,
    formData, setFormData, prevCumulatives,
    autoSaveDraft, saveEntry, isSaving,lastEntry,
    resetForm,
    isAlreadySaved,
  } = useDailyEntry();
  const { partTypes, customers, suppliers, machines, departments ,deptOwners} = useMasterData();

  const getOwner = (sl: number) => deptOwners.find(o => o.sl === sl) || { name: '', email: '' };

  const emptyCauseAction = (sl?: number): CauseActionRow => ({
    cause: '', action: '', responsible: sl ? getOwner(sl).name : '', targetDate: '',
  });

  // ── Auto-calculate cumulative OT Hours ──
  useEffect(() => {
    const yesterdayOT = formData.overtime.reduce((sum, ot) => sum + ot.hours, 0);
    const prevTotal = prevCumulatives?.otHours || 0;
    const todayCumulative = prevTotal + yesterdayOT;
    setFormData(prev => ({
      ...prev,
      cumulativeOT: { ...prev.cumulativeOT, previousTotal: prevTotal, yesterdayOT, todayCumulative }
    }));
  }, [formData.overtime, prevCumulatives?.otHours]);

  // ── Auto-calculate cumulative Electricity ──
  useEffect(() => {
    const prev = prevCumulatives?.electricity || 0;
    const current = prev + (formData.utilities.electricityKVAH || 0);
    setFormData(prevData => ({
      ...prevData,
      utilities: { ...prevData.utilities, cumulativeElectricity: current }
    }));
  }, [formData.utilities.electricityKVAH, prevCumulatives?.electricity]);

  // ── Auto-calculate cumulative Diesel ──
  useEffect(() => {
    const prev = prevCumulatives?.diesel || 0;
    const current = prev + (formData.utilities.dieselLTR || 0);
    setFormData(prevData => ({
      ...prevData,
      utilities: { ...prevData.utilities, cumulativeDiesel: current }
    }));
  }, [formData.utilities.dieselLTR, prevCumulatives?.diesel]);

  // ── Auto-calculate cumulative Sales ──
  useEffect(() => {
    const prev = prevCumulatives?.sales || 0;
    const current = prev + (formData.sales.dailySales || 0);
    setFormData(prevData => ({
      ...prevData,
      sales: { ...prevData.sales, cumulativeSales: current }
    }));
  }, [formData.sales.dailySales, prevCumulatives?.sales]);

  // ── Auto-calculate cumulative Training Hours ──
  useEffect(() => {
    const prev = prevCumulatives?.trainingHours || 0;
    const current = prev + (formData.training.dailyHours || 0);
    setFormData(prevData => ({
      ...prevData,
      training: { ...prevData.training, cumulativeHours: current }
    }));
  }, [formData.training.dailyHours, prevCumulatives?.trainingHours]);

  // ── Auto-populate Production Plan Adherence from Production totals (point 3 → point 9) ──
  useEffect(() => {
    const totalTarget = partTypes.reduce((sum, _, i) => sum + (formData.production[i]?.target || 0), 0);
    const totalActual = partTypes.reduce((sum, _, i) => sum + (formData.production[i]?.actual || 0), 0);
    if (totalTarget > 0) {
      const pct = clampPct(Math.round((totalActual / totalTarget) * 100));
      setFormData(prev => ({
        ...prev,
        productionPlanAdherence: { ...prev.productionPlanAdherence, actual: pct }
      }));
    }
  }, [formData.production, partTypes]);

  // ── Auto-toggle PDI Issue based on PDI Ratio (Section 22) ──
  useEffect(() => {
    const ratio = formData.qualityRatios.pdiRatio;
    if (ratio > 0 && ratio < 100) {
      setFormData(prev => ({
        ...prev,
        pdiIssues: { ...prev.pdiIssues, hasIssue: true }
      }));
    }
  }, [formData.qualityRatios.pdiRatio]);

  const trimSupplierRejections = () => {
    setFormData(prev => {
      const filled = prev.supplierRejections.filter(r => r.supplierId || r.reason.trim());
      if (filled.length !== prev.supplierRejections.length) {
        return { ...prev, supplierRejectionCount: filled.length, supplierRejections: filled };
      }
      return prev;
    });
  };

  /* ─── Helpers ─── */
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

  /* ─── Helper: update cause action in arrays ─── */
  const updateCauseAction = (arr: CauseActionRow[], idx: number, updated: CauseActionRow) => {
    const newArr = [...arr];
    newArr[idx] = updated;
    return newArr;
  };

  /* ─── Ensure cause actions array matches count ─── */
  const ensureCauseActionsLength = (arr: CauseActionRow[], count: number, ownerIdx: number): CauseActionRow[] => {
    if (count <= 0) return [];
    const result = [...arr];
    while (result.length < count) result.push(emptyCauseAction(ownerIdx));
    return result.slice(0, count);
  };

  /* ─── PRD department id lookup ─── */
  const prdDept = departments.find(d => d.code === 'PRD');

  /* ─── Loading state while checking for draft ─── */
  if (isDraftLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#C9A962] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-700 font-medium">Loading draft...</p>
        </div>
      </div>
    );
  }

  /* show date popup if not selected */
  if (!selectedDate) {
    return <DateSelectionPopup onSelect={selectDate} />;
  }

  const formattedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'long', day: 'numeric', year: 'numeric'
  });

  return (
    <div className="animate-fade-in max-w-full mx-auto">

      {/* ─── Draft Restore Banner ─── */}
      {draftRestoredAt && (
        <div className="mx-1 mb-2 rounded-lg px-4 py-2.5 flex items-center justify-between"
          style={{ background: 'rgba(201,169,98,0.12)', border: '1px solid rgba(201,169,98,0.3)' }}>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#C9A962]" />
            <span className="text-xs text-[#C9A962] font-semibold">
              Draft restored — last saved {formatDateTime(draftRestoredAt)}
            </span>
          </div>
          <button
            onClick={resetForm}
            className="text-[10px] text-gray-900 hover:text-red-400 transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3 " /> Discard Draft
          </button>
        </div>
      )}

      {/* ═══ Main Table ═══ */}
      <div className="daily-entry-card">
        {/* Header */}
        <div className="bg-[#134E4A] px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-[#C9A962]" />
              <h1 className="text-xs font-semibold text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                Daily Record — <span className="text-[#C9A962]">{formattedDate}</span>
              </h1>
            </div>
            <button
              onClick={resetForm}
              className="text-[10px] text-white hover:text-[#C9A962] transition-colors font-medium flex items-center gap-1"
            >
              <Calendar className="w-3 h-3" /> Change Date
            </button>
          </div>
        </div>

        {/* Table body — onBlur auto-saves draft when user leaves any section */}
        <div
          className="divide-y divide-gray-100 bg-[#dbd8d8ff]"
          onBlur={() => autoSaveDraft()}
        >

          {/* ══════════ 1. Accident / Incident / Near Miss ══════════ */}
          <SectionRow
            number={1}
            title="Accident / Incident / Near Miss"
            target="0"
            status={hasSafetyIssue ? 'nok' : 'ok'}
            // onAdd={() => {
            //   const newEntry: SafetyEntry = { type: 'accidents', incidentType: 'others', count: 0, causeActions: [] };
            //   setFormData(prev => ({ ...prev, safety: [...prev.safety, newEntry] }));
            // }}
            sectionData={formData.safety}
            date={selectedDate}
          >
            {(formData.safety.length === 0
              ? [{ type: 'accidents', incidentType: 'others', count: 0, causeActions: [] } as SafetyEntry]
              : formData.safety
            ).map((entry, idx) => (
              <div key={idx}>
                <EntryRow onRemove={formData.safety.length > 0 ? () => {
                  setFormData(prev => ({ ...prev, safety: prev.safety.filter((_, i) => i !== idx) }));
                } : undefined}>
                  <div className="flex items-end gap-2 flex-wrap">
                    <Field label="Type" className="shrink-0">
                      <Select value={entry.type} onValueChange={(v) => {
                        const updated = [...formData.safety];
                        const tIdx = formData.safety.length === 0 ? 0 : idx;
                        updated[tIdx] = { ...entry, type: v as any };
                        setFormData(prev => ({ ...prev, safety: updated }));
                      }}>
                        <SelectTrigger className="h-7 text-[10px] font-semibold w-[95px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="accidents">Accident</SelectItem>
                          <SelectItem value="incidents">Incident</SelectItem>
                          <SelectItem value="nearMiss">Near Miss</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Incident" className="shrink-0">
                      <Select value={entry.incidentType} onValueChange={(v) => {
                        const updated = [...formData.safety];
                        const tIdx = formData.safety.length === 0 ? 0 : idx;
                        updated[tIdx] = { ...entry, incidentType: v as any };
                        setFormData(prev => ({ ...prev, safety: updated }));
                      }}>
                        <SelectTrigger className="h-7 text-[10px] font-semibold w-[85px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="machine">Machine</SelectItem>
                          <SelectItem value="others">Others</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Count" className="shrink-0">
                      <Input
                        type="number"
                        value={numVal(entry.count)}
                        onChange={(e) => {
                          const count = parseInt(e.target.value) || 0;
                          const updated = [...formData.safety];
                          const tIdx = formData.safety.length === 0 ? 0 : idx;
                          const causeActions = ensureCauseActionsLength(entry.causeActions, count, 1);
                          updated[tIdx] = { ...entry, count, causeActions };
                          setFormData(prev => ({ ...prev, safety: updated }));
                        }}
                        className={`h-7 text-[10px] font-bold w-[55px] text-center ${entry.count > 0 ? 'border-red-300 bg-red-50 text-red-700' : ''}`}
                      />
                    </Field>
                  </div>
                </EntryRow>
                {entry.count > 0 && entry.causeActions.map((ca, caIdx) => (
                  <div key={caIdx} className="ml-2 mt-1 w-full">
                    <CauseActionFields
                      row={ca}
                      onChange={(updated) => {
                        const newCA = updateCauseAction(entry.causeActions, caIdx, updated);
                        const updatedSafety = [...formData.safety];
                        const tIdx = formData.safety.length === 0 ? 0 : idx;
                        updatedSafety[tIdx] = { ...entry, causeActions: newCA };
                        setFormData(prev => ({ ...prev, safety: updatedSafety }));
                      }}
                    />
                  </div>
                ))}
              </div>
            ))}
          </SectionRow>

          {/* ══════════ 2. Customer Rejection ══════════ */}
          <SectionRow
            number={2}
            title="Customer Rejection (TML | ALW | PNR)"
            target="0 PPM"
            status={hasCustomerRejection ? 'nok' : 'ok'}
          
                sectionData={{ customerRejectionCount: formData.customerRejectionCount, customerRejections: formData.customerRejections }}
                date={selectedDate}
              >
            <EntryRow>
              <div className="flex items-end gap-2 flex-wrap">
                <Field label="Count" className="shrink-0">
                  <Input
                    type="number"
                    value={numVal(formData.customerRejectionCount)}
                    onChange={(e) => {
                      const count = parseInt(e.target.value) || 0;
                      const rejections: CustomerRejection[] = [];
                      for (let i = 0; i < count; i++) {
                        rejections.push(formData.customerRejections[i] || { customerId: '', reason: '' });
                      }
                      setFormData(prev => ({ ...prev, customerRejectionCount: count, customerRejections: rejections }));
                    }}
                    className={`h-7 text-[10px] font-bold w-[55px] text-center ${formData.customerRejectionCount > 0 ? 'border-red-300 bg-red-50 text-red-700' : ''}`}
                  />
                </Field>
              </div>
            </EntryRow>
            {formData.customerRejections.map((rejection, idx) => (
              <EntryRow key={idx} className="ml-2 mt-1">
                <div className="flex items-end gap-2 flex-wrap w-full">
                  <Field label="Customer" className="shrink-0">
                    <Select value={rejection.customerId} onValueChange={(v) => {
                      const updated = [...formData.customerRejections];
                      updated[idx] = { ...rejection, customerId: v };
                      setFormData(prev => ({ ...prev, customerRejections: updated }));
                    }}>
                      <SelectTrigger className="h-7 text-[10px] font-semibold w-[110px]">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.filter(c => c.isActive).map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Reason" className="flex-1 min-w-0">
                    <Input
                      value={rejection.reason}
                      onChange={(e) => {
                        const updated = [...formData.customerRejections];
                        updated[idx] = { ...rejection, reason: e.target.value };
                        setFormData(prev => ({ ...prev, customerRejections: updated }));
                      }}
                      className="h-7 text-[10px] font-medium border-red-200 bg-red-50/30 w-full"
                      placeholder="Rejection reason..."
                    />
                  </Field>
                </div>
              </EntryRow>
            ))}
          </SectionRow>

          {/* ══════════ 3. Last Day Production ══════════ */}
          <SectionRow number={3} title="Last Day Production" target="—"
            sectionData={formData.production}
            date={selectedDate}
          >
            <div className="flex border border-[#E5E5E5] h-full rounded overflow-hidden">
              {[
                ...partTypes.map((p, idx) => ({ label: p.name, key: idx })),
                { label: 'Total', key: 'total' }
              ].map((col, idx, allFields) => {
                const isTotal = col.key === 'total';
                let targetValue = 0;
                let actualValue = 0;
                if (isTotal) {
                  targetValue = totalProdTarget;
                  actualValue = totalProdActual;
                } else {
                  targetValue = formData.production[col.key as number]?.target || 0;
                  actualValue = formData.production[col.key as number]?.actual || 0;
                }
                return (
                  <div key={col.label} className={`flex-1 min-w-[100px] h-full flex flex-col ${idx < allFields.length - 1 ? 'border-r border-[#E5E5E5]' : ''}`}>
                    <div className="text-[10px] font-bold text-center py-2 bg-gray-50 border-b border-[#E5E5E5] text-[#1A1A1A]">
                      {col.label}
                    </div>

                    <div className="flex">
                      <div className="flex-1 border-r h-full border-[#E5E5E5]">
                        <Input
                          type="number"
                          value={numVal(targetValue)}
                          disabled={isTotal}
                          onChange={(e) => {
                            const updated = [...formData.production];
                            const fieldIdx = col.key as number;
                            while (updated.length <= fieldIdx) updated.push({ partTypeId: partTypes[updated.length]?.id || '', target: 0, actual: 0 });
                            updated[fieldIdx] = { ...updated[fieldIdx], target: parseInt(e.target.value) || 0 };
                            setFormData(prev => ({ ...prev, production: updated }));
                          }}
                          className={`h-8 border-0 rounded-none text-center text-[10px] font-medium shadow-none focus:ring-0 ${isTotal ? 'bg-gray-50 font-bold text-gray-700' : ''}`}
                          placeholder="T"
                        />
                      </div>
                      <div className="flex-1">
                        <Input
                          type="number"
                          value={numVal(actualValue)}
                          disabled={isTotal}
                          onChange={(e) => {
                            const updated = [...formData.production];
                            const fieldIdx = col.key as number;
                            while (updated.length <= fieldIdx) updated.push({ partTypeId: partTypes[updated.length]?.id || '', target: 0, actual: 0 });
                            updated[fieldIdx] = { ...updated[fieldIdx], actual: parseInt(e.target.value) || 0 };
                            setFormData(prev => ({ ...prev, production: updated }));
                          }}
                          className={`h-8 border-0 rounded-none text-center text-[10px] font-medium shadow-none focus:ring-0 ${isTotal ? 'bg-gray-50 font-bold text-emerald-700' : ''}`}
                          placeholder="A"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionRow>

          {/* ══════════ 4. Cycle Time ══════════ */}
          <SectionRow
            number={4}
            title="Cycle Time (Front / Rear)"
            target="< 2 Min"
            status={cycleTimeSum === 0 ? 'na' : (isCycleTimeHigh ? 'nok' : 'ok')}
  sectionData={formData.cycleTime}
  date={selectedDate}
>
            <EntryRow>
              <div className="flex items-end gap-2 flex-wrap">
                <Field label="Front (min)" className="shrink-0">
                  <Input
                    type="number" step="0.01"
                    value={numVal(formData.cycleTime.front)}
                    onChange={(e) => setFormData(prev => ({ ...prev, cycleTime: { ...prev.cycleTime, front: parseFloat(e.target.value) || 0 } }))}
                    className="h-7 text-[10px] font-semibold w-[65px]"
                  />
                </Field>
                <Field label="Rear (min)" className="shrink-0">
                  <Input
                    type="number" step="0.01"
                    value={numVal(formData.cycleTime.rear)}
                    onChange={(e) => setFormData(prev => ({ ...prev, cycleTime: { ...prev.cycleTime, rear: parseFloat(e.target.value) || 0 } }))}
                    className="h-7 text-[10px] font-semibold w-[65px]"
                  />
                </Field>
                <Field label="Total" className="shrink-0">
                  <Input
                    value={cycleTimeSum.toFixed(2)}
                    disabled
                    className={`h-7 text-[10px] font-bold w-[60px] text-center ${isCycleTimeHigh ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}
                  />
                </Field>
              </div>
            </EntryRow>
            {isCycleTimeHigh && formData.cycleTime.causeActions.length === 0 && (() => {
              setFormData(prev => ({ ...prev, cycleTime: { ...prev.cycleTime, causeActions: [emptyCauseAction(4)] } }));
              return null;
            })()}
            {isCycleTimeHigh && formData.cycleTime.causeActions.map((ca, caIdx) => (
              <div key={caIdx} className="mt-1 w-full">
                <CauseActionFields
                  row={ca}
                  onChange={(updated) => setFormData(prev => ({
                    ...prev,
                    cycleTime: { ...prev.cycleTime, causeActions: updateCauseAction(prev.cycleTime.causeActions, caIdx, updated) }
                  }))}
                />
              </div>
            ))}
          </SectionRow>

          {/* ══════════ 5. Per Man Per Day Qty ══════════ */}
          <SectionRow
            number={5}
            title="Per Man Per Day Qty (Yesterday)"
            target="6"
            status={formData.perManPerDay.actual === 0 ? 'na' : (isPerManLow ? 'nok' : 'ok')}
            onAdd={() => setFormData(prev => ({
              ...prev,
              perManPerDay: { ...prev.perManPerDay, causeActions: [...prev.perManPerDay.causeActions, emptyCauseAction(5)] }
            }))}
            sectionData={formData.perManPerDay}
            date={selectedDate}
          >
            <EntryRow>
              <div className="flex items-end gap-2 flex-wrap">
                <Field label="Actual" className="shrink-0">
                  <Input
                    type="number" step="0.01"
                    value={numVal(formData.perManPerDay.actual)}
                    onChange={(e) => setFormData(prev => ({ ...prev, perManPerDay: { ...prev.perManPerDay, actual: parseFloat(e.target.value) || 0 } }))}
                    className={`h-7 text-[10px] font-bold w-[60px] text-center ${isPerManLow ? 'border-red-300 bg-red-50 text-red-700' : ''}`}
                  />
                </Field>
                <Field label="Target" className="shrink-0">
                  <Input value="6" disabled className="h-7 text-[10px] font-bold w-[50px] text-center text-black bg-gray-50" />
                </Field>
              </div>
            </EntryRow>
            {isPerManLow && formData.perManPerDay.causeActions.length === 0 && (() => {
              setFormData(prev => ({ ...prev, perManPerDay: { ...prev.perManPerDay, causeActions: [emptyCauseAction(5)] } }));
              return null;
            })()}
            {isPerManLow && formData.perManPerDay.causeActions.map((ca, caIdx) => (
              <div key={caIdx} className="mt-1 w-full">
                <EntryRow onRemove={formData.perManPerDay.causeActions.length > 1 ? () => setFormData(prev => ({
                  ...prev,
                  perManPerDay: { ...prev.perManPerDay, causeActions: prev.perManPerDay.causeActions.filter((_, i) => i !== caIdx) }
                })) : undefined}>
                  <CauseActionFields
                    row={ca}
                    onChange={(updated) => setFormData(prev => ({
                      ...prev,
                      perManPerDay: { ...prev.perManPerDay, causeActions: updateCauseAction(prev.perManPerDay.causeActions, caIdx, updated) }
                    }))}
                  />
                </EntryRow>
              </div>
            ))}
          </SectionRow>

          {/* ══════════ 6. Last Day OT Hours ══════════ */}
          <SectionRow
            number={6}
            title="Last Day OT Hours"
            target="0"
            status={hasOT ? 'nok' : 'ok'}
            onAdd={isAlreadySaved ? undefined : () => {
              const newEntry: OvertimeEntry = { departmentId: '', hours: 0, reason: '' };
              setFormData(prev => ({ ...prev, overtime: [...prev.overtime, newEntry] }));
            }}
            sectionData={formData.overtime}
            date={selectedDate}
          >
            {(formData.overtime.length === 0 ? [{ departmentId: '', hours: 0, reason: '' }] : formData.overtime).map((entry, idx) => {
              const hasHours = entry.hours > 0;
              const isPRD = prdDept && entry.departmentId === prdDept.id;
              return (
                <EntryRow key={idx} onRemove={isAlreadySaved ? undefined : (formData.overtime.length > 0 ? () => {
                  setFormData(prev => ({ ...prev, overtime: prev.overtime.filter((_, i) => i !== idx) }));
                } : undefined)}>
                  <div className="flex items-end gap-2 flex-wrap w-full">
                    <Field label="Department" className="shrink-0">
                      <Select value={entry.departmentId} disabled={isAlreadySaved} onValueChange={(v) => {
                        const updated = [...formData.overtime];
                        const tIdx = formData.overtime.length === 0 ? 0 : idx;
                        updated[tIdx] = { ...entry, departmentId: v, machineId: '' };
                        setFormData(prev => ({ ...prev, overtime: updated }));
                      }}>
                        <SelectTrigger className="h-7 text-[10px] font-semibold w-[110px]" disabled={isAlreadySaved}>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map(dept => (
                            <SelectItem key={dept.id} value={dept.id}>{dept.code}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    {/* Machine dropdown when PRD dept is selected */}
                    {isPRD && (
                      <Field label="Machine" className="shrink-0">
                        <Select value={entry.machineId || ''} onValueChange={(v) => {
                          const updated = [...formData.overtime];
                          const tIdx = formData.overtime.length === 0 ? 0 : idx;
                          updated[tIdx] = { ...entry, machineId: v };
                          setFormData(prev => ({ ...prev, overtime: updated }));
                        }}>
                          <SelectTrigger className="h-7 text-[10px] font-semibold w-[100px]" disabled={isAlreadySaved}>
                            <SelectValue placeholder="Machine" />
                          </SelectTrigger>
                          <SelectContent>
                            {machines.map(m => (
                              <SelectItem key={m.id} value={m.id}>{m.code}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    )}
                    <Field label="Hours" className="shrink-0">
                      <Input
                        type="number" step="0.5"
                        value={numVal(entry.hours)}
                        onChange={(e) => {
                          const updated = [...formData.overtime];
                          const tIdx = formData.overtime.length === 0 ? 0 : idx;
                          updated[tIdx] = { ...entry, hours: parseFloat(e.target.value) || 0 };
                          setFormData(prev => ({ ...prev, overtime: updated }));
                        }}
                        disabled={isAlreadySaved}
                        className={`h-7 text-[10px] font-bold w-[60px] text-center ${hasHours ? 'border-red-300 bg-red-50 text-red-700' : ''}`}
                      />
                    </Field>
                    {hasHours && (
                      <Field label="Reason" className="flex-1 min-w-0">
                        <Input
                          value={entry.reason}
                          onChange={(e) => {
                            const updated = [...formData.overtime];
                            const tIdx = formData.overtime.length === 0 ? 0 : idx;
                            updated[tIdx] = { ...entry, reason: e.target.value };
                            setFormData(prev => ({ ...prev, overtime: updated }));
                          }}
                          disabled={isAlreadySaved}
                          className="h-7 text-[10px] font-medium border-amber-200 bg-amber-50/30 w-full"
                          placeholder="Why OT needed?"
                        />
                      </Field>
                    )}
                  </div>
                </EntryRow>
              );
            })}
          </SectionRow>

          {/* ══════════ 7. Cumulative OT Hours ══════════ */}
          <SectionRow number={7} title="Cumulative OT Hours" target="0" highlight
            sectionData={formData.cumulativeOT}
            date={selectedDate}
          >
            <EntryRow>
              <div className="flex items-end gap-2 flex-wrap">
                <Field label="Prev Total" className="shrink-0">
                  <Input value={numVal(formData.cumulativeOT.previousTotal)} disabled className="h-7 text-[10px] font-bold  bg-gray-50 w-[70px] text-center" />
                </Field>
                <Field label="Yesterday" className="shrink-0">
                  <Input value={numVal(formData.cumulativeOT.yesterdayOT)} disabled className="h-7 text-[10px] font-bold bg-gray-50 w-[70px] text-center" />
                </Field>
                <Field label="Cumulative" className="shrink-0">
                  <Input value={numVal(formData.cumulativeOT.todayCumulative)} disabled className="h-7 text-[10px] font-extrabold bg-amber-50 border-amber-200 text-amber-700 w-[70px] text-center" />
                </Field>
              </div>
            </EntryRow>
          </SectionRow>

          {/* ══════════ 8. Dispatch ══════════ */}
          <SectionRow
            number={8}
            title="Last Day Dispatch (TML | ALW | PNR)"
            target="—"
            sectionData={formData.dispatch}
            date={selectedDate}
          >
            <div className="flex gap-4 ">
              {customers.map((cust) => {
                const entry = formData.dispatch.find(d => d.customerId === cust.id) || { customerId: cust.id, quantity: 0 };
                return (
                  <div key={cust.id} className="flex bg-white flex-col border border-[#E5E5E5] rounded overflow-hidden w-[130px] bg-white shadow-sm">
                    <div className="text-[10px] bg-white font-bold text-center py-1.5 bg-gray-50 border-b border-[#E5E5E5] text-[#1A1A1A] uppercase tracking-tighter">
                      {cust.code}
                    </div>
                    <div className="p-1.5">
                      <Input
                        type="number"
                        value={numVal(entry.quantity)}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setFormData(prev => {
                            const updated = [...prev.dispatch];
                            const idx = updated.findIndex(d => d.customerId === cust.id);
                            if (idx >= 0) {
                              updated[idx] = { ...updated[idx], quantity: val };
                            } else {
                              updated.push({ customerId: cust.id,code:cust.code, quantity: val });
                            }
                            return { ...prev, dispatch: updated };
                          });
                        }}
                        className="h-8 text-center text-[12px] font-bold border-[#E5E5E5] focus-visible:ring-[#C9A962]"
                        placeholder="0"
                      />
                    </div>
                  </div>
                );
              })}
              {/* total dispatch */}
              <div className="flex flex-col bg-white border border-[#E5E5E5] rounded overflow-hidden w-[130px] bg-white shadow-sm">
                <div className="text-[10px] font-bold text-center py-1.5  border-b border-[#E5E5E5] text-[#1A1A1A] uppercase tracking-tighter">
                  Total
                </div>
                <div className="p-1.5">
                  <Input
                    type="number"
                    value={numVal(formData.dispatch.reduce((acc, d) => acc + d.quantity, 0))}
                    disabled
                    className="h-8 text-center text-[12px] font-bold border-[#E5E5E5] focus-visible:ring-[#C9A962]"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </SectionRow>

          {/* ══════════ 9. Prod Plan Adherence — auto from production ══════════ */}
          {(() => {
            const metric = formData.productionPlanAdherence;
            const missed = metric.actual > 0 && metric.actual < 95;
            return (
              <SectionRow
                number={9}
                title="Prod. Plan Adherence % (Yesterday)"
                target="95%"
                status={metric.actual === 0 ? 'na' : (missed ? 'nok' : 'ok')}
                onAdd={() => setFormData(prev => ({
                  ...prev,
                  productionPlanAdherence: { ...prev.productionPlanAdherence, causeActions: [...prev.productionPlanAdherence.causeActions, emptyCauseAction(9)] }
                }))}
                sectionData={formData.productionPlanAdherence}
                date={selectedDate}
              >
                <EntryRow>
                  <div className="flex items-end gap-2 flex-wrap">
                    <Field label="Actual %" className="shrink-0">
                      <Input
                        type="number"
                        value={numVal(metric.actual)}
                        min={0} max={100}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          productionPlanAdherence: { ...prev.productionPlanAdherence, actual: clampPct(parseFloat(e.target.value) || 0) }
                        }))}
                        className={`h-7 text-[10px] font-bold w-[70px] text-center ${missed ? 'border-red-300 bg-red-50 text-red-700' : ''}`}
                      />
                    </Field>
                    <Field label="Target" className="shrink-0">
                      <Input value="95%" disabled className="h-7 text-[10px] font-bold w-[60px] text-center bg-gray-50" />
                    </Field>
                    {totalProdTarget > 0 && (
                      <div className="flex items-center gap-1 mt-5">
                        <span className="text-[9px] text-gray-700 italic">Auto from production:</span>
                        <span className="text-[9px] font-bold text-[#C9A962]">
                          {totalProdTarget > 0 ? Math.round((totalProdActual / totalProdTarget) * 100) : 0}%
                        </span>
                      </div>
                    )}
                  </div>
                </EntryRow>
                {missed && metric.causeActions.length === 0 && (() => {
                  setFormData(prev => ({ ...prev, productionPlanAdherence: { ...prev.productionPlanAdherence, causeActions: [emptyCauseAction(9)] } }));
                  return null;
                })()}
                {metric.causeActions.map((ca, caIdx) => (
                  <div key={caIdx} className="mt-1 w-full">
                    <EntryRow onRemove={(missed ? metric.causeActions.length > 1 : metric.causeActions.length > 0) ? () => setFormData(prev => ({
                      ...prev,
                      productionPlanAdherence: { ...prev.productionPlanAdherence, causeActions: prev.productionPlanAdherence.causeActions.filter((_, i) => i !== caIdx) }
                    })) : undefined}>
                      <CauseActionFields row={ca} onChange={(updated) => setFormData(prev => ({
                        ...prev,
                        productionPlanAdherence: { ...prev.productionPlanAdherence, causeActions: updateCauseAction(prev.productionPlanAdherence.causeActions, caIdx, updated) }
                      }))} />
                    </EntryRow>
                  </div>
                ))}
              </SectionRow>
            );
          })()}

          {/* ══════════ 10. OTIF Schedule Adherence ══════════ */}
          {(() => {
            const metric = formData.scheduleAdherence;
            const missed = metric.actual > 0 && metric.actual < 100;
            return (
              <SectionRow
                number={10}
                title="OTIF Schedule Adherence % (Yesterday)"
                target="100%"
                status={metric.actual === 0 ? 'na' : (missed ? 'nok' : 'ok')}
                onAdd={() => setFormData(prev => ({
                  ...prev,
                  scheduleAdherence: { ...prev.scheduleAdherence, causeActions: [...prev.scheduleAdherence.causeActions, emptyCauseAction(10)] }
                }))}
                sectionData={formData.scheduleAdherence}
                date={selectedDate}
              >
                <EntryRow>
                  <div className="flex items-end gap-2 flex-wrap">
                    <Field label="Actual %" className="shrink-0">
                      <Input
                        type="number" min={0} max={100}
                        value={numVal(metric.actual)}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          scheduleAdherence: { ...prev.scheduleAdherence, actual: clampPct(parseFloat(e.target.value) || 0) }
                        }))}
                        className={`h-7 text-[10px] font-bold w-[70px] text-center ${missed ? 'border-red-300 bg-red-50 text-red-700' : ''}`}
                      />
                    </Field>
                    <Field label="Target" className="shrink-0">
                      <Input value="100%" disabled className="h-7 text-[10px] font-bold w-[60px] text-center bg-gray-50" />
                    </Field>
                  </div>
                </EntryRow>
                {missed && metric.causeActions.length === 0 && (() => {
                  setFormData(prev => ({ ...prev, scheduleAdherence: { ...prev.scheduleAdherence, causeActions: [emptyCauseAction(10)] } }));
                  return null;
                })()}
                {missed && metric.causeActions.map((ca, caIdx) => (
                  <div key={caIdx} className="mt-1 w-full">
                    <EntryRow onRemove={metric.causeActions.length > 1 ? () => setFormData(prev => ({
                      ...prev,
                      scheduleAdherence: { ...prev.scheduleAdherence, causeActions: prev.scheduleAdherence.causeActions.filter((_, i) => i !== caIdx) }
                    })) : undefined}>
                      <CauseActionFields row={ca} onChange={(updated) => setFormData(prev => ({
                        ...prev,
                        scheduleAdherence: { ...prev.scheduleAdherence, causeActions: updateCauseAction(prev.scheduleAdherence.causeActions, caIdx, updated) }
                      }))} />
                    </EntryRow>
                  </div>
                ))}
              </SectionRow>
            );
          })()}

          {/* ══════════ 11. Material Shortage Loss ══════════ */}
          {(() => {
            const metric = formData.materialShortageLoss;
            const missed = metric.actual > 0;
            return (
              <SectionRow
                number={11}
                title="Prod. Hours Loss for Material Shortage"
                target="0"
                status={missed ? 'nok' : 'ok'}
                onAdd={() => setFormData(prev => ({
                  ...prev,
                  materialShortageLoss: { ...prev.materialShortageLoss, causeActions: [...prev.materialShortageLoss.causeActions, emptyCauseAction(11)] }
                }))}
                sectionData={formData.materialShortageLoss}
                date={selectedDate}
              >
                <EntryRow>
                  <div className="flex items-end gap-2 flex-wrap">
                    <Field label="Actual" className="shrink-0">
                      <Input
                        type="number"
                        value={numVal(metric.actual)}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          materialShortageLoss: { ...prev.materialShortageLoss, actual: parseFloat(e.target.value) || 0 }
                        }))}
                        className={`h-7 text-[10px] font-bold w-[70px] text-center ${missed ? 'border-red-300 bg-red-50 text-red-700' : ''}`}
                      />
                    </Field>
                    <Field label="Target" className="shrink-0">
                      <Input value="0" disabled className="h-7 text-[10px] font-bold w-[60px] text-center bg-gray-50" />
                    </Field>
                  </div>
                </EntryRow>
                {missed && metric.causeActions.length === 0 && (() => {
                  setFormData(prev => ({ ...prev, materialShortageLoss: { ...prev.materialShortageLoss, causeActions: [emptyCauseAction(11)] } }));
                  return null;
                })()}
                {missed && metric.causeActions.map((ca, caIdx) => (
                  <div key={caIdx} className="mt-1 w-full">
                    <EntryRow onRemove={metric.causeActions.length > 1 ? () => setFormData(prev => ({
                      ...prev,
                      materialShortageLoss: { ...prev.materialShortageLoss, causeActions: prev.materialShortageLoss.causeActions.filter((_, i) => i !== caIdx) }
                    })) : undefined}>
                      <CauseActionFields row={ca} onChange={(updated) => setFormData(prev => ({
                        ...prev,
                        materialShortageLoss: { ...prev.materialShortageLoss, causeActions: updateCauseAction(prev.materialShortageLoss.causeActions, caIdx, updated) }
                      }))} />
                    </EntryRow>
                  </div>
                ))}
              </SectionRow>
            );
          })()}

          {/* ══════════ 12. Line Quality Issue ══════════ */}
          {(() => {
            const metric = formData.lineQualityIssues;
            const missed = metric.actual > 0;
            return (
              <SectionRow
                number={12}
                title="Line Quality Issue"
                target="0"
                status={missed ? 'nok' : 'ok'}
  sectionData={formData.lineQualityIssues}
  date={selectedDate}
>
                <EntryRow>
                  <div className="flex items-end gap-2 flex-wrap">
                    <Field label="Actual" className="shrink-0">
                      <Input
                        type="number"
                        value={numVal(metric.actual)}
                        onChange={(e) => {
                          const actual = parseInt(e.target.value) || 0;
                          const causeActions = ensureCauseActionsLength(metric.causeActions, actual, 12);
                          setFormData(prev => ({ ...prev, lineQualityIssues: { ...prev.lineQualityIssues, actual, causeActions } }));
                        }}
                        className={`h-7 text-[10px] font-bold w-[70px] text-center ${missed ? 'border-red-300 bg-red-50 text-red-700' : ''}`}
                      />
                    </Field>
                    <Field label="Target" className="shrink-0">
                      <Input value="0" disabled className="h-7 text-[10px] font-bold w-[60px] text-center bg-gray-50" />
                    </Field>
                  </div>
                </EntryRow>
                {metric.causeActions.map((ca, caIdx) => (
                  <div key={caIdx} className="mt-1 w-full">
                    <CauseActionFields
                      row={ca}
                      onChange={(updated) => setFormData(prev => ({
                        ...prev,
                        lineQualityIssues: { ...prev.lineQualityIssues, causeActions: updateCauseAction(prev.lineQualityIssues.causeActions, caIdx, updated) }
                      }))}
                      showMachine machines={machines}
                    />
                  </div>
                ))}
              </SectionRow>
            );
          })()}

          {/* ══════════ 13. Poor Incoming Material Impact ══════════ */}
          {(() => {
            const metric = formData.incomingMaterialQualityImpact;
            const missed = metric.actual > 0;
            return (
              <SectionRow
                number={13}
                title="Poor Incoming Material Impact"
                target="0"
                status={missed ? 'nok' : 'ok'}
  sectionData={formData.incomingMaterialQualityImpact}
  date={selectedDate}
>
                <EntryRow>
                  <div className="flex items-end gap-2 flex-wrap">
                    <Field label="Actual" className="shrink-0">
                      <Input
                        type="number"
                        value={numVal(metric.actual)}
                        onChange={(e) => {
                          const actual = parseInt(e.target.value) || 0;
                          const causeActions = ensureCauseActionsLength(metric.causeActions, actual, 13);
                          setFormData(prev => ({ ...prev, incomingMaterialQualityImpact: { ...prev.incomingMaterialQualityImpact, actual, causeActions } }));
                        }}
                        className={`h-7 text-[10px] font-bold w-[70px] text-center ${missed ? 'border-red-300 bg-red-50 text-red-700' : ''}`}
                      />
                    </Field>
                    <Field label="Target" className="shrink-0">
                      <Input value="0" disabled className="h-7 text-[10px] font-bold w-[60px] text-center bg-gray-50" />
                    </Field>
                  </div>
                </EntryRow>
                {metric.causeActions.map((ca, caIdx) => (
                  <div key={caIdx} className="mt-1 w-full">
                    <CauseActionFields
                      row={ca}
                      onChange={(updated) => setFormData(prev => ({
                        ...prev,
                        incomingMaterialQualityImpact: { ...prev.incomingMaterialQualityImpact, causeActions: updateCauseAction(prev.incomingMaterialQualityImpact.causeActions, caIdx, updated) }
                      }))}
                      showSupplier suppliers={suppliers}
                    />
                  </div>
                ))}
              </SectionRow>
            );
          })()}

          {/* ══════════ 14. Unauthorised Absenteeism ══════════ */}
          {(() => {
            const metric = formData.absenteeism;
            const missed = metric.actual > 0;
            return (
              <SectionRow
                number={14}
                title="Unauthorised Absenteeism"
                target="0"
                status={missed ? 'nok' : 'ok'}
  sectionData={formData.absenteeism}
  date={selectedDate}
>
                <EntryRow>
                  <div className="flex items-end gap-2 flex-wrap">
                    <Field label="Actual" className="shrink-0">
                      <Input
                        type="number"
                        value={numVal(metric.actual)}
                        onChange={(e) => {
                          const actual = parseInt(e.target.value) || 0;
                          const causeActions = ensureCauseActionsLength(metric.causeActions, actual, 14);
                          setFormData(prev => ({ ...prev, absenteeism: { ...prev.absenteeism, actual, causeActions } }));
                        }}
                        className={`h-7 text-[10px] font-bold w-[70px] text-center ${missed ? 'border-red-300 bg-red-50 text-red-700' : ''}`}
                      />
                    </Field>
                    <Field label="Target" className="shrink-0">
                      <Input value="0" disabled className="h-7 text-[10px] font-bold w-[60px] text-center bg-gray-50" />
                    </Field>
                  </div>
                </EntryRow>
                {metric.causeActions.map((ca, caIdx) => (
                  <div key={caIdx} className="mt-1 w-full">
                    <CauseActionFields
                      showMachine={true}
                      machines={machines}
                      row={ca}
                      onChange={(updated) => setFormData(prev => ({
                        ...prev,
                        absenteeism: { ...prev.absenteeism, causeActions: updateCauseAction(prev.absenteeism.causeActions, caIdx, updated) }
                      }))}
                    />
                  </div>
                ))}
              </SectionRow>
            );
          })()}

          {/* ══════════ 15. Machine Breakdown ══════════ */}
          {(() => {
            const metric = formData.machineBreakdown;
            const missed = metric.actual > 30;
            return (
              <SectionRow
                number={15}
                title="Machine Breakdown"
                target="30 min max"
                status={metric.actual === 0 ? 'na' : (missed ? 'nok' : 'ok')}
                onAdd={() => setFormData(prev => ({
                  ...prev,
                  machineBreakdown: { ...prev.machineBreakdown, causeActions: [...prev.machineBreakdown.causeActions, emptyCauseAction(15)] }
                }))}
                sectionData={formData.machineBreakdown}
                date={selectedDate}
              >
                <EntryRow>
                  <div className="flex items-end gap-2 flex-wrap">
                    <Field label="Actual (min)" className="shrink-0">
                      <Input
                        type="number"
                        value={numVal(metric.actual)}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          machineBreakdown: { ...prev.machineBreakdown, actual: parseFloat(e.target.value) || 0 }
                        }))}
                        className={`h-7 text-[10px] font-bold w-[70px] text-center ${missed ? 'border-red-300 bg-red-50 text-red-700' : ''}`}
                      />
                    </Field>
                    <Field label="Target" className="shrink-0">
                      <Input value="30 min" disabled className="h-7 text-[10px] font-bold w-[65px] text-center bg-gray-50" />
                    </Field>
                    
                    {metric.actual > 0 && metric.actual <= 30 && (
                      <Field label="Machine" className="shrink-0">
                        <Select 
                          value={metric.causeActions[0]?.machineId || ''} 
                          onValueChange={(v) => {
                            const updatedCA = [...metric.causeActions];
                            if (updatedCA.length === 0) updatedCA.push(emptyCauseAction(15));
                            updatedCA[0] = { ...updatedCA[0], machineId: v };
                            setFormData(prev => ({
                              ...prev,
                              machineBreakdown: { ...prev.machineBreakdown, causeActions: updatedCA }
                            }));
                          }}
                        >
                          <SelectTrigger className="h-7 text-[10px] font-semibold w-[100px]">
                            <SelectValue placeholder="Machine" />
                          </SelectTrigger>
                          <SelectContent>
                            {machines.map(m => (
                              <SelectItem key={m.id} value={m.id}>{m.code}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>
                    )}
                  </div>
                </EntryRow>
                
                {missed && metric.causeActions.length === 0 && (() => {
                  setFormData(prev => ({ ...prev, machineBreakdown: { ...prev.machineBreakdown, causeActions: [emptyCauseAction(15)] } }));
                  return null;
                })()}
                {missed && metric.causeActions.map((ca, caIdx) => (
                  <div key={caIdx} className="mt-1 w-full">
                    <EntryRow onRemove={metric.causeActions.length > 1 ? () => setFormData(prev => ({
                      ...prev,
                      machineBreakdown: { ...prev.machineBreakdown, causeActions: prev.machineBreakdown.causeActions.filter((_, i) => i !== caIdx) }
                    })) : undefined}>
                      <CauseActionFields
                        row={ca}
                        onChange={(updated) => setFormData(prev => ({
                          ...prev,
                          machineBreakdown: { ...prev.machineBreakdown, causeActions: updateCauseAction(prev.machineBreakdown.causeActions, caIdx, updated) }
                        }))}
                        showMachine machines={machines}
                      />
                    </EntryRow>
                  </div>
                ))}
              </SectionRow>
            );
          })()}

          {/* ══════════ 16. Unit Consumption (KVAH) ══════════ */}
          <SectionRow number={16} title="Unit Consumption (KVAH)" target="—" highlight sectionData={{ electricityKVAH: formData.utilities.electricityKVAH, electricityShift: formData.utilities.electricityShift, cumulativeElectricity: formData.utilities.cumulativeElectricity }} date={selectedDate}>
            <EntryRow>
              <div className="flex items-end gap-2 flex-wrap">
                <Field label={`Cumulative ${lastEntry ? `(Prev: ${lastEntry.utilities.cumulativeElectricity})` : ''}`} className="shrink-0">
                  <Input value={numVal(formData.utilities.cumulativeElectricity)} disabled className="h-7 text-[10px] font-bold bg-emerald-50/50 w-[110px] text-center" />
                </Field>
                <Field label="Shift" className="shrink-0">
                  <Select value={formData.utilities.electricityShift} disabled={isAlreadySaved} onValueChange={(v) => setFormData(prev => ({ ...prev, utilities: { ...prev.utilities, electricityShift: v } }))}>
                    <SelectTrigger className="h-7 text-[10px] font-semibold w-[70px]" disabled={isAlreadySaved}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="AB">AB</SelectItem>
                      <SelectItem value="ABC">ABC</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Reading" className="shrink-0">
                  <Input
                    type="number"
                    value={numVal(formData.utilities.electricityKVAH)}
                    onChange={(e) => setFormData(prev => ({ ...prev, utilities: { ...prev.utilities, electricityKVAH: parseFloat(e.target.value) || 0 } }))}
                    disabled={isAlreadySaved}
                    className="h-7 text-[10px] font-semibold w-[90px]"
                  />
                </Field>
              </div>
            </EntryRow>
          </SectionRow>

          {/* ══════════ 17. Diesel Consumption ══════════ */}
          <SectionRow number={17} title="Diesel Consumption (LTR)" target="0" highlight sectionData={{ dieselLTR: formData.utilities.dieselLTR, dieselShift: formData.utilities.dieselShift, cumulativeDiesel: formData.utilities.cumulativeDiesel }} date={selectedDate}>
            <EntryRow>
              <div className="flex items-end gap-2 flex-wrap">
                <Field label={`Cumulative ${lastEntry ? `(Prev: ${lastEntry.utilities.cumulativeDiesel})` : ''}`} className="shrink-0">
                  <Input value={numVal(formData.utilities.cumulativeDiesel)} disabled className="h-7 text-[10px] font-bold bg-emerald-50/50 w-[110px] text-center" />
                </Field>
                <Field label="Shift" className="shrink-0">
                  <Select value={formData.utilities.dieselShift} disabled={isAlreadySaved} onValueChange={(v) => setFormData(prev => ({ ...prev, utilities: { ...prev.utilities, dieselShift: v } }))}>
                    <SelectTrigger className="h-7 text-[10px] font-semibold w-[70px]" disabled={isAlreadySaved}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="AB">AB</SelectItem>
                      <SelectItem value="ABC">ABC</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Reading" className="shrink-0">
                  <Input
                    type="number"
                    value={numVal(formData.utilities.dieselLTR)}
                    onChange={(e) => setFormData(prev => ({ ...prev, utilities: { ...prev.utilities, dieselLTR: parseFloat(e.target.value) || 0 } }))}
                    disabled={isAlreadySaved}
                    className="h-7 text-[10px] font-semibold w-[90px]"
                  />
                </Field>
              </div>
            </EntryRow>
          </SectionRow>

          {/* ══════════ 18. Power Factor ══════════ */}
<SectionRow
  number={18}
  title="Power Factor"
  target="95–99"
  sectionData={{ powerFactor: formData.utilities.powerFactor }}
  date={selectedDate}
  status={
    formData.utilities.powerFactor >= 95
      ? 'ok'
      : formData.utilities.powerFactor === 0
      ? 'na'
      : 'nok'
  }
>
            <EntryRow>
              <div className="flex items-end gap-2 flex-wrap">
                <Field label="Value (0-100)" className="shrink-0">
                  <Input
                    type="number" min={0} max={100}
                    value={numVal(formData.utilities.powerFactor)}
                    onChange={(e) => {
                      const val = clampPct(parseFloat(e.target.value) || 0);
                      setFormData(prev => ({ ...prev, utilities: { ...prev.utilities, powerFactor: val } }));
                    }}
                    className={`h-7 text-[10px] font-bold w-[70px] text-center ${formData.utilities.powerFactor > 0 && formData.utilities.powerFactor < 95 ? 'border-red-300 bg-red-50 text-red-700' : ''}`}
                  />
                </Field>
                <div className="mt-5">
                  <StatusBadge ok={formData.utilities.powerFactor >= 95} okText="95-99" nokText="LOW" />
                </div>
              </div>
            </EntryRow>
          </SectionRow>

          {/* ══════════ 19. Sales ══════════ */}
          <SectionRow number={19} title="Sales Values (Last Day & Cumm)" target="—"
            sectionData={formData.sales}
            date={selectedDate}
          >
            <EntryRow>
              <div className="flex items-end gap-2 flex-wrap">
                <Field label="Daily (₹L)" className="shrink-0">
                  <Input
                    type="number"
                    value={numVal(formData.sales.dailySales)}
                    onChange={(e) => setFormData(prev => ({ ...prev, sales: { ...prev.sales, dailySales: parseFloat(e.target.value) || 0 } }))}
                    disabled={isAlreadySaved}
                    className="h-7 text-[10px] font-semibold w-[80px]"
                  />
                </Field>
<Field
  label={`Cumulative ${lastEntry ? `(Prev: ${formatSalesValue(lastEntry.sales.cumulativeSales)})` : ''}`}
  className="shrink-0"
>
  <Input
    value={formatSalesValue(formData.sales.cumulativeSales)}
    disabled
    className="h-7 text-[10px] font-bold bg-gray-50 w-[110px] text-center"
  />
</Field>
              </div>
            </EntryRow>
          </SectionRow>

          {/* ══════════ 20. Training Hours ══════════ */}
          <SectionRow number={20} title="Training Hours" target="30 mins" highlight
            sectionData={formData.training}
            date={selectedDate}
          >
            <EntryRow>
              <div className="flex items-end gap-2 flex-wrap">
                <Field label={`Cumulative Hrs ${lastEntry ? `(Prev: ${lastEntry.training.cumulativeHours})` : ''}`} className="shrink-0">
                  <Input value={numVal(formData.training.cumulativeHours)} disabled className="h-7 text-[10px] font-bold bg-emerald-50/50 w-[110px] text-center" />
                </Field>
                <Field label="Training Hours" className="shrink-0">
                  <Input
                    type="number"
                    value={numVal(formData.training.dailyHours)}
                    onChange={(e) => setFormData(prev => ({ ...prev, training: { ...prev.training, dailyHours: parseFloat(e.target.value) || 0 } }))}
                    disabled={isAlreadySaved}
                    className="h-7 text-[10px] font-semibold w-[80px]"
                  />
                </Field>
                <Field label="Topic" className="flex-1 min-w-0">
                  <Input
                    value={formData.training.topic}
                    onChange={(e) => setFormData(prev => ({ ...prev, training: { ...prev.training, topic: e.target.value } }))}
                    disabled={isAlreadySaved}
                    className="h-7 text-[10px] font-medium w-full"
                    placeholder="Training topic..."
                  />
                </Field>
              </div>
            </EntryRow>
          </SectionRow>

          {/* ══════════ 21. 1st Pass OK Ratio ══════════ */}
<SectionRow
  number={21}
  title="Last Day 1st Pass OK Ratio"
  target="100%"
  sectionData={{
    firstPassOKRatio: formData.qualityRatios.firstPassOKRatio,
    firstPassCauseActions: formData.qualityRatios.firstPassCauseActions
  }}
  date={selectedDate}
  status={
    formData.qualityRatios.firstPassOKRatio === 0
      ? 'na'
      : formData.qualityRatios.firstPassOKRatio < 100
      ? 'nok'
      : 'ok'
  }
  onAdd={
    formData.qualityRatios.firstPassOKRatio > 0 &&
    formData.qualityRatios.firstPassOKRatio < 100
      ? () =>
          setFormData(prev => ({
            ...prev,
            qualityRatios: {
              ...prev.qualityRatios,
              firstPassCauseActions: [
                ...prev.qualityRatios.firstPassCauseActions,
                emptyCauseAction(21)
              ]
            }
          }))
      : undefined
  }
>
            <EntryRow>
              <div className="flex items-end gap-2 flex-wrap">
                <Field label="Actual %" className="shrink-0">
                  <Input
                    type="number" min={0} max={100}
                    value={numVal(formData.qualityRatios.firstPassOKRatio)}
                    onChange={(e) => {
                      const val = clampPct(parseFloat(e.target.value) || 0);
                      setFormData(prev => ({ ...prev, qualityRatios: { ...prev.qualityRatios, firstPassOKRatio: val } }));
                    }}
                    className={`h-7 text-[10px] font-bold w-[70px] text-center ${formData.qualityRatios.firstPassOKRatio > 0 && formData.qualityRatios.firstPassOKRatio < 100 ? 'border-red-300 bg-red-50 text-red-700' : ''}`}
                  />
                </Field>
              </div>
            </EntryRow>
            {formData.qualityRatios.firstPassOKRatio > 0 && formData.qualityRatios.firstPassOKRatio < 100 && (
              <>
                {formData.qualityRatios.firstPassCauseActions.length === 0 && (() => {
                  setFormData(prev => ({ ...prev, qualityRatios: { ...prev.qualityRatios, firstPassCauseActions: [emptyCauseAction(21)] } }));
                  return null;
                })()}
                {formData.qualityRatios.firstPassCauseActions.map((ca, caIdx) => (
                  <div key={caIdx} className="mt-1 w-full">
                    <EntryRow onRemove={formData.qualityRatios.firstPassCauseActions.length > 1 ? () => setFormData(prev => ({
                      ...prev,
                      qualityRatios: { ...prev.qualityRatios, firstPassCauseActions: prev.qualityRatios.firstPassCauseActions.filter((_, i) => i !== caIdx) }
                    })) : undefined}>
                      <CauseActionFields
                        row={ca}
                        onChange={(updated) => setFormData(prev => ({
                          ...prev,
                          qualityRatios: { ...prev.qualityRatios, firstPassCauseActions: updateCauseAction(prev.qualityRatios.firstPassCauseActions, caIdx, updated) }
                        }))}
                      />
                    </EntryRow>
                  </div>
                ))}
              </>
            )}
          </SectionRow>

          {/* ══════════ 22. 1st Pass OK Ratio - PDI ══════════ */}
          <SectionRow
            number={22}
            title="Last Day 1st Pass OK Ratio - PDI"
            target="100%"
            status={formData.qualityRatios.pdiRatio === 0 ? 'na' : (formData.qualityRatios.pdiRatio < 100 ? 'nok' : 'ok')}
          
                sectionData={{ pdiRatio: formData.qualityRatios.pdiRatio, pdiCauseActions: formData.qualityRatios.pdiCauseActions }}
                date={selectedDate}
              >
            <EntryRow>
              <div className="flex items-end gap-2 flex-wrap">
                <Field label="Actual %" className="shrink-0">
                  <Input
                    type="number" min={0} max={100}
                    value={numVal(formData.qualityRatios.pdiRatio)}
                    onChange={(e) => {
                      const val = clampPct(parseFloat(e.target.value) || 0);
                      setFormData(prev => ({ ...prev, qualityRatios: { ...prev.qualityRatios, pdiRatio: val } }));
                    }}
                    className={`h-7 text-[10px] font-bold w-[70px] text-center ${formData.qualityRatios.pdiRatio > 0 && formData.qualityRatios.pdiRatio < 100 ? 'border-red-300 bg-red-50 text-red-700' : ''}`}
                  />
                </Field>
              </div>
            </EntryRow>
          </SectionRow>

          {/* ══════════ 23. PDI Issue — auto-toggle from #22 ══════════ */}
          {(() => {
            const data = formData.pdiIssues;
            const shouldShowCause = formData.qualityRatios.pdiRatio > 0 && formData.qualityRatios.pdiRatio < 100;
            return (
              <SectionRow
                number={23}
                title="Last Day PDI Issue"
                target="0"
                status={shouldShowCause ? 'nok' : 'ok'}
                onAdd={() => {
                  trimSupplierRejections();
                  setFormData(prev => ({
                    ...prev,
                    pdiIssues: { ...prev.pdiIssues, causeActions: [...prev.pdiIssues.causeActions, emptyCauseAction(23)] }
                  }));
                }}
                sectionData={formData.pdiIssues}
                date={selectedDate}
              >
                <EntryRow>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={shouldShowCause}
                      onCheckedChange={(v) => {
                        trimSupplierRejections();
                        setFormData(prev => ({ ...prev, pdiIssues: { ...prev.pdiIssues, hasIssue: v } }));
                      }}
                    />
                    <span className={`text-[9px] font-extrabold ${shouldShowCause ? 'text-red-600' : 'text-emerald-600'}`}>
                      {shouldShowCause ? 'YES' : 'NO'}
                    </span>
                    {shouldShowCause && (
                      <span className="text-[9px] text-amber-600 italic font-medium">← auto from #22</span>
                    )}
                  </div>
                </EntryRow>
                {(shouldShowCause) && data.causeActions.length === 0 && (() => {
                  setFormData(prev => ({ ...prev, pdiIssues: { ...prev.pdiIssues, causeActions: [emptyCauseAction(23)] } }));
                  return null;
                })()}
                {(shouldShowCause) && data.causeActions.map((ca, caIdx) => (
                  <div key={caIdx} className="mt-1 w-full">
                    <EntryRow onRemove={data.causeActions.length > 1 ? () => setFormData(prev => ({
                      ...prev,
                      pdiIssues: { ...prev.pdiIssues, causeActions: prev.pdiIssues.causeActions.filter((_, i) => i !== caIdx) }
                    })) : undefined}>
                      <CauseActionFields row={ca} onChange={(updated) => setFormData(prev => ({
                        ...prev,
                        pdiIssues: { ...prev.pdiIssues, causeActions: updateCauseAction(prev.pdiIssues.causeActions, caIdx, updated) }
                      }))} />
                    </EntryRow>
                  </div>
                ))}
              </SectionRow>
            );
          })()}

          {/* ══════════ 24. Supplier Rejection — smart trim ══════════ */}
<SectionRow
  number={24}
  title="Last Day Supplier Rejection"
  target="0 PPM"
  sectionData={{
    supplierRejectionCount: formData.supplierRejectionCount,
    supplierRejections: formData.supplierRejections
  }}
  date={selectedDate}
  status={formData.supplierRejectionCount === 0 ? 'nok' : 'ok'}
>
            <EntryRow>
              <div className="flex items-end gap-2 flex-wrap">
                <Field label="Quantity" className="shrink-0">
                  <Input
                    type="number"
                    value={numVal(formData.supplierRejectionCount)}
                    onChange={(e) => {
                      const count = parseInt(e.target.value) || 0;
                      const rejections: SupplierRejection[] = [];
                      for (let i = 0; i < count; i++) {
                        rejections.push(formData.supplierRejections[i] || { supplierId: '', reason: '' });
                      }
                      setFormData(prev => ({ ...prev, supplierRejectionCount: count, supplierRejections: rejections }));
                    }}
                    className={`h-7 text-[10px] font-bold w-[60px] text-center ${formData.supplierRejectionCount > 0 ? 'border-red-300 bg-red-50 text-red-700' : ''}`}
                  />
                </Field>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-gray-700 hover:text-amber-600 hover:bg-amber-50"
                  onClick={trimSupplierRejections}
                  title="Cleanup empty rows"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </EntryRow>
            {formData.supplierRejections.map((entry, idx) => (
              <EntryRow key={idx} className="ml-2 mt-1">
                <div className="flex items-end gap-2 flex-wrap w-full">
                  <Field label="Supplier" className="shrink-0">
                    <Select value={entry.supplierId} onValueChange={(v) => {
                      const updated = [...formData.supplierRejections];
                      updated[idx] = { ...entry, supplierId: v };
                      setFormData(prev => ({ ...prev, supplierRejections: updated }));
                    }}>
                      <SelectTrigger className="h-7 text-[10px] font-semibold w-[110px]">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.filter(s => s.isActive).map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Reason" className="flex-1 min-w-0">
                    <Input
                      value={entry.reason}
                      onChange={(e) => {
                        const updated = [...formData.supplierRejections];
                        updated[idx] = { ...entry, reason: e.target.value };
                        setFormData(prev => ({ ...prev, supplierRejections: updated }));
                      }}
                      className="h-7 text-[10px] font-medium border-red-200 bg-red-50/30 w-full"
                      placeholder="Rejection reason..."
                    />
                  </Field>
                </div>
              </EntryRow>
            ))}
          </SectionRow>

          {/* ══════════ 25. Field Complaints ══════════ */}
          {(() => {
            const data = formData.fieldComplaints;
            return (
              <SectionRow
                number={25}
                title="Last Day Field Complaints / Issues"
                target="0 Nos"
                status={data.hasIssue ? 'nok' : 'ok'}
                onAdd={() => {
                  trimSupplierRejections();
                  setFormData(prev => ({
                    ...prev,
                    fieldComplaints: { ...prev.fieldComplaints, causeActions: [...prev.fieldComplaints.causeActions, emptyCauseAction(25)] }
                  }));
                }}
                sectionData={formData.fieldComplaints}
                date={selectedDate}
              >
                <EntryRow>
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={data.hasIssue} 
                      onCheckedChange={(v) => {
                        trimSupplierRejections();
                        setFormData(prev => ({ ...prev, fieldComplaints: { ...prev.fieldComplaints, hasIssue: v } }));
                      }} 
                    />
                    <span className={`text-[9px] font-extrabold ${data.hasIssue ? 'text-red-600' : 'text-emerald-600'}`}>{data.hasIssue ? 'YES' : 'NO'}</span>
                  </div>
                </EntryRow>
                {data.hasIssue && data.causeActions.length === 0 && (() => {
                  setFormData(prev => ({ ...prev, fieldComplaints: { ...prev.fieldComplaints, causeActions: [emptyCauseAction(25)] } }));
                  return null;
                })()}
                {data.hasIssue && data.causeActions.map((ca, caIdx) => (
                  <div key={caIdx} className="mt-1 w-full">
                    <EntryRow onRemove={data.causeActions.length > 1 ? () => setFormData(prev => ({
                      ...prev,
                      fieldComplaints: { ...prev.fieldComplaints, causeActions: prev.fieldComplaints.causeActions.filter((_, i) => i !== caIdx) }
                    })) : undefined}>
                      <CauseActionFields row={ca} onChange={(updated) => setFormData(prev => ({
                        ...prev,
                        fieldComplaints: { ...prev.fieldComplaints, causeActions: updateCauseAction(prev.fieldComplaints.causeActions, caIdx, updated) }
                      }))} />
                    </EntryRow>
                  </div>
                ))}
              </SectionRow>
            );
          })()}

          {/* ══════════ 26. SOP Non-adherence ══════════ */}
          {(() => {
            const data = formData.sopNonAdherence;
            return (
              <SectionRow
                number={26}
                title="SOP Non-adherence (LPA Audit)"
                target="—"
                status={data.hasIssue ? 'nok' : 'ok'}
                onAdd={() => setFormData(prev => ({
                  ...prev,
                  sopNonAdherence: { ...prev.sopNonAdherence, causeActions: [...prev.sopNonAdherence.causeActions, emptyCauseAction(26)] }
                }))}
                sectionData={formData.sopNonAdherence}
                date={selectedDate}
              >
                <EntryRow>
                  <div className="flex items-center gap-2">
                    <Switch checked={data.hasIssue} onCheckedChange={(v) => setFormData(prev => ({ ...prev, sopNonAdherence: { ...prev.sopNonAdherence, hasIssue: v } }))} />
                    <span className={`text-[9px] font-extrabold ${data.hasIssue ? 'text-red-600' : 'text-emerald-600'}`}>{data.hasIssue ? 'YES' : 'NO'}</span>
                  </div>
                </EntryRow>
                {data.hasIssue && data.causeActions.length === 0 && (() => {
                  setFormData(prev => ({ ...prev, sopNonAdherence: { ...prev.sopNonAdherence, causeActions: [emptyCauseAction(26)] } }));
                  return null;
                })()}
                {data.hasIssue && data.causeActions.map((ca, caIdx) => (
                  <div key={caIdx} className="mt-1 w-full">
                    <EntryRow onRemove={data.causeActions.length > 1 ? () => setFormData(prev => ({
                      ...prev,
                      sopNonAdherence: { ...prev.sopNonAdherence, causeActions: prev.sopNonAdherence.causeActions.filter((_, i) => i !== caIdx) }
                    })) : undefined}>
                      <CauseActionFields
                        row={ca}
                        onChange={(updated) => setFormData(prev => ({
                          ...prev,
                          sopNonAdherence: { ...prev.sopNonAdherence, causeActions: updateCauseAction(prev.sopNonAdherence.causeActions, caIdx, updated) }
                        }))}
                        showDepartment departments={departments}
                      />
                    </EntryRow>
                  </div>
                ))}
              </SectionRow>
            );
          })()}

          {/* ══════════ 27. Line Issue / Stop Due to Fixtures ══════════ */}
          {(() => {
            const data = formData.fixtureIssues;
            return (
              <SectionRow
                number={27}
                title="Line Issue / Stop Due to Fixtures"
                target="0"
                status={data.hasIssue ? 'nok' : 'ok'}
                onAdd={() => setFormData(prev => ({
                  ...prev,
                  fixtureIssues: { ...prev.fixtureIssues, causeActions: [...prev.fixtureIssues.causeActions, emptyCauseAction(27)] }
                }))}
                sectionData={formData.fixtureIssues}
                date={selectedDate}
              >
                <EntryRow>
                  <div className="flex items-center gap-2">
                    <Switch checked={data.hasIssue} onCheckedChange={(v) => setFormData(prev => ({ ...prev, fixtureIssues: { ...prev.fixtureIssues, hasIssue: v } }))} />
                    <span className={`text-[9px] font-extrabold ${data.hasIssue ? 'text-red-600' : 'text-emerald-600'}`}>{data.hasIssue ? 'YES' : 'NO'}</span>
                  </div>
                </EntryRow>
                {data.hasIssue && data.causeActions.length === 0 && (() => {
                  setFormData(prev => ({ ...prev, fixtureIssues: { ...prev.fixtureIssues, causeActions: [emptyCauseAction(27)] } }));
                  return null;
                })()}
                {data.hasIssue && data.causeActions.map((ca, caIdx) => (
                  <div key={caIdx} className="mt-1 w-full">
                    <EntryRow onRemove={data.causeActions.length > 1 ? () => setFormData(prev => ({
                      ...prev,
                      fixtureIssues: { ...prev.fixtureIssues, causeActions: prev.fixtureIssues.causeActions.filter((_, i) => i !== caIdx) }
                    })) : undefined}>
                      <CauseActionFields
                        row={ca}
                        onChange={(updated) => setFormData(prev => ({
                          ...prev,
                          fixtureIssues: { ...prev.fixtureIssues, causeActions: updateCauseAction(prev.fixtureIssues.causeActions, caIdx, updated) }
                        }))}
                        showMachine machines={machines}
                      />
                    </EntryRow>
                  </div>
                ))}
              </SectionRow>
            );
          })()}

          {/* ══════════ 28. Pallet / Trolley Issue — conditional dropdowns ══════════ */}
          {(() => {
            const data = formData.palletTrolleyIssues;
            return (
              <SectionRow
                number={28}
                title="Pallet / Trolley Issue (Int. & Ext.)"
                target="0"
                status={data.hasIssue ? 'nok' : 'ok'}
                onAdd={() => setFormData(prev => ({
                  ...prev,
                  palletTrolleyIssues: { ...prev.palletTrolleyIssues, causeActions: [...prev.palletTrolleyIssues.causeActions, emptyCauseAction(28)] }
                }))}
                sectionData={formData.palletTrolleyIssues}
                date={selectedDate}
              >
                <EntryRow>
                  <div className="flex items-center gap-2">
                    <Switch checked={data.hasIssue} onCheckedChange={(v) => setFormData(prev => ({ ...prev, palletTrolleyIssues: { ...prev.palletTrolleyIssues, hasIssue: v } }))} />
                    <span className={`text-[9px] font-extrabold ${data.hasIssue ? 'text-red-600' : 'text-emerald-600'}`}>{data.hasIssue ? 'YES' : 'NO'}</span>
                  </div>
                </EntryRow>
                {data.hasIssue && data.causeActions.length === 0 && (() => {
                  setFormData(prev => ({ ...prev, palletTrolleyIssues: { ...prev.palletTrolleyIssues, causeActions: [emptyCauseAction(28)] } }));
                  return null;
                })()}
                {data.hasIssue && data.causeActions.map((ca, caIdx) => (
                  <div key={caIdx} className="mt-1 w-full">
                    <EntryRow onRemove={data.causeActions.length > 1 ? () => setFormData(prev => ({
                      ...prev,
                      palletTrolleyIssues: { ...prev.palletTrolleyIssues, causeActions: prev.palletTrolleyIssues.causeActions.filter((_, i) => i !== caIdx) }
                    })) : undefined}>
                      <CauseActionFields
                        row={ca}
                        onChange={(updated) => setFormData(prev => ({
                          ...prev,
                          palletTrolleyIssues: { ...prev.palletTrolleyIssues, causeActions: updateCauseAction(prev.palletTrolleyIssues.causeActions, caIdx, updated) }
                        }))}
                        showInternalExternal
                        internalOptions={['Process', 'FG', 'Line Feeding']}
                        showCustomerWhenExternal
                        customers={customers.filter(c => c.isActive)}
                      />
                    </EntryRow>
                  </div>
                ))}
              </SectionRow>
            );
          })()}

          {/* ══════════ 29. Material Shortage Issue ══════════ */}
          {(() => {
            const data = formData.materialShortageIssue;
            const qty = data.quantity || 0;
            return (
              <SectionRow
                number={29}
                title="Material Shortage Issue"
                target="0"
                status={qty 
> 0 ? 'nok' : 'ok'}
                sectionData={formData.materialShortageIssue}
                date={selectedDate}
                showOwner={false}
              >
                <EntryRow>
                  <div className="flex items-end gap-2 flex-wrap">
                    <Field label="Quantity" className="shrink-0">
                      <Input
                        type="number"
                        value={numVal(qty)}
                        onChange={(e) => {
                          const quantity = parseInt(e.target.value) || 0;
                          const causeActions = ensureCauseActionsLength(data.causeActions, quantity, 29);
                          setFormData(prev => ({
                            ...prev,
                            materialShortageIssue: { ...prev.materialShortageIssue, quantity, hasIssue: quantity > 0, causeActions }
                          }));
                        }}
                        className={`h-7 text-[10px] font-bold w-[60px] text-center ${qty > 0 ? 'border-red-300 bg-red-50 text-red-700' : ''}`}
                      />
                    </Field>
                  </div>
                </EntryRow>
                {data.causeActions.map((ca, caIdx) => (
                  <div key={caIdx} className="mt-1 ml-2 w-full">
                    <CauseActionFields
                      row={ca}
                      onChange={(updated) => setFormData(prev => ({
                        ...prev,
                        materialShortageIssue: { ...prev.materialShortageIssue, causeActions: updateCauseAction(prev.materialShortageIssue.causeActions, caIdx, updated) }
                      }))}
                    />
                  </div>
                ))}
              </SectionRow>
            );
          })()}

          {/* ══════════ 30. Other Critical Issue ══════════ */}
          {(() => {
            const data = formData.otherCriticalIssue;
            return (
              <SectionRow
                number={30}
                title="Other Critical Issue"
                target="0"
                status={data.hasIssue ? 'nok' : 'ok'}
                onAdd={() => setFormData(prev => ({
                  ...prev,
                  otherCriticalIssue: { ...prev.otherCriticalIssue, causeActions: [...prev.otherCriticalIssue.causeActions, emptyCauseAction(30)] }
                }))}
                sectionData={formData.otherCriticalIssue}
                date={selectedDate}
                showOwner={false}
              >
                <EntryRow>
                  <div className="flex items-center gap-2">
                    <Switch checked={data.hasIssue} onCheckedChange={(v) => setFormData(prev => ({ ...prev, otherCriticalIssue: { ...prev.otherCriticalIssue, hasIssue: v } }))} />
                    <span className={`text-[9px] font-extrabold ${data.hasIssue ? 'text-red-600' : 'text-emerald-600'}`}>{data.hasIssue ? 'YES' : 'NO'}</span>
                  </div>
                </EntryRow>
                {data.hasIssue && data.causeActions.length === 0 && (() => {
                  setFormData(prev => ({ ...prev, otherCriticalIssue: { ...prev.otherCriticalIssue, causeActions: [emptyCauseAction(30)] } }));
                  return null;
                })()}
                {data.hasIssue && data.causeActions.map((ca, caIdx) => (
                  <div key={caIdx} className="mt-1 w-full">
                    <EntryRow onRemove={data.causeActions.length > 1 ? () => setFormData(prev => ({
                      ...prev,
                      otherCriticalIssue: { ...prev.otherCriticalIssue, causeActions: prev.otherCriticalIssue.causeActions.filter((_, i) => i !== caIdx) }
                    })) : undefined}>
                      <CauseActionFields row={ca} onChange={(updated) => setFormData(prev => ({
                        ...prev,
                        otherCriticalIssue: { ...prev.otherCriticalIssue, causeActions: updateCauseAction(prev.otherCriticalIssue.causeActions, caIdx, updated) }
                      }))} />
                    </EntryRow>
                  </div>
                ))}
              </SectionRow>
            );
          })()}

          {/* ══════════ 31. Others — Field 1 ══════════ */}
          <SectionRow number={31} title="Others" target="—" sectionData={{ otherField1: formData.otherField1 }} date={selectedDate} showOwner={false}>
            <EntryRow>
              <Field label="Remarks / Notes" className="flex-1 min-w-0">
                <Input
                  value={formData.otherField1}
                  onChange={(e) => setFormData(prev => ({ ...prev, otherField1: e.target.value }))}
                  className="h-7 text-[10px] font-medium w-full"
                  placeholder="Additional notes or remarks..."
                />
              </Field>
            </EntryRow>
          </SectionRow>

          {/* ══════════ 32. Others — Field 2 ══════════ */}
          <SectionRow number={32} title="Others" target="—" sectionData={{ otherField2: formData.otherField2 }} date={selectedDate} showOwner={false}>
            <EntryRow>
              <Field label="Remarks / Notes" className="flex-1 min-w-0">
                <Input
                  value={formData.otherField2}
                  onChange={(e) => setFormData(prev => ({ ...prev, otherField2: e.target.value }))}
                  className="h-7 text-[10px] font-medium w-full"
                  placeholder="Additional notes or remarks..."
                />
              </Field>
            </EntryRow>
          </SectionRow>

        </div>
      </div>

      {/* ═══ Sticky Save Bar ═══ */}
      <div className="sticky bottom-3 mt-3 mx-1 rounded-xl border border-white/20 px-4 py-3 flex justify-between items-center"
        style={{
          background: 'rgba(26, 26, 42, 0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
        }}>
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#C9A962]" />
          <span className="text-white/60 text-xs font-medium">
            {formattedDate}
          </span>
          {draftRestoredAt && (
            <span className="text-[10px] text-[#C9A962]/60 italic">(draft)</span>
          )}
        </div>
        <Button
          onClick={saveEntry}
          disabled={isSaving}
          size="sm"
          className="h-8 text-xs font-semibold px-5"
          style={{
            background: 'linear-gradient(135deg, #C9A962 0%, #e8c97a 100%)',
            color: '#1A1A1A',
            boxShadow: '0 4px 14px rgba(201,169,98,0.4)',
          }}
        >
          <Save className="w-3.5 h-3.5 mr-1.5" />
          {isSaving ? 'Saving...' : 'Save Entry'}
        </Button>
      </div>
    </div>
  );
}
