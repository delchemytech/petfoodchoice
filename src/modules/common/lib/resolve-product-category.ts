export function resolveProductCategory(
  category: string,
  allowedCategories: string[],
) {
  const trimmed = category.trim();
  if (!trimmed) return "";
  return allowedCategories.includes(trimmed) ? trimmed : "";
}
