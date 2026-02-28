import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const STATUS_COLORS = {
  pending: "#EAB308",
  in_review: "#3B82F6",
  resolved: "#22C55E",
  confirmed: "#22C55E",
  rejected: "#EF4444",
  cancelled: "#9CA3AF",
  unavailable: "#EF4444",
  in_progress: "#F97316",
  pending_confirmation: "#8B5CF6",
};

const STATUS_LABELS = {
  pending: "Kutilmoqda",
  in_review: "Ko'rib chiqilmoqda",
  resolved: "Yechildi",
  confirmed: "Tasdiqlandi",
  rejected: "Rad etildi",
  cancelled: "Bekor qilingan",
  unavailable: "Mavjud emas",
  in_progress: "Jarayonda",
  pending_confirmation: "Tasdiq kutilmoqda",
};

const ChartSkeleton = () => (
  <div className="bg-white rounded-xl border p-5 animate-pulse">
    <div className="h-5 bg-gray-200 rounded w-40 mb-4" />
    <div className="flex items-center justify-center">
      <div className="w-40 h-40 bg-gray-100 rounded-full" />
    </div>
  </div>
);

const StatusDonutChart = ({ byStatus, title, isLoading }) => {
  if (isLoading) return <ChartSkeleton />;

  const data = Object.entries(byStatus || {})
    .filter(([key]) => key !== "total")
    .filter(([, value]) => value > 0)
    .map(([key, value]) => ({
      key,
      name: STATUS_LABELS[key] || key,
      value,
    }));

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border p-5">
        <h3 className="font-semibold mb-4">{title}</h3>
        <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
          Ma'lumot mavjud emas
        </div>
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, value } = payload[0].payload;
      const pct = total > 0 ? Math.round((value / total) * 100) : 0;
      return (
        <div className="bg-white border rounded-lg shadow-md px-3 py-2 text-sm">
          <p className="font-medium">{name}</p>
          <p className="text-gray-600">
            {value} ta ({pct}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl border p-5">
      <h3 className="font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry) => (
              <Cell
                key={entry.key}
                fill={STATUS_COLORS[entry.key] || "#9CA3AF"}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => (
              <span className="text-xs text-gray-700">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatusDonutChart;
