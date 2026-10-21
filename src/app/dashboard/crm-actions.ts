"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { Scope } from "@/lib/crm";
import { leadStageSchema, leadUpdateSchema, viewingUpdateSchema } from "@/lib/crm-validation";
import { notify, logActivity } from "@/lib/notifications";

export type CrmState = { error?: string; ok?: boolean };

export async function requireAgentScope(): Promise<{ userId: string; scope: Scope }> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const role = session.user.role;
  if (role !== "AGENT" && role !== "ADMIN") redirect("/");
  return {
    userId: session.user.id,
    scope: role === "ADMIN" ? { admin: true } : { agentId: session.user.id },
  };
}

function ownsRow(row: { agentId: string }, userId: string, scope: Scope) {
  if ("admin" in scope) return true;
  return row.agentId === userId;
}

// ---------------------------------------------------------------------------
// Viewings
// ---------------------------------------------------------------------------

export async function updateViewing(
  _prev: CrmState,
  formData: FormData,
): Promise<CrmState> {
  const { userId, scope } = await requireAgentScope();

  const parsed = viewingUpdateSchema.safeParse({
    viewingId: String(formData.get("viewingId") ?? ""),
    status: String(formData.get("status") ?? ""),
    scheduledFor: String(formData.get("scheduledFor") ?? ""),
    agentNotes: String(formData.get("agentNotes") ?? ""),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const viewing = await prisma.viewing.findUnique({
    where: { id: parsed.data.viewingId },
    include: { property: { select: { title: true } } },
  });
  if (!viewing || !ownsRow(viewing, userId, scope)) {
    return { error: "Viewing not found" };
  }

  const data: {
    status: typeof parsed.data.status;
    agentNotes?: string | null;
    scheduledFor?: Date;
  } = { status: parsed.data.status };

  if (parsed.data.agentNotes) data.agentNotes = parsed.data.agentNotes;
  if (parsed.data.scheduledFor) {
    const when = new Date(parsed.data.scheduledFor);
    if (Number.isNaN(when.getTime())) return { error: "Invalid date" };

    // Availability check when moving/rescheduling the slot.
    const slotEnd = new Date(when.getTime() + 60 * 60 * 1000);
    const clash = await prisma.viewing.findFirst({
      where: {
        id: { not: viewing.id },
        agentId: viewing.agentId,
        status: { in: ["REQUESTED", "CONFIRMED", "RESCHEDULED"] },
        scheduledFor: {
          lt: slotEnd,
          gte: new Date(when.getTime() - 60 * 60 * 1000),
        },
      },
      select: { id: true },
    });
    if (clash) return { error: "Another viewing is already booked at that time" };
    data.scheduledFor = when;
  }

  await prisma.viewing.update({ where: { id: viewing.id }, data });

  await Promise.all([
    viewing.buyerId
      ? notify(viewing.buyerId, {
          title: `Viewing ${parsed.data.status.toLowerCase()}`,
          body: `Your viewing of "${viewing.property.title}" is now ${parsed.data.status.toLowerCase()}.`,
          link: `/account/viewings`,
        })
      : Promise.resolve(),
    viewing.leadId
      ? logActivity({
          action: `Viewing ${parsed.data.status.toLowerCase()}`,
          detail: viewing.property.title,
          leadId: viewing.leadId,
          actorId: userId,
        })
      : Promise.resolve(),
  ]);

  revalidatePath("/dashboard/viewings");
  if (viewing.leadId) revalidatePath(`/dashboard/leads/${viewing.leadId}`);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Leads
// ---------------------------------------------------------------------------

export async function updateLeadStage(
  _prev: CrmState,
  formData: FormData,
): Promise<CrmState> {
  const { userId, scope } = await requireAgentScope();

  const parsed = leadStageSchema.safeParse({
    leadId: String(formData.get("leadId") ?? ""),
    stage: String(formData.get("stage") ?? ""),
  });
  if (!parsed.success) return { error: "Invalid stage" };

  const lead = await prisma.lead.findUnique({ where: { id: parsed.data.leadId } });
  if (!lead || !ownsRow(lead, userId, scope)) return { error: "Lead not found" };

  await prisma.lead.update({
    where: { id: lead.id },
    data: { stage: parsed.data.stage },
  });
  await logActivity({
    action: "Stage changed",
    detail: `${lead.stage} → ${parsed.data.stage}`,
    leadId: lead.id,
    actorId: userId,
  });

  revalidatePath("/dashboard/leads");
  revalidatePath(`/dashboard/leads/${lead.id}`);
  return { ok: true };
}

export async function updateLead(
  _prev: CrmState,
  formData: FormData,
): Promise<CrmState> {
  const { userId, scope } = await requireAgentScope();

  const parsed = leadUpdateSchema.safeParse({
    notes: String(formData.get("notes") ?? ""),
    nextFollowUp: String(formData.get("nextFollowUp") ?? ""),
    budgetMin: formData.get("budgetMin") || undefined,
    budgetMax: formData.get("budgetMax") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const leadId = String(formData.get("leadId") ?? "");
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead || !ownsRow(lead, userId, scope)) return { error: "Lead not found" };

  await prisma.lead.update({
    where: { id: lead.id },
    data: {
      notes: parsed.data.notes || null,
      nextFollowUp: parsed.data.nextFollowUp ? new Date(parsed.data.nextFollowUp) : null,
      budgetMin: parsed.data.budgetMin ?? null,
      budgetMax: parsed.data.budgetMax ?? null,
    },
  });
  await logActivity({ action: "Lead updated", actorId: userId, leadId: lead.id });

  revalidatePath(`/dashboard/leads/${lead.id}`);
  revalidatePath("/dashboard/leads");
  return { ok: true };
}

export async function createLead(
  _prev: CrmState,
  formData: FormData,
): Promise<CrmState> {
  const { userId, scope } = await requireAgentScope();
  if ("admin" in scope) {
    // Admins may add leads but must attribute them to a real agent.
    return { error: "Switch to an agent account to add manual leads" };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  if (name.length < 2) return { error: "Name is required" };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "Valid email required" };

  const lead = await prisma.lead.create({
    data: {
      name,
      email,
      phone: phone || null,
      notes: notes || null,
      source: "OTHER",
      stage: "NEW",
      agentId: userId,
    },
  });
  await logActivity({ action: "Lead created", detail: "Manual entry", leadId: lead.id, actorId: userId });

  revalidatePath("/dashboard/leads");
  return { ok: true };
}

export async function deleteLead(formData: FormData) {
  const { userId, scope } = await requireAgentScope();
  const leadId = String(formData.get("leadId") ?? "");
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead || !ownsRow(lead, userId, scope)) return;
  await prisma.lead.delete({ where: { id: lead.id } });
  revalidatePath("/dashboard/leads");
  redirect("/dashboard/leads");
}
