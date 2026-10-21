import { z } from "zod";
import type { LeadStage, ViewingStatus } from "@prisma/client";
import { leadStageValues, viewingStatusValues } from "./crm-constants";

export const viewingRequestSchema = z.object({
  propertyId: z.string().min(1),
  scheduledFor: z.coerce.date().refine((d) => d.getTime() > Date.now(), {
    message: "Please choose a future date and time",
  }),
  name: z.string().min(2).max(80),
  email: z.string().email(),
  phone: z.string().max(30).optional().or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

export const leadStageSchema = z.object({
  leadId: z.string().min(1),
  stage: z.enum(leadStageValues()) as z.ZodType<LeadStage>,
});

export const leadUpdateSchema = z.object({
  notes: z.string().max(2000).optional().or(z.literal("")),
  nextFollowUp: z.string().optional().or(z.literal("")),
  budgetMin: z.coerce.number().min(0).optional(),
  budgetMax: z.coerce.number().min(0).optional(),
});

export const viewingUpdateSchema = z.object({
  viewingId: z.string().min(1),
  status: z.enum(viewingStatusValues()) as z.ZodType<ViewingStatus>,
  scheduledFor: z.string().optional().or(z.literal("")),
  agentNotes: z.string().max(1000).optional().or(z.literal("")),
});

export type ViewingRequestInput = z.infer<typeof viewingRequestSchema>;
