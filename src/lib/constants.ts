export const ROLES = {
  GLOBAL_ADMIN: "GLOBAL_ADMIN" as const,
  OFFICE_ADMIN: "OFFICE_ADMIN" as const,
  OFFICE_USER: "OFFICE_USER" as const,
  EXTERNAL: "EXTERNAL" as const,
};

export const ROLE_LABELS: Record<string, string> = {
  GLOBAL_ADMIN: "Global Admin",
  OFFICE_ADMIN: "Office Admin",
  OFFICE_USER: "Office User",
  EXTERNAL: "External Evaluator",
};

export const ROLE_DESCRIPTIONS: Record<string, string> = {
  GLOBAL_ADMIN: "Full system access - manage organizations, offices, and all users",
  OFFICE_ADMIN: "Manage your office - users, feedback, and office settings",
  OFFICE_USER: "Rate peers, review feedback, and view your performance",
  EXTERNAL: "Submit ratings and feedback without an account",
};

export const FEEDBACK_STATUS = {
  NEW: "NEW" as const,
  ACKNOWLEDGED: "ACKNOWLEDGED" as const,
  RESOLVED: "RESOLVED" as const,
};

export const FEEDBACK_STATUS_LABELS: Record<string, string> = {
  NEW: "New",
  ACKNOWLEDGED: "Acknowledged",
  RESOLVED: "Resolved",
};

export const FEEDBACK_STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-50 text-blue-700 border-blue-200",
  ACKNOWLEDGED: "bg-amber-50 text-amber-700 border-amber-200",
  RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export const APP_NAME = "Nefassilk Poly Technic College";
export const APP_TAGLINE = "Clear. Actionable. Satisfaction.";
export const APP_DESCRIPTION =
  "Capture, analyze, and act on client feedback across your entire organization.";
