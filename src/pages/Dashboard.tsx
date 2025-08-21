import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KPICard } from "@/components/dashboard/KPICard";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Shield, 
  PillBottle,
  Target,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { mockKPIs, mockPMMPData, mockUtilizationTrends, mockTERecommendations } from "@/lib/mock-data";

const tierDistribution = [
  { name: 'Preferred', value: 45, color: 'hsl(var(--tier-preferred))' },
  { name: 'Non-Preferred', value: 30, color: 'hsl(var(--tier-non-preferred))' },
  { name: 'Specialty', value: 20, color: 'hsl(var(--tier-specialty))' },
  { name: 'Excluded', value: 5, color: 'hsl(var(--tier-excluded))' }
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">PBM Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor pharmacy benefit performance and cost optimization opportunities
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">Export Report</Button>
          <Button>Run New Analysis</Button>
        </div>
      </div>

      {/* Alert Banner */}
      <Card className="border-l-4 border-l-warning bg-warning/5">
        <CardContent className="pt-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-warning mr-3" />
            <div>
              <p className="font-medium">Cost Optimization Opportunity</p>
              <p className="text-sm text-muted-foreground">
                15 therapeutic equivalence recommendations available with potential $2.4M annual savings
              </p>
            </div>
            <Button size="sm" className="ml-auto">
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="PMPM Cost"
          value={mockKPIs.pmpm}
          change={mockKPIs.pmpm_trend}
          format="currency"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <KPICard
          title="Cost Reduction"
          value={mockKPIs.cost_reduction_percent}
          change={2.1}
          format="percentage"
          icon={<Target className="h-4 w-4" />}
        />
        <KPICard
          title="Member Access"
          value={mockKPIs.member_access_percent}
          change={0.3}
          format="percentage"
          icon={<Shield className="h-4 w-4" />}
        />
        <KPICard
          title="Generic Fill Rate"
          value={mockKPIs.generic_fill_rate}
          change={1.8}
          format="percentage"
          icon={<PillBottle className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PMPM Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              PMPM Trend vs Target
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockPMMPData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="pmpm" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  name="Actual PMPM"
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="hsl(var(--success))" 
                  strokeDasharray="5 5"
                  name="Target"
                />
                <Line 
                  type="monotone" 
                  dataKey="baseline" 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeDasharray="2 2"
                  name="Baseline"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Utilization Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Drug Category Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockUtilizationTrends}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="category" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))'
                  }}
                />
                <Bar dataKey="current" fill="hsl(var(--primary))" name="Current" />
                <Bar dataKey="projected" fill="hsl(var(--primary-light))" name="Projected" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Formulary Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Formulary Tier Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={tierDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {tierDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {tierDistribution.map((tier) => (
                <div key={tier.name} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: tier.color }}
                  />
                  <span className="text-sm">
                    {tier.name}: {tier.value}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top TE Opportunities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Top TE Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockTERecommendations.slice(0, 3).map((rec, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{rec.current_drug}</p>
                    <p className="text-xs text-muted-foreground">
                      → {rec.recommended_drug}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-success">
                      ${rec.potential_savings.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {rec.confidence_score}% confidence
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Recommendations
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}