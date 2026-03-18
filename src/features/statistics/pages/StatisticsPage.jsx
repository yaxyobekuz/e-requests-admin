// React
import { useState } from "react";

// Data
import { PERIOD_OPTIONS } from "../data/statistics.data";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Components
import MskStats from "../components/MskStats";
import HarvestStats from "../components/HarvestStats";
import StatsOverview from "../components/StatsOverview";
import RequestsStats from "../components/RequestsStats";
import ServicesStats from "../components/ServicesStats";
import RegionBreakdown from "../components/RegionBreakdown";
import RegionDistrictPicker from "@/shared/components/ui/RegionDistrictPicker";
import Card from "@/shared/components/ui/Card";
import { cn } from "@/shared/utils/cn";

const TABS = [
  { key: "requests", label: "Murojaatlar" },
  { key: "services", label: "Xizmat arizalari" },
  { key: "msk", label: "MSK buyurtmalar" },
  { key: "regions", label: "Hududlar" },
  { key: "tomorqa", label: "Tomorqa" },
];

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
        <h1 className="text-2xl font-bold">Statistika</h1>

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
      <div className="grid grid-cols-2 gap-4">
        {/* Left Col - Map selector */}
        <div className="relative size-full">
          <RegionDistrictPicker
            className="sticky top-4 inset-x-0"
            onRegionChange={handleRegionChange}
            onDistrictChange={handleDistrictChange}
          />
        </div>

        {/* Right col - Tab contents */}
        <div className="relative space-y-4">
          {/* Module tabs */}
          <Card className="flex !p-1 sticky top-4 inset-x-0 z-10">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "grow py-1.5 rounded-xl text-sm transition-colors",
                  activeTab === tab.key
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:text-primary",
                )}
              >
                {tab.label}
              </button>
            ))}
          </Card>

          {/* Tab content */}
          {activeTab === "requests" && <RequestsStats filters={filters} />}
          {activeTab === "services" && <ServicesStats filters={filters} />}
          {activeTab === "msk" && <MskStats filters={filters} />}
          {activeTab === "regions" && <RegionBreakdown filters={filters} />}
          {activeTab === "tomorqa" && <HarvestStats filters={filters} />}
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;
