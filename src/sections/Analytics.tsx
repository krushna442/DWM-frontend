import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ComposedChart, ReferenceLine
} from 'recharts';

// ─── Types ───────────────────────────────────────────────────────────────────
interface DailyTrendItem { date: string; [key: string]: any }
interface AnalyticsField {
  field: string; label: string; [key: string]: any;
  daily_trend: DailyTrendItem[];
}
interface AnalyticsData {
  month: string; report_count: number; analytics: AnalyticsField[];
}

// ─── Sample data (replace with props/context) ────────────────────────────────
const RAW: AnalyticsData =  {
        "month": "2025-04",
        "report_count": 4,
        "analytics": [
            {
                "field": "f01_accident",
                "label": "Accident / Incident / Near Miss",
                "total_incidents": 1,
                "by_machine": [],
                "by_type": [
                    {
                        "type": "machine",
                        "count": 1
                    },
                    {
                        "type": "others",
                        "count": 0
                    }
                ],
                "daily_trend": [
                    {
                        "date": "2025-04-15T00:00:00.000Z",
                        "count": 1
                    },
                    {
                        "date": "2025-04-16T00:00:00.000Z",
                        "count": 0
                    },
                    {
                        "date": "2025-04-17T00:00:00.000Z",
                        "count": 0
                    },
                    {
                        "date": "2025-04-18T00:00:00.000Z",
                        "count": 0
                    }
                ]
            },
            {
                "field": "f02_customer_rejection",
                "label": "Customer Rejection",
                "target_ppm": 50,
                "by_customer": [
                    {
                        "customer": "TML",
                        "total_ppm": 130
                    }
                ],
                "daily_trend": [
                    {
                        "date": "2025-04-15T00:00:00.000Z",
                        "total_ppm": 65
                    },
                    {
                        "date": "2025-04-16T00:00:00.000Z",
                        "total_ppm": 65
                    },
                    {
                        "date": "2025-04-17T00:00:00.000Z",
                        "total_ppm": 0
                    },
                    {
                        "date": "2025-04-18T00:00:00.000Z",
                        "total_ppm": 0
                    }
                ]
            },
            {
                "field": "f03_production",
                "label": "Production",
                "by_part_type": [
                    {
                        "part_type": "Front",
                        "target": 510,
                        "actual": 490
                    },
                    {
                        "part_type": "Rear",
                        "target": 430,
                        "actual": 413
                    },
                    {
                        "part_type": "I/A",
                        "target": 230,
                        "actual": 215
                    }
                ],
                "daily_trend": [
                    {
                        "date": "2025-04-15T00:00:00.000Z",
                        "target": 270,
                        "actual": 263
                    },
                    {
                        "date": "2025-04-16T00:00:00.000Z",
                        "target": 300,
                        "actual": 285
                    },
                    {
                        "date": "2025-04-17T00:00:00.000Z",
                        "target": 300,
                        "actual": 285
                    },
                    {
                        "date": "2025-04-18T00:00:00.000Z",
                        "target": 300,
                        "actual": 285
                    }
                ],
                "cumulative_target": 1170,
                "cumulative_actual": 1118
            },
            {
                "field": "f04_cycle_time",
                "label": "Cycle Time",
                "target_minutes": 2,
                "avg_front": 2.2,
                "avg_rear": 2.5,
                "daily_trend": [
                    {
                        "date": "2025-04-15T00:00:00.000Z",
                        "front": 2.2,
                        "rear": 2.5,
                        "avg": 2.35,
                        "target": 2
                    },
                    {
                        "date": "2025-04-16T00:00:00.000Z",
                        "front": 2.2,
                        "rear": 2.5,
                        "avg": 2.35,
                        "target": 2
                    },
                    {
                        "date": "2025-04-17T00:00:00.000Z",
                        "front": null,
                        "rear": null,
                        "avg": null
                    },
                    {
                        "date": "2025-04-18T00:00:00.000Z",
                        "front": null,
                        "rear": null,
                        "avg": null
                    }
                ]
            },
            {
                "field": "f05_per_man_per_day",
                "label": "Per Man Per Day Prop Shaft Qty",
                "daily_trend": [
                    {
                        "date": "2025-04-15T00:00:00.000Z",
                        "target": 0,
                        "actual": 0
                    },
                    {
                        "date": "2025-04-16T00:00:00.000Z",
                        "target": 100,
                        "actual": 90
                    },
                    {
                        "date": "2025-04-17T00:00:00.000Z",
                        "target": 0,
                        "actual": 0
                    },
                    {
                        "date": "2025-04-18T00:00:00.000Z",
                        "target": 0,
                        "actual": 0
                    }
                ],
                "avg_actual": 22.5
            },
            {
                "field": "f06_ot_hours_last_day",
                "label": "OT Hours Last Day",
                "by_department": [
                    {
                        "department": "WELDING",
                        "total_hours": 9
                    },
                    {
                        "department": "ASSEMBLY",
                        "total_hours": 6.5
                    }
                ],
                "daily_trend": [
                    {
                        "date": "2025-04-15T00:00:00.000Z",
                        "total_ot": 5
                    },
                    {
                        "date": "2025-04-16T00:00:00.000Z",
                        "total_ot": 3.5
                    },
                    {
                        "date": "2025-04-17T00:00:00.000Z",
                        "total_ot": 3.5
                    },
                    {
                        "date": "2025-04-18T00:00:00.000Z",
                        "total_ot": 3.5
                    }
                ],
                "total_ot_hours": 15.5
            },
            {
                "field": "f07_ot_hours_cumulative",
                "label": "Cumulative OT Hours",
                "current_cumulative": 10.5,
                "daily_trend": [
                    {
                        "date": "2025-04-15T00:00:00.000Z",
                        "cumulative": 0
                    },
                    {
                        "date": "2025-04-16T00:00:00.000Z",
                        "cumulative": 3.5
                    },
                    {
                        "date": "2025-04-17T00:00:00.000Z",
                        "cumulative": 7
                    },
                    {
                        "date": "2025-04-18T00:00:00.000Z",
                        "cumulative": 10.5
                    }
                ]
            },
            {
                "field": "f08_dispatch",
                "label": "Dispatch",
                "by_customer": [
                    {
                        "customer": "TML",
                        "front": 0,
                        "rear": 0,
                        "ia": 0
                    },
                    {
                        "customer": "ALW",
                        "front": 0,
                        "rear": 0,
                        "ia": 0
                    }
                ],
                "daily_trend": [
                    {
                        "date": "2025-04-15T00:00:00.000Z",
                        "total_front": 0,
                        "total_rear": 0,
                        "total_ia": 0
                    },
                    {
                        "date": "2025-04-16T00:00:00.000Z",
                        "total_front": 0,
                        "total_rear": 0,
                        "total_ia": 0
                    },
                    {
                        "date": "2025-04-17T00:00:00.000Z",
                        "total_front": 0,
                        "total_rear": 0,
                        "total_ia": 0
                    },
                    {
                        "date": "2025-04-18T00:00:00.000Z",
                        "total_front": 0,
                        "total_rear": 0,
                        "total_ia": 0
                    }
                ],
                "totals": {
                    "front": 0,
                    "rear": 0,
                    "ia": 0
                }
            },
            {
                "field": "f09_prod_plan_adherence",
                "label": "Production Plan Adherence %",
                "avg_actual": 90,
                "below_target_days": 1,
                "daily_trend": [
                    {
                        "date": "2025-04-15T00:00:00.000Z",
                        "target": 95,
                        "actual": 0
                    },
                    {
                        "date": "2025-04-16T00:00:00.000Z",
                        "target": 95,
                        "actual": 90
                    },
                    {
                        "date": "2025-04-17T00:00:00.000Z",
                        "target": 95,
                        "actual": 0
                    },
                    {
                        "date": "2025-04-18T00:00:00.000Z",
                        "target": 95,
                        "actual": 0
                    }
                ]
            },
            {
                "field": "f10_otif_adherence",
                "label": "OTIF Schedule Adherence %",
                "avg_actual": 94.25,
                "missed_days": 4,
                "daily_trend": [
                    {
                        "date": "2025-04-15T00:00:00.000Z",
                        "target": 100,
                        "actual": 92
                    },
                    {
                        "date": "2025-04-16T00:00:00.000Z",
                        "target": 100,
                        "actual": 95
                    },
                    {
                        "date": "2025-04-17T00:00:00.000Z",
                        "target": 100,
                        "actual": 95
                    },
                    {
                        "date": "2025-04-18T00:00:00.000Z",
                        "target": 100,
                        "actual": 95
                    }
                ]
            },
            {
                "field": "f11_prod_hours_loss",
                "label": "Production Hours Loss (Material Shortage)",
                "total_hours_lost": 5,
                "daily_trend": [
                    {
                        "date": "2025-04-15T00:00:00.000Z",
                        "actual_hours": 0
                    },
                    {
                        "date": "2025-04-16T00:00:00.000Z",
                        "actual_hours": 5
                    },
                    {
                        "date": "2025-04-17T00:00:00.000Z",
                        "actual_hours": 0
                    },
                    {
                        "date": "2025-04-18T00:00:00.000Z",
                        "actual_hours": 0
                    }
                ]
            },
            {
                "field": "f12_line_quality_issue",
                "label": "Line Quality Issue",
                "total_issues": 3,
                "daily_trend": [
                    {
                        "date": "2025-04-15T00:00:00.000Z",
                        "actual": 0
                    },
                    {
                        "date": "2025-04-16T00:00:00.000Z",
                        "actual": 3
                    },
                    {
                        "date": "2025-04-17T00:00:00.000Z",
                        "actual": 0
                    },
                    {
                        "date": "2025-04-18T00:00:00.000Z",
                        "actual": 0
                    }
                ]
            },
            {
                "field": "f13_poor_incoming_material",
                "label": "Poor Incoming Material",
                "total_qty": 20,
                "daily_trend": [
                    {
                        "date": "2025-04-15T00:00:00.000Z",
                        "quantity": 0
                    },
                    {
                        "date": "2025-04-16T00:00:00.000Z",
                        "quantity": 20
                    },
                    {
                        "date": "2025-04-17T00:00:00.000Z",
                        "quantity": 0
                    },
                    {
                        "date": "2025-04-18T00:00:00.000Z",
                        "quantity": 0
                    }
                ]
            },
            {
                "field": "f14_absenteeism",
                "label": "Unauthorised Absenteeism",
                "total_absent_person_days": 5,
                "avg_per_day": 1.25,
                "daily_trend": [
                    {
                        "date": "2025-04-15T00:00:00.000Z",
                        "absent_count": 0
                    },
                    {
                        "date": "2025-04-16T00:00:00.000Z",
                        "absent_count": 5
                    },
                    {
                        "date": "2025-04-17T00:00:00.000Z",
                        "absent_count": 0
                    },
                    {
                        "date": "2025-04-18T00:00:00.000Z",
                        "absent_count": 0
                    }
                ]
            },
            {
                "field": "f15_machine_breakdown",
                "label": "Machine Breakdown",
                "target_minutes": 30,
                "by_machine": [
                    {
                        "machine": "BALANCING FRONT",
                        "count": 1,
                        "total_minutes": 45
                    },
                    {
                        "machine": "FINAL ASSY",
                        "count": 3,
                        "total_minutes": 60
                    }
                ],
                "daily_trend": [
                    {
                        "date": "2025-04-15T00:00:00.000Z",
                        "total_minutes": 45
                    },
                    {
                        "date": "2025-04-16T00:00:00.000Z",
                        "total_minutes": 20
                    },
                    {
                        "date": "2025-04-17T00:00:00.000Z",
                        "total_minutes": 20
                    },
                    {
                        "date": "2025-04-18T00:00:00.000Z",
                        "total_minutes": 20
                    }
                ],
                "total_breakdown_minutes": 105
            },
            {
                "field": "f16_unit_consumption_last_day",
                "label": "Unit Consumption Last Day (KVAH)",
                "total_kvah": 500,
                "avg_daily": 125,
                "daily_trend": [
                    {
                        "date": "2025-04-15T00:00:00.000Z",
                        "units_kvah": 0
                    },
                    {
                        "date": "2025-04-16T00:00:00.000Z",
                        "units_kvah": 500
                    },
                    {
                        "date": "2025-04-17T00:00:00.000Z",
                        "units_kvah": 0
                    },
                    {
                        "date": "2025-04-18T00:00:00.000Z",
                        "units_kvah": 0
                    }
                ]
            },
            {
                "field": "f17_unit_consumption_ytd",
                "label": "Unit Consumption Till Date",
                "current_cumulative_kvah": 15000,
                "daily_trend": [
                    {
                        "date": "2025-04-15T00:00:00.000Z",
                        "cumulative_kvah": 0
                    },
                    {
                        "date": "2025-04-16T00:00:00.000Z",
                        "cumulative_kvah": 15000
                    },
                    {
                        "date": "2025-04-17T00:00:00.000Z",
                        "cumulative_kvah": 0
                    },
                    {
                        "date": "2025-04-18T00:00:00.000Z",
                        "cumulative_kvah": 0
                    }
                ]
            },
            {
                "field": "f18_diesel_last_day",
                "label": "Diesel Consumption Last Day (LTR)",
                "total_ltr": 450,
                "daily_trend": [
                    {
                        "date": "2025-04-15T00:00:00.000Z",
                        "quantity_ltr": 120,
                        "target": 100
                    },
                    {
                        "date": "2025-04-16T00:00:00.000Z",
                        "quantity_ltr": 110,
                        "target": 100
                    },
                    {
                        "date": "2025-04-17T00:00:00.000Z",
                        "quantity_ltr": 110,
                        "target": 100
                    },
                    {
                        "date": "2025-04-18T00:00:00.000Z",
                        "quantity_ltr": 110,
                        "target": 100
                    }
                ]
            },
            {
                "field": "f19_diesel_ytd",
                "label": "Diesel Consumption Till Date",
                "current_cumulative_ltr": 330,
                "daily_trend": [
                    {
                        "date": "2025-04-15T00:00:00.000Z",
                        "cumulative_ltr": 0
                    },
                    {
                        "date": "2025-04-16T00:00:00.000Z",
                        "cumulative_ltr": 110
                    },
                    {
                        "date": "2025-04-17T00:00:00.000Z",
                        "cumulative_ltr": 220
                    },
                    {
                        "date": "2025-04-18T00:00:00.000Z",
                        "cumulative_ltr": 330
                    }
                ]
            },
            {
                "field": "f20_power_factor",
                "label": "Power Factor",
                "avg_actual": 96,
                "below_target_days": 1,
                "daily_trend": [
                    {
                        "date": "2025-04-15T00:00:00.000Z",
                        "target": 99,
                        "actual": 0
                    },
                    {
                        "date": "2025-04-16T00:00:00.000Z",
                        "target": 99,
                        "actual": 96
                    },
                    {
                        "date": "2025-04-17T00:00:00.000Z",
                        "target": 99,
                        "actual": 0
                    },
                    {
                        "date": "2025-04-18T00:00:00.000Z",
                        "target": 99,
                        "actual": 0
                    }
                ]
            },
            {
                "field": "f21_sales",
                "label": "Sales Values",
                "total_month_lakhs": 195,
                "current_cumulative_lakhs": 710,
                "daily_trend": [
                    {
                        "date": "2025-04-15T00:00:00.000Z",
                        "last_day_lakhs": 45,
                        "cumulative_lakhs": 560
                    },
                    {
                        "date": "2025-04-16T00:00:00.000Z",
                        "last_day_lakhs": 50,
                        "cumulative_lakhs": 610
                    },
                    {
                        "date": "2025-04-17T00:00:00.000Z",
                        "last_day_lakhs": 50,
                        "cumulative_lakhs": 660
                    },
                    {
                        "date": "2025-04-18T00:00:00.000Z",
                        "last_day_lakhs": 50,
                        "cumulative_lakhs": 710
                    }
                ]
            },
            {
                "field": "f22_training_last_day",
                "label": "Training Hours Last Day",
                "total_training_minutes": 135,
                "below_target_days": 1,
                "daily_trend": [
                    {
                        "date": "2025-04-15T00:00:00.000Z",
                        "training_minutes": 0,
                        "target": 30,
                        "topic": ""
                    },
                    {
                        "date": "2025-04-16T00:00:00.000Z",
                        "training_minutes": 45,
                        "target": 30,
                        "topic": "Safety Awareness"
                    },
                    {
                        "date": "2025-04-17T00:00:00.000Z",
                        "training_minutes": 45,
                        "target": 30,
                        "topic": "Safety Awareness"
                    },
                    {
                        "date": "2025-04-18T00:00:00.000Z",
                        "training_minutes": 45,
                        "target": 30,
                        "topic": "Safety Awareness"
                    }
                ]
            },
            {
                "field": "f23_training_ytd",
                "label": "Cumulative Training Hours",
                "current_cumulative_minutes": 135,
                "daily_trend": [
                    {
                        "date": "2025-04-15T00:00:00.000Z",
                        "cumulative_minutes": 0
                    },
                    {
                        "date": "2025-04-16T00:00:00.000Z",
                        "cumulative_minutes": 45
                    },
                    {
                        "date": "2025-04-17T00:00:00.000Z",
                        "cumulative_minutes": 90
                    },
                    {
                        "date": "2025-04-18T00:00:00.000Z",
                        "cumulative_minutes": 135
                    }
                ]
            },
            {
                "field": "f24_first_pass_ok",
                "label": "1st Pass OK Ratio",
                "avg_actual": 96.75,
                "below_target_days": 4,
                "daily_trend": [
                    {
                        "date": "2025-04-15T00:00:00.000Z",
                        "target": 100,
                        "actual": 96
                    },
                    {
                        "date": "2025-04-16T00:00:00.000Z",
                        "target": 100,
                        "actual": 97
                    },
                    {
                        "date": "2025-04-17T00:00:00.000Z",
                        "target": 100,
                        "actual": 97
                    },
                    {
                        "date": "2025-04-18T00:00:00.000Z",
                        "target": 100,
                        "actual": 97
                    }
                ]
            },
            {
                "field": "f25_first_pass_pdi",
                "label": "1st Pass OK Ratio PDI",
                "avg_actual": 97,
                "below_target_days": 1,
                "daily_trend": [
                    {
                        "date": "2025-04-15T00:00:00.000Z",
                        "target": 100,
                        "actual": 0
                    },
                    {
                        "date": "2025-04-16T00:00:00.000Z",
                        "target": 100,
                        "actual": 97
                    },
                    {
                        "date": "2025-04-17T00:00:00.000Z",
                        "target": 100,
                        "actual": 0
                    },
                    {
                        "date": "2025-04-18T00:00:00.000Z",
                        "target": 100,
                        "actual": 0
                    }
                ]
            },
            {
                "field": "f26_supplier_rejection",
                "label": "Supplier Rejection",
                "target_ppm": 0,
                "by_supplier": [
                    {
                        "supplier": "ABC Ltd",
                        "total_qty": 10
                    }
                ],
                "daily_trend": [
                    {
                        "date": "2025-04-15T00:00:00.000Z",
                        "total_qty": 0
                    },
                    {
                        "date": "2025-04-16T00:00:00.000Z",
                        "total_qty": 10
                    },
                    {
                        "date": "2025-04-17T00:00:00.000Z",
                        "total_qty": 0
                    },
                    {
                        "date": "2025-04-18T00:00:00.000Z",
                        "total_qty": 0
                    }
                ]
            },
            {
                "field": "f27_pdi_issue",
                "label": "PDI Issue",
                "total_issues": 3,
                "daily_trend": [
                    {
                        "date": "2025-04-15T00:00:00.000Z",
                        "issue_count": 0
                    },
                    {
                        "date": "2025-04-16T00:00:00.000Z",
                        "issue_count": 3
                    },
                    {
                        "date": "2025-04-17T00:00:00.000Z",
                        "issue_count": 0
                    },
                    {
                        "date": "2025-04-18T00:00:00.000Z",
                        "issue_count": 0
                    }
                ]
            },
            {
                "field": "f28_field_complaints",
                "label": "Field Complaints",
                "total_complaints": 2,
                "daily_trend": [
                    {
                        "date": "2025-04-15T00:00:00.000Z",
                        "quantity": 0
                    },
                    {
                        "date": "2025-04-16T00:00:00.000Z",
                        "quantity": 2
                    },
                    {
                        "date": "2025-04-17T00:00:00.000Z",
                        "quantity": 0
                    },
                    {
                        "date": "2025-04-18T00:00:00.000Z",
                        "quantity": 0
                    }
                ]
            },
            {
                "field": "f29_sop_non_adherence",
                "label": "SOP Non-adherence (LPA Audit)",
                "total_days_with_issues": 1,
                "total_issues": 1,
                "daily_trend": [
                    {
                        "date": "2025-04-15T00:00:00.000Z",
                        "found": 0,
                        "description_count": 0
                    },
                    {
                        "date": "2025-04-16T00:00:00.000Z",
                        "found": 1,
                        "description_count": 1
                    },
                    {
                        "date": "2025-04-17T00:00:00.000Z",
                        "found": 0,
                        "description_count": 0
                    },
                    {
                        "date": "2025-04-18T00:00:00.000Z",
                        "found": 0,
                        "description_count": 0
                    }
                ]
            },
            {
                "field": "f30_fixture_issue",
                "label": "Line Issue / Stop Due to Fixtures",
                "total_days_with_issues": 2,
                "daily_trend": [
                    {
                        "date": "2025-04-15T00:00:00.000Z",
                        "has_issue": 1
                    },
                    {
                        "date": "2025-04-16T00:00:00.000Z",
                        "has_issue": 1
                    },
                    {
                        "date": "2025-04-17T00:00:00.000Z",
                        "has_issue": 0
                    },
                    {
                        "date": "2025-04-18T00:00:00.000Z",
                        "has_issue": 0
                    }
                ]
            },
            {
                "field": "f31_pallet_trolley_issue",
                "label": "Pallet / Trolley Issue",
                "total_days_with_issues": 1,
                "daily_trend": [
                    {
                        "date": "2025-04-15T00:00:00.000Z",
                        "has_issue": 0
                    },
                    {
                        "date": "2025-04-16T00:00:00.000Z",
                        "has_issue": 1
                    },
                    {
                        "date": "2025-04-17T00:00:00.000Z",
                        "has_issue": 0
                    },
                    {
                        "date": "2025-04-18T00:00:00.000Z",
                        "has_issue": 0
                    }
                ]
            },
            {
                "field": "f32_material_shortage",
                "label": "Material Shortage Issue",
                "total_days_with_shortage": 1,
                "total_descriptions": 1,
                "daily_trend": [
                    {
                        "date": "2025-04-15T00:00:00.000Z",
                        "has_issue": 0,
                        "desc_count": 0
                    },
                    {
                        "date": "2025-04-16T00:00:00.000Z",
                        "has_issue": 1,
                        "desc_count": 1
                    },
                    {
                        "date": "2025-04-17T00:00:00.000Z",
                        "has_issue": 0,
                        "desc_count": 0
                    },
                    {
                        "date": "2025-04-18T00:00:00.000Z",
                        "has_issue": 0,
                        "desc_count": 0
                    }
                ]
            },
            {
                "field": "f33_other_critical_issue",
                "label": "Other Critical Issue",
                "total_days_with_issues": 1,
                "total_descriptions": 1,
                "daily_trend": [
                    {
                        "date": "2025-04-15T00:00:00.000Z",
                        "has_issue": 0,
                        "desc_count": 0
                    },
                    {
                        "date": "2025-04-16T00:00:00.000Z",
                        "has_issue": 1,
                        "desc_count": 1
                    },
                    {
                        "date": "2025-04-17T00:00:00.000Z",
                        "has_issue": 0,
                        "desc_count": 0
                    },
                    {
                        "date": "2025-04-18T00:00:00.000Z",
                        "has_issue": 0,
                        "desc_count": 0
                    }
                ]
            }
        ]
    }
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
export default function Analytics({ data = RAW }: { data?: AnalyticsData }) {
  const get = (field: string) => data.analytics.find(a => a.field === field)!;

  // ── processed data ──────────────────────────────────────────────────────
  const prodDays = useMemo(() => get('f03_production').daily_trend.map(d => ({
    date: fmtDate(d.date), target: d.target, actual: d.actual,
    eff: d.target ? +((d.actual / d.target) * 100).toFixed(1) : 0,
  })), []);

  const ctDays = useMemo(() => get('f04_cycle_time').daily_trend
    .filter(d => d.avg != null)
    .map(d => ({ date: fmtDate(d.date), front: d.front, rear: d.rear, avg: d.avg, target: d.target })), []);

  const partPie = useMemo(() => get('f03_production').by_part_type.map((p: any) => ({
    name: p.part_type, value: p.actual, target: p.target,
  })), []);

  const custRejDays = useMemo(() => get('f02_customer_rejection').daily_trend.map((d: any) => ({
    date: fmtDate(d.date), ppm: d.total_ppm, target: get('f02_customer_rejection').target_ppm,
  })), []);

  const planAdh = useMemo(() => get('f09_prod_plan_adherence').daily_trend.map((d: any) => ({
    date: fmtDate(d.date), actual: d.actual, target: d.target,
  })), []);

  const otif = useMemo(() => get('f10_otif_adherence').daily_trend.map((d: any) => ({
    date: fmtDate(d.date), actual: d.actual, target: d.target,
  })), []);

  const otDays = useMemo(() => get('f06_ot_hours_last_day').daily_trend.map((d: any) => ({
    date: fmtDate(d.date), ot: d.total_ot,
  })), []);

  const otByDept = useMemo(() => get('f06_ot_hours_last_day').by_department.map((d: any) => ({
    name: d.department, hours: d.total_hours,
  })), []);

  const otCum = useMemo(() => get('f07_ot_hours_cumulative').daily_trend.map((d: any) => ({
    date: fmtDate(d.date), cumulative: d.cumulative,
  })), []);

  const machBreakdownByMachine = useMemo(() => get('f15_machine_breakdown').by_machine.map((m: any) => ({
    name: m.machine, minutes: m.total_minutes, count: m.count,
  })), []);

  const machDays = useMemo(() => get('f15_machine_breakdown').daily_trend.map((d: any) => ({
    date: fmtDate(d.date), minutes: d.total_minutes, target: get('f15_machine_breakdown').target_minutes,
  })), []);

  const dieselDays = useMemo(() => get('f18_diesel_last_day').daily_trend.map((d: any) => ({
    date: fmtDate(d.date), actual: d.quantity_ltr, target: d.target,
  })), []);

  const dieselCum = useMemo(() => get('f19_diesel_ytd').daily_trend.map((d: any) => ({
    date: fmtDate(d.date), ltr: d.cumulative_ltr,
  })), []);

  const salesDays = useMemo(() => get('f21_sales').daily_trend.map((d: any) => ({
    date: fmtDate(d.date), daily: d.last_day_lakhs, cumulative: d.cumulative_lakhs,
  })), []);

  const trainingDays = useMemo(() => get('f22_training_last_day').daily_trend.map((d: any) => ({
    date: fmtDate(d.date), actual: d.training_minutes, target: d.target,
  })), []);

  const trainingCum = useMemo(() => get('f23_training_ytd').daily_trend.map((d: any) => ({
    date: fmtDate(d.date), minutes: d.cumulative_minutes,
  })), []);

  const fpass = useMemo(() => get('f24_first_pass_ok').daily_trend.map((d: any) => ({
    date: fmtDate(d.date), actual: d.actual, target: d.target,
  })), []);

  const pdiRatio = useMemo(() => get('f25_first_pass_pdi').daily_trend
    .filter(d => d.actual > 0)
    .map((d: any) => ({ date: fmtDate(d.date), actual: d.actual, target: d.target })), []);

  const qualityRadar = useMemo(() => [
    { metric: 'First Pass OK', value: get('f24_first_pass_ok').avg_actual },
    { metric: 'PDI Ratio', value: get('f25_first_pass_pdi').avg_actual },
    { metric: 'OTIF', value: get('f10_otif_adherence').avg_actual },
    { metric: 'Plan Adh.', value: get('f09_prod_plan_adherence').avg_actual },
    { metric: 'Power Factor', value: get('f20_power_factor').avg_actual },
  ], []);

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
  }, []);

  const issuesPie = useMemo(() => [
    { name: 'Line Quality', value: get('f12_line_quality_issue').total_issues },
    { name: 'PDI Issues', value: get('f27_pdi_issue').total_issues },
    { name: 'Field Complaints', value: get('f28_field_complaints').total_complaints },
    { name: 'Fixture Issues', value: get('f30_fixture_issue').total_days_with_issues },
    { name: 'Material Shortage', value: get('f32_material_shortage').total_days_with_shortage },
    { name: 'SOP Non-adh.', value: get('f29_sop_non_adherence').total_issues },
  ].filter(d => d.value > 0), []);

  const supplierRejDays = useMemo(() => get('f26_supplier_rejection').daily_trend.map((d: any) => ({
    date: fmtDate(d.date), qty: d.total_qty,
  })), []);

  const absenceeDays = useMemo(() => get('f14_absenteeism').daily_trend.map((d: any) => ({
    date: fmtDate(d.date), absent: d.absent_count,
  })), []);

  const incomingMatDays = useMemo(() => get('f13_poor_incoming_material').daily_trend.map((d: any) => ({
    date: fmtDate(d.date), qty: d.quantity,
  })), []);

  const perManDays = useMemo(() => get('f05_per_man_per_day').daily_trend
    .filter((d: any) => d.target > 0)
    .map((d: any) => ({ date: fmtDate(d.date), actual: d.actual, target: d.target })), []);

  const dispatchDays = useMemo(() => get('f08_dispatch').daily_trend.map((d: any) => ({
    date: fmtDate(d.date), front: d.total_front, rear: d.total_rear, ia: d.total_ia,
  })), []);

  const powerFactorDays = useMemo(() => get('f20_power_factor').daily_trend
    .filter((d: any) => d.actual > 0)
    .map((d: any) => ({ date: fmtDate(d.date), actual: d.actual, target: d.target })), []);

  const prodHoursLoss = useMemo(() => get('f11_prod_hours_loss').daily_trend.map((d: any) => ({
    date: fmtDate(d.date), hours: d.actual_hours,
  })), []);

  const kvahDays = useMemo(() => get('f16_unit_consumption_last_day').daily_trend
    .filter((d: any) => d.units_kvah > 0)
    .map((d: any) => ({ date: fmtDate(d.date), kvah: d.units_kvah })), []);

  const accByType = useMemo(() => get('f01_accident').by_type.map((t: any) => ({
    name: t.type, value: t.count,
  })).filter((t: any) => t.value > 0), []);

  // top-line KPIs
  const prod = get('f03_production');
  const prodEff = +((prod.cumulative_actual / prod.cumulative_target) * 100).toFixed(1);

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
            { label: 'OTIF Avg', value: `${get('f10_otif_adherence').avg_actual}%`, color: G.blue },
            { label: 'Incidents', value: get('f01_accident').total_incidents, color: G.red },
            { label: 'Total Sales', value: `₹${get('f21_sales').current_cumulative_lakhs}L`, color: G.gold },
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
          <KpiPill label="Customer Rej. (TML PPM)" value={get('f02_customer_rejection').by_customer[0]?.total_ppm ?? 0} color={G.red} />
          <KpiPill label="1st Pass OK Avg %" value={`${get('f24_first_pass_ok').avg_actual}%`} color={G.green} />
          <KpiPill label="PDI Ratio Avg %" value={`${get('f25_first_pass_pdi').avg_actual}%`} color={G.teal} />
          <KpiPill label="Supplier Rej. Qty" value={get('f26_supplier_rejection').by_supplier[0]?.total_qty ?? 0} color={G.amber} />
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