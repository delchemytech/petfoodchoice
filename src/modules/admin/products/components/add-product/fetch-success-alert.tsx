import { CheckCircle2 } from "lucide-react";
import { cn } from "@/modules/common/utils";

interface FetchSuccessAlertProps {
  className?: string;
  warnings?: string[];
}

export function FetchSuccessAlert({
  className,
  warnings = [],
}: FetchSuccessAlertProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div
        role="status"
        className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
      >
        <CheckCircle2 className="size-5 shrink-0" />
        <p>Product details fetched successfully.</p>
      </div>

      {warnings.map((warning) => (
        <div
          key={warning}
          role="status"
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
        >
          {warning}
        </div>
      ))}
    </div>
  );
}
