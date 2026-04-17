import { useState, useEffect } from 'react';
import {
  Save,
  Plus,
  Trash2,
  Calendar,
  Mail,
  User,
  FileText,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useDailyEntry, defaultEntry } from '@/context/DailyEntryContext';
import { useMasterData } from '@/context/MasterDataContext';
import type {
  DailyEntry as DailyEntryType,
  SafetyEntry,
  CustomerRejection,
  OvertimeEntry,
  SupplierRejection,
  // PerformanceMetric,
  CauseActionRow,
  // IssueTracking,
} from '@/types';

/* ─────────────────────── OWNERS ARRAY ─────────────────────── */
const OWNERS: { name: string; email: string }[] = [
  { name: '', email: '' },                                          // 0 unused
  { name: 'Ashish', email: 'ashish.tiwari1@rsbglobal.com' },      // 1
  { name: 'Sudhir', email: 'sudhir.sahoo@rsbglobal.com' },        // 2
  { name: 'Brijesh', email: 'brijesh.singh@rsbglobal.com' },      // 3
  { name: 'Brijesh', email: 'brijesh.singh@rsbglobal.com' },      // 4
  { name: 'Brijesh', email: 'brijesh.singh@rsbglobal.com' },      // 5
  { name: 'Brijesh', email: 'brijesh.singh@rsbglobal.com' },      // 6
  { name: 'Brijesh', email: 'brijesh.singh@rsbglobal.com' },      // 7
  { name: 'OM', email: 'om.chand@rsbglobal.com' },                // 8
  { name: 'Rakesh', email: 'rakesh.pal@rsbglobal.com' },          // 9
  { name: 'OM', email: 'om.chand@rsbglobal.com' },                // 10
  { name: 'Dipti', email: 'dipti.das@rsbglobal.com' },            // 11
  { name: 'Dipti', email: 'dipti.das@rsbglobal.com' },            // 12
  { name: 'Sudhir', email: 'sudhir.sahoo@rsbglobal.com' },        // 13
  { name: 'Ashish', email: 'ashish.tiwari1@rsbglobal.com' },      // 14
  { name: 'Avinash', email: 'avinash.choudhary@rsbglobal.com' },  // 15
  { name: 'Avinash', email: 'avinash.choudhary@rsbglobal.com' },  // 16
  { name: 'Avinash', email: 'avinash.choudhary@rsbglobal.com' },  // 17
  { name: 'Avinash', email: 'avinash.choudhary@rsbglobal.com' },  // 18
  { name: 'Avinash', email: 'avinash.choudhary@rsbglobal.com' },  // 19
  { name: 'Abhishek', email: 'abhishek.pal@rsbglobal.com' },      // 20
  { name: 'OM', email: 'om.chand@rsbglobal.com' },                // 21
  { name: 'Ashish', email: 'ashish.tiwari1@rsbglobal.com' },      // 22
  { name: 'Ashish', email: 'ashish.tiwari1@rsbglobal.com' },      // 23
  { name: 'Sudhir', email: 'sudhir.sahoo@rsbglobal.com' },        // 24
  { name: 'Abhishek', email: 'abhishek.pal@rsbglobal.com' },      // 25
  { name: 'Sudhir', email: 'sudhir.sahoo@rsbglobal.com' },        // 26
  { name: 'Sudhir', email: 'sudhir.sahoo@rsbglobal.com' },        // 27
  { name: 'Vikash', email: 'vikas.kumar@rsbglobal.com' },         // 28
  { name: 'Shantanu', email: 'santanu.singh@rsbglobal.com' },     // 29
  { name: 'Nihar', email: 'nihar.khuntia@rsbglobal.com' },        // 30
  { name: 'Rupesh', email: 'Rupesh.pandey@rsbglobal.com' },       // 31
  { name: 'Dipti', email: 'dipti.das@rsbglobal.com' },            // 32
  { name: 'Manager', email: '' },                                   // 33
];

const getOwner = (n: number) => OWNERS[n] || { name: '', email: '' };

const emptyCauseAction = (ownerIdx?: number): CauseActionRow => ({
  cause: '', action: '', responsible: ownerIdx ? getOwner(ownerIdx).name : '', targetDate: '',
});

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
}

function SectionRow({ number, title, target, status, onAdd, children, highlight, secondNumber }: SectionRowProps) {
  const ownerName = getOwner(number).name;
  const bgClass = highlight
    ? 'bg-emerald-50/30'
    : number % 2 === 0 ? 'bg-gray-50/30' : 'bg-white';

  return (
    <div className={`flex items-start gap-3 px-3 py-2.5 border-b border-[#E8E8E8] transition-all duration-200 hover:bg-blue-50/20 ${bgClass}`}>
      {/* Number + Title + Target */}
      <div className="flex w-[19%] items-center gap-2 min-w-[220px] py-3 bg-[#C9A962]">
        <div className="flex ml-1 items-center gap-0.5 shrink-0">
          <span className="text-[10px] font-bold text-white bg-[#1A1A1A] rounded w-5 h-5 flex items-center justify-center">
            {number}
          </span>
          {secondNumber && (
            <>
              <span className="text-[8px] text-gray-400">/</span>
              <span className="text-[10px] font-bold text-white bg-[#1A1A1A] rounded w-5 h-5 flex items-center justify-center">
                {secondNumber}
              </span>
            </>
          )}
        </div>
        <div className="flex flex-col">
          <h3 className="text-[11px] font-bold text-[#1A1A1A] leading-tight">
            {title}
          </h3>
          {target && (
            <span className="text-[9px] text-gray-700 font-medium">Target: {target}</span>
          )}
        </div>
      </div>

      {/* Status indicator */}
      <div className="pt-1.5 min-w-[20px]">
        {status === 'ok' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
        {status === 'nok' && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
      </div>

      {/* Inputs area */}
      <div className="flex-1 min-w-0">
        {children}
      </div>

      {/* Action Icons */}
      <div className="flex items-center gap-1 pt-0.5 min-w-[80px] justify-end">
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
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-gray-300 hover:text-gray-500 hover:bg-gray-100"
          title={`Owner: ${ownerName}`}
        >
          <User className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-gray-300 hover:text-[#C9A962] hover:bg-[#C9A962]/10"
          onClick={() => toast.success(`Email sent to ${ownerName}`)}
          title="Notify"
        >
          <Mail className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

interface EntryRowProps {
  children: React.ReactNode;
  onRemove?: () => void;
  className?: string;
}

function EntryRow({ children, onRemove, className = "" }: EntryRowProps) {
  return (
    <div className={`group flex items-center gap-2 mb-1.5 last:mb-0 ${className}`}>
      <div className="flex-1 flex items-center gap-2 flex-wrap">
        {children}
      </div>
      {onRemove && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-red-300 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 hover:bg-red-50 shrink-0"
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
    <div className={`flex flex-col gap-0.5 min-w-[80px] ${className}`}>
      <span className="text-[9px] uppercase font-bold text-gray-400 px-0.5 tracking-wider">{label}</span>
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

/* ─── Number input helper: removes leading zeros ─── */
const numVal = (v: number): string | number => (v === 0 ? '' : v);

/* ─── Cause/Action fields with optional dropdowns ─── */
function CauseActionFields({
  row, onChange, machines, suppliers, departments,
  showMachine, showSupplier, showDepartment, showInternalExternal,
  compactResponsible,
}: {
  row: CauseActionRow;
  onChange: (updated: CauseActionRow) => void;
  machines?: { id: string; name: string }[];
  suppliers?: { id: string; name: string }[];
  departments?: { id: string; name: string }[];
  showMachine?: boolean;
  showSupplier?: boolean;
  showDepartment?: boolean;
  showInternalExternal?: boolean;
  compactResponsible?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-300 flex-wrap">
      {showMachine && machines && (
        <Field label="Machine" className="min-w-[100px]">
          <Select value={row.machineId || ''} onValueChange={(v) => onChange({ ...row, machineId: v })}>
            <SelectTrigger className="h-7 text-[10px] font-semibold w-[100px]">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {machines.map(m => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      )}
      {showSupplier && suppliers && (
        <Field label="Supplier" className="min-w-[100px]">
          <Select value={row.supplierId || ''} onValueChange={(v) => onChange({ ...row, supplierId: v })}>
            <SelectTrigger className="h-7 text-[10px] font-semibold w-[100px]">
              <SelectValue placeholder="Select" />
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
        <Field label="Department" className="min-w-[100px]">
          <Select value={row.departmentId || ''} onValueChange={(v) => onChange({ ...row, departmentId: v })}>
            <SelectTrigger className="h-7 text-[10px] font-semibold w-[100px]">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {departments.map(d => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      )}
      {showInternalExternal && (
        <Field label="Type" className="min-w-[90px]">
          <Select value={row.internalExternal || ''} onValueChange={(v) => onChange({ ...row, internalExternal: v as any })}>
            <SelectTrigger className="h-7 text-[10px] font-semibold w-[90px]">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="internal">Internal</SelectItem>
              <SelectItem value="external">External</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      )}
      <Field label="Cause" className="min-w-[120px] flex-1">
        <Input
          value={row.cause}
          onChange={(e) => onChange({ ...row, cause: e.target.value })}
          className="h-7 text-[10px] font-medium border-red-200 bg-red-50/30 focus:ring-1 focus:ring-red-300"
          placeholder="Why?"
        />
      </Field>
      <Field label="Action" className="min-w-[120px] flex-1">
        <Input
          value={row.action}
          onChange={(e) => onChange({ ...row, action: e.target.value })}
          className="h-7 text-[10px] font-medium border-amber-200 bg-amber-50/30 focus:ring-1 focus:ring-amber-300"
          placeholder="Corrective action"
        />
      </Field>
      <Field label="Resp." className={compactResponsible ? "min-w-[60px] max-w-[70px]" : "min-w-[80px]"}>
        <Input
          value={row.responsible}
          onChange={(e) => onChange({ ...row, responsible: e.target.value })}
          className="h-7 text-[10px] font-medium"
          placeholder="Who?"
        />
      </Field>
      <Field label="Date" className="min-w-[100px]">
        <Input
          type="date"
          value={row.targetDate}
          onChange={(e) => onChange({ ...row, targetDate: e.target.value })}
          className="h-7 text-[10px] font-medium"
        />
      </Field>
    </div>
  );
}

/* ═══════════════════════ MAIN COMPONENT ═══════════════════════ */

export default function DailyEntry() {
  const { saveEntry } = useDailyEntry();
  const { partTypes, customers, suppliers, machines, departments } = useMasterData();

  const [formData, setFormData] = useState<DailyEntryType>({ ...defaultEntry });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-calculate cumulative OT
  useEffect(() => {
    const yesterdayOT = formData.overtime.reduce((sum, ot) => sum + ot.hours, 0);
    const todayCumulative = formData.cumulativeOT.previousTotal + yesterdayOT;
    setFormData(prev => ({
      ...prev,
      cumulativeOT: { ...prev.cumulativeOT, yesterdayOT, todayCumulative }
    }));
  }, [formData.overtime, formData.cumulativeOT.previousTotal]);

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      saveEntry(formData);
      toast.success('Entry saved successfully!');
    } catch (error) {
      toast.error('Failed to save entry');
    } finally {
      setIsSubmitting(false);
    }
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

  return (
    <div className="space-y-3 animate-fade-in max-w-full mx-auto">
      {/* ═══ Header ═══ */}
      <Card className="border-[#E5E5E5] shadow-sm">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#C9A962]" />
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-36 h-8 text-xs font-semibold border-[#D4D4D4]"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleSave}
                disabled={isSubmitting}
                size="sm"
                className="bg-[#C9A962] text-[#1A1A1A] hover:bg-[#B8A164] h-8 text-xs"
              >
                <Save className="w-3.5 h-3.5 mr-1.5" />
                {isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ═══ Main Table ═══ */}
      <Card className="border-[#E5E5E5] shadow-sm overflow-hidden">
        <CardHeader className="bg-[#1A1A1A] text-white px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-[#C9A962]" />
              <CardTitle className="text-xs font-semibold text-white">
                Daily Record — {new Date(formData.date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
              </CardTitle>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-gray-400">
              <span>SI No</span>
              <span>Check Points</span>
              <span>Owner</span>
              <span>Target</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* ══════════ 1. Accident / Incident / Near Miss ══════════ */}
          <SectionRow
            number={1}
            title="Accident / Incident / Near Miss"
            target="0"
            status={hasSafetyIssue ? 'nok' : 'ok'}
            onAdd={() => {
              const newEntry: SafetyEntry = {
                type: 'accidents', incidentType: 'others', count: 0,
                causeActions: [],
              };
              setFormData(prev => ({ ...prev, safety: [...prev.safety, newEntry] }));
            }}
          >
            {(formData.safety.length === 0 ? [{
              type: 'accidents', incidentType: 'others', count: 0,
              causeActions: [],
            } as SafetyEntry] : formData.safety).map((entry, idx) => {
              return (
                <div key={idx}>
                  <EntryRow onRemove={formData.safety.length > 0 ? () => {
                    setFormData(prev => ({ ...prev, safety: prev.safety.filter((_, i) => i !== idx) }));
                  } : undefined}>
                    <Field label="Type">
                      <Select
                        value={entry.type}
                        onValueChange={(v) => {
                          const updated = [...formData.safety];
                          const tIdx = formData.safety.length === 0 ? 0 : idx;
                          updated[tIdx] = { ...entry, type: v as any };
                          setFormData(prev => ({ ...prev, safety: updated }));
                        }}
                      >
                        <SelectTrigger className="h-7 text-[10px] font-semibold w-[100px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="accidents">Accident</SelectItem>
                          <SelectItem value="incidents">Incident</SelectItem>
                          <SelectItem value="nearMiss">Near Miss</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Incident">
                      <Select
                        value={entry.incidentType}
                        onValueChange={(v) => {
                          const updated = [...formData.safety];
                          const tIdx = formData.safety.length === 0 ? 0 : idx;
                          updated[tIdx] = { ...entry, incidentType: v as any };
                          setFormData(prev => ({ ...prev, safety: updated }));
                        }}
                      >
                        <SelectTrigger className="h-7 text-[10px] font-semibold w-[90px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="machine">Machine</SelectItem>
                          <SelectItem value="others">Others</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Count">
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
                        className={`h-7 text-[10px] font-bold w-[60px] text-center ${entry.count > 0 ? 'border-red-300 bg-red-50 text-red-700' : ''}`}
                      />
                    </Field>
                  </EntryRow>
                  {/* Show N cause/action rows based on count */}
                  {entry.count > 0 && entry.causeActions.map((ca, caIdx) => (
                    <div key={caIdx} className="ml-4 mt-1">
                      <CauseActionFields
                        row={ca}
                        onChange={(updated) => {
                          const newCauseActions = updateCauseAction(entry.causeActions, caIdx, updated);
                          const updatedSafety = [...formData.safety];
                          const tIdx = formData.safety.length === 0 ? 0 : idx;
                          updatedSafety[tIdx] = { ...entry, causeActions: newCauseActions };
                          setFormData(prev => ({ ...prev, safety: updatedSafety }));
                        }}
                      />
                    </div>
                  ))}
                </div>
              );
            })}
          </SectionRow>

          {/* ══════════ 2. Customer Rejection ══════════ */}
          <SectionRow
            number={2}
            title="Customer Rejection (TML | ALW | PNR)"
            target="0 PPM"
            status={hasCustomerRejection ? 'nok' : 'ok'}
          >
            <EntryRow>
              <Field label="Count">
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
                  className={`h-7 text-[10px] font-bold w-[60px] text-center ${formData.customerRejectionCount > 0 ? 'border-red-300 bg-red-50 text-red-700' : ''}`}
                />
              </Field>
            </EntryRow>
            {formData.customerRejections.map((rejection, idx) => (
              <EntryRow key={idx} className="ml-4 mt-1">
                <Field label="Customer">
                  <Select
                    value={rejection.customerId}
                    onValueChange={(v) => {
                      const updated = [...formData.customerRejections];
                      updated[idx] = { ...rejection, customerId: v };
                      setFormData(prev => ({ ...prev, customerRejections: updated }));
                    }}
                  >
                    <SelectTrigger className="h-7 text-[10px] font-semibold w-[120px]">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.filter(c => c.isActive).map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Reason" className="flex-1 min-w-[200px]">
                  <Input
                    value={rejection.reason}
                    onChange={(e) => {
                      const updated = [...formData.customerRejections];
                      updated[idx] = { ...rejection, reason: e.target.value };
                      setFormData(prev => ({ ...prev, customerRejections: updated }));
                    }}
                    className="h-7 text-[10px] font-medium border-red-200 bg-red-50/30"
                    placeholder="Enter rejection reason..."
                  />
                </Field>
              </EntryRow>
            ))}
          </SectionRow>

          {/* ══════════ 3. Last Day Production ══════════ */}
          <SectionRow number={3} title="Last Day Production" target="—">
            <div className="flex border border-[#E5E5E5] rounded overflow-visible max-w-[900px]">
              {[
                ...partTypes.map((p, idx) => ({ label: p.name, key: idx })),
                { label: 'Total', key: 'total' }
              ].map((col, idx, allFields) => {
                const isTotal = col.key === 'total';
                let targetValue = 0;
                let actualValue = 0;
                if (isTotal) {
                  targetValue = partTypes.reduce((sum, _, i) => sum + (formData.production[i]?.target || 0), 0);
                  actualValue = partTypes.reduce((sum, _, i) => sum + (formData.production[i]?.actual || 0), 0);
                } else {
                  targetValue = formData.production[col.key as number]?.target || 0;
                  actualValue = formData.production[col.key as number]?.actual || 0;
                }
                return (
                  <div key={col.label} className={`flex-1 min-w-[120px] flex flex-col ${idx < allFields.length - 1 ? 'border-r border-[#E5E5E5]' : ''}`}>
                    <div className="text-[10px] font-bold text-center py-1 bg-gray-50 border-b border-[#E5E5E5] text-[#1A1A1A]">
                      {col.label}
                    </div>
                    <div className="flex">
                      <div className="flex-1 border-r border-[#E5E5E5]">
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
                          className={`h-8 border-0 border-b-0 rounded-none text-center text-[10px] font-medium shadow-none focus:ring-0 ${isTotal ? 'bg-[#F9FAFB] font-bold text-gray-900' : ''}`}
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
                          className={`h-8 border-0 border-b-0 rounded-none text-center text-[10px] font-medium shadow-none focus:ring-0 ${isTotal ? 'bg-[#F9FAFB] font-bold text-emerald-700' : ''}`}
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
          >
            <EntryRow>
              <Field label="Front (min)">
                <Input
                  type="number"
                  step="0.01"
                  value={numVal(formData.cycleTime.front)}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    cycleTime: { ...prev.cycleTime, front: parseFloat(e.target.value) || 0 }
                  }))}
                  className="h-7 text-[10px] font-semibold w-[70px]"
                />
              </Field>
              <Field label="Rear (min)">
                <Input
                  type="number"
                  step="0.01"
                  value={numVal(formData.cycleTime.rear)}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    cycleTime: { ...prev.cycleTime, rear: parseFloat(e.target.value) || 0 }
                  }))}
                  className="h-7 text-[10px] font-semibold w-[70px]"
                />
              </Field>
              <Field label="Total">
                <Input
                  value={cycleTimeSum.toFixed(2)}
                  disabled
                  className={`h-7 text-[10px] font-bold w-[60px] text-center ${isCycleTimeHigh ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}
                />
              </Field>
            </EntryRow>
            {/* Show cause section when front+rear > 2 */}
            {isCycleTimeHigh && formData.cycleTime.causeActions.length === 0 && (() => {
              setFormData(prev => ({ ...prev, cycleTime: { ...prev.cycleTime, causeActions: [emptyCauseAction(4)] } }));
              return null;
            })()}
            {isCycleTimeHigh && formData.cycleTime.causeActions.map((ca, caIdx) => (
              <div key={caIdx} className="mt-1">
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
          >
            <EntryRow>
              <Field label="Today">
                <Input
                  type="number"
                  step="0.01"
                  value={numVal(formData.perManPerDay.actual)}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    perManPerDay: { ...prev.perManPerDay, actual: parseFloat(e.target.value) || 0 }
                  }))}
                  className={`h-7 text-[10px] font-bold w-[60px] text-center ${isPerManLow ? 'border-red-300 bg-red-50 text-red-700' : ''}`}
                />
              </Field>
              <Field label="Target">
                <Input value="6" disabled className="h-7 text-[10px] font-bold w-[50px] text-center bg-gray-50" />
              </Field>
            </EntryRow>
            {/* Show cause sections when actual < 6 */}
            {isPerManLow && formData.perManPerDay.causeActions.map((ca, caIdx) => (
              <div key={caIdx} className="mt-1">
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
            {isPerManLow && formData.perManPerDay.causeActions.length === 0 && (() => {
              setFormData(prev => ({ ...prev, perManPerDay: { ...prev.perManPerDay, causeActions: [emptyCauseAction(5)] } }));
              return null;
            })()}
          </SectionRow>

          {/* ══════════ 6. Last Day OT Hours ══════════ */}
          <SectionRow
            number={6}
            title="Last Day OT Hours"
            target="0"
            status={hasOT ? 'nok' : 'ok'}
            onAdd={() => {
              const newEntry: OvertimeEntry = { departmentId: '', hours: 0, reason: '' };
              setFormData(prev => ({ ...prev, overtime: [...prev.overtime, newEntry] }));
            }}
          >
            {(formData.overtime.length === 0 ? [{ departmentId: '', hours: 0, reason: '' }] : formData.overtime).map((entry, idx) => {
              const hasHours = entry.hours > 0;
              return (
                <EntryRow key={idx} onRemove={formData.overtime.length > 0 ? () => {
                  setFormData(prev => ({ ...prev, overtime: prev.overtime.filter((_, i) => i !== idx) }));
                } : undefined}>
                  <Field label="Department">
                    <Select
                      value={entry.departmentId}
                      onValueChange={(v) => {
                        const updated = [...formData.overtime];
                        const tIdx = formData.overtime.length === 0 ? 0 : idx;
                        updated[tIdx] = { ...entry, departmentId: v };
                        setFormData(prev => ({ ...prev, overtime: updated }));
                      }}
                    >
                      <SelectTrigger className="h-7 text-[10px] font-semibold w-[120px]">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map(dept => (
                          <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Hours">
                    <Input
                      type="number"
                      step="0.5"
                      value={numVal(entry.hours)}
                      onChange={(e) => {
                        const updated = [...formData.overtime];
                        const tIdx = formData.overtime.length === 0 ? 0 : idx;
                        updated[tIdx] = { ...entry, hours: parseFloat(e.target.value) || 0 };
                        setFormData(prev => ({ ...prev, overtime: updated }));
                      }}
                      className={`h-7 text-[10px] font-bold w-[60px] text-center ${hasHours ? 'border-red-300 bg-red-50 text-red-700' : ''}`}
                    />
                  </Field>
                  {hasHours && (
                    <Field label="Reason" className="flex-1 min-w-[180px] animate-in slide-in-from-left-2 duration-300">
                      <Input
                        value={entry.reason}
                        onChange={(e) => {
                          const updated = [...formData.overtime];
                          const tIdx = formData.overtime.length === 0 ? 0 : idx;
                          updated[tIdx] = { ...entry, reason: e.target.value };
                          setFormData(prev => ({ ...prev, overtime: updated }));
                        }}
                        className="h-7 text-[10px] font-medium border-amber-200 bg-amber-50/30"
                        placeholder="Why OT needed?"
                      />
                    </Field>
                  )}
                </EntryRow>
              );
            })}
          </SectionRow>

          {/* ══════════ 7. Cumulative OT Hours ══════════ */}
          <SectionRow number={7} title="Cumulative OT Hours" target="0" highlight>
            <EntryRow>
              <Field label="Prev Total">
                <Input value={numVal(formData.cumulativeOT.previousTotal)} disabled className="h-7 text-[10px] font-bold bg-gray-50 w-[70px] text-center" />
              </Field>
              <Field label="Yesterday">
                <Input value={numVal(formData.cumulativeOT.yesterdayOT)} disabled className="h-7 text-[10px] font-bold bg-gray-50 w-[70px] text-center" />
              </Field>
              <Field label="Cumulative">
                <Input value={numVal(formData.cumulativeOT.todayCumulative)} disabled className="h-7 text-[10px] font-extrabold bg-amber-50 border-amber-200 text-amber-700 w-[70px] text-center" />
              </Field>
            </EntryRow>
          </SectionRow>

          {/* ══════════ 8. Dispatch (Customer + Qty only) ══════════ */}
          <SectionRow
            number={8}
            title="Last Day Dispatch (TML | ALW | PNR)"
            target="—"
            onAdd={() => {
              setFormData(prev => ({
                ...prev,
                dispatch: [...prev.dispatch, { customerId: '', quantity: 0 }]
              }));
            }}
          >
            {(formData.dispatch.length === 0 ? [{ customerId: '', quantity: 0 }] : formData.dispatch).map((entry, idx) => (
              <EntryRow key={idx} onRemove={formData.dispatch.length > 0 ? () => {
                setFormData(prev => ({ ...prev, dispatch: prev.dispatch.filter((_, i) => i !== idx) }));
              } : undefined}>
                <Field label="Customer">
                  <Select
                    value={entry.customerId}
                    onValueChange={(v) => {
                      const updated = [...formData.dispatch];
                      const tIdx = formData.dispatch.length === 0 ? 0 : idx;
                      updated[tIdx] = { ...entry, customerId: v };
                      setFormData(prev => ({ ...prev, dispatch: updated }));
                    }}
                  >
                    <SelectTrigger className="h-7 text-[10px] font-semibold w-[100px]">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.filter(c => c.isActive).map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Qty">
                  <Input
                    type="number"
                    value={numVal(entry.quantity)}
                    onChange={(e) => {
                      const updated = [...formData.dispatch];
                      const tIdx = formData.dispatch.length === 0 ? 0 : idx;
                      updated[tIdx] = { ...entry, quantity: parseInt(e.target.value) || 0 };
                      setFormData(prev => ({ ...prev, dispatch: updated }));
                    }}
                    className="h-7 text-[10px] font-semibold w-[120px]"
                  />
                </Field>
              </EntryRow>
            ))}
          </SectionRow>

          {/* ══════════ 9. Prod Plan Adherence ══════════ */}
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
              >
                <EntryRow>
                  <Field label="Actual">
                    <Input
                      type="number"
                      value={numVal(metric.actual)}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        productionPlanAdherence: { ...prev.productionPlanAdherence, actual: parseFloat(e.target.value) || 0 }
                      }))}
                      className={`h-7 text-[10px] font-bold w-[70px] text-center ${missed ? 'border-red-300 bg-red-50 text-red-700' : ''}`}
                    />
                  </Field>
                  <Field label="Target">
                    <Input value="95%" disabled className="h-7 text-[10px] font-bold w-[70px] text-center bg-gray-50" />
                  </Field>
                </EntryRow>
                {missed && metric.causeActions.map((ca, caIdx) => (
                  <div key={caIdx} className="mt-1">
                    <EntryRow onRemove={metric.causeActions.length > 1 ? () => setFormData(prev => ({
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
                {missed && metric.causeActions.length === 0 && (() => {
                  setFormData(prev => ({ ...prev, productionPlanAdherence: { ...prev.productionPlanAdherence, causeActions: [emptyCauseAction(9)] } }));
                  return null;
                })()}
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
              >
                <EntryRow>
                  <Field label="Actual">
                    <Input
                      type="number"
                      value={numVal(metric.actual)}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        scheduleAdherence: { ...prev.scheduleAdherence, actual: parseFloat(e.target.value) || 0 }
                      }))}
                      className={`h-7 text-[10px] font-bold w-[70px] text-center ${missed ? 'border-red-300 bg-red-50 text-red-700' : ''}`}
                    />
                  </Field>
                  <Field label="Target">
                    <Input value="100%" disabled className="h-7 text-[10px] font-bold w-[70px] text-center bg-gray-50" />
                  </Field>
                </EntryRow>
                {missed && metric.causeActions.map((ca, caIdx) => (
                  <div key={caIdx} className="mt-1">
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
                {missed && metric.causeActions.length === 0 && (() => {
                  setFormData(prev => ({ ...prev, scheduleAdherence: { ...prev.scheduleAdherence, causeActions: [emptyCauseAction(10)] } }));
                  return null;
                })()}
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
              >
                <EntryRow>
                  <Field label="Actual">
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
                  <Field label="Target">
                    <Input value="0" disabled className="h-7 text-[10px] font-bold w-[70px] text-center bg-gray-50" />
                  </Field>
                </EntryRow>
                {missed && metric.causeActions.map((ca, caIdx) => (
                  <div key={caIdx} className="mt-1">
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
                {missed && metric.causeActions.length === 0 && (() => {
                  setFormData(prev => ({ ...prev, materialShortageLoss: { ...prev.materialShortageLoss, causeActions: [emptyCauseAction(11)] } }));
                  return null;
                })()}
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
              >
                <EntryRow>
                  <Field label="Actual">
                    <Input
                      type="number"
                      value={numVal(metric.actual)}
                      onChange={(e) => {
                        const actual = parseInt(e.target.value) || 0;
                        const causeActions = ensureCauseActionsLength(metric.causeActions, actual, 12);
                        setFormData(prev => ({
                          ...prev,
                          lineQualityIssues: { ...prev.lineQualityIssues, actual, causeActions }
                        }));
                      }}
                      className={`h-7 text-[10px] font-bold w-[70px] text-center ${missed ? 'border-red-300 bg-red-50 text-red-700' : ''}`}
                    />
                  </Field>
                  <Field label="Target">
                    <Input value="0" disabled className="h-7 text-[10px] font-bold w-[70px] text-center bg-gray-50" />
                  </Field>
                </EntryRow>
                {/* Show N rows with machine dropdown based on actual value */}
                {metric.causeActions.map((ca, caIdx) => (
                  <div key={caIdx} className="mt-1">
                    <CauseActionFields
                      row={ca}
                      onChange={(updated) => setFormData(prev => ({
                        ...prev,
                        lineQualityIssues: { ...prev.lineQualityIssues, causeActions: updateCauseAction(prev.lineQualityIssues.causeActions, caIdx, updated) }
                      }))}
                      showMachine
                      machines={machines}
                      compactResponsible
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
              >
                <EntryRow>
                  <Field label="Actual">
                    <Input
                      type="number"
                      value={numVal(metric.actual)}
                      onChange={(e) => {
                        const actual = parseInt(e.target.value) || 0;
                        const causeActions = ensureCauseActionsLength(metric.causeActions, actual, 13);
                        setFormData(prev => ({
                          ...prev,
                          incomingMaterialQualityImpact: { ...prev.incomingMaterialQualityImpact, actual, causeActions }
                        }));
                      }}
                      className={`h-7 text-[10px] font-bold w-[70px] text-center ${missed ? 'border-red-300 bg-red-50 text-red-700' : ''}`}
                    />
                  </Field>
                  <Field label="Target">
                    <Input value="0" disabled className="h-7 text-[10px] font-bold w-[70px] text-center bg-gray-50" />
                  </Field>
                </EntryRow>
                {/* Show N rows with supplier dropdown based on actual value */}
                {metric.causeActions.map((ca, caIdx) => (
                  <div key={caIdx} className="mt-1">
                    <CauseActionFields
                      row={ca}
                      onChange={(updated) => setFormData(prev => ({
                        ...prev,
                        incomingMaterialQualityImpact: { ...prev.incomingMaterialQualityImpact, causeActions: updateCauseAction(prev.incomingMaterialQualityImpact.causeActions, caIdx, updated) }
                      }))}
                      showSupplier
                      suppliers={suppliers}
                      compactResponsible
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
              >
                <EntryRow>
                  <Field label="Actual">
                    <Input
                      type="number"
                      value={numVal(metric.actual)}
                      onChange={(e) => {
                        const actual = parseInt(e.target.value) || 0;
                        const causeActions = ensureCauseActionsLength(metric.causeActions, actual, 14);
                        setFormData(prev => ({
                          ...prev,
                          absenteeism: { ...prev.absenteeism, actual, causeActions }
                        }));
                      }}
                      className={`h-7 text-[10px] font-bold w-[70px] text-center ${missed ? 'border-red-300 bg-red-50 text-red-700' : ''}`}
                    />
                  </Field>
                  <Field label="Target">
                    <Input value="0" disabled className="h-7 text-[10px] font-bold w-[70px] text-center bg-gray-50" />
                  </Field>
                </EntryRow>
                {/* Show N rows with machine dropdown based on actual value */}
                {metric.causeActions.map((ca, caIdx) => (
                  <div key={caIdx} className="mt-1">
                    <CauseActionFields
                      row={ca}
                      onChange={(updated) => setFormData(prev => ({
                        ...prev,
                        absenteeism: { ...prev.absenteeism, causeActions: updateCauseAction(prev.absenteeism.causeActions, caIdx, updated) }
                      }))}
                      showMachine
                      machines={machines}
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
              >
                <EntryRow>
                  <Field label="Actual (min)">
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
                  <Field label="Target">
                    <Input value="30 min" disabled className="h-7 text-[10px] font-bold w-[70px] text-center bg-gray-50" />
                  </Field>
                </EntryRow>
                {missed && metric.causeActions.map((ca, caIdx) => (
                  <div key={caIdx} className="mt-1">
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
                        showMachine
                        machines={machines}
                      />
                    </EntryRow>
                  </div>
                ))}
                {missed && metric.causeActions.length === 0 && (() => {
                  setFormData(prev => ({ ...prev, machineBreakdown: { ...prev.machineBreakdown, causeActions: [emptyCauseAction(15)] } }));
                  return null;
                })()}
              </SectionRow>
            );
          })()}

          {/* ══════════ 16/17. Electricity (merged) ══════════ */}
          <SectionRow number={16} title="Unit Consumption (KVAH)" target="—" highlight>
            <EntryRow>
              <Field label="Cumulative">
                <Input value={numVal(formData.utilities.cumulativeElectricity)} disabled className="h-7 text-[10px] font-bold bg-emerald-50/50 w-[100px] text-center" />
              </Field>
              <Field label="Shift">
                <Select
                  value={formData.utilities.electricityShift}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, utilities: { ...prev.utilities, electricityShift: v } }))}
                >
                  <SelectTrigger className="h-7 text-[10px] font-semibold w-[80px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="AB">AB</SelectItem>
                    <SelectItem value="ABC">ABC</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Reading">
                <Input
                  type="number"
                  value={numVal(formData.utilities.electricityKVAH)}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    utilities: { ...prev.utilities, electricityKVAH: parseFloat(e.target.value) || 0 }
                  }))}
                  className="h-7 text-[10px] font-semibold w-[100px]"
                />
              </Field>
            </EntryRow>
          </SectionRow>

          {/* ══════════ 18/19. Diesel (merged) ══════════ */}
          <SectionRow number={17}  title="Diesel Consumption (LTR)" target="0" highlight>
            <EntryRow>
              <Field label="Cumulative">
                <Input value={numVal(formData.utilities.cumulativeDiesel)} disabled className="h-7 text-[10px] font-bold bg-emerald-50/50 w-[100px] text-center" />
              </Field>
              <Field label="Shift">
                <Select
                  value={formData.utilities.dieselShift}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, utilities: { ...prev.utilities, dieselShift: v } }))}
                >
                  <SelectTrigger className="h-7 text-[10px] font-semibold w-[80px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="AB">AB</SelectItem>
                    <SelectItem value="ABC">ABC</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Reading">
                <Input
                  type="number"
                  value={numVal(formData.utilities.dieselLTR)}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    utilities: { ...prev.utilities, dieselLTR: parseFloat(e.target.value) || 0 }
                  }))}
                  className="h-7 text-[10px] font-semibold w-[100px]"
                />
              </Field>
            </EntryRow>
          </SectionRow>

          {/* ══════════ 20. Power Factor ══════════ */}
          <SectionRow
            number={18}
            title="Power Factor"
            target="95–99"
            status={formData.utilities.powerFactor >= 95 ? 'ok' : (formData.utilities.powerFactor === 0 ? 'na' : 'nok')}
          >
            <EntryRow>
              <Field label="Value (0-100)">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={numVal(formData.utilities.powerFactor)}
                  onChange={(e) => {
                    let val = parseFloat(e.target.value) || 0;
                    if (val > 100) val = 100;
                    if (val < 0) val = 0;
                    setFormData(prev => ({
                      ...prev,
                      utilities: { ...prev.utilities, powerFactor: val }
                    }));
                  }}
                  className={`h-7 text-[10px] font-bold w-[70px] text-center ${formData.utilities.powerFactor > 0 && formData.utilities.powerFactor < 95 ? 'border-red-300 bg-red-50 text-red-700' : ''}`}
                />
              </Field>
              <StatusBadge ok={formData.utilities.powerFactor >= 95} okText="95-99" nokText="LOW" />
            </EntryRow>
          </SectionRow>

          {/* ══════════ 21. Sales ══════════ */}
          <SectionRow number={19} title="Sales Values (Last Day & Cumm)" target="—">
            <EntryRow>
              <Field label="Daily (₹L)">
                <Input
                  type="number"
                  value={numVal(formData.sales.dailySales)}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    sales: { ...prev.sales, dailySales: parseFloat(e.target.value) || 0 }
                  }))}
                  className="h-7 text-[10px] font-semibold w-[80px]"
                />
              </Field>
              <Field label="Cumulative (₹L)">
                <Input value={numVal(formData.sales.cumulativeSales)} disabled className="h-7 text-[10px] font-bold bg-gray-50 w-[80px] text-center" />
              </Field>
            </EntryRow>
          </SectionRow>

          {/* ══════════ 22/23. Training (merged) ══════════ */}
          <SectionRow number={20}  title="Training Hours" target="30 mins" highlight>
            <EntryRow>
              <Field label="Cumulative Hrs">
                <Input value={numVal(formData.training.cumulativeHours)} disabled className="h-7 text-[10px] font-bold bg-emerald-50/50 w-[80px] text-center" />
              </Field>
              <Field label="Training Hours">
                <Input
                  type="number"
                  value={numVal(formData.training.dailyHours)}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    training: { ...prev.training, dailyHours: parseFloat(e.target.value) || 0 }
                  }))}
                  className="h-7 text-[10px] font-semibold w-[80px]"
                />
              </Field>
              <Field label="Topic" className="flex-1 min-w-[150px]">
                <Input
                  value={formData.training.topic}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    training: { ...prev.training, topic: e.target.value }
                  }))}
                  className="h-7 text-[10px] font-medium"
                  placeholder="Training topic..."
                />
              </Field>
            </EntryRow>
          </SectionRow>

          {/* ══════════ 24. 1st Pass OK Ratio ══════════ */}
          <SectionRow
            number={21}
            title="Last Day 1st Pass OK Ratio"
            target="100%"
            status={formData.qualityRatios.firstPassOKRatio === 0 ? 'na' : (formData.qualityRatios.firstPassOKRatio < 100 ? 'nok' : 'ok')}
          >
            <EntryRow>
              <Field label="Actual %">
                <Input
                  type="number"
                  value={numVal(formData.qualityRatios.firstPassOKRatio)}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    qualityRatios: { ...prev.qualityRatios, firstPassOKRatio: parseFloat(e.target.value) || 0 }
                  }))}
                  className={`h-7 text-[10px] font-bold w-[70px] text-center ${formData.qualityRatios.firstPassOKRatio > 0 && formData.qualityRatios.firstPassOKRatio < 100 ? 'border-red-300 bg-red-50 text-red-700' : ''}`}
                />
              </Field>
            </EntryRow>
            {/* Show cause when < 100 */}
            {formData.qualityRatios.firstPassOKRatio > 0 && formData.qualityRatios.firstPassOKRatio < 100 && (
              <>
                {formData.qualityRatios.firstPassCauseActions.length === 0 && (() => {
                  setFormData(prev => ({ ...prev, qualityRatios: { ...prev.qualityRatios, firstPassCauseActions: [emptyCauseAction(24)] } }));
                  return null;
                })()}
                {formData.qualityRatios.firstPassCauseActions.map((ca, caIdx) => (
                  <div key={caIdx} className="mt-1">
                    <CauseActionFields
                      row={ca}
                      onChange={(updated) => setFormData(prev => ({
                        ...prev,
                        qualityRatios: { ...prev.qualityRatios, firstPassCauseActions: updateCauseAction(prev.qualityRatios.firstPassCauseActions, caIdx, updated) }
                      }))}
                    />
                  </div>
                ))}
              </>
            )}
          </SectionRow>

          {/* ══════════ 25. 1st Pass OK Ratio - PDI ══════════ */}
          <SectionRow
            number={22}
            title="Last Day 1st Pass OK Ratio - PDI"
            target="100%"
            status={formData.qualityRatios.pdiRatio === 0 ? 'na' : (formData.qualityRatios.pdiRatio < 100 ? 'nok' : 'ok')}
          >
            <EntryRow>
              <Field label="Actual %">
                <Input
                  type="number"
                  value={numVal(formData.qualityRatios.pdiRatio)}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    qualityRatios: { ...prev.qualityRatios, pdiRatio: parseFloat(e.target.value) || 0 }
                  }))}
                  className={`h-7 text-[10px] font-bold w-[70px] text-center ${formData.qualityRatios.pdiRatio > 0 && formData.qualityRatios.pdiRatio < 100 ? 'border-red-300 bg-red-50 text-red-700' : ''}`}
                />
              </Field>
            </EntryRow>
            {/* Show cause when < 100 */}
            {formData.qualityRatios.pdiRatio > 0 && formData.qualityRatios.pdiRatio < 100 && (
              <>
                {formData.qualityRatios.pdiCauseActions.length === 0 && (() => {
                  setFormData(prev => ({ ...prev, qualityRatios: { ...prev.qualityRatios, pdiCauseActions: [emptyCauseAction(25)] } }));
                  return null;
                })()}
                {formData.qualityRatios.pdiCauseActions.map((ca, caIdx) => (
                  <div key={caIdx} className="mt-1">
                    <CauseActionFields
                      row={ca}
                      onChange={(updated) => setFormData(prev => ({
                        ...prev,
                        qualityRatios: { ...prev.qualityRatios, pdiCauseActions: updateCauseAction(prev.qualityRatios.pdiCauseActions, caIdx, updated) }
                      }))}
                    />
                  </div>
                ))}
              </>
            )}
          </SectionRow>

          {/* ══════════ 26. PDI Issues (swapped from 27) ══════════ */}
          {(() => {
            const data = formData.pdiIssues;
            // Show cause section if point 25 PDI ratio < 100
            const shouldShowCause = formData.qualityRatios.pdiRatio > 0 && formData.qualityRatios.pdiRatio < 100;
            return (
              <SectionRow
                number={23}
                title="Last Day PDI Issue"
                target="0"
                status={data.hasIssue || shouldShowCause ? 'nok' : 'ok'}
                onAdd={() => setFormData(prev => ({
                  ...prev,
                  pdiIssues: { ...prev.pdiIssues, causeActions: [...prev.pdiIssues.causeActions, emptyCauseAction(26)] }
                }))}
              >
                <EntryRow>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={data.hasIssue}
                      onCheckedChange={(v) => setFormData(prev => ({ ...prev, pdiIssues: { ...prev.pdiIssues, hasIssue: v } }))}
                    />
                    <span className={`text-[9px] font-extrabold ${data.hasIssue ? 'text-red-600' : 'text-emerald-600'}`}>
                      {data.hasIssue ? 'YES' : 'NO'}
                    </span>
                  </div>
                </EntryRow>
                {(data.hasIssue || shouldShowCause) && data.causeActions.map((ca, caIdx) => (
                  <div key={caIdx} className="mt-1">
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
                {(data.hasIssue || shouldShowCause) && data.causeActions.length === 0 && (() => {
                  setFormData(prev => ({ ...prev, pdiIssues: { ...prev.pdiIssues, causeActions: [emptyCauseAction(26)] } }));
                  return null;
                })()}
              </SectionRow>
            );
          })()}

          {/* ══════════ 27. Supplier Rejection (swapped from 26) ══════════ */}
          <SectionRow
            number={24}
            title="Last Day Supplier Rejection"
            target="0 PPM"
            status={formData.supplierRejectionCount > 0 ? 'nok' : 'ok'}
          >
            <EntryRow>
              <Field label="Quantity">
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
            </EntryRow>
            {formData.supplierRejections.map((entry, idx) => (
              <EntryRow key={idx} className="ml-4 mt-1">
                <Field label="Supplier">
                  <Select
                    value={entry.supplierId}
                    onValueChange={(v) => {
                      const updated = [...formData.supplierRejections];
                      updated[idx] = { ...entry, supplierId: v };
                      setFormData(prev => ({ ...prev, supplierRejections: updated }));
                    }}
                  >
                    <SelectTrigger className="h-7 text-[10px] font-semibold w-[120px]">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.filter(s => s.isActive).map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Reason" className="flex-1 min-w-[180px]">
                  <Input
                    value={entry.reason}
                    onChange={(e) => {
                      const updated = [...formData.supplierRejections];
                      updated[idx] = { ...entry, reason: e.target.value };
                      setFormData(prev => ({ ...prev, supplierRejections: updated }));
                    }}
                    className="h-7 text-[10px] font-medium border-red-200 bg-red-50/30"
                    placeholder="Rejection reason..."
                  />
                </Field>
              </EntryRow>
            ))}
          </SectionRow>

          {/* ══════════ 28. Field Complaints ══════════ */}
          {(() => {
            const data = formData.fieldComplaints;
            return (
              <SectionRow
                number={25}
                title="Last Day Field Complaints / Issues"
                target="0 Nos"
                status={data.hasIssue ? 'nok' : 'ok'}
                onAdd={() => setFormData(prev => ({
                  ...prev,
                  fieldComplaints: { ...prev.fieldComplaints, causeActions: [...prev.fieldComplaints.causeActions, emptyCauseAction(28)] }
                }))}
              >
                <EntryRow>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={data.hasIssue}
                      onCheckedChange={(v) => setFormData(prev => ({ ...prev, fieldComplaints: { ...prev.fieldComplaints, hasIssue: v } }))}
                    />
                    <span className={`text-[9px] font-extrabold ${data.hasIssue ? 'text-red-600' : 'text-emerald-600'}`}>
                      {data.hasIssue ? 'YES' : 'NO'}
                    </span>
                  </div>
                </EntryRow>
                {data.hasIssue && data.causeActions.map((ca, caIdx) => (
                  <div key={caIdx} className="mt-1">
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
                {data.hasIssue && data.causeActions.length === 0 && (() => {
                  setFormData(prev => ({ ...prev, fieldComplaints: { ...prev.fieldComplaints, causeActions: [emptyCauseAction(28)] } }));
                  return null;
                })()}
              </SectionRow>
            );
          })()}

          {/* ══════════ 29. SOP Non-adherence ══════════ */}
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
                  sopNonAdherence: { ...prev.sopNonAdherence, causeActions: [...prev.sopNonAdherence.causeActions, emptyCauseAction(29)] }
                }))}
              >
                <EntryRow>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={data.hasIssue}
                      onCheckedChange={(v) => setFormData(prev => ({ ...prev, sopNonAdherence: { ...prev.sopNonAdherence, hasIssue: v } }))}
                    />
                    <span className={`text-[9px] font-extrabold ${data.hasIssue ? 'text-red-600' : 'text-emerald-600'}`}>
                      {data.hasIssue ? 'YES' : 'NO'}
                    </span>
                  </div>
                </EntryRow>
                {data.hasIssue && data.causeActions.map((ca, caIdx) => (
                  <div key={caIdx} className="mt-1">
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
                        showDepartment
                        departments={departments}
                      />
                    </EntryRow>
                  </div>
                ))}
                {data.hasIssue && data.causeActions.length === 0 && (() => {
                  setFormData(prev => ({ ...prev, sopNonAdherence: { ...prev.sopNonAdherence, causeActions: [emptyCauseAction(29)] } }));
                  return null;
                })()}
              </SectionRow>
            );
          })()}

          {/* ══════════ 30. Line Issue / Stop Due to Fixtures ══════════ */}
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
                  fixtureIssues: { ...prev.fixtureIssues, causeActions: [...prev.fixtureIssues.causeActions, emptyCauseAction(30)] }
                }))}
              >
                <EntryRow>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={data.hasIssue}
                      onCheckedChange={(v) => setFormData(prev => ({ ...prev, fixtureIssues: { ...prev.fixtureIssues, hasIssue: v } }))}
                    />
                    <span className={`text-[9px] font-extrabold ${data.hasIssue ? 'text-red-600' : 'text-emerald-600'}`}>
                      {data.hasIssue ? 'YES' : 'NO'}
                    </span>
                  </div>
                </EntryRow>
                {data.hasIssue && data.causeActions.map((ca, caIdx) => (
                  <div key={caIdx} className="mt-1">
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
                        showMachine
                        machines={machines}
                      />
                    </EntryRow>
                  </div>
                ))}
                {data.hasIssue && data.causeActions.length === 0 && (() => {
                  setFormData(prev => ({ ...prev, fixtureIssues: { ...prev.fixtureIssues, causeActions: [emptyCauseAction(30)] } }));
                  return null;
                })()}
              </SectionRow>
            );
          })()}

          {/* ══════════ 31. Pallet / Trolley Issue ══════════ */}
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
                  palletTrolleyIssues: { ...prev.palletTrolleyIssues, causeActions: [...prev.palletTrolleyIssues.causeActions, emptyCauseAction(31)] }
                }))}
              >
                <EntryRow>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={data.hasIssue}
                      onCheckedChange={(v) => setFormData(prev => ({ ...prev, palletTrolleyIssues: { ...prev.palletTrolleyIssues, hasIssue: v } }))}
                    />
                    <span className={`text-[9px] font-extrabold ${data.hasIssue ? 'text-red-600' : 'text-emerald-600'}`}>
                      {data.hasIssue ? 'YES' : 'NO'}
                    </span>
                  </div>
                </EntryRow>
                {data.hasIssue && data.causeActions.map((ca, caIdx) => (
                  <div key={caIdx} className="mt-1">
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
                      />
                    </EntryRow>
                  </div>
                ))}
                {data.hasIssue && data.causeActions.length === 0 && (() => {
                  setFormData(prev => ({ ...prev, palletTrolleyIssues: { ...prev.palletTrolleyIssues, causeActions: [emptyCauseAction(31)] } }));
                  return null;
                })()}
              </SectionRow>
            );
          })()}

          {/* ══════════ 32. Material Shortage Issue ══════════ */}
          {(() => {
            const data = formData.materialShortageIssue;
            const qty = data.quantity || 0;
            return (
              <SectionRow
                number={29}
                title="Material Shortage Issue"
                target="0"
                status={qty > 0 ? 'nok' : 'ok'}
              >
                <EntryRow>
                  <Field label="Quantity">
                    <Input
                      type="number"
                      value={numVal(qty)}
                      onChange={(e) => {
                        const quantity = parseInt(e.target.value) || 0;
                        const causeActions = ensureCauseActionsLength(data.causeActions, quantity, 32);
                        setFormData(prev => ({
                          ...prev,
                          materialShortageIssue: { ...prev.materialShortageIssue, quantity, hasIssue: quantity > 0, causeActions }
                        }));
                      }}
                      className={`h-7 text-[10px] font-bold w-[60px] text-center ${qty > 0 ? 'border-red-300 bg-red-50 text-red-700' : ''}`}
                    />
                  </Field>
                </EntryRow>
                {data.causeActions.map((ca, caIdx) => (
                  <div key={caIdx} className="mt-1 ml-4">
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

          {/* ══════════ 33. Other Critical Issue ══════════ */}
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
                  otherCriticalIssue: { ...prev.otherCriticalIssue, causeActions: [...prev.otherCriticalIssue.causeActions, emptyCauseAction(33)] }
                }))}
              >
                <EntryRow>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={data.hasIssue}
                      onCheckedChange={(v) => setFormData(prev => ({ ...prev, otherCriticalIssue: { ...prev.otherCriticalIssue, hasIssue: v } }))}
                    />
                    <span className={`text-[9px] font-extrabold ${data.hasIssue ? 'text-red-600' : 'text-emerald-600'}`}>
                      {data.hasIssue ? 'YES' : 'NO'}
                    </span>
                  </div>
                </EntryRow>
                {data.hasIssue && data.causeActions.map((ca, caIdx) => (
                  <div key={caIdx} className="mt-1">
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
                {data.hasIssue && data.causeActions.length === 0 && (() => {
                  setFormData(prev => ({ ...prev, otherCriticalIssue: { ...prev.otherCriticalIssue, causeActions: [emptyCauseAction(33)] } }));
                  return null;
                })()}
              </SectionRow>
            );
          })()}

        </CardContent>
      </Card>

      {/* ═══ Sticky Save ═══ */}
      {/* <div className="sticky bottom-3 bg-white/95 backdrop-blur border border-[#E5E5E5] px-4 py-3 rounded-lg shadow-lg flex justify-end gap-3">
        <Button
          onClick={handleSave}
          disabled={isSubmitting}
          size="sm"
          className="bg-[#C9A962] text-[#1A1A1A] hover:bg-[#B8A164] h-8 text-xs"
        >
          <Save className="w-3.5 h-3.5 mr-1.5" />
          {isSubmitting ? 'Saving...' : 'Save Entry'}
        </Button>
      </div> */}
    </div>
  );
}
