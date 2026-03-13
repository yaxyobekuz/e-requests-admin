// Recharts
import {
  Pie,
  Cell,
  Legend,
  Tooltip,
  PieChart,
  ResponsiveContainer,
} from "recharts";

// Icons
import {
  MapPin,
  FileText,
  ArrowLeft,
  FolderKanban,
  AlertTriangle,
} from "lucide-react";

// Utils
import { cn } from "@/shared/utils/cn";

// Map components
import uzbekistanRegions, {
  getRegionByLabel,
} from "./map/data/uzbekistan.data";
import UzbekistanMap from "./map/UzbekistanMap";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// APIs
import { regionsAPI } from "@/shared/api";
import { statsAPI } from "@/features/statistics/api";

// Data
import {
  REQUEST_STATUS_COLORS,
  REQUEST_STATUS_LABELS,
} from "@/features/statistics/data/statistics.data";

// Components
import KpiCard from "./KpiCard";
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

const StatsByMap = () => {
  const {
    selectedRegion,
    selectedRegionId,
    selectedDistrict,
    selectedDistrictId,
    setFields,
  } = useObjectState({
    selectedRegion: null,
    selectedRegionId: null,
    selectedDistrict: null,
    selectedDistrictId: null,
  });

  const { data: regionsList = [] } = useQuery({
    queryKey: ["regions", "list", "region"],
    queryFn: () => regionsAPI.getAll({ type: "region" }).then((r) => r.data),
    staleTime: 10 * 60 * 1000,
  });

  const { data: districtsList = [] } = useQuery({
    queryKey: ["regions", "list", "district", selectedRegionId],
    queryFn: () =>
      regionsAPI
        .getAll({ type: "district", parent: selectedRegionId })
        .then((r) => r.data),
    enabled: !!selectedRegionId,
    staleTime: 10 * 60 * 1000,
  });

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: [
      "stats",
      "overview",
      {
        regionId: selectedRegionId,
        districtId: selectedDistrictId,
        period: "30",
      },
    ],
    queryFn: () =>
      statsAPI
        .getOverview({
          period: "30",
          regionId: selectedRegionId,
          districtId: selectedDistrictId || undefined,
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
        period: "30",
      },
    ],
    queryFn: () =>
      statsAPI
        .getRequests({
          period: "30",
          regionId: selectedRegionId,
          districtId: selectedDistrictId || undefined,
        })
        .then((r) => r.data),
    enabled: !!selectedRegionId,
    refetchInterval: 60_000,
  });

  const RegionMapComponent =
    getRegionByLabel(selectedRegion)?.component ||
    uzbekistanRegions[0].component;

  const handleMapRegionClick = (label) => {
    const region = regionsList.find(
      (r) => r.name.trim().toLowerCase() === label?.trim().toLowerCase(),
    );
    setFields({
      selectedRegion: label,
      selectedRegionId: region?._id || null,
      selectedDistrict: null,
      selectedDistrictId: null,
    });
  };

  const handleMapDistrictClick = (label) => {
    const district = districtsList.find(
      (d) => d.name.trim().toLowerCase() === label?.trim().toLowerCase(),
    );
    setFields({
      selectedDistrict: label,
      selectedDistrictId: district?._id || null,
    });
  };

  const handleSelectRegion = (regionId) => {
    const region = regionsList.find((r) => r._id === regionId);
    if (!region) return;
    setFields({
      selectedRegion: region.name,
      selectedRegionId: region._id,
      selectedDistrict: null,
      selectedDistrictId: null,
    });
  };

  const handleSelectDistrict = (districtId) => {
    const district = districtsList.find((d) => d._id === districtId);
    if (!district) return;
    setFields({
      selectedDistrict: district.name,
      selectedDistrictId: district._id,
    });
  };

  const handleBackToUzbekistan = () => {
    setFields({
      selectedRegion: null,
      selectedRegionId: null,
      selectedDistrict: null,
      selectedDistrictId: null,
    });
  };

  return (
    <div className="mb-4 grid grid-cols-2 gap-4">
      {/* Left col: map + selects */}
      <div>
        <div className="flex items-center gap-4 mb-4">
          <Select
            className="flex-1"
            onChange={handleSelectRegion}
            value={selectedRegionId || ""}
            placeholder="Viloyatni tanlang"
            triggerClassName="rounded-2xl border-none"
            options={regionsList.map((region) => ({
              value: region._id,
              label: region.name,
            }))}
          />

          <Select
            className="flex-1"
            disabled={!selectedRegionId}
            placeholder="Tumanni tanlang"
            onChange={handleSelectDistrict}
            value={selectedDistrictId || ""}
            triggerClassName="rounded-2xl border-none"
            options={districtsList.map((district) => ({
              value: district._id,
              label: district.name,
            }))}
          />
        </div>

        {/* Map */}
        <Card className="relative">
          {/* Uzbekistan map */}
          <UzbekistanMap
            value={selectedRegion}
            className={cn(
              "w-full h-auto aspect-square origin-bottom transition-all duration-500",
              selectedRegion
                ? "scale-0 opacity-0 pointer-events-none"
                : "scale-100 opacity-100",
            )}
            onChange={handleMapRegionClick}
          />

          {/* Regional (district-level) map */}
          <div
            className={cn(
              "absolute inset-0 w-full h-auto aspect-square origin-top transition-all duration-500",
              selectedRegion
                ? "scale-100 opacity-100"
                : "scale-0 opacity-0 pointer-events-none",
            )}
          >
            <RegionMapComponent
              value={selectedDistrict}
              onChange={handleMapDistrictClick}
              className="w-full h-auto aspect-square"
            />
          </div>

          {selectedRegion && (
            <Button
              onClick={handleBackToUzbekistan}
              className="absolute top-5 left-5 animate__animated animate__fadeIn"
            >
              <ArrowLeft strokeWidth={1.5} className="size-3.5" />
              O'zbekiston xaritasiga qaytish
            </Button>
          )}
        </Card>
      </div>

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
            overviewLoading={overviewLoading}
          />
        )}
      </div>
    </div>
  );
};

const EmptyState = () => (
  <Card className="h-full flex flex-col items-center justify-center text-center gap-3 min-h-64">
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
);

const StatsPanel = ({
  regionName,
  districtName,
  overview,
  reqStats,
  overviewLoading,
  reqLoading,
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
          {districtName ? `${regionName} - ${districtName}` : regionName}
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

export default StatsByMap;
