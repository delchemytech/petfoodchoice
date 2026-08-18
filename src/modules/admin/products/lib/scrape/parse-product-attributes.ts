import { load, type CheerioAPI } from "cheerio";
import {
  EMPTY_PRODUCT_ATTRIBUTES,
  type ProductAttributes,
} from "@/modules/common/types/product-attributes";
import { sanitizeText } from "./sanitize";

const FLAVOR_KEYWORDS = [
  "Chicken",
  "Lamb",
  "Fish",
  "Salmon",
  "Tuna",
  "Beef",
  "Turkey",
  "Duck",
  "Vegetarian",
  "Veg",
  "Ocean Fish",
  "Mackerel",
  "Sardine",
  "Milk",
  "Egg",
] as const;

const PET_TYPE_RULES = [
  { value: "Dog", pattern: /\bdog(?:s)?\b/i },
  { value: "Cat", pattern: /\bcat(?:s)?\b/i },
  { value: "Bird", pattern: /\bbird(?:s)?\b/i },
  { value: "Fish", pattern: /\bfish\b/i },
] as const;

const LIFE_STAGE_RULES = [
  { value: "Puppy", pattern: /\bpupp(?:y|ies)\b/i },
  { value: "Kitten", pattern: /\bkitten(?:s)?\b/i },
  { value: "Senior", pattern: /\bsenior\b/i },
  { value: "Adult", pattern: /\badult\b/i },
  { value: "Junior", pattern: /\bjunior\b/i },
] as const;

const BREED_SIZE_RULES = [
  { value: "Small", pattern: /\bsmall(?:\s+breed)?\b/i },
  { value: "Medium", pattern: /\bmedium(?:\s+breed)?\b/i },
  { value: "Large", pattern: /\blarge(?:\s+breed)?\b/i },
  { value: "Giant", pattern: /\bgiant(?:\s+breed)?\b/i },
  { value: "Mini", pattern: /\bmini(?:\s+breed)?\b/i },
] as const;

const FOOD_TYPE_RULES = [
  { value: "Dry", pattern: /\bdry(?:\s+food)?\b/i },
  { value: "Wet", pattern: /\bwet(?:\s+food)?\b/i },
  { value: "Gravy", pattern: /\bgravy\b/i },
  { value: "Treats", pattern: /\btreats?\b/i },
  { value: "Supplements", pattern: /\bsupplements?\b/i },
  { value: "Biscuits", pattern: /\bbiscuits?\b/i },
] as const;

function normalizeKey(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function collectDetailMap($: CheerioAPI): Map<string, string> {
  const details = new Map<string, string>();

  const addPair = (label: string, value: string) => {
    const key = normalizeKey(label);
    const text = sanitizeText(value, 200);
    if (!key || !text) return;
    if (!details.has(key)) {
      details.set(key, text);
    }
  };

  $("#productOverview_feature_div tr").each((_, row) => {
    const cells = $(row).find("td, th");
    if (cells.length >= 2) {
      addPair($(cells[0]).text(), $(cells[1]).text());
    }
  });

  $("#productDetails_detailBullets_sections1 tr, #detailBullets_feature_div tr").each(
    (_, row) => {
      const label = $(row).find("th").first().text();
      const value = $(row).find("td").first().text();
      addPair(label, value);
    },
  );

  $("#detailBullets_feature_div li").each((_, item) => {
    const text = sanitizeText($(item).text());
    const match = text.match(/^([^:]+):\s*(.+)$/);
    if (match?.[1] && match[2]) {
      addPair(match[1], match[2]);
    }
  });

  return details;
}

function findDetailValue(details: Map<string, string>, patterns: RegExp[]) {
  for (const [key, value] of details.entries()) {
    if (patterns.some((pattern) => pattern.test(key))) {
      return value;
    }
  }
  return "";
}

function matchRule<T extends string>(
  text: string,
  rules: readonly { value: T; pattern: RegExp }[],
): T | null {
  for (const rule of rules) {
    if (rule.pattern.test(text)) {
      return rule.value;
    }
  }
  return null;
}

function parseFlavor(text: string, details: Map<string, string>) {
  const detailFlavor =
    findDetailValue(details, [/flavou?r/i, /taste/i]) ||
    findDetailValue(details, [/specialty/i]);

  if (detailFlavor) {
    const matched = FLAVOR_KEYWORDS.find((flavor) =>
      new RegExp(`\\b${flavor.replace(/\s+/g, "\\s+")}\\b`, "i").test(
        detailFlavor,
      ),
    );
    if (matched) return matched;
    return sanitizeText(detailFlavor, 80);
  }

  for (const flavor of FLAVOR_KEYWORDS) {
    if (
      new RegExp(`\\b${flavor.replace(/\s+/g, "\\s+")}\\b`, "i").test(text)
    ) {
      return flavor;
    }
  }

  return null;
}

function parsePackWeight(text: string, details: Map<string, string>) {
  const detailWeight =
    findDetailValue(details, [
      /item weight/i,
      /net quantity/i,
      /package weight/i,
      /weight/i,
    ]) || "";

  const source = `${text} ${detailWeight}`.trim();
  const match = source.match(
    /(\d+(?:\.\d+)?)\s*(kg|kilogram|kilograms|g|gram|grams|gm|ml|l|litre|liter)\b/i,
  );

  if (!match) return { packWeight: null, packWeightUnit: null };

  const amount = Number.parseFloat(match[1]);
  if (Number.isNaN(amount)) {
    return { packWeight: null, packWeightUnit: null };
  }

  const rawUnit = match[2].toLowerCase();
  let packWeight = amount;
  let packWeightUnit = "kg";

  if (rawUnit.startsWith("g")) {
    if (amount >= 1000) {
      packWeight = Number((amount / 1000).toFixed(3));
      packWeightUnit = "kg";
    } else {
      packWeight = amount;
      packWeightUnit = "g";
    }
  } else if (rawUnit === "ml" || rawUnit === "l" || rawUnit.startsWith("lit")) {
    packWeight = rawUnit === "ml" && amount >= 1000 ? amount / 1000 : amount;
    packWeightUnit = rawUnit === "ml" && amount < 1000 ? "ml" : "l";
  } else {
    packWeight = amount;
    packWeightUnit = "kg";
  }

  return { packWeight, packWeightUnit };
}

function parsePackCount(text: string, details: Map<string, string>) {
  const detailCount =
    findDetailValue(details, [/unit count/i, /number of items/i, /package quantity/i]) ||
    "";

  const source = `${text} ${detailCount}`;
  const match =
    source.match(/\bpack of\s*(\d+)\b/i) ||
    source.match(/\b(\d+)\s*(?:x|×)\s*\d+(?:\.\d+)?\s*(?:kg|g)\b/i) ||
    source.match(/\b(\d+)\s*pack\b/i);

  if (!match?.[1]) return null;
  const count = Number.parseInt(match[1], 10);
  return Number.isNaN(count) ? null : count;
}

function parsePetType(text: string, details: Map<string, string>) {
  const detailValue =
    findDetailValue(details, [/target species/i, /animal/i, /pet type/i]) || "";
  return (
    matchRule(detailValue, PET_TYPE_RULES) ||
    matchRule(text, PET_TYPE_RULES)
  );
}

function parseLifeStage(text: string, details: Map<string, string>) {
  const detailValue =
    findDetailValue(details, [/age range/i, /life stage/i, /age/i]) || "";
  return (
    matchRule(detailValue, LIFE_STAGE_RULES) ||
    matchRule(text, LIFE_STAGE_RULES)
  );
}

function parseBreedSize(text: string, details: Map<string, string>) {
  const detailValue =
    findDetailValue(details, [/breed recommendation/i, /breed size/i]) || "";
  return (
    matchRule(detailValue, BREED_SIZE_RULES) ||
    matchRule(text, BREED_SIZE_RULES)
  );
}

function parseFoodType(text: string, details: Map<string, string>) {
  const detailValue =
    findDetailValue(details, [/item form/i, /food type/i, /form/i]) || "";
  return (
    matchRule(detailValue, FOOD_TYPE_RULES) ||
    matchRule(text, FOOD_TYPE_RULES)
  );
}

export function parseAmazonProductAttributes(input: {
  title: string;
  description: string;
  breadcrumbs?: string;
  $?: CheerioAPI;
  html?: string;
}): ProductAttributes {
  const title = sanitizeText(input.title, 300);
  const description = sanitizeText(input.description, 4000);
  const breadcrumbs = sanitizeText(input.breadcrumbs ?? "", 500);
  const combined = `${title} ${breadcrumbs} ${description}`.trim();

  if (!combined) {
    return { ...EMPTY_PRODUCT_ATTRIBUTES };
  }

  let details = new Map<string, string>();
  if (input.$) {
    details = collectDetailMap(input.$);
  } else if (input.html) {
    details = collectDetailMap(load(input.html));
  }

  const { packWeight, packWeightUnit } = parsePackWeight(combined, details);

  return {
    petType: parsePetType(combined, details),
    lifeStage: parseLifeStage(combined, details),
    breedSize: parseBreedSize(combined, details),
    foodType: parseFoodType(combined, details),
    flavor: parseFlavor(combined, details),
    packWeight,
    packWeightUnit,
    packCount: parsePackCount(combined, details),
  };
}

export function productAttributesToFormFields(
  attributes: ProductAttributes,
): {
  petType: string;
  lifeStage: string;
  breedSize: string;
  foodType: string;
  flavor: string;
  packWeight: string;
  packWeightUnit: string;
  packCount: string;
} {
  return {
    petType: attributes.petType ?? "",
    lifeStage: attributes.lifeStage ?? "",
    breedSize: attributes.breedSize ?? "",
    foodType: attributes.foodType ?? "",
    flavor: attributes.flavor ?? "",
    packWeight:
      attributes.packWeight !== null ? String(attributes.packWeight) : "",
    packWeightUnit: attributes.packWeightUnit ?? "",
    packCount:
      attributes.packCount !== null ? String(attributes.packCount) : "",
  };
}
