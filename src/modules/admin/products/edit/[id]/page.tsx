import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Eye } from "lucide-react";
import { PageHeader } from "../../../components/page-header";
import { Button } from "@/modules/common/ui/button";
import { getCategories } from "../../../categories/actions/get-categories";
import { getProductById } from "../../actions/get-product";
import { EditProductForm } from "../../components/edit-product-form";

export const dynamic = "force-dynamic";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProductById(id),
    getCategories(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title="Edit Product"
        description={`Editing ${product.name}`}
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              nativeButton={false}
              render={
                <Link
                  href={`/products/${product.slug}?preview=true`}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <Eye data-icon="inline-start" />
              Preview
            </Button>
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              render={<Link href="/admin/products" />}
            >
              <ChevronLeft data-icon="inline-start" />
              Back to Products
            </Button>
          </div>
        }
      />
      <EditProductForm
        product={product}
        categories={categories.map((category) => category.name)}
      />
    </>
  );
}
