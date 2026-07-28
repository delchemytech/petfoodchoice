import { Badge } from "@/modules/common/ui/badge";
import type { ProductStatus } from "../types";

const statusLabels: Record<ProductStatus, string> = {
  active: "Active",
  inactive: "Inactive",
};

const statusVariants: Record<
  ProductStatus,
  "default" | "secondary" | "outline"
> = {
  active: "default",
  inactive: "secondary",
};

interface ProductStatusBadgeProps {
  status: ProductStatus;
}

export function ProductStatusBadge({ status }: ProductStatusBadgeProps) {
  return (
    <Badge variant={statusVariants[status]}>{statusLabels[status]}</Badge>
  );
}
