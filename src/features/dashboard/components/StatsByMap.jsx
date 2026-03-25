// Recharts
import {
  Pie,
  Cell,
  Legend,
  Tooltip,
  PieChart,
  ResponsiveContainer,
} from "recharts";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Data
import {
  REQUEST_STATUS_COLORS,
  REQUEST_STATUS_LABELS,
} from "@/features/statistics/data/statistics.data";

// APIs
import { statsAPI } from "@/features/statistics/api";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Icons
import { MapPin, FileText, FolderKanban, AlertTriangle } from "lucide-react";

// Components
import KpiCard from "./KpiCard";
import Card from "@/shared/components/ui/Card";
import RegionDistrictPicker from "@/shared/components/ui/RegionDistrictPicker";

const StatsByMap = () => {
  const {
    state,
    setFields,
    selectedRegion,
    selectedRegionId,
    selectedDistrict,
    selectedDistrictId,
    selectedNeighborhood,
    selectedNeighborhoodId,
  } = useObjectState({
    selectedRegion: null,
    selectedRegionId: null,
    selectedDistrict: null,
    selectedDistrictId: null,
    selectedNeighborhood: null,
    selectedNeighborhoodId: null,
  });

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: [
      "stats",
      "overview",
      {
        regionId: selectedRegionId,
        districtId: selectedDistrictId,
        neighborhoodId: selectedNeighborhoodId,
        period: "30",
      },
    ],
    queryFn: () =>
      statsAPI
        .getOverview({
          period: "30",
          regionId: selectedRegionId,
          districtId: selectedDistrictId || undefined,
          neighborhoodId: selectedNeighborhoodId || undefined,
        })
        .then((r) => r.data),
    enabled: !!selectedRegionId,
    refetchInterval: 60_000,
  });

  const { data: reqStats, isLoading: reqLoading } = useQuery({
    queryKey: [
      "stats",
      "requests",
      {
        regionId: selectedRegionId,
        districtId: selectedDistrictId,
        neighborhoodId: selectedNeighborhoodId,
        period: "30",
      },
    ],
    queryFn: () =>
      statsAPI
        .getRequests({
          period: "30",
          regionId: selectedRegionId,
          districtId: selectedDistrictId || undefined,
          neighborhoodId: selectedNeighborhoodId || undefined,
        })
        .then((r) => r.data),
    enabled: !!selectedRegionId,
    refetchInterval: 60_000,
  });

  const handleRegionChange = (regionId, regionName) => {
    setFields({
      selectedRegion: regionName,
      selectedRegionId: regionId,
      selectedDistrict: null,
      selectedDistrictId: null,
      selectedNeighborhood: null,
      selectedNeighborhoodId: null,
    });
  };

  const handleDistrictChange = (districtId, districtName) => {
    setFields({
      selectedDistrict: districtName,
      selectedDistrictId: districtId,
      selectedNeighborhood: null,
      selectedNeighborhoodId: null,
    });
  };

  const handleNeighborhoodChange = (neighborhoodId, neighborhoodName) => {
    setFields({
      selectedNeighborhood: neighborhoodName,
      selectedNeighborhoodId: neighborhoodId,
    });
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Left col: map + selects */}
      <RegionDistrictPicker
        onRegionChange={handleRegionChange}
        onDistrictChange={handleDistrictChange}
        onNeighborhoodChange={handleNeighborhoodChange}
      />

      {/* Right col: stats panel */}
      <div>
        {!selectedRegionId ? (
          <EmptyState />
        ) : (
          <StatsPanel
            overview={overview}
            reqStats={reqStats}
            reqLoading={reqLoading}
            regionName={selectedRegion}
            districtName={selectedDistrict}
            neighborhoodName={selectedNeighborhood}
            overviewLoading={overviewLoading}
          />
        )}
      </div>
    </div>
  );
};

const StatsPanel = ({
  overview,
  reqStats,
  regionName,
  reqLoading,
  districtName,
  neighborhoodName,
  overviewLoading,
}) => {
  const byStatus = reqStats?.byStatus || [];
  const total = byStatus.reduce((s, x) => s + x.count, 0);
  const resolved = byStatus.find((x) => x._id === "resolved")?.count || 0;
  const resolvedPct = total > 0 ? Math.round((resolved / total) * 100) : 0;

  const pieData = byStatus.map((s) => ({
    name: REQUEST_STATUS_LABELS[s._id] || s._id,
    value: s.count,
    color: REQUEST_STATUS_COLORS[s._id] || "#9CA3AF",
  }));

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Region header */}
      <Card className="flex items-center gap-2.5 h-10 !py-0 !px-3.5">
        <MapPin className="size-4 text-blue-600" strokeWidth={1.5} />
        <p className="font-semibold text-gray-900 leading-tight">
          {neighborhoodName
            ? `${regionName} - ${districtName} - ${neighborhoodName}`
            : districtName
              ? `${regionName} - ${districtName}`
              : regionName}
        </p>
      </Card>

      {/* KPI mini-cards */}
      <div className="grid grid-cols-2 gap-4">
        <KpiCard
          label="Murojaatlar"
          loading={overviewLoading}
          value={overview?.requests}
          iconColor="text-blue-600 bg-blue-50"
          icon={<FileText className="size-5" strokeWidth={1.5} />}
        />
        <KpiCard
          label="Xizmat arizalari"
          value={overview?.services}
          loading={overviewLoading}
          iconColor="text-yellow-600 bg-yellow-50"
          icon={<AlertTriangle className="size-5" strokeWidth={1.5} />}
        />
        <KpiCard
          value={overview?.msk}
          className="col-span-2"
          label="MSK buyurtmalar"
          loading={overviewLoading}
          iconColor="text-pink-600 bg-pink-50"
          icon={<FolderKanban className="size-5" strokeWidth={1.5} />}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-3 flex-1">
        {/* Status pie chart */}
        <Card>
          <p className="text-xs font-semibold text-gray-600 mb-2">
            Murojaatlar holati
          </p>
          {reqLoading ? (
            <div className="h-36 bg-gray-100 rounded-xl animate-pulse" />
          ) : pieData.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-10">
              Ma'lumot topilmadi
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={38}
                  outerRadius={58}
                  dataKey="value"
                  paddingAngle={2}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #E5E7EB",
                    fontSize: 11,
                  }}
                  formatter={(v, n) => [v, n]}
                />
                <Legend
                  iconType="circle"
                  iconSize={7}
                  wrapperStyle={{ fontSize: 10 }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Resolution rate + status progress bars */}
        <Card>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-600">Bajarilganlik</p>
            <span className="text-lg font-bold text-green-600">
              {resolvedPct}%
            </span>
          </div>

          <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
            <div
              style={{ width: `${resolvedPct}%` }}
              className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-700"
            />
          </div>

          {reqLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-3 bg-gray-100 rounded animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-1.5">
              {byStatus.map((s) => {
                const pct = total > 0 ? Math.round((s.count / total) * 100) : 0;
                const color = REQUEST_STATUS_COLORS[s._id] || "#9CA3AF";
                return (
                  <div key={s._id} className="flex items-center gap-2">
                    <span
                      className="size-2 rounded-full flex-shrink-0"
                      style={{ background: color }}
                    />
                    <span className="text-[10px] text-gray-500 truncate flex-1">
                      {REQUEST_STATUS_LABELS[s._id] || s._id}
                    </span>
                    <span className="text-[10px] font-medium text-gray-700 flex-shrink-0">
                      {s.count}
                    </span>
                    <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

const EmptyState = () => (
  <div className="flex flex-col gap-4 h-full">
    {/* Top */}
    <Card className="flex items-center gap-2.5 h-10 !py-0 !px-3.5">
      <MapPin className="size-4 text-blue-600" strokeWidth={1.5} />
      <p className="font-semibold text-gray-900 leading-tight">O'zbekiston</p>
    </Card>

    {/* Main */}
    <Card className="flex flex-col items-center justify-center text-center gap-3 min-h-64 grow">
      <div className="size-14 bg-blue-50 rounded-2xl flex items-center justify-center">
        <MapPin className="size-7 text-blue-400" strokeWidth={1.5} />
      </div>
      <div>
        <p className="font-semibold text-gray-700">Hududni tanlang</p>
        <p className="text-sm text-gray-400 mt-1">
          Xaritada viloyatni bosing yoki yuqoridagi <br /> variantlardan birini
          tanlang
        </p>
      </div>
    </Card>
  </div>
);

export default StatsByMap;
