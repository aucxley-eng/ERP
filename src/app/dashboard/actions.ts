"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { propertySchema } from "@/lib/validation";
import { slugify } from "@/lib/format";

export type ListingState = { error?: string };

async function requireAgent() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "AGENT" && session.user.role !== "ADMIN") {
    redirect("/");
  }
  return session.user;
}

async function upsertLocation(county: string, town: string) {
  const slug = slugify(`${county}-${town}`);
  return prisma.location.upsert({
    where: { slug },
    update: {},
    create: { county, town, slug },
  });
}

function parseListing(formData: FormData) {
  const parsed = propertySchema.safeParse({
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    listingType: String(formData.get("listingType") ?? ""),
    propertyType: String(formData.get("propertyType") ?? ""),
    price: String(formData.get("price") ?? ""),
    pricePeriod: String(formData.get("pricePeriod") ?? ""),
    bedrooms: formData.get("bedrooms") || undefined,
    bathrooms: formData.get("bathrooms") || undefined,
    sizeSqft: formData.get("sizeSqft") || undefined,
    sizeAcres: formData.get("sizeAcres") || undefined,
    hasTitleDeed: formData.get("hasTitleDeed") === "on",
    county: String(formData.get("county") ?? ""),
    town: String(formData.get("town") ?? ""),
    address: String(formData.get("address") ?? ""),
    amenities: String(formData.get("amenities") ?? ""),
  });
  return parsed;
}

export async function createListing(
  _prev: ListingState,
  formData: FormData,
): Promise<ListingState> {
  const user = await requireAgent();
  const parsed = parseListing(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const d = parsed.data;
  const location = await upsertLocation(d.county, d.town);
  const amenities = (d.amenities ?? "")
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);

  let slug = slugify(d.title);
  const clash = await prisma.property.findUnique({ where: { slug } });
  if (clash) slug = `${slug}-${Date.now().toString(36)}`;

  const property = await prisma.property.create({
    data: {
      slug,
      title: d.title,
      description: d.description,
      listingType: d.listingType as never,
      propertyType: d.propertyType as never,
      status: "PENDING",
      price: d.price,
      pricePeriod: d.pricePeriod || null,
      bedrooms: d.bedrooms ?? null,
      bathrooms: d.bathrooms ?? null,
      sizeSqft: d.sizeSqft ?? null,
      sizeAcres: d.sizeAcres ?? null,
      hasTitleDeed: d.hasTitleDeed,
      address: d.address || null,
      amenities,
      agentId: user.id,
      locationId: location.id,
    },
  });

  const images = formData.getAll("images").filter(Boolean) as string[];
  if (images.length) {
    await prisma.propertyImage.createMany({
      data: images.map((url, i) => ({ url, propertyId: property.id, position: i })),
    });
  }

  revalidatePath("/dashboard/listings");
  redirect("/dashboard/listings");
}

export async function updateListing(
  id: string,
  _prev: ListingState,
  formData: FormData,
): Promise<ListingState> {
  const user = await requireAgent();
  const property = await prisma.property.findUnique({ where: { id } });
  if (!property) return { error: "Listing not found" };
  if (property.agentId !== user.id && user.role !== "ADMIN") {
    return { error: "Not allowed" };
  }

  const parsed = parseListing(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const d = parsed.data;
  const location = await upsertLocation(d.county, d.town);
  const amenities = (d.amenities ?? "")
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);

  await prisma.property.update({
    where: { id },
    data: {
      title: d.title,
      description: d.description,
      listingType: d.listingType as never,
      propertyType: d.propertyType as never,
      price: d.price,
      pricePeriod: d.pricePeriod || null,
      bedrooms: d.bedrooms ?? null,
      bathrooms: d.bathrooms ?? null,
      sizeSqft: d.sizeSqft ?? null,
      sizeAcres: d.sizeAcres ?? null,
      hasTitleDeed: d.hasTitleDeed,
      address: d.address || null,
      amenities,
      locationId: location.id,
      status: "PENDING",
    },
  });

  const images = formData.getAll("images").filter(Boolean) as string[];
  if (images.length) {
    await prisma.propertyImage.deleteMany({ where: { propertyId: id } });
    await prisma.propertyImage.createMany({
      data: images.map((url, i) => ({ url, propertyId: id, position: i })),
    });
  }

  revalidatePath("/dashboard/listings");
  redirect("/dashboard/listings");
}

export async function deleteListing(formData: FormData) {
  const user = await requireAgent();
  const id = String(formData.get("id") ?? "");
  const property = await prisma.property.findUnique({ where: { id } });
  if (!property) return;
  if (property.agentId !== user.id && user.role !== "ADMIN") return;
  await prisma.property.delete({ where: { id } });
  revalidatePath("/dashboard/listings");
}
