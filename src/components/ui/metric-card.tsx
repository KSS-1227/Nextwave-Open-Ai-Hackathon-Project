import { cn } from "@/lib/utils";
import { Currency } from "./currency";
import { Card, CardContent } from "./card";
import { LucideIcon, TrendingUp } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  isCurrency?: boolean;
  className?: string;
}

export function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  isCurrency = false, 
  className 
}: MetricCardProps) {
  return (
    <Card className={cn("card-hover", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </div>
        
        <div className="mt-3">
          {isCurrency ? (
            <Currency amount={value} size="xl" />
          ) : (
            <p className="text-2xl font-bold">{value}%</p>
          )}
        </div>
        
        {trend && (
          <div className="flex items-center gap-1 mt-3">
            <div className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
              trend.isPositive 
                ? "bg-success/10 text-success" 
                : "bg-destructive/10 text-destructive"
            )}>
              <TrendingUp 
                className={cn(
                  "h-3 w-3",
                  trend.isPositive ? "text-success" : "text-destructive rotate-180"
                )} 
              />
              <span>{trend.value}%</span>
            </div>
            <span className="text-xs text-muted-foreground ml-1">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}