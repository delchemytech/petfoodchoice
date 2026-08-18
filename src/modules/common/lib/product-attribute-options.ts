export const PET_TYPE_OPTIONS = ["Dog", "Cat", "Bird", "Fish"] as const;

export const LIFE_STAGE_OPTIONS = [
  "Puppy",
  "Kitten",
  "Junior",
  "Adult",
  "Senior",
] as const;

export const BREED_SIZE_OPTIONS = [
  "Mini",
  "Small",
  "Medium",
  "Large",
  "Giant",
] as const;

export const FOOD_TYPE_OPTIONS = [
  "Dry",
  "Wet",
  "Gravy",
  "Treats",
  "Biscuits",
  "Supplements",
] as const;

export const PACK_WEIGHT_UNIT_OPTIONS = ["kg", "g", "l", "ml"] as const;

export const FLAVOR_SUGGESTIONS = [
  "Chicken",
  "Lamb",
  "Fish",
  "Salmon",
  "Tuna",
  "Beef",
  "Turkey",
  "Duck",
  "Vegetarian",
  "Ocean Fish",
  "Mackerel",
  "Sardine",
  "Milk",
  "Egg",
] as const;

export const SELECT_NONE_VALUE = "__none__";

export function formatPetFoodAttributeSummary(product: {
  petType?: string;
  lifeStage?: string;
  breedSize?: string;
  foodType?: string;
  flavor?: string;
  packWeight?: string;
  packWeightUnit?: string;
  packCount?: string;
}): string {
  const parts: string[] = [];

  if (product.petType?.trim()) parts.push(product.petType.trim());
  if (product.lifeStage?.trim()) parts.push(product.lifeStage.trim());
  if (product.breedSize?.trim()) parts.push(product.breedSize.trim());
  if (product.foodType?.trim()) parts.push(product.foodType.trim());
  if (product.flavor?.trim()) parts.push(product.flavor.trim());

  if (product.packWeight?.trim()) {
    const unit = product.packWeightUnit?.trim() || "kg";
    parts.push(`${product.packWeight.trim()} ${unit}`);
  }

  const packCount = product.packCount?.trim();
  if (packCount && packCount !== "1") {
    parts.push(`${packCount} packs`);
  }

  return parts.join(" · ");
}

export function packWeightInKg(
  weight: number | null,
  unit: string | null,
): number | null {
  if (weight === null || Number.isNaN(weight)) return null;

  const normalizedUnit = (unit ?? "kg").toLowerCase();
  if (normalizedUnit === "kg") return weight;
  if (normalizedUnit === "g") return weight / 1000;
  return null;
}
