import { cn } from "@/lib/utils";

interface HealthMeterProps {
  score: number; // 0-100
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function HealthMeter({ score, size = "md", className }: HealthMeterProps) {
  const normalizedScore = Math.max(0, Math.min(100, score));
  const getHealthStatus = (score: number) => {
    if (score >= 80) return { label: "Excellent", color: "success" };
    if (score >= 60) return { label: "Good", color: "warning" };
    if (score >= 40) return { label: "Fair", color: "warning" };
    return { label: "Poor", color: "destructive" };
  };

  const health = getHealthStatus(normalizedScore);
  
  const sizeClasses = {
    sm: "h-2 text-xs",
    md: "h-3 text-sm", 
    lg: "h-4 text-base"
  };

  const colorClasses = {
    success: "bg-success",
    warning: "bg-warning", 
    destructive: "bg-destructive"
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-muted-foreground">Business Health</span>
        <span className={cn("font-semibold", sizeClasses[size])}>
          {normalizedScore}% - {health.label}
        </span>
      </div>
      <div className="w-full bg-muted rounded-full overflow-hidden">
        <div 
          className={cn(
            "transition-all duration-500 ease-out rounded-full",
            sizeClasses[size],
            colorClasses[health.color]
          )}
          style={{ width: `${normalizedScore}%` }}
        />
      </div>
    </div>
  );
}