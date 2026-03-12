import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  FileText,
  AlertTriangle,
  FolderKanban,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { cn } from "@/shared/utils/cn";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// APIs
import { regionsAPI } from "@/shared/api";
import { statsAPI } from "@/features/statistics/api";

// Map components
import UzbekistanMap from "./map/UzbekistanMap";
import uzbekistanRegions, {
  getRegionByLabel,
} from "./map/data/uzbekistan.data";

// Data
import {
  REQUEST_STATUS_COLORS,
  REQUEST_STATUS_LABELS,
} from "@/features/statistics/data/statistics.data";

// UI
import Card from "@/shared/components/ui/Card";
import Button from "@/shared/components/ui/button/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/shadcn/select";

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

  const handleClear = () => {
    setFields({
      selectedRegion: null,
      selectedRegionId: null,
      selectedDistrict: null,
      selectedDistrictId: null,
    });
  };

  const statsLink = selectedDistrictId
    ? `/statistics?regionId=${selectedRegionId}&districtId=${selectedDistrictId}`
    : selectedRegionId
      ? `/statistics?regionId=${selectedRegionId}`
      : "/statistics";

  return (
    <div className="mb-4 grid grid-cols-2 gap-4">
      {/* Left col: map + selects */}
      <div className="">
        <div className="flex items-center gap-4 mb-4">
          <Select
            value={selectedRegionId || ""}
            onValueChange={handleSelectRegion}
          >
            <SelectTrigger className="border border-gray-200 rounded-xl bg-gray-50 text-sm h-9">
              <SelectValue placeholder="Viloyatni tanlang" />
            </SelectTrigger>
            <SelectContent>
              {regionsList.map((r) => (
                <SelectItem key={r._id} value={r._id}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedDistrictId || ""}
            onValueChange={handleSelectDistrict}
            disabled={!selectedRegionId}
          >
            <SelectTrigger className="border border-gray-200 rounded-xl bg-gray-50 text-sm h-9 disabled:opacity-40">
              <SelectValue
                placeholder={
                  selectedRegionId
                    ? "Tumanni tanlang"
                    : "Avval viloyatni tanlang"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {districtsList.map((d) => (
                <SelectItem key={d._id} value={d._id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
              onClick={handleClear}
              className="absolute top-5 left-5 animate__animated animate__fadeIn"
            >
              <ArrowLeft strokeWidth={1.5} className="size-3.5" />
              O'zbekiston xaritasiga qaytish
            </Button>
          )}
        </Card>
      </div>

      {/* Right col: stats panel */}
      <div className="">
        {!selectedRegionId ? (
          <EmptyState />
        ) : (
          <StatsPanel
            regionName={selectedRegion}
            districtName={selectedDistrict}
            overview={overview}
            reqStats={reqStats}
            overviewLoading={overviewLoading}
            reqLoading={reqLoading}
            statsLink={statsLink}
          />
        )}
      </div>
    </div>
  );
};

/** Placeholder shown when no region is selected */
const EmptyState = () => (
  <Card className="h-full flex flex-col items-center justify-center text-center gap-3 min-h-64">
    <div className="size-14 bg-blue-50 rounded-2xl flex items-center justify-center">
      <MapPin className="size-7 text-blue-400" strokeWidth={1.5} />
    </div>
    <div>
      <p className="font-semibold text-gray-700">Hududni tanlang</p>
      <p className="text-sm text-gray-400 mt-1">
        Xaritada viloyatni bosing yoki yuqoridagi selectdan tanlang
      </p>
    </div>
  </Card>
);

/**
 * Live stats panel for a selected region/district.
 *
 * @param {{ regionName, districtName, overview, reqStats, overviewLoading, reqLoading, statsLink }} props
 * @returns {JSX.Element}
 */
const StatsPanel = ({
  regionName,
  districtName,
  overview,
  reqStats,
  overviewLoading,
  reqLoading,
  statsLink,
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
    <div className="flex flex-col gap-3 h-full">
      {/* Region header */}
      <Card className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="size-8 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <MapPin className="size-4 text-blue-600" strokeWidth={1.5} />
          </div>
          <div>
            <p className="font-semibold text-gray-900 leading-tight">
              {districtName ? `${regionName} — ${districtName}` : regionName}
            </p>
            <p className="text-xs text-gray-400">So'nggi 30 kun statistikasi</p>
          </div>
        </div>
      </Card>

      {/* KPI mini-cards */}
      <div className="grid grid-cols-3 gap-3">
        <MiniKpi
          label="Murojaatlar"
          value={overview?.requests}
          loading={overviewLoading}
          icon={<FileText className="size-4" strokeWidth={1.5} />}
          color="text-blue-600 bg-blue-50"
        />
        <MiniKpi
          label="Xizmat arizalari"
          value={overview?.services}
          loading={overviewLoading}
          icon={<AlertTriangle className="size-4" strokeWidth={1.5} />}
          color="text-yellow-600 bg-yellow-50"
        />
        <MiniKpi
          label="MSK buyurtmalar"
          value={overview?.msk}
          loading={overviewLoading}
          icon={<FolderKanban className="size-4" strokeWidth={1.5} />}
          color="text-pink-600 bg-pink-50"
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
              className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-700"
              style={{ width: `${resolvedPct}%` }}
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

/**
 * Mini KPI card for the stats panel.
 *
 * @param {{ label: string, value: number, loading: boolean, icon: JSX.Element, color: string }} props
 * @returns {JSX.Element}
 */
const MiniKpi = ({ label, value, loading, icon, color }) => (
  <Card className="flex items-center gap-3 py-3">
    <div
      className={`size-8 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}
    >
      {icon}
    </div>
    <div className="min-w-0">
      {loading ? (
        <div className="h-5 w-10 bg-gray-200 rounded animate-pulse mb-1" />
      ) : (
        <p className="text-xl font-bold text-gray-900 leading-none">
          {value ?? 0}
        </p>
      )}
      <p className="text-[10px] text-gray-500 truncate">{label}</p>
    </div>
  </Card>
);

export default StatsByMap;
