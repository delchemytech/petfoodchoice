export const OTHERS_CATEGORY_NAME = "Others";

export function isOthersCategory(category: string) {
  return category.trim().toLowerCase() === OTHERS_CATEGORY_NAME.toLowerCase();
}

export function sortCategoryNames(categories: string[]): string[] {
  const seen = new Set<string>();
  const unique = categories.filter((category) => {
    const normalized = category.trim().toLowerCase();
    if (!normalized || seen.has(normalized)) {
      return false;
    }

    seen.add(normalized);
    return true;
  });

  return unique.sort((a, b) => {
    const aIsOthers = isOthersCategory(a);
    const bIsOthers = isOthersCategory(b);

    if (aIsOthers !== bIsOthers) {
      return aIsOthers ? 1 : -1;
    }

    return a.localeCompare(b, undefined, { sensitivity: "base" });
  });
}

export function sortCategories<T extends { name: string }>(categories: T[]): T[] {
  const seen = new Set<string>();
  const unique = categories.filter((category) => {
    const normalized = category.name.trim().toLowerCase();
    if (!normalized || seen.has(normalized)) {
      return false;
    }

    seen.add(normalized);
    return true;
  });

  return unique.sort((a, b) => {
    const aIsOthers = isOthersCategory(a.name);
    const bIsOthers = isOthersCategory(b.name);

    if (aIsOthers !== bIsOthers) {
      return aIsOthers ? 1 : -1;
    }

    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  });
}

export function matchesCategoryFilter(
  productCategory: string,
  filterCategory: string,
  knownCategories: string[],
) {
  if (isOthersCategory(filterCategory)) {
    const primaryCategories = knownCategories.filter(
      (category) => !isOthersCategory(category),
    );
    const normalizedProduct = productCategory.trim().toLowerCase();

    return !primaryCategories.some(
      (category) => category.trim().toLowerCase() === normalizedProduct,
    );
  }

  return (
    productCategory.trim().toLowerCase() === filterCategory.trim().toLowerCase()
  );
}
