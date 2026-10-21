import { prisma } from "./prisma";
import type { LeadStage, ViewingStatus } from "@prisma/client";

// ---------------------------------------------------------------------------
// All functions here take an explicit agentId for AGENT scope, or null for
// ADMIN (global). The caller is responsible for deciding which via
// requireAgent()/requireAdmin(). Never expose these without that decision.
// ---------------------------------------------------------------------------

export type Scope = { agentId: string } | { admin: true };

function agentFilter(scope: Scope) {
  return "admin" in scope ? {} : { agentId: scope.agentId };
}

export async function getLeads(scope: Scope, opts?: { stage?: LeadStage }) {
  return prisma.lead.findMany({
    where: {
      ...agentFilter(scope),
      ...(opts?.stage ? { stage: opts.stage } : {}),
    },
    include: {
      property: { select: { slug: true, title: true } },
      _count: { select: { viewings: true } },
    },
    orderBy: [{ updatedAt: "desc" }],
  });
}

export async function getLeadPipeline(scope: Scope) {
  const leads = await prisma.lead.findMany({
    where: agentFilter(scope),
    include: {
      property: { select: { slug: true, title: true } },
      _count: { select: { viewings: true } },
    },
    orderBy: [{ updatedAt: "desc" }],
  });
  const stages: LeadStage[] = [
    "NEW",
    "QUALIFYING",
    "VIEWING",
    "OFFER",
    "WON",
    "LOST",
  ];
  return stages.map((stage) => ({
    stage,
    leads: leads.filter((l) => l.stage === stage),
  }));
}

export async function getLead(scope: Scope, leadId: string) {
  return prisma.lead.findFirst({
    where: { id: leadId, ...agentFilter(scope) },
    include: {
      property: { select: { slug: true, title: true } },
      viewings: { orderBy: { scheduledFor: "desc" } },
      activities: {
        include: { actor: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
      inquiry: { select: { message: true, createdAt: true } },
    },
  });
}

export async function getViewings(scope: Scope, opts?: { status?: ViewingStatus }) {
  return prisma.viewing.findMany({
    where: {
      ...agentFilter(scope),
      ...(opts?.status ? { status: opts.status } : {}),
    },
    include: {
      property: { select: { slug: true, title: true } },
      buyer: { select: { name: true, email: true, phone: true } },
      lead: { select: { id: true, stage: true } },
    },
    orderBy: [{ scheduledFor: "asc" }],
  });
}

export async function getUpcomingViewings(scope: Scope, from = new Date()) {
  return prisma.viewing.findMany({
    where: {
      ...agentFilter(scope),
      scheduledFor: { gte: from },
      status: { in: ["REQUESTED", "CONFIRMED", "RESCHEDULED"] },
    },
    include: {
      property: { select: { slug: true, title: true } },
      buyer: { select: { name: true, email: true, phone: true } },
    },
    orderBy: [{ scheduledFor: "asc" }],
    take: 20,
  });
}

export async function getBuyerViewings(buyerId: string) {
  return prisma.viewing.findMany({
    where: { buyerId },
    include: { property: { select: { slug: true, title: true, images: { take: 1 } } } },
    orderBy: [{ scheduledFor: "desc" }],
  });
}

export async function getLeadMetrics(scope: Scope) {
  const where = agentFilter(scope);
  const byStage = await prisma.lead.groupBy({ by: ["stage"], where, _count: true });
  const viewings = await prisma.viewing.count({ where });
  const upcoming = await prisma.viewing.count({
    where: { ...where, scheduledFor: { gte: new Date() }, status: "CONFIRMED" },
  });
  const counts: Record<string, number> = {};
  for (const row of byStage) counts[row.stage] = row._count;
  const total = byStage.reduce((n, r) => n + r._count, 0);
  const won = counts.WON ?? 0;
  return {
    counts,
    total,
    won,
    conversion: total > 0 ? Math.round((won / total) * 100) : 0,
    viewings,
    upcoming,
  };
}

export async function getFollowUps(scope: Scope, now = new Date()) {
  const leads = await prisma.lead.findMany({
    where: { ...agentFilter(scope), nextFollowUp: { not: null } },
    include: { property: { select: { title: true, slug: true } } },
    orderBy: { nextFollowUp: "asc" },
  });
  return leads.map((l) => ({
    ...l,
    overdue: l.nextFollowUp ? l.nextFollowUp < now : false,
  }));
}

export async function getNotifications(userId: string, opts?: { unreadOnly?: boolean }) {
  return prisma.notification.findMany({
    where: { userId, ...(opts?.unreadOnly ? { read: false } : {}) },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function getUnreadNotificationCount(userId: string) {
  return prisma.notification.count({ where: { userId, read: false } });
}
