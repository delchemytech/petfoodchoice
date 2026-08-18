import { z } from "zod";
import { MAX_PRODUCT_IMAGES } from "@/modules/common/lib/product-images";
import {
  assertAmazonIndiaUrl,
  isAmazonIndiaHost,
} from "./amazon-affiliate";
import {
  assertFlipkartUrl,
  isFlipkartHost,
} from "./flipkart-affiliate";
import {
  ADD_PRODUCT_STATUSES,
  CURRENCIES,
  type AddProductFormValues,
} from "../types/add-product";

export const productSlugSchema = z
  .string()
  .trim()
  .min(1, "URL slug is required.")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use lowercase letters, numbers, and hyphens only (e.g. royal-canin-adult).",
  );

export function slugifyProductName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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

export const flipkartProductUrlSchema = z.object({
  productUrl: z
    .string()
    .trim()
    .min(1, "Flipkart product URL is required.")
    .refine(isValidUrl, "Enter a valid Flipkart URL.")
    .refine((value) => {
      try {
        assertFlipkartUrl(value);
        return true;
      } catch {
        return false;
      }
    }, "Only flipkart.com or www.flipkart.com product URLs are allowed."),
});

export function createProductFormSchema(allowedCategories: string[]) {
  return z
    .object({
      amazonSourceUrl: z
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
      amazonAffiliateUrl: z
        .string()
        .trim()
        .min(1, "Amazon affiliate URL is required.")
        .refine(isValidUrl, "Enter a valid Amazon affiliate URL.")
        .refine((value) => {
          try {
            const hostname = new URL(value).hostname.toLowerCase();
            return isAmazonIndiaHost(hostname);
          } catch {
            return false;
          }
        }, "Amazon affiliate URL must use amazon.in or www.amazon.in."),
      amazonCurrentPrice: z
        .string()
        .trim()
        .min(1, "Amazon current price is required.")
        .refine((value) => {
          const parsed = Number.parseFloat(value);
          return !Number.isNaN(parsed) && parsed >= 0;
        }, "Enter a valid Amazon current price."),
      amazonOriginalPrice: optionalNumberField({
        min: 0,
        label: "Amazon original price",
      }),
      flipkartSourceUrl: z.string(),
      flipkartAffiliateUrl: z.string(),
      flipkartCurrentPrice: optionalNumberField({
        min: 0,
        label: "Flipkart current price",
      }),
      flipkartOriginalPrice: optionalNumberField({
        min: 0,
        label: "Flipkart original price",
      }),
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
      slug: productSlugSchema,
      brand: z
        .string()
        .max(100, "Brand must be 100 characters or less."),
      category: z
        .string()
        .trim()
        .min(1, "Please select a category.")
        .refine(
          (value) => allowedCategories.includes(value),
          "Please select a valid category.",
        ),
      amazonDiscountPercentage: optionalNumberField({
        min: 0,
        max: 100,
        label: "Amazon discount percentage",
      }),
      flipkartDiscountPercentage: optionalNumberField({
        min: 0,
        max: 100,
        label: "Flipkart discount percentage",
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
        max: 2_147_483_647,
        integer: true,
        label: "review count",
      }),
      shortDescription: z.string(),
      petType: z.string(),
      lifeStage: z.string(),
      breedSize: z.string(),
      foodType: z.string(),
      flavor: z.string().max(80, "Flavor must be 80 characters or less."),
      packWeight: optionalNumberField({
        min: 0,
        label: "pack weight",
      }),
      packWeightUnit: z.string().max(10),
      packCount: optionalNumberField({
        min: 1,
        integer: true,
        label: "pack count",
      }),
      status: z.enum(ADD_PRODUCT_STATUSES, {
        message: "Select a status.",
      }),
    })
    .superRefine((values, ctx) => {
      const hasFlipkartUrl = values.flipkartSourceUrl.trim().length > 0;

      if (!hasFlipkartUrl) {
        return;
      }

      if (!isValidUrl(values.flipkartSourceUrl.trim())) {
        ctx.addIssue({
          code: "custom",
          message: "Enter a valid Flipkart URL.",
          path: ["flipkartSourceUrl"],
        });
      } else {
        try {
          assertFlipkartUrl(values.flipkartSourceUrl);
        } catch {
          ctx.addIssue({
            code: "custom",
            message:
              "Only flipkart.com or www.flipkart.com product URLs are allowed.",
            path: ["flipkartSourceUrl"],
          });
        }
      }

      if (!values.flipkartAffiliateUrl.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Flipkart affiliate URL is required.",
          path: ["flipkartAffiliateUrl"],
        });
      } else if (!isValidUrl(values.flipkartAffiliateUrl.trim())) {
        ctx.addIssue({
          code: "custom",
          message: "Enter a valid Flipkart affiliate URL.",
          path: ["flipkartAffiliateUrl"],
        });
      } else {
        try {
          const hostname = new URL(values.flipkartAffiliateUrl).hostname.toLowerCase();
          if (!isFlipkartHost(hostname)) {
            ctx.addIssue({
              code: "custom",
              message: "Flipkart affiliate URL must use flipkart.com.",
              path: ["flipkartAffiliateUrl"],
            });
          }
        } catch {
          ctx.addIssue({
            code: "custom",
            message: "Enter a valid Flipkart affiliate URL.",
            path: ["flipkartAffiliateUrl"],
          });
        }
      }

      if (!values.flipkartCurrentPrice.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Flipkart current price is required when a Flipkart URL is provided.",
          path: ["flipkartCurrentPrice"],
        });
      }
    }) satisfies z.ZodType<AddProductFormValues>;
}

function normalizeProductFormValues(values: AddProductFormValues) {
  const name = values.name.trim();
  const slug =
    values.slug.trim().toLowerCase() ||
    slugifyProductName(name) ||
    "product";

  return {
    ...values,
    name,
    slug,
  };
}

export function parseProductFormValues(
  values: AddProductFormValues,
  allowedCategories: string[],
) {
  return createProductFormSchema(allowedCategories).safeParse(
    normalizeProductFormValues(values),
  );
}
