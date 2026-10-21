export const PROPERTY_TYPES = [
  { value: "RESIDENTIAL_LAND", label: "Residential Land" },
  { value: "COMMERCIAL_LAND", label: "Commercial Land" },
  { value: "AGRICULTURAL_LAND", label: "Agricultural Land" },
  { value: "HOUSE", label: "House" },
  { value: "APARTMENT", label: "Apartment" },
  { value: "TOWNHOUSE", label: "Townhouse" },
  { value: "VILLA", label: "Villa" },
  { value: "COMMERCIAL_BUILDING", label: "Commercial Building" },
  { value: "WAREHOUSE", label: "Warehouse" },
  { value: "OTHER", label: "Other" },
] as const;

export const LISTING_TYPES = [
  { value: "FOR_SALE", label: "For Sale" },
  { value: "FOR_RENT", label: "For Rent" },
] as const;

export const LISTING_STATUSES = [
  { value: "DRAFT", label: "Draft" },
  { value: "PENDING", label: "Pending Review" },
  { value: "PUBLISHED", label: "Published" },
  { value: "REJECTED", label: "Rejected" },
  { value: "SOLD", label: "Sold" },
  { value: "RENTED", label: "Rented" },
] as const;

export const COUNTIES = [
  "Nairobi",
  "Kiambu",
  "Machakos",
  "Kajiado",
  "Murang'a",
  "Nakuru",
  "Mombasa",
  "Kilifi",
  "Kwale",
  "Laikipia",
  "Narok",
  "Kisumu",
  "Uasin Gishu",
] as const;

export function propertyTypeLabel(value: string) {
  return PROPERTY_TYPES.find((t) => t.value === value)?.label ?? value;
}

export function listingTypeLabel(value: string) {
  return LISTING_TYPES.find((t) => t.value === value)?.label ?? value;
}

export function statusLabel(value: string) {
  return LISTING_STATUSES.find((s) => s.value === value)?.label ?? value;
}
