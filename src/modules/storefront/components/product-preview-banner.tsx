import Link from "next/link";
import { Pencil } from "lucide-react";
import { Button } from "@/modules/common/ui/button";
import type { ProductStatus } from "@/modules/common/types/database";

interface ProductPreviewBannerProps {
  status: ProductStatus;
  editHref: string;
  backHref: string;
}

export function ProductPreviewBanner({
  status,
  editHref,
  backHref,
}: ProductPreviewBannerProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-amber-900 dark:bg-amber-950/40">
      <div className="space-y-1 text-sm">
        <p className="font-medium text-amber-900 dark:text-amber-200">
          Admin preview mode
        </p>
        <p className="text-amber-800 dark:text-amber-300/90">
          {status === "active"
            ? "This is how the product appears on your storefront."
            : "This product is inactive and hidden from the public storefront."}
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button
          variant="outline"
          size="sm"
          className="w-full sm:w-auto"
          render={<Link href={backHref} />}
        >
          Back to products
        </Button>
        <Button
          size="sm"
          className="w-full sm:w-auto"
          render={<Link href={editHref} />}
        >
          <Pencil data-icon="inline-start" />
          Edit product
        </Button>
      </div>
    </div>
  );
}
