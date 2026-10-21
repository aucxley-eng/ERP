import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

export type ListingFilters = {
  q?: string;
  listingType?: string;
  propertyType?: string;
  county?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  hasTitleDeed?: boolean;
};

export const PROPERTY_CARD_SELECT = {
  slug: true,
  title: true,
  listingType: true,
  propertyType: true,
  price: true,
  bedrooms: true,
  bathrooms: true,
  sizeSqft: true,
  sizeAcres: true,
  hasTitleDeed: true,
  featured: true,
  location: { select: { county: true, town: true } },
  images: { select: { url: true, alt: true }, orderBy: { position: "asc" }, take: 1 },
} satisfies Prisma.PropertySelect;

export function buildWhere(filters: ListingFilters): Prisma.PropertyWhereInput {
  const where: Prisma.PropertyWhereInput = { status: "PUBLISHED" };
  const and: Prisma.PropertyWhereInput[] = [];

  if (filters.q) {
    and.push({
      OR: [
        { title: { contains: filters.q, mode: "insensitive" } },
        { description: { contains: filters.q, mode: "insensitive" } },
        { location: { town: { contains: filters.q, mode: "insensitive" } } },
        { location: { county: { contains: filters.q, mode: "insensitive" } } },
      ],
    });
  }
  if (filters.listingType) where.listingType = filters.listingType as never;
  if (filters.propertyType) where.propertyType = filters.propertyType as never;
  if (filters.county) and.push({ location: { county: filters.county } });
  if (filters.minPrice || filters.maxPrice) {
    const price: Prisma.DecimalFilter = {};
    if (filters.minPrice) price.gte = filters.minPrice;
    if (filters.maxPrice) price.lte = filters.maxPrice;
    where.price = price;
  }
  if (filters.bedrooms) where.bedrooms = { gte: filters.bedrooms };
  if (filters.hasTitleDeed) where.hasTitleDeed = true;
  if (and.length) where.AND = and;

  return where;
}

export async function getPublishedProperties(
  filters: ListingFilters,
  page = 1,
  perPage = 12,
) {
  const where = buildWhere(filters);
  const [items, total] = await Promise.all([
    prisma.property.findMany({
      where,
      select: PROPERTY_CARD_SELECT,
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.property.count({ where }),
  ]);
  return { items, total, page, perPage, pages: Math.max(1, Math.ceil(total / perPage)) };
}
