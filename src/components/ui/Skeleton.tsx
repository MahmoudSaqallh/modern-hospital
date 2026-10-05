import { cn } from "@/lib/localized";

export function Skeleton({ className }: { className?: string }) {
  return <span aria-hidden className={cn("skeleton block", className)} />;
}
