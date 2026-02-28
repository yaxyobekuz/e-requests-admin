import StatusDonutChart from "./StatusDonutChart";
import RechartsBarChart from "./RechartsBarChart";

const CATEGORY_LABELS = {
  infrastructure: "Infratuzilma",
  social: "Ijtimoiy",
  finance: "Moliya",
};

const RequestsStats = ({ data, isLoading }) => {
  const byStatus = data?.byStatus || {};

  const categoryData = Object.entries(data?.byCategory || {}).map(([key, count]) => ({
    name: CATEGORY_LABELS[key] || key,
    count,
  }));

  const typeData = (data?.byType || []).map((t) => ({
    name: t.name,
    count: t.count,
  }));

  return (
    <div className="space-y-4">
      {/* Status summary row */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { key: "pending", label: "Kutilmoqda", color: "text-yellow-600 bg-yellow-50 border-yellow-100" },
          { key: "in_review", label: "Ko'rib chiqilmoqda", color: "text-blue-600 bg-blue-50 border-blue-100" },
          { key: "resolved", label: "Yechildi", color: "text-green-600 bg-green-50 border-green-100" },
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

      {/* Charts grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatusDonutChart
          byStatus={byStatus}
          title="Status bo'yicha taqsimot"
          isLoading={isLoading}
        />
        <RechartsBarChart
          data={categoryData}
          title="Kategoriya bo'yicha"
          color="#3B82F6"
          orientation="vertical"
          isLoading={isLoading}
          height={260}
        />
      </div>

      <RechartsBarChart
        data={typeData}
        title="Murojaat turi bo'yicha (top 10)"
        color="#6366F1"
        orientation="horizontal"
        isLoading={isLoading}
      />
    </div>
  );
};

export default RequestsStats;
