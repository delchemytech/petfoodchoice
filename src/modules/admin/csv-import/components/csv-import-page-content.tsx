"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import Papa from "papaparse";
import { CheckCircle2, Loader2, Save, Upload } from "lucide-react";
import { PageHeader } from "@/modules/admin/components/page-header";
import { Button } from "@/modules/common/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/modules/common/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/modules/common/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/modules/common/ui/table";
import { saveBulkProducts } from "../../bulk-fetch/actions/save-bulk-products";
import { formatPetFoodAttributeSummary } from "@/modules/common/lib/product-attribute-options";
import type { BulkFetchedProduct } from "../../bulk-fetch/types";

function formatMoney(value: string, currency: string): string {
  if (!value?.trim()) return "—";
  const amount = Number.parseFloat(value);
  if (Number.isNaN(amount)) return "—";
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return value;
  }
}

function formatCount(value: string): string {
  if (!value?.trim()) return "—";
  const amount = Number.parseInt(value, 10);
  if (Number.isNaN(amount)) return "—";
  return new Intl.NumberFormat("en-IN").format(amount);
}

function discountLabel(product: BulkFetchedProduct): string {
  if (product.amazonDiscountPercentage?.trim()) {
    return `-${product.amazonDiscountPercentage}%`;
  }
  return "—";
}

function saveSummary(result: {
  saved: number;
  skippedExisting: number;
  skippedInvalid: number;
}): string {
  const parts = [`Saved ${result.saved} product${result.saved === 1 ? "" : "s"} to the catalog.`];
  if (result.skippedExisting > 0) {
    parts.push(`${result.skippedExisting} already in the catalog.`);
  }
  if (result.skippedInvalid > 0) {
    parts.push(
      `${result.skippedInvalid} skipped (missing price, name, or other required fields).`,
    );
  }
  return parts.join(" ");
}

interface CsvImportPageContentProps {
  categories: string[];
}

export function CsvImportPageContent({ categories }: CsvImportPageContentProps) {
  const [isSaving, startSaveTransition] = useTransition();
  const [saveCategory, setSaveCategory] = useState(
    categories.length === 1 ? categories[0] : "",
  );
  const [products, setProducts] = useState<BulkFetchedProduct[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [error, setError] = useState("");
  const [saveSuccessOpen, setSaveSuccessOpen] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError("");

    Papa.parse<string[]>(file, {
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rows = results.data;
          if (rows.length <= 1) {
            setError("CSV file is empty or only contains headers.");
            return;
          }

          // Skip header row
          const parsedProducts: BulkFetchedProduct[] = rows.slice(1).map((row) => {
            return {
              asin: row[0] || "",
              name: row[1] || "",
              slug: row[2] || "",
              brand: row[3] || "",
              category: row[4] || "",
              amazonSourceUrl: row[5] || "",
              amazonAffiliateUrl: row[6] || "",
              amazonCurrentPrice: row[7] || "",
              amazonOriginalPrice: row[8] || "",
              amazonDiscountPercentage: row[9] || "",
              currency: row[10] || "INR",
              rating: row[11] || "",
              totalReviews: row[12] || "",
              imageUrl: row[13] || "",
              imageUrls: row[14] ? row[14].split(" | ") : [],
              shortDescription: row[15] || "",
              petType: row[16] || "",
              lifeStage: row[17] || "",
              breedSize: row[18] || "",
              foodType: row[19] || "",
              flavor: row[20] || "",
              packWeight: row[21] || "",
              packWeightUnit: row[22] || "",
              packCount: row[23] || "",
              status: (row[24] as "active" | "inactive") || "active",
              // Initialize empty fields for flipkart since they are not in CSV
              flipkartSourceUrl: "",
              flipkartAffiliateUrl: "",
              flipkartCurrentPrice: "",
              flipkartOriginalPrice: "",
              flipkartDiscountPercentage: "",
            };
          });

          setProducts(parsedProducts);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        } catch (e) {
          setError("Failed to parse CSV format. Please ensure it matches the downloaded format.");
        }
      },
      error: (err) => {
        setError(`Failed to read CSV file: ${err.message}`);
      }
    });
  }

  function handleSave() {
    if (!products.length || isSaving) return;
    if (!saveCategory) {
      setError("Select a catalog category before saving.");
      return;
    }

    setError("");
    startSaveTransition(async () => {
      const result = await saveBulkProducts(products, saveCategory);
      if (!result.success) {
        setError(result.error);
        return;
      }
      if (result.saved === 0 && result.skippedExisting === 0 && result.skippedInvalid === 0) {
        setError("Nothing to save.");
        return;
      }

      if (result.saved > 0) {
        setProducts([]);
        setFileName("");
        setSaveSuccessMessage(saveSummary(result));
        setSaveSuccessOpen(true);
        return;
      }

      setError(saveSummary(result));
    });
  }

  function handleSaveSuccessClose(open: boolean) {
    setSaveSuccessOpen(open);
    if (!open) {
      setSaveSuccessMessage("");
    }
  }

  return (
    <>
      <PageHeader
        title="CSV Import"
        description="Upload a CSV file of products to bulk import them into the catalog."
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row items-center">
            <Select
              value={saveCategory}
              onValueChange={(value) => setSaveCategory(value ?? "")}
              disabled={isSaving || categories.length === 0}
            >
              <SelectTrigger className="h-9 w-full sm:w-56">
                <SelectValue placeholder="Category to save" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              className="w-full sm:w-auto"
              onClick={handleSave}
              disabled={!products.length || isSaving || categories.length === 0}
            >
              {isSaving ? (
                <Loader2 data-icon="inline-start" className="animate-spin" />
              ) : (
                <Save data-icon="inline-start" />
              )}
              {isSaving ? "Saving…" : "Save to catalog"}
            </Button>
          </div>
        }
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div>
          <input
            type="file"
            accept=".csv"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <Button 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isSaving}
          >
            <Upload data-icon="inline-start" />
            Upload CSV File
          </Button>
        </div>
        {fileName ? (
          <span className="text-sm text-muted-foreground">
            Selected: <span className="font-medium text-foreground">{fileName}</span> ({products.length} products)
          </span>
        ) : null}
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
        >
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border">
        <div className="overflow-x-auto">
          <Table className="min-w-[1480px]">
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>ASIN</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Pet food</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>List price</TableHead>
                <TableHead>Off</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Reviews</TableHead>
                <TableHead>Images</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>URL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={13}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Upload a CSV file to preview products before saving.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product, i) => (
                  <TableRow key={product.asin || i}>
                    <TableCell className="max-w-[280px] whitespace-normal">
                      <div className="flex items-center gap-3">
                        <ProductThumb
                          title={product.name}
                          imageUrl={product.imageUrl}
                        />
                        <span
                          className="line-clamp-2 font-medium leading-snug"
                          title={product.name}
                        >
                          {product.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {product.asin}
                    </TableCell>
                    <TableCell>{product.brand || "—"}</TableCell>
                    <TableCell className="max-w-[160px] truncate">
                      {product.category || "—"}
                    </TableCell>
                    <TableCell className="max-w-[220px] whitespace-normal">
                      <div className="space-y-2">
                        <p
                          className="line-clamp-3 text-xs text-muted-foreground"
                          title={formatPetFoodAttributeSummary(product)}
                        >
                          {formatPetFoodAttributeSummary(product) || "—"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {formatMoney(
                        product.amazonCurrentPrice,
                        product.currency,
                      )}
                    </TableCell>
                    <TableCell className="tabular-nums text-muted-foreground line-through">
                      {formatMoney(
                        product.amazonOriginalPrice,
                        product.currency,
                      )}
                    </TableCell>
                    <TableCell>{discountLabel(product)}</TableCell>
                    <TableCell>
                      {product.rating?.trim()
                        ? Number.parseFloat(product.rating).toFixed(1)
                        : "—"}
                    </TableCell>
                    <TableCell>{formatCount(product.totalReviews)}</TableCell>
                    <TableCell>
                      <ImageList
                        urls={product.imageUrls}
                        title={product.name}
                      />
                    </TableCell>
                    <TableCell className="max-w-[280px]">
                      <p
                        className="truncate text-muted-foreground"
                        title={product.shortDescription}
                      >
                        {product.shortDescription || "—"}
                      </p>
                    </TableCell>
                    <TableCell>
                      {product.amazonSourceUrl ? (
                        <a
                          href={product.amazonSourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary underline-offset-2 hover:underline"
                        >
                          Open
                        </a>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={saveSuccessOpen} onOpenChange={handleSaveSuccessClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-emerald-600" />
              Products saved
            </DialogTitle>
            <DialogDescription>{saveSuccessMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              render={<Link href="/admin/products" />}
            >
              View products
            </Button>
            <Button onClick={() => handleSaveSuccessClose(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ImageList({ urls, title }: { urls: string[]; title: string }) {
  if (!urls?.length) return <span className="text-muted-foreground">—</span>;

  return (
    <div className="flex max-w-[220px] flex-col gap-1">
      <p className="text-[11px] text-muted-foreground">{urls.length} images</p>
      <div className="flex flex-wrap gap-1">
        {urls.map((url) => (
          <a key={url} href={url} target="_blank" rel="noreferrer" title={title}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt=""
              referrerPolicy="no-referrer"
              className="size-10 rounded border bg-muted object-contain"
            />
          </a>
        ))}
      </div>
    </div>
  );
}

function ProductThumb({
  title,
  imageUrl,
}: {
  title: string;
  imageUrl: string;
}) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt=""
        referrerPolicy="no-referrer"
        className="size-12 shrink-0 rounded-md border bg-muted object-contain"
      />
    );
  }

  const initial = title?.trim().charAt(0).toUpperCase() || "?";
  return (
    <div
      className="flex size-12 shrink-0 items-center justify-center rounded-md border bg-muted font-bold text-muted-foreground"
      aria-hidden="true"
    >
      {initial}
    </div>
  );
}
