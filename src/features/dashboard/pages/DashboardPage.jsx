import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { statsAPI, regionsAPI } from "@/shared/api/http";
import { FileText, AlertTriangle, Wrench, Users } from "lucide-react";

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white rounded-xl border p-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm text-gray-500">{label}</span>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
    </div>
    <p className="text-2xl font-bold">{value ?? 0}</p>
  </div>
);

const DashboardPage = () => {
  const user = JSON.parse(localStorage.getItem("admin_user") || "{}");
  const isOwner = user.role === "owner";

  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedRegionType, setSelectedRegionType] = useState("region");

  const { data: dashboardStats } = useQuery({
    queryKey: ["stats", "dashboard"],
    queryFn: () => statsAPI.getDashboard().then((res) => res.data),
  });

  const { data: regionStats } = useQuery({
    queryKey: ["stats", "region", selectedRegion],
    queryFn: () =>
      statsAPI
        .getByRegion({ regionId: selectedRegion, regionType: selectedRegionType })
        .then((res) => res.data),
    enabled: !!selectedRegion,
  });

  const { data: regions = [] } = useQuery({
    queryKey: ["regions", "region"],
    queryFn: () => regionsAPI.getAll({ type: "region" }).then((r) => r.data),
    enabled: isOwner,
  });

  const { data: districts = [] } = useQuery({
    queryKey: ["regions", "district", selectedRegion],
    queryFn: () =>
      regionsAPI
        .getAll({ type: "district", parent: selectedRegion })
        .then((r) => r.data),
    enabled: isOwner && !!selectedRegion,
  });

  const stats = selectedRegion ? regionStats : dashboardStats;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-gray-500 text-sm">
          {isOwner ? "Umumiy statistika" : "Tayinlangan hududlar statistikasi"}
        </p>
      </div>

      {/* Owner — hudud filtr */}
      {isOwner && (
        <div className="flex gap-3 mb-6">
          <select
            value={selectedRegion}
            onChange={(e) => {
              setSelectedRegion(e.target.value);
              setSelectedRegionType("region");
            }}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="">Barcha hududlar</option>
            {regions.map((r) => (
              <option key={r._id} value={r._id}>
                {r.name}
              </option>
            ))}
          </select>

          {selectedRegion && districts.length > 0 && (
            <select
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedRegion(e.target.value);
                  setSelectedRegionType("district");
                }
              }}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="">Barcha tumanlar</option>
              {districts.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Jami murojaatlar"
          value={stats?.requests?.total}
          icon={FileText}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="Servis reportlar"
          value={stats?.serviceReports?.total}
          icon={AlertTriangle}
          color="bg-orange-50 text-orange-600"
        />
        <StatCard
          label="MSK buyurtmalar"
          value={stats?.mskOrders?.total}
          icon={Wrench}
          color="bg-purple-50 text-purple-600"
        />
        {dashboardStats?.totalUsers !== undefined && (
          <StatCard
            label="Jami foydalanuvchilar"
            value={dashboardStats?.totalUsers}
            icon={Users}
            color="bg-green-50 text-green-600"
          />
        )}
      </div>

      {/* Murojaatlar breakdown */}
      {stats?.requests && (
        <div className="bg-white rounded-xl border p-5 mb-4">
          <h2 className="font-semibold mb-3">Murojaatlar holati</h2>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Kutilmoqda</p>
              <p className="text-xl font-bold text-yellow-600">
                {stats.requests.pending || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Ko'rib chiqilmoqda</p>
              <p className="text-xl font-bold text-blue-600">
                {stats.requests.in_review || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Yechildi</p>
              <p className="text-xl font-bold text-green-600">
                {stats.requests.resolved || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Rad etildi</p>
              <p className="text-xl font-bold text-red-600">
                {stats.requests.rejected || 0}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
