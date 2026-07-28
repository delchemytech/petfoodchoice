import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getCategories } from "../../categories/actions/get-categories";
import { PageHeader } from "../../components/page-header";
import { Button } from "@/modules/common/ui/button";
import { AddProductForm } from "../components/add-product/add-product-form";

export const dynamic = "force-dynamic";

export default async function AddProductPage() {
  const categories = await getCategories();

  return (
    <>
      <PageHeader
        title="Add Product"
        description="Fetch product details from an affiliate URL, review, and save."
        actions={
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            render={<Link href="/admin/products" />}
          >
            <ChevronLeft data-icon="inline-start" />
            Back to Products
          </Button>
        }
      />
      <AddProductForm categories={categories.map((category) => category.name)} />
    </>
  );
}
