import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

export function Skeleton({ className, children, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "loading-skeleton rounded-md",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="modern-card p-6 space-y-4">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[160px]" />
        </div>
      </div>
      <Skeleton className="h-[100px] w-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[80%]" />
      </div>
    </div>
  );
}

export function MetricSkeleton() {
  return (
    <div className="modern-card p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-5 rounded" />
      </div>
      <Skeleton className="h-8 w-32 mt-2" />
      <div className="flex items-center gap-2 mt-2">
        <Skeleton className="h-3 w-3 rounded" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className={cn(
          "flex gap-3",
          i % 2 === 0 ? "justify-end" : "justify-start"
        )}>
          {i % 2 === 1 && <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />}
          <div className={cn(
            "max-w-[70%] space-y-2",
            i % 2 === 0 ? "items-end" : "items-start"
          )}>
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-3 w-16" />
          </div>
          {i % 2 === 0 && <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />}
        </div>
      ))}
    </div>
  );
}