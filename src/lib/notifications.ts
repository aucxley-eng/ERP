import { prisma } from "./prisma";

export async function notify(
  userId: string,
  input: { title: string; body?: string; link?: string },
) {
  return prisma.notification.create({
    data: {
      userId,
      title: input.title,
      body: input.body ?? null,
      link: input.link ?? null,
    },
  });
}

export async function logActivity(input: {
  action: string;
  detail?: string;
  actorId?: string;
  leadId?: string;
}) {
  return prisma.activityLog.create({
    data: {
      action: input.action,
      detail: input.detail ?? null,
      actorId: input.actorId ?? null,
      leadId: input.leadId ?? null,
    },
  });
}
