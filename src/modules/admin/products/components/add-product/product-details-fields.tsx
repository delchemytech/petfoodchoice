"use client";

import { Input } from "@/modules/common/ui/input";
import { Label } from "@/modules/common/ui/label";
import { Textarea } from "@/modules/common/ui/textarea";
import { FormMessage } from "@/modules/common/ui/form-message";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/modules/common/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/modules/common/ui/card";
import { cn } from "@/modules/common/utils";
import type { AddProductFormValues } from "../../types/add-product";
import {
  ADD_PRODUCT_STATUSES,
  AFFILIATE_STORES,
  CURRENCIES,
} from "../../types/add-product";
import { ProductImagePreview } from "./product-image-preview";

interface ProductDetailsFieldsProps {
  values: AddProductFormValues;
  categories: string[];
  errors?: Partial<Record<keyof AddProductFormValues, string>>;
  onChange: <K extends keyof AddProductFormValues>(
    key: K,
    value: AddProductFormValues[K],
  ) => void;
}

function fieldClassName(hasError: boolean) {
  return cn(hasError && "border-destructive");
}

export function ProductDetailsFields({
  values,
  categories,
  errors,
  onChange,
}: ProductDetailsFieldsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <ProductImagePreview
          imageUrls={values.imageUrls}
          productName={values.name}
          error={errors?.imageUrls ?? errors?.imageUrl}
          onImageUrlsChange={(urls) => {
            onChange("imageUrls", urls);
            onChange("imageUrl", urls[0] ?? "");
          }}
        />
      </div>

      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
            <CardDescription>
              Review and edit the fetched product details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="affiliateUrl">Affiliate Product URL</Label>
              <Input
                id="affiliateUrl"
                type="url"
                value={values.affiliateUrl}
                readOnly
                className="bg-muted/50"
                aria-invalid={Boolean(errors?.affiliateUrl)}
              />
              <FormMessage message={errors?.affiliateUrl} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={values.name}
                  onChange={(event) => onChange("name", event.target.value)}
                  aria-invalid={Boolean(errors?.name)}
                  className={fieldClassName(Boolean(errors?.name))}
                />
                <FormMessage message={errors?.name} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={values.brand}
                  onChange={(event) => onChange("brand", event.target.value)}
                  aria-invalid={Boolean(errors?.brand)}
                  className={fieldClassName(Boolean(errors?.brand))}
                />
                <FormMessage message={errors?.brand} />
              </div>

              <div className="space-y-2">
                <Label>Store</Label>
                <Select
                  value={values.store}
                  onValueChange={(value) => {
                    if (value) onChange("store", value as AddProductFormValues["store"]);
                  }}
                >
                  <SelectTrigger
                    className={cn("w-full", fieldClassName(Boolean(errors?.store)))}
                    aria-invalid={Boolean(errors?.store)}
                  >
                    <SelectValue placeholder="Select store" />
                  </SelectTrigger>
                  <SelectContent>
                    {AFFILIATE_STORES.map((store) => (
                      <SelectItem key={store} value={store}>
                        {store}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage message={errors?.store} />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={values.category || null}
                  onValueChange={(value) => {
                    if (value) onChange("category", value);
                  }}
                >
                  <SelectTrigger
                    className={cn("w-full", fieldClassName(Boolean(errors?.category)))}
                    aria-invalid={Boolean(errors?.category)}
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage message={errors?.category} />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={values.status}
                  onValueChange={(value) => {
                    if (value) {
                      onChange("status", value as AddProductFormValues["status"]);
                    }
                  }}
                >
                  <SelectTrigger
                    className={cn("w-full", fieldClassName(Boolean(errors?.status)))}
                    aria-invalid={Boolean(errors?.status)}
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {ADD_PRODUCT_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status === "active" ? "Active" : "Inactive"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage message={errors?.status} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pricing & Ratings</CardTitle>
            <CardDescription>
              Price details and customer ratings from the store.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="currentPrice">Current Price</Label>
                <Input
                  id="currentPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={values.currentPrice}
                  onChange={(event) =>
                    onChange("currentPrice", event.target.value)
                  }
                  aria-invalid={Boolean(errors?.currentPrice)}
                  className={fieldClassName(Boolean(errors?.currentPrice))}
                />
                <FormMessage message={errors?.currentPrice} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="originalPrice">Original Price</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={values.originalPrice}
                  onChange={(event) =>
                    onChange("originalPrice", event.target.value)
                  }
                  aria-invalid={Boolean(errors?.originalPrice)}
                  className={fieldClassName(Boolean(errors?.originalPrice))}
                />
                <FormMessage message={errors?.originalPrice} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountPercentage">Discount Percentage</Label>
                <Input
                  id="discountPercentage"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={values.discountPercentage}
                  onChange={(event) =>
                    onChange("discountPercentage", event.target.value)
                  }
                  aria-invalid={Boolean(errors?.discountPercentage)}
                  className={fieldClassName(Boolean(errors?.discountPercentage))}
                />
                <FormMessage message={errors?.discountPercentage} />
              </div>

              <div className="space-y-2">
                <Label>Currency</Label>
                <Select
                  value={values.currency}
                  onValueChange={(value) => {
                    if (value) onChange("currency", value);
                  }}
                >
                  <SelectTrigger
                    className={cn("w-full", fieldClassName(Boolean(errors?.currency)))}
                    aria-invalid={Boolean(errors?.currency)}
                  >
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage message={errors?.currency} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rating">Rating</Label>
                <Input
                  id="rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={values.rating}
                  onChange={(event) => onChange("rating", event.target.value)}
                  aria-invalid={Boolean(errors?.rating)}
                  className={fieldClassName(Boolean(errors?.rating))}
                />
                <FormMessage message={errors?.rating} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalReviews">Total Reviews</Label>
                <Input
                  id="totalReviews"
                  type="number"
                  min="0"
                  value={values.totalReviews}
                  onChange={(event) =>
                    onChange("totalReviews", event.target.value)
                  }
                  aria-invalid={Boolean(errors?.totalReviews)}
                  className={fieldClassName(Boolean(errors?.totalReviews))}
                />
                <FormMessage message={errors?.totalReviews} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Short Description</CardTitle>
            <CardDescription>
              A brief summary displayed on product cards and listings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Textarea
              id="shortDescription"
              value={values.shortDescription}
              onChange={(event) =>
                onChange("shortDescription", event.target.value)
              }
              rows={4}
              aria-invalid={Boolean(errors?.shortDescription)}
              className={fieldClassName(Boolean(errors?.shortDescription))}
            />
            <FormMessage message={errors?.shortDescription} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
