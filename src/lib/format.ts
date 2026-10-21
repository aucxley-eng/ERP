export function formatPrice(value: number | string, listingType?: string) {
  const amount = typeof value === "string" ? Number(value) : value;
  const formatted = new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(amount);
  return listingType === "FOR_RENT" ? `${formatted}/mo` : formatted;
}

export function formatSize(sizeSqft?: number | null, sizeAcres?: number | null) {
  if (sizeAcres) return `${sizeAcres} acres`;
  if (sizeSqft) return `${new Intl.NumberFormat("en-KE").format(sizeSqft)} sqft`;
  return null;
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export function formatDateTime(value: Date | string) {
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export function formatDate(value: Date | string) {
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-KE", { dateStyle: "medium" }).format(d);
}
