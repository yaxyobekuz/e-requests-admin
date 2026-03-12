import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

// API
import { statsAPI } from "../api";
import { productsAPI } from "@/shared/api";

// Components
import Card from "@/shared/components/ui/Card";

// Data
import { HARVEST_SEASON_LABELS } from "../data/statistics.data";

/** Chart color palette for products */
const COLORS = ["#22C55E", "#3B82F6", "#F59E0B", "#EC4899", "#8B5CF6", "#F97316", "#14B8A6"];

/**
 * Custom bar chart tooltip.
 * @param {{ active: boolean, payload: Array, label: string }} props
 */
const HarvestTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm min-w-[160px]">
      <p className="font-semibold text-gray-800 mb-1">{label}</p>
      <div className="flex items-center justify-between gap-4">
        <span className="text-gray-500">O'rtacha kg/sotix</span>
        <span className="font-bold text-emerald-700">{payload[0]?.value}</span>
      </div>
      {payload[0]?.payload?.count && (
        <div className="flex items-center justify-between gap-4 mt-0.5">
          <span className="text-gray-400 text-xs">Ma'lumotlar</span>
          <span className="text-gray-600 text-xs">{payload[0].payload.count} ta</span>
        </div>
      )}
    </div>
  );
};

/**
 * HarvestStats — hosil statistikasini mahsulot va hudud bo'yicha ko'rsatadi.
 * Admin statistika sahifasidagi "Tomorqa" tabida ishlatiladi.
 *
 * @param {{ filters: { period: string, regionId: string|null, districtId: string|null } }} props
 * @returns {JSX.Element}
 */
const HarvestStats = ({ filters }) => {
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => productsAPI.getAll().then((r) => r.data),
    staleTime: 10 * 60 * 1000,
  });

  const harvestParams = {
    ...(selectedProductId && { productId: selectedProductId }),
    ...(selectedYear && { year: Number(selectedYear) }),
    ...(filters.regionId && { regionId: filters.regionId }),
  };

  const { data: overview = [], isLoading: overviewLoading } = useQuery({
    queryKey: ["stats", "harvest", "overview", harvestParams],
    queryFn: () => statsAPI.getHarvestOverview(harvestParams).then((r) => r.data),
    refetchInterval: 60_000,
  });

  const { data: byRegion = [], isLoading: regionLoading } = useQuery({
    queryKey: ["stats", "harvest", "by-region", harvestParams],
    queryFn: () => statsAPI.getHarvestByRegion(harvestParams).then((r) => r.data),
    refetchInterval: 60_000,
  });

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

  // Build bar chart data grouped by product name
  const productChartData = overview.reduce((acc, item) => {
    const existing = acc.find((x) => x.name === item.productName);
    if (!existing) {
      acc.push({
        name: item.productName,
        avgPerSotix: item.avgPerSotix,
        count: item.count,
      });
    } else {
      // Average when multiple varieties
      existing.avgPerSotix = parseFloat(
        ((existing.avgPerSotix + item.avgPerSotix) / 2).toFixed(2)
      );
      existing.count += item.count;
    }
    return acc;
  }, []).sort((a, b) => b.avgPerSotix - a.avgPerSotix);

  return (
    <div className="space-y-4">
      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={selectedProductId}
          onChange={(e) => setSelectedProductId(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Barcha mahsulotlar</option>
          {products.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Barcha yillar</option>
          {yearOptions.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Bar chart by product */}
      <Card title="Mahsulotlar bo'yicha o'rtacha hosil (kg/sotix)">
        {overviewLoading ? (
          <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
        ) : productChartData.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-16">Ma'lumot topilmadi</p>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(240, productChartData.length * 44 + 60)}>
            <BarChart
              data={productChartData}
              layout="vertical"
              margin={{ top: 4, right: 24, left: 4, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#9CA3AF" }} unit=" kg" />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                tick={{ fontSize: 11, fill: "#374151" }}
              />
              <Tooltip content={<HarvestTooltip />} />
              <Bar dataKey="avgPerSotix" radius={[0, 6, 6, 0]}>
                {productChartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Detailed overview table */}
      <Card title="Batafsil jadval (mahsulot / nav / hudud)">
        {overviewLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : overview.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-12">Ma'lumot topilmadi</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 pr-3 text-gray-500 font-medium">Mahsulot</th>
                  <th className="text-left py-2 px-2 text-gray-500 font-medium">Nav</th>
                  <th className="text-left py-2 px-2 text-gray-500 font-medium">Hudud</th>
                  <th className="text-right py-2 px-2 text-emerald-600 font-medium">O'rtacha</th>
                  <th className="text-right py-2 px-2 text-blue-600 font-medium">Min</th>
                  <th className="text-right py-2 px-2 text-orange-500 font-medium">Max</th>
                  <th className="text-right py-2 pl-2 text-gray-500 font-medium">Soni</th>
                </tr>
              </thead>
              <tbody>
                {overview.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-2 pr-3 text-gray-800 font-medium">{row.productName}</td>
                    <td className="py-2 px-2 text-gray-600">{row.varietyName}</td>
                    <td className="py-2 px-2 text-gray-500">{row.regionName || "—"}</td>
                    <td className="py-2 px-2 text-right font-semibold text-emerald-700">
                      {row.avgPerSotix} kg
                    </td>
                    <td className="py-2 px-2 text-right text-blue-600">{row.minPerSotix} kg</td>
                    <td className="py-2 px-2 text-right text-orange-500">{row.maxPerSotix} kg</td>
                    <td className="py-2 pl-2 text-right text-gray-500">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* By region */}
      <Card title="Hududlar bo'yicha hosil">
        {regionLoading ? (
          <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
        ) : byRegion.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-12">Ma'lumot topilmadi</p>
        ) : (
          <div className="space-y-2">
            {byRegion.map((r, i) => {
              const maxAvg = byRegion[0]?.avgPerSotix || 1;
              const pct = Math.round((r.avgPerSotix / maxAvg) * 100);
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-32 text-sm text-gray-700 truncate flex-shrink-0">
                    {r.regionName || "Noma'lum"}
                  </span>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-lime-400 to-green-600"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 w-20 text-right flex-shrink-0">
                    {r.avgPerSotix} kg/sotix
                  </span>
                  <span className="text-xs text-gray-400 w-12 text-right flex-shrink-0">
                    {r.count} ta
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default HarvestStats;
