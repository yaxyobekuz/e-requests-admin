import { useState } from "react";
import { BarChart2 } from "lucide-react";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Data
import { PERIOD_OPTIONS } from "../data/statistics.data";

// Components
import StatsOverview from "../components/StatsOverview";
import StatsMap from "../components/StatsMap";
import RequestsStats from "../components/RequestsStats";
import ServicesStats from "../components/ServicesStats";
import MskStats from "../components/MskStats";
import RegionBreakdown from "../components/RegionBreakdown";
import HarvestStats from "../components/HarvestStats";

const TABS = [
  { key: "requests", label: "Murojaatlar" },
  { key: "services", label: "Xizmat arizalari" },
  { key: "msk",      label: "MSK buyurtmalar" },
  { key: "regions",  label: "Hududlar" },
  { key: "tomorqa",  label: "Tomorqa" },
];

/**
 * StatisticsPage — main analytics page.
 * Holds period + region/district filter state, passes down to all child components.
 *
 * @returns {JSX.Element}
 */
const StatisticsPage = () => {
  const [activeTab, setActiveTab] = useState("requests");

  const { period, regionId, districtId, setFields, setField } = useObjectState({
    period: "30",
    regionId: null,
    districtId: null,
  });

  const filters = { period, regionId, districtId };

  const handleRegionChange = (id, _label) => {
    setFields({ regionId: id || null, districtId: null });
  };

  const handleDistrictChange = (id) => {
    setField("districtId", id || null);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="size-9 bg-blue-50 rounded-xl flex items-center justify-center">
            <BarChart2 className="size-5 text-blue-600" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Statistika</h1>
            <p className="text-xs text-gray-500">Barcha ko'rsatkichlar real vaqtda yangilanib turadi</p>
          </div>
        </div>

        {/* Period filter */}
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setField("period", opt.value)}
              className={
                period === opt.value
                  ? "px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white transition-all"
                  : "px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
              }
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <StatsOverview filters={filters} />

      {/* Map + select region/district filter */}
      <StatsMap
        onRegionChange={handleRegionChange}
        onDistrictChange={handleDistrictChange}
      />

      {/* Module tabs */}
      <div className="mb-4">
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={
                activeTab === tab.key
                  ? "px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white transition-all"
                  : "px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "requests" && <RequestsStats filters={filters} />}
      {activeTab === "services" && <ServicesStats filters={filters} />}
      {activeTab === "msk"      && <MskStats filters={filters} />}
      {activeTab === "regions"  && <RegionBreakdown filters={filters} />}
      {activeTab === "tomorqa"  && <HarvestStats filters={filters} />}
    </div>
  );
};

export default StatisticsPage;
