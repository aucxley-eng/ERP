export const LEAD_STAGES = [
  { value: "NEW", label: "New", color: "bg-slate-100 text-slate-700" },
  { value: "QUALIFYING", label: "Qualifying", color: "bg-blue-50 text-blue-700" },
  { value: "VIEWING", label: "Viewing", color: "bg-amber-50 text-amber-700" },
  { value: "OFFER", label: "Offer", color: "bg-purple-50 text-purple-700" },
  { value: "WON", label: "Won", color: "bg-emerald-50 text-emerald-700" },
  { value: "LOST", label: "Lost", color: "bg-red-50 text-red-700" },
] as const;

export const LEAD_SOURCES = [
  { value: "WEBSITE_ENQUIRY", label: "Website enquiry" },
  { value: "VIEWING_REQUEST", label: "Viewing request" },
  { value: "PHONE", label: "Phone" },
  { value: "WALK_IN", label: "Walk-in" },
  { value: "REFERRAL", label: "Referral" },
  { value: "OTHER", label: "Other" },
] as const;

export const VIEWING_STATUSES = [
  { value: "REQUESTED", label: "Requested", color: "bg-amber-50 text-amber-700" },
  { value: "CONFIRMED", label: "Confirmed", color: "bg-emerald-50 text-emerald-700" },
  { value: "RESCHEDULED", label: "Rescheduled", color: "bg-blue-50 text-blue-700" },
  { value: "COMPLETED", label: "Completed", color: "bg-emerald-50 text-emerald-700" },
  { value: "CANCELLED", label: "Cancelled", color: "bg-red-50 text-red-700" },
  { value: "NO_SHOW", label: "No show", color: "bg-slate-100 text-slate-600" },
] as const;

export function leadStageLabel(value: string) {
  return LEAD_STAGES.find((s) => s.value === value)?.label ?? value;
}

export function leadStageColor(value: string) {
  return LEAD_STAGES.find((s) => s.value === value)?.color ?? "bg-slate-100 text-slate-700";
}

export function viewingStatusLabel(value: string) {
  return VIEWING_STATUSES.find((s) => s.value === value)?.label ?? value;
}

export function viewingStatusColor(value: string) {
  return VIEWING_STATUSES.find((s) => s.value === value)?.color ?? "bg-slate-100 text-slate-700";
}

export function viewingStatusValues() {
  return VIEWING_STATUSES.map((s) => s.value) as [string, ...string[]];
}

export function leadStageValues() {
  return LEAD_STAGES.map((s) => s.value) as [string, ...string[]];
}
