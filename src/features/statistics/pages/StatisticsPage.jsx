import { useState } from "react";
import {
  RefreshCw,
  FileText,
  AlertTriangle,
  Wrench,
  MapPin,
} from "lucide-react";
import { useComprehensiveStats } from "../hooks/useStatistics";
import OverviewCards from "../components/OverviewCards";
import TrendChart from "../components/TrendChart";
import RequestsStats from "../components/RequestsStats";
import ServiceReportsStats from "../components/ServiceReportsStats";
import MskStats from "../components/MskStats";
import RegionalStats from "../components/RegionalStats";

const TABS = [
  { id: "requests", label: "Murojaatlar", icon: FileText, module: "requests" },
  {
    id: "services",
    label: "Servis reportlar",
    icon: AlertTriangle,
    module: "services",
  },
  { id: "msk", label: "MSK buyurtmalar", icon: Wrench, module: "msk" },
  { id: "regional", label: "Hududlar", icon: MapPin, module: null },
];

const TabButton = ({ tab, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
      isActive
        ? "border-blue-600 text-blue-600"
        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
    }`}
  >
    <tab.icon className="w-4 h-4" />
    {tab.label}
  </button>
);

const StatisticsPage = () => {
  const user = JSON.parse(localStorage.getItem("admin_user") || "{}");
  const isOwner = user.role === "owner";
  const permissions = user.permissions || {};

  const hasRequestsAccess = isOwner || permissions.requests?.access !== "off";
  const hasServicesAccess = isOwner || permissions.services?.access !== "off";
  const hasMskAccess = isOwner || permissions.msk?.access !== "off";

  const visibleTabs = TABS.filter((tab) => {
    if (tab.module === "requests") return hasRequestsAccess;
    if (tab.module === "services") return hasServicesAccess;
    if (tab.module === "msk") return hasMskAccess;
    return true; // regional tab always visible
  });

  const [activeTab, setActiveTab] = useState(visibleTabs[0]?.id || "regional");

  const {
    data: stats,
    isLoading,
    dataUpdatedAt,
    refetch,
    isFetching,
  } = useComprehensiveStats();

  const formattedTime = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString("uz-UZ", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : null;

  const visibleModules = [
    hasRequestsAccess && "requests",
    hasServicesAccess && "serviceReports",
    hasMskAccess && "mskOrders",
  ].filter(Boolean);

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isOwner
              ? "Umumiy tizim statistikasi — real vaqt rejimida"
              : "Tayinlangan hudud statistikasi — real vaqt rejimida"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {formattedTime && (
            <div className="text-right">
              <p className="text-xs text-gray-400">So'nggi yangilanish</p>
              <p className="text-xs font-medium text-gray-600">
                {formattedTime}
              </p>
            </div>
          )}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 px-4 py-2 text-sm border rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
            />
            Yangilash
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <OverviewCards stats={stats} isLoading={isLoading} isOwner={isOwner} />

      {/* Trend Chart */}
      <div className="mb-6">
        <TrendChart visibleModules={visibleModules} />
      </div>

      {/* Module Tabs */}
      <div className="border-b mb-6 flex gap-1">
        {visibleTabs.map((tab) => (
          <TabButton
            key={tab.id}
            tab={tab}
            isActive={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          />
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "requests" && hasRequestsAccess && (
        <RequestsStats data={stats?.requests} isLoading={isLoading} />
      )}
      {activeTab === "services" && hasServicesAccess && (
        <ServiceReportsStats
          data={stats?.serviceReports}
          isLoading={isLoading}
        />
      )}
      {activeTab === "msk" && hasMskAccess && (
        <MskStats data={stats?.mskOrders} isLoading={isLoading} />
      )}
      {activeTab === "regional" && <RegionalStats />}
    </div>
  );
};

export default StatisticsPage;
