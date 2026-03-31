import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

// API
import { usersAPI } from "../api/endpoints";
import { regionsAPI } from "@/features/regions/api";

// Data
import { ALL_VALUE } from "../data/users.data";

// Shared components
import Select from "@/shared/components/ui/select/Select";

// Feature components
import UserStatsKPICards from "../components/UserStatsKPICards";
import UserDemographicsTable from "../components/UserDemographicsTable";

/**
 * Foydalanuvchilar va xonadonlar demografik statistikasi sahifasi.
 * Hududlar bo'yicha drill-down, faollik foizi, xonadonlar kalkulyatsiyasi.
 *
 * @returns {JSX.Element}
 */
const UserStatsPage = () => {
  const [regionId, setRegionId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [neighborhoodId, setNeighborhoodId] = useState("");

  // Viloyatlar
  const { data: regions = [] } = useQuery({
    queryKey: ["regions", "list", "region"],
    queryFn: () => regionsAPI.getAll({ type: "region" }).then((r) => r.data),
  });

  // Tumanlar
  const { data: districts = [], isLoading: districtsLoading } = useQuery({
    queryKey: ["regions", "list", "district", regionId],
    queryFn: () =>
      regionsAPI
        .getAll({ type: "district", parent: regionId })
        .then((r) => r.data),
    enabled: !!regionId,
  });

  // Mahallalar
  const { data: neighborhoods = [], isLoading: neighborhoodsLoading } =
    useQuery({
      queryKey: ["regions", "list", "neighborhood", districtId],
      queryFn: () =>
        regionsAPI
          .getAll({ type: "neighborhood", parent: districtId })
          .then((r) => r.data),
      enabled: !!districtId,
    });

  // KPI summary uchun alohida query
  const summaryParams = useMemo(
    () => ({
      regionId: regionId || undefined,
      districtId: districtId || undefined,
      neighborhoodId: neighborhoodId || undefined,
    }),
    [regionId, districtId, neighborhoodId],
  );

  const { data: demographicsData, isLoading: summaryLoading } = useQuery({
    queryKey: ["users", "demographics", "summary", summaryParams],
    queryFn: () =>
      usersAPI.getUserDemographics(summaryParams).then((r) => r.data),
    keepPreviousData: true,
  });

  const filters = useMemo(
    () => ({
      regionId: regionId || null,
      districtId: districtId || null,
      neighborhoodId: neighborhoodId || null,
    }),
    [regionId, districtId, neighborhoodId],
  );

  const regionOptions = useMemo(
    () => [
      { value: ALL_VALUE, label: "Barcha viloyatlar" },
      ...regions.map((r) => ({ value: r._id, label: r.name })),
    ],
    [regions],
  );

  const districtOptions = useMemo(
    () => [
      { value: ALL_VALUE, label: "Barcha tumanlar" },
      ...districts.map((d) => ({ value: d._id, label: d.name })),
    ],
    [districts],
  );

  const neighborhoodOptions = useMemo(
    () => [
      { value: ALL_VALUE, label: "Barcha mahallalar" },
      ...neighborhoods.map((n) => ({ value: n._id, label: n.name })),
    ],
    [neighborhoods],
  );

  const handleRegionChange = (val) => {
    setRegionId(val === ALL_VALUE ? "" : val);
    setDistrictId("");
    setNeighborhoodId("");
  };

  const handleDistrictChange = (val) => {
    setDistrictId(val === ALL_VALUE ? "" : val);
    setNeighborhoodId("");
  };

  const handleNeighborhoodChange = (val) => {
    setNeighborhoodId(val === ALL_VALUE ? "" : val);
  };

  const hasFilters = regionId || districtId || neighborhoodId;

  const clearFilters = () => {
    setRegionId("");
    setDistrictId("");
    setNeighborhoodId("");
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Foydalanuvchilar statistikasi
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Aholi, xonadonlar va faollik ko&apos;rsatkichlari
        </p>
      </div>

      {/* Filtrlar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="w-44">
            <Select
              value={regionId || ALL_VALUE}
              onChange={handleRegionChange}
              options={regionOptions}
              placeholder="Viloyat"
              variant="gray"
              size="sm"
            />
          </div>
          <div className="w-44">
            <Select
              value={districtId || ALL_VALUE}
              onChange={handleDistrictChange}
              options={districtOptions}
              placeholder="Tuman"
              variant="gray"
              size="sm"
              disabled={!regionId}
              isLoading={districtsLoading}
            />
          </div>
          <div className="w-44">
            <Select
              value={neighborhoodId || ALL_VALUE}
              onChange={handleNeighborhoodChange}
              options={neighborhoodOptions}
              placeholder="Mahalla"
              variant="gray"
              size="sm"
              disabled={!districtId}
              isLoading={neighborhoodsLoading}
            />
          </div>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="h-9 px-3 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Tozalash
            </button>
          )}
        </div>
      </div>

      {/* KPI kartalar */}
      <UserStatsKPICards
        summary={demographicsData?.summary}
        isLoading={summaryLoading}
      />

      {/* Jadval va chart */}
      <UserDemographicsTable filters={filters} />
    </div>
  );
};

export default UserStatsPage;
