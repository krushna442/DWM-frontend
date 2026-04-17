import type { PartType, Customer, Supplier, Machine, Department } from '@/types';

export const defaultPartTypes: PartType[] = [
  { id: '0', name: 'Front', code: 'FR', description: 'Front part type', isActive: true },
  { id: '1', name: 'Rear', code: 'RR', description: 'Rear part type', isActive: true },
  { id: '2', name: 'I/A', code: 'IA', description: 'Inter Axial part type', isActive: true },
];

export const defaultCustomers: Customer[] = [
  { id: '1', name: 'TML', code: 'TML', description: 'Tata Motors Limited', isActive: true },
  { id: '2', name: 'ALL ALW', code: 'ALW', description: '', isActive: true },
  { id: '3', name: 'ALL PNR', code: 'PNR', description: '', isActive: true },
];

export const defaultSuppliers: Supplier[] = [
  { id: '1', name: 'Supplier A', code: 'SUP-A', description: 'Primary raw material supplier', isActive: true },
  { id: '2', name: 'Supplier B', code: 'SUP-B', description: 'Secondary supplier', isActive: true },
  { id: '3', name: 'Supplier C', code: 'SUP-C', description: 'Component supplier', isActive: true },
];

export const defaultMachines: Machine[] = [
  { id: '1', name: 'Cutting Machine', code: 'CUTTING', department: '1', description: 'Cutting operations', isActive: true },
  { id: '2', name: 'Chamfering Machine', code: 'CHAMF', department: '2', description: 'Chamfering operations', isActive: true },
  { id: '3', name: 'Phosphating Unit', code: 'PHOSP', department: '3', description: 'Phosphating process', isActive: true },
  { id: '4', name: 'Washing Unit', code: 'WASH', department: '4', description: 'Washing operations', isActive: true },
  { id: '5', name: 'Primo Machine', code: 'PRIMO', department: '5', description: 'Primo operations', isActive: true },

  { id: '6', name: 'Welding Manual', code: 'WELD-M', department: '6', description: 'Manual welding', isActive: true },
  { id: '7', name: 'Welding LF', code: 'WELD-LF', department: '7', description: 'LF welding', isActive: true },
  { id: '8', name: 'Welding Tack', code: 'WELD-TK', department: '8', description: 'Tack welding', isActive: true },

  { id: '9', name: 'Joint Front', code: 'JT-F', department: '9', description: 'Front joint operations', isActive: true },
  { id: '10', name: 'Joint Rear', code: 'JT-R', department: '10', description: 'Rear joint operations', isActive: true },
  { id: '11', name: 'Joint IA', code: 'JT-IA', department: '11', description: 'IA joint operations', isActive: true },

  { id: '12', name: 'Steering Rear', code: 'STNG-R', department: '12', description: 'Rear steering operations', isActive: true },
  { id: '13', name: 'Steering Front', code: 'STNG-F', department: '13', description: 'Front steering operations', isActive: true },

  { id: '14', name: 'Final Assembly', code: 'F-ASSY', department: '14', description: 'Final assembly', isActive: true },

  { id: '15', name: 'Balancing Front', code: 'BAL-F', department: '15', description: 'Front balancing', isActive: true },
  { id: '16', name: 'Balancing Rear', code: 'BAL-R', department: '16', description: 'Rear balancing', isActive: true },

  { id: '17', name: 'Paint Shop', code: 'PAINT-S', department: '17', description: 'Painting operations', isActive: true },

  { id: '18', name: 'Forklift', code: 'FORKLIFT', department: '18', description: 'Material handling', isActive: true },
  { id: '19', name: 'Crane', code: 'CRANE', department: '19', description: 'Lifting operations', isActive: true },

  { id: '20', name: 'Seal Press', code: 'S-PRESS', department: '20', description: 'Seal press operations', isActive: true },
  { id: '21', name: 'Other Machine', code: 'OTHER', department: '21', description: 'Miscellaneous', isActive: true },

  { id: '22', name: 'B Cup Machine', code: 'B-CUP', department: '22', description: 'B Cup operations', isActive: true },
  { id: '23', name: 'Deadener Unit', code: 'DEADEN', department: '23', description: 'Deadener process', isActive: true },
];
export const defaultDepartments: Department[] = [
  { id: '1', name: 'Human Resources', code: 'HR', description: 'HR department', isActive: true },
  { id: '2', name: 'Quality Assurance', code: 'QA', description: 'Quality department', isActive: true },
  { id: '3', name: 'Production', code: 'PRD', description: 'Production department', isActive: true },
  { id: '4', name: 'Sales', code: 'SALES', description: 'Sales department', isActive: true },
  { id: '5', name: 'Purchase', code: 'PURC', description: 'Procurement department', isActive: true },
  { id: '6', name: 'Maintenance', code: 'MAINT', description: 'Maintenance department', isActive: true },
  { id: '7', name: 'Service', code: 'SERV', description: 'Service department', isActive: true },
  { id: '8', name: 'Quality Management System', code: 'QMS', description: 'QMS department', isActive: true },
  { id: '9', name: 'Engineering', code: 'ENG', description: 'Engineering department', isActive: true },
  { id: '10', name: 'Planning', code: 'PLAN', description: 'Planning department', isActive: true },
  { id: '11', name: 'Others', code: 'OTHERS', description: 'Other activities', isActive: true },
];
// Sample daily entries for demonstration
export const sampleDailyEntries = [
  {
    id: '1',
    date: '2024-01-15',
    departmentId: '1',
    createdBy: 'Admin',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
    safety: [],
    customerRejectionCount: 0,
    customerRejections: [],
    production: [
      { partTypeId: '1', target: 500, actual: 485 },
      { partTypeId: '2', target: 400, actual: 410 },
    ],
    cycleTime: { front: 1.8, rear: 1.9, causeActions: [] },
    perManPerDay: {
      target: 6,
      actual: 0,
      causeActions: [],
    },
    overtime: [{ departmentId: '1', hours: 2, reason: 'Production catch-up' }],
    cumulativeOT: { previousTotal: 45, yesterdayOT: 2, todayCumulative: 47 },
    dispatch: [
      { customerId: '1', quantity: 300 },
      { customerId: '2', quantity: 250 },
    ],
    productionPlanAdherence: {
      target: 95,
      actual: 97,
      causeActions: [],
    },
    scheduleAdherence: {
      target: 100,
      actual: 95,
      causeActions: [{ cause: 'Machine breakdown', action: 'Preventive maintenance', responsible: 'OM', targetDate: '2024-01-18' }],
    },
    materialShortageLoss: {
      target: 0,
      actual: 30,
      causeActions: [{ cause: 'Supplier delay', action: 'Follow up with supplier', responsible: 'Dipti', targetDate: '2024-01-17' }],
    },
    lineQualityIssues: {
      target: 0,
      actual: 2,
      causeActions: [],
    },
    incomingMaterialQualityImpact: {
      target: 0,
      actual: 0,
      causeActions: [],
    },
    absenteeism: {
      target: 0,
      actual: 3,
      causeActions: [],
    },
    machineBreakdown: {
      target: 30,
      actual: 0,
      causeActions: [],
    },
    utilities: {
      electricityKVAH: 1250,
      electricityShift: 'A',
      dieselLTR: 45,
      dieselShift: 'A',
      powerFactor: 92,
      cumulativeElectricity: 15250,
      cumulativeDiesel: 520,
    },
    sales: { dailySales: 25.5, cumulativeSales: 385.2 },
    training: { dailyHours: 4, cumulativeHours: 120, topic: '' },
    qualityRatios: { firstPassOKRatio: 98.5, firstPassCauseActions: [], pdiRatio: 99.2, pdiCauseActions: [] },
    supplierRejectionCount: 0,
    supplierRejections: [],
    pdiIssues: { hasIssue: false, causeActions: [] },
    fieldComplaints: { hasIssue: false, causeActions: [] },
    sopNonAdherence: { hasIssue: false, causeActions: [] },
    fixtureIssues: { hasIssue: false, causeActions: [] },
    palletTrolleyIssues: { hasIssue: false, causeActions: [] },
    materialShortageIssue: { hasIssue: false, quantity: 0, causeActions: [] },
    otherCriticalIssue: { hasIssue: false, causeActions: [] },
  },
];
