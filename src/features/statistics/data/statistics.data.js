/**
 * Static configuration for the Statistics page:
 * chart colors, period options, day labels, module config.
 */

/** Status colors for pie/donut charts (hex values for Recharts) */
export const STATUS_COLORS = {
  pending: "#EAB308",
  in_review: "#3B82F6",
  resolved: "#22C55E",
  confirmed: "#22C55E",
  rejected: "#EF4444",
  cancelled: "#9CA3AF",
  unavailable: "#F97316",
  in_progress: "#A78BFA",
  pending_confirmation: "#6366F1",
};

/** Per-module stroke/fill colors for Area charts */
export const MODULE_COLORS = {
  requests: { stroke: "#3B82F6", fill: "#DBEAFE", gradient: ["#3B82F6", "#DBEAFE"] },
  serviceReports: { stroke: "#F97316", fill: "#FED7AA", gradient: ["#F97316", "#FED7AA"] },
  msk: { stroke: "#8B5CF6", fill: "#EDE9FE", gradient: ["#8B5CF6", "#EDE9FE"] },
};

/** Time period selector options */
export const PERIOD_OPTIONS = [
  { label: "7 kun", value: "7d" },
  { label: "30 kun", value: "30d" },
  { label: "90 kun", value: "90d" },
  { label: "1 yil", value: "1y" },
];

/** Period value → API days param mapping */
export const PERIOD_TO_DAYS = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "1y": 365,
};

/** Day labels for heatmap (Monday-first) */
export const DAY_LABELS = ["Du", "Se", "Cho", "Pay", "Ju", "Sha", "Yak"];

/** Module tab definitions */
export const MODULE_TABS = [
  { key: "requests", label: "Murojaatlar", permission: "requests" },
  { key: "serviceReports", label: "Servis arizalari", permission: "services" },
  { key: "msk", label: "MSK buyurtmalar", permission: "msk" },
  { key: "regions", label: "Hududlar", permission: null },
];

/** Request status labels for charts */
export const REQUEST_STATUS_LABELS = {
  pending: "Kutilmoqda",
  in_review: "Ko'rib chiqilmoqda",
  resolved: "Yechildi",
  rejected: "Rad etildi",
  cancelled: "Bekor qilingan",
};

/** Service report status labels for charts */
export const SERVICE_STATUS_LABELS = {
  unavailable: "Mavjud emas",
  in_progress: "Jarayonda",
  pending_confirmation: "Tasdiq kutilmoqda",
  confirmed: "Tasdiqlandi",
  rejected: "Rad etildi",
  cancelled: "Bekor qilingan",
};

/** MSK order status labels for charts */
export const MSK_STATUS_LABELS = {
  pending: "Kutilmoqda",
  in_review: "Ko'rib chiqilmoqda",
  pending_confirmation: "Tasdiq kutilmoqda",
  confirmed: "Tasdiqlandi",
  rejected: "Rad etildi",
  cancelled: "Bekor qilingan",
};

/** Request category labels */
export const CATEGORY_LABELS = {
  infrastructure: "Infratuzilma",
  social: "Ijtimoiy",
  finance: "Moliya",
};

/** Request category colors */
export const CATEGORY_COLORS = {
  infrastructure: "#3B82F6",
  social: "#22C55E",
  finance: "#F59E0B",
};

/** Bar chart colors pool for dynamic lists (services, types, msk categories) */
export const BAR_COLORS = [
  "#3B82F6", "#8B5CF6", "#F97316", "#22C55E", "#EF4444",
  "#06B6D4", "#EC4899", "#EAB308", "#14B8A6", "#6366F1",
  "#84CC16", "#F43F5E", "#0EA5E9", "#A855F7", "#FB923C",
];
