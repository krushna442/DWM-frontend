// Master Data Types
export interface PartType {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
}

export interface Customer {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
}

export interface Machine {
  id: string;
  name: string;
  code: string;
  department: string;
  description?: string;
  isActive: boolean;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
}

// Reusable Cause/Action Row
export interface CauseActionRow {
  machineId?: string;
  supplierId?: string;
  departmentId?: string;
  internalExternal?: 'internal' | 'external';
  cause: string;
  action: string;
  responsible: string;
  targetDate: string;
}

// Safety Section
export interface SafetyEntry {
  type: 'accidents' | 'incidents' | 'nearMiss';
  incidentType: 'machine' | 'others';
  machineId?: string;
  count: number;
  causeActions: CauseActionRow[];
}

// Customer Rejection
export interface CustomerRejection {
  customerId: string;
  reason: string;
}

// Production Entry
export interface ProductionEntry {
  partTypeId: string;
  target: number;
  actual: number;
}

// Cycle Time
export interface CycleTime {
  front: number;
  rear: number;
  causeActions: CauseActionRow[];
}

// Per Man Per Day Output
export interface PerManPerDay {
  target: number;
  actual: number;
  causeActions: CauseActionRow[];
}

// Overtime Entry
export interface OvertimeEntry {
  departmentId: string;
  hours: number;
  reason: string;
}

// Cumulative OT
export interface CumulativeOT {
  previousTotal: number;
  yesterdayOT: number;
  todayCumulative: number;
}

// Dispatch Entry
export interface DispatchEntry {
  customerId: string;
  quantity: number;
}

// Performance Metric Entry
export interface PerformanceMetric {
  target: number;
  actual: number;
  causeActions: CauseActionRow[];
}

// Utilities Entry
export interface UtilitiesEntry {
  electricityKVAH: number;
  electricityShift: string;
  dieselLTR: number;
  dieselShift: string;
  powerFactor: number;
  cumulativeElectricity: number;
  cumulativeDiesel: number;
}

// Sales Entry
export interface SalesEntry {
  dailySales: number;
  cumulativeSales: number;
}

// Training Entry
export interface TrainingEntry {
  dailyHours: number;
  cumulativeHours: number;
  topic: string;
}

// Quality Ratios
export interface QualityRatios {
  firstPassOKRatio: number;
  firstPassCauseActions: CauseActionRow[];
  pdiRatio: number;
  pdiCauseActions: CauseActionRow[];
}

// Supplier Rejection
export interface SupplierRejection {
  supplierId: string;
  reason: string;
}

// Issue Tracking
export interface IssueTracking {
  hasIssue: boolean;
  quantity?: number;
  causeActions: CauseActionRow[];
}

// Complete Daily Entry
export interface DailyEntry {
  id: string;
  date: string;
  departmentId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  
  // Section 1: Safety
  safety: SafetyEntry[];
  
  // Section 2: Customer Rejection
  customerRejectionCount: number;
  customerRejections: CustomerRejection[];
  
  // Section 3: Production
  production: ProductionEntry[];
  
  // Section 4: Cycle Time
  cycleTime: CycleTime;
  
  // Section 5: Per Man Per Day Output
  perManPerDay: PerManPerDay;
  
  // Section 6: Overtime
  overtime: OvertimeEntry[];
  
  // Section 7: Cumulative OT
  cumulativeOT: CumulativeOT;
  
  // Section 8: Dispatch
  dispatch: DispatchEntry[];
  
  // Sections 9-15: Performance Metrics
  productionPlanAdherence: PerformanceMetric;
  scheduleAdherence: PerformanceMetric;
  materialShortageLoss: PerformanceMetric;
  lineQualityIssues: PerformanceMetric;
  incomingMaterialQualityImpact: PerformanceMetric;
  absenteeism: PerformanceMetric;
  machineBreakdown: PerformanceMetric;
  
  // Sections 16-20: Utilities
  utilities: UtilitiesEntry;
  
  // Section 21: Sales
  sales: SalesEntry;
  
  // Sections 22-23: Training
  training: TrainingEntry;
  
  // Sections 24-25: Quality Ratios
  qualityRatios: QualityRatios;
  
  // Section 26: Supplier Rejection
  supplierRejectionCount: number;
  supplierRejections: SupplierRejection[];
  
  // Sections 27-33: Issues Tracking
  pdiIssues: IssueTracking;
  fieldComplaints: IssueTracking;
  sopNonAdherence: IssueTracking;
  fixtureIssues: IssueTracking;
  palletTrolleyIssues: IssueTracking;
  materialShortageIssue: IssueTracking;
  otherCriticalIssue: IssueTracking;
}

// Email Notification
export interface EmailNotification {
  id: string;
  entryId: string;
  section: string;
  recipients: string[];
  subject: string;
  message: string;
  sentAt: string;
  sentBy: string;
}

// Analytics Types
export interface ProductionAnalytics {
  date: string;
  target: number;
  actual: number;
  efficiency: number;
}

export interface OTAnalytics {
  departmentId: string;
  departmentName: string;
  totalHours: number;
  entries: number;
}

export interface RejectionAnalytics {
  customerId: string;
  customerName: string;
  count: number;
  reasons: string[];
}

export interface IssueAnalytics {
  category: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
}

// Dashboard KPI
export interface DashboardKPI {
  title: string;
  value: number | string;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: string;
}

// Form Section
export interface FormSection {
  id: string;
  title: string;
  description?: string;
  icon: string;
  isCompleted: boolean;
  isActive: boolean;
}

// User
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'operator';
  departmentId?: string;
  isActive: boolean;
}

// Filter Options
export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface AnalyticsFilter {
  dateRange: DateRange;
  departmentId?: string;
  partTypeId?: string;
}
