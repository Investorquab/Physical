import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-base bg-bg-raised", className)}
      aria-hidden="true"
    />
  );
}
