import StatusDonutChart from "./StatusDonutChart";
import RechartsBarChart from "./RechartsBarChart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

const ProblemTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border rounded-lg shadow-lg px-3 py-2 text-sm">
        <p className="font-medium mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.fill || p.color }}>
            {p.name}: {p.value}
            {p.name.includes("%") ? "%" : " ta"}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const ServiceReportsStats = ({ data, isLoading }) => {
  const byStatus = data?.byStatus || {};

  const serviceData = (data?.byService || []).map((s) => ({
    name: s.name,
    total: s.total,
    problemPercent: s.problemPercent,
    confirmedPercent: s.confirmedPercent,
  }));

  const chartHeight = Math.max(240, serviceData.length * 44);

  return (
    <div className="space-y-4">
      {/* Status summary row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { key: "unavailable", label: "Mavjud emas", color: "text-red-600 bg-red-50 border-red-100" },
          { key: "in_progress", label: "Jarayonda", color: "text-orange-600 bg-orange-50 border-orange-100" },
          { key: "pending_confirmation", label: "Tasdiq kutilmoqda", color: "text-purple-600 bg-purple-50 border-purple-100" },
          { key: "confirmed", label: "Tasdiqlandi", color: "text-green-600 bg-green-50 border-green-100" },
          { key: "rejected", label: "Rad etildi", color: "text-red-600 bg-red-50 border-red-100" },
          { key: "cancelled", label: "Bekor qilingan", color: "text-gray-600 bg-gray-50 border-gray-200" },
        ].map(({ key, label, color }) => (
          <div key={key} className={`rounded-xl border p-4 ${color}`}>
            <p className="text-xs font-medium opacity-75 mb-1">{label}</p>
            <p className="text-2xl font-bold">
              {isLoading ? "—" : byStatus[key] || 0}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatusDonutChart
          byStatus={byStatus}
          title="Status bo'yicha taqsimot"
          isLoading={isLoading}
        />

        {/* Problem percentage mini stats */}
        {!isLoading && serviceData.length > 0 && (
          <div className="bg-white rounded-xl border p-5">
            <h3 className="font-semibold mb-4">Muammo foizi (xizmat turi)</h3>
            <div className="space-y-3 overflow-y-auto max-h-56">
              {serviceData.slice(0, 8).map((s, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 truncate flex-1 mr-2">{s.name}</span>
                    <span className="font-medium text-red-600 shrink-0">{s.problemPercent}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-red-400 h-1.5 rounded-full transition-all"
                      style={{ width: `${s.problemPercent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Service by total and problem percent stacked */}
      {!isLoading && serviceData.length > 0 && (
        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-semibold mb-4">Xizmat turlari bo'yicha (muammo va tasdiqlash)</h3>
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart
              data={serviceData}
              layout="vertical"
              margin={{ top: 0, right: 60, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: "#374151" }}
                width={130}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ProblemTooltip />} />
              <Legend formatter={(v) => <span className="text-xs">{v}</span>} />
              <Bar dataKey="total" fill="#F97316" name="Jami" radius={[0, 4, 4, 0]} maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {isLoading && (
        <div className="bg-white rounded-xl border p-5 animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-60 mb-4" />
          <div className="bg-gray-100 rounded h-64" />
        </div>
      )}
    </div>
  );
};

export default ServiceReportsStats;
