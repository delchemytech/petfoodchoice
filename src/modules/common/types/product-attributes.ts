export interface ProductAttributes {
  petType: string | null;
  lifeStage: string | null;
  breedSize: string | null;
  foodType: string | null;
  flavor: string | null;
  packWeight: number | null;
  packWeightUnit: string | null;
  packCount: number | null;
}

export const EMPTY_PRODUCT_ATTRIBUTES: ProductAttributes = {
  petType: null,
  lifeStage: null,
  breedSize: null,
  foodType: null,
  flavor: null,
  packWeight: null,
  packWeightUnit: null,
  packCount: null,
};

export type ProductAttributeRow = {
  pet_type?: string | null;
  life_stage?: string | null;
  breed_size?: string | null;
  food_type?: string | null;
  flavor?: string | null;
  pack_weight?: number | string | null;
  pack_weight_unit?: string | null;
  pack_count?: number | string | null;
};

export type ProductAttributeInsert = {
  pet_type?: string | null;
  life_stage?: string | null;
  breed_size?: string | null;
  food_type?: string | null;
  flavor?: string | null;
  pack_weight?: number | null;
  pack_weight_unit?: string | null;
  pack_count?: number | null;
};

export function mapProductAttributesFromRow(
  row: ProductAttributeRow,
): ProductAttributes {
  return {
    petType: row.pet_type?.trim() || null,
    lifeStage: row.life_stage?.trim() || null,
    breedSize: row.breed_size?.trim() || null,
    foodType: row.food_type?.trim() || null,
    flavor: row.flavor?.trim() || null,
    packWeight: toNullableNumber(row.pack_weight),
    packWeightUnit: row.pack_weight_unit?.trim() || null,
    packCount: toNullableInteger(row.pack_count),
  };
}

function toNullableNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function toNullableInteger(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isNaN(parsed) ? null : parsed;
}

export function mapFormValuesToProductAttributes(values: {
  petType: string;
  lifeStage: string;
  breedSize: string;
  foodType: string;
  flavor: string;
  packWeight: string;
  packWeightUnit: string;
  packCount: string;
}): Partial<ProductAttributes> {
  const packWeight = values.packWeight.trim()
    ? Number.parseFloat(values.packWeight)
    : null;
  const packCount = values.packCount.trim()
    ? Number.parseInt(values.packCount, 10)
    : null;

  return {
    petType: values.petType.trim() || null,
    lifeStage: values.lifeStage.trim() || null,
    breedSize: values.breedSize.trim() || null,
    foodType: values.foodType.trim() || null,
    flavor: values.flavor.trim() || null,
    packWeight:
      packWeight !== null && !Number.isNaN(packWeight) ? packWeight : null,
    packWeightUnit: values.packWeightUnit.trim() || null,
    packCount:
      packCount !== null && !Number.isNaN(packCount) ? packCount : null,
  };
}

export function mapProductAttributesToInsert(
  attributes: Partial<ProductAttributes>,
): ProductAttributeInsert {
  const payload: ProductAttributeInsert = {};

  if (attributes.petType?.trim()) {
    payload.pet_type = attributes.petType.trim();
  }
  if (attributes.lifeStage?.trim()) {
    payload.life_stage = attributes.lifeStage.trim();
  }
  if (attributes.breedSize?.trim()) {
    payload.breed_size = attributes.breedSize.trim();
  }
  if (attributes.foodType?.trim()) {
    payload.food_type = attributes.foodType.trim();
  }
  if (attributes.flavor?.trim()) {
    payload.flavor = attributes.flavor.trim();
  }
  if (
    attributes.packWeight !== null &&
    attributes.packWeight !== undefined &&
    !Number.isNaN(attributes.packWeight)
  ) {
    payload.pack_weight = attributes.packWeight;
  }
  if (attributes.packWeightUnit?.trim()) {
    payload.pack_weight_unit = attributes.packWeightUnit.trim();
  }
  if (
    attributes.packCount !== null &&
    attributes.packCount !== undefined &&
    !Number.isNaN(attributes.packCount)
  ) {
    payload.pack_count = attributes.packCount;
  }

  return payload;
}
