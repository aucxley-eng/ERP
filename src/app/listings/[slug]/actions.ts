"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { inquirySchema } from "@/lib/validation";
import { viewingRequestSchema } from "@/lib/crm-validation";
import { notify, logActivity } from "@/lib/notifications";

type InquiryState = { ok: boolean; error?: string };

export async function createInquiry(
  _prev: InquiryState,
  formData: FormData,
): Promise<InquiryState> {
  const raw = {
    propertyId: String(formData.get("propertyId") ?? ""),
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    message: String(formData.get("message") ?? ""),
  };

  const parsed = inquirySchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const session = await auth();

  const property = await prisma.property.findFirst({
    where: { id: parsed.data.propertyId, status: "PUBLISHED" },
    select: { id: true, agentId: true, slug: true, title: true },
  });
  if (!property) return { ok: false, error: "Property not found" };

  const inquiry = await prisma.inquiry.create({
    data: {
      propertyId: property.id,
      agentId: property.agentId,
      senderId: session?.user?.id ?? null,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      message: parsed.data.message,
    },
  });

  // Every enquiry becomes a lead in the agent's pipeline (source-tagged).
  const lead = await prisma.lead.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      notes: parsed.data.message,
      source: "WEBSITE_ENQUIRY",
      stage: "NEW",
      agentId: property.agentId,
      propertyId: property.id,
      inquiryId: inquiry.id,
    },
  });

  await Promise.all([
    notify(property.agentId, {
      title: "New enquiry",
      body: `${parsed.data.name} enquired about "${property.title}"`,
      link: `/dashboard/leads/${lead.id}`,
    }),
    logActivity({
      action: "Lead created",
      detail: `Enquiry from ${parsed.data.name}`,
      leadId: lead.id,
      actorId: session?.user?.id ?? undefined,
    }),
  ]);

  revalidatePath(`/listings/${property.slug}`);
  return { ok: true };
}

const viewingFormSchema = viewingRequestSchema.extend({
  propertyId: z.string().min(1),
});

export async function requestViewing(
  _prev: InquiryState,
  formData: FormData,
): Promise<InquiryState> {
  const raw = {
    propertyId: String(formData.get("propertyId") ?? ""),
    scheduledFor: String(formData.get("scheduledFor") ?? ""),
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  };

  const parsed = viewingFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const session = await auth();

  const property = await prisma.property.findFirst({
    where: { id: parsed.data.propertyId, status: "PUBLISHED" },
    select: { id: true, agentId: true, slug: true, title: true },
  });
  if (!property) return { ok: false, error: "Property not found" };

  // Availability: no other active viewing for this agent within the slot.
  const slotEnd = new Date(parsed.data.scheduledFor.getTime() + 60 * 60 * 1000);
  const clash = await prisma.viewing.findFirst({
    where: {
      agentId: property.agentId,
      status: { in: ["REQUESTED", "CONFIRMED", "RESCHEDULED"] },
      scheduledFor: {
        lt: slotEnd,
        gte: new Date(parsed.data.scheduledFor.getTime() - 60 * 60 * 1000),
      },
    },
    select: { id: true },
  });
  if (clash) {
    return { ok: false, error: "That time is already booked. Please pick another slot." };
  }

  // Find or create the lead for this buyer/property so the viewing links up.
  let lead = await prisma.lead.findFirst({
    where: {
      agentId: property.agentId,
      propertyId: property.id,
      email: parsed.data.email,
    },
    select: { id: true, stage: true },
  });
  if (!lead) {
    lead = await prisma.lead.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        source: "VIEWING_REQUEST",
        stage: "VIEWING",
        agentId: property.agentId,
        propertyId: property.id,
      },
      select: { id: true, stage: true },
    });
  } else if (lead.stage === "NEW" || lead.stage === "QUALIFYING") {
    await prisma.lead.update({ where: { id: lead.id }, data: { stage: "VIEWING" } });
  }

  await prisma.viewing.create({
    data: {
      propertyId: property.id,
      agentId: property.agentId,
      buyerId: session?.user?.id ?? null,
      leadId: lead.id,
      scheduledFor: parsed.data.scheduledFor,
      notes: parsed.data.notes || null,
      status: "REQUESTED",
    },
  });

  await Promise.all([
    notify(property.agentId, {
      title: "New viewing request",
      body: `${parsed.data.name} requested a viewing of "${property.title}"`,
      link: `/dashboard/viewings`,
    }),
    logActivity({
      action: "Viewing requested",
      detail: `${parsed.data.name} for ${parsed.data.scheduledFor.toISOString()}`,
      leadId: lead.id,
      actorId: session?.user?.id ?? undefined,
    }),
  ]);

  revalidatePath(`/listings/${property.slug}`);
  revalidatePath("/dashboard/viewings");
  return { ok: true };
}

const favoriteSchema = z.object({
  propertyId: z.string().min(1),
});

export async function toggleFavorite(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return;

  const parsed = favoriteSchema.safeParse({
    propertyId: String(formData.get("propertyId") ?? ""),
  });
  if (!parsed.success) return;

  const property = await prisma.property.findFirst({
    where: { id: parsed.data.propertyId, status: "PUBLISHED" },
    select: { id: true },
  });
  if (!property) return;

  const existing = await prisma.favorite.findUnique({
    where: {
      userId_propertyId: {
        userId: session.user.id,
        propertyId: property.id,
      },
    },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
  } else {
    await prisma.favorite.create({
      data: { userId: session.user.id, propertyId: property.id },
    });
  }
}
