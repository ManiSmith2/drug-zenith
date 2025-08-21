// Mock data for PBM platform development
import { KPIMetrics, FormularyEntry, Prescriber, TERecommendation, ScenarioResult } from '@/types/pbm';

export const mockKPIs: KPIMetrics = {
  pmpm: 485.23,
  pmpm_trend: -2.8,
  cost_reduction_percent: 8.4,
  member_access_percent: 96.2,
  generic_fill_rate: 87.3,
  total_spend: 24580000,
  members_enrolled: 50650
};

export const mockFormulary: FormularyEntry[] = [
  {
    ndc: "00093-1712-01",
    drug_name: "Atorvastatin 20mg Tablets",
    tier: "Preferred",
    pa_required: false,
    step_therapy: null,
    copay: 10
  },
  {
    ndc: "00002-3004-75",
    drug_name: "Humalog 100 Units/mL",
    tier: "Specialty",
    pa_required: true,
    step_therapy: "Must try Novolog first",
    copay: 50
  },
  {
    ndc: "50580-226-50",
    drug_name: "Lipitor 40mg Tablets",
    tier: "Non-Preferred",
    pa_required: false,
    step_therapy: null,
    copay: 35
  },
  {
    ndc: "31722-665-30",
    drug_name: "Metformin 500mg Tablets",
    tier: "Preferred",
    pa_required: false,
    step_therapy: null,
    copay: 5
  }
];

export const mockPrescribers: Prescriber[] = [
  {
    npi: "1234567890",
    prescriber_name: "Dr. Sarah Johnson",
    specialty: "Internal Medicine",
    state: "CA",
    total_claims: 2456,
    total_cost: 124500,
    unique_beneficiaries: 892
  },
  {
    npi: "1234567891",
    prescriber_name: "Dr. Michael Chen",
    specialty: "Cardiology",
    state: "NY",
    total_claims: 1876,
    total_cost: 298750,
    unique_beneficiaries: 634
  },
  {
    npi: "1234567892",
    prescriber_name: "Dr. Emily Rodriguez",
    specialty: "Endocrinology",
    state: "TX",
    total_claims: 3124,
    total_cost: 456890,
    unique_beneficiaries: 1045
  }
];

export const mockTERecommendations: TERecommendation[] = [
  {
    current_ndc: "50580-226-50",
    current_drug: "Lipitor 40mg Tablets",
    recommended_ndc: "00093-1712-01",
    recommended_drug: "Atorvastatin 40mg Tablets",
    potential_savings: 125000,
    savings_per_member: 28.50,
    te_code: "AB",
    confidence_score: 95
  },
  {
    current_ndc: "00002-3004-75",
    current_drug: "Humalog 100 Units/mL",
    recommended_ndc: "00169-7501-11",
    recommended_drug: "Novolog 100 Units/mL",
    potential_savings: 89500,
    savings_per_member: 45.25,
    te_code: "AB",
    confidence_score: 88
  }
];

export const mockScenarioResults: ScenarioResult[] = [
  {
    scenario_name: "Brand to Generic Initiative Q1",
    projected_savings: 2450000,
    new_pmpm: 436.78,
    access_score: 96.8,
    disruption_score: 8.2,
    affected_members: 4150,
    roi_percentage: 18.5
  },
  {
    scenario_name: "Tier Optimization - Diabetes",
    projected_savings: 1875000,
    new_pmpm: 458.90,
    access_score: 95.4,
    disruption_score: 12.1,
    affected_members: 6230,
    roi_percentage: 14.2
  }
];

export const mockPMMPData = [
  { month: 'Jan', pmpm: 498.23, target: 485, baseline: 512 },
  { month: 'Feb', pmmp: 495.45, target: 485, baseline: 512 },
  { month: 'Mar', pmpm: 492.67, target: 485, baseline: 512 },
  { month: 'Apr', pmpm: 489.12, target: 485, baseline: 512 },
  { month: 'May', pmpm: 487.34, target: 485, baseline: 512 },
  { month: 'Jun', pmpm: 485.23, target: 485, baseline: 512 }
];

export const mockUtilizationTrends = [
  { category: 'Diabetes', current: 15680, projected: 16250, trend: 3.6 },
  { category: 'Cardiology', current: 12450, projected: 12180, trend: -2.2 },
  { category: 'Oncology', current: 8920, projected: 9580, trend: 7.4 },
  { category: 'Mental Health', current: 7650, projected: 8100, trend: 5.9 }
];