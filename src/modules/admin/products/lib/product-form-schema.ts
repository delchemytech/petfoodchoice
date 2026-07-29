import { z } from "zod";
import { MAX_PRODUCT_IMAGES } from "@/modules/common/lib/product-images";
import {
  assertAmazonIndiaUrl,
  isAmazonIndiaHost,
} from "./amazon-affiliate";
import {
  ADD_PRODUCT_STATUSES,
  AFFILIATE_STORES,
  CURRENCIES,
  type AddProductFormValues,
} from "../types/add-product";

function isValidUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function optionalNumberField(options: {
  min?: number;
  max?: number;
  integer?: boolean;
  label: string;
}) {
  return z.string().refine(
    (value) => {
      const trimmed = value.trim();
      if (!trimmed) return true;

      const parsed = options.integer
        ? Number.parseInt(trimmed, 10)
        : Number.parseFloat(trimmed);

      if (Number.isNaN(parsed)) return false;
      if (options.min !== undefined && parsed < options.min) return false;
      if (options.max !== undefined && parsed > options.max) return false;
      if (options.integer && !Number.isInteger(parsed)) return false;

      return true;
    },
    {
      message: `Enter a valid ${options.label}.`,
    },
  );
}

export const amazonProductUrlSchema = z.object({
  productUrl: z
    .string()
    .trim()
    .min(1, "Amazon product URL is required.")
    .refine(isValidUrl, "Enter a valid Amazon India URL.")
    .refine((value) => {
      try {
        assertAmazonIndiaUrl(value);
        return true;
      } catch {
        return false;
      }
    }, "Only amazon.in or www.amazon.in URLs with a valid ASIN are allowed."),
});

export const affiliateUrlSchema = amazonProductUrlSchema;

export function createProductFormSchema(allowedCategories: string[]) {
  return z.object({
    sourceUrl: z
      .string()
      .trim()
      .min(1, "Amazon product URL is required.")
      .refine(isValidUrl, "Enter a valid Amazon India URL.")
      .refine((value) => {
        try {
          assertAmazonIndiaUrl(value);
          return true;
        } catch {
          return false;
        }
      }, "Only amazon.in or www.amazon.in URLs with a valid ASIN are allowed."),
    affiliateUrl: z
      .string()
      .trim()
      .min(1, "Affiliate URL is required.")
      .refine(isValidUrl, "Enter a valid affiliate URL.")
      .refine((value) => {
        try {
          const hostname = new URL(value).hostname.toLowerCase();
          return isAmazonIndiaHost(hostname);
        } catch {
          return false;
        }
      }, "Affiliate URL must use amazon.in or www.amazon.in."),
    imageUrl: z
      .string()
      .refine(
        (value) => !value.trim() || isValidUrl(value.trim()),
        "Enter a valid image URL.",
      ),
    imageUrls: z
      .array(
        z.string().refine(
          (value) => isValidUrl(value.trim()),
          "Enter valid image URLs.",
        ),
      )
      .max(
        MAX_PRODUCT_IMAGES,
        `Maximum ${MAX_PRODUCT_IMAGES} images allowed.`,
      ),
    name: z
      .string()
      .trim()
      .min(1, "Product name is required.")
      .max(200, "Product name must be 200 characters or less."),
    brand: z
      .string()
      .max(100, "Brand must be 100 characters or less."),
    store: z.enum(AFFILIATE_STORES, {
      message: "Select a store.",
    }),
    category: z
      .string()
      .trim()
      .min(1, "Please select a category.")
      .refine(
        (value) => allowedCategories.includes(value),
        "Please select a valid category.",
      ),
    currentPrice: z
      .string()
      .trim()
      .min(1, "Current price is required.")
      .refine((value) => {
        const parsed = Number.parseFloat(value);
        return !Number.isNaN(parsed) && parsed >= 0;
      }, "Enter a valid current price."),
    originalPrice: optionalNumberField({
      min: 0,
      label: "original price",
    }),
    discountPercentage: optionalNumberField({
      min: 0,
      max: 100,
      label: "discount percentage",
    }),
    currency: z.enum(CURRENCIES, {
      message: "Select a currency.",
    }),
    rating: optionalNumberField({
      min: 0,
      max: 5,
      label: "rating",
    }),
    totalReviews: optionalNumberField({
      min: 0,
      integer: true,
      label: "review count",
    }),
    shortDescription: z.string(),
    status: z.enum(ADD_PRODUCT_STATUSES, {
      message: "Select a status.",
    }),
  }) satisfies z.ZodType<AddProductFormValues>;
}

export function parseProductFormValues(
  values: AddProductFormValues,
  allowedCategories: string[],
) {
  return createProductFormSchema(allowedCategories).safeParse(values);
}
