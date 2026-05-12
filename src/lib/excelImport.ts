/**
 * Excel Import Utility for Daily Entry
 * Template now mirrors the History page daily report table format.
 * downloadImportTemplate() → generates a structured table .xlsx template
 * parseImportedExcel()      → reads that table back → partial DailyEntry
 */

import type { DailyEntry, CauseActionRow } from '@/types';

export interface ImportMasterData {
  partTypes:   { id: string; name: string; code: string }[];
  customers:   { id: string; name: string; code: string }[];
  suppliers:   { id: string; name: string; code: string }[];
  departments: { id: string; name: string; code: string }[];
  machines:    { id: string; name: string; code: string }[];
}

// ─── helpers ─────────────────────────────────────────────────────────────────
function idByName<T extends { id: string; name: string }>(arr: T[], name: string) {
  return arr.find(x => x.name.trim().toLowerCase() === (name||'').trim().toLowerCase())?.id || '';
}
function idByCode<T extends { id: string; code: string }>(arr: T[], code: string) {
  return arr.find(x => x.code.trim().toLowerCase() === (code||'').trim().toLowerCase())?.id || '';
}
function yn(v: string) { return (v||'').trim().toUpperCase() === 'YES'; }
function num(v: string|number) { return parseFloat(String(v)||'0') || 0; }
function int(v: string|number) { return parseInt(String(v)||'0') || 0; }

/** Parse comma-separated causes/actions into CauseActionRow[] */
function parseCauseActions(cause='', action='', resp='', date=''): CauseActionRow[] {
  const splitVal = (str: string) => String(str || '').split('|').map(s => s.trim()).filter(Boolean).map(s => s === '—' ? '' : s);
  const causes  = splitVal(cause);
  const actions = splitVal(action);
  const resps   = splitVal(resp);
  const dates   = splitVal(date);
  const len = Math.max(causes.length, actions.length, resps.length, dates.length, 1);
  return Array.from({length: len}, (_,i) => ({
    cause: causes[i]||'', action: actions[i]||'',
    responsible: resps[i]||'', targetDate: dates[i]||'',
  }));
}

// ─── Template row definitions ─────────────────────────────────────────────────
type TplRow = (string | number)[];

function buildTemplateRows(md: ImportMasterData): TplRow[] {
  const HDR: TplRow = [
    'SI', 'Check Points', 'MP', 'Target', 'Actual / Value',
    'Probable Causes', 'Action Planned', 'Responsible', 'Target Date'
  ];

  const grouped = md.partTypes.map(pt => `${pt.name}: 0/0`).join(' | ');
  
  const deptHint = md.departments.slice(0, 2).map(d=>`${d.name}: 2h — reason`).join(' | ');
  const custHint = md.customers.slice(0, 2).map(c=>`${c.name}: 100`).join(' | ');
  const suppHint = md.suppliers.slice(0, 2).map(s=>`${s.name}: reason`).join(' | ');

  const rows: TplRow[] = [
    HDR,
    // Add date row at top for import
    ['—', 'REPORT DATE (YYYY-MM-DD)', '—', '—', 'e.g. 2026-05-07', '—', '—', '—', '—'],
    [1, 'Last day accident/Incident/Near Miss in nos. (Reported)', 'S', '0', 'e.g. nearMiss (1)', 'e.g. slipped | tripped', 'clean floor | put sign', 'John | Doe', '2026-05-08 | 2026-05-09'],
    [2, 'Last day Customer rejection (TML | ALW | PNR)', 'Q', '0 PPM', `e.g. 2`, `e.g. ${custHint}`, '—', '—', '—'],
    [3, 'Last Day Production', 'P', 'Plan', `0/0 | ${grouped}`, '—', '—', '—', '—'],
    [4, 'Cycle Time (Front / Rear)', 'P', '<2 Min', 'F:1.8m | R:1.5m', 'cause 1', 'action 1', 'resp 1', 'date 1'],
    [5, 'Per man per day prop shaft qty Yesterday', 'P', '6', '5', '', '', '', ''],
    [6, 'Last day OT hours (Prd,QA,Main,Mater,Engg,Planning)', 'C', '0', 'e.g. 10 hrs', `e.g. ${deptHint}`, '—', '—', '—'],
    [7, 'Cumulative OT hours', 'C', '—', '0 hrs', '—', '—', '—', '—'],
    [8, 'Last Day Dispatch (TML | ALW | PNR)', 'S', '—', `e.g. ${custHint}`, '—', '—', '—', '—'],
    [9, 'Production plan adherance %age (Yesterday)', 'P', '95%', '90%', '', '', '', ''],
    [10, 'Ontime In Full schedule adherance %age (Yesterday)', 'D', '100%', '95%', '', '', '', ''],
    [11, 'Production hours loss for material shortage', 'P', '0', 'e.g. 2 hrs', '', '', '', ''],
    [12, 'Line Quality Issue', 'P', '0', '1', '', '', '', ''],
    [13, 'Production line affected due to poor Quality of incoming material', 'Q', '0', '0', '', '', '', ''],
    [14, 'Unauthorised absentisim (Prd & Others)', 'M', '0', '2', '', '', '', ''],
    [15, 'Breakdown of machine', 'P', '30 min max', 'e.g. 20 min', '', '', '', ''],
    [16, 'Unit consumption Last Day (KVAH)', 'C', '—', '440 kVAh (Shift A)', '—', '—', '—', '—'],
    [17, 'Unit Consumption Till date (YTD)', 'C', '—', '2700 kVAh', '—', '—', '—', '—'],
    [18, 'Diesel consumption Last Day (LTR)', 'C', '0', '20 L (Shift A)', '—', '—', '—', '—'],
    [19, 'Diesel consumption Till date (YTD)', 'C', '0', '94 L', '—', '—', '—', '—'],
    [20, 'Power Factor', 'C', '95–99', '97%', '—', '—', '—', '—'],
    [21, 'Sales Values (Last Day & Cumm)', 'C', '—', 'Daily: ₹20L | Cumm: ₹134L', '—', '—', '—', '—'],
    [22, 'Last day training hours', 'M', '30 min', '1 hrs — Safety topic', '—', '—', '—', '—'],
    [23, 'Cumulative training hours', 'M', '—', '40 hrs', '—', '—', '—', '—'],
    [24, 'Last day 1st pass ok Ratio', 'Q', '100%', '98%', '', '', '', ''],
    [25, 'Last Day 1st Pass ok Ratio-PDI', 'Q', '100%', '99%', '', '', '', ''],
    [26, 'Last day supplier rejection', 'Q', '0 PPM', 'e.g. 2', `e.g. ${suppHint}`, '—', '—', '—'],
    [27, 'Last Day PDI Issue', 'Q', '0', 'NO', '', '', '', ''],
    [28, 'Last day field complaints/Issue reported in numbers', 'Q', '0 Nos', 'NO', '', '', '', ''],
    [29, 'Is there any SOP non adherance found in yesterdays LPA audit', 'Q', '—', 'NO', '', '', '', ''],
    [30, 'Line Issue/Stop Due to fixtures', 'D', '0', 'NO', '', '', '', ''],
    [31, 'Any Issue Related to Pallets Or Trolley (Internal & External)', 'P', '0', 'NO', '', '', '', ''],
    [32, 'Material Shortage Issue', 'P', '0', 'e.g. 10 nos', '', '', '', ''],
    [33, 'Other Critical Issue', 'P', '0', 'NO', '', '', '', ''],
    ['—', 'Others / Remarks', '—', '—', '', '—', '—', '—', '—'],
    ['—', 'Others / Remarks 2', '—', '—', '', '—', '—', '—', '—'],
  ];

  return rows;
}

// ─── Download Template ────────────────────────────────────────────────────────
export async function downloadImportTemplate(md: ImportMasterData) {
  // @ts-ignore
  const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs');

  const rows = buildTemplateRows(md);

  // ── Sheet 2: Master Data Reference ──
  const ref: string[][] = [
    ['MASTER DATA REFERENCE — use names in the template above'],
    [''],
    ['PART TYPES'], ['Name'],
    ...md.partTypes.map(p => [p.name]),
    [''],
    ['CUSTOMERS'], ['Name'],
    ...md.customers.map(c => [c.name]),
    [''],
    ['SUPPLIERS'], ['Name'],
    ...md.suppliers.map(s => [s.name]),
    [''],
    ['DEPARTMENTS'], ['Name'],
    ...md.departments.map(d => [d.name]),
    [''],
    ['MACHINES'], ['Name'],
    ...md.machines.map(m => [m.name]),
    [''],
    ['HOW TO FILL MULTI-VALUE FIELDS (Use | to separate items)'],
    ['Production', 'TotalA/TotalT | PartA: A/T | PartB: A/T'],
    ['OT Hours Causes', 'Dept Name: 2h — reason | Dept Name 2: 3h — reason'],
    ['Dispatch', 'Cust Name: 100 | Cust Name 2: 200'],
    ['Supplier Rejection Causes', 'Supp Name: reason | Supp Name 2: reason'],
    ['Customer Rejection Causes', 'Cust Name: reason | Cust Name 2: reason'],
    ['Causes / Actions / Responsible / Dates', 'Separate multiple entries with |'],
  ];

  const wb = XLSX.utils.book_new();
  const ws1 = XLSX.utils.aoa_to_sheet(rows);
  ws1['!cols'] = [
    { wch: 4 }, { wch: 46 }, { wch: 5 }, { wch: 12 },
    { wch: 30 }, { wch: 28 }, { wch: 28 }, { wch: 14 }, { wch: 14 },
  ];
  // Freeze the header row
  ws1['!freeze'] = { xSplit: 0, ySplit: 1 };

  const ws2 = XLSX.utils.aoa_to_sheet(ref);
  ws2['!cols'] = [{wch:22}, {wch:40}];

  XLSX.utils.book_append_sheet(wb, ws1, 'Daily Report');
  XLSX.utils.book_append_sheet(wb, ws2, 'Master Data Reference');
  XLSX.writeFile(wb, 'DailyEntry_Template.xlsx');
}

// ─── Parse Imported Excel ─────────────────────────────────────────────────────
export async function parseImportedExcel(
  file: File,
  md: ImportMasterData
): Promise<Partial<DailyEntry>> {
  // @ts-ignore
  const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs');
  const buf  = await file.arrayBuffer();
  const wb   = XLSX.read(buf, { type: 'array' });

  const ws = wb.Sheets[wb.SheetNames[0]];
  const raw: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

  const kv: Record<string, { val: string; cause: string; action: string; resp: string; td: string }> = {};
  
  // Parse rows by 'Check Points' column (index 1)
  for (const row of raw) {
    const cp = String(row[1] || '').trim();
    if (!cp || cp === 'Check Points') continue;
    kv[cp] = {
      val:    String(row[4] || '').trim(),
      cause:  String(row[5] || '').trim(),
      action: String(row[6] || '').trim(),
      resp:   String(row[7] || '').trim(),
      td:     String(row[8] || '').trim(),
    };
  }

  const get = (keyLike: string) => {
    const key = Object.keys(kv).find(k => k.includes(keyLike));
    return key ? kv[key].val : '';
  };
  const getCA = (keyLike: string): CauseActionRow[] => {
    const key = Object.keys(kv).find(k => k.includes(keyLike));
    if (!key) return [];
    const e = kv[key];
    return parseCauseActions(e.cause, e.action, e.resp, e.td);
  };
  const getObj = (keyLike: string) => {
    const key = Object.keys(kv).find(k => k.includes(keyLike));
    return key ? kv[key] : { val: '', cause: '', action: '', resp: '', td: '' };
  };

  // 1. Safety "accidents (2), incidents (1)"
  const safetyVal = get('Last day accident/Incident');
  const safety: any[] = [];
  if (safetyVal && safetyVal !== '0') {
    const parts = safetyVal.split(',').map(s => s.trim());
    parts.forEach(p => {
      const match = p.match(/(\w+)\s*\((\d+)\)/i);
      if (match) {
        safety.push({
          type: match[1].toLowerCase(),
          incidentType: 'others',
          count: int(match[2]),
          causeActions: getCA('Last day accident/Incident')
        });
      }
    });
  }

  // 2. Customer Rejection "2" in Val, "CustName: reason | CustName: reason" in Causes
  const crObj = getObj('Last day Customer rejection');
  const crItems = crObj.cause.split('|').map(s=>s.trim()).filter(Boolean).filter(s => s !== '—').map(e => {
    const [name, ...rest] = e.split(':');
    return { customerId: idByName(md.customers, name) || name, reason: rest.join(':').trim() };
  });
  const crCount = crItems.length;

  // 3. Production "300/310 | PartA: 100/100 | PartB: 200/210"
  const prodVal = get('Last Day Production');
  const production = md.partTypes.map(pt => ({ partTypeId: pt.id, target: 0, actual: 0 }));
  if (prodVal) {
    const parts = prodVal.split('|').map(s=>s.trim());
    parts.forEach(p => {
      if (p.includes(':')) {
        const [name, vals] = p.split(':');
        const [actual, target] = vals.split('/');
        const ptId = idByName(md.partTypes, name) || idByCode(md.partTypes, name);
        const idx = production.findIndex(pr => pr.partTypeId === ptId);
        if (idx !== -1) {
          production[idx].actual = int(actual);
          production[idx].target = int(target);
        }
      }
    });
  }

  // 4. Cycle time "F:1.8m | R:1.5m"
  const ctVal = get('Cycle Time (Front');
  let front = 0, rear = 0;
  ctVal.split('|').forEach(p => {
    if (p.includes('F:')) front = num(p.replace(/[^\d.]/g, ''));
    if (p.includes('R:')) rear = num(p.replace(/[^\d.]/g, ''));
  });

  // 6. OT "10 hrs" in Val, "Dept: 2h — reason | Dept: 8h — reason" in Causes
  const otVal = get('Last day OT hours');
  const otObj = getObj('Last day OT hours');
  const overtime = otObj.cause.split('|').map(s=>s.trim()).filter(Boolean).filter(s => s !== '—').map(e => {
    const [deptStr, rest] = e.split(':');
    const [hStr, ...reasonParts] = (rest || '').split('—');
    const hours = num(hStr.replace(/[^\d.]/g, ''));
    return {
      departmentId: idByName(md.departments, deptStr) || deptStr,
      hours,
      reason: reasonParts.join('—').trim()
    };
  });

  // 8. Dispatch "CustName: 100 | CustName: 200"
  const dispVal = get('Last Day Dispatch');
  const dispatch = dispVal.split('|').map(s=>s.trim()).filter(Boolean).filter(s => !s.includes('Total:') && s !== '—').map(e => {
    const [name, qty] = e.split(':');
    const cust = md.customers.find(c => c.name.trim().toLowerCase() === name.trim().toLowerCase());
    return { 
      customerId: cust?.id || name, 
      code: cust?.code || '',
      quantity: int(qty) 
    };
  });

  // 16-20. Utilities
  const elecVal = get('Unit consumption Last Day');
  let elecShift = 'A', elecKvah = 0;
  if (elecVal) {
    elecKvah = num(elecVal.split(' ')[0]);
    const shiftMatch = elecVal.match(/Shift\s+([A-Z]+)/i);
    if (shiftMatch) elecShift = shiftMatch[1].toUpperCase();
  }
  const dieselVal = get('Diesel consumption Last Day');
  let dieselShift = 'A', dieselLtr = 0;
  if (dieselVal) {
    dieselLtr = num(dieselVal.split(' ')[0]);
    const shiftMatch = dieselVal.match(/Shift\s+([A-Z]+)/i);
    if (shiftMatch) dieselShift = shiftMatch[1].toUpperCase();
  }

  // 21. Sales "Daily: ₹20L | Cumm: ₹134L"
  const salesVal = get('Sales Values');
  let dailySales = 0, cumSales = 0;
  salesVal.split('|').forEach(p => {
    if (p.toLowerCase().includes('daily')) dailySales = num(p.replace(/[^\d.]/g, ''));
    if (p.toLowerCase().includes('cumm')) cumSales = num(p.replace(/[^\d.]/g, ''));
  });

  // 22. Training "1 hrs — topic"
  const tVal = get('Last day training hours');
  let tHrs = 0, tTopic = '';
  if (tVal) {
    const parts = tVal.split('—');
    tHrs = num(parts[0].replace(/[^\d.]/g, ''));
    tTopic = parts.slice(1).join('—').trim();
  }

  // 26. Supplier Rejection "2" in Val, "SuppName: reason | SuppName: reason" in Causes
  const srObj = getObj('Last day supplier rejection');
  const supplierRejections = srObj.cause.split('|').map(s=>s.trim()).filter(Boolean).filter(s => s !== '—').map(e => {
    const [name, ...rest] = e.split(':');
    return { supplierId: idByName(md.suppliers, name) || name, reason: rest.join(':').trim() };
  });

  const matShortQty = get('Material Shortage Issue');

  const result: Partial<DailyEntry> = {
    date: get('REPORT DATE') || '',
    safety,
    customerRejectionCount: crCount,
    customerRejections: crItems,
    production,
    cycleTime: { front, rear, causeActions: getCA('Cycle Time (Front') },
    perManPerDay: { target: 6, actual: num(get('Per man per day')), causeActions: getCA('Per man per day') },
    overtime,
    cumulativeOT: { previousTotal: 0, yesterdayOT: 0, todayCumulative: num(get('Cumulative OT')) },
    dispatch,
    productionPlanAdherence: { target: 95, actual: num(get('Production plan adherance')), causeActions: getCA('Production plan adherance') },
    scheduleAdherence: { target: 100, actual: num(get('schedule adherance %age')), causeActions: getCA('schedule adherance %age') },
    materialShortageLoss: { target: 0, actual: num(get('hours loss for material shortage')), causeActions: getCA('hours loss for material shortage') },
    lineQualityIssues: { target: 0, actual: int(get('Line Quality Issue')), causeActions: getCA('Line Quality Issue') },
    incomingMaterialQualityImpact: { target: 0, actual: int(get('poor Quality of incoming material')), causeActions: getCA('poor Quality of incoming material') },
    absenteeism: { target: 0, actual: int(get('absentisim')), causeActions: getCA('absentisim') },
    machineBreakdown: { target: 30, actual: num(get('Breakdown of machine')), causeActions: getCA('Breakdown of machine') },
    utilities: {
      electricityKVAH:       elecKvah,
      electricityShift:      elecShift,
      cumulativeElectricity: num(get('Unit Consumption Till date')),
      dieselLTR:             dieselLtr,
      dieselShift:           dieselShift,
      cumulativeDiesel:      num(get('Diesel consumption Till date')),
      powerFactor:           num(get('Power Factor')),
    },
    sales: { dailySales, cumulativeSales: cumSales },
    training: { dailyHours: tHrs, cumulativeHours: num(get('Cumulative training hours')), topic: tTopic },
    qualityRatios: {
      firstPassOKRatio:     num(get('Last day 1st pass ok Ratio')),
      firstPassCauseActions: getCA('Last day 1st pass ok Ratio'),
      pdiRatio:             num(get('1st Pass ok Ratio-PDI')),
      pdiCauseActions:      getCA('1st Pass ok Ratio-PDI'),
    },
    supplierRejectionCount: supplierRejections.length,
    supplierRejections,
    pdiIssues:           { hasIssue: yn(get('PDI Issue')),       causeActions: getCA('PDI Issue') },
    fieldComplaints:     { hasIssue: yn(get('field complaints')), causeActions: getCA('field complaints') },
    sopNonAdherence:     { hasIssue: yn(get('SOP non adherance')), causeActions: getCA('SOP non adherance') },
    fixtureIssues:       { hasIssue: yn(get('Due to fixtures')), causeActions: getCA('Due to fixtures') },
    palletTrolleyIssues: { hasIssue: yn(get('Pallets Or Trolley')), causeActions: getCA('Pallets Or Trolley') },
    materialShortageIssue: {
      hasIssue: int(matShortQty) > 0,
      quantity: int(matShortQty),
      causeActions: getCA('Material Shortage Issue'),
    },
    otherCriticalIssue: { hasIssue: yn(get('Other Critical Issue')), causeActions: getCA('Other Critical Issue') },
    otherField1: get('Others / Remarks') && get('Others / Remarks') !== '—' ? get('Others / Remarks') : '',
    otherField2: get('Others / Remarks 2') && get('Others / Remarks 2') !== '—' ? get('Others / Remarks 2') : '',
  };
  return result;
}

