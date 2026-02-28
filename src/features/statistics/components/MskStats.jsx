import StatusDonutChart from "./StatusDonutChart";
import RechartsBarChart from "./RechartsBarChart";

const MskStats = ({ data, isLoading }) => {
  const byStatus = data?.byStatus || {};

  const categoryData = (data?.byCategory || []).map((c) => ({
    name: c.name,
    count: c.count,
  }));

  return (
    <div className="space-y-4">
      {/* Status summary row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { key: "pending", label: "Kutilmoqda", color: "text-yellow-600 bg-yellow-50 border-yellow-100" },
          { key: "in_review", label: "Ko'rib chiqilmoqda", color: "text-blue-600 bg-blue-50 border-blue-100" },
          { key: "resolved", label: "Bajarildi", color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
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
        <RechartsBarChart
          data={categoryData}
          title="MSK kategoriya bo'yicha"
          color="#A855F7"
          orientation="vertical"
          isLoading={isLoading}
          height={260}
        />
      </div>

      {categoryData.length > 5 && (
        <RechartsBarChart
          data={categoryData}
          title="Kategoriya bo'yicha batafsil"
          color="#8B5CF6"
          orientation="horizontal"
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default MskStats;
