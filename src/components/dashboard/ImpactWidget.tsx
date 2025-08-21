import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Users, Shield } from "lucide-react";

interface ImpactWidgetProps {
  title?: string;
  pmpmChange: number;
  costSavings: number;
  accessScore: number;
  membersAffected: number;
  className?: string;
}

export function ImpactWidget({
  title = "Impact Analysis",
  pmpmChange,
  costSavings,
  accessScore,
  membersAffected,
  className
}: ImpactWidgetProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-primary" />
              <span className="text-sm font-medium">PMPM Change</span>
            </div>
            <div className="flex items-center">
              {pmpmChange < 0 ? (
                <TrendingDown className="h-4 w-4 mr-1 text-success" />
              ) : (
                <TrendingUp className="h-4 w-4 mr-1 text-destructive" />
              )}
              <span className={`font-bold text-sm ${pmpmChange < 0 ? 'text-success' : 'text-destructive'}`}>
                ${Math.abs(pmpmChange).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2 text-primary" />
              <span className="text-sm font-medium">Affected</span>
            </div>
            <span className="font-bold text-sm">
              {membersAffected.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Total Savings</p>
            <p className="text-xl font-bold text-success">
              ${costSavings.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Access Score</p>
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-1 text-primary" />
              <span className={`text-xl font-bold ${accessScore >= 95 ? 'text-success' : 'text-warning'}`}>
                {accessScore.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <Badge variant={accessScore >= 95 ? "default" : "secondary"}>
            {accessScore >= 95 ? "Meets Target" : "Below Target"}
          </Badge>
          <Badge variant={costSavings > 1000000 ? "default" : "secondary"}>
            {costSavings > 1000000 ? "High Impact" : "Moderate Impact"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}