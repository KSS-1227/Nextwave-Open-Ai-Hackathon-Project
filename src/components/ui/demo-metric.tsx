import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface DemoMetricProps {
  label: string;
  value: string;
  unit?: string;
  trend?: "up" | "down" | "neutral";
  icon: LucideIcon;
  color?: "success" | "warning" | "primary";
  className?: string;
}

export function DemoMetric({ 
  label, 
  value, 
  unit,
  trend,
  icon: Icon, 
  color = "primary",
  className 
}: DemoMetricProps) {
  const colorClasses = {
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning", 
    primary: "bg-primary/10 text-primary"
  };

  const trendColors = {
    up: "text-success",
    down: "text-destructive",
    neutral: "text-muted-foreground"
  };

  return (
    <div className={cn(
      "bg-card rounded-lg p-3 border",
      className
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground font-medium truncate">{label}</p>
          <p className="text-lg font-bold text-foreground">{value}</p>
          {unit && (
            <p className={cn(
              "text-xs font-medium",
              trend ? trendColors[trend] : "text-muted-foreground"
            )}>
              {trend === "up" && "↗ "}{trend === "down" && "↘ "}{unit}
            </p>
          )}
        </div>
        <div className={cn("p-1.5 rounded", colorClasses[color])}>
          <Icon className="h-3 w-3" />
        </div>
      </div>
    </div>
  );
}