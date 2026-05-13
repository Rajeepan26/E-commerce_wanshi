import { cn } from "@/lib/utils";

const MAP: Record<string, string> = {
  Pending: "bg-warning/15 text-warning-foreground border-warning/40",
  Accepted: "bg-primary-soft text-accent-foreground border-primary/30",
  "In-Transit": "bg-warning/20 text-warning-foreground border-warning/40",
  Delivered: "bg-success/15 text-success border-success/40",
  Cancelled: "bg-destructive/10 text-destructive border-destructive/40",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        MAP[status] ?? "bg-secondary text-foreground",
      )}
    >
      {status}
    </span>
  );
}