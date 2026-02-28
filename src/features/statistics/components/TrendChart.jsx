import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTrends } from "../hooks/useStatistics";

const MODULE_COLORS = {
  requests: "#3B82F6",
  serviceReports: "#F97316",
  mskOrders: "#A855F7",
};

const MODULE_LABELS = {
  requests: "Murojaatlar",
  serviceReports: "Servis reportlar",
  mskOrders: "MSK buyurtmalar",
};

const PERIODS = [
  { key: "7d", label: "7 kun" },
  { key: "30d", label: "30 kun" },
  { key: "90d", label: "90 kun" },
];

const ChartSkeleton = () => (
  <div className="bg-white rounded-xl border p-5 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="h-5 bg-gray-200 rounded w-36" />
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-7 w-16 bg-gray-200 rounded-lg" />
        ))}
      </div>
    </div>
    <div className="bg-gray-100 rounded h-64" />
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border rounded-lg shadow-lg px-3 py-2 text-sm">
        <p className="font-medium text-gray-700 mb-1">{label}</p>
        {payload.map((p) => (
          <div key={p.dataKey} className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: p.color }}
            />
            <span className="text-gray-600">{p.name}:</span>
            <span className="font-medium">{p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const TrendChart = ({ visibleModules = ["requests", "serviceReports", "mskOrders"] }) => {
  const [period, setPeriod] = useState("30d");
  const { data: trends, isLoading } = useTrends({ period });

  const mergedData = useMemo(() => {
    if (!trends) return [];
    const map = new Map();

    trends.requests?.forEach((d) => {
      map.set(d.date, { ...map.get(d.date), date: d.date, requests: d.count });
    });
    trends.serviceReports?.forEach((d) => {
      map.set(d.date, { ...map.get(d.date), date: d.date, serviceReports: d.count });
    });
    trends.mskOrders?.forEach((d) => {
      map.set(d.date, { ...map.get(d.date), date: d.date, mskOrders: d.count });
    });

    return Array.from(map.values())
      .map((item) => ({
        date: item.date,
        requests: item.requests || 0,
        serviceReports: item.serviceReports || 0,
        mskOrders: item.mskOrders || 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [trends]);

  if (isLoading) return <ChartSkeleton />;

  const formatDate = (dateStr) => {
    const [, month, day] = dateStr.split("-");
    return `${day}/${month}`;
  };

  const hasData = mergedData.some(
    (d) => d.requests > 0 || d.serviceReports > 0 || d.mskOrders > 0
  );

  return (
    <div className="bg-white rounded-xl border p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold">So'nggi trend</h3>
          <p className="text-xs text-gray-400 mt-0.5">Kunlik ariza dinamikasi</p>
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-3 py-1.5 text-xs rounded-md font-medium transition-all ${
                period === p.key
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {!hasData ? (
        <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
          Ma'lumot mavjud emas
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={mergedData} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "#9CA3AF" }}
              tickFormatter={formatDate}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9CA3AF" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => (
                <span className="text-xs text-gray-600">{value}</span>
              )}
            />
            {visibleModules.includes("requests") && (
              <Line
                type="monotone"
                dataKey="requests"
                stroke={MODULE_COLORS.requests}
                name={MODULE_LABELS.requests}
                dot={false}
                strokeWidth={2}
                activeDot={{ r: 4 }}
              />
            )}
            {visibleModules.includes("serviceReports") && (
              <Line
                type="monotone"
                dataKey="serviceReports"
                stroke={MODULE_COLORS.serviceReports}
                name={MODULE_LABELS.serviceReports}
                dot={false}
                strokeWidth={2}
                activeDot={{ r: 4 }}
              />
            )}
            {visibleModules.includes("mskOrders") && (
              <Line
                type="monotone"
                dataKey="mskOrders"
                stroke={MODULE_COLORS.mskOrders}
                name={MODULE_LABELS.mskOrders}
                dot={false}
                strokeWidth={2}
                activeDot={{ r: 4 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default TrendChart;
