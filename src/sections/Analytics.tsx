import { useState, useEffect, useMemo } from 'react';
import * as api from '@/lib/api';
import { toast } from 'sonner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ComposedChart, ReferenceLine
} from 'recharts';
// ─── Types ───────────────────────────────────────────────────────────────────
export interface DailyTrendItem { date: string; [key: string]: any }
export interface AnalyticsField {
  field: string; label: string; [key: string]: any;
  daily_trend: DailyTrendItem[];
}
export interface AnalyticsData {
  month: string; report_count: number; analytics: AnalyticsField[];
}

import { useMasterData } from '@/context/MasterDataContext';


// ─── Helpers ─────────────────────────────────────────────────────────────────
const G = {
  gold: '#C9A962', dark: '#1A1A1A', gray: '#666666', light: '#E5E5E5',
  amber: '#F59E0B', red: '#EF4444', green: '#22C55E', blue: '#3B82F6',
  purple: '#8B5CF6', teal: '#14B8A6', rose: '#F43F5E', indigo: '#6366F1',
  orange: '#FFA500',
};
const PALETTE = [G.gold, G.blue, G.green, G.purple, G.teal, G.rose, G.amber, G.indigo];

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}`;
};

const tip = {
  contentStyle: { backgroundColor: '#1A1A1A', border: 'none', borderRadius: 6, color: '#fff', fontSize: 12 },
  itemStyle: { color: '#C9A962' },
  labelStyle: { color: '#999', marginBottom: 4 },
};

const AXIS = { stroke: '#999', fontSize: 11 };

// ─── Sub-components ───────────────────────────────────────────────────────────
function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-1 h-8 bg-[#C9A962] rounded-full" />
      <div>
        <h3 className="text-base font-semibold text-[#1A1A1A] leading-tight">{title}</h3>
        {sub && <p className="text-xs text-[#999] mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-[#F0F0F0] p-5 ${className}`}>
      {children}
    </div>
  );
}

function KpiPill({ label, value, color = G.gold }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="flex flex-col items-center justify-center bg-[#FAFAFA] rounded-xl p-4 border border-[#F0F0F0]">
      <span className="text-2xl font-bold" style={{ color }}>{value}</span>
      <span className="text-xs text-[#999] mt-1 text-center leading-tight">{label}</span>
    </div>
  );
}

function ChartWrap({ h = 220, children }: { h?: number; children: React.ReactNode }) {
  return <div style={{ height: h }}><ResponsiveContainer width="100%" height="100%">{children as any}</ResponsiveContainer></div>;
}

// ─── Main Analytics Component ────────────────────────────────────────────────
export default function Analytics() {
  // const [selectedMonth, setSelectedMonth] = useState(
  //   () => new Date().toISOString().slice(0, 7)
  // );
  const selectedMonth=new Date().toISOString().slice(0, 7);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const response = await api.getMonthlyAnalytics(selectedMonth);
        console.log("response",response);
        setData(response as AnalyticsData);
      } catch (err) {
        toast.error('Failed to load analytics data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedMonth]);

  useEffect(()=>{
    console.log("data",data);
    console.log("setloading",loading);
  },[data,loading]);

  if (loading || !data) return <div className="p-10 text-center text-[#999]">Loading analytics...</div>;

  return <AnalyticsContent data={data} />;
}

function AnalyticsContent({ data }: { data: AnalyticsData }) {
  const get = (field: string) => data.analytics.find(a => a.field === field) || { 
    daily_trend: [], by_part_type: [], by_department: [], by_machine: [], 
    by_customer: [], by_supplier: [], by_type: [],
    // Add common fallback numeric properties to avoid 'undefined' math
    cumulative_target: 0, cumulative_actual: 0, total_incidents: 0, 
    avg_actual: 0, total_ot_hours: 0, current_cumulative: 0,
    total_absent_person_days: 0, total_breakdown_minutes: 0, total_qty: 0,
    current_cumulative_lakhs: 0, total_hours_lost: 0, total_issues: 0,
    total_complaints: 0, total_days_with_issues: 0, total_days_with_shortage: 0,
    total_kvah: 0, current_cumulative_kvah: 0, total_ltr: 0, current_cumulative_ltr: 0
  } as any;

  const { partTypes } = useMasterData();

  // ── processed data ──────────────────────────────────────────────────────
  const prodDays = useMemo(() => get('f03_production').daily_trend.map((d: any) => ({
    date: fmtDate(d.date), target: d.target, actual: d.actual,
    eff: d.target ? +((d.actual / d.target) * 100).toFixed(1) : 0,
  })), [data]);

  const ctDays = useMemo(() => get('f04_cycle_time').daily_trend
    .filter((d: any) => d.avg != null)
    .map((d: any) => ({ date: fmtDate(d.date), front: d.front, rear: d.rear, avg: d.avg, target: d.target })), [data]);

  const partPie = useMemo(() => (get('f03_production').by_part_type || []).map((p: any) => ({
    name: partTypes[parseInt(p.partTypeId)]?.name || `Part ${p.partTypeId}`,
    value: p.actual,
    target: p.target,
  })), [data, partTypes]);

  const custRejDays = useMemo(() => get('f02_customer_rejection').daily_trend.map((d: any) => ({
    date: fmtDate(d.date), ppm: d.total_ppm, target: get('f02_customer_rejection').target_ppm,
  })), [data]);

  const planAdh = useMemo(() => get('f09_prod_plan_adherence').daily_trend.map((d: any) => ({
    date: fmtDate(d.date), actual: d.actual, target: d.target,
  })), [data]);

  const otif = useMemo(() => get('f10_otif_adherence').daily_trend.map((d: any) => ({
    date: fmtDate(d.date), actual: d.actual, target: d.target,
  })), [data]);

  const otDays = useMemo(() => get('f06_ot_hours_last_day').daily_trend.map((d: any) => ({
    date: fmtDate(d.date), ot: d.total_ot,
  })), [data]);

  const otByDept = useMemo(() => (get('f06_ot_hours_last_day').by_department || []).map((d: any) => ({
    name: d.department, hours: d.total_hours,
  })), [data]);

  const otCum = useMemo(() => get('f07_ot_hours_cumulative').daily_trend.map((d: any) => ({
    date: fmtDate(d.date), cumulative: d.cumulative,
  })), [data]);

  const machBreakdownByMachine = useMemo(() => (get('f15_machine_breakdown').by_machine || []).map((m: any) => ({
    name: m.machine, minutes: m.total_minutes, count: m.count,
  })), [data]);

  const machDays = useMemo(() => get('f15_machine_breakdown').daily_trend.map((d: any) => ({
    date: fmtDate(d.date), minutes: d.total_minutes, target: get('f15_machine_breakdown').target_minutes,
  })), [data]);

  const dieselDays = useMemo(() => {
    // Backend consolidated diesel (f18) into f16
    const f16 = get('f16_unit_consumption_last_day');
    return f16.daily_trend.map((d: any) => ({
      date: fmtDate(d.date), actual: d.quantity_ltr || 0, target: d.target_diesel || 100,
    }));
  }, [data]);

  const dieselCum = useMemo(() => {
    // f19 consolidated into f16
    const f16 = get('f16_unit_consumption_last_day');
    return f16.daily_trend.map((d: any) => ({
      date: fmtDate(d.date), ltr: d.cumulative_ltr || 0,
    }));
  }, [data]);

  const salesDays = useMemo(() => get('f21_sales').daily_trend.map((d: any) => ({
    date: fmtDate(d.date), daily: d.last_day_lakhs, cumulative: d.cumulative_lakhs,
  })), [data]);

  const trainingDays = useMemo(() => get('f22_training_last_day').daily_trend.map((d: any) => ({
    date: fmtDate(d.date), actual: d.training_minutes || (d.training_hours * 60) || 0, target: d.target || 30,
  })), [data]);

  const trainingCum = useMemo(() => {
    // training ytd consolidated into training_last_day
    const f22 = get('f22_training_last_day');
    return f22.daily_trend.map((d: any) => ({
      date: fmtDate(d.date), minutes: d.cumulative_minutes || (d.cumulative_hours * 60) || 0,
    }));
  }, [data]);

  const fpass = useMemo(() => get('f24_first_pass_ok').daily_trend.map((d: any) => ({
    date: fmtDate(d.date), actual: d.actual || d.first_pass_ok_percentage || 0, target: d.target || 100,
  })), [data]);

  const pdiRatio = useMemo(() => {
    const f24 = get('f24_first_pass_ok');
    return f24.daily_trend
      .filter((d: any) => (d.pdi_ratio || d.actual) > 0)
      .map((d: any) => ({ date: fmtDate(d.date), actual: d.pdi_ratio || d.actual, target: d.target || 100 }));
  }, [data]);

  const qualityRadar = useMemo(() => {
    const f24 = get('f24_first_pass_ok');
    return [
      { metric: 'First Pass OK', value: f24.avg_first_pass || f24.avg_actual || 0 },
      { metric: 'PDI Ratio', value: f24.avg_pdi || 0 },
      { metric: 'OTIF', value: get('f10_otif_adherence').avg_actual || 0 },
      { metric: 'Plan Adh.', value: get('f09_prod_plan_adherence').avg_actual || 0 },
      { metric: 'Power Factor', value: get('f16_unit_consumption_last_day').avg_power_factor || 0 },
    ];
  }, [data]);

  const issuesTrend = useMemo(() => {
    const dates = get('f12_line_quality_issue').daily_trend.map((d: any) => fmtDate(d.date));
    return dates.map((date: string, i: number) => ({
      date,
      lineQuality: get('f12_line_quality_issue').daily_trend[i].actual,
      pdiIssue: get('f27_pdi_issue').daily_trend[i].issue_count,
      fieldComplaints: get('f28_field_complaints').daily_trend[i].quantity,
      sopIssues: get('f29_sop_non_adherence').daily_trend[i].found,
      fixtureIssue: get('f30_fixture_issue').daily_trend[i].has_issue,
      materialShortage: get('f32_material_shortage').daily_trend[i].has_issue,
      otherCritical: get('f33_other_critical_issue').daily_trend[i].has_issue,
    }));
  }, [data]);

  const issuesPie = useMemo(() => [
    { name: 'Line Quality', value: get('f12_line_quality_issue').total_issues },
    { name: 'PDI Issues', value: get('f27_pdi_issue').total_issues },
    { name: 'Field Complaints', value: get('f28_field_complaints').total_complaints },
    { name: 'Fixture Issues', value: get('f30_fixture_issue').total_days_with_issues },
    { name: 'Material Shortage', value: get('f32_material_shortage').total_days_with_shortage },
    { name: 'SOP Non-adh.', value: get('f29_sop_non_adherence').total_issues },
  ].filter(d => d.value > 0), [data]);

  const supplierRejDays = useMemo(() => get('f26_supplier_rejection').daily_trend.map((d: any) => ({
    date: fmtDate(d.date), qty: d.total_qty,
  })), [data]);

  const absenceeDays = useMemo(() => get('f14_absenteeism').daily_trend.map((d: any) => ({
    date: fmtDate(d.date), absent: d.absent_count,
  })), [data]);

  const incomingMatDays = useMemo(() => get('f13_poor_incoming_material').daily_trend.map((d: any) => ({
    date: fmtDate(d.date), qty: d.quantity,
  })), [data]);

  const perManDays = useMemo(() => get('f05_per_man_per_day').daily_trend
    .filter((d: any) => d.target > 0)
    .map((d: any) => ({ date: fmtDate(d.date), actual: d.actual, target: d.target })), [data]);

  const dispatchDays = useMemo(() => get('f08_dispatch').daily_trend.map((d: any) => ({
    date: fmtDate(d.date), front: d.total_front, rear: d.total_rear, ia: d.total_ia,
  })), [data]);

  const powerFactorDays = useMemo(() => {
    // f20 consolidated into f16
    const f16 = get('f16_unit_consumption_last_day');
    return f16.daily_trend
      .filter((d: any) => (d.power_factor || d.actual) > 0)
      .map((d: any) => ({ date: fmtDate(d.date), actual: d.power_factor || d.actual, target: d.target || 99 }));
  }, [data]);

  const prodHoursLoss = useMemo(() => get('f11_prod_hours_loss').daily_trend.map((d: any) => ({
    date: fmtDate(d.date), hours: d.actual_hours,
  })), [data]);

  const kvahDays = useMemo(() => get('f16_unit_consumption_last_day').daily_trend
    .filter((d: any) => (d.units_kvah || d.kvah) > 0)
    .map((d: any) => ({ date: fmtDate(d.date), kvah: d.units_kvah || d.kvah })), [data]);

  const accByType = useMemo(() => get('f01_accident').by_type.map((t: any) => ({
    name: t.type, value: t.count,
  })).filter((t: any) => t.value > 0), [data]);

  // top-line KPIs
  const prod = get('f03_production');
  const prodEff = +((prod.cumulative_actual / prod.cumulative_target) * 100).toFixed(1);
  // const f1 = get('f01_accident');



  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 bg-[#F6F6F6] min-h-screen p-6">
      {/* ── Header ── */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-[#C9A962] mb-1">Manufacturing Intelligence</p>
          <h1 className="text-3xl font-bold text-[#1A1A1A]">Analytics Dashboard</h1>
          <p className="text-sm text-[#999] mt-1">April 2025 · {data.report_count} daily reports</p>
        </div>
        <div className="flex gap-2">
          {[
            { label: 'Production Eff.', value: `${prodEff}%`, color: prodEff >= 95 ? G.green : G.amber },
            { label: 'OTIF Avg', value: `${get('f10_otif_adherence').avg_actual || 0}%`, color: G.blue },
            { label: 'Incidents', value: get('f01_accident').total_incidents || 0, color: G.red },
            { label: 'Total Sales', value: `₹${get('f21_sales').current_cumulative_lakhs || get('f21_sales').current_cumulative_sales || 0}L`, color: G.gold },
          ].map(k => (
            <div key={k.label} className="bg-white rounded-xl px-4 py-3 shadow-sm border border-[#F0F0F0] text-center min-w-[90px]">
              <div className="text-xl font-bold" style={{ color: k.color }}>{k.value}</div>
              <div className="text-[10px] text-[#999] mt-0.5 leading-tight">{k.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 1: PRODUCTION
      ══════════════════════════════════════════════════════════════════════ */}
      <div>
        <SectionHeader title="Production" sub="Output, efficiency & plan adherence" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <KpiPill label="Cumulative Target" value={prod.cumulative_target} color={G.gray} />
          <KpiPill label="Cumulative Actual" value={prod.cumulative_actual} color={G.gold} />
          <KpiPill label="Overall Efficiency" value={`${prodEff}%`} color={prodEff >= 95 ? G.green : G.amber} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Daily Production vs Target */}
          <Card className="lg:col-span-2">
            <p className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-3">Daily: Target vs Actual</p>
            <ChartWrap h={220}>
              <ComposedChart data={prodDays}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis dataKey="date" {...AXIS} />
                <YAxis {...AXIS} />
                <Tooltip {...tip} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="target" fill={G.light} name="Target" radius={[3,3,0,0]} />
                <Bar dataKey="actual" fill={G.gold} name="Actual" radius={[3,3,0,0]} />
                <Line type="monotone" dataKey="eff" stroke={G.green} strokeWidth={2} dot={false} name="Eff %" yAxisId="right" />
                <YAxis yAxisId="right" orientation="right" {...AXIS} domain={[80, 100]} unit="%" />
              </ComposedChart>
            </ChartWrap>
          </Card>

          {/* Part-wise Pie */}
          <Card>
            <p className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-3">Part-wise Split (Actual)</p>
            <ChartWrap h={220}>
              <PieChart>
                <Pie data={partPie} dataKey="value" nameKey="name" cx="50%" cy="50%"
                  innerRadius={50} outerRadius={80} paddingAngle={4}
                  label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {partPie.map((_: any, i: number) => <Cell key={i} fill={PALETTE[i]} />)}
                </Pie>
                <Tooltip {...tip} />
              </PieChart>
            </ChartWrap>
          </Card>

          {/* Plan Adherence */}
          <Card>
            <p className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-3">F09 · Plan Adherence %</p>
            <ChartWrap h={180}>
              <LineChart data={planAdh}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis dataKey="date" {...AXIS} />
                <YAxis {...AXIS} domain={[0, 100]} />
                <Tooltip {...tip} formatter={(v: any) => `${v}%`} />
                <ReferenceLine y={95} stroke={G.red} strokeDasharray="4 2" label={{ value: 'Target', fontSize: 10, fill: G.red }} />
                <Line type="monotone" dataKey="actual" stroke={G.gold} strokeWidth={2} dot={{ r: 4, fill: G.gold }} />
              </LineChart>
            </ChartWrap>
          </Card>

          {/* OTIF */}
          <Card>
            <p className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-3">F10 · OTIF Adherence %</p>
            <ChartWrap h={180}>
              <AreaChart data={otif}>
                <defs>
                  <linearGradient id="otifGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={G.blue} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={G.blue} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis dataKey="date" {...AXIS} />
                <YAxis {...AXIS} domain={[88, 102]} />
                <Tooltip {...tip} formatter={(v: any) => `${v}%`} />
                <ReferenceLine y={100} stroke={G.red} strokeDasharray="4 2" />
                <Area type="monotone" dataKey="actual" stroke={G.blue} strokeWidth={2} fill="url(#otifGrad)" />
              </AreaChart>
            </ChartWrap>
          </Card>

          {/* Per Man Per Day */}
          <Card>
            <p className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-3">F05 · Per Man Per Day</p>
            <div className="flex items-center gap-4 mb-3">
              <KpiPill label="Avg Actual" value={get('f05_per_man_per_day').avg_actual} color={G.purple} />
            </div>
            <ChartWrap h={130}>
              <BarChart data={perManDays}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis dataKey="date" {...AXIS} />
                <YAxis {...AXIS} />
                <Tooltip {...tip} />
                <Bar dataKey="target" fill={G.light} name="Target" radius={[2,2,0,0]} />
                <Bar dataKey="actual" fill={G.purple} name="Actual" radius={[2,2,0,0]} />
              </BarChart>
            </ChartWrap>
          </Card>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 2: QUALITY
      ══════════════════════════════════════════════════════════════════════ */}
      <div>
        <SectionHeader title="Quality" sub="Rejections, first-pass ratios & PDI" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <KpiPill label="Customer Rej. (TML PPM)" value={get('f02_customer_rejection').by_customer?.[0]?.total_ppm ?? 0} color={G.red} />
          <KpiPill label="1st Pass OK Avg %" value={`${get('f24_first_pass_ok').avg_first_pass || get('f24_first_pass_ok').avg_actual || 0}%`} color={G.green} />
          <KpiPill label="PDI Ratio Avg %" value={`${get('f24_first_pass_ok').avg_pdi || 0}%`} color={G.teal} />
          <KpiPill label="Supplier Rej. Qty" value={get('f26_supplier_rejection').by_supplier?.[0]?.total_qty ?? 0} color={G.amber} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Customer Rejection PPM */}
          <Card>
            <p className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-3">F02 · Customer Rejection PPM</p>
            <ChartWrap h={200}>
              <ComposedChart data={custRejDays}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis dataKey="date" {...AXIS} />
                <YAxis {...AXIS} />
                <Tooltip {...tip} />
                <ReferenceLine y={50} stroke={G.green} strokeDasharray="4 2" label={{ value: 'Target 50', fontSize: 10, fill: G.green }} />
                <Bar dataKey="ppm" fill={G.red} name="PPM" radius={[3,3,0,0]} />
              </ComposedChart>
            </ChartWrap>
          </Card>

          {/* 1st Pass OK */}
          <Card>
            <p className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-3">F24 · 1st Pass OK Ratio %</p>
            <ChartWrap h={200}>
              <AreaChart data={fpass}>
                <defs>
                  <linearGradient id="fpGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={G.green} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={G.green} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis dataKey="date" {...AXIS} />
                <YAxis {...AXIS} domain={[94, 101]} />
                <Tooltip {...tip} formatter={(v: any) => `${v}%`} />
                <ReferenceLine y={100} stroke={G.red} strokeDasharray="4 2" />
                <Area type="monotone" dataKey="actual" stroke={G.green} fill="url(#fpGrad)" strokeWidth={2} />
              </AreaChart>
            </ChartWrap>
          </Card>

          {/* PDI Ratio */}
          <Card>
            <p className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-3">F25 · 1st Pass PDI Ratio %</p>
            <ChartWrap h={200}>
              <BarChart data={pdiRatio}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis dataKey="date" {...AXIS} />
                <YAxis {...AXIS} domain={[90, 101]} />
                <Tooltip {...tip} formatter={(v: any) => `${v}%`} />
                <ReferenceLine y={100} stroke={G.red} strokeDasharray="4 2" />
                <Bar dataKey="actual" fill={G.teal} name="PDI Ratio %" radius={[4,4,0,0]} />
              </BarChart>
            </ChartWrap>
          </Card>

          {/* Supplier Rejection */}
          <Card>
            <p className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-3">F26 · Supplier Rejection Qty</p>
            <ChartWrap h={180}>
              <BarChart data={supplierRejDays}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis dataKey="date" {...AXIS} />
                <YAxis {...AXIS} />
                <Tooltip {...tip} />
                <Bar dataKey="qty" fill={G.amber} name="Qty Rejected" radius={[3,3,0,0]} />
              </BarChart>
            </ChartWrap>
          </Card>

          {/* Quality Radar */}
          <Card>
            <p className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-3">Quality KPI Radar</p>
            <ChartWrap h={180}>
              <RadarChart data={qualityRadar}>
                <PolarGrid stroke="#E0E0E0" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: '#999' }} />
                <PolarRadiusAxis angle={90} domain={[80, 100]} tick={{ fontSize: 9, fill: '#bbb' }} />
                <Radar name="Score" dataKey="value" stroke={G.gold} fill={G.gold} fillOpacity={0.25} />
                <Tooltip {...tip} formatter={(v: any) => `${v}%`} />
              </RadarChart>
            </ChartWrap>
          </Card>

          {/* Incoming Material */}
          <Card>
            <p className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-3">F13 · Poor Incoming Material Qty</p>
            <div className="mb-2"><KpiPill label="Total Qty" value={get('f13_poor_incoming_material').total_qty} color={G.rose} /></div>
            <ChartWrap h={120}>
              <BarChart data={incomingMatDays}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis dataKey="date" {...AXIS} />
                <YAxis {...AXIS} />
                <Tooltip {...tip} />
                <Bar dataKey="qty" fill={G.rose} radius={[3,3,0,0]} />
              </BarChart>
            </ChartWrap>
          </Card>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 3: CYCLE TIME & MACHINE
      ══════════════════════════════════════════════════════════════════════ */}
      <div>
        <SectionHeader title="Cycle Time & Machine Breakdown" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <KpiPill label="Avg Front CT (min)" value={get('f04_cycle_time').avg_front} color={G.blue} />
          <KpiPill label="Avg Rear CT (min)" value={get('f04_cycle_time').avg_rear} color={G.indigo} />
          <KpiPill label="CT Target (min)" value={get('f04_cycle_time').target_minutes} color={G.gray} />
          <KpiPill label="Total Breakdown (min)" value={get('f15_machine_breakdown').total_breakdown_minutes} color={G.red} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Cycle Time Trend */}
          <Card className="lg:col-span-2">
            <p className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-3">F04 · Cycle Time by Day (min)</p>
            <ChartWrap h={220}>
              <LineChart data={ctDays}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis dataKey="date" {...AXIS} />
                <YAxis {...AXIS} domain={[1.5, 3]} />
                <Tooltip {...tip} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <ReferenceLine y={2} stroke={G.green} strokeDasharray="4 2" label={{ value: 'Target 2min', fontSize: 10, fill: G.green }} />
                <Line type="monotone" dataKey="front" stroke={G.blue} strokeWidth={2} dot={{ r: 4 }} name="Front" />
                <Line type="monotone" dataKey="rear" stroke={G.indigo} strokeWidth={2} dot={{ r: 4 }} name="Rear" />
                <Line type="monotone" dataKey="avg" stroke={G.gold} strokeWidth={2} strokeDasharray="5 3" dot={false} name="Avg" />
              </LineChart>
            </ChartWrap>
          </Card>

          {/* Breakdown by Machine Pie */}
          <Card>
            <p className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-3">F15 · Breakdown by Machine</p>
            <ChartWrap h={220}>
              <PieChart>
                <Pie data={machBreakdownByMachine} dataKey="minutes" nameKey="name"
                  cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={5}
                  label={({ name, minutes }) => `${name.split(' ')[0]}: ${minutes}m`} labelLine={false}>
                  {machBreakdownByMachine.map((_: any, i: number) => <Cell key={i} fill={[G.red, G.amber][i % 2]} />)}
                </Pie>
                <Tooltip {...tip} formatter={(v: any) => `${v} min`} />
              </PieChart>
            </ChartWrap>
          </Card>

          {/* Breakdown daily */}
          <Card className="lg:col-span-3">
            <p className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-3">F15 · Machine Breakdown Minutes (Daily)</p>
            <ChartWrap h={180}>
              <ComposedChart data={machDays}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis dataKey="date" {...AXIS} />
                <YAxis {...AXIS} />
                <Tooltip {...tip} formatter={(v: any) => `${v} min`} />
                <ReferenceLine y={30} stroke={G.green} strokeDasharray="4 2" label={{ value: 'Target 30min', fontSize: 10, fill: G.green }} />
                <Bar dataKey="minutes" fill={G.red} name="Breakdown min" radius={[3,3,0,0]} />
              </ComposedChart>
            </ChartWrap>
          </Card>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 4: OVERTIME & WORKFORCE
      ══════════════════════════════════════════════════════════════════════ */}
      <div>
        <SectionHeader title="Overtime & Workforce" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <KpiPill label="Total OT Hours" value={get('f06_ot_hours_last_day').total_ot_hours} color={G.amber} />
          <KpiPill label="Cumulative OT" value={get('f07_ot_hours_cumulative').current_cumulative} color={G.orange} />
          <KpiPill label="Total Absent Person-Days" value={get('f14_absenteeism').total_absent_person_days} color={G.red} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* OT daily */}
          <Card>
            <p className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-3">F06 · Daily OT Hours</p>
            <ChartWrap h={180}>
              <BarChart data={otDays}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis dataKey="date" {...AXIS} />
                <YAxis {...AXIS} />
                <Tooltip {...tip} />
                <Bar dataKey="ot" fill={G.amber} name="OT Hours" radius={[3,3,0,0]} />
              </BarChart>
            </ChartWrap>
          </Card>

          {/* OT by Dept */}
          <Card>
            <p className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-3">F06 · OT by Department</p>
            <ChartWrap h={180}>
              <BarChart data={otByDept} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis type="number" {...AXIS} />
                <YAxis dataKey="name" type="category" {...AXIS} width={80} />
                <Tooltip {...tip} />
                <Bar dataKey="hours" fill={G.gold} name="Hours" radius={[0,3,3,0]} />
              </BarChart>
            </ChartWrap>
          </Card>

          {/* Cumulative OT */}
          <Card>
            <p className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-3">F07 · Cumulative OT Hours</p>
            <ChartWrap h={180}>
              <AreaChart data={otCum}>
                <defs>
                  <linearGradient id="otGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={G.amber} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={G.amber} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis dataKey="date" {...AXIS} />
                <YAxis {...AXIS} />
                <Tooltip {...tip} />
                <Area type="monotone" dataKey="cumulative" stroke={G.amber} fill="url(#otGrad)" strokeWidth={2} />
              </AreaChart>
            </ChartWrap>
          </Card>

          {/* Absenteeism */}
          <Card className="lg:col-span-3">
            <p className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-3">F14 · Unauthorised Absenteeism (Person-Days)</p>
            <ChartWrap h={160}>
              <BarChart data={absenceeDays}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis dataKey="date" {...AXIS} />
                <YAxis {...AXIS} />
                <Tooltip {...tip} />
                <Bar dataKey="absent" fill={G.rose} name="Absent Persons" radius={[3,3,0,0]} />
              </BarChart>
            </ChartWrap>
          </Card>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 5: ISSUES & INCIDENTS
      ══════════════════════════════════════════════════════════════════════ */}
      <div>
        <SectionHeader title="Issues, Incidents & Compliance" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <KpiPill label="Accidents / Near Miss" value={get('f01_accident').total_incidents} color={G.red} />
          <KpiPill label="Line Quality Issues" value={get('f12_line_quality_issue').total_issues} color={G.rose} />
          <KpiPill label="PDI Issues" value={get('f27_pdi_issue').total_issues} color={G.amber} />
          <KpiPill label="Field Complaints" value={get('f28_field_complaints').total_complaints} color={G.orange} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Issues distribution pie */}
          <Card>
            <p className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-3">Issue Distribution</p>
            <ChartWrap h={220}>
              <PieChart>
                <Pie data={issuesPie} dataKey="value" nameKey="name"
                  cx="50%" cy="50%" outerRadius={80} paddingAngle={4}
                  label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {issuesPie.map((_: any, i: number) => <Cell key={i} fill={PALETTE[i]} />)}
                </Pie>
                <Tooltip {...tip} />
              </PieChart>
            </ChartWrap>
          </Card>

          {/* Issues trend stacked */}
          <Card className="lg:col-span-2">
            <p className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-3">Daily Issues Overview (Stacked)</p>
            <ChartWrap h={220}>
              <BarChart data={issuesTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis dataKey="date" {...AXIS} />
                <YAxis {...AXIS} />
                <Tooltip {...tip} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="lineQuality" stackId="a" fill={G.red} name="Line Quality" />
                <Bar dataKey="pdiIssue" stackId="a" fill={G.rose} name="PDI" />
                <Bar dataKey="fieldComplaints" stackId="a" fill={G.amber} name="Field Complaints" />
                <Bar dataKey="sopIssues" stackId="a" fill={G.purple} name="SOP" />
                <Bar dataKey="fixtureIssue" stackId="a" fill={G.indigo} name="Fixture" />
                <Bar dataKey="materialShortage" stackId="a" fill={G.teal} name="Material Shortage" />
                <Bar dataKey="otherCritical" stackId="a" fill={G.dark} name="Other Critical" radius={[3,3,0,0]} />
              </BarChart>
            </ChartWrap>
          </Card>

          {/* Accident by type */}
          <Card>
            <p className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-3">F01 · Accident Type</p>
            {accByType.length > 0 ? (
              <ChartWrap h={160}>
                <PieChart>
                  <Pie data={accByType} dataKey="value" nameKey="name"
                    cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={6}
                    label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                    {accByType.map((_: any, i: number) => <Cell key={i} fill={[G.red, G.amber][i]} />)}
                  </Pie>
                  <Tooltip {...tip} />
                </PieChart>
              </ChartWrap>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-[#22C55E]">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <p className="text-sm font-medium mt-2">No Accidents</p>
              </div>
            )}
          </Card>

          {/* Prod hours loss */}
          <Card>
            <p className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-3">F11 · Production Hours Lost</p>
            <div className="mb-2"><KpiPill label="Total Hours Lost" value={get('f11_prod_hours_loss').total_hours_lost} color={G.red} /></div>
            <ChartWrap h={120}>
              <BarChart data={prodHoursLoss}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis dataKey="date" {...AXIS} />
                <YAxis {...AXIS} />
                <Tooltip {...tip} />
                <Bar dataKey="hours" fill={G.red} radius={[3,3,0,0]} />
              </BarChart>
            </ChartWrap>
          </Card>

          {/* SOP / Fixture / Pallet summary */}
          <Card>
            <p className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-3">Compliance Issues Summary</p>
            <div className="space-y-3 mt-2">
              {[
                { label: 'SOP Non-Adherence Days', value: get('f29_sop_non_adherence').total_days_with_issues, color: G.purple },
                { label: 'Fixture Issue Days', value: get('f30_fixture_issue').total_days_with_issues, color: G.indigo },
                { label: 'Pallet / Trolley Issue Days', value: get('f31_pallet_trolley_issue').total_days_with_issues, color: G.teal },
                { label: 'Material Shortage Days', value: get('f32_material_shortage').total_days_with_shortage, color: G.amber },
                { label: 'Other Critical Issue Days', value: get('f33_other_critical_issue').total_days_with_issues, color: G.red },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-xs text-[#666]">{item.label}</span>
                  <span className="text-sm font-bold" style={{ color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 6: ENERGY & UTILITIES
      ══════════════════════════════════════════════════════════════════════ */}
      <div>
        <SectionHeader title="Energy & Utilities" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <KpiPill label="Total KVAH (last day)" value={get('f16_unit_consumption_last_day').total_kvah} color={G.gold} />
          <KpiPill label="Cumul. KVAH" value={get('f17_unit_consumption_ytd').current_cumulative_kvah} color={G.amber} />
          <KpiPill label="Total Diesel (LTR)" value={get('f18_diesel_last_day').total_ltr} color={G.teal} />
          <KpiPill label="Cumul. Diesel (LTR)" value={get('f19_diesel_ytd').current_cumulative_ltr} color={G.blue} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Diesel daily */}
          <Card>
            <p className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-3">F18 · Diesel Consumption (LTR) vs Target</p>
            <ChartWrap h={220}>
              <ComposedChart data={dieselDays}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis dataKey="date" {...AXIS} />
                <YAxis {...AXIS} />
                <Tooltip {...tip} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <ReferenceLine y={100} stroke={G.green} strokeDasharray="4 2" label={{ value: 'Target', fontSize: 10, fill: G.green }} />
                <Bar dataKey="actual" fill={G.teal} name="Actual LTR" radius={[3,3,0,0]} />
                <Line type="monotone" dataKey="target" stroke={G.green} strokeWidth={2} dot={false} name="Target" />
              </ComposedChart>
            </ChartWrap>
          </Card>

          {/* Diesel cumulative */}
          <Card>
            <p className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-3">F19 · Cumulative Diesel (LTR)</p>
            <ChartWrap h={220}>
              <AreaChart data={dieselCum}>
                <defs>
                  <linearGradient id="dslGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={G.teal} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={G.teal} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis dataKey="date" {...AXIS} />
                <YAxis {...AXIS} />
                <Tooltip {...tip} />
                <Area type="monotone" dataKey="ltr" stroke={G.teal} fill="url(#dslGrad)" strokeWidth={2} name="Cumul. LTR" />
              </AreaChart>
            </ChartWrap>
          </Card>

          {/* Electricity */}
          <Card>
            <p className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-3">F16 · Electricity (KVAH) Last Day</p>
            <ChartWrap h={180}>
              <BarChart data={kvahDays}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis dataKey="date" {...AXIS} />
                <YAxis {...AXIS} />
                <Tooltip {...tip} />
                <Bar dataKey="kvah" fill={G.gold} name="KVAH" radius={[3,3,0,0]} />
              </BarChart>
            </ChartWrap>
          </Card>

          {/* Power Factor */}
          <Card>
            <p className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-3">F20 · Power Factor</p>
            <div className="mb-2"><KpiPill label="Avg Power Factor" value={`${get('f20_power_factor').avg_actual}%`} color={G.blue} /></div>
            <ChartWrap h={130}>
              <LineChart data={powerFactorDays}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis dataKey="date" {...AXIS} />
                <YAxis {...AXIS} domain={[90, 101]} />
                <Tooltip {...tip} formatter={(v: any) => `${v}%`} />
                <ReferenceLine y={99} stroke={G.red} strokeDasharray="4 2" label={{ value: 'Target 99', fontSize: 10, fill: G.red }} />
                <Line type="monotone" dataKey="actual" stroke={G.blue} strokeWidth={2} dot={{ r: 5, fill: G.blue }} />
              </LineChart>
            </ChartWrap>
          </Card>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 7: SALES, TRAINING & DISPATCH
      ══════════════════════════════════════════════════════════════════════ */}
      <div>
        <SectionHeader title="Sales, Training & Dispatch" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Sales */}
          <Card className="lg:col-span-2">
            <p className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-3">F21 · Sales: Daily & Cumulative (₹ Lakhs)</p>
            <ChartWrap h={230}>
              <ComposedChart data={salesDays}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis dataKey="date" {...AXIS} />
                <YAxis yAxisId="left" {...AXIS} />
                <YAxis yAxisId="right" orientation="right" {...AXIS} />
                <Tooltip {...tip} formatter={(v: any) => `₹${v}L`} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar yAxisId="left" dataKey="daily" fill={G.gold} name="Daily Sales" radius={[3,3,0,0]} />
                <Line yAxisId="right" type="monotone" dataKey="cumulative" stroke={G.green} strokeWidth={2} dot={{ r: 4 }} name="Cumulative" />
              </ComposedChart>
            </ChartWrap>
          </Card>

          {/* Training */}
          <Card>
            <p className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-3">F22 · Training Minutes (Daily)</p>
            <ChartWrap h={180}>
              <ComposedChart data={trainingDays}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis dataKey="date" {...AXIS} />
                <YAxis {...AXIS} />
                <Tooltip {...tip} />
                <ReferenceLine y={30} stroke={G.red} strokeDasharray="4 2" label={{ value: 'Target 30', fontSize: 10, fill: G.red }} />
                <Bar dataKey="actual" fill={G.blue} name="Training min" radius={[3,3,0,0]} />
              </ComposedChart>
            </ChartWrap>
            <p className="text-xs font-semibold text-[#999] uppercase tracking-wider mt-4 mb-2">F23 · Cumulative Training (min)</p>
            <ChartWrap h={100}>
              <AreaChart data={trainingCum}>
                <defs>
                  <linearGradient id="trnGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={G.blue} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={G.blue} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" {...AXIS} />
                <YAxis {...AXIS} />
                <Tooltip {...tip} />
                <Area type="monotone" dataKey="minutes" stroke={G.blue} fill="url(#trnGrad)" strokeWidth={2} />
              </AreaChart>
            </ChartWrap>
          </Card>

          {/* Dispatch */}
          <Card className="lg:col-span-3">
            <p className="text-xs font-semibold text-[#999] uppercase tracking-wider mb-3">F08 · Dispatch (Front / Rear / I-A) — All Zero This Period</p>
            <ChartWrap h={150}>
              <BarChart data={dispatchDays}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis dataKey="date" {...AXIS} />
                <YAxis {...AXIS} />
                <Tooltip {...tip} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="front" fill={G.gold} name="Front" radius={[2,2,0,0]} />
                <Bar dataKey="rear" fill={G.blue} name="Rear" radius={[2,2,0,0]} />
                <Bar dataKey="ia" fill={G.green} name="I/A" radius={[2,2,0,0]} />
              </BarChart>
            </ChartWrap>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-4 pb-2">
        <p className="text-xs text-[#CCC]">Analytics · April 2025 · {data.report_count} Reports Processed</p>
      </div>
    </div>
  );
}
