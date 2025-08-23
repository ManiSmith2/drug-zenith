import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KPICard } from "@/components/dashboard/KPICard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Shield, 
  PillBottle,
  Target,
  AlertCircle,
  CheckCircle,
  Search,
  Brain,
  BarChart3,
  Activity
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
  Cell,
  ScatterChart,
  Scatter
} from 'recharts';
import { apiService, type DrugStats, type RecommendationResponse, type CostAnalysis } from "@/lib/api";
import { toast } from "sonner";

export default function Dashboard() {
  const [drugStats, setDrugStats] = useState<DrugStats | null>(null);
  const [costAnalysis, setCostAnalysis] = useState<CostAnalysis | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    checkServerStatus();
    loadDashboardData();
  }, []);

  const checkServerStatus = async () => {
    try {
      await apiService.healthCheck();
      setServerStatus('online');
    } catch (error) {
      setServerStatus('offline');
      toast.error("ML Server is offline. Please start the backend server.");
    }
  };

  const loadDashboardData = async () => {
    try {
      const [statsData, costData] = await Promise.all([
        apiService.getDrugStats(),
        apiService.getCostAnalysis()
      ]);
      setDrugStats(statsData);
      setCostAnalysis(costData);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      toast.error("Failed to load dashboard data");
    }
  };

  const handleDrugRecommendation = async () => {
    if (!searchTerm.trim()) {
      toast.error("Please enter drug name(s)");
      return;
    }

    setLoading(true);
    try {
      const drugNames = searchTerm.split(',').map(name => name.trim());
      const result = await apiService.getRecommendations(drugNames);
      setRecommendations(result);
      toast.success("Recommendations generated successfully!");
    } catch (error) {
      toast.error("Failed to get recommendations: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const therapeuticClassData = costAnalysis ? 
    Object.entries(costAnalysis.cost_by_therapeutic_class).map(([name, cost]) => ({
      name: name.length > 20 ? name.substring(0, 20) + '...' : name,
      cost: typeof cost === 'string' ? parseFloat(cost.replace(/[$,]/g, '')) : cost
    })).slice(0, 8) : [];

  const stateData = costAnalysis ?
    Object.entries(costAnalysis.pmpm_by_state).map(([state, pmpm]) => ({
      state,
      pmpm: typeof pmmp === 'string' ? parseFloat(pmpm) : pmpm
    })).slice(0, 10) : [];

  const ageDistributionData = costAnalysis ?
    Object.entries(costAnalysis.age_distribution).map(([age, count]) => ({
      age,
      count,
      fill: `hsl(${Math.random() * 360}, 70%, 50%)`
    })) : [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">PBM ML Optimization Platform</h1>
          <p className="text-muted-foreground">
            AI-powered pharmacy benefit management with real-time drug recommendations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={serverStatus === 'online' ? 'default' : 'destructive'}>
            {serverStatus === 'checking' ? 'Checking...' : 
             serverStatus === 'online' ? '🟢 ML Server Online' : '🔴 ML Server Offline'}
          </Badge>
          <Button variant="outline" onClick={loadDashboardData}>
            Refresh Data
          </Button>
        </div>
      </div>

      {/* ML Drug Recommendation Section */}
      <Card className="border-l-4 border-l-primary bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="h-6 w-6 mr-2 text-primary" />
            AI Drug Recommendation Engine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Enter drug name(s) separated by commas (e.g., LIPITOR, ZOLOFT)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => e.key === 'Enter' && handleDrugRecommendation()}
                />
              </div>
            </div>
            <Button 
              onClick={handleDrugRecommendation} 
              disabled={loading || serverStatus !== 'online'}
              className="min-w-[150px]"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing...
                </div>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Get Recommendations
                </>
              )}
            </Button>
          </div>

          {/* Recommendation Results */}
          {recommendations && (
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Original Drugs */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Original Drug(s)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recommendations.original_drugs.map((drug, index) => (
                      <div key={index} className="p-3 border rounded-lg mb-2">
                        <h4 className="font-semibold">{drug.drug_name}</h4>
                        <p className="text-sm text-muted-foreground">Generic: {drug.generic_name}</p>
                        <p className="text-sm">Class: {drug.therapeutic_class}</p>
                        <p className="text-sm font-medium">PMPM Cost: ${drug.pmpm_cost}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Recommended Drugs */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-success">AI Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recommendations.recommended_drugs.map((drug, index) => (
                      <div key={index} className="p-3 border border-success/20 bg-success/5 rounded-lg mb-2">
                        <h4 className="font-semibold text-success">{drug.drug_name}</h4>
                        <p className="text-sm text-muted-foreground">Generic: {drug.generic_name}</p>
                        <p className="text-sm">Class: {drug.therapeutic_class}</p>
                        <p className="text-sm font-medium">PMPM Cost: ${drug.pmpm_cost}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Analysis Results */}
              <Card className="border-success/20 bg-success/5">
                <CardHeader>
                  <CardTitle className="flex items-center text-success">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    ML Analysis Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-success">
                        {recommendations.analysis.percentage_saving.toFixed(1)}%
                      </p>
                      <p className="text-sm text-muted-foreground">Cost Reduction</p>
                    </div>
                    
                    {recommendations.analysis.cost_saving_per_member && (
                      <div className="text-center">
                        <p className="text-2xl font-bold text-success">
                          ${recommendations.analysis.cost_saving_per_member.toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">Saving per Member</p>
                      </div>
                    )}

                    {recommendations.analysis.safety_score && (
                      <div className="text-center">
                        <p className={`text-2xl font-bold ${
                          recommendations.analysis.safety_score === 'High' ? 'text-success' :
                          recommendations.analysis.safety_score === 'Medium' ? 'text-warning' : 'text-destructive'
                        }`}>
                          {recommendations.analysis.safety_score}
                        </p>
                        <p className="text-sm text-muted-foreground">Safety Score</p>
                      </div>
                    )}
                  </div>

                  {recommendations.analysis.interaction_description && (
                    <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                      <p className="text-sm">
                        <strong>Interaction Analysis:</strong> {recommendations.analysis.interaction_description}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* KPI Cards */}
      {drugStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Total Drugs"
            value={drugStats.total_drugs}
            icon={<PillBottle className="h-4 w-4" />}
          />
          <KPICard
            title="Total Cost"
            value={drugStats.total_cost}
            format="currency"
            icon={<DollarSign className="h-4 w-4" />}
          />
          <KPICard
            title="Total Members"
            value={drugStats.total_members}
            icon={<Users className="h-4 w-4" />}
          />
          <KPICard
            title="Avg Age"
            value={`${drugStats.avg_age.toFixed(1)} years`}
            icon={<Activity className="h-4 w-4" />}
          />
        </div>
      )}

      {/* Visualization Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost by Therapeutic Class */}
        <Card>
          <CardHeader>
            <CardTitle>Cost by Therapeutic Class</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={therapeuticClassData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Cost']} />
                <Bar dataKey="cost" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* PMPM by State */}
        <Card>
          <CardHeader>
            <CardTitle>PMPM Cost by State</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stateData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="state" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'PMPM']} />
                <Bar dataKey="pmpm" fill="hsl(var(--success))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Age Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Member Age Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ageDistributionData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="count"
                  nameKey="age"
                >
                  {ageDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Therapeutic Equivalence Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Therapeutic Equivalence Codes</CardTitle>
          </CardHeader>
          <CardContent>
            {drugStats && (
              <div className="space-y-2">
                {Object.entries(drugStats.te_codes_distribution).map(([code, count]) => (
                  <div key={code} className="flex justify-between items-center">
                    <Badge variant={code === 'AB' ? 'default' : 'secondary'}>
                      {code}
                    </Badge>
                    <span className="font-medium">{count} drugs</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}