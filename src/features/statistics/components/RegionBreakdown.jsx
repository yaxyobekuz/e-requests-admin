import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";

// API
import { statsAPI } from "../api";

// Components
import Card from "@/shared/components/ui/Card";

/**
 * Custom tooltip for the stacked region bar chart.
 *
 * @param {{ active: boolean, payload: Array, label: string }} props
 * @returns {JSX.Element|null}
 */
const RegionTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  const total = payload.reduce((s, p) => s + (p.value || 0), 0);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-3 text-sm min-w-[180px]">
      <p className="font-semibold text-gray-800 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4 py-0.5">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ background: p.fill }} />
            <span className="text-gray-600">{p.name}</span>
          </div>
          <span className="font-medium text-gray-900">{p.value}</span>
        </div>
      ))}
      <div className="border-t border-gray-100 mt-2 pt-2 flex justify-between">
        <span className="text-gray-500">Jami</span>
        <span className="font-bold text-gray-900">{total}</span>
      </div>
    </div>
  );
};

/**
 * RegionBreakdown — stacked horizontal bar chart of all regions with counts per module.
 *
 * @param {{ filters: { period: string, regionId: string|null, districtId: string|null } }} props
 * @returns {JSX.Element}
 */
const RegionBreakdown = ({ filters }) => {
  const { data: regions = [], isLoading } = useQuery({
    queryKey: ["stats", "by-region", filters],
    queryFn: () => statsAPI.getByRegion(filters).then((r) => r.data),
    refetchInterval: 60_000,
  });

  if (isLoading) {
    return (
      <Card>
        <div className="h-4 w-40 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="h-80 bg-gray-100 rounded-xl animate-pulse" />
      </Card>
    );
  }

  if (regions.length === 0) {
    return (
      <Card>
        <p className="text-sm text-gray-400 text-center py-16">Ma'lumot topilmadi</p>
      </Card>
    );
  }

  const chartData = [...regions]
    .sort((a, b) => b.total - a.total)
    .map((r) => ({
      name: r.name,
      Murojaatlar: r.requests,
      "Xizmat arizalari": r.services,
      "MSK buyurtmalar": r.msk,
    }));

  const chartHeight = Math.max(320, chartData.length * 36 + 60);

  return (
    <div className="space-y-4">
      <Card title="Viloyatlar bo'yicha taqqoslama">
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 4, right: 16, left: 4, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10, fill: "#9CA3AF" }} />
            <YAxis
              type="category"
              dataKey="name"
              width={140}
              tick={{ fontSize: 11, fill: "#374151" }}
            />
            <Tooltip content={<RegionTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
            />
            <Bar
              dataKey="Murojaatlar"
              stackId="a"
              fill="#3B82F6"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="Xizmat arizalari"
              stackId="a"
              fill="#F59E0B"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="MSK buyurtmalar"
              stackId="a"
              fill="#EC4899"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Summary table */}
      <Card title="Batafsil jadval">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 pr-4 text-gray-500 font-medium">Viloyat</th>
                <th className="text-right py-2 px-2 text-blue-600 font-medium">Murojaatlar</th>
                <th className="text-right py-2 px-2 text-yellow-600 font-medium">Xizmatlar</th>
                <th className="text-right py-2 px-2 text-pink-600 font-medium">MSK</th>
                <th className="text-right py-2 pl-2 text-gray-700 font-semibold">Jami</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((row) => (
                <tr
                  key={row.name}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-2 pr-4 text-gray-800 font-medium">{row.name}</td>
                  <td className="py-2 px-2 text-right text-gray-700">{row.Murojaatlar}</td>
                  <td className="py-2 px-2 text-right text-gray-700">{row["Xizmat arizalari"]}</td>
                  <td className="py-2 px-2 text-right text-gray-700">{row["MSK buyurtmalar"]}</td>
                  <td className="py-2 pl-2 text-right font-semibold text-gray-900">
                    {row.Murojaatlar + row["Xizmat arizalari"] + row["MSK buyurtmalar"]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default RegionBreakdown;
