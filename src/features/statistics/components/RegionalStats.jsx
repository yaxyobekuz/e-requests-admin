import { useState, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ChevronRight, MapPin, Home } from "lucide-react";
import { useRegionalDetailed } from "../hooks/useStatistics";

const LEVEL_LABELS = {
  region: "Viloyat",
  district: "Tuman",
  neighborhood: "Mahalla",
  street: "Ko'cha",
};

const NEXT_LEVEL_MAP = {
  region: "district",
  district: "neighborhood",
  neighborhood: "street",
};

const ChartSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-5 bg-gray-200 rounded w-48 mb-4" />
    <div className="bg-gray-100 rounded h-72" />
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border rounded-lg shadow-lg px-3 py-2 text-sm">
        <p className="font-semibold text-gray-800 mb-2">{label}</p>
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: p.fill }}
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

const StreetTable = ({ items }) => (
  <div className="bg-white rounded-xl border overflow-hidden">
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-gray-50 border-b">
          <th className="px-4 py-3 text-left font-medium text-gray-600">Ko'cha nomi</th>
          <th className="px-4 py-3 text-right font-medium text-blue-600">Murojaatlar</th>
          <th className="px-4 py-3 text-right font-medium text-orange-600">Servis reportlar</th>
          <th className="px-4 py-3 text-right font-medium text-purple-600">MSK buyurtmalar</th>
          <th className="px-4 py-3 text-right font-medium text-gray-600">Jami</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {items.length === 0 ? (
          <tr>
            <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
              Ma'lumot mavjud emas
            </td>
          </tr>
        ) : (
          items.map((item, i) => (
            <tr key={i} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-gray-800 font-medium">
                <div className="flex items-center gap-2">
                  <Home className="w-3.5 h-3.5 text-gray-400" />
                  {item.name}
                </div>
              </td>
              <td className="px-4 py-3 text-right font-semibold text-blue-600">
                {item.requests}
              </td>
              <td className="px-4 py-3 text-right font-semibold text-orange-600">
                {item.serviceReports}
              </td>
              <td className="px-4 py-3 text-right font-semibold text-purple-600">
                {item.mskOrders}
              </td>
              <td className="px-4 py-3 text-right font-bold text-gray-800">
                {item.total}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

const RegionalStats = () => {
  // Breadcrumb stack: [{ id, name, type }]
  const [breadcrumb, setBreadcrumb] = useState([]);

  const currentItem = breadcrumb[breadcrumb.length - 1] || null;
  const queryParams = currentItem
    ? { regionId: currentItem.id, regionType: currentItem.type }
    : {};

  const { data: regional, isLoading } = useRegionalDetailed(queryParams);

  const currentLevel = regional?.level || "region";
  const items = regional?.items || [];
  const isStreetLevel = currentLevel === "street";

  const handleDrillDown = useCallback(
    (item) => {
      if (!item._id) return;

      // The items shown are at `currentLevel` (returned by the backend).
      // To drill into one of them, we send { regionId: item._id, regionType: currentLevel }.
      // currentLevel is "region" when no filter, "district" when filtered by region, etc.
      const clickedItemType = currentLevel === "street" ? null : currentLevel;
      if (!clickedItemType || clickedItemType === "street") return;

      setBreadcrumb((prev) => [
        ...prev,
        { id: item._id.toString(), name: item.name, type: clickedItemType },
      ]);
    },
    [currentLevel]
  );

  const handleBreadcrumbClick = (index) => {
    if (index === -1) {
      setBreadcrumb([]);
    } else {
      setBreadcrumb((prev) => prev.slice(0, index + 1));
    }
  };

  const chartHeight = Math.max(280, items.length * 38);

  const canDrillDown = !isStreetLevel && currentLevel !== "street";

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex items-center gap-1.5 flex-wrap text-sm">
          <button
            onClick={() => handleBreadcrumbClick(-1)}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
          >
            <MapPin className="w-3.5 h-3.5" />
            O'zbekiston (Barchasi)
          </button>
          {breadcrumb.map((crumb, idx) => (
            <span key={idx} className="flex items-center gap-1.5">
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              <button
                onClick={() => handleBreadcrumbClick(idx)}
                className={`font-medium transition-colors ${
                  idx === breadcrumb.length - 1
                    ? "text-gray-800 cursor-default"
                    : "text-blue-600 hover:text-blue-800"
                }`}
              >
                {crumb.name}
              </button>
            </span>
          ))}
        </div>

        {currentItem && (
          <div className="mt-2 flex gap-2">
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {LEVEL_LABELS[currentLevel]} darajasi ko'rsatilmoqda
            </span>
          </div>
        )}
      </div>

      {/* Chart / Table */}
      <div className="bg-white rounded-xl border p-5">
        {isLoading ? (
          <ChartSkeleton />
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
            Ma'lumot mavjud emas
          </div>
        ) : isStreetLevel ? (
          <>
            <h3 className="font-semibold mb-4">
              Ko'cha darajasida statistika
              <span className="text-sm font-normal text-gray-400 ml-2">
                ({items.length} ta ko'cha)
              </span>
            </h3>
            <StreetTable items={items} />
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">
                {LEVEL_LABELS[currentLevel] || "Hudud"} bo'yicha statistika
                <span className="text-sm font-normal text-gray-400 ml-2">
                  ({items.length} ta)
                </span>
              </h3>
              {canDrillDown && (
                <p className="text-xs text-gray-400">
                  Batafsil ko'rish uchun ustiga bosing
                </p>
              )}
            </div>
            <ResponsiveContainer width="100%" height={chartHeight}>
              <BarChart
                data={items}
                layout="vertical"
                margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                onClick={(chartData) => {
                  if (chartData?.activePayload && canDrillDown) {
                    const item = items.find(
                      (i) => i.name === chartData.activeLabel
                    );
                    if (item) handleDrillDown(item);
                  }
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#F3F4F6"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{
                    fontSize: 11,
                    fill: canDrillDown ? "#3B82F6" : "#374151",
                    cursor: canDrillDown ? "pointer" : "default",
                  }}
                  width={140}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(v) => <span className="text-xs">{v}</span>} />
                <Bar
                  dataKey="requests"
                  fill="#3B82F6"
                  name="Murojaatlar"
                  radius={[0, 2, 2, 0]}
                  maxBarSize={16}
                  cursor={canDrillDown ? "pointer" : "default"}
                />
                <Bar
                  dataKey="serviceReports"
                  fill="#F97316"
                  name="Servis reportlar"
                  radius={[0, 2, 2, 0]}
                  maxBarSize={16}
                  cursor={canDrillDown ? "pointer" : "default"}
                />
                <Bar
                  dataKey="mskOrders"
                  fill="#A855F7"
                  name="MSK buyurtmalar"
                  radius={[0, 2, 2, 0]}
                  maxBarSize={16}
                  cursor={canDrillDown ? "pointer" : "default"}
                />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </div>

      {/* Summary table for non-street levels */}
      {!isLoading && !isStreetLevel && items.length > 0 && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="px-5 py-3 border-b bg-gray-50">
            <h3 className="font-semibold text-sm">
              Batafsil jadval
              {canDrillDown && (
                <span className="ml-2 text-xs font-normal text-blue-500">
                  (Qatorni bosib pastga tushishingiz mumkin)
                </span>
              )}
            </h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2.5 text-left font-medium text-gray-500">
                  {LEVEL_LABELS[currentLevel] || "Hudud"}
                </th>
                <th className="px-4 py-2.5 text-right font-medium text-blue-500">Murojaatlar</th>
                <th className="px-4 py-2.5 text-right font-medium text-orange-500">Servis</th>
                <th className="px-4 py-2.5 text-right font-medium text-purple-500">MSK</th>
                <th className="px-4 py-2.5 text-right font-medium text-gray-500">Jami</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((item, i) => (
                <tr
                  key={i}
                  className={`hover:bg-blue-50 transition-colors ${
                    canDrillDown ? "cursor-pointer" : ""
                  }`}
                  onClick={() => canDrillDown && handleDrillDown(item)}
                >
                  <td className="px-4 py-2.5 font-medium text-gray-800">
                    <div className="flex items-center gap-2">
                      {canDrillDown && (
                        <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
                      )}
                      {item.name}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold text-blue-600">
                    {item.requests}
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold text-orange-600">
                    {item.serviceReports}
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold text-purple-600">
                    {item.mskOrders}
                  </td>
                  <td className="px-4 py-2.5 text-right font-bold text-gray-800">
                    {item.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RegionalStats;
