import { cn } from "@/lib/utils";

interface CurrencyProps {
  amount: number;
  className?: string;
  showSign?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Currency({ amount, className, showSign = false, size = "md" }: CurrencyProps) {
  const isPositive = amount >= 0;
  const formattedAmount = Math.abs(amount).toLocaleString('en-IN');
  
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl font-semibold"
  };

  return (
    <span 
      className={cn(
        "currency number-indian",
        sizeClasses[size],
        isPositive ? "currency-positive" : "currency-negative",
        className
      )}
    >
      {showSign && (isPositive ? "+" : "-")}₹{formattedAmount}
    </span>
  );
}