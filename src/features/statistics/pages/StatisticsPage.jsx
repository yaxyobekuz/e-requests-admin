import { useState, useMemo } from "react";
import {
  useCountUp,
  Skeleton,
  ChartTooltip,
  HeatmapChart,
} from "../components/shared";
import { useQuery } from "@tanstack/react-query";
import { statsAPI, regionsAPI } from "@/shared/api/http";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  STATUS_COLORS,
  MODULE_COLORS,
  PERIOD_OPTIONS,
  PERIOD_TO_DAYS,
  MODULE_TABS,
  REQUEST_STATUS_LABELS,
  SERVICE_STATUS_LABELS,
  MSK_STATUS_LABELS,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  BAR_COLORS,
} from "../data/statistics.data";

// ─── Helpers ────────────────────────────────────────────────────────────────

const user = JSON.parse(localStorage.getItem("admin_user") || "{}");
const isOwner = user.role === "owner";
const permissions = user.permissions || {};

/** Check if admin has access to a module */
const hasModuleAccess = (permission) => {
  if (!permission) return true; // "Hududlar" tab — always visible
  if (isOwner) return true;
  if (user.role !== "admin") return false;
  return permissions[permission]?.access !== "off";
};

// ─── KPI Card ────────────────────────────────────────────────────────────────

/**
 * Animated KPI card with icon and subtitle.
 * @param {string} label
 * @param {number} value
 * @param {string} subtitle
 * @param {string} color - Tailwind color classes
 * @param {React.ReactNode} icon
 */
const KpiCard = ({ label, value, subtitle, color, icon }) => {
  const animated = useCountUp(value);
  return (
    <div className="bg-white rounded-2xl border p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500 font-medium">{label}</span>
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}
        >
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold tracking-tight">
        {animated.toLocaleString()}
      </p>
      {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
    </div>
  );
};

// ─── Category Panel (Requests) ───────────────────────────────────────────────

/**
 * Shows request stats broken down by category (infrastructure/social/finance)
 * and by request type — bar charts + progress bars.
 */
const RequestCategoryPanel = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["stats", "by-category"],
    queryFn: () => statsAPI.getByCategory().then((r) => r.data),
    refetchInterval: 30_000,
  });

  const byCategory = data?.byCategory || [];
  const byType = data?.byType || [];
  const maxType = Math.max(1, ...byType.map((t) => t.total));

  // Bar chart data for categories
  const catChartData = byCategory.map((c) => ({
    name: CATEGORY_LABELS[c.category] || c.category,
    Jami: c.total,
    fill: CATEGORY_COLORS[c.category] || "#9CA3AF",
  }));

  return (
    <div className="space-y-6">
      {/* Category bar chart + donut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Bo'limlar bo'yicha</h3>
          {isLoading ? (
            <Skeleton className="h-52" />
          ) : catChartData.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-gray-400 text-sm">Ma'lumot yo'q</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={catChartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6B7280" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="Jami" radius={[6, 6, 0, 0]} animationDuration={700}>
                  {catChartData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl border p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Bo'limlar ulushi</h3>
          {isLoading ? (
            <Skeleton className="h-52" />
          ) : byCategory.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-gray-400 text-sm">Ma'lumot yo'q</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={byCategory.map((c) => ({
                      name: CATEGORY_LABELS[c.category] || c.category,
                      value: c.total,
                      key: c.category,
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={72}
                    paddingAngle={3}
                    dataKey="value"
                    animationDuration={800}
                  >
                    {byCategory.map((c, i) => (
                      <Cell key={i} fill={CATEGORY_COLORS[c.category] || BAR_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {byCategory.map((c, i) => (
                  <div key={c.category} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[c.category] || BAR_COLORS[i] }} />
                      <span className="text-gray-700">{CATEGORY_LABELS[c.category] || c.category}</span>
                    </div>
                    <span className="font-semibold">{c.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Category progress bars with status breakdown */}
      {byCategory.length > 0 && (
        <div className="bg-white rounded-2xl border p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Bo'limlar — batafsil holat</h3>
          <div className="space-y-5">
            {byCategory.map((c) => (
              <div key={c.category}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-800">
                    {CATEGORY_LABELS[c.category] || c.category}
                  </span>
                  <span className="text-sm text-gray-500">{c.total.toLocaleString()} ta</span>
                </div>
                <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
                  {Object.entries(c.statuses || {})
                    .filter(([k]) => k !== "total")
                    .map(([status, count]) => {
                      const pct = c.total > 0 ? (count / c.total) * 100 : 0;
                      return pct > 0 ? (
                        <div
                          key={status}
                          style={{ width: `${pct}%`, backgroundColor: STATUS_COLORS[status] || "#9CA3AF" }}
                          title={`${REQUEST_STATUS_LABELS[status] || status}: ${count}`}
                          className="transition-all"
                        />
                      ) : null;
                    })}
                </div>
                <div className="flex flex-wrap gap-3 mt-1.5">
                  {Object.entries(c.statuses || {})
                    .filter(([k, v]) => k !== "total" && v > 0)
                    .map(([status, count]) => (
                      <span key={status} className="text-xs text-gray-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: STATUS_COLORS[status] }} />
                        {REQUEST_STATUS_LABELS[status] || status}: {count}
                      </span>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Request types bar chart */}
      <div className="bg-white rounded-2xl border p-5">
        <h3 className="font-semibold text-gray-800 mb-4">Murojaat turlari bo'yicha</h3>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-8" />)}
          </div>
        ) : byType.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-sm">Murojaat turlari bo'yicha ma'lumot yo'q</div>
        ) : (
          <div className="space-y-3">
            {byType.map((t, i) => (
              <ProgressBar
                key={t._id || i}
                label={t.name}
                value={t.total}
                max={maxType}
                color={BAR_COLORS[i % BAR_COLORS.length]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Service Category Panel ───────────────────────────────────────────────────

/**
 * Shows service report stats grouped by service name.
 */
const ServiceCategoryPanel = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["stats", "by-service"],
    queryFn: () => statsAPI.getByService().then((r) => r.data),
    refetchInterval: 30_000,
  });

  const services = data?.services || [];

  const chartData = services.slice(0, 12).map((s, i) => ({
    name: s.name,
    Jami: s.total,
    fill: BAR_COLORS[i % BAR_COLORS.length],
  }));

  return (
    <div className="space-y-6">
      {/* Bar chart */}
      <div className="bg-white rounded-2xl border p-5">
        <h3 className="font-semibold text-gray-800 mb-4">Servislar bo'yicha arizalar</h3>
        {isLoading ? (
          <Skeleton className="h-64" />
        ) : chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-gray-400 text-sm">Ma'lumot yo'q</div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "#9CA3AF" }}
                tickLine={false}
                axisLine={false}
                angle={-30}
                textAnchor="end"
                interval={0}
              />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="Jami" radius={[5, 5, 0, 0]} animationDuration={700}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Service detail: progress bars + status breakdown */}
      <div className="bg-white rounded-2xl border p-5">
        <h3 className="font-semibold text-gray-800 mb-4">Servislar — batafsil holat</h3>
        {isLoading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : services.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-sm">Ma'lumot yo'q</div>
        ) : (
          <div className="space-y-5">
            {services.map((s, i) => (
              <div key={s._id || i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-gray-800">{s.name}</span>
                  <span className="text-sm text-gray-500">{s.total.toLocaleString()} ta</span>
                </div>
                <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
                  {Object.entries(s.statuses || {})
                    .map(([status, count]) => {
                      const pct = s.total > 0 ? (count / s.total) * 100 : 0;
                      return pct > 0 ? (
                        <div
                          key={status}
                          style={{ width: `${pct}%`, backgroundColor: STATUS_COLORS[status] || "#9CA3AF" }}
                          title={`${SERVICE_STATUS_LABELS[status] || status}: ${count}`}
                          className="transition-all"
                        />
                      ) : null;
                    })}
                </div>
                <div className="flex flex-wrap gap-3 mt-1.5">
                  {Object.entries(s.statuses || {})
                    .filter(([, v]) => v > 0)
                    .map(([status, count]) => (
                      <span key={status} className="text-xs text-gray-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: STATUS_COLORS[status] }} />
                        {SERVICE_STATUS_LABELS[status] || status}: {count}
                      </span>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── MSK Category Panel ───────────────────────────────────────────────────────

/**
 * Shows MSK order stats grouped by MSK category.
 */
const MskCategoryPanel = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["stats", "by-msk-category"],
    queryFn: () => statsAPI.getByMskCategory().then((r) => r.data),
    refetchInterval: 30_000,
  });

  const categories = data?.categories || [];

  const chartData = categories.slice(0, 12).map((c, i) => ({
    name: c.name,
    Jami: c.total,
    fill: BAR_COLORS[i % BAR_COLORS.length],
  }));

  return (
    <div className="space-y-6">
      {/* Bar chart */}
      <div className="bg-white rounded-2xl border p-5">
        <h3 className="font-semibold text-gray-800 mb-4">MSK kategoriyalar bo'yicha buyurtmalar</h3>
        {isLoading ? (
          <Skeleton className="h-64" />
        ) : chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-gray-400 text-sm">Ma'lumot yo'q</div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "#9CA3AF" }}
                tickLine={false}
                axisLine={false}
                angle={-30}
                textAnchor="end"
                interval={0}
              />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="Jami" radius={[5, 5, 0, 0]} animationDuration={700}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Category progress bars + status breakdown */}
      <div className="bg-white rounded-2xl border p-5">
        <h3 className="font-semibold text-gray-800 mb-4">MSK kategoriyalar — batafsil holat</h3>
        {isLoading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : categories.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-sm">Ma'lumot yo'q</div>
        ) : (
          <div className="space-y-5">
            {categories.map((c, i) => (
              <div key={c._id || i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-semibold text-gray-800">{c.name}</span>
                  <span className="text-sm text-gray-500">{c.total.toLocaleString()} ta</span>
                </div>
                <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
                  {Object.entries(c.statuses || {})
                    .map(([status, count]) => {
                      const pct = c.total > 0 ? (count / c.total) * 100 : 0;
                      return pct > 0 ? (
                        <div
                          key={status}
                          style={{ width: `${pct}%`, backgroundColor: STATUS_COLORS[status] || "#9CA3AF" }}
                          title={`${MSK_STATUS_LABELS[status] || status}: ${count}`}
                          className="transition-all"
                        />
                      ) : null;
                    })}
                </div>
                <div className="flex flex-wrap gap-3 mt-1.5">
                  {Object.entries(c.statuses || {})
                    .filter(([, v]) => v > 0)
                    .map(([status, count]) => (
                      <span key={status} className="text-xs text-gray-500 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: STATUS_COLORS[status] }} />
                        {MSK_STATUS_LABELS[status] || status}: {count}
                      </span>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Progress Bar ─────────────────────────────────────────────────────────────

const ProgressBar = ({ label, value, max, color }) => {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-gray-700 font-medium truncate max-w-[60%]">
          {label}
        </span>
        <span className="text-gray-500">
          {value.toLocaleString()} ({pct}%)
        </span>
      </div>
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

// ─── Module Chart Panel ───────────────────────────────────────────────────────

/**
 * Renders the full set of charts for one module tab.
 */
const ModuleCharts = ({ moduleKey, period, statusLabels, statusKeys }) => {
  const moduleColor = MODULE_COLORS[moduleKey] || MODULE_COLORS.requests;

  const apiModule =
    moduleKey === "serviceReports"
      ? "serviceReports"
      : moduleKey === "msk"
        ? "msk"
        : "requests";

  const { data: trends, isLoading: trendsLoading } = useQuery({
    queryKey: ["stats", "trends", period, moduleKey],
    queryFn: () =>
      statsAPI.getTrends({ period, module: apiModule }).then((r) => r.data),
    refetchInterval: 30_000,
  });

  const { data: dashboard, isLoading: dashLoading } = useQuery({
    queryKey: ["stats", "dashboard"],
    queryFn: () => statsAPI.getDashboard().then((r) => r.data),
    refetchInterval: 30_000,
  });

  const { data: heatmapData, isLoading: heatmapLoading } = useQuery({
    queryKey: ["stats", "heatmap", apiModule, PERIOD_TO_DAYS[period]],
    queryFn: () =>
      statsAPI
        .getHeatmap({ module: apiModule, days: PERIOD_TO_DAYS[period] })
        .then((r) => r.data),
    refetchInterval: 30_000,
  });

  // Build stats object for this module
  const statsKey = moduleKey === "msk" ? "mskOrders" : moduleKey;
  const moduleStats = dashboard?.[statsKey] || {};

  // Donut data
  const donutData = statusKeys
    .map((k) => ({
      name: statusLabels[k] || k,
      value: moduleStats[k] || 0,
      key: k,
    }))
    .filter((d) => d.value > 0);

  // Radial gauge: resolved/confirmed rate
  const total = moduleStats.total || 0;
  const resolved = (moduleStats.resolved || 0) + (moduleStats.confirmed || 0);
  const resolvedPct = total > 0 ? Math.round((resolved / total) * 100) : 0;
  const radialData = [
    { name: "Yechildi", value: resolvedPct, fill: "#22C55E" },
  ];

  // Trend area chart data
  const trendData = useMemo(() => {
    if (!trends?.labels) return [];
    const dataKey =
      moduleKey === "serviceReports"
        ? "serviceReports"
        : moduleKey === "msk"
          ? "mskOrders"
          : "requests";
    return trends.labels.map((label, i) => ({
      label,
      Jami: trends[dataKey]?.[i] || 0,
    }));
  }, [trends, moduleKey]);

  // Top categories: all statuses as progress bars
  const progressItems = statusKeys
    .map((k) => ({
      label: statusLabels[k] || k,
      value: moduleStats[k] || 0,
      color: STATUS_COLORS[k] || "#9CA3AF",
    }))
    .sort((a, b) => b.value - a.value);

  const maxProgressVal = progressItems[0]?.value || 1;

  return (
    <div className="space-y-6">
      {/* Row 1: Area Chart + Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border p-5">
          <h3 className="font-semibold text-gray-800 mb-4">
            Vaqt bo'yicha trend
          </h3>
          {trendsLoading ? (
            <Skeleton className="h-56" />
          ) : trendData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-gray-400 text-sm">
              Ma'lumot yo'q
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={trendData}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <defs>
                  <linearGradient
                    id={`grad-${moduleKey}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={moduleColor.stroke}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={moduleColor.stroke}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#9CA3AF" }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9CA3AF" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="Jami"
                  stroke={moduleColor.stroke}
                  strokeWidth={2.5}
                  fill={`url(#grad-${moduleKey})`}
                  animationDuration={800}
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Donut Chart */}
        <div className="bg-white rounded-2xl border p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Status taqsimoti</h3>
          {dashLoading ? (
            <Skeleton className="h-56" />
          ) : donutData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-gray-400 text-sm">
              Ma'lumot yo'q
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    animationDuration={800}
                    animationBegin={0}
                  >
                    {donutData.map((entry) => (
                      <Cell
                        key={entry.key}
                        fill={STATUS_COLORS[entry.key] || "#9CA3AF"}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {donutData.slice(0, 4).map((entry) => (
                  <div
                    key={entry.key}
                    className="flex items-center justify-between text-xs text-gray-600"
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: STATUS_COLORS[entry.key] }}
                      />
                      {entry.name}
                    </div>
                    <span className="font-medium">
                      {entry.value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Row 2: Radial Gauge + Progress Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radial Gauge */}
        <div className="bg-white rounded-2xl border p-5 flex flex-col items-center justify-center">
          <h3 className="font-semibold text-gray-800 mb-2 self-start">
            Yechilish darajasi
          </h3>
          {dashLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  startAngle={180}
                  endAngle={-180}
                  data={[{ value: 100, fill: "#F3F4F6" }, ...radialData]}
                >
                  <RadialBar
                    dataKey="value"
                    cornerRadius={8}
                    animationDuration={1000}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <p className="text-3xl font-bold text-green-600 -mt-8">
                {resolvedPct}%
              </p>
              <p className="text-xs text-gray-400 mt-1">Yechildi / Jami</p>
            </>
          )}
        </div>

        {/* Progress Bars */}
        <div className="lg:col-span-2 bg-white rounded-2xl border p-5">
          <h3 className="font-semibold text-gray-800 mb-4">
            Status bo'yicha taqsimot
          </h3>
          {dashLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-8" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {progressItems.map((item) => (
                <ProgressBar
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  max={maxProgressVal}
                  color={item.color}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Heatmap */}
      <div className="bg-white rounded-2xl border p-5">
        <h3 className="font-semibold text-gray-800 mb-1">
          Aktivlik xaritasi (kun × soat)
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          Qaysi kun va soatda ko'proq murojaat tushadi
        </p>
        {heatmapLoading ? (
          <Skeleton className="h-48" />
        ) : (
          <HeatmapChart data={heatmapData?.data || []} />
        )}
        <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
          <span>Kam</span>
          <div className="flex gap-0.5">
            {["#F3F4F6", "#C7D2FE", "#A5B4FC", "#818CF8", "#4F46E5"].map(
              (c, i) => (
                <span
                  key={i}
                  className="w-5 h-3 rounded-sm inline-block"
                  style={{ backgroundColor: c }}
                />
              ),
            )}
          </div>
          <span>Ko'p</span>
        </div>
      </div>
    </div>
  );
};

// ─── Regions Tab ──────────────────────────────────────────────────────────────

const RegionsTab = ({ period }) => {
  const [selectedRegionId, setSelectedRegionId] = useState(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState(null);
  const [level, setLevel] = useState("region");

  const days = PERIOD_TO_DAYS[period] ?? 30;

  const { data: topRegions = [] } = useQuery({
    queryKey: ["regions", "region"],
    queryFn: () => regionsAPI.getAll({ type: "region" }).then((r) => r.data),
  });

  // Derive active region: use selection or default to Andijon / first region
  const activeRegionId = useMemo(() => {
    if (selectedRegionId) return selectedRegionId;
    if (!topRegions.length) return null;
    const andijon = topRegions.find((r) =>
      r.name?.toLowerCase().includes("andijon"),
    );
    return (andijon || topRegions[0])._id;
  }, [selectedRegionId, topRegions]);

  const { data: districts = [] } = useQuery({
    queryKey: ["regions", "district", activeRegionId],
    queryFn: () =>
      regionsAPI
        .getAll({ type: "district", parent: activeRegionId })
        .then((r) => r.data),
    enabled: !!activeRegionId,
  });

  const { data: neighborhoods = [] } = useQuery({
    queryKey: ["regions", "neighborhood", selectedDistrictId],
    queryFn: () =>
      regionsAPI
        .getAll({ type: "neighborhood", parent: selectedDistrictId })
        .then((r) => r.data),
    enabled: !!selectedDistrictId,
  });

  // Determine query params for the detailed stats
  const parentId =
    level === "region"
      ? activeRegionId
      : selectedDistrictId;
  const childLevel = level === "region" ? "district" : "neighborhood";

  const { data: regionStats, isLoading: statsLoading } = useQuery({
    queryKey: ["stats", "region-detailed", parentId, childLevel, days],
    queryFn: () =>
      statsAPI
        .getRegionDetailed({ parentId, level: childLevel, days })
        .then((r) => r.data),
    enabled: !!parentId,
    refetchInterval: 30_000,
  });

  const regions = regionStats?.regions || [];
  const maxTotal = Math.max(1, ...regions.map((r) => r.total));

  const handleRegionChange = (id) => {
    setSelectedRegionId(id);
    setSelectedDistrictId(null);
    setLevel("region");
  };

  const handleDistrictChange = (id) => {
    setSelectedDistrictId(id || null);
    setLevel(id ? "district" : "region");
  };

  // Scatter data: total vs requests ratio
  const scatterData = regions.map((r) => ({
    x: r.total,
    y: r.requests,
    z: Math.max(r.serviceReports + r.mskOrders, 20),
    name: r.name,
  }));

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={activeRegionId || ""}
          onChange={(e) => handleRegionChange(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm bg-white min-w-40"
        >
          {topRegions.map((r) => (
            <option key={r._id} value={r._id}>
              {r.name}
            </option>
          ))}
        </select>

        {districts.length > 0 && (
          <select
            value={selectedDistrictId || ""}
            onChange={(e) => handleDistrictChange(e.target.value || null)}
            className="px-3 py-2 border rounded-lg text-sm bg-white min-w-40"
          >
            <option value="">Barcha tumanlar</option>
            {districts.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
        )}

        {selectedDistrictId && neighborhoods.length > 0 && (
          <span className="text-sm text-gray-400 self-center">
            {neighborhoods.length} mahalla
          </span>
        )}
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-2xl border p-5">
        <h3 className="font-semibold text-gray-800 mb-4">
          {level === "region" ? "Tumanlar" : "Mahallalar"} bo'yicha murojaat
          soni
        </h3>
        {statsLoading ? (
          <Skeleton className="h-64" />
        ) : regions.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
            Ma'lumot yo'q
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={regions.slice(0, 20)}
              margin={{ top: 5, right: 10, left: 0, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "#9CA3AF" }}
                tickLine={false}
                axisLine={false}
                angle={-35}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ paddingTop: 12, fontSize: 12 }} />
              <Bar
                dataKey="requests"
                name="Murojaatlar"
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
                animationDuration={600}
              />
              <Bar
                dataKey="serviceReports"
                name="Servis arizalari"
                fill="#F97316"
                radius={[4, 4, 0, 0]}
                animationDuration={700}
              />
              <Bar
                dataKey="mskOrders"
                name="MSK buyurtmalar"
                fill="#8B5CF6"
                radius={[4, 4, 0, 0]}
                animationDuration={800}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Scatter Chart + Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scatter */}
        <div className="bg-white rounded-2xl border p-5">
          <h3 className="font-semibold text-gray-800 mb-1">
            Hajm vs Murojaatlar
          </h3>
          <p className="text-xs text-gray-400 mb-4">X: jami, Y: murojaatlar</p>
          {statsLoading ? (
            <Skeleton className="h-52" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <ScatterChart margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis
                  dataKey="x"
                  name="Jami"
                  tick={{ fontSize: 11, fill: "#9CA3AF" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  dataKey="y"
                  name="Murojaatlar"
                  tick={{ fontSize: 11, fill: "#9CA3AF" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0]?.payload;
                    return (
                      <div className="bg-white border rounded-xl shadow-lg px-4 py-3 text-sm">
                        <p className="font-semibold text-gray-700">{d?.name}</p>
                        <p className="text-gray-500">
                          Jami: <strong>{d?.x}</strong>
                        </p>
                        <p className="text-gray-500">
                          Murojaatlar: <strong>{d?.y}</strong>
                        </p>
                      </div>
                    );
                  }}
                />
                <Scatter data={scatterData} fill="#3B82F6" opacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border overflow-hidden">
          <div className="px-5 py-4 border-b">
            <h3 className="font-semibold text-gray-800">Jadval ko'rinishi</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">
                    Hudud
                  </th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">
                    Mur.
                  </th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">
                    Ser.
                  </th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">
                    MSK
                  </th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">
                    Jami
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {statsLoading
                  ? [1, 2, 3, 4, 5].map((i) => (
                      <tr key={i}>
                        {[1, 2, 3, 4, 5].map((j) => (
                          <td key={j} className="px-4 py-3">
                            <Skeleton className="h-4" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : regions.slice(0, 12).map((r) => (
                      <tr key={r._id} className="hover:bg-gray-50">
                        <td className="px-4 py-2.5 font-medium text-gray-800">
                          {r.name}
                        </td>
                        <td className="px-4 py-2.5 text-right text-blue-600">
                          {r.requests}
                        </td>
                        <td className="px-4 py-2.5 text-right text-orange-500">
                          {r.serviceReports}
                        </td>
                        <td className="px-4 py-2.5 text-right text-purple-600">
                          {r.mskOrders}
                        </td>
                        <td className="px-4 py-2.5 text-right font-semibold">
                          {r.total}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Progress bars */}
      {regions.length > 0 && (
        <div className="bg-white rounded-2xl border p-5">
          <h3 className="font-semibold text-gray-800 mb-4">
            Top hududlar (jami bo'yicha)
          </h3>
          <div className="space-y-3">
            {regions.slice(0, 10).map((r) => (
              <ProgressBar
                key={r._id}
                label={r.name}
                value={r.total}
                max={maxTotal}
                color="#3B82F6"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const StatisticsPage = () => {
  const [period, setPeriod] = useState("30d");

  const visibleTabs = MODULE_TABS.filter((t) => hasModuleAccess(t.permission));
  const [activeTab, setActiveTab] = useState(visibleTabs[0]?.key || "requests");

  const { data: dashboard, isLoading: dashLoading } = useQuery({
    queryKey: ["stats", "dashboard"],
    queryFn: () => statsAPI.getDashboard().then((r) => r.data),
    refetchInterval: 30_000,
  });

  const totalRequests = dashboard?.requests?.total;
  const totalServices = dashboard?.serviceReports?.total;
  const totalMsk = dashboard?.mskOrders?.total;
  const totalUsers = dashboard?.totalUsers;

  return (
    <div className="relative p-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Statistika</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Real-time ma'lumotlar — har 30 soniyada yangilanadi
          </p>
        </div>

        {/* Period selector */}
        <div className="flex gap-1 bg-white border rounded-xl p-1">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                period === opt.value
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {dashLoading ? (
          <>
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </>
        ) : (
          <>
            <KpiCard
              label="Jami murojaatlar"
              value={totalRequests}
              subtitle={`${dashboard?.requests?.pending || 0} ta kutilmoqda`}
              color="bg-blue-50 text-blue-600"
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              }
            />
            <KpiCard
              label="Servis arizalari"
              value={totalServices}
              subtitle={`${dashboard?.serviceReports?.unavailable || 0} ta mavjud emas`}
              color="bg-orange-50 text-orange-600"
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              }
            />
            <KpiCard
              label="MSK buyurtmalar"
              value={totalMsk}
              subtitle={`${dashboard?.mskOrders?.pending || 0} ta kutilmoqda`}
              color="bg-purple-50 text-purple-600"
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              }
            />
            <KpiCard
              label="Foydalanuvchilar"
              value={totalUsers}
              subtitle="Ro'yxatdan o'tgan"
              color="bg-green-50 text-green-600"
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              }
            />
          </>
        )}
      </div>

      {/* Module Tabs */}
      <div className="sticky top-0 inset-x-0 z-20 bg-gray-50 py-5">
        <div className="flex gap-1 bg-white border rounded-xl p-1 overflow-x-auto">
          {visibleTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "regions" ? (
        <RegionsTab period={period} />
      ) : activeTab === "requests" ? (
        <div className="space-y-6">
          <ModuleCharts
            key="requests"
            moduleKey="requests"
            period={period}
            statusLabels={REQUEST_STATUS_LABELS}
            statusKeys={[
              "pending",
              "in_review",
              "resolved",
              "rejected",
              "cancelled",
            ]}
          />
          <RequestCategoryPanel period={period} />
        </div>
      ) : activeTab === "serviceReports" ? (
        <div className="space-y-6">
          <ModuleCharts
            key="serviceReports"
            moduleKey="serviceReports"
            period={period}
            statusLabels={SERVICE_STATUS_LABELS}
            statusKeys={[
              "unavailable",
              "in_progress",
              "pending_confirmation",
              "confirmed",
              "rejected",
              "cancelled",
            ]}
          />
          <ServiceCategoryPanel period={period} />
        </div>
      ) : activeTab === "msk" ? (
        <div className="space-y-6">
          <ModuleCharts
            key="msk"
            moduleKey="msk"
            period={period}
            statusLabels={MSK_STATUS_LABELS}
            statusKeys={[
              "pending",
              "in_review",
              "pending_confirmation",
              "confirmed",
              "rejected",
              "cancelled",
            ]}
          />
          <MskCategoryPanel period={period} />
        </div>
      ) : null}
    </div>
  );
};

export default StatisticsPage;
