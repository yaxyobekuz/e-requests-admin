import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { statsAPI } from "@/shared/api/http";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  FileText,
  AlertTriangle,
  Package,
  Users,
  Clock,
  TrendingUp,
  XCircle,
  Eye,
  ArrowRight,
} from "lucide-react";
import {
  useCountUp,
  Skeleton,
  ChartTooltip,
  HeatmapChart,
} from "@/features/statistics/components/shared";
import {
  STATUS_COLORS,
  PERIOD_OPTIONS,
  PERIOD_TO_DAYS,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  BAR_COLORS,
} from "@/features/statistics/data/statistics.data";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const user = JSON.parse(localStorage.getItem("admin_user") || "{}");
const isOwner = user.role === "owner";

// ─── KPI Card ─────────────────────────────────────────────────────────────────

/**
 * Animated KPI card.
 * @param {string} label
 * @param {number|string} value - if string (e.g. "83.4%"), shown as-is
 * @param {string} subtitle
 * @param {string} color - Tailwind bg+text classes for icon wrapper
 * @param {React.ReactNode} icon
 * @param {boolean} isPercent - render as percent string, skip countUp
 */
const KpiCard = ({ label, value, subtitle, color, icon, isPercent }) => {
  const animated = useCountUp(isPercent ? 0 : (value ?? 0));
  const display = isPercent
    ? value
    : typeof value === "number"
      ? animated.toLocaleString()
      : "—";

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
      <p className="text-3xl font-bold tracking-tight">{display}</p>
      {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
    </div>
  );
};

// ─── Section Header ──────────────────────────────────────────────────────────

const SectionHeader = ({ title, subtitle }) => (
  <div className="mb-4">
    <h2 className="text-base font-semibold text-gray-800">{title}</h2>
    {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
  </div>
);

// ─── Donut Chart (status taqsimoti) ──────────────────────────────────────────

/**
 * Donut chart with center label and legend for request statuses.
 * @param {object} data - { status: count, total: number }
 * @param {object} labels - status key → Uzbek label
 */
const StatusDonut = ({ data, labels }) => {
  const entries = Object.entries(labels)
    .map(([key, label]) => ({ key, label, value: data?.[key] || 0 }))
    .filter((e) => e.value > 0);

  const total = data?.total || 0;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <ResponsiveContainer width={200} height={200}>
          <PieChart>
            <Pie
              data={entries}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              dataKey="value"
              strokeWidth={2}
              stroke="#fff"
            >
              {entries.map((e) => (
                <Cell key={e.key} fill={STATUS_COLORS[e.key] || "#9CA3AF"} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0];
                return (
                  <div className="bg-white border rounded-xl shadow-lg px-3 py-2 text-sm">
                    <span style={{ color: d.payload.fill }}>
                      {d.name || d.payload.label}:{" "}
                    </span>
                    <strong>{d.value?.toLocaleString()}</strong>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-2xl font-bold">{total.toLocaleString()}</p>
          <p className="text-xs text-gray-400">ta murojaat</p>
        </div>
      </div>
      <div className="flex flex-col gap-1.5 w-full">
        {entries.map((e) => (
          <div
            key={e.key}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: STATUS_COLORS[e.key] || "#9CA3AF" }}
              />
              <span className="text-gray-600">{e.label}</span>
            </div>
            <span className="font-medium text-gray-800">
              {e.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Region Progress List ─────────────────────────────────────────────────────

/**
 * Progress list showing resolved % per region.
 * @param {Array} regions - [{ name, requests, serviceReports, mskOrders, total }]
 */
const RegionProgressList = ({ regions }) => {
  if (!regions?.length) {
    return <p className="text-sm text-gray-400">Ma'lumot yo'q</p>;
  }

  const sorted = [...regions].sort((a, b) => {
    const ra = a.total ? a.requests / a.total : 0;
    const rb = b.total ? b.requests / b.total : 0;
    return rb - ra;
  });

  return (
    <div className="flex flex-col gap-3">
      {sorted.slice(0, 10).map((r) => {
        const pct = r.total ? Math.round((r.requests / r.total) * 100) : 0;
        const badgeColor =
          pct >= 70
            ? "bg-green-100 text-green-700"
            : pct >= 40
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-700";
        const barColor =
          pct >= 70 ? "#22C55E" : pct >= 40 ? "#EAB308" : "#EF4444";

        return (
          <div key={r._id || r.name} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700 font-medium truncate max-w-[180px]">
                {r.name}
              </span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeColor}`}
              >
                {pct}%
              </span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, backgroundColor: barColor }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Horizontal Mini Bar Chart ─────────────────────────────────────────────────

/**
 * Horizontal bar chart for category/service lists.
 * @param {Array<{name, total}>} items
 */
const HorizBar = ({ items }) => {
  if (!items?.length)
    return <p className="text-sm text-gray-400">Ma'lumot yo'q</p>;

  const top = items.slice(0, 6);
  const data = top.map((it) => ({
    name: it.name || it.category || "—",
    value: it.total,
  }));

  return (
    <ResponsiveContainer width="100%" height={top.length * 36 + 20}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ left: 8, right: 24, top: 4, bottom: 4 }}
      >
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          width={110}
          tick={{ fontSize: 12, fill: "#6B7280" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<ChartTooltip />} />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={18}>
          {data.map((_, i) => (
            <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

// ─── Category Donut (infra/social/finance) ───────────────────────────────────

const CategoryDonut = ({ items }) => {
  if (!items?.length)
    return <p className="text-sm text-gray-400">Ma'lumot yo'q</p>;

  const data = items.map((it) => ({
    name: CATEGORY_LABELS[it.category] || it.category,
    value: it.total,
    color: CATEGORY_COLORS[it.category] || "#9CA3AF",
  }));
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <ResponsiveContainer width={160} height={160}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={46}
              outerRadius={72}
              dataKey="value"
              strokeWidth={2}
              stroke="#fff"
            >
              {data.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-xl font-bold">{total.toLocaleString()}</p>
        </div>
      </div>
      <div className="flex flex-col gap-1.5 w-full text-sm">
        {data.map((d, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: d.color }}
              />
              <span className="text-gray-600">{d.name}</span>
            </div>
            <span className="font-medium">{d.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const DashboardPage = () => {
  const [period, setPeriod] = useState("30d");
  const days = PERIOD_TO_DAYS[period] ?? 30;

  // ── Queries ──────────────────────────────────────────────────────────────

  const { data: dashboard, isLoading: dashLoading } = useQuery({
    queryKey: ["stats", "dashboard"],
    queryFn: () => statsAPI.getDashboard().then((r) => r.data),
    refetchInterval: 30_000,
  });

  const { data: trends, isLoading: trendsLoading } = useQuery({
    queryKey: ["stats", "trends", period],
    queryFn: () =>
      statsAPI.getTrends({ period, module: "all" }).then((r) => r.data),
    refetchInterval: 30_000,
  });

  const { data: regionData, isLoading: regionLoading } = useQuery({
    queryKey: ["stats", "region-detailed", "district", days],
    queryFn: () =>
      statsAPI
        .getRegionDetailed({ level: "district", days })
        .then((r) => r.data),
    refetchInterval: 30_000,
  });

  const { data: categoryData } = useQuery({
    queryKey: ["stats", "by-category", days],
    queryFn: () => statsAPI.getByCategory({ days }).then((r) => r.data),
    refetchInterval: 30_000,
  });

  const { data: serviceData } = useQuery({
    queryKey: ["stats", "by-service", days],
    queryFn: () => statsAPI.getByService({ days }).then((r) => r.data),
    refetchInterval: 30_000,
  });

  const { data: mskCatData } = useQuery({
    queryKey: ["stats", "by-msk-category", days],
    queryFn: () => statsAPI.getByMskCategory({ days }).then((r) => r.data),
    refetchInterval: 30_000,
  });

  const { data: heatmapData } = useQuery({
    queryKey: ["stats", "heatmap", "requests", days],
    queryFn: () =>
      statsAPI.getHeatmap({ module: "requests", days }).then((r) => r.data),
    refetchInterval: 30_000,
  });

  // ── Derived values ────────────────────────────────────────────────────────

  const req = dashboard?.requests || {};
  const svc = dashboard?.serviceReports || {};
  const msk = dashboard?.mskOrders || {};

  const totalPending =
    (req.pending || 0) + (svc.unavailable || 0) + (msk.pending || 0);
  const totalRejected =
    (req.rejected || 0) + (svc.rejected || 0) + (msk.rejected || 0);
  const totalInReview = (req.in_review || 0) + (msk.in_review || 0);
  const resolvedPct = req.total
    ? `${(((req.resolved || 0) / req.total) * 100).toFixed(1)}%`
    : "—";

  const trendData = trends
    ? trends.labels.map((label, i) => ({
        label,
        Murojaatlar: trends.requests?.[i] || 0,
        "Servis arizalari": trends.serviceReports?.[i] || 0,
        "MSK buyurtmalar": trends.mskOrders?.[i] || 0,
      }))
    : [];

  const regions = regionData?.regions || [];

  const requestStatusLabels = {
    pending: "Kutilmoqda",
    in_review: "Ko'rib chiqilmoqda",
    resolved: "Yechildi",
    rejected: "Rad etildi",
    cancelled: "Bekor qilingan",
  };

  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Salom, {user.firstName || user.alias || "Admin"}!
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {isOwner
              ? "Umumiy statistika ko'rinishi"
              : "Tayinlangan hudud statistikasi"}
          </p>
        </div>
        {/* Period filter */}
        <div className="flex gap-1 bg-white border rounded-xl p-1">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
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

      {/* ── Section 1: KPI kartalar ── */}
      <section>
        <SectionHeader
          title="Tezkor statistika"
          subtitle="Barcha yo'nalishlar bo'yicha jami"
        />
        {dashLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Qator 1 */}
            <KpiCard
              label="Jami murojaatlar"
              value={req.total}
              subtitle={`${req.resolved || 0} ta yechildi`}
              color="bg-blue-50 text-blue-600"
              icon={<FileText className="w-5 h-5" />}
            />
            <KpiCard
              label="Servis arizalari"
              value={svc.total}
              subtitle={`${svc.in_progress || 0} ta jarayonda`}
              color="bg-orange-50 text-orange-600"
              icon={<AlertTriangle className="w-5 h-5" />}
            />
            <KpiCard
              label="MSK buyurtmalar"
              value={msk.total}
              subtitle={`${msk.confirmed || 0} ta tasdiqlandi`}
              color="bg-purple-50 text-purple-600"
              icon={<Package className="w-5 h-5" />}
            />
            <KpiCard
              label="Foydalanuvchilar"
              value={dashboard?.totalUsers}
              subtitle="Ro'yxatdan o'tgan"
              color="bg-green-50 text-green-600"
              icon={<Users className="w-5 h-5" />}
            />
            {/* Qator 2 */}
            <KpiCard
              label="Kutilmoqda"
              value={totalPending}
              subtitle="Barcha yo'nalishlar"
              color="bg-yellow-50 text-yellow-600"
              icon={<Clock className="w-5 h-5" />}
            />
            <KpiCard
              label="Yechilish darajasi"
              value={resolvedPct}
              subtitle="Murojaatlar bo'yicha"
              color="bg-emerald-50 text-emerald-600"
              icon={<TrendingUp className="w-5 h-5" />}
              isPercent
            />
            <KpiCard
              label="Rad etildi"
              value={totalRejected}
              subtitle="Barcha yo'nalishlar"
              color="bg-red-50 text-red-600"
              icon={<XCircle className="w-5 h-5" />}
            />
            <KpiCard
              label="Ko'rib chiqilmoqda"
              value={totalInReview}
              subtitle="Murojaatlar + MSK"
              color="bg-indigo-50 text-indigo-600"
              icon={<Eye className="w-5 h-5" />}
            />
          </div>
        )}
      </section>

      {/* ── Section 2: Trend + Donut ── */}
      <section>
        <SectionHeader
          title="Vaqt bo'yicha dinamika"
          subtitle={`So'nggi ${PERIOD_OPTIONS.find((o) => o.value === period)?.label}`}
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Area chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border p-5">
            <p className="text-sm font-medium text-gray-700 mb-4">
              Arizalar trendı
            </p>
            {trendsLoading ? (
              <Skeleton className="h-56" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart
                  data={trendData}
                  margin={{ top: 4, right: 8, bottom: 0, left: -16 }}
                >
                  <defs>
                    <linearGradient id="gReq" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gSvc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F97316" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gMsk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "#9CA3AF" }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#9CA3AF" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="Murojaatlar"
                    stroke="#3B82F6"
                    fill="url(#gReq)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="Servis arizalari"
                    stroke="#F97316"
                    fill="url(#gSvc)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="MSK buyurtmalar"
                    stroke="#8B5CF6"
                    fill="url(#gMsk)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Status donut */}
          <div className="bg-white rounded-2xl border p-5">
            <p className="text-sm font-medium text-gray-700 mb-4">
              Murojaatlar holati
            </p>
            {dashLoading ? (
              <Skeleton className="h-56" />
            ) : (
              <StatusDonut data={req} labels={requestStatusLabels} />
            )}
          </div>
        </div>
      </section>

      {/* ── Section 3: Hududlar ── */}
      <section>
        <SectionHeader
          title="Hududlar bo'yicha"
          subtitle="Tumanlar kesimida arizalar taqsimoti"
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Stacked bar */}
          <div className="bg-white rounded-2xl border p-5">
            <p className="text-sm font-medium text-gray-700 mb-4">
              Top 10 tuman
            </p>
            {regionLoading ? (
              <Skeleton className="h-72" />
            ) : regions.length ? (
              <ResponsiveContainer
                width="100%"
                height={regions.slice(0, 10).length * 32 + 24}
              >
                <BarChart
                  data={regions.slice(0, 10).map((r) => ({
                    name: r.name,
                    Murojaatlar: r.requests,
                    Servis: r.serviceReports,
                    MSK: r.mskOrders,
                  }))}
                  layout="vertical"
                  margin={{ left: 8, right: 16, top: 4, bottom: 4 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={110}
                    tick={{ fontSize: 12, fill: "#6B7280" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar
                    dataKey="Murojaatlar"
                    stackId="a"
                    fill="#3B82F6"
                    radius={[0, 0, 0, 0]}
                    barSize={16}
                  />
                  <Bar
                    dataKey="Servis"
                    stackId="a"
                    fill="#F97316"
                    barSize={16}
                  />
                  <Bar
                    dataKey="MSK"
                    stackId="a"
                    fill="#8B5CF6"
                    radius={[0, 4, 4, 0]}
                    barSize={16}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-400">Ma'lumot yo'q</p>
            )}
          </div>

          {/* Progress list */}
          <div className="bg-white rounded-2xl border p-5">
            <p className="text-sm font-medium text-gray-700 mb-4">
              Murojaatlar ulushi (tumanlar bo'yicha)
            </p>
            {regionLoading ? (
              <Skeleton className="h-72" />
            ) : (
              <RegionProgressList regions={regions} />
            )}
          </div>
        </div>
      </section>

      {/* ── Section 4: Kategoriyalar ── */}
      <section>
        <SectionHeader
          title="Kategoriyalar bo'yicha"
          subtitle="Murojaat turlari, servislar va MSK bo'limlari"
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Murojaat bo'limlari */}
          <div className="bg-white rounded-2xl border p-5">
            <p className="text-sm font-medium text-gray-700 mb-4">
              Murojaat bo'limlari
            </p>
            <CategoryDonut items={categoryData?.byCategory} />
          </div>

          {/* Servislar */}
          <div className="bg-white rounded-2xl border p-5">
            <p className="text-sm font-medium text-gray-700 mb-4">
              Servislar bo'yicha
            </p>
            <HorizBar items={serviceData?.services} />
          </div>

          {/* MSK kategoriyalar */}
          <div className="bg-white rounded-2xl border p-5">
            <p className="text-sm font-medium text-gray-700 mb-4">
              MSK kategoriyalar
            </p>
            <HorizBar items={mskCatData?.categories} />
          </div>
        </div>
      </section>

      {/* ── Section 5: Heatmap ── */}
      <section>
        <SectionHeader
          title="Aktivlik xaritasi"
          subtitle="Qaysi kunda va soatda ko'proq murojaat tushadi"
        />
        <div className="bg-white rounded-2xl border p-5">
          {heatmapData ? (
            <HeatmapChart data={heatmapData.data} />
          ) : (
            <Skeleton className="h-56" />
          )}
        </div>
      </section>

      <div className="flex justify-center">
        <Link
          to="/statistics"
          className="inline-flex items-center gap-2 text-base font-semibold text-blue-600 hover:text-blue-700 transition-colors border p-3.5 rounded-2xl"
        >
          Batafsil statistika
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
};

export default DashboardPage;
