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

import {
  Download,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  const [exportingPdf, setExportingPdf] = useState(false);
  // const [exportingExcel, setExportingExcel] = useState(false);

 
// ─── DROP-IN REPLACEMENT for exportAnalyticsToPdf in Analytics.tsx ───────────
// Uses jsPDF directly (no html2canvas) so layout is pixel-perfect & never splits
// charts across pages.  Requires: npm i jspdf  (already used in your project)
// ─────────────────────────────────────────────────────────────────────────────

const exportAnalyticsToPdf = async () => {
  setExportingPdf(true);
  try {
    const { jsPDF } = await import('jspdf');

    // ── Colour palette (mirrors the dashboard) ────────────────────────────
    const C = {
      gold:   '#C9A962', dark:  '#1A1A1A', gray:   '#666666',
      light:  '#E5E5E5', amber: '#F59E0B', red:    '#EF4444',
      green:  '#22C55E', blue:  '#3B82F6', purple: '#8B5CF6',
      teal:   '#14B8A6', rose:  '#F43F5E', bg:     '#F6F6F6',
      card:   '#FFFFFF', border:'#F0F0F0', sub:    '#999999',
      indigo: '#6366F1',
    };
    const hexToRgb = (hex: string) => {
      const r = parseInt(hex.slice(1,3),16);
      const g = parseInt(hex.slice(3,5),16);
      const b = parseInt(hex.slice(5,7),16);
      return [r,g,b] as [number,number,number];
    };
    const setFill   = (hex: string) => { const [r,g,b]=hexToRgb(hex); pdf.setFillColor(r,g,b); };
    const setStroke = (hex: string) => { const [r,g,b]=hexToRgb(hex); pdf.setDrawColor(r,g,b); };
    const setTxt    = (hex: string) => { const [r,g,b]=hexToRgb(hex); pdf.setTextColor(r,g,b); };

    // ── PDF setup ─────────────────────────────────────────────────────────
    const pdf    = new jsPDF('l', 'pt', 'a4'); // landscape
    const PW     = pdf.internal.pageSize.getWidth();   // 841.89
    const PH     = pdf.internal.pageSize.getHeight();  // 595.28
    const PAD    = 28;   // page margin
    const CW     = PW - PAD * 2;
    let   Y      = PAD; // current Y cursor
    let   pageNo = 1;

    const newPage = () => {
      pdf.addPage();
      pageNo++;
      Y = PAD;
      // subtle page bg
      setFill(C.bg); pdf.rect(0, 0, PW, PH, 'F');
      // page number
      setTxt(C.sub); pdf.setFontSize(8);
      pdf.text(`Page ${pageNo}`, PW - PAD, PH - 10, { align: 'right' });
    };

    // Ensure there is room; if not, start a new page
    const ensureSpace = (needed: number) => {
      if (Y + needed > PH - PAD) newPage();
    };

    // ── Page background ───────────────────────────────────────────────────
    setFill(C.bg); pdf.rect(0, 0, PW, PH, 'F');

    // ── Drawing helpers ───────────────────────────────────────────────────

    /** Rounded white card */
    const card = (x: number, y: number, w: number, h: number) => {
      setFill(C.card); setStroke(C.border);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(x, y, w, h, 4, 4, 'FD');
    };

    /** Section header with gold left bar */
    const sectionHeader = (title: string, sub?: string) => {
      ensureSpace(sub ? 36 : 28);
      setFill(C.gold); pdf.rect(PAD, Y, 3, sub ? 22 : 18, 'F');
      setTxt(C.dark); pdf.setFontSize(13); pdf.setFont('helvetica','bold');
      pdf.text(title, PAD + 10, Y + 13);
      if (sub) { setTxt(C.sub); pdf.setFontSize(8); pdf.setFont('helvetica','normal'); pdf.text(sub, PAD + 10, Y + 24); }
      Y += sub ? 36 : 28;
    };

    /** KPI pill — centred value + label */
    const kpiPill = (x: number, y: number, w: number, h: number, label: string, value: string, color: string) => {
      card(x, y, w, h);
      setTxt(color); pdf.setFontSize(16); pdf.setFont('helvetica','bold');
      pdf.text(String(value), x + w / 2, y + h / 2 + 2, { align: 'center' });
      setTxt(C.sub); pdf.setFontSize(7.5); pdf.setFont('helvetica','normal');
      pdf.text(label, x + w / 2, y + h / 2 + 14, { align: 'center' });
    };

    /** Bar chart — data:[{label,value,color?}], maxVal optional */
    const barChart = (
      x: number, y: number, w: number, h: number,
      data: { label: string; value: number; color?: string }[],
      opts: { maxVal?: number; targetLine?: number; targetColor?: string; title?: string } = {}
    ) => {
      card(x, y, w, h);
      const lp = 28, bp = 16, tp = opts.title ? 20 : 10, rp = 8;
      const chartX = x + lp, chartY = y + tp;
      const chartW = w - lp - rp, chartH = h - tp - bp;
      const maxVal = opts.maxVal ?? Math.max(...data.map(d => d.value), 1);

      if (opts.title) {
        setTxt(C.sub); pdf.setFontSize(7); pdf.setFont('helvetica','bold');
        pdf.text(opts.title.toUpperCase(), x + lp, y + 12);
      }

      // Y-axis ticks
      setTxt(C.sub); pdf.setFontSize(6.5); pdf.setFont('helvetica','normal');
      [0, 0.5, 1].forEach(f => {
        const ty = chartY + chartH - f * chartH;
        setStroke('#E8E8E8'); pdf.setLineWidth(0.3);
        pdf.line(chartX, ty, chartX + chartW, ty);
        setTxt(C.sub);
        pdf.text(String(Math.round(maxVal * f)), chartX - 3, ty + 2, { align: 'right' });
      });

      // Bars
      const bw = Math.min((chartW / data.length) * 0.6, 18);
      const gap = chartW / data.length;
      data.forEach((d, i) => {
        const bh = (d.value / maxVal) * chartH;
        const bx = chartX + gap * i + (gap - bw) / 2;
        const by = chartY + chartH - bh;
        setFill(d.color ?? C.gold);
        pdf.rect(bx, by, bw, bh, 'F');
        // x label
        setTxt(C.sub); pdf.setFontSize(5.5);
        pdf.text(d.label, bx + bw / 2, chartY + chartH + 9, { align: 'center' });
      });

      // Target line
      if (opts.targetLine !== undefined) {
        const ty = chartY + chartH - (opts.targetLine / maxVal) * chartH;
        setStroke(opts.targetColor ?? C.green); pdf.setLineWidth(0.8);
        pdf.setLineDashPattern([3, 2], 0);
        pdf.line(chartX, ty, chartX + chartW, ty);
        pdf.setLineDashPattern([], 0);
      }
    };

    /** Line chart */
    const lineChart = (
      x: number, y: number, w: number, h: number,
      series: { data: { label: string; value: number }[]; color: string; dashed?: boolean }[],
      opts: { maxVal?: number; minVal?: number; targetLine?: number; title?: string } = {}
    ) => {
      card(x, y, w, h);
      const lp = 28, bp = 16, tp = opts.title ? 20 : 10, rp = 8;
      const chartX = x + lp, chartY = y + tp;
      const chartW = w - lp - rp, chartH = h - tp - bp;
      const allVals = series.flatMap(s => s.data.map(d => d.value));
      const maxVal = opts.maxVal ?? Math.max(...allVals, 1);
      const minVal = opts.minVal ?? 0;
      const range  = maxVal - minVal || 1;

      if (opts.title) {
        setTxt(C.sub); pdf.setFontSize(7); pdf.setFont('helvetica','bold');
        pdf.text(opts.title.toUpperCase(), x + lp, y + 12);
      }

      // Grid lines
      [0, 0.5, 1].forEach(f => {
        const ty = chartY + chartH - f * chartH;
        setStroke('#E8E8E8'); pdf.setLineWidth(0.3);
        pdf.line(chartX, ty, chartX + chartW, ty);
        setTxt(C.sub); pdf.setFontSize(6.5);
        pdf.text(String(Math.round(minVal + range * f)), chartX - 3, ty + 2, { align: 'right' });
      });

      const n = series[0]?.data.length || 1;
      const gap = chartW / (n - 1 || 1);

      // X labels
      series[0]?.data.forEach((d, i) => {
        setTxt(C.sub); pdf.setFontSize(5.5);
        pdf.text(d.label, chartX + i * gap, chartY + chartH + 9, { align: 'center' });
      });

      // Target line
      if (opts.targetLine !== undefined) {
        const ty = chartY + chartH - ((opts.targetLine - minVal) / range) * chartH;
        setStroke(C.red); pdf.setLineWidth(0.8);
        pdf.setLineDashPattern([3, 2], 0);
        pdf.line(chartX, ty, chartX + chartW, ty);
        pdf.setLineDashPattern([], 0);
      }

      // Lines
      series.forEach(s => {
        const [r, g, b] = hexToRgb(s.color);
        pdf.setDrawColor(r, g, b); pdf.setLineWidth(1.5);
        if (s.dashed) pdf.setLineDashPattern([4, 2], 0);
        s.data.forEach((d, i) => {
          const px = chartX + i * gap;
          const py = chartY + chartH - ((d.value - minVal) / range) * chartH;
          if (i === 0) pdf.moveTo(px, py); else pdf.lineTo(px, py);
        });
        pdf.stroke();
        pdf.setLineDashPattern([], 0);
        // dots
        s.data.forEach((d, i) => {
          const px = chartX + i * gap;
          const py = chartY + chartH - ((d.value - minVal) / range) * chartH;
          setFill(s.color); pdf.circle(px, py, 2, 'F');
        });
      });
    };

    /** Horizontal bar chart (for dept breakdown) */
    const hBarChart = (
      x: number, y: number, w: number, h: number,
      data: { label: string; value: number }[],
      color: string,
      title?: string
    ) => {
      card(x, y, w, h);
      const lp = 50, rp = 20, tp = title ? 20 : 10, bp = 10;
      const chartX = x + lp, chartY = y + tp;
      const chartW = w - lp - rp, chartH = h - tp - bp;
      const maxVal = Math.max(...data.map(d => d.value), 1);
      const rowH   = chartH / data.length;

      if (title) {
        setTxt(C.sub); pdf.setFontSize(7); pdf.setFont('helvetica','bold');
        pdf.text(title.toUpperCase(), x + lp, y + 12);
      }
      data.forEach((d, i) => {
        const bw = (d.value / maxVal) * chartW;
        const by = chartY + i * rowH + rowH * 0.15;
        const bh = rowH * 0.55;
        setFill(color); pdf.rect(chartX, by, bw, bh, 'F');
        setTxt(C.sub); pdf.setFontSize(6.5);
        pdf.text(d.label, chartX - 3, by + bh / 2 + 2, { align: 'right' });
        setTxt(C.dark); pdf.setFontSize(6.5);
        pdf.text(String(d.value), chartX + bw + 3, by + bh / 2 + 2);
      });
    };

    /** Pie chart (simple) */
    const pieChart = (
      x: number, y: number, w: number, h: number,
      data: { label: string; value: number; color: string }[],
      title?: string,
      donut?: boolean
    ) => {
      card(x, y, w, h);
      if (title) {
        setTxt(C.sub); pdf.setFontSize(7); pdf.setFont('helvetica','bold');
        pdf.text(title.toUpperCase(), x + 8, y + 12);
      }
      const cx = x + w * 0.38, cy = y + h / 2 + (title ? 5 : 0), r = Math.min(w * 0.28, h * 0.38);
      const total = data.reduce((s, d) => s + d.value, 0) || 1;
      let angle = -Math.PI / 2;
      data.forEach(d => {
        const sweep = (d.value / total) * 2 * Math.PI;
        const [r2,g2,b2] = hexToRgb(d.color);
        pdf.setFillColor(r2,g2,b2);
        // Form the pie slice using a series of small triangles for compatibility
        const steps = Math.max(12, Math.floor(sweep * 30));
        for (let s = 0; s < steps; s++) {
          const a1 = angle + (s / steps) * sweep;
          const a2 = angle + ((s + 1) / steps) * sweep;
          const tx1 = cx + Math.cos(a1) * r;
          const ty1 = cy + Math.sin(a1) * r;
          const tx2 = cx + Math.cos(a2) * r;
          const ty2 = cy + Math.sin(a2) * r;
          pdf.triangle(cx, cy, tx1, ty1, tx2, ty2, 'F');
        }
        if (donut) {
          // draw white inner circle
          setFill('#FFFFFF'); pdf.circle(cx, cy, r * 0.5, 'F');
        }
        angle += sweep;
      });
      // legend
      const lx = x + w * 0.68;
      let   ly = y + (title ? 20 : 8);
      data.forEach(d => {
        if (ly > y + h - 8) return;
        const [r2,g2,b2] = hexToRgb(d.color);
        pdf.setFillColor(r2,g2,b2); pdf.rect(lx, ly, 6, 6, 'F');
        setTxt(C.dark); pdf.setFontSize(6.5);
        pdf.text(`${d.label}: ${d.value}`, lx + 9, ly + 5.5);
        ly += 12;
      });
    };

    /** Compliance list */
    const complianceList = (
      x: number, y: number, w: number, h: number,
      items: { label: string; value: number; color: string }[]
    ) => {
      card(x, y, w, h);
      setTxt(C.sub); pdf.setFontSize(7); pdf.setFont('helvetica','bold');
      pdf.text('COMPLIANCE ISSUES SUMMARY', x + 8, y + 12);
      let ly = y + 24;
      items.forEach(it => {
        setTxt(C.sub); pdf.setFontSize(7.5); pdf.setFont('helvetica','normal');
        pdf.text(it.label, x + 12, ly);
        setTxt(it.color); pdf.setFontSize(8); pdf.setFont('helvetica','bold');
        pdf.text(String(it.value), x + w - 14, ly, { align: 'right' });
        setStroke(C.border); pdf.setLineWidth(0.3);
        pdf.line(x + 8, ly + 4, x + w - 8, ly + 4);
        ly += 16;
      });
    };

    // ── helpers to read API data ──────────────────────────────────────────
    const get = (field: string) => data.analytics.find((a: any) => a.field === field) || {} as any;
    const fmtD = (iso: string) => { const d = new Date(iso); return `${d.getDate()}/${d.getMonth()+1}`; };
    const PALETTE = [C.gold, C.blue, C.green, C.purple, C.teal, C.rose, C.amber];

    // ═══════════════════════════════════════════════════════════════════════
    // PAGE 1 — HEADER + PRODUCTION
    // ═══════════════════════════════════════════════════════════════════════

    // Header bar
    setFill(C.dark); pdf.rect(PAD, Y, CW, 48, 'F');
    setTxt('#C9A962'); pdf.setFontSize(7); pdf.setFont('helvetica','bold');
    pdf.text('MANUFACTURING INTELLIGENCE', PAD + 12, Y + 12);
    setTxt('#FFFFFF'); pdf.setFontSize(20); pdf.setFont('helvetica','bold');
    pdf.text('Analytics Dashboard', PAD + 12, Y + 35);
    setTxt('#999999'); pdf.setFontSize(8); pdf.setFont('helvetica','normal');
    pdf.text(`April 2026  ·  ${data.report_count} daily reports`, PAD + 12, Y + 46);

    // top KPIs on right of header
    const prod = get('f03_production');
    const prodEff = prod.cumulative_target ? +((prod.cumulative_actual / prod.cumulative_target) * 100).toFixed(1) : 0;
    const kpis = [
      { label: 'Production Eff.', value: `${prodEff}%`,   color: prodEff >= 95 ? C.green : C.amber },
      { label: 'OTIF Avg',        value: `${get('f10_otif_adherence').avg_actual || 0}%`, color: C.blue },
      { label: 'Incidents',       value: String(get('f01_accident').total_incidents || 0), color: C.red },
      { label: 'Total Sales',     value: `₹${get('f21_sales').current_cumulative_sales || 0}L`, color: C.gold },
    ];
    const kW = 72, kGap = 8;
    let kx = PW - PAD - (kW + kGap) * kpis.length + kGap;
    kpis.forEach(k => {
      setFill('#2A2A2A'); pdf.roundedRect(kx, Y + 6, kW, 36, 3, 3, 'F');
      setTxt(k.color); pdf.setFontSize(14); pdf.setFont('helvetica','bold');
      pdf.text(k.value, kx + kW / 2, Y + 24, { align: 'center' });
      setTxt('#999999'); pdf.setFontSize(6.5); pdf.setFont('helvetica','normal');
      pdf.text(k.label, kx + kW / 2, Y + 36, { align: 'center' });
      kx += kW + kGap;
    });

    Y += 60;

    // ── SECTION 1: PRODUCTION ─────────────────────────────────────────────
    sectionHeader('Production', 'Output, efficiency & plan adherence');

    // 3 KPI pills
    const pill3W = (CW - 16) / 3;
    kpiPill(PAD,              Y, pill3W, 52, 'Cumulative Target',    String(prod.cumulative_target), C.gray);
    kpiPill(PAD + pill3W + 8, Y, pill3W, 52, 'Cumulative Actual',    String(prod.cumulative_actual), C.gold);
    kpiPill(PAD + (pill3W + 8) * 2, Y, pill3W, 52, 'Overall Efficiency', `${prodEff}%`, prodEff >= 95 ? C.green : C.amber);
    Y += 60;

    // Daily Production bar chart (2/3) + Part-wise pie (1/3)
    const chartRowH = 140;
    ensureSpace(chartRowH + 8);
    const c2W = CW * 0.62, c1W = CW - c2W - 8;

    // Build prod bar data: group target+actual as 2-tone using interleaved approach
    const prodDays = prod.daily_trend || [];
    // We'll show target (light) behind actual (gold) — draw target first lighter
    const prodBarData = prodDays.map((d: any) => ({ label: fmtD(d.date), value: d.actual, color: C.gold }));
    barChart(PAD, Y, c2W, chartRowH, prodBarData,
      { title: 'Daily Production vs Target', maxVal: Math.max(...prodDays.map((d: any) => d.target || 0), 1) + 50 });
    // overlay target bars in lighter colour — draw behind by drawing them first via card is already drawn
    // (simplified: just show actual bars with gold; target line)
    const maxProd = Math.max(...prodDays.map((d: any) => Math.max(d.target || 0, d.actual || 0)), 1);
    // Re-draw with target line
    const prodTargetAvg = prodDays.filter((d: any) => d.target > 0).reduce((s: number, d: any) => s + d.target, 0)
      / (prodDays.filter((d: any) => d.target > 0).length || 1);
    barChart(PAD, Y, c2W, chartRowH, prodBarData,
      { title: 'Daily Production vs Target', maxVal: maxProd + 50, targetLine: prodTargetAvg > 0 ? prodTargetAvg : undefined, targetColor: C.gray });

    // Part-wise pie
    const partPieData = (prod.by_part_type || []).map((p: any, i: number) => ({
      label: `Part ${parseInt(p.partTypeId) === 0 ? 'Front' : parseInt(p.partTypeId) === 1 ? 'Rear' : 'I/A'}`,
      value: p.actual,
      color: PALETTE[i],
    }));
    pieChart(PAD + c2W + 8, Y, c1W, chartRowH, partPieData, 'Part-wise Split (Actual)', true);
    Y += chartRowH + 8;

    // Plan Adherence + OTIF + Per Man Per Day  (3 equal charts)
    ensureSpace(130);
    const c3W = (CW - 16) / 3;
    const planData = (get('f09_prod_plan_adherence').daily_trend || []).map((d: any) => ({ label: fmtD(d.date), value: d.actual }));
    lineChart(PAD,           Y, c3W, 120, [{ data: planData, color: C.gold }],
      { title: 'F09 · Plan Adherence %', minVal: 0, maxVal: 105, targetLine: 95 });

    const otifData = (get('f10_otif_adherence').daily_trend || []).map((d: any) => ({ label: fmtD(d.date), value: d.actual }));
    lineChart(PAD + c3W + 8, Y, c3W, 120, [{ data: otifData, color: C.blue }],
      { title: 'F10 · OTIF Adherence %', minVal: 0, maxVal: 105, targetLine: 100 });

    const pmdData = (get('f05_per_man_per_day').daily_trend || []).map((d: any) => ({ label: fmtD(d.date), value: d.actual }));
    barChart(PAD + (c3W + 8) * 2, Y, c3W, 120, pmdData.map((d: any) => ({ label: d.label, value: d.value, color: C.purple })),
      { title: 'F05 · Per Man Per Day' });
    Y += 128;

    // ═══════════════════════════════════════════════════════════════════════
    // PAGE 2 — QUALITY
    // ═══════════════════════════════════════════════════════════════════════
    newPage();
    sectionHeader('Quality', 'Rejections, first-pass ratios & PDI');

    // 4 KPI pills
    const q = get('f24_first_pass_ok');
    const pill4W = (CW - 24) / 4;
    kpiPill(PAD,                   Y, pill4W, 52, 'Cust Rej. PPM',    String(get('f02_customer_rejection').by_customer?.[0]?.total_ppm ?? 0), C.red);
    kpiPill(PAD + (pill4W+8),      Y, pill4W, 52, '1st Pass OK Avg %', `${q.avg_first_pass || q.avg_actual || 0}%`, C.green);
    kpiPill(PAD + (pill4W+8)*2,    Y, pill4W, 52, 'PDI Ratio Avg %',  `${q.avg_pdi || 0}%`, C.teal);
    kpiPill(PAD + (pill4W+8)*3,    Y, pill4W, 52, 'Supplier Rej. Qty', String(get('f26_supplier_rejection').total || 0), C.amber);
    Y += 60;

    // Cust rejection + 1st pass + PDI ratio  (3 charts)
    ensureSpace(145);
    const custRejD = (get('f02_customer_rejection').daily_trend || []).map((d: any) => ({ label: fmtD(d.date), value: d.count ?? d.total_ppm ?? 0, color: C.red }));
    barChart(PAD,           Y, c3W, 130, custRejD,   { title: 'F02 · Customer Rejection PPM', targetLine: 50, targetColor: C.green });

    const fpData  = (q.daily_trend || []).map((d: any) => ({ label: fmtD(d.date), value: d.firstPassOKRatio ?? d.actual ?? 0 }));
    lineChart(PAD + c3W + 8, Y, c3W, 130, [{ data: fpData, color: C.green }],
      { title: 'F24 · 1st Pass OK %', minVal: 0, maxVal: 105, targetLine: 100 });

    const pdiData = (q.daily_trend || []).map((d: any) => ({ label: fmtD(d.date), value: d.pdiRatio ?? d.pdi_ratio ?? 0, color: C.teal }));
    barChart(PAD + (c3W+8)*2, Y, c3W, 130, pdiData, { title: 'F25 · PDI Ratio %' });
    Y += 138;

    // Supplier rejection + Quality KPI radar (as pillars) + Incoming material
    ensureSpace(140);
    const supD = (get('f26_supplier_rejection').daily_trend || []).map((d: any) => ({ label: fmtD(d.date), value: d.count ?? d.total_qty ?? 0, color: C.amber }));
    barChart(PAD, Y, c3W, 125, supD, { title: 'F26 · Supplier Rejection Qty' });

    // Quality KPI summary (bar-style radar replacement)
    const qKpis = [
      { label: 'First Pass OK', value: q.avg_first_pass || q.avg_actual || 0 },
      { label: 'PDI Ratio',     value: q.avg_pdi || 0 },
      { label: 'OTIF',         value: get('f10_otif_adherence').avg_actual || 0 },
      { label: 'Plan Adh.',    value: get('f09_prod_plan_adherence').avg_actual || 0 },
    ];
    barChart(PAD + c3W + 8, Y, c3W, 125, qKpis.map(k => ({ label: k.label, value: k.value, color: C.gold })),
      { title: 'Quality KPI Summary', maxVal: 105 });

    const incD = (get('f13_poor_incoming_material').daily_trend || []).map((d: any) => ({ label: fmtD(d.date), value: d.actual ?? d.quantity ?? 0, color: C.rose }));
    barChart(PAD + (c3W+8)*2, Y, c3W, 125, incD, { title: 'F13 · Poor Incoming Material Qty' });
    Y += 133;

    // ═══════════════════════════════════════════════════════════════════════
    // PAGE 3 — CYCLE TIME & MACHINE + OT & WORKFORCE
    // ═══════════════════════════════════════════════════════════════════════
    newPage();
    sectionHeader('Cycle Time & Machine Breakdown');

    const ct = get('f04_cycle_time');
    const pill4bW = (CW - 24) / 4;
    kpiPill(PAD,                    Y, pill4bW, 52, 'Avg Front CT (min)',    String(ct.avg_front || 0),  C.blue);
    kpiPill(PAD + (pill4bW+8),      Y, pill4bW, 52, 'Avg Rear CT (min)',     String(ct.avg_rear || 0),   C.indigo || C.purple);
    kpiPill(PAD + (pill4bW+8)*2,    Y, pill4bW, 52, 'CT Target (min)',       String(ct.target_minutes || 0), C.gray);
    kpiPill(PAD + (pill4bW+8)*3,    Y, pill4bW, 52, 'Total Breakdown (min)', String(get('f15_machine_breakdown').total_minutes || 0), C.red);
    Y += 60;

    // Cycle time line chart (wide) + Breakdown pie
    ensureSpace(145);
    const ctFront = (ct.daily_trend || []).map((d: any) => ({ label: fmtD(d.date), value: d.front || 0 }));
    const ctRear  = (ct.daily_trend || []).map((d: any) => ({ label: fmtD(d.date), value: d.rear  || 0 }));
    lineChart(PAD, Y, c2W, 130,
      [{ data: ctFront, color: C.blue }, { data: ctRear, color: C.purple }],
      { title: 'F04 · Cycle Time by Day (min)', minVal: 0, maxVal: Math.max(...ctFront.map((d: any) => d.value), ...ctRear.map((d: any) => d.value), ct.target_minutes || 3) + 1, targetLine: ct.target_minutes || 2 });

    const mach   = get('f15_machine_breakdown');
    const machPieData = (mach.by_machine || []).map((m: any, i: number) => ({
      label: `M${m.machineId}`, value: m.count || m.total_minutes || 1, color: [C.red, C.amber][i % 2]
    }));
    if (machPieData.length === 0) machPieData.push({ label: 'No breakdowns', value: 1, color: C.green });
    pieChart(PAD + c2W + 8, Y, c1W, 130, machPieData, 'F15 · Breakdown by Machine', true);
    Y += 138;

    // Machine breakdown daily (full width)
    ensureSpace(120);
    const machDailyD = (mach.daily_trend || []).map((d: any) => ({ label: fmtD(d.date), value: d.actual ?? d.total_minutes ?? 0, color: C.red }));
    barChart(PAD, Y, CW, 110, machDailyD, { title: 'F15 · Machine Breakdown Minutes (Daily)', targetLine: mach.target_minutes || 30, targetColor: C.green });
    Y += 118;

    // ── SECTION: OVERTIME & WORKFORCE ────────────────────────────────────
    ensureSpace(220);
    sectionHeader('Overtime & Workforce');

    const pill3bW = (CW - 16) / 3;
    kpiPill(PAD,               Y, pill3bW, 52, 'Total OT Hours',          String(get('f06_ot_hours_last_day').total_ot_hours || 0), C.amber);
    kpiPill(PAD + pill3bW + 8, Y, pill3bW, 52, 'Cumulative OT',           String(get('f07_ot_hours_cumulative').current_cumulative || 0), '#FFA500');
    kpiPill(PAD + (pill3bW+8)*2, Y, pill3bW, 52, 'Total Absent Person-Days', String(get('f14_absenteeism').total || 0), C.red);
    Y += 60;

    // OT daily + OT by dept + OT cumulative
    ensureSpace(130);
    const otDailyD = (get('f06_ot_hours_last_day').daily_trend || []).map((d: any) => ({ label: fmtD(d.date), value: d.total_ot || 0, color: C.amber }));
    barChart(PAD, Y, c3W, 118, otDailyD, { title: 'F06 · Daily OT Hours' });

    const deptD = (get('f06_ot_hours_last_day').by_department || []).map((d: any) => ({ label: `Dept ${d.departmentId}`, value: d.total_hours || 0 }));
    hBarChart(PAD + c3W + 8, Y, c3W, 118, deptD, C.gold, 'F06 · OT by Department');

    const otCumD = (get('f07_ot_hours_cumulative').daily_trend || []).map((d: any) => ({ label: fmtD(d.date), value: d.cumulative || 0 }));
    lineChart(PAD + (c3W+8)*2, Y, c3W, 118, [{ data: otCumD, color: C.amber }], { title: 'F07 · Cumulative OT Hours' });
    Y += 126;

    // Absenteeism full width
    ensureSpace(110);
    const absD = (get('f14_absenteeism').daily_trend || []).map((d: any) => ({ label: fmtD(d.date), value: d.actual || 0, color: C.rose }));
    barChart(PAD, Y, CW, 100, absD, { title: 'F14 · Unauthorised Absenteeism (Person-Days)' });
    Y += 108;

    // ═══════════════════════════════════════════════════════════════════════
    // PAGE 4 — ISSUES & INCIDENTS
    // ═══════════════════════════════════════════════════════════════════════
    newPage();
    sectionHeader('Issues, Incidents & Compliance');

    kpiPill(PAD,                   Y, pill4W, 52, 'Accidents/Near Miss', String(get('f01_accident').total_incidents || 0),          C.red);
    kpiPill(PAD + (pill4W+8),      Y, pill4W, 52, 'Line Quality Issues', String(get('f12_line_quality_issue').total_issues || 0),    C.rose);
    kpiPill(PAD + (pill4W+8)*2,    Y, pill4W, 52, 'PDI Issues',          String(get('f27_pdi_issue').total_days_with_issues || 0),   C.amber);
    kpiPill(PAD + (pill4W+8)*3,    Y, pill4W, 52, 'Field Complaints',    String(get('f28_field_complaints').total_days_with_issues || 0), '#FFA500');
    Y += 60;

    // Issue distribution pie + Daily issues stacked bar
    ensureSpace(145);
    const issuesPieD = [
      { label: 'Line Quality',      value: get('f12_line_quality_issue').total_issues || 0,              color: C.red    },
      { label: 'PDI Issues',        value: get('f27_pdi_issue').total_days_with_issues || 0,             color: C.rose   },
      { label: 'Field Complaints',  value: get('f28_field_complaints').total_days_with_issues || 0,      color: C.amber  },
      { label: 'Fixture Issues',    value: get('f30_fixture_issue').total_days_with_issues || 0,         color: C.purple },
      { label: 'Material Shortage', value: get('f32_material_shortage').total_days_with_shortage || 0,   color: C.teal   },
      { label: 'SOP Non-adh.',      value: get('f29_sop_non_adherence').total_days_with_issues || 0,     color: C.blue   },
    ].filter(d => d.value > 0);
    if (issuesPieD.length === 0) issuesPieD.push({ label: 'No Issues', value: 1, color: C.green });
    pieChart(PAD, Y, c1W, 130, issuesPieD, 'Issue Distribution');

    // Daily issues combined line
    const lqTrend   = get('f12_line_quality_issue').daily_trend || [];
    const pdiTrend2 = get('f27_pdi_issue').daily_trend || [];
    const issLQ  = lqTrend.map((d: any)   => ({ label: fmtD(d.date), value: d.actual || 0 }));
    const issPDI = pdiTrend2.map((d: any) => ({ label: fmtD(d.date), value: d.hasIssue || d.issue_count || 0 }));
    lineChart(PAD + c1W + 8, Y, c2W, 130,
      [{ data: issLQ, color: C.red }, { data: issPDI, color: C.amber }],
      { title: 'Daily Issues: Line Quality vs PDI', minVal: 0 });
    Y += 138;

    // Accident type pie + Prod hours loss + Compliance list
    ensureSpace(135);
    const accByTypeD = (get('f01_accident').by_type || []).map((t: any, i: number) => ({ label: t.type, value: t.count, color: [C.red, C.amber][i % 2] })).filter((d: any) => d.value > 0);
    if (accByTypeD.length === 0) accByTypeD.push({ label: 'No Accidents', value: 1, color: C.green });
    pieChart(PAD, Y, c3W, 120, accByTypeD, 'F01 · Accident Type');

    const phlD = (get('f11_prod_hours_loss').daily_trend || []).map((d: any) => ({ label: fmtD(d.date), value: d.actual || 0, color: C.red }));
    barChart(PAD + c3W + 8, Y, c3W, 120, phlD, { title: 'F11 · Production Hours Lost' });

    complianceList(PAD + (c3W+8)*2, Y, c3W, 120, [
      { label: 'SOP Non-Adherence Days',     value: get('f29_sop_non_adherence').total_days_with_issues || 0,  color: C.purple },
      { label: 'Fixture Issue Days',          value: get('f30_fixture_issue').total_days_with_issues || 0,      color: '#6366F1' },
      { label: 'Pallet/Trolley Issue Days',   value: get('f31_pallet_trolley_issue').total_days_with_issues || 0, color: C.teal },
      { label: 'Material Shortage Days',      value: get('f32_material_shortage').total_days_with_shortage || 0, color: C.amber },
      { label: 'Other Critical Issue Days',   value: get('f33_other_critical_issue').total_days_with_issues || 0, color: C.red },
    ]);
    Y += 128;

    // ═══════════════════════════════════════════════════════════════════════
    // PAGE 5 — ENERGY + SALES + TRAINING + DISPATCH
    // ═══════════════════════════════════════════════════════════════════════
    newPage();
    sectionHeader('Energy & Utilities');

    const f16 = get('f16_unit_consumption_last_day');
    kpiPill(PAD,                   Y, pill4W, 52, 'Total KVAH (Last Day)', String(f16.total_kvah || 0),              C.gold);
    kpiPill(PAD + (pill4W+8),      Y, pill4W, 52, 'Cumul. KVAH',          String(f16.current_cumulative_kvah || 0), C.amber);
    kpiPill(PAD + (pill4W+8)*2,    Y, pill4W, 52, 'Total Diesel (LTR)',   String(f16.total_diesel_ltr || 0),        C.teal);
    kpiPill(PAD + (pill4W+8)*3,    Y, pill4W, 52, 'Cumul. Diesel (LTR)',  String(f16.current_cumulative_diesel || 0), C.blue);
    Y += 60;

    ensureSpace(130);
    const kvahD   = (f16.daily_trend || []).map((d: any) => ({ label: fmtD(d.date), value: d.electricityKVAH || d.kvah || 0, color: C.gold }));
    const dieselD = (f16.daily_trend || []).map((d: any) => ({ label: fmtD(d.date), value: d.dieselLTR || d.quantity_ltr || 0, color: C.teal }));
    const pfD     = (f16.daily_trend || []).filter((d: any) => d.powerFactor > 0).map((d: any) => ({ label: fmtD(d.date), value: d.powerFactor || 0 }));

    barChart(PAD, Y, c3W, 118, kvahD, { title: 'F16 · Electricity KVAH (Daily)' });
    barChart(PAD + c3W + 8, Y, c3W, 118, dieselD, { title: 'F18 · Diesel Consumption (LTR)', targetLine: 100, targetColor: C.green });
    if (pfD.length > 0) {
      lineChart(PAD + (c3W+8)*2, Y, c3W, 118, [{ data: pfD, color: C.blue }], { title: 'F20 · Power Factor %', minVal: 88, maxVal: 102, targetLine: 99 });
    } else {
      kpiPill(PAD + (c3W+8)*2, Y, c3W, 118, 'Avg Power Factor %', `${f16.avg_power_factor || 0}%`, C.blue);
    }
    Y += 126;

    // ── SALES & TRAINING ─────────────────────────────────────────────────
    ensureSpace(160);
    sectionHeader('Sales, Training & Dispatch');

    const salesD    = (get('f21_sales').daily_trend || []).map((d: any) => ({ label: fmtD(d.date), value: d.dailySales ?? d.last_day_lakhs ?? 0, color: C.gold }));
    const salesCumD = (get('f21_sales').daily_trend || []).map((d: any) => ({ label: fmtD(d.date), value: d.cumulativeSales ?? d.cumulative_lakhs ?? 0 }));
    barChart(PAD, Y, c2W, 120, salesD, { title: 'F21 · Sales: Daily (₹ Lakhs)' });
    lineChart(PAD + c2W + 8, Y, c1W, 120, [{ data: salesCumD, color: C.green }], { title: 'F21 · Cumulative Sales (₹L)' });
    Y += 128;

    ensureSpace(130);
    const trainD    = (get('f22_training_last_day').daily_trend || []).map((d: any) => ({ label: fmtD(d.date), value: d.dailyHours ?? d.training_hours ?? 0, color: C.blue }));
    const trainCumD = (get('f22_training_last_day').daily_trend || []).map((d: any) => ({ label: fmtD(d.date), value: d.cumulativeHours ?? d.cumulative_hours ?? 0 }));
    barChart(PAD, Y, c3W, 118, trainD, { title: 'F22 · Daily Training Hours', targetLine: 8, targetColor: C.red });
    lineChart(PAD + c3W + 8, Y, c3W, 118, [{ data: trainCumD, color: C.blue }], { title: 'F23 · Cumulative Training Hours' });

    const dispD = (get('f08_dispatch').daily_trend || []).map((d: any) => ({ label: fmtD(d.date), value: d.total_qty || 0, color: C.gold }));
    barChart(PAD + (c3W+8)*2, Y, c3W, 118, dispD, { title: 'F08 · Dispatch Total Qty' });
    Y += 126;

    // ── Footer on last page ───────────────────────────────────────────────
    ensureSpace(20);
    setStroke(C.border); pdf.setLineWidth(0.5); pdf.line(PAD, Y, PAD + CW, Y); Y += 10;
    setTxt(C.sub); pdf.setFontSize(7.5);
    pdf.text(`Analytics Dashboard  ·  April 2026  ·  ${data.report_count} Reports Processed`, PW / 2, Y, { align: 'center' });

    // Page numbers on page 1 too
    // (already handled via newPage, add for page 1)
    pdf.setPage(1);
    setTxt(C.sub); pdf.setFontSize(8);
    pdf.text('Page 1', PW - PAD, PH - 10, { align: 'right' });

    pdf.save(`Analytics_Dashboard_${data.month}.pdf`);
    toast.success('PDF Exported Successfully!');
  } catch (error) {
    toast.error('Failed to export PDF');
    console.error(error);
  } finally {
    setExportingPdf(false);
  }
};
//   const exportAnalyticsToExcel = async () => {
//   setExportingExcel(true);
//   try {
//     // @ts-ignore
//     const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs');
 
//     const wb = XLSX.utils.book_new();
 
//     // ── Helper: append a sheet from an array-of-arrays ──────────────────────
//     const addSheet = (name: string, rows: any[][]) => {
//       const ws = XLSX.utils.aoa_to_sheet(rows);
//       XLSX.utils.book_append_sheet(wb, ws, name);
//     };
 
//     // ── 1. Summary KPIs ──────────────────────────────────────────────────────
//     addSheet('Summary', [
//       ['Monthly Analytics Summary', data.month],
//       ['Total Daily Reports', data.report_count],
//       [],
//       ['KPI', 'Value'],
//       ['Production Target (Cumul.)',    get('f03_production').cumulative_target],
//       ['Production Actual (Cumul.)',    get('f03_production').cumulative_actual],
//       ['Production Efficiency %',      `${(+(get('f03_production').cumulative_actual / get('f03_production').cumulative_target * 100).toFixed(1))}%`],
//       ['OTIF Adherence Avg %',         get('f10_otif_adherence').avg_actual],
//       ['Plan Adherence Avg %',         get('f09_prod_plan_adherence').avg_actual],
//       ['Per Man Per Day Avg',          get('f05_per_man_per_day').avg_actual],
//       [],
//       ['Quality KPIs', ''],
//       ['Customer Rejection PPM (TML)', get('f02_customer_rejection').by_customer?.[0]?.total_ppm ?? 0],
//       ['First Pass OK Avg %',          get('f24_first_pass_ok').avg_first_pass || get('f24_first_pass_ok').avg_actual || 0],
//       ['PDI Ratio Avg %',              get('f24_first_pass_ok').avg_pdi || 0],
//       ['Supplier Rejection Qty',       get('f26_supplier_rejection').total_qty || 0],
//       ['Poor Incoming Material Qty',   get('f13_poor_incoming_material').total_qty],
//       [],
//       ['Cycle Time & Machine', ''],
//       ['Avg Front CT (min)',           get('f04_cycle_time').avg_front],
//       ['Avg Rear CT (min)',            get('f04_cycle_time').avg_rear],
//       ['CT Target (min)',              get('f04_cycle_time').target_minutes],
//       ['Total Breakdown (min)',        get('f15_machine_breakdown').total_breakdown_minutes],
//       [],
//       ['Workforce', ''],
//       ['Total OT Hours',               get('f06_ot_hours_last_day').total_ot_hours],
//       ['Cumulative OT Hours',          get('f07_ot_hours_cumulative').current_cumulative],
//       ['Total Absent Person-Days',     get('f14_absenteeism').total_absent_person_days],
//       [],
//       ['Issues & Incidents', ''],
//       ['Total Accidents / Near Miss',  get('f01_accident').total_incidents],
//       ['Line Quality Issues',          get('f12_line_quality_issue').total_issues],
//       ['PDI Issues',                   get('f27_pdi_issue').total_issues],
//       ['Field Complaints',             get('f28_field_complaints').total_complaints],
//       ['SOP Non-Adherence Days',       get('f29_sop_non_adherence').total_days_with_issues],
//       ['Fixture Issue Days',           get('f30_fixture_issue').total_days_with_issues],
//       ['Pallet/Trolley Issue Days',    get('f31_pallet_trolley_issue').total_days_with_issues],
//       ['Material Shortage Days',       get('f32_material_shortage').total_days_with_shortage],
//       ['Other Critical Issue Days',    get('f33_other_critical_issue').total_days_with_issues],
//       ['Production Hours Lost',        get('f11_prod_hours_loss').total_hours_lost],
//       [],
//       ['Energy & Utilities', ''],
//       ['Total KVAH (Last Day)',         get('f16_unit_consumption_last_day').total_kvah],
//       ['Cumulative KVAH',              get('f17_unit_consumption_ytd').current_cumulative_kvah],
//       ['Total Diesel LTR (Last Day)',  get('f18_diesel_last_day').total_ltr],
//       ['Cumulative Diesel LTR',        get('f19_diesel_ytd').current_cumulative_ltr],
//       ['Avg Power Factor %',           get('f20_power_factor').avg_actual],
//       [],
//       ['Sales & Training', ''],
//       ['Total Sales (₹ Lakhs)',        get('f21_sales').current_cumulative_lakhs || get('f21_sales').current_cumulative_sales || 0],
//     ]);
 
//     // ── 2. Production Daily ──────────────────────────────────────────────────
//     const prodRows: any[][] = [['Date', 'Target', 'Actual', 'Efficiency %']];
//     get('f03_production').daily_trend.forEach((d: any) => {
//       prodRows.push([d.date, d.target, d.actual, d.target ? +((d.actual / d.target) * 100).toFixed(1) : 0]);
//     });
//     addSheet('Production Daily', prodRows);
 
//     // Part-wise breakdown
//     const partRows: any[][] = [['Part Type', 'Target', 'Actual']];
//     (get('f03_production').by_part_type || []).forEach((p: any) => {
//       partRows.push([partTypes[parseInt(p.partTypeId)]?.name || `Part ${p.partTypeId}`, p.target, p.actual]);
//     });
//     addSheet('Production Part-wise', partRows);
 
//     // ── 3. Quality Daily ─────────────────────────────────────────────────────
//     const qualRows: any[][] = [['Date', 'Cust Rej PPM', '1st Pass OK %', 'PDI Ratio %', 'Supplier Rej Qty', 'Poor Incoming Qty']];
//     const custRejTrend   = get('f02_customer_rejection').daily_trend;
//     const fpassTrend     = get('f24_first_pass_ok').daily_trend;
//     const supplierTrend  = get('f26_supplier_rejection').daily_trend;
//     const incomingTrend  = get('f13_poor_incoming_material').daily_trend;
//     custRejTrend.forEach((d: any, i: number) => {
//       qualRows.push([
//         d.date,
//         d.total_ppm,
//         fpassTrend[i]?.actual || fpassTrend[i]?.first_pass_ok_percentage || 0,
//         fpassTrend[i]?.pdi_ratio || 0,
//         supplierTrend[i]?.total_qty || 0,
//         incomingTrend[i]?.quantity || 0,
//       ]);
//     });
//     addSheet('Quality Daily', qualRows);
 
//     // ── 4. Cycle Time Daily ──────────────────────────────────────────────────
//     const ctRows: any[][] = [['Date', 'Front CT (min)', 'Rear CT (min)', 'Avg CT (min)', 'Target (min)']];
//     get('f04_cycle_time').daily_trend.forEach((d: any) => {
//       ctRows.push([d.date, d.front, d.rear, d.avg, d.target]);
//     });
//     addSheet('Cycle Time Daily', ctRows);
 
//     // ── 5. Machine Breakdown ─────────────────────────────────────────────────
//     const machDailyRows: any[][] = [['Date', 'Breakdown Minutes', 'Target Minutes']];
//     get('f15_machine_breakdown').daily_trend.forEach((d: any) => {
//       machDailyRows.push([d.date, d.total_minutes, get('f15_machine_breakdown').target_minutes]);
//     });
//     addSheet('Machine Breakdown Daily', machDailyRows);
 
//     const machByMachRows: any[][] = [['Machine', 'Total Minutes', 'Count']];
//     (get('f15_machine_breakdown').by_machine || []).forEach((m: any) => {
//       machByMachRows.push([m.machine, m.total_minutes, m.count]);
//     });
//     addSheet('Breakdown by Machine', machByMachRows);
 
//     // ── 6. Overtime & Workforce ───────────────────────────────────────────────
//     const otRows: any[][] = [['Date', 'Daily OT Hours', 'Cumulative OT Hours', 'Absent Persons']];
//     const otTrend  = get('f06_ot_hours_last_day').daily_trend;
//     const otCumTrend = get('f07_ot_hours_cumulative').daily_trend;
//     const absTrend = get('f14_absenteeism').daily_trend;
//     otTrend.forEach((d: any, i: number) => {
//       otRows.push([d.date, d.total_ot, otCumTrend[i]?.cumulative || 0, absTrend[i]?.absent_count || 0]);
//     });
//     addSheet('OT & Workforce Daily', otRows);
 
//     const otDeptRows: any[][] = [['Department', 'Total OT Hours']];
//     (get('f06_ot_hours_last_day').by_department || []).forEach((d: any) => {
//       otDeptRows.push([d.department, d.total_hours]);
//     });
//     addSheet('OT by Department', otDeptRows);
 
//     // ── 7. Issues & Incidents Daily ───────────────────────────────────────────
//     const issRows: any[][] = [['Date', 'Line Quality', 'PDI Issues', 'Field Complaints', 'SOP Issues', 'Fixture Issue', 'Material Shortage', 'Other Critical', 'Prod Hours Lost']];
//     const lqTrend  = get('f12_line_quality_issue').daily_trend;
//     const pdiTrend = get('f27_pdi_issue').daily_trend;
//     const fcTrend  = get('f28_field_complaints').daily_trend;
//     const sopTrend = get('f29_sop_non_adherence').daily_trend;
//     const fixTrend = get('f30_fixture_issue').daily_trend;
//     const matTrend = get('f32_material_shortage').daily_trend;
//     const othTrend = get('f33_other_critical_issue').daily_trend;
//     const phlTrend = get('f11_prod_hours_loss').daily_trend;
//     lqTrend.forEach((d: any, i: number) => {
//       issRows.push([
//         d.date,
//         d.actual,
//         pdiTrend[i]?.issue_count || 0,
//         fcTrend[i]?.quantity || 0,
//         sopTrend[i]?.found || 0,
//         fixTrend[i]?.has_issue || 0,
//         matTrend[i]?.has_issue || 0,
//         othTrend[i]?.has_issue || 0,
//         phlTrend[i]?.actual_hours || 0,
//       ]);
//     });
//     addSheet('Issues Daily', issRows);
 
//     // ── 8. Energy & Utilities Daily ──────────────────────────────────────────
//     const energyRows: any[][] = [['Date', 'KVAH', 'Diesel LTR', 'Cumul. Diesel LTR', 'Power Factor %']];
//     get('f16_unit_consumption_last_day').daily_trend.forEach((d: any) => {
//       energyRows.push([
//         d.date,
//         d.units_kvah || d.kvah || 0,
//         d.quantity_ltr || 0,
//         d.cumulative_ltr || 0,
//         d.power_factor || d.actual || 0,
//       ]);
//     });
//     addSheet('Energy Daily', energyRows);
 
//     // ── 9. Sales & Training Daily ─────────────────────────────────────────────
//     const salesRows: any[][] = [['Date', 'Daily Sales (₹L)', 'Cumulative Sales (₹L)', 'Training Minutes', 'Cumul. Training Min']];
//     const salesTrend    = get('f21_sales').daily_trend;
//     const trainTrend    = get('f22_training_last_day').daily_trend;
//     salesTrend.forEach((d: any, i: number) => {
//       salesRows.push([
//         d.date,
//         d.last_day_lakhs,
//         d.cumulative_lakhs,
//         trainTrend[i]?.training_minutes || (trainTrend[i]?.training_hours * 60) || 0,
//         trainTrend[i]?.cumulative_minutes || (trainTrend[i]?.cumulative_hours * 60) || 0,
//       ]);
//     });
//     addSheet('Sales & Training Daily', salesRows);
 
//     // ── 10. Dispatch Daily ───────────────────────────────────────────────────
//     const dispRows: any[][] = [['Date', 'Front', 'Rear', 'I/A']];
//     get('f08_dispatch').daily_trend.forEach((d: any) => {
//       dispRows.push([d.date, d.total_front, d.total_rear, d.total_ia]);
//     });
//     addSheet('Dispatch Daily', dispRows);
 
//     // ── 11. Plan & OTIF Adherence Daily ──────────────────────────────────────
//     const adherRows: any[][] = [['Date', 'Plan Adh. Actual %', 'Plan Adh. Target %', 'OTIF Actual %', 'OTIF Target %']];
//     const planTrend = get('f09_prod_plan_adherence').daily_trend;
//     const otifTrend = get('f10_otif_adherence').daily_trend;
//     planTrend.forEach((d: any, i: number) => {
//       adherRows.push([d.date, d.actual, d.target, otifTrend[i]?.actual || 0, otifTrend[i]?.target || 0]);
//     });
//     addSheet('Adherence Daily', adherRows);
 
//     // ── Save ─────────────────────────────────────────────────────────────────
//     XLSX.writeFile(wb, `Analytics_Summary_${data.month}.xlsx`);
//     toast.success('Excel Exported Successfully!');
//   } catch (error) {
//     toast.error('Failed to export Excel');
//     console.error(error);
//   } finally {
//     setExportingExcel(false);
//   }
// };


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
    <div className="space-y-8 bg-[#F6F6F6] min-h-screen p-6" id="analytics-dashboard">
      {/* ── Header ── */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-[#C9A962] mb-1">Manufacturing Intelligence</p>
          <h1 className="text-3xl font-bold text-[#1A1A1A]">Analytics Dashboard</h1>
          <p className="text-sm text-[#999] mt-1">April 2025 · {data.report_count} daily reports</p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="flex gap-2" data-html2canvas-ignore="true">
            <Button variant="outline" size="sm" onClick={exportAnalyticsToPdf} disabled={exportingPdf} className="h-8 border-[#C9A962] text-[#C9A962] font-semibold">
              {exportingPdf ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Download className="w-3.5 h-3.5 mr-1.5" />}
              {exportingPdf ? 'Exporting...' : 'Export PDF'}
            </Button>
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
