// import { useState, useMemo } from 'react';
import { 
    // Calendar as CalendarIcon, 
    // Search, 
    // Eye, 
    // Trash2, 
    // ChevronLeft,
    // ChevronRight,
    // Filter,
  Download,
  // AlertTriangle,
  Calendar
} from 'lucide-react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
import {
  // Select,
  // SelectContent,
  // SelectItem,
  // SelectTrigger,
  // SelectValue,
} from '@/components/ui/select';
import {
  // Dialog,
  // DialogContent,
  // DialogHeader,
  // DialogTitle,
} from '@/components/ui/dialog';
// import { toast } from 'sonner';
// import { useDailyEntry } from '@/context/DailyEntryContext';
// import { useMasterData } from '@/context/MasterDataContext';
// import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';



// ── Helper: Section header row ──────────────────────────────────────────────
// function SectionHeader({ label, colSpan, color }: { label: string; colSpan: number; color: string }) {
//   return (
//     <tr>
//       <td
//         colSpan={colSpan}
//         className="px-3 py-1 text-xs font-bold uppercase tracking-widest text-white border border-[#D4D4D4]"
//         style={{ background: color, letterSpacing: "0.1em" }}
//       >
//         {label}
//       </td>
//     </tr>
//   );
// }

// ── Helper: Standard excel-style row ────────────────────────────────────────
function ExcelRow({
  sl, mp, checkpoint, owner, target, valueCell,
  total, totalBg, causes, action, responsible, targetDate,
}: {
  sl: number;
  mp: string;
  checkpoint: string;
  owner: string;
  target: React.ReactNode;
  valueCell: React.ReactNode;
  total: React.ReactNode;
  totalBg: string;
  causes?: string;
  action?: string;
  responsible?: string;
  targetDate?: string;
}) {
  return (
    <tr style={{ background: sl % 2 === 0 ? "#FAFAFA" : "#FFFFFF" }}>
      <td className="border border-[#D4D4D4] px-2 py-1 text-center font-semibold text-[#666666]">{sl}</td>
      <td className="border border-[#D4D4D4] px-2 py-1 font-medium text-[#1A1A1A]">{checkpoint}</td>
      <td className="border border-[#D4D4D4] px-2 py-1 text-center text-[#666666]">{mp}</td>
      <td className="border border-[#D4D4D4] px-2 py-1 text-center text-[#1A1A1A]">{owner}</td>
      <td className="border border-[#D4D4D4] px-2 py-1 text-center text-[#666666]">{target}</td>
      {valueCell}
      <td className="border border-[#D4D4D4] px-2 py-1 text-center font-bold" style={{ background: totalBg }}>
        {total}
      </td>
      <td className="border border-[#D4D4D4] px-2 py-1 text-[#666666] text-xs">{causes ?? "—"}</td>
      <td className="border border-[#D4D4D4] px-2 py-1 text-xs">{action ?? "—"}</td>
      <td className="border border-[#D4D4D4] px-2 py-1 text-center text-xs text-[#666666]">{responsible ?? "—"}</td>
      <td className="border border-[#D4D4D4] px-2 py-1 text-center text-xs text-[#666666]">{targetDate ?? "—"}</td>
    </tr>
  );
}



const data=  {
        "id": "b7afb163-388e-11f1-88b5-5fcad6d29c94",
        "report_date": "2025-04-16T00:00:00.000Z",
        "month_key": "2025-04",
        "submitted_by": "Ravi Kumar",
        "submitted_at": "2026-04-15T05:48:24.000Z",
        "updated_at": "2026-04-15T11:18:24.000Z",
        "f01_accident": {
            "target": 0,
            "entries": [
                {
                    "type": "machine",
                    "action": "Replaced wire",
                    "machine_id": "mach-001",
                    "responsible": "Maintenance",
                    "target_date": "2025-04-16",
                    "probable_cause": "Wire slip"
                }
            ],
            "owner_name": "Arun",
            "owner_email": "arun@plant.com"
        },
        "f02_customer_rejection": {
            "action": "Inspection tightened",
            "entries": [
                {
                    "customer_id": "cust-001",
                    "quantity_ppm": 65,
                    "customer_name": "TML",
                    "reject_reason": "Crack"
                }
            ],
            "owner_name": "Meena",
            "target_ppm": 50,
            "owner_email": "meena@plant.com",
            "responsible": "QA",
            "target_date": "2025-04-18"
        },
        "f03_production": {
            "parts": [
                {
                    "actual": 115,
                    "target": 120,
                    "part_type": "Front"
                },
                {
                    "actual": 98,
                    "target": 100,
                    "part_type": "Rear"
                },
                {
                    "actual": 50,
                    "target": 50,
                    "part_type": "I/A"
                }
            ],
            "action": "Increase manpower",
            "owner_name": "Suresh",
            "owner_email": "suresh@plant.com",
            "responsible": "Production Head",
            "target_date": "2025-04-17",
            "total_actual": 263,
            "total_target": 270
        },
        "f04_cycle_time": {
            "action": "Maintenance",
            "owner_name": "Vikram",
            "owner_email": "vikram@plant.com",
            "responsible": "Engineering",
            "target_date": "2025-04-16",
            "rear_minutes": 2.5,
            "front_minutes": 2.2,
            "probable_cause": "Vibration",
            "target_minutes": 2,
            "total_avg_minutes": 2.35
        },
        "f05_per_man_per_day": {
            "action": "Increase staff",
            "actual": 90,
            "target": 100,
            "owner_name": "Raj",
            "owner_email": "raj@plant.com",
            "responsible": "HR",
            "target_date": "2025-04-20",
            "probable_cause": "Low manpower"
        },
        "f06_ot_hours_last_day": {
            "action": "Shift optimization",
            "target": 5,
            "entries": [
                {
                    "reason": "Demand",
                    "ot_hours": 3,
                    "department_id": "dept-001",
                    "department_name": "WELDING"
                }
            ],
            "owner_name": "Kiran",
            "owner_email": "kiran@plant.com",
            "responsible": "HR",
            "target_date": "2025-04-20"
        },
        "f07_ot_hours_cumulative": {
            "owner_name": "Kiran",
            "owner_email": "kiran@plant.com",
            "cumulative_hours": 45
        },
        "f08_dispatch": {
            "action": "Backup truck",
            "entries": [
                {
                    "parts": [
                        {
                            "qty": 100,
                            "part_type": "front"
                        },
                        {
                            "qty": 80,
                            "part_type": "rear"
                        },
                        {
                            "qty": 40,
                            "part_type": "i_a"
                        }
                    ],
                    "customer_id": "cust-001",
                    "customer_name": "TML"
                }
            ],
            "owner_name": "Anil",
            "owner_email": "anil@plant.com",
            "responsible": "Logistics",
            "target_date": "2025-04-16",
            "probable_cause": "Delay"
        },
        "f09_prod_plan_adherence": {
            "action": "Fix downtime",
            "reasons": [
                "Machine issue"
            ],
            "actual_pct": 90,
            "owner_name": "Ravi",
            "target_pct": 95,
            "owner_email": "ravi@plant.com",
            "responsible": "Production",
            "target_date": "2025-04-18"
        },
        "f10_otif_adherence": {
            "action": "Improve logistics",
            "reason": "Late dispatch",
            "actual_pct": 92,
            "owner_name": "Rohit",
            "target_pct": 100,
            "owner_email": "rohit@plant.com",
            "responsible": "Supply Chain",
            "target_date": "2025-04-18"
        },
        "f11_prod_hours_loss": {
            "action": "Improve supply",
            "reason": "Material shortage",
            "target": 0,
            "owner_name": "Ajay",
            "owner_email": "ajay@plant.com",
            "responsible": "Procurement",
            "target_date": "2025-04-19",
            "actual_hours": 5
        },
        "f12_line_quality_issue": {
            "action": "Inspection",
            "actual": 3,
            "reason": "Welding defect",
            "target": 0,
            "owner_name": "QA",
            "owner_email": "qa@plant.com",
            "responsible": "QA",
            "target_date": "2025-04-18"
        },
        "f13_poor_incoming_material": {
            "action": "Reject batch",
            "quantity": 20,
            "owner_name": "Stores",
            "owner_email": "stores@plant.com",
            "responsible": "Stores",
            "target_date": "2025-04-17",
            "probable_causes": [
                "Supplier issue"
            ]
        },
        "f14_absenteeism": {
            "action": "Backup staff",
            "target": 2,
            "owner_name": "HR",
            "owner_email": "hr@plant.com",
            "responsible": "HR",
            "target_date": "2025-04-16",
            "absent_count": 5,
            "possible_causes": [
                "Festival"
            ]
        },
        "f15_machine_breakdown": {
            "action": "Repair",
            "entries": [
                {
                    "machine_id": "mach-002",
                    "machine_name": "BALANCING",
                    "probable_cause": "Bearing failure",
                    "breakdown_time_minutes": 45
                }
            ],
            "owner_name": "Deepak",
            "owner_email": "deepak@plant.com",
            "responsible": "Maintenance",
            "target_date": "2025-04-16",
            "target_minutes": 30
        },
        "f16_unit_consumption_last_day": {
            "action": "Optimize usage",
            "owner_name": "Energy",
            "units_kvah": 500,
            "owner_email": "energy@plant.com",
            "responsible": "Utilities",
            "target_date": "2025-04-17",
            "possible_cause": "High load"
        },
        "f17_unit_consumption_ytd": {
            "owner_name": "Energy",
            "owner_email": "energy@plant.com",
            "cumulative_kvah": 15000
        },
        "f18_diesel_last_day": {
            "action": "Reduce runtime",
            "target": 100,
            "owner_name": "Ramesh",
            "owner_email": "ramesh@plant.com",
            "responsible": "Utilities",
            "target_date": "2025-04-17",
            "quantity_ltr": 120,
            "probable_cause": "Generator usage"
        },
        "f19_diesel_ytd": {
            "owner_name": "Ramesh",
            "owner_email": "ramesh@plant.com",
            "cumulative_ltr": 3000
        },
        "f20_power_factor": {
            "action": "Install capacitor",
            "actual_pct": 96,
            "owner_name": "Electrical",
            "target_pct": 99,
            "owner_email": "elec@plant.com",
            "responsible": "Electrical",
            "target_date": "2025-04-18",
            "probable_cause": "Load imbalance"
        },
        "f21_sales": {
            "owner_name": "Sales",
            "owner_email": "sales@plant.com",
            "last_day_lakhs": 45,
            "cumulative_lakhs": 560
        },
        "f22_training_last_day": {
            "topic": "Safety",
            "action": "Schedule again",
            "owner_name": "Training",
            "owner_email": "training@plant.com",
            "responsible": "HR",
            "target_date": "2025-04-18",
            "probable_cause": "Time shortage",
            "target_minutes": 30,
            "training_minutes": 20
        },
        "f23_training_ytd": {
            "owner_name": "Training",
            "owner_email": "training@plant.com",
            "cumulative_minutes": 1200
        },
        "f24_first_pass_ok": {
            "action": "Improve QC",
            "actual_pct": 96,
            "owner_name": "QA",
            "target_pct": 100,
            "owner_email": "qa@plant.com",
            "responsible": "QA",
            "target_date": "2025-04-18",
            "probable_cause": "Defects"
        },
        "f25_first_pass_pdi": {
            "action": "Inspection",
            "actual_pct": 97,
            "owner_name": "QA",
            "target_pct": 100,
            "owner_email": "qa@plant.com",
            "responsible": "QA",
            "target_date": "2025-04-18",
            "probable_cause": "Minor defects"
        },
        "f26_supplier_rejection": {
            "action": "Audit supplier",
            "entries": [
                {
                    "cause": "Quality issue",
                    "supplier_id": "sup-001",
                    "rejected_qty": 10,
                    "supplier_name": "ABC Ltd"
                }
            ],
            "owner_name": "Purchase",
            "target_ppm": 50,
            "owner_email": "purchase@plant.com",
            "responsible": "Purchase",
            "target_date": "2025-04-20",
            "cumulative_ppm": 80
        },
        "f27_pdi_issue": {
            "cause": "Inspection gap",
            "action": "Train staff",
            "owner_name": "QA",
            "target_ppm": 0,
            "issue_count": 3,
            "owner_email": "qa@plant.com",
            "responsible": "QA",
            "target_date": "2025-04-18"
        },
        "f28_field_complaints": {
            "action": "Fix design",
            "quantity": 2,
            "owner_name": "Service",
            "owner_email": "service@plant.com",
            "responsible": "R&D",
            "target_date": "2025-04-25",
            "descriptions": [
                "Noise issue"
            ]
        },
        "f29_sop_non_adherence": {
            "found": true,
            "action": "Train staff",
            "owner_name": "Audit",
            "owner_email": "audit@plant.com",
            "responsible": "Audit",
            "target_date": "2025-04-19",
            "descriptions": [
                "Procedure skipped"
            ]
        },
        "f30_fixture_issue": {
            "action": "Adjusted",
            "has_issue": true,
            "owner_name": "Operator",
            "description": "Fixture misalignment",
            "owner_email": "operator@plant.com",
            "responsible": "Maintenance",
            "target_date": "2025-04-16",
            "worker_name": "Raju"
        },
        "f31_pallet_trolley_issue": {
            "action": "Replaced",
            "has_issue": true,
            "owner_name": "Operator",
            "description": "Broken wheel",
            "owner_email": "operator@plant.com",
            "responsible": "Maintenance",
            "target_date": "2025-04-16",
            "worker_name": "Mohan"
        },
        "f32_material_shortage": {
            "action": "Order placed",
            "has_issue": true,
            "owner_name": "Stores",
            "owner_email": "stores@plant.com",
            "responsible": "Purchase",
            "target_date": "2025-04-18",
            "descriptions": [
                "Steel shortage"
            ]
        },
        "f33_other_critical_issue": {
            "action": "Backup generator",
            "has_issue": true,
            "owner_name": "Admin",
            "owner_email": "admin@plant.com",
            "responsible": "Admin",
            "target_date": "2025-04-16",
            "descriptions": [
                "Power outage"
            ]
        }
    }
export default function HistoryView() {
  // const { entries, deleteEntry } = useDailyEntry();
  // const { departments, partTypes } = useMasterData();
  
  // const [currentMonth, setCurrentMonth] = useState(new Date());
  // const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  // const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  // const [searchQuery, setSearchQuery] = useState('');
  // const [selectedDepartment, setSelectedDepartment] = useState('all');
  // const [selectedEntry, setSelectedEntry] = useState<any>(null);
  // const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // const monthStart = startOfMonth(currentMonth);
  // const monthEnd = endOfMonth(currentMonth);
  // const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // const filteredEntries = useMemo(() => {
  //   return entries.filter(entry => {
  //     const matchesSearch = entry.date.includes(searchQuery) ||
  //       departments.find(d => d.id === entry.departmentId)?.name.toLowerCase().includes(searchQuery.toLowerCase());
  //     const matchesDept = selectedDepartment === 'all' || entry.departmentId === selectedDepartment;
  //     return matchesSearch && matchesDept;
  //   }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  // }, [entries, searchQuery, selectedDepartment, departments]);

  // const getEntriesForDate = (date: Date) => {
  //   return entries.filter(entry => {
  //     const entryDate = new Date(entry.date);
  //     return isSameDay(entryDate, date);
  //   });
  // };

  // const getEntryStatus = (entry: any) => {
  //   const hasIssues = entry.safety.length > 0 ||
  //     entry.customerRejections.length > 0 ||
  //     entry.lineQualityIssues.actual > 0 ||
  //     entry.machineBreakdown.actual > 0;
  //   return hasIssues ? 'issues' : 'good';
  // };

  // const handlePreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  // const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // const handleViewEntry = (entry: any) => {
  //   setSelectedEntry(entry);
  //   setIsViewDialogOpen(true);
  // };

  // const handleDeleteEntry = (id: string) => {
  //   if (confirm('Are you sure you want to delete this entry?')) {
  //     deleteEntry(id);
  //     toast.success('Entry deleted successfully');
  //   }
  // };


  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-[#1A1A1A]">Entry History</h2>
          <p className="text-[#666666] mt-1">View and manage past daily entries</p>
        </div>
        <div className="flex items-center gap-3">
          <div>
            <Input type="date" className="input-field" />
            <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#999999]" />
          </div>
     
          <Button variant="outline" className="border-[#C9A962] text-[#C9A962]">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      {/* <Card className="card">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-64">
              <Label className="form-label">Search</Label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#999999]" />
                <Input
                  placeholder="Search by date or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Label className="form-label">Department</Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="input-field">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.filter(d => d.isActive).map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card> */}



      {/* View Entry Dialog */}
<div className='w-full'>
  <div className=" overflow-y-auto p-0">
    <div className="px-4 py-3 border-b border-[#E5E5E5] sticky top-0 bg-white z-10">
      <div className="text-sm font-bold text-[#1A1A1A] uppercase tracking-wide">
        Daily Report —{" "}
        {data?.report_date &&
          new Date(data.report_date).toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        <span className="ml-4 text-xs font-normal text-[#666666]">
          Submitted by: {data?.submitted_by}
        </span>
      </div>
    </div>

    {data && (
      <div className="overflow-x-auto">
        <table
          className="w-full text-xs border-collapse"
          style={{ fontFamily: "Calibri, Arial, sans-serif" }}
        >
          <thead>
            <tr style={{ background: "#b38c38ff", color: "#fff" }}>
              <th className="border border-[#333] px-2 py-2 text-left w-8">SI No</th>
              <th className="border border-[#333] px-2 py-2 text-left min-w-[220px]">Check Points</th>
              <th className="border border-[#333] px-2 py-2 text-center w-8">MP</th>
              <th className="border border-[#333] px-2 py-2 text-center w-16">Owner</th>
              <th className="border border-[#333] px-2 py-2 text-center w-20">Target</th>
              <th className="border border-[#333] px-2 py-2 text-center min-w-[160px]" colSpan={2}>
                Actual / Value
              </th>
              <th className="border border-[#333] px-2 py-2 text-center w-20"
                style={{ background: "#4DD0A4", color: "#1A1A1A" }}>Total</th>
              <th className="border border-[#333] px-2 py-2 text-left min-w-[160px]"
                style={{ background: "#4DD0A4", color: "#1A1A1A" }}>Probable Causes</th>
              <th className="border border-[#333] px-2 py-2 text-left min-w-[160px]"
                style={{ background: "#4DD0A4", color: "#1A1A1A" }}>Action Planned</th>
              <th className="border border-[#333] px-2 py-2 text-center w-20"
                style={{ background: "#4DD0A4", color: "#1A1A1A" }}>Responsible</th>
              <th className="border border-[#333] px-2 py-2 text-center w-20"
                style={{ background: "#4DD0A4", color: "#1A1A1A" }}>Target Date</th>
            </tr>
          </thead>
          <tbody>
            {/* ── SAFETY ── */}

            {/* Row 1 – Accident */}
            <ExcelRow
              sl={1}
              mp="S"
              checkpoint="Last day Accident / Incident / Near Miss (Reported)"
              owner={data.f01_accident.owner_name}
              target={data.f01_accident.target}
              valueCell={
                <td className="border border-[#D4D4D4] px-2 py-1 text-center" colSpan={2}
                  style={{ background: data.f01_accident.entries.length > 0 ? "#FED7AA" : "#C6F6D5" }}>
                  {data.f01_accident.entries.length > 0
                    ? data.f01_accident.entries.map((e) => e.type.toUpperCase()).join(", ")
                    : "0"}
                </td>
              }
              total={data.f01_accident.entries.length}
              totalBg={data.f01_accident.entries.length > data.f01_accident.target ? "#FEB2B2" : "#C6F6D5"}
              causes={data.f01_accident.entries.map((e) => e.probable_cause).join(", ")}
              action={data.f01_accident.entries.map((e) => e.action).join(", ")}
              responsible={data.f01_accident.entries.map((e) => e.responsible).join(", ")}
              targetDate={data.f01_accident.entries[0]?.target_date ?? "—"}
            />

            {/* ── QUALITY ── */}

            {/* Row 2 – Customer Rejection */}
            <ExcelRow
              sl={2}
              mp="Q"
              checkpoint="Last day Customer Rejection (TML | ALW | PNR)"
              owner={data.f02_customer_rejection.owner_name}
              target={`${data.f02_customer_rejection.target_ppm} PPM`}
              valueCell={
                <td className="border border-[#D4D4D4] px-2 py-1 text-center" colSpan={2}
                  style={{ background: "#FED7AA" }}>
                  {data.f02_customer_rejection.entries.map(
                    (e) => `${e.customer_name}: ${e.quantity_ppm} PPM`
                  ).join(" | ")}
                </td>
              }
              total={data.f02_customer_rejection.entries.reduce((s, e) => s + e.quantity_ppm, 0) + " PPM"}
              totalBg="#FEB2B2"
              causes={data.f02_customer_rejection.entries.map((e) => e.reject_reason).join(", ")}
              action={data.f02_customer_rejection.action}
              responsible={data.f02_customer_rejection.responsible}
              targetDate={data.f02_customer_rejection.target_date}
            />

            {/* Row 24 – First Pass OK */}
            <ExcelRow
              sl={24}
              mp="Q"
              checkpoint="First Pass OK %"
              owner={data.f24_first_pass_ok.owner_name}
              target={`${data.f24_first_pass_ok.target_pct}%`}
              valueCell={
                <td className="border border-[#D4D4D4] px-2 py-1 text-center font-semibold" colSpan={2}
                  style={{ background: data.f24_first_pass_ok.actual_pct >= data.f24_first_pass_ok.target_pct ? "#C6F6D5" : "#FED7AA" }}>
                  {data.f24_first_pass_ok.actual_pct}%
                </td>
              }
              total={`${data.f24_first_pass_ok.actual_pct}%`}
              totalBg={data.f24_first_pass_ok.actual_pct >= data.f24_first_pass_ok.target_pct ? "#C6F6D5" : "#FED7AA"}
              causes={data.f24_first_pass_ok.probable_cause}
              action={data.f24_first_pass_ok.action}
              responsible={data.f24_first_pass_ok.responsible}
              targetDate={data.f24_first_pass_ok.target_date}
            />

            {/* Row 25 – First Pass PDI */}
            <ExcelRow
              sl={25}
              mp="Q"
              checkpoint="First Pass PDI %"
              owner={data.f25_first_pass_pdi.owner_name}
              target={`${data.f25_first_pass_pdi.target_pct}%`}
              valueCell={
                <td className="border border-[#D4D4D4] px-2 py-1 text-center font-semibold" colSpan={2}
                  style={{ background: data.f25_first_pass_pdi.actual_pct >= data.f25_first_pass_pdi.target_pct ? "#C6F6D5" : "#FED7AA" }}>
                  {data.f25_first_pass_pdi.actual_pct}%
                </td>
              }
              total={`${data.f25_first_pass_pdi.actual_pct}%`}
              totalBg={data.f25_first_pass_pdi.actual_pct >= data.f25_first_pass_pdi.target_pct ? "#C6F6D5" : "#FED7AA"}
              causes={data.f25_first_pass_pdi.probable_cause}
              action={data.f25_first_pass_pdi.action}
              responsible={data.f25_first_pass_pdi.responsible}
              targetDate={data.f25_first_pass_pdi.target_date}
            />

            {/* Row 12 – Line Quality Issue */}
            <ExcelRow
              sl={12}
              mp="Q"
              checkpoint="Line Quality Issue"
              owner={data.f12_line_quality_issue.owner_name}
              target={data.f12_line_quality_issue.target}
              valueCell={
                <td className="border border-[#D4D4D4] px-2 py-1 text-center font-semibold" colSpan={2}
                  style={{ background: data.f12_line_quality_issue.actual > data.f12_line_quality_issue.target ? "#FED7AA" : "#C6F6D5" }}>
                  {data.f12_line_quality_issue.actual}
                </td>
              }
              total={data.f12_line_quality_issue.actual}
              totalBg={data.f12_line_quality_issue.actual > data.f12_line_quality_issue.target ? "#FEB2B2" : "#C6F6D5"}
              causes={data.f12_line_quality_issue.reason}
              action={data.f12_line_quality_issue.action}
              responsible={data.f12_line_quality_issue.responsible}
              targetDate={data.f12_line_quality_issue.target_date}
            />

            {/* Row 13 – Poor Incoming Material */}
            <ExcelRow
              sl={13}
              mp="Q"
              checkpoint="Production line affected due to poor Quality of incoming material"
              owner={data.f13_poor_incoming_material.owner_name}
              target={0}
              valueCell={
                <td className="border border-[#D4D4D4] px-2 py-1 text-center font-semibold" colSpan={2}
                  style={{ background: "#FED7AA" }}>
                  {data.f13_poor_incoming_material.quantity}
                </td>
              }
              total={data.f13_poor_incoming_material.quantity}
              totalBg="#FEB2B2"
              causes={data.f13_poor_incoming_material.probable_causes?.join(", ")}
              action={data.f13_poor_incoming_material.action}
              responsible={data.f13_poor_incoming_material.responsible}
              targetDate={data.f13_poor_incoming_material.target_date}
            />

            {/* Row 26 – Supplier Rejection */}
            <ExcelRow
              sl={26}
              mp="Q"
              checkpoint="Supplier Rejection (PPM)"
              owner={data.f26_supplier_rejection.owner_name}
              target={`${data.f26_supplier_rejection.target_ppm} PPM`}
              valueCell={
                <td className="border border-[#D4D4D4] px-2 py-1 text-center" colSpan={2}
                  style={{ background: "#FED7AA" }}>
                  {data.f26_supplier_rejection.entries.map(
                    (e) => `${e.supplier_name}: ${e.rejected_qty} qty`
                  ).join(" | ")}
                </td>
              }
              total={`${data.f26_supplier_rejection.cumulative_ppm} PPM`}
              totalBg="#FEB2B2"
              causes={data.f26_supplier_rejection.entries.map((e) => e.cause).join(", ")}
              action={data.f26_supplier_rejection.action}
              responsible={data.f26_supplier_rejection.responsible}
              targetDate={data.f26_supplier_rejection.target_date}
            />

            {/* Row 27 – PDI Issue */}
            <ExcelRow
              sl={27}
              mp="Q"
              checkpoint="PDI Issue (nos.)"
              owner={data.f27_pdi_issue.owner_name}
              target={`${data.f27_pdi_issue.target_ppm} PPM`}
              valueCell={
                <td className="border border-[#D4D4D4] px-2 py-1 text-center font-semibold" colSpan={2}
                  style={{ background: data.f27_pdi_issue.issue_count > 0 ? "#FED7AA" : "#C6F6D5" }}>
                  {data.f27_pdi_issue.issue_count}
                </td>
              }
              total={data.f27_pdi_issue.issue_count}
              totalBg={data.f27_pdi_issue.issue_count > 0 ? "#FEB2B2" : "#C6F6D5"}
              causes={data.f27_pdi_issue.cause}
              action={data.f27_pdi_issue.action}
              responsible={data.f27_pdi_issue.responsible}
              targetDate={data.f27_pdi_issue.target_date}
            />

            {/* Row 28 – Field Complaints */}
            <ExcelRow
              sl={28}
              mp="Q"
              checkpoint="Field Complaints (nos.)"
              owner={data.f28_field_complaints.owner_name}
              target={0}
              valueCell={
                <td className="border border-[#D4D4D4] px-2 py-1 text-center font-semibold" colSpan={2}
                  style={{ background: data.f28_field_complaints.quantity > 0 ? "#FED7AA" : "#C6F6D5" }}>
                  {data.f28_field_complaints.quantity}
                </td>
              }
              total={data.f28_field_complaints.quantity}
              totalBg={data.f28_field_complaints.quantity > 0 ? "#FEB2B2" : "#C6F6D5"}
              causes={data.f28_field_complaints.descriptions?.join(", ")}
              action={data.f28_field_complaints.action}
              responsible={data.f28_field_complaints.responsible}
              targetDate={data.f28_field_complaints.target_date}
            />

            {/* ── PRODUCTION ── */}

            {/* Row 3 – Production */}
            <tr style={{ background: "#EBF8FF" }}>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center font-semibold">3</td>
              <td className="border border-[#D4D4D4] px-2 py-1 font-medium">Last Day Production</td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center text-[#666666]">P</td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center">{data.f03_production.owner_name}</td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center">{data.f03_production.total_target}</td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center" colSpan={2}>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-[#666666]">
                      <th className="text-center pb-0.5">Type</th>
                      <th className="text-center pb-0.5">Tgt</th>
                      <th className="text-center pb-0.5">Act</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.f03_production.parts.map((p, i) => (
                      <tr key={i} style={{ background: p.actual >= p.target ? "#C6F6D5" : "#FED7AA" }}>
                        <td className="text-center px-1">{p.part_type}</td>
                        <td className="text-center px-1">{p.target}</td>
                        <td className="text-center px-1 font-semibold">{p.actual}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center font-bold"
                style={{ background: data.f03_production.total_actual >= data.f03_production.total_target ? "#C6F6D5" : "#FED7AA" }}>
                {data.f03_production.total_actual} / {data.f03_production.total_target}
              </td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-[#666666]">—</td>
              <td className="border border-[#D4D4D4] px-2 py-1">{data.f03_production.action}</td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center">{data.f03_production.responsible}</td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center">{data.f03_production.target_date}</td>
            </tr>

            {/* Row 4 – Cycle Time */}
            <ExcelRow
              sl={4}
              mp="P"
              checkpoint="Cycle Time (Front / Rear)"
              owner={data.f04_cycle_time.owner_name}
              target={`< ${data.f04_cycle_time.target_minutes} Min`}
              valueCell={
                <td className="border border-[#D4D4D4] px-2 py-1 text-center" colSpan={2}
                  style={{ background: "#FED7AA" }}>
                  F: {data.f04_cycle_time.front_minutes}m &nbsp;|&nbsp; R: {data.f04_cycle_time.rear_minutes}m
                </td>
              }
              total={`${data.f04_cycle_time.total_avg_minutes} min`}
              totalBg={data.f04_cycle_time.total_avg_minutes <= data.f04_cycle_time.target_minutes ? "#C6F6D5" : "#FED7AA"}
              causes={data.f04_cycle_time.probable_cause}
              action={data.f04_cycle_time.action}
              responsible={data.f04_cycle_time.responsible}
              targetDate={data.f04_cycle_time.target_date}
            />

            {/* Row 5 – Per Man Per Day */}
            <ExcelRow
              sl={5}
              mp="P"
              checkpoint="Per Man Per Day Prop Shaft Qty (Yesterday)"
              owner={data.f05_per_man_per_day.owner_name}
              target={data.f05_per_man_per_day.target}
              valueCell={
                <td className="border border-[#D4D4D4] px-2 py-1 text-center font-semibold" colSpan={2}
                  style={{ background: data.f05_per_man_per_day.actual >= data.f05_per_man_per_day.target ? "#C6F6D5" : "#FED7AA" }}>
                  {data.f05_per_man_per_day.actual}
                </td>
              }
              total={data.f05_per_man_per_day.actual}
              totalBg={data.f05_per_man_per_day.actual >= data.f05_per_man_per_day.target ? "#C6F6D5" : "#FED7AA"}
              causes={data.f05_per_man_per_day.probable_cause}
              action={data.f05_per_man_per_day.action}
              responsible={data.f05_per_man_per_day.responsible}
              targetDate={data.f05_per_man_per_day.target_date}
            />

            {/* Row 9 – Prod Plan Adherence */}
            <ExcelRow
              sl={9}
              mp="P"
              checkpoint="Production Plan Adherence %age (Yesterday)"
              owner={data.f09_prod_plan_adherence.owner_name}
              target={`${data.f09_prod_plan_adherence.target_pct}%`}
              valueCell={
                <td className="border border-[#D4D4D4] px-2 py-1 text-center font-semibold" colSpan={2}
                  style={{ background: data.f09_prod_plan_adherence.actual_pct >= data.f09_prod_plan_adherence.target_pct ? "#C6F6D5" : "#FED7AA" }}>
                  {data.f09_prod_plan_adherence.actual_pct}%
                </td>
              }
              total={`${data.f09_prod_plan_adherence.actual_pct}%`}
              totalBg={data.f09_prod_plan_adherence.actual_pct >= data.f09_prod_plan_adherence.target_pct ? "#C6F6D5" : "#FED7AA"}
              causes={data.f09_prod_plan_adherence.reasons?.join(", ")}
              action={data.f09_prod_plan_adherence.action}
              responsible={data.f09_prod_plan_adherence.responsible}
              targetDate={data.f09_prod_plan_adherence.target_date}
            />

            {/* Row 11 – Production Hours Loss */}
            <ExcelRow
              sl={11}
              mp="P"
              checkpoint="Production Hours Loss for Material Shortage"
              owner={data.f11_prod_hours_loss.owner_name}
              target={data.f11_prod_hours_loss.target}
              valueCell={
                <td className="border border-[#D4D4D4] px-2 py-1 text-center font-semibold" colSpan={2}
                  style={{ background: data.f11_prod_hours_loss.actual_hours > data.f11_prod_hours_loss.target ? "#FED7AA" : "#C6F6D5" }}>
                  {data.f11_prod_hours_loss.actual_hours} hrs
                </td>
              }
              total={`${data.f11_prod_hours_loss.actual_hours} hrs`}
              totalBg={data.f11_prod_hours_loss.actual_hours > data.f11_prod_hours_loss.target ? "#FEB2B2" : "#C6F6D5"}
              causes={data.f11_prod_hours_loss.reason}
              action={data.f11_prod_hours_loss.action}
              responsible={data.f11_prod_hours_loss.responsible}
              targetDate={data.f11_prod_hours_loss.target_date}
            />

            {/* Row 29 – SOP Non-Adherence */}
            <ExcelRow
              sl={29}
              mp="P"
              checkpoint="SOP Non-Adherence"
              owner={data.f29_sop_non_adherence.owner_name}
              target="0"
              valueCell={
                <td className="border border-[#D4D4D4] px-2 py-1 text-center font-semibold" colSpan={2}
                  style={{ background: data.f29_sop_non_adherence.found ? "#FED7AA" : "#C6F6D5" }}>
                  {data.f29_sop_non_adherence.found ? "YES" : "NO"}
                </td>
              }
              total={data.f29_sop_non_adherence.found ? "Found" : "None"}
              totalBg={data.f29_sop_non_adherence.found ? "#FEB2B2" : "#C6F6D5"}
              causes={data.f29_sop_non_adherence.descriptions?.join(", ")}
              action={data.f29_sop_non_adherence.action}
              responsible={data.f29_sop_non_adherence.responsible}
              targetDate={data.f29_sop_non_adherence.target_date}
            />

            {/* ── DISPATCH / DELIVERY ── */}

            {/* Row 8 – Dispatch */}
            <tr style={{ background: "#FAF5FF" }}>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center font-semibold">8</td>
              <td className="border border-[#D4D4D4] px-2 py-1 font-medium">Last Day Dispatch (TML | ALW | PNR)</td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center text-[#666666]">S</td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center">{data.f08_dispatch.owner_name}</td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center">—</td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center" colSpan={2}>
                {data.f08_dispatch.entries.map((e, i) => (
                  <div key={i}>
                    <span className="font-semibold">{e.customer_name}:</span>{" "}
                    {e.parts.map((p) => `${p.part_type.toUpperCase()} ${p.qty}`).join(" | ")}
                  </div>
                ))}
              </td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center font-bold" style={{ background: "#E9D8FD" }}>
                {data.f08_dispatch.entries.reduce((s, e) => s + e.parts.reduce((ps, p) => ps + p.qty, 0), 0)}
              </td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-[#666666]">{data.f08_dispatch.probable_cause}</td>
              <td className="border border-[#D4D4D4] px-2 py-1">{data.f08_dispatch.action}</td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center">{data.f08_dispatch.responsible}</td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center">{data.f08_dispatch.target_date}</td>
            </tr>

            {/* Row 10 – OTIF */}
            <ExcelRow
              sl={10}
              mp="D"
              checkpoint="On Time in Full Schedule Adherence %age (Yesterday)"
              owner={data.f10_otif_adherence.owner_name}
              target={`${data.f10_otif_adherence.target_pct}%`}
              valueCell={
                <td className="border border-[#D4D4D4] px-2 py-1 text-center font-semibold" colSpan={2}
                  style={{ background: data.f10_otif_adherence.actual_pct >= data.f10_otif_adherence.target_pct ? "#C6F6D5" : "#FED7AA" }}>
                  {data.f10_otif_adherence.actual_pct}%
                </td>
              }
              total={`${data.f10_otif_adherence.actual_pct}%`}
              totalBg={data.f10_otif_adherence.actual_pct >= data.f10_otif_adherence.target_pct ? "#C6F6D5" : "#FED7AA"}
              causes={data.f10_otif_adherence.reason}
              action={data.f10_otif_adherence.action}
              responsible={data.f10_otif_adherence.responsible}
              targetDate={data.f10_otif_adherence.target_date}
            />

            {/* ── MANPOWER ── */}

            {/* Row 6 – OT Hours Last Day */}
            <tr style={{ background: "#F0FFF4" }}>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center font-semibold">6</td>
              <td className="border border-[#D4D4D4] px-2 py-1 font-medium">Last Day OT Hours (Prd, QA, Main, Mater, Engg, Planning)</td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center text-[#666666]">C</td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center">{data.f06_ot_hours_last_day.owner_name}</td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center">{data.f06_ot_hours_last_day.target}</td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center" colSpan={2}>
                {data.f06_ot_hours_last_day.entries.map((e, i) => (
                  <div key={i}>{e.department_name}: {e.ot_hours}h ({e.reason})</div>
                ))}
              </td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center font-bold"
                style={{ background: "#C6F6D5" }}>
                {data.f06_ot_hours_last_day.entries.reduce((s, e) => s + e.ot_hours, 0)}
              </td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-[#666666]">—</td>
              <td className="border border-[#D4D4D4] px-2 py-1">{data.f06_ot_hours_last_day.action}</td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center">{data.f06_ot_hours_last_day.responsible}</td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center">{data.f06_ot_hours_last_day.target_date}</td>
            </tr>

            {/* Row 7 – Cumulative OT */}
            <tr style={{ background: "#F0FFF4" }}>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center font-semibold">7</td>
              <td className="border border-[#D4D4D4] px-2 py-1 font-medium">Cumulative OT Hours</td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center text-[#666666]">C</td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center">{data.f07_ot_hours_cumulative.owner_name}</td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center">—</td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center font-semibold" colSpan={2}
                style={{ background: "#C6F6D5" }}>
                {data.f07_ot_hours_cumulative.cumulative_hours} hrs
              </td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center font-bold" style={{ background: "#C6F6D5" }}>
                {data.f07_ot_hours_cumulative.cumulative_hours}
              </td>
              <td className="border border-[#D4D4D4] px-2 py-1" colSpan={4} />
            </tr>

            {/* Row 14 – Absenteeism */}
            <ExcelRow
              sl={14}
              mp="M"
              checkpoint="Unauthorised Absenteeism (Prd & Others)"
              owner={data.f14_absenteeism.owner_name}
              target={data.f14_absenteeism.target}
              valueCell={
                <td className="border border-[#D4D4D4] px-2 py-1 text-center font-semibold" colSpan={2}
                  style={{ background: data.f14_absenteeism.absent_count > data.f14_absenteeism.target ? "#FED7AA" : "#C6F6D5" }}>
                  {data.f14_absenteeism.absent_count}
                </td>
              }
              total={data.f14_absenteeism.absent_count}
              totalBg={data.f14_absenteeism.absent_count > data.f14_absenteeism.target ? "#FEB2B2" : "#C6F6D5"}
              causes={data.f14_absenteeism.possible_causes?.join(", ")}
              action={data.f14_absenteeism.action}
              responsible={data.f14_absenteeism.responsible}
              targetDate={data.f14_absenteeism.target_date}
            />

            {/* ── MAINTENANCE ── */}

            {/* Row 15 – Machine Breakdown */}
            <tr style={{ background: "#FFFAF0" }}>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center font-semibold">15</td>
              <td className="border border-[#D4D4D4] px-2 py-1 font-medium">Breakdown of Machine</td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center text-[#666666]">P</td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center">{data.f15_machine_breakdown.owner_name}</td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center">{data.f15_machine_breakdown.target_minutes} min max</td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center" colSpan={2}>
                {data.f15_machine_breakdown.entries.map((e, i) => (
                  <div key={i}>{e.machine_name}: {e.breakdown_time_minutes}m — {e.probable_cause}</div>
                ))}
              </td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center font-bold"
                style={{ background: "#FED7AA" }}>
                {data.f15_machine_breakdown.entries.reduce((s, e) => s + e.breakdown_time_minutes, 0)} min
              </td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-[#666666]">
                {data.f15_machine_breakdown.entries.map((e) => e.probable_cause).join(", ")}
              </td>
              <td className="border border-[#D4D4D4] px-2 py-1">{data.f15_machine_breakdown.action}</td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center">{data.f15_machine_breakdown.responsible}</td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center">{data.f15_machine_breakdown.target_date}</td>
            </tr>

            {/* Row 30 – Fixture Issue */}
            <ExcelRow
              sl={30}
              mp="P"
              checkpoint="Fixture Issue"
              owner={data.f30_fixture_issue.owner_name}
              target="None"
              valueCell={
                <td className="border border-[#D4D4D4] px-2 py-1 text-center" colSpan={2}
                  style={{ background: data.f30_fixture_issue.has_issue ? "#FED7AA" : "#C6F6D5" }}>
                  {data.f30_fixture_issue.description} ({data.f30_fixture_issue.worker_name})
                </td>
              }
              total={data.f30_fixture_issue.has_issue ? "Yes" : "No"}
              totalBg={data.f30_fixture_issue.has_issue ? "#FEB2B2" : "#C6F6D5"}
              causes={data.f30_fixture_issue.description}
              action={data.f30_fixture_issue.action}
              responsible={data.f30_fixture_issue.responsible}
              targetDate={data.f30_fixture_issue.target_date}
            />

            {/* Row 31 – Pallet/Trolley Issue */}
            <ExcelRow
              sl={31}
              mp="P"
              checkpoint="Pallet / Trolley Issue"
              owner={data.f31_pallet_trolley_issue.owner_name}
              target="None"
              valueCell={
                <td className="border border-[#D4D4D4] px-2 py-1 text-center" colSpan={2}
                  style={{ background: data.f31_pallet_trolley_issue.has_issue ? "#FED7AA" : "#C6F6D5" }}>
                  {data.f31_pallet_trolley_issue.description} ({data.f31_pallet_trolley_issue.worker_name})
                </td>
              }
              total={data.f31_pallet_trolley_issue.has_issue ? "Yes" : "No"}
              totalBg={data.f31_pallet_trolley_issue.has_issue ? "#FEB2B2" : "#C6F6D5"}
              causes={data.f31_pallet_trolley_issue.description}
              action={data.f31_pallet_trolley_issue.action}
              responsible={data.f31_pallet_trolley_issue.responsible}
              targetDate={data.f31_pallet_trolley_issue.target_date}
            />

            {/* ── ENERGY ── */}

            {/* Row 16 */}
            <ExcelRow
              sl={16}
              mp="C"
              checkpoint="Unit Consumption Last Day (KVAH)"
              owner={data.f16_unit_consumption_last_day.owner_name}
              target="—"
              valueCell={
                <td className="border border-[#D4D4D4] px-2 py-1 text-center font-semibold" colSpan={2}
                  style={{ background: "#FEFCBF" }}>
                  {data.f16_unit_consumption_last_day.units_kvah} KVAH
                </td>
              }
              total={`${data.f16_unit_consumption_last_day.units_kvah}`}
              totalBg="#FEFCBF"
              causes={data.f16_unit_consumption_last_day.possible_cause}
              action={data.f16_unit_consumption_last_day.action}
              responsible={data.f16_unit_consumption_last_day.responsible}
              targetDate={data.f16_unit_consumption_last_day.target_date}
            />

            {/* Row 17 */}
            <tr style={{ background: "#FFFFF0" }}>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center font-semibold">17</td>
              <td className="border border-[#D4D4D4] px-2 py-1 font-medium">Unit Consumption Till Date (YTD)</td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center text-[#666666]">C</td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center">{data.f17_unit_consumption_ytd.owner_name}</td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center">—</td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center font-semibold" colSpan={2}
                style={{ background: "#FEFCBF" }}>
                {data.f17_unit_consumption_ytd.cumulative_kvah} KVAH
              </td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center font-bold" style={{ background: "#FEFCBF" }}>
                {data.f17_unit_consumption_ytd.cumulative_kvah}
              </td>
              <td className="border border-[#D4D4D4] px-2 py-1" colSpan={4} />
            </tr>

            {/* Row 18 – Diesel Last Day */}
            <ExcelRow
              sl={18}
              mp="C"
              checkpoint="Diesel Consumption Last Day (LTR)"
              owner={data.f18_diesel_last_day.owner_name}
              target={`${data.f18_diesel_last_day.target} LTR`}
              valueCell={
                <td className="border border-[#D4D4D4] px-2 py-1 text-center font-semibold" colSpan={2}
                  style={{ background: data.f18_diesel_last_day.quantity_ltr > data.f18_diesel_last_day.target ? "#FED7AA" : "#C6F6D5" }}>
                  {data.f18_diesel_last_day.quantity_ltr} LTR
                </td>
              }
              total={`${data.f18_diesel_last_day.quantity_ltr}`}
              totalBg={data.f18_diesel_last_day.quantity_ltr > data.f18_diesel_last_day.target ? "#FEB2B2" : "#C6F6D5"}
              causes={data.f18_diesel_last_day.probable_cause}
              action={data.f18_diesel_last_day.action}
              responsible={data.f18_diesel_last_day.responsible}
              targetDate={data.f18_diesel_last_day.target_date}
            />

            {/* Row 19 – Diesel YTD */}
            <tr style={{ background: "#FFFFF0" }}>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center font-semibold">19</td>
              <td className="border border-[#D4D4D4] px-2 py-1 font-medium">Diesel Consumption YTD</td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center text-[#666666]">C</td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center">{data.f19_diesel_ytd.owner_name}</td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center">—</td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center font-semibold" colSpan={2}
                style={{ background: "#FEFCBF" }}>
                {data.f19_diesel_ytd.cumulative_ltr} LTR
              </td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center font-bold" style={{ background: "#FEFCBF" }}>
                {data.f19_diesel_ytd.cumulative_ltr}
              </td>
              <td className="border border-[#D4D4D4] px-2 py-1" colSpan={4} />
            </tr>

            {/* Row 20 – Power Factor */}
            <ExcelRow
              sl={20}
              mp="C"
              checkpoint="Power Factor"
              owner={data.f20_power_factor.owner_name}
              target={`${data.f20_power_factor.target_pct}%`}
              valueCell={
                <td className="border border-[#D4D4D4] px-2 py-1 text-center font-semibold" colSpan={2}
                  style={{ background: data.f20_power_factor.actual_pct >= data.f20_power_factor.target_pct ? "#C6F6D5" : "#FED7AA" }}>
                  {data.f20_power_factor.actual_pct}%
                </td>
              }
              total={`${data.f20_power_factor.actual_pct}%`}
              totalBg={data.f20_power_factor.actual_pct >= data.f20_power_factor.target_pct ? "#C6F6D5" : "#FED7AA"}
              causes={data.f20_power_factor.probable_cause}
              action={data.f20_power_factor.action}
              responsible={data.f20_power_factor.responsible}
              targetDate={data.f20_power_factor.target_date}
            />

            {/* ── SALES & TRAINING ── */}

            {/* Row 21 – Sales */}
            <tr style={{ background: "#EBF8FF" }}>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center font-semibold">21</td>
              <td className="border border-[#D4D4D4] px-2 py-1 font-medium">Sales</td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center text-[#666666]">—</td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center">{data.f21_sales.owner_name}</td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center">—</td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center" style={{ background: "#BEE3F8" }}>
                Last Day: ₹{data.f21_sales.last_day_lakhs}L
              </td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center" style={{ background: "#BEE3F8" }}>
                YTD: ₹{data.f21_sales.cumulative_lakhs}L
              </td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center font-bold" style={{ background: "#BEE3F8" }}>
                ₹{data.f21_sales.cumulative_lakhs}L
              </td>
              <td className="border border-[#D4D4D4] px-2 py-1" colSpan={4} />
            </tr>

            {/* Row 22 – Training Last Day */}
            <ExcelRow
              sl={22}
              mp="—"
              checkpoint={`Training Last Day — Topic: ${data.f22_training_last_day.topic}`}
              owner={data.f22_training_last_day.owner_name}
              target={`${data.f22_training_last_day.target_minutes} min`}
              valueCell={
                <td className="border border-[#D4D4D4] px-2 py-1 text-center font-semibold" colSpan={2}
                  style={{ background: data.f22_training_last_day.training_minutes >= data.f22_training_last_day.target_minutes ? "#C6F6D5" : "#FED7AA" }}>
                  {data.f22_training_last_day.training_minutes} min
                </td>
              }
              total={`${data.f22_training_last_day.training_minutes} min`}
              totalBg={data.f22_training_last_day.training_minutes >= data.f22_training_last_day.target_minutes ? "#C6F6D5" : "#FED7AA"}
              causes={data.f22_training_last_day.probable_cause}
              action={data.f22_training_last_day.action}
              responsible={data.f22_training_last_day.responsible}
              targetDate={data.f22_training_last_day.target_date}
            />

            {/* Row 23 – Training YTD */}
            <tr style={{ background: "#EBF8FF" }}>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center font-semibold">23</td>
              <td className="border border-[#D4D4D4] px-2 py-1 font-medium">Training Cumulative (YTD)</td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center text-[#666666]">—</td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center">{data.f23_training_ytd.owner_name}</td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center">—</td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center font-semibold" colSpan={2}
                style={{ background: "#BEE3F8" }}>
                {data.f23_training_ytd.cumulative_minutes} min
              </td>
              <td className="border border-[#D4D4D4] px-2 py-1 text-center font-bold" style={{ background: "#BEE3F8" }}>
                {data.f23_training_ytd.cumulative_minutes}
              </td>
              <td className="border border-[#D4D4D4] px-2 py-1" colSpan={4} />
            </tr>

            {/* ── CRITICAL ISSUES ── */}

            {/* Row 32 – Material Shortage */}
            <ExcelRow
              sl={32}
              mp="P"
              checkpoint="Material Shortage"
              owner={data.f32_material_shortage.owner_name}
              target="None"
              valueCell={
                <td className="border border-[#D4D4D4] px-2 py-1 text-center font-semibold" colSpan={2}
                  style={{ background: data.f32_material_shortage.has_issue ? "#FED7AA" : "#C6F6D5" }}>
                  {data.f32_material_shortage.descriptions?.join(", ")}
                </td>
              }
              total={data.f32_material_shortage.has_issue ? "Yes" : "No"}
              totalBg={data.f32_material_shortage.has_issue ? "#FEB2B2" : "#C6F6D5"}
              causes={data.f32_material_shortage.descriptions?.join(", ")}
              action={data.f32_material_shortage.action}
              responsible={data.f32_material_shortage.responsible}
              targetDate={data.f32_material_shortage.target_date}
            />

            {/* Row 33 – Other Critical Issue */}
            <ExcelRow
              sl={33}
              mp="—"
              checkpoint="Other Critical Issue"
              owner={data.f33_other_critical_issue.owner_name}
              target="None"
              valueCell={
                <td className="border border-[#D4D4D4] px-2 py-1 text-center font-semibold" colSpan={2}
                  style={{ background: data.f33_other_critical_issue.has_issue ? "#FED7AA" : "#C6F6D5" }}>
                  {data.f33_other_critical_issue.descriptions?.join(", ")}
                </td>
              }
              total={data.f33_other_critical_issue.has_issue ? "Yes" : "No"}
              totalBg={data.f33_other_critical_issue.has_issue ? "#FEB2B2" : "#C6F6D5"}
              causes={data.f33_other_critical_issue.descriptions?.join(", ")}
              action={data.f33_other_critical_issue.action}
              responsible={data.f33_other_critical_issue.responsible}
              targetDate={data.f33_other_critical_issue.target_date}
            />
          </tbody>
        </table>
      </div>
    )}
  </div>
</div>
    </div>
  );
}
