import { CheckCircle2 } from "lucide-react";
import { cn } from "@/modules/common/utils";

interface FetchSuccessAlertProps {
  className?: string;
}

export function FetchSuccessAlert({ className }: FetchSuccessAlertProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
        className,
      )}
    >
      <CheckCircle2 className="size-5 shrink-0" />
      <p>Product details fetched successfully.</p>
    </div>
  );
}
