import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  format?: 'currency' | 'percentage' | 'number';
  className?: string;
}

export function KPICard({ 
  title, 
  value, 
  change, 
  changeLabel,
  icon,
  format = 'number',
  className 
}: KPICardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(val);
      case 'percentage':
        return `${val.toFixed(1)}%`;
      default:
        return new Intl.NumberFormat('en-US').format(val);
    }
  };

  const getTrendIcon = () => {
    if (!change) return <Minus className="h-4 w-4" />;
    if (change > 0) return <TrendingUp className="h-4 w-4" />;
    return <TrendingDown className="h-4 w-4" />;
  };

  const getTrendColor = () => {
    if (!change) return "text-muted-foreground";
    // For cost metrics, negative is good (savings)
    // For satisfaction/access metrics, positive is good
    const isPositiveGood = title.toLowerCase().includes('access') || 
                          title.toLowerCase().includes('satisfaction') ||
                          title.toLowerCase().includes('generic');
    
    if (isPositiveGood) {
      return change > 0 ? "text-success" : "text-destructive";
    } else {
      return change > 0 ? "text-destructive" : "text-success";
    }
  };

  return (
    <Card className={cn("shadow-card hover:shadow-lg transition-shadow", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground mb-1">
          {formatValue(value)}
        </div>
        {change !== undefined && (
          <div className={cn("flex items-center text-sm", getTrendColor())}>
            {getTrendIcon()}
            <span className="ml-1">
              {Math.abs(change).toFixed(1)}% {changeLabel || 'vs last period'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}