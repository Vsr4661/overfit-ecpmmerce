/**
 * Business and policy details shown on the legal pages (privacy, terms, refunds, shipping,
 * contact). Fill in every `null` before taking live payments: Razorpay and India's
 * Consumer Protection (E-Commerce) Rules require these to be published.
 * Unfilled values render as highlighted placeholders and trigger a warning in admin.
 */
export const BUSINESS = {
  brandName: "Overfit",
  /** e.g. "Overfit Apparel LLP" or your name if a sole proprietorship. */
  legalName: null as string | null,
  /** e.g. "Sole proprietorship", "LLP", "Private limited company". */
  entityType: null as string | null,
  /** Full registered address including PIN code. */
  address: null as string | null,
  supportEmail: null as string | null,
  /** With country code, e.g. "+91 98765 43210". */
  supportPhone: null as string | null,
  supportHours: "Monday to Saturday, 10am to 6pm IST",
  /** Leave null if not GST-registered. */
  gstin: null as string | null,
  /** Grievance officer under the Consumer Protection (E-Commerce) Rules, 2020 and DPDP Act, 2023. */
  grievanceOfficer: {
    name: null as string | null,
    email: null as string | null,
  },
  /** City whose courts have jurisdiction over disputes, e.g. "Bengaluru". */
  jurisdictionCity: null as string | null,
  /** Shown as "Last updated" on policy pages. Update whenever you change a policy. */
  policiesUpdated: "2026-10-16",
} as const;

export const POLICY = {
  /** Days after delivery to request a size exchange. */
  exchangeWindowDays: 7,
  /** Days after delivery to report a damaged, defective or wrong item. */
  defectReportDays: 7,
  /** Hours after ordering during which customers can cancel for a full refund. */
  cancellationWindowHours: 12,
  /** Business days for a refund to reach the original payment method once approved. */
  refundDays: "5–7",
  /** Business days to print and dispatch. */
  dispatchDays: "2–4",
  /** Business days for delivery after dispatch. */
  deliveryDays: "3–6",
} as const;

type Missing = { field: string; label: string };

export function missingBusinessDetails(): Missing[] {
  const checks: [unknown, string, string][] = [
    [BUSINESS.legalName, "legalName", "Legal business name"],
    [BUSINESS.entityType, "entityType", "Business type"],
    [BUSINESS.address, "address", "Registered address"],
    [BUSINESS.supportEmail, "supportEmail", "Support email"],
    [BUSINESS.supportPhone, "supportPhone", "Support phone"],
    [BUSINESS.grievanceOfficer.name, "grievanceOfficer.name", "Grievance officer name"],
    [BUSINESS.grievanceOfficer.email, "grievanceOfficer.email", "Grievance officer email"],
    [BUSINESS.jurisdictionCity, "jurisdictionCity", "Jurisdiction city"],
  ];
  return checks.filter(([value]) => !value).map(([, field, label]) => ({ field, label }));
}
