export const productCategoryOptions = [
  { value: "oil_element", label: "Oil Element" },
  { value: "oil_spin_on", label: "Oil Spin On" },
  { value: "fuel_elements", label: "Fuel Elements" },
  { value: "fuel_spin_on", label: "Fuel Spin On" },
  { value: "air_cleaners", label: "Air Cleaners" },
] as const;

export type ProductCategoryKey = (typeof productCategoryOptions)[number]["value"];
export type FilterCategory = (typeof productCategoryOptions)[number]["label"];

export const productCategoryKeys = productCategoryOptions.map((option) => option.value) as [
  ProductCategoryKey,
  ...ProductCategoryKey[],
];

export const productCategoryLabels = Object.fromEntries(
  productCategoryOptions.map((option) => [option.value, option.label]),
) as Record<ProductCategoryKey, FilterCategory>;

export function normalizeProductCategoryKey(value: string): ProductCategoryKey {
  if (productCategoryOptions.some((option) => option.value === value)) return value as ProductCategoryKey;
  if (value === "oil") return "oil_spin_on";
  if (value === "fuel") return "fuel_spin_on";
  return "air_cleaners";
}
