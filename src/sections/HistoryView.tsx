import { useState, useCallback, useEffect } from 'react';
import { Download, Calendar, Search, FileText, RefreshCw, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import * as api from '@/lib/api';
import type { DailyEntry, CauseActionRow } from '@/types';
import { useMasterData } from '@/context/MasterDataContext';

// ─── Color tokens ──────────────────────────────────────────────────────────────
const COLOR = {
  ok:        '#D1FAE5',
  warn:      '#FEF3C7',
  bad:       '#FEE2E2',
  na:        '#F9FAFB',
  okText:    '#065F46',
  warnText:  '#92400E',
  badText:   '#991B1B',
  naText:    '#374151',
  cyan:      '#00BCD4',
  purple:    '#907b99ff',
  cummBg:    '#EFF6FF',
  cummText:  '#1D4ED8',
};

// ─── MP badge colour map ──────────────────────────────────────────────────────
function mpBadgeColor(mp: string) {
  const map: Record<string, string> = {
    S: '#EF4444',
    Q: '#8B5CF6',
    P: '#3B82F6',
    C: '#F59E0B',
    D: '#0EA5E9',
    M: '#EC4899',
  };
  return map[mp] || '#94A3B8';
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function yesNo(val: boolean) { return val ? 'YES' : 'NO'; }
function pct(v: number) { return `${v}%`; }

function lines(rows: CauseActionRow[], field: keyof CauseActionRow): string {
  return rows.map(r => (r[field] as string) || '').filter(Boolean).join('\n') || '—';
}
function flatLines(rows: CauseActionRow[], field: keyof CauseActionRow): string {
  return rows.map(r => (r[field] as string) || '').filter(Boolean).join(' | ') || '—';
}

// ─── Sub-components ────────────────────────────────────────────────────────────
function ValCell({
  val, bg, textColor, colSpan = 1, sub,
}: {
  val: React.ReactNode; bg?: string; textColor?: string; colSpan?: number; sub?: React.ReactNode;
}) {
  return (
    <td className="border border-[#E2E8F0] px-2 py-1.5 text-center text-[11px] align-top"
      colSpan={colSpan}
      style={{ background: bg || COLOR.na, color: textColor || COLOR.naText }}>
      <div className="font-semibold">{val}</div>
      {sub && <div className="mt-0.5 text-[10px] opacity-70">{sub}</div>}
    </td>
  );
}

/** Standard Excel row */
function ExcelRow({
  sl, mp, checkpoint, target, valueCell,
  causesRows, actionRows, responsibleRows, targetDateRows, isEven,
}: {
  sl: number; mp: string; checkpoint: string; target: React.ReactNode;
  valueCell: React.ReactNode;
  causesRows: string; actionRows: string; responsibleRows: string; targetDateRows: string;
  isEven: boolean;
}) {
  const rowBg = isEven ? '#FAFAFA' : '#FFFFFF';
  return (
    <tr style={{ background: rowBg, verticalAlign: 'top' }}>
      <td className="border border-[#E2E8F0] px-2 py-1.5 text-center text-[10px] text-[#94A3B8] font-semibold">{sl}</td>
      <td className="border border-[#E2E8F0] px-2 py-1.5 text-[11px] font-medium text-[#1E293B]">{checkpoint}</td>
      <td className="border border-[#E2E8F0] px-2 py-1.5 text-center">
        <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded"
          style={{ background: mpBadgeColor(mp), color: '#fff', letterSpacing: '0.05em' }}>
          {mp}
        </span>
      </td>
      <td className="border border-[#E2E8F0] px-2 py-1.5 text-center text-[11px] text-[#64748B]">{target}</td>
      {valueCell}
      <td className="border border-[#E2E8F0] px-2 py-1.5 text-[11px] leading-[1.6] align-top">
        {causesRows.split('\n').map((line, i) => <div key={i} className="min-h-[1rem]">{line}</div>)}
      </td>
      <td className="border border-[#E2E8F0] px-2 py-1.5 text-[11px] leading-[1.6] align-top">
        {actionRows.split('\n').map((line, i) => <div key={i} className="min-h-[1rem]">{line}</div>)}
      </td>
      <td className="border border-[#E2E8F0] px-2 py-1.5 text-center text-[11px] align-top text-[#475569]">
        {responsibleRows.split('\n').map((line, i) => <div key={i} className="min-h-[1rem]">{line}</div>)}
      </td>
      <td className="border border-[#E2E8F0] px-2 py-1.5 text-center text-[11px] align-top text-[#475569]">
        {targetDateRows.split('\n').map((line, i) => <div key={i} className="min-h-[1rem]">{line}</div>)}
      </td>
    </tr>
  );
}

/** Cyan highlighted row (cumulative rows) */
function CyanRow({ sl, mp, checkpoint, value, sub }: {
  sl: number; mp: string; checkpoint: string; value: React.ReactNode; sub?: React.ReactNode;
}) {
  return (
    <tr style={{ background: COLOR.cyan, verticalAlign: 'top' }}>
      <td className="border border-[#00ACC1] px-2 py-1.5 text-center text-[10px] font-bold text-white">{sl}</td>
      <td className="border border-[#00ACC1] px-2 py-1.5 text-[11px] font-bold text-white">{checkpoint}</td>
      <td className="border border-[#00ACC1] px-2 py-1.5 text-center">
        <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded"
          style={{ background: 'rgba(0,0,0,0.25)', color: '#fff' }}>{mp}</span>
      </td>
      <td className="border border-[#00ACC1] px-2 py-1.5 text-center text-white/70 text-[11px]">—</td>
      <td className="border border-[#00ACC1] px-2 py-1.5 text-center font-bold text-white text-[12px]"
        style={{ background: 'rgba(0,0,0,0.15)' }}>
        {value}
        {sub && <div className="text-[9px] font-normal opacity-70 mt-0.5">{sub}</div>}
      </td>
      {['—', '—', '—', '—'].map((v, i) => (
        <td key={i} className="border border-[#00ACC1] px-2 py-1.5 text-center text-white/60 text-[11px]">{v}</td>
      ))}
    </tr>
  );
}

/** Purple highlighted row (YTD / cumulative override rows) */
function PurpleRow({ sl, mp, checkpoint, value, target = '—' }: {
  sl: number; mp: string; checkpoint: string; value: React.ReactNode; target?: string;
}) {
  return (
    <tr style={{ background: COLOR.purple, verticalAlign: 'top' }}>
      <td className="border border-[#6A1B9A] px-2 py-1.5 text-center text-[10px] font-bold text-white">{sl}</td>
      <td className="border border-[#6A1B9A] px-2 py-1.5 text-[11px] font-bold text-white">{checkpoint}</td>
      <td className="border border-[#6A1B9A] px-2 py-1.5 text-center">
        <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 rounded"
          style={{ background: 'rgba(0,0,0,0.25)', color: '#fff' }}>{mp}</span>
      </td>
      <td className="border border-[#6A1B9A] px-2 py-1.5 text-center text-white/70 text-[11px]">{target}</td>
      <td className="border border-[#6A1B9A] px-2 py-1.5 text-center font-bold text-white text-[12px]"
        style={{ background: 'rgba(0,0,0,0.15)' }}>{value}</td>
      {['—', '—', '—', '—'].map((v, i) => (
        <td key={i} className="border border-[#6A1B9A] px-2 py-1.5 text-center text-white/60 text-[11px]">{v}</td>
      ))}
    </tr>
  );
}

// ─── Excel Export ─────────────────────────────────────────────────────────────
async function exportToExcel(d: DailyEntry, partTypes: { id: string; name: string }[]) {
  // @ts-ignore
  const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs');

  const rows: (string | number)[][] = [
    ['SI', 'Check Points', 'MP', 'Target', 'Actual / Value', 'Probable Causes', 'Action Planned', 'Responsible', 'Target Date'],
  ];

  function addRow(sl: number, cp: string, mp: string, tgt: string | number, val: string | number,
    cause: string, action: string, resp: string, td: string) {
    rows.push([sl, cp, mp, String(tgt), String(val), cause, action, resp, td]);
  }

  const prod = d.production || [];
  const grouped = partTypes.map(pt => {
    const item = prod.find(p => p.partTypeId === pt.id);
    return { name: pt.name, target: item?.target || 0, actual: item?.actual || 0 };
  });
  const totalT = grouped.reduce((s, g) => s + g.target, 0);
  const totalA = grouped.reduce((s, g) => s + g.actual, 0);
  const ot = d.overtime || [];
  const otTotal = ot.reduce((s, e) => s + e.hours, 0);
  const ct = d.cycleTime;
  const pm = d.perManPerDay;
  const cot = d.cumulativeOT;
  const u = d.utilities;
  const s2 = d.sales;
  const t = d.training;
  const q = d.qualityRatios;
  const cr = d.customerRejections || [];
  const sr = d.supplierRejections || [];
  const safetyCA = (d.safety || []).flatMap(e => e.causeActions || []);

  addRow(1, 'Last day accident/Incident/Near Miss in nos. (Reported)', 'S', '0',
    (d.safety || []).length > 0 ? (d.safety || []).map(e => `${e.type} (${e.count})`).join(', ') : '0',
    flatLines(safetyCA, 'cause'), flatLines(safetyCA, 'action'), flatLines(safetyCA, 'responsible'), flatLines(safetyCA, 'targetDate'));
  addRow(2, 'Last day Customer rejection (TML | ALW | PNR)', 'Q', '0 PPM',
    d.customerRejectionCount > 0 ? cr.map(r => r.reason).join(', ') : '0',
    cr.map(r => r.reason).join(' | ') || '—', '—', '—', '—');
  addRow(3, 'Last Day Production', 'P', totalT,
    `${totalA}/${totalT} | ${grouped.map(g => `${g.name}: ${g.actual}/${g.target}`).join(', ')}`,
    '—', '—', '—', '—');
  addRow(4, 'Cycle Time (Front / Rear)', 'P', '<2 Min', `F:${ct.front}m | R:${ct.rear}m`,
    flatLines(ct.causeActions || [], 'cause'), flatLines(ct.causeActions || [], 'action'),
    flatLines(ct.causeActions || [], 'responsible'), flatLines(ct.causeActions || [], 'targetDate'));
  addRow(5, 'Per man per day prop shaft qty Yesterday', 'P', pm.target, pm.actual,
    flatLines(pm.causeActions || [], 'cause'), flatLines(pm.causeActions || [], 'action'),
    flatLines(pm.causeActions || [], 'responsible'), flatLines(pm.causeActions || [], 'targetDate'));
  addRow(6, 'Last day OT hours (Prd,QA,Main,Mater,Engg,Planning)', 'C', '0',
    otTotal > 0 ? `${otTotal} hrs` : '0',
    ot.map(e => e.reason).filter(Boolean).join(' | ') || '—', '—', '—', '—');
  addRow(7, 'Cumulative OT hours', 'C', '—', `${cot.todayCumulative} hrs`, '—', '—', '—', '—');
  addRow(8, 'Last Day Dispatch (TML | ALW | PNR)', 'S', '—',
    (d.dispatch || []).map(e => `${e.customerId}: ${e.quantity}`).join(' | ') || '—', '—', '—', '—', '—');
  addRow(9, 'Production plan adherance %age (Yesterday)', 'P', pct(d.productionPlanAdherence.target), pct(d.productionPlanAdherence.actual),
    flatLines(d.productionPlanAdherence.causeActions || [], 'cause'), flatLines(d.productionPlanAdherence.causeActions || [], 'action'),
    flatLines(d.productionPlanAdherence.causeActions || [], 'responsible'), flatLines(d.productionPlanAdherence.causeActions || [], 'targetDate'));
  addRow(10, 'Ontime In Full schedule adherance %age (Yesterday)', 'D', pct(d.scheduleAdherence.target), pct(d.scheduleAdherence.actual),
    flatLines(d.scheduleAdherence.causeActions || [], 'cause'), flatLines(d.scheduleAdherence.causeActions || [], 'action'),
    flatLines(d.scheduleAdherence.causeActions || [], 'responsible'), flatLines(d.scheduleAdherence.causeActions || [], 'targetDate'));
  addRow(11, 'Production hours loss for material shortage', 'P', '0',
    d.materialShortageLoss.actual > 0 ? `${d.materialShortageLoss.actual} hrs` : '0',
    flatLines(d.materialShortageLoss.causeActions || [], 'cause'), flatLines(d.materialShortageLoss.causeActions || [], 'action'),
    flatLines(d.materialShortageLoss.causeActions || [], 'responsible'), flatLines(d.materialShortageLoss.causeActions || [], 'targetDate'));
  addRow(12, 'Line Quality Issue', 'P', '0', d.lineQualityIssues.actual,
    flatLines(d.lineQualityIssues.causeActions || [], 'cause'), flatLines(d.lineQualityIssues.causeActions || [], 'action'),
    flatLines(d.lineQualityIssues.causeActions || [], 'responsible'), flatLines(d.lineQualityIssues.causeActions || [], 'targetDate'));
  addRow(13, 'Production line affected due to poor Quality of incoming material', 'Q', '0', d.incomingMaterialQualityImpact.actual,
    flatLines(d.incomingMaterialQualityImpact.causeActions || [], 'cause'), flatLines(d.incomingMaterialQualityImpact.causeActions || [], 'action'),
    flatLines(d.incomingMaterialQualityImpact.causeActions || [], 'responsible'), flatLines(d.incomingMaterialQualityImpact.causeActions || [], 'targetDate'));
  addRow(14, 'Unauthorised absentisim (Prd & Others)', 'M', '0', d.absenteeism.actual,
    flatLines(d.absenteeism.causeActions || [], 'cause'), flatLines(d.absenteeism.causeActions || [], 'action'),
    flatLines(d.absenteeism.causeActions || [], 'responsible'), flatLines(d.absenteeism.causeActions || [], 'targetDate'));
  addRow(15, 'Breakdown of machine', 'P', '30 min max',
    d.machineBreakdown.actual > 0 ? `${d.machineBreakdown.actual} min` : '0',
    flatLines(d.machineBreakdown.causeActions || [], 'cause'), flatLines(d.machineBreakdown.causeActions || [], 'action'),
    flatLines(d.machineBreakdown.causeActions || [], 'responsible'), flatLines(d.machineBreakdown.causeActions || [], 'targetDate'));
  addRow(16, 'Unit consumption Last Day (KVAH)', 'C', '—', `${u.electricityKVAH} kVAh (Shift ${u.electricityShift})`, '—', '—', '—', '—');
  addRow(17, 'Unit Consumption Till date (YTD)', 'C', '—', `${u.cumulativeElectricity} kVAh`, '—', '—', '—', '—');
  addRow(18, 'Diesel consumption Last Day (LTR)', 'C', '0', `${u.dieselLTR} L (Shift ${u.dieselShift})`, '—', '—', '—', '—');
  addRow(19, 'Diesel consumption Till date (LTR)', 'C', '0', `${u.cumulativeDiesel} L`, '—', '—', '—', '—');
  addRow(20, 'Power Factor', 'C', '95–99', `${u.powerFactor}%`, '—', '—', '—', '—');
  addRow(21, 'Sales Values (Last Day & Cumm)', 'C', '—', `Daily: ₹${s2.dailySales}L | Cumm: ₹${s2.cumulativeSales}L`, '—', '—', '—', '—');
  addRow(22, 'Last day training hours', 'M', '30 min', `${t.dailyHours} hrs — ${t.topic || '—'}`, '—', '—', '—', '—');
  addRow(23, 'Cumulative training hours', 'M', '—', `${t.cumulativeHours} hrs`, '—', '—', '—', '—');
  addRow(24, 'Last day 1st pass ok Ratio', 'Q', '100%', pct(q.firstPassOKRatio),
    flatLines(q.firstPassCauseActions || [], 'cause'), flatLines(q.firstPassCauseActions || [], 'action'),
    flatLines(q.firstPassCauseActions || [], 'responsible'), flatLines(q.firstPassCauseActions || [], 'targetDate'));
  addRow(25, 'Last Day 1st Pass ok Ratio-PDI', 'Q', '100%', pct(q.pdiRatio),
    flatLines(q.pdiCauseActions || [], 'cause'), flatLines(q.pdiCauseActions || [], 'action'),
    flatLines(q.pdiCauseActions || [], 'responsible'), flatLines(q.pdiCauseActions || [], 'targetDate'));
  addRow(26, 'Last day supplier rejection', 'Q', '0 PPM',
    d.supplierRejectionCount > 0 ? sr.map(r => r.reason || r.supplierId).join(', ') : '0',
    sr.map(r => r.reason).join(' | ') || '—', '—', '—', '—');
  addRow(27, 'Last Day PDI Issue', 'Q', '0', yesNo(d.pdiIssues.hasIssue),
    flatLines(d.pdiIssues.causeActions || [], 'cause'), flatLines(d.pdiIssues.causeActions || [], 'action'),
    flatLines(d.pdiIssues.causeActions || [], 'responsible'), flatLines(d.pdiIssues.causeActions || [], 'targetDate'));
  addRow(28, 'Last day field complaints/Issue reported in numbers', 'Q', '0 Nos', yesNo(d.fieldComplaints.hasIssue),
    flatLines(d.fieldComplaints.causeActions || [], 'cause'), flatLines(d.fieldComplaints.causeActions || [], 'action'),
    flatLines(d.fieldComplaints.causeActions || [], 'responsible'), flatLines(d.fieldComplaints.causeActions || [], 'targetDate'));
  addRow(29, 'Is there any SOP non adherance found in yesterdays LPA audit', 'Q', '—', yesNo(d.sopNonAdherence.hasIssue),
    flatLines(d.sopNonAdherence.causeActions || [], 'cause'), flatLines(d.sopNonAdherence.causeActions || [], 'action'),
    flatLines(d.sopNonAdherence.causeActions || [], 'responsible'), flatLines(d.sopNonAdherence.causeActions || [], 'targetDate'));
  addRow(30, 'Line Issue/Stop Due to fixtures', 'D', '0', yesNo(d.fixtureIssues.hasIssue),
    flatLines(d.fixtureIssues.causeActions || [], 'cause'), flatLines(d.fixtureIssues.causeActions || [], 'action'),
    flatLines(d.fixtureIssues.causeActions || [], 'responsible'), flatLines(d.fixtureIssues.causeActions || [], 'targetDate'));
  addRow(31, 'Any Issue Related to Pallets Or Trolley (Internal & External)', 'P', '0', yesNo(d.palletTrolleyIssues.hasIssue),
    flatLines(d.palletTrolleyIssues.causeActions || [], 'cause'), flatLines(d.palletTrolleyIssues.causeActions || [], 'action'),
    flatLines(d.palletTrolleyIssues.causeActions || [], 'responsible'), flatLines(d.palletTrolleyIssues.causeActions || [], 'targetDate'));

  let sl = 32;
  if (d.materialShortageIssue) {
    const ms = d.materialShortageIssue;
    addRow(sl++, 'Material Shortage Issue', 'P', '0',
      (ms.quantity || 0) > 0 ? `${ms.quantity} nos` : '0',
      flatLines(ms.causeActions || [], 'cause'), flatLines(ms.causeActions || [], 'action'),
      flatLines(ms.causeActions || [], 'responsible'), flatLines(ms.causeActions || [], 'targetDate'));
  }
  if (d.otherCriticalIssue) {
    addRow(sl++, 'Other Critical Issue', 'P', '0', yesNo(d.otherCriticalIssue.hasIssue),
      flatLines(d.otherCriticalIssue.causeActions || [], 'cause'), flatLines(d.otherCriticalIssue.causeActions || [], 'action'),
      flatLines(d.otherCriticalIssue.causeActions || [], 'responsible'), flatLines(d.otherCriticalIssue.causeActions || [], 'targetDate'));
  }
  if (d.otherField1) addRow(sl++, 'Others / Remarks', '—', '—', d.otherField1, '—', '—', '—', '—');
  if (d.otherField2) addRow(sl++, 'Others / Remarks 2', '—', '—', d.otherField2, '—', '—', '—', '—');

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [
    { wch: 4 }, { wch: 46 }, { wch: 5 }, { wch: 12 },
    { wch: 30 }, { wch: 28 }, { wch: 28 }, { wch: 14 }, { wch: 14 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Daily Report');
  XLSX.writeFile(wb, `Daily_Report_${d.date}.xlsx`);
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function HistoryView() {
  const [selectedDate, setSelectedDate] = useState('');
  const [report, setReport] = useState<DailyEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { partTypes } = useMasterData();

  useEffect(() => {
    (async () => {
      try {
        const latest = await api.getLatestReport();
        if (latest) { setReport(latest); setSelectedDate(latest.date); }
        else setNotFound(true);
      } catch { setNotFound(true); }
      finally { setLoading(false); }
    })();
  }, []);

  const fetchReport = useCallback(async (date: string) => {
    if (!date) return;
    setLoading(true); setNotFound(false); setReport(null);
    try {
      const data = await api.getReport(date);
      setReport(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.toLowerCase().includes('not found') || msg.includes('404')) {
        setNotFound(true); toast.error(`No report found for ${date}`);
      } else { toast.error(`Failed to load report: ${msg}`); }
    } finally { setLoading(false); }
  }, []);

  const handleExport = async () => {
    if (!report) return;
    setExporting(true);
    try { await exportToExcel(report, partTypes); toast.success('Excel exported!'); }
    catch { toast.error('Export failed. Please try again.'); }
    finally { setExporting(false); }
  };

  const d = report;
  let _sl = 0;
  const ns = () => ++_sl; // next serial

  return (
    <div className="space-y-4 animate-fade-in">

      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[#1A1A1A] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#C9A962]" />
            Daily Report History
          </h2>
          <p className="text-[#666666] text-sm mt-0.5">View saved daily reports by date</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex items-center">
            <Calendar className="w-4 h-4 text-[#999] absolute left-2.5 pointer-events-none" />
            <Input type="date" value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="pl-9 h-9 text-sm w-44 border-[#E5E5E5]" />
          </div>
          <Button
            onClick={() => { if (!selectedDate) { toast.error('Please select a date'); return; } fetchReport(selectedDate); }}
            disabled={loading || !selectedDate} size="sm"
            className="h-9 px-4 text-sm font-semibold"
            style={{ background: '#C9A962', color: '#1A1A1A' }}>
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            <span className="ml-1.5">{loading ? 'Loading...' : 'View Report'}</span>
          </Button>
          {d && (
            <Button variant="outline" size="sm"
              className="h-9 border-[#C9A962] text-[#C9A962] font-semibold"
              onClick={handleExport} disabled={exporting}>
              {exporting
                ? <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                : <Download className="w-3.5 h-3.5 mr-1.5" />}
              {exporting ? 'Exporting...' : 'Export Excel'}
            </Button>
          )}
        </div>
      </div>

      {/* ─── Empty / Not Found ───────────────────────────────────────────── */}
      {!d && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-[#E5E5E5]">
          <Calendar className="w-12 h-12 text-[#D4D4D4] mb-4" />
          {notFound
            ? <><p className="text-[#1A1A1A] font-semibold text-lg">No report found</p>
                <p className="text-[#666] text-sm mt-1">No report exists for {selectedDate}. Try another date.</p></>
            : <><p className="text-[#1A1A1A] font-semibold text-lg">Select a date</p>
                <p className="text-[#666] text-sm mt-1">Pick a date above and click View Report</p></>}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-24">
          <RefreshCw className="w-8 h-8 text-[#C9A962] animate-spin" />
        </div>
      )}

      {/* ─── Report Table ────────────────────────────────────────────────── */}
      {d && (() => {
        _sl = 0;
        const prod = d.production || [];
        const grouped = partTypes.map(pt => {
          const item = prod.find(p => p.partTypeId === pt.id);
          return { name: pt.name, target: item?.target || 0, actual: item?.actual || 0 };
        });
        const totalT = grouped.reduce((s, g) => s + g.target, 0);
        const totalA = grouped.reduce((s, g) => s + g.actual, 0);
        const ot = d.overtime || [];
        const otTotal = ot.reduce((s, e) => s + e.hours, 0);
        const ct = d.cycleTime;
        const pm = d.perManPerDay;
        const cot = d.cumulativeOT;
        const disp = d.dispatch || [];
        const u = d.utilities;
        const s2 = d.sales;
        const t = d.training;
        const q = d.qualityRatios;
        const cr = d.customerRejections || [];
        const sr = d.supplierRejections || [];

        return (
          <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden shadow-sm">
            {/* Title bar */}
            <div className="px-4 py-3 border-b border-[#E2E8F0] bg-[#1A1A2E] flex items-center justify-between">
              <div className="text-sm font-bold text-white uppercase tracking-wide">
                Daily Report —{' '}
                {new Date(d.date + 'T00:00:00').toLocaleDateString('en-IN', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                })}
              </div>
              <span className="text-xs text-white/50 font-medium flex items-center gap-1">
                <ChevronRight className="w-3 h-3" /> Submitted by: {d.createdBy || 'Admin'}
              </span>
            </div>

            {/* MP Legend */}
            <div className="flex items-center gap-3 px-4 py-2 border-b border-[#E2E8F0] bg-[#F8FAFC] text-[10px] flex-wrap">
              <span className="font-semibold text-[#64748B] uppercase tracking-wide">MP:</span>
              {([['S','#EF4444','Safety'],['Q','#8B5CF6','Quality'],['P','#3B82F6','Production'],
                ['C','#F59E0B','Common'],['D','#0EA5E9','Delivery'],['M','#EC4899','Manpower']] as [string,string,string][]).map(([k,c,l]) => (
                <span key={k} className="flex items-center gap-1">
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded text-white text-[9px] font-bold"
                    style={{ background: c }}>{k}</span>
                  <span className="text-[#64748B]">{l}</span>
                </span>
              ))}
              <span className="ml-auto flex items-center gap-3">
                {([[COLOR.ok,COLOR.okText,'On Target'],[COLOR.warn,COLOR.warnText,'Needs Attention'],[COLOR.bad,COLOR.badText,'Critical']] as [string,string,string][]).map(([bg,tc,lbl]) => (
                  <span key={lbl} className="flex items-center gap-1">
                    <span className="inline-block w-3 h-3 rounded-sm border border-black/10" style={{ background: bg }} />
                    <span style={{ color: tc }} className="font-medium">{lbl}</span>
                  </span>
                ))}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse" style={{ fontFamily: "'Segoe UI', Calibri, Arial, sans-serif" }}>
                <thead>
                  <tr style={{ background: '#1E293B', color: '#fff' }}>
                    <th className="border border-[#334155] px-2 py-2 text-center w-8 text-[10px]">SI</th>
                    <th className="border border-[#334155] px-2 py-2 text-left min-w-[240px] text-[11px]">Check Points</th>
                    <th className="border border-[#334155] px-2 py-2 text-center w-10 text-[10px]">MP</th>
                    <th className="border border-[#334155] px-2 py-2 text-center min-w-[70px] text-[10px]">Target</th>
                    <th className="border border-[#334155] px-2 py-2 text-center min-w-[130px] text-[10px]">Actual / Value</th>
                    <th className="border border-[#334155] px-2 py-2 text-left min-w-[160px] text-[10px]"
                      style={{ background: '#134E4A', color: '#6EE7B7' }}>Probable Causes</th>
                    <th className="border border-[#334155] px-2 py-2 text-left min-w-[160px] text-[10px]"
                      style={{ background: '#134E4A', color: '#6EE7B7' }}>Action Planned</th>
                    <th className="border border-[#334155] px-2 py-2 text-center w-24 text-[10px]"
                      style={{ background: '#134E4A', color: '#6EE7B7' }}>Responsible</th>
                    <th className="border border-[#334155] px-2 py-2 text-center w-24 text-[10px]"
                      style={{ background: '#134E4A', color: '#6EE7B7' }}>Target Date</th>
                  </tr>
                </thead>
                <tbody>

                  {/* ── 1. Safety ── */}
                  {(() => {
                    const entries = d.safety || [];
                    const hasSafety = entries.length > 0;
                    const ca = entries.flatMap(e => e.causeActions || []);
                    const n = ns();
                    return (
                      <ExcelRow key={n} sl={n} mp="S" isEven={n % 2 === 0}
                        checkpoint="Last day accident/Incident/Near Miss in nos. (Reported)" target="0"
                        valueCell={<ValCell val={hasSafety ? entries.map(e => `${e.type} (${e.count})`).join(', ') : '0'}
                          bg={hasSafety ? COLOR.warn : COLOR.ok} textColor={hasSafety ? COLOR.warnText : COLOR.okText} />}
                        causesRows={lines(ca,'cause')} actionRows={lines(ca,'action')}
                        responsibleRows={lines(ca,'responsible')} targetDateRows={lines(ca,'targetDate')} />
                    );
                  })()}

                  {/* ── 2. Customer Rejection ── */}
                  {(() => {
                    const count = d.customerRejectionCount || 0;
                    const n = ns();
                    return (
                      <ExcelRow key={n} sl={n} mp="Q" isEven={n % 2 === 0}
                        checkpoint="Last day Customer rejection (TML | ALW | PNR)" target="0 PPM"
                        valueCell={<ValCell val={count > 0 ? `${count} rejection${count>1?'s':''}` : '0'}
                          bg={count > 0 ? COLOR.bad : COLOR.ok} textColor={count > 0 ? COLOR.badText : COLOR.okText}
                          sub={count > 0 ? cr.map(r=>r.reason).join(' · ') : undefined} />}
                        causesRows={cr.map(r=>r.reason).filter(Boolean).join('\n')||'—'}
                        actionRows="—" responsibleRows="—" targetDateRows="—" />
                    );
                  })()}

                  {/* ── 3. Production ── */}
                  {(() => {
                    const n = ns();
                    return (
                      <ExcelRow key={n} sl={n} mp="P" isEven={n % 2 === 0}
                        checkpoint="Last Day Production" target={totalT}
                        valueCell={<ValCell val={`${totalA} / ${totalT}`}
                          bg={totalA >= totalT ? COLOR.ok : COLOR.warn}
                          textColor={totalA >= totalT ? COLOR.okText : COLOR.warnText}
                          sub={<span className="flex flex-wrap justify-center gap-2">
                            {grouped.map((g,i) => (
                              <span key={i} style={{color: g.actual>=g.target?COLOR.okText:COLOR.badText}}>
                                {g.name}: {g.actual}/{g.target}
                              </span>))}
                          </span>} />}
                        causesRows="—" actionRows="—" responsibleRows="—" targetDateRows="—" />
                    );
                  })()}

                  {/* ── 4. Cycle Time ── */}
                  {(() => {
                    const sum = ct.front + ct.rear;
                    const isHigh = sum > 2;
                    const n = ns();
                    return (
                      <ExcelRow key={n} sl={n} mp="P" isEven={n % 2 === 0}
                        checkpoint="Cycle Time (Front / Rear)" target="<2 Min"
                        valueCell={<ValCell val={`F: ${ct.front}m | R: ${ct.rear}m`}
                          bg={isHigh ? COLOR.warn : COLOR.ok} textColor={isHigh ? COLOR.warnText : COLOR.okText} />}
                        causesRows={lines(ct.causeActions||[],'cause')} actionRows={lines(ct.causeActions||[],'action')}
                        responsibleRows={lines(ct.causeActions||[],'responsible')} targetDateRows={lines(ct.causeActions||[],'targetDate')} />
                    );
                  })()}

                  {/* ── 5. Per Man Per Day ── */}
                  {(() => {
                    const isLow = pm.actual > 0 && pm.actual < pm.target;
                    const n = ns();
                    return (
                      <ExcelRow key={n} sl={n} mp="P" isEven={n % 2 === 0}
                        checkpoint="Per man per day prop shaft qty Yesterday" target={pm.target}
                        valueCell={<ValCell val={pm.actual}
                          bg={isLow ? COLOR.warn : COLOR.ok} textColor={isLow ? COLOR.warnText : COLOR.okText} />}
                        causesRows={lines(pm.causeActions||[],'cause')} actionRows={lines(pm.causeActions||[],'action')}
                        responsibleRows={lines(pm.causeActions||[],'responsible')} targetDateRows={lines(pm.causeActions||[],'targetDate')} />
                    );
                  })()}

                  {/* ── 6. OT Hours (daily) ── */}
                  {(() => {
                    const n = ns();
                    return (
                      <ExcelRow key={n} sl={n} mp="C" isEven={n % 2 === 0}
                        checkpoint="Last day OT hours (Prd,QA,Main,Mater,Engg,Planning)" target="0"
                        valueCell={<ValCell val={otTotal > 0 ? `${otTotal} hrs` : '0'}
                          bg={otTotal > 0 ? COLOR.warn : COLOR.ok} textColor={otTotal > 0 ? COLOR.warnText : COLOR.okText}
                          sub={otTotal > 0 ? ot.map(e=>`Dept ${e.departmentId||'?'}: ${e.hours}h`).join(' · ') : undefined} />}
                        causesRows={ot.map(e=>e.reason).filter(Boolean).join('\n')||'—'}
                        actionRows="—" responsibleRows="—" targetDateRows="—" />
                    );
                  })()}

                  {/* ── 7. Cumulative OT (CYAN) ── */}
                  {(() => {
                    const n = ns();
                    return (
                      <CyanRow key={n} sl={n} mp="C" checkpoint="Cumulative OT hours"
                        value={`${cot.todayCumulative} hrs`}
                        sub={`prev: ${cot.previousTotal} | today added: ${cot.yesterdayOT}`} />
                    );
                  })()}

                  {/* ── 8. Dispatch ── */}
                  {(() => {
                    const n = ns();
                    return (
                      <ExcelRow key={n} sl={n} mp="S" isEven={n % 2 === 0}
                        checkpoint="Last Day Dispatch (TML | ALW | PNR)" target="—"
                        valueCell={<ValCell val={disp.map(e=>`${e.customerId}: ${e.quantity}`).join(' | ')||'—'} bg={COLOR.na} />}
                        causesRows="—" actionRows="—" responsibleRows="—" targetDateRows="—" />
                    );
                  })()}

                  {/* ── 9. Production Plan Adherence ── */}
                  {(() => {
                    const m = d.productionPlanAdherence;
                    const missed = m.actual > 0 && m.actual < m.target;
                    const n = ns();
                    return (
                      <ExcelRow key={n} sl={n} mp="P" isEven={n % 2 === 0}
                        checkpoint="Production plan adherance %age (Yesterday)" target={pct(m.target)}
                        valueCell={<ValCell val={pct(m.actual)}
                          bg={missed ? COLOR.warn : COLOR.ok} textColor={missed ? COLOR.warnText : COLOR.okText} />}
                        causesRows={lines(m.causeActions||[],'cause')} actionRows={lines(m.causeActions||[],'action')}
                        responsibleRows={lines(m.causeActions||[],'responsible')} targetDateRows={lines(m.causeActions||[],'targetDate')} />
                    );
                  })()}

                  {/* ── 10. OTIF Schedule Adherence ── */}
                  {(() => {
                    const m = d.scheduleAdherence;
                    const missed = m.actual > 0 && m.actual < m.target;
                    const n = ns();
                    return (
                      <ExcelRow key={n} sl={n} mp="D" isEven={n % 2 === 0}
                        checkpoint="Ontime In Full schedule adherance %age (Yesterday)" target={pct(m.target)}
                        valueCell={<ValCell val={pct(m.actual)}
                          bg={missed ? COLOR.warn : COLOR.ok} textColor={missed ? COLOR.warnText : COLOR.okText} />}
                        causesRows={lines(m.causeActions||[],'cause')} actionRows={lines(m.causeActions||[],'action')}
                        responsibleRows={lines(m.causeActions||[],'responsible')} targetDateRows={lines(m.causeActions||[],'targetDate')} />
                    );
                  })()}

                  {/* ── 11. Material Shortage Loss ── */}
                  {(() => {
                    const m = d.materialShortageLoss;
                    const n = ns();
                    return (
                      <ExcelRow key={n} sl={n} mp="P" isEven={n % 2 === 0}
                        checkpoint="Production hours loss for material shortage" target="0"
                        valueCell={<ValCell val={m.actual > 0 ? `${m.actual} hrs` : '0'}
                          bg={m.actual > 0 ? COLOR.warn : COLOR.ok} textColor={m.actual > 0 ? COLOR.warnText : COLOR.okText} />}
                        causesRows={lines(m.causeActions||[],'cause')} actionRows={lines(m.causeActions||[],'action')}
                        responsibleRows={lines(m.causeActions||[],'responsible')} targetDateRows={lines(m.causeActions||[],'targetDate')} />
                    );
                  })()}

                  {/* ── 12. Line Quality Issue ── */}
                  {(() => {
                    const m = d.lineQualityIssues;
                    const n = ns();
                    return (
                      <ExcelRow key={n} sl={n} mp="P" isEven={n % 2 === 0}
                        checkpoint="Line Quality Issue" target="0"
                        valueCell={<ValCell val={m.actual}
                          bg={m.actual > 0 ? COLOR.warn : COLOR.ok} textColor={m.actual > 0 ? COLOR.warnText : COLOR.okText} />}
                        causesRows={lines(m.causeActions||[],'cause')} actionRows={lines(m.causeActions||[],'action')}
                        responsibleRows={lines(m.causeActions||[],'responsible')} targetDateRows={lines(m.causeActions||[],'targetDate')} />
                    );
                  })()}

                  {/* ── 13. Incoming Material Quality ── */}
                  {(() => {
                    const m = d.incomingMaterialQualityImpact;
                    const n = ns();
                    return (
                      <ExcelRow key={n} sl={n} mp="Q" isEven={n % 2 === 0}
                        checkpoint="Production line affected due to poor Quality of incoming material" target="0"
                        valueCell={<ValCell val={m.actual}
                          bg={m.actual > 0 ? COLOR.warn : COLOR.ok} textColor={m.actual > 0 ? COLOR.warnText : COLOR.okText} />}
                        causesRows={lines(m.causeActions||[],'cause')} actionRows={lines(m.causeActions||[],'action')}
                        responsibleRows={lines(m.causeActions||[],'responsible')} targetDateRows={lines(m.causeActions||[],'targetDate')} />
                    );
                  })()}

                  {/* ── 14. Absenteeism ── */}
                  {(() => {
                    const m = d.absenteeism;
                    const n = ns();
                    return (
                      <ExcelRow key={n} sl={n} mp="M" isEven={n % 2 === 0}
                        checkpoint="Unauthorised absentisim (Prd & Others)" target="0"
                        valueCell={<ValCell val={m.actual}
                          bg={m.actual > 0 ? COLOR.warn : COLOR.ok} textColor={m.actual > 0 ? COLOR.warnText : COLOR.okText} />}
                        causesRows={lines(m.causeActions||[],'cause')} actionRows={lines(m.causeActions||[],'action')}
                        responsibleRows={lines(m.causeActions||[],'responsible')} targetDateRows={lines(m.causeActions||[],'targetDate')} />
                    );
                  })()}

                  {/* ── 15. Machine Breakdown ── */}
                  {(() => {
                    const m = d.machineBreakdown;
                    const missed = m.actual > m.target;
                    const n = ns();
                    return (
                      <ExcelRow key={n} sl={n} mp="P" isEven={n % 2 === 0}
                        checkpoint="Breakdown of machine" target="30 min max"
                        valueCell={<ValCell val={m.actual > 0 ? `${m.actual} min` : '0'}
                          bg={missed ? COLOR.warn : COLOR.ok} textColor={missed ? COLOR.warnText : COLOR.okText} />}
                        causesRows={lines(m.causeActions||[],'cause')} actionRows={lines(m.causeActions||[],'action')}
                        responsibleRows={lines(m.causeActions||[],'responsible')} targetDateRows={lines(m.causeActions||[],'targetDate')} />
                    );
                  })()}

                  {/* ── 16. Electricity Daily ── */}
                  {(() => {
                    const n = ns();
                    return (
                      <ExcelRow key={n} sl={n} mp="C" isEven={n % 2 === 0}
                        checkpoint="Unit consumption Last Day (KVAH)" target="—"
                        valueCell={<ValCell val={`${u.electricityKVAH} kVAh`} bg={COLOR.na} sub={`Shift ${u.electricityShift}`} />}
                        causesRows="—" actionRows="—" responsibleRows="—" targetDateRows="—" />
                    );
                  })()}

                  {/* ── 17. Electricity YTD (PURPLE) ── */}
                  {(() => {
                    const n = ns();
                    return <PurpleRow key={n} sl={n} mp="C" checkpoint="Unit Consumption Till date (YTD)" value={`${u.cumulativeElectricity} kVAh`} />;
                  })()}

                  {/* ── 18. Diesel Daily ── */}
                  {(() => {
                    const n = ns();
                    return (
                      <ExcelRow key={n} sl={n} mp="C" isEven={n % 2 === 0}
                        checkpoint="Diesel consumption Last Day (LTR)" target="0"
                        valueCell={<ValCell val={`${u.dieselLTR} L`}
                          bg={u.dieselLTR > 0 ? COLOR.warn : COLOR.ok}
                          textColor={u.dieselLTR > 0 ? COLOR.warnText : COLOR.okText}
                          sub={`Shift ${u.dieselShift}`} />}
                        causesRows="—" actionRows="—" responsibleRows="—" targetDateRows="—" />
                    );
                  })()}

                  {/* ── 19. Diesel YTD (PURPLE) ── */}
                  {(() => {
                    const n = ns();
                    return <PurpleRow key={n} sl={n} mp="C" checkpoint="Diesel consumption Till date (LTR)" value={`${u.cumulativeDiesel} L`} target="0" />;
                  })()}

                  {/* ── 20. Power Factor ── */}
                  {(() => {
                    const n = ns();
                    return (
                      <ExcelRow key={n} sl={n} mp="C" isEven={n % 2 === 0}
                        checkpoint="Power Factor" target="95–99"
                        valueCell={<ValCell val={u.powerFactor > 0 ? pct(u.powerFactor) : '—'}
                          bg={u.powerFactor >= 95 ? COLOR.ok : (u.powerFactor === 0 ? COLOR.na : COLOR.warn)}
                          textColor={u.powerFactor >= 95 ? COLOR.okText : (u.powerFactor === 0 ? COLOR.naText : COLOR.warnText)} />}
                        causesRows="—" actionRows="—" responsibleRows="—" targetDateRows="—" />
                    );
                  })()}

                  {/* ── 21. Sales ── */}
                  {(() => {
                    const n = ns();
                    return (
                      <ExcelRow key={n} sl={n} mp="C" isEven={n % 2 === 0}
                        checkpoint="Sales Values (Last Day & Cumm)" target="—"
                        valueCell={<ValCell val={`₹${s2.dailySales}L`} bg={COLOR.na} sub={`Cumm: ₹${s2.cumulativeSales}L`} />}
                        causesRows="—" actionRows="—" responsibleRows="—" targetDateRows="—" />
                    );
                  })()}

                  {/* ── 22. Training Daily ── */}
                  {(() => {
                    const n = ns();
                    return (
                      <ExcelRow key={n} sl={n} mp="M" isEven={n % 2 === 0}
                        checkpoint={`Last day training hours${t.topic ? ` — ${t.topic}` : ''}`}
                        target="30 min"
                        valueCell={<ValCell val={`${t.dailyHours} hrs`}
                          bg={t.dailyHours >= 0.5 ? COLOR.ok : COLOR.warn}
                          textColor={t.dailyHours >= 0.5 ? COLOR.okText : COLOR.warnText} />}
                        causesRows="—" actionRows="—" responsibleRows="—" targetDateRows="—" />
                    );
                  })()}

                  {/* ── 23. Cumulative Training (CYAN) ── */}
                  {(() => {
                    const n = ns();
                    return <CyanRow key={n} sl={n} mp="M" checkpoint="Cumulative training hours" value={`${t.cumulativeHours} hrs`} />;
                  })()}

                  {/* ── 24. 1st Pass OK ── */}
                  {(() => {
                    const missed = q.firstPassOKRatio > 0 && q.firstPassOKRatio < 100;
                    const n = ns();
                    return (
                      <ExcelRow key={n} sl={n} mp="Q" isEven={n % 2 === 0}
                        checkpoint="Last day 1st pass ok Ratio" target="100%"
                        valueCell={<ValCell val={q.firstPassOKRatio > 0 ? pct(q.firstPassOKRatio) : '—'}
                          bg={missed ? COLOR.warn : COLOR.ok} textColor={missed ? COLOR.warnText : COLOR.okText} />}
                        causesRows={lines(q.firstPassCauseActions||[],'cause')} actionRows={lines(q.firstPassCauseActions||[],'action')}
                        responsibleRows={lines(q.firstPassCauseActions||[],'responsible')} targetDateRows={lines(q.firstPassCauseActions||[],'targetDate')} />
                    );
                  })()}

                  {/* ── 25. 1st Pass PDI ── */}
                  {(() => {
                    const missed = q.pdiRatio > 0 && q.pdiRatio < 100;
                    const n = ns();
                    return (
                      <ExcelRow key={n} sl={n} mp="Q" isEven={n % 2 === 0}
                        checkpoint="Last Day 1st Pass ok Ratio-PDI" target="100%"
                        valueCell={<ValCell val={q.pdiRatio > 0 ? pct(q.pdiRatio) : '—'}
                          bg={missed ? COLOR.warn : COLOR.ok} textColor={missed ? COLOR.warnText : COLOR.okText} />}
                        causesRows={lines(q.pdiCauseActions||[],'cause')} actionRows={lines(q.pdiCauseActions||[],'action')}
                        responsibleRows={lines(q.pdiCauseActions||[],'responsible')} targetDateRows={lines(q.pdiCauseActions||[],'targetDate')} />
                    );
                  })()}

                  {/* ── 26. Supplier Rejection (PURPLE) ── */}
                  {(() => {
                    const count = d.supplierRejectionCount || 0;
                    const n = ns();
                    return (
                      <PurpleRow key={n} sl={n} mp="Q" checkpoint="Last day supplier rejection" target="0 PPM"
                        value={<>
                          {count > 0 ? `${count} rejection${count>1?'s':''}` : '0'}
                          {count > 0 && <div className="text-[9px] font-normal opacity-70 mt-0.5">
                            {sr.map(r=>r.reason||r.supplierId).join(' · ')}
                          </div>}
                        </>} />
                    );
                  })()}

                  {/* ── 27. PDI Issue ── */}
                  {(() => {
                    const m = d.pdiIssues;
                    const n = ns();
                    return (
                      <ExcelRow key={n} sl={n} mp="Q" isEven={n % 2 === 0}
                        checkpoint="Last Day PDI Issue" target="0"
                        valueCell={<ValCell val={yesNo(m.hasIssue)}
                          bg={m.hasIssue ? COLOR.bad : COLOR.ok} textColor={m.hasIssue ? COLOR.badText : COLOR.okText} />}
                        causesRows={lines(m.causeActions||[],'cause')} actionRows={lines(m.causeActions||[],'action')}
                        responsibleRows={lines(m.causeActions||[],'responsible')} targetDateRows={lines(m.causeActions||[],'targetDate')} />
                    );
                  })()}

                  {/* ── 28. Field Complaints ── */}
                  {(() => {
                    const m = d.fieldComplaints;
                    const n = ns();
                    return (
                      <ExcelRow key={n} sl={n} mp="Q" isEven={n % 2 === 0}
                        checkpoint="Last day field complaints/Issue reported in numbers" target="0 Nos"
                        valueCell={<ValCell val={yesNo(m.hasIssue)}
                          bg={m.hasIssue ? COLOR.bad : COLOR.ok} textColor={m.hasIssue ? COLOR.badText : COLOR.okText} />}
                        causesRows={lines(m.causeActions||[],'cause')} actionRows={lines(m.causeActions||[],'action')}
                        responsibleRows={lines(m.causeActions||[],'responsible')} targetDateRows={lines(m.causeActions||[],'targetDate')} />
                    );
                  })()}

                  {/* ── 29. SOP Non-Adherence ── */}
                  {(() => {
                    const m = d.sopNonAdherence;
                    const n = ns();
                    return (
                      <ExcelRow key={n} sl={n} mp="Q" isEven={n % 2 === 0}
                        checkpoint="Is there any SOP non adherance found in yesterdays LPA audit" target="—"
                        valueCell={<ValCell val={yesNo(m.hasIssue)}
                          bg={m.hasIssue ? COLOR.warn : COLOR.ok} textColor={m.hasIssue ? COLOR.warnText : COLOR.okText} />}
                        causesRows={lines(m.causeActions||[],'cause')} actionRows={lines(m.causeActions||[],'action')}
                        responsibleRows={lines(m.causeActions||[],'responsible')} targetDateRows={lines(m.causeActions||[],'targetDate')} />
                    );
                  })()}

                  {/* ── 30. Fixture Issues ── */}
                  {(() => {
                    const m = d.fixtureIssues;
                    const n = ns();
                    return (
                      <ExcelRow key={n} sl={n} mp="D" isEven={n % 2 === 0}
                        checkpoint="Line Issue/Stop Due to fixtures" target="0"
                        valueCell={<ValCell val={yesNo(m.hasIssue)}
                          bg={m.hasIssue ? COLOR.warn : COLOR.ok} textColor={m.hasIssue ? COLOR.warnText : COLOR.okText} />}
                        causesRows={lines(m.causeActions||[],'cause')} actionRows={lines(m.causeActions||[],'action')}
                        responsibleRows={lines(m.causeActions||[],'responsible')} targetDateRows={lines(m.causeActions||[],'targetDate')} />
                    );
                  })()}

                  {/* ── 31. Pallet / Trolley ── */}
                  {(() => {
                    const m = d.palletTrolleyIssues;
                    const n = ns();
                    return (
                      <ExcelRow key={n} sl={n} mp="P" isEven={n % 2 === 0}
                        checkpoint="Any Issue Related to Pallets Or Trolley (Internal & External)" target="0"
                        valueCell={<ValCell val={yesNo(m.hasIssue)}
                          bg={m.hasIssue ? COLOR.warn : COLOR.ok} textColor={m.hasIssue ? COLOR.warnText : COLOR.okText} />}
                        causesRows={lines(m.causeActions||[],'cause')} actionRows={lines(m.causeActions||[],'action')}
                        responsibleRows={lines(m.causeActions||[],'responsible')} targetDateRows={lines(m.causeActions||[],'targetDate')} />
                    );
                  })()}

                  {/* ── Extra fields not in screenshot but present in data ── */}
                  {d.materialShortageIssue && (() => {
                    const ms = d.materialShortageIssue;
                    const qty = ms.quantity || 0;
                    const n = ns();
                    return (
                      <ExcelRow key={n} sl={n} mp="P" isEven={n % 2 === 0}
                        checkpoint="Material Shortage Issue" target="0"
                        valueCell={<ValCell val={qty > 0 ? `${qty} nos` : '0'}
                          bg={qty > 0 ? COLOR.warn : COLOR.ok} textColor={qty > 0 ? COLOR.warnText : COLOR.okText} />}
                        causesRows={lines(ms.causeActions||[],'cause')} actionRows={lines(ms.causeActions||[],'action')}
                        responsibleRows={lines(ms.causeActions||[],'responsible')} targetDateRows={lines(ms.causeActions||[],'targetDate')} />
                    );
                  })()}

                  {d.otherCriticalIssue && (() => {
                    const m = d.otherCriticalIssue;
                    const n = ns();
                    return (
                      <ExcelRow key={n} sl={n} mp="P" isEven={n % 2 === 0}
                        checkpoint="Other Critical Issue" target="0"
                        valueCell={<ValCell val={yesNo(m.hasIssue)}
                          bg={m.hasIssue ? COLOR.bad : COLOR.ok} textColor={m.hasIssue ? COLOR.badText : COLOR.okText} />}
                        causesRows={lines(m.causeActions||[],'cause')} actionRows={lines(m.causeActions||[],'action')}
                        responsibleRows={lines(m.causeActions||[],'responsible')} targetDateRows={lines(m.causeActions||[],'targetDate')} />
                    );
                  })()}

                  {d.otherField1 && (() => {
                    const n = ns();
                    return (
                      <ExcelRow key={n} sl={n} mp="—" isEven={n % 2 === 0}
                        checkpoint="Others / Remarks" target="—"
                        valueCell={<ValCell val={d.otherField1} bg={COLOR.na} />}
                        causesRows="—" actionRows="—" responsibleRows="—" targetDateRows="—" />
                    );
                  })()}

                  {d.otherField2 && (() => {
                    const n = ns();
                    return (
                      <ExcelRow key={n} sl={n} mp="—" isEven={n % 2 === 0}
                        checkpoint="Others / Remarks 2" target="—"
                        valueCell={<ValCell val={d.otherField2} bg={COLOR.na} />}
                        causesRows="—" actionRows="—" responsibleRows="—" targetDateRows="—" />
                    );
                  })()}

                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-[#E2E8F0] bg-[#F8FAFC] text-[10px] text-[#94A3B8] flex items-center justify-between">
              <span>Report Date: <span className="font-semibold text-[#64748B]">{d.date}</span></span>
            </div>
          </div>
        );
      })()}
    </div>
  );
}