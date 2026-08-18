import {
  AMAZON_ASSOCIATE_TAG,
  tryResolveAmazonProductUrls,
} from "@/modules/admin/products/lib/amazon-affiliate";
import { slugifyProductName } from "@/modules/admin/products/lib/product-form-schema";
import { calculateDiscount } from "@/modules/admin/products/lib/scrape/sanitize";
import {
  parseAmazonProductAttributes,
  productAttributesToFormFields,
} from "@/modules/admin/products/lib/scrape/parse-product-attributes";
import type { AddProductFormValues } from "@/modules/admin/products/types/add-product";
import { AMAZON_SEARCH } from "./amazon/config";
import type { BulkFetchedProduct } from "../types";

function emptyFormValues(): AddProductFormValues {
  return {
    amazonSourceUrl: "",
    amazonAffiliateUrl: "",
    amazonCurrentPrice: "",
    amazonOriginalPrice: "",
    amazonDiscountPercentage: "",
    flipkartSourceUrl: "",
    flipkartAffiliateUrl: "",
    flipkartCurrentPrice: "",
    flipkartOriginalPrice: "",
    flipkartDiscountPercentage: "",
    imageUrl: "",
    imageUrls: [],
    name: "",
    slug: "",
    brand: "",
    category: "",
    currency: "INR",
    rating: "",
    totalReviews: "",
    shortDescription: "",
    status: "active",
    ...productAttributesToFormFields(parseAmazonProductAttributes({
      title: "",
      description: "",
    })),
  };
}

function urlsForAsin(asin: string) {
  const fallback = `${AMAZON_SEARCH.origin}/dp/${asin}`;
  const resolved = tryResolveAmazonProductUrls(fallback);

  return {
    sourceUrl: resolved?.sourceUrl ?? fallback,
    affiliateUrl:
      resolved?.affiliateUrl ?? `${fallback}?tag=${AMAZON_ASSOCIATE_TAG}`,
  };
}

export function listingToBulkProduct(input: {
  asin: string;
  name: string;
  brand: string;
  price: string;
  originalPrice: string;
  rating: string;
  totalReviews: string;
  imageUrl: string;
  imageUrls: string[];
}): BulkFetchedProduct {
  const urls = urlsForAsin(input.asin);
  const name = input.name.trim();
  const attributeFields = productAttributesToFormFields(
    parseAmazonProductAttributes({ title: name, description: "" }),
  );

  return {
    ...emptyFormValues(),
    ...attributeFields,
    asin: input.asin,
    name,
    slug: slugifyProductName(name) || input.asin.toLowerCase(),
    brand: input.brand,
    amazonSourceUrl: urls.sourceUrl,
    amazonAffiliateUrl: urls.affiliateUrl,
    amazonCurrentPrice: input.price,
    amazonOriginalPrice: input.originalPrice,
    amazonDiscountPercentage: calculateDiscount(input.price, input.originalPrice),
    imageUrl: input.imageUrl,
    imageUrls: input.imageUrls,
    rating: input.rating,
    totalReviews: input.totalReviews,
  };
}

export function detailToBulkProduct(
  asin: string,
  detail: AddProductFormValues,
): BulkFetchedProduct {
  const urls = urlsForAsin(asin);

  return {
    ...emptyFormValues(),
    ...detail,
    asin,
    slug:
      detail.slug.trim() ||
      slugifyProductName(detail.name) ||
      asin.toLowerCase(),
    amazonSourceUrl: detail.amazonSourceUrl || urls.sourceUrl,
    amazonAffiliateUrl: detail.amazonAffiliateUrl || urls.affiliateUrl,
  };
}

export function mergeFetchedProduct(
  listing: BulkFetchedProduct,
  detail: BulkFetchedProduct | null,
): BulkFetchedProduct {
  if (!detail) return listing;

  return {
    ...listing,
    ...detail,
    asin: listing.asin,
    name: detail.name || listing.name,
    brand: detail.brand || listing.brand,
    category: detail.category || listing.category,
    slug: detail.slug || listing.slug,
    amazonSourceUrl: detail.amazonSourceUrl || listing.amazonSourceUrl,
    amazonAffiliateUrl: detail.amazonAffiliateUrl || listing.amazonAffiliateUrl,
    amazonCurrentPrice: detail.amazonCurrentPrice || listing.amazonCurrentPrice,
    amazonOriginalPrice:
      detail.amazonOriginalPrice || listing.amazonOriginalPrice,
    amazonDiscountPercentage:
      detail.amazonDiscountPercentage || listing.amazonDiscountPercentage,
    rating: detail.rating || listing.rating,
    totalReviews: detail.totalReviews || listing.totalReviews,
    imageUrl: detail.imageUrl || listing.imageUrl,
    imageUrls: detail.imageUrls.length > 0 ? detail.imageUrls : listing.imageUrls,
    shortDescription: detail.shortDescription || listing.shortDescription,
    currency: detail.currency || listing.currency,
    petType: detail.petType || listing.petType,
    lifeStage: detail.lifeStage || listing.lifeStage,
    breedSize: detail.breedSize || listing.breedSize,
    foodType: detail.foodType || listing.foodType,
    flavor: detail.flavor || listing.flavor,
    packWeight: detail.packWeight || listing.packWeight,
    packWeightUnit: detail.packWeightUnit || listing.packWeightUnit,
    packCount: detail.packCount || listing.packCount,
  };
}
