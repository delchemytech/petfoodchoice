import { AlertCircle } from "lucide-react";
import { Button } from "@/modules/common/ui/button";
import { cn } from "@/modules/common/utils";

interface FetchErrorAlertProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function FetchErrorAlert({
  message,
  onRetry,
  className,
}: FetchErrorAlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between dark:border-red-900 dark:bg-red-950/40 dark:text-red-300",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 size-5 shrink-0" />
        <p>{message}</p>
      </div>
      {onRetry ? (
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          Try Again
        </Button>
      ) : null}
    </div>
  );
}
