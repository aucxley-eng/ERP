"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");
  return session.user;
}

export async function setListingStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const allowed = ["PUBLISHED", "REJECTED", "PENDING", "SOLD", "RENTED", "DRAFT"];
  if (!allowed.includes(status)) return;

  await prisma.property.update({
    where: { id },
    data: {
      status: status as never,
      publishedAt: status === "PUBLISHED" ? new Date() : undefined,
    },
  });
  revalidatePath("/admin/listings");
  revalidatePath("/listings");
}

export async function setFeatured(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const featured = formData.get("featured") === "1";
  await prisma.property.update({ where: { id }, data: { featured } });
  revalidatePath("/admin/listings");
  revalidatePath("/");
}

export async function setUserRole(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const role = String(formData.get("role") ?? "");
  if (!["BUYER", "AGENT", "ADMIN"].includes(role)) return;
  await prisma.user.update({ where: { id }, data: { role: role as never } });
  revalidatePath("/admin/users");
}
