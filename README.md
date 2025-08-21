# PBM Optimize - Pharmacy Benefit Management Platform

A comprehensive PBM optimization platform designed to reduce pharmacy costs by 12% while maintaining 95%+ member satisfaction with drug access.

## 🎯 Project Overview

**Objective:** Optimize formulary decisions and drug utilization to control pharmacy costs while ensuring appropriate medication access.

**Key Goals:**
- Reduce pharmacy costs by ≥12%
- Maintain ≥95% member access satisfaction
- Real-time formulary impact analysis
- Therapeutic equivalence optimization
- Drug utilization trend prediction
- Cost-per-member-per-month (PMPM) tracking

## 🏗️ Architecture

### Frontend Stack
- **React** with TypeScript for type safety
- **Vite** for fast development and building
- **Tailwind CSS** for styling with custom healthcare design system
- **shadcn/ui** components for consistent UI
- **Recharts** for data visualization
- **React Router** for navigation

### Design System
Professional healthcare industry-inspired design featuring:
- Healthcare blue/green color palette (`hsl(210, 100%, 45%)` primary)
- Tier-specific color coding for formulary entries
- Semantic tokens for consistent theming
- Responsive layouts optimized for healthcare workflows

## 📊 Key Features

### 1. Executive Dashboard
- Real-time PMPM tracking and trends
- Cost reduction progress monitoring
- Member access score visualization
- Generic fill rate analytics
- Utilization forecasting by drug category

### 2. Formulary Management
- Complete NDC-level drug database
- Tier assignment (Preferred/Non-Preferred/Specialty/Excluded)
- Prior authorization (PA) requirements
- Step therapy protocols
- Real-time impact analysis for changes

### 3. Therapeutic Equivalence (TE) Engine
- AB-rated generic identification
- Cost savings calculation per switch
- Confidence scoring for recommendations
- Batch optimization capabilities

### 4. Scenario Analysis
- What-if modeling for formulary changes
- ROI calculation and projections
- Member disruption impact assessment
- Access score maintenance validation

### 5. Provider Analytics
- Prescriber performance scorecards
- Cost efficiency metrics
- Generic prescribing rates
- Targeted intervention recommendations

## 🗂️ File Structure

```
src/
├── components/
│   ├── layout/           # AppLayout, Sidebar, Header
│   ├── dashboard/        # KPICard, ImpactWidget, TierBadge
│   └── ui/              # shadcn/ui components
├── pages/
│   ├── Dashboard.tsx     # Executive overview
│   ├── Formulary.tsx     # Drug management
│   ├── Scenarios.tsx     # What-if analysis
│   └── Providers.tsx     # Prescriber insights
├── types/
│   └── pbm.ts           # TypeScript domain models
├── lib/
│   ├── mock-data.ts     # Development data
│   └── utils.ts         # Utility functions
└── index.css           # Design system tokens
```

## 🎨 Design System

### Color Palette
```css
/* Primary Healthcare Blue */
--primary: 210 100% 45%
--primary-light: 210 100% 55%
--primary-dark: 210 100% 35%

/* Healthcare Success Green */
--secondary: 142 76% 36%

/* Tier Colors */
--tier-preferred: 142 76% 36%      /* Green */
--tier-non-preferred: 45 93% 47%   /* Orange */
--tier-specialty: 271 81% 56%      /* Purple */
--tier-excluded: 0 84% 60%         /* Red */

/* Data Visualization */
--chart-1: 210 100% 45%            /* Blue */
--chart-2: 142 76% 36%             /* Green */
--chart-3: 25 95% 53%              /* Orange */
--chart-4: 271 81% 56%             /* Purple */
--chart-5: 348 83% 47%             /* Red */
```

### Typography
- Professional healthcare fonts
- Clear hierarchy for clinical data
- Monospace for NDC codes and IDs

## 📈 Key Metrics

### KPI Tracking
- **PMPM (Per-Member-Per-Month):** Primary cost metric
- **Cost Reduction %:** Progress toward 12% target
- **Member Access Score:** Satisfaction proxy (≥95% target)
- **Generic Fill Rate:** Cost optimization indicator

### Business Logic
```typescript
// PMMP Calculation
PMPM = total_pharmacy_spend / members_enrolled

// Access Score (proxy calculation)
AccessScore = 100% - (denied_claims% + PA_denials_weighted + step_therapy_friction)

// TE Savings Calculation  
TESavings = (brand_cost - generic_cost) * projected_utilization
```

## 🔧 Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run type checking
npm run type-check
```

## 🎯 Usage Examples

### 1. Dashboard Navigation
- Access via sidebar navigation
- Real-time KPI monitoring
- Drill-down capabilities for detailed analysis

### 2. Formulary Changes
- Search by NDC or drug name
- Filter by tier, PA status, or step therapy
- Instant impact preview for modifications

### 3. TE Recommendations
- Automated generic alternative identification  
- Savings calculations with confidence scores
- Batch processing for portfolio optimization

### 4. Scenario Building
- Drag-and-drop formulary modifications
- Real-time ROI calculation
- Access score validation

## 📊 Data Integration

### Expected Excel Schema
The platform expects data in the following Excel sheet structure:

- **Prescribers:** NPI, name, specialty, state, claims, cost
- **Claims:** Member ID, NDC, quantity, cost, dates  
- **Members:** Demographics, plan information, risk scores
- **Formulary:** NDC, tier, PA requirements, copays
- **TE_Equivalence:** Therapeutic equivalence mappings
- **Rebates:** Manufacturer rebate information

## 🎨 UI Components

### Specialized Healthcare Components
- `KPICard`: Metric display with trend indicators
- `TierBadge`: Color-coded formulary tier display
- `ImpactWidget`: Change analysis with access validation
- Professional data tables with advanced filtering
- Clinical-grade charts and visualizations

## 📱 Responsive Design

Optimized for healthcare workflows across devices:
- Desktop: Full analytics dashboard
- Tablet: Touch-optimized formulary management
- Mobile: Quick access to key metrics

## 🔒 Security & Compliance

Built with healthcare data security in mind:
- No PHI storage in frontend
- Aggregated data presentation only
- Professional audit trails
- HIPAA-ready architecture foundations

---

**Technology Stack:** React, TypeScript, Tailwind CSS, shadcn/ui, Recharts, Vite
**Industry Focus:** Pharmacy Benefit Management (PBM)  
**Target Users:** PBM Analysts, Healthcare Administrators, Pharmacy Directors