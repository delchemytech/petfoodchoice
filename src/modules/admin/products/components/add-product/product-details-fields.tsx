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

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={values.slug}
                  onChange={(event) =>
                    onChange("slug", event.target.value.toLowerCase())
                  }
                  placeholder="product-slug"
                  aria-invalid={Boolean(errors?.slug)}
                  className={fieldClassName(Boolean(errors?.slug))}
                />
                <p className="text-xs text-muted-foreground">
                  Storefront URL: /products/{values.slug.trim() || "product-slug"}
                </p>
                <FormMessage message={errors?.slug} />
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
            <CardTitle>Amazon</CardTitle>
            <CardDescription>
              Amazon product and affiliate links shown on the shop.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amazonSourceUrl">Amazon Product URL</Label>
              <Input
                id="amazonSourceUrl"
                type="url"
                value={values.amazonSourceUrl}
                readOnly
                className="bg-muted/50"
                aria-invalid={Boolean(errors?.amazonSourceUrl)}
              />
              <FormMessage message={errors?.amazonSourceUrl} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amazonAffiliateUrl">Amazon Affiliate URL</Label>
              <Input
                id="amazonAffiliateUrl"
                type="url"
                value={values.amazonAffiliateUrl}
                onChange={(event) =>
                  onChange("amazonAffiliateUrl", event.target.value)
                }
                className={fieldClassName(Boolean(errors?.amazonAffiliateUrl))}
                aria-invalid={Boolean(errors?.amazonAffiliateUrl)}
              />
              <p className="text-xs text-muted-foreground">
                Generated with tag petfoodchoice-21. Edit manually if needed.
              </p>
              <FormMessage message={errors?.amazonAffiliateUrl} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="amazonCurrentPrice">Amazon Current Price</Label>
                <Input
                  id="amazonCurrentPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={values.amazonCurrentPrice}
                  onChange={(event) =>
                    onChange("amazonCurrentPrice", event.target.value)
                  }
                  aria-invalid={Boolean(errors?.amazonCurrentPrice)}
                  className={fieldClassName(Boolean(errors?.amazonCurrentPrice))}
                />
                <FormMessage message={errors?.amazonCurrentPrice} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amazonOriginalPrice">Amazon Original Price</Label>
                <Input
                  id="amazonOriginalPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={values.amazonOriginalPrice}
                  onChange={(event) =>
                    onChange("amazonOriginalPrice", event.target.value)
                  }
                  aria-invalid={Boolean(errors?.amazonOriginalPrice)}
                  className={fieldClassName(Boolean(errors?.amazonOriginalPrice))}
                />
                <FormMessage message={errors?.amazonOriginalPrice} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amazonDiscountPercentage">
                  Amazon Discount %
                </Label>
                <Input
                  id="amazonDiscountPercentage"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={values.amazonDiscountPercentage}
                  onChange={(event) =>
                    onChange("amazonDiscountPercentage", event.target.value)
                  }
                  aria-invalid={Boolean(errors?.amazonDiscountPercentage)}
                  className={fieldClassName(
                    Boolean(errors?.amazonDiscountPercentage),
                  )}
                />
                <FormMessage message={errors?.amazonDiscountPercentage} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Flipkart</CardTitle>
            <CardDescription>
              Flipkart listing for price comparison and the Buy from Flipkart
              button.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="flipkartSourceUrl">Flipkart Product URL</Label>
              <Input
                id="flipkartSourceUrl"
                type="url"
                value={values.flipkartSourceUrl}
                onChange={(event) =>
                  onChange("flipkartSourceUrl", event.target.value)
                }
                className={fieldClassName(Boolean(errors?.flipkartSourceUrl))}
                aria-invalid={Boolean(errors?.flipkartSourceUrl)}
              />
              <FormMessage message={errors?.flipkartSourceUrl} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="flipkartAffiliateUrl">Flipkart Affiliate URL</Label>
              <Input
                id="flipkartAffiliateUrl"
                type="url"
                value={values.flipkartAffiliateUrl}
                onChange={(event) =>
                  onChange("flipkartAffiliateUrl", event.target.value)
                }
                className={fieldClassName(Boolean(errors?.flipkartAffiliateUrl))}
                aria-invalid={Boolean(errors?.flipkartAffiliateUrl)}
              />
              <FormMessage message={errors?.flipkartAffiliateUrl} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="flipkartCurrentPrice">Flipkart Current Price</Label>
                <Input
                  id="flipkartCurrentPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={values.flipkartCurrentPrice}
                  onChange={(event) =>
                    onChange("flipkartCurrentPrice", event.target.value)
                  }
                  aria-invalid={Boolean(errors?.flipkartCurrentPrice)}
                  className={fieldClassName(Boolean(errors?.flipkartCurrentPrice))}
                />
                <FormMessage message={errors?.flipkartCurrentPrice} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="flipkartOriginalPrice">Flipkart Original Price</Label>
                <Input
                  id="flipkartOriginalPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={values.flipkartOriginalPrice}
                  onChange={(event) =>
                    onChange("flipkartOriginalPrice", event.target.value)
                  }
                  aria-invalid={Boolean(errors?.flipkartOriginalPrice)}
                  className={fieldClassName(Boolean(errors?.flipkartOriginalPrice))}
                />
                <FormMessage message={errors?.flipkartOriginalPrice} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="flipkartDiscountPercentage">
                  Flipkart Discount %
                </Label>
                <Input
                  id="flipkartDiscountPercentage"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={values.flipkartDiscountPercentage}
                  onChange={(event) =>
                    onChange("flipkartDiscountPercentage", event.target.value)
                  }
                  aria-invalid={Boolean(errors?.flipkartDiscountPercentage)}
                  className={fieldClassName(
                    Boolean(errors?.flipkartDiscountPercentage),
                  )}
                />
                <FormMessage message={errors?.flipkartDiscountPercentage} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ratings & Currency</CardTitle>
            <CardDescription>
              Shared ratings from Amazon or Flipkart fetch and currency for all prices.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
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
