// Utils
import { cn } from "@/shared/utils/cn";

// Icons
import { ArrowLeft } from "lucide-react";

// API
import { regionsAPI } from "@/shared/api";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Data
import uzbekistanRegions, {
  getRegionByLabel,
  getDistrictByLabel,
} from "./map/data/uzbekistan.data";
import andijanDistricts from "./map/data/andijan.data";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Components
import Card from "@/shared/components/ui/Card";
import UzbekistanMap from "./map/UzbekistanMap";
import Button from "@/shared/components/ui/button/Button";
import Select from "@/shared/components/ui/select/Select";

const RegionDistrictPicker = ({
  className,
  onRegionChange,
  onDistrictChange,
  onNeighborhoodChange,
}) => {
  const {
    selectedRegion,
    selectedRegionId,
    selectedDistrict,
    selectedDistrictId,
    selectedNeighborhood,
    selectedNeighborhoodId,
    setFields,
  } = useObjectState({
    selectedRegion: null,
    selectedRegionId: null,
    selectedDistrict: null,
    selectedDistrictId: null,
    selectedNeighborhood: null,
    selectedNeighborhoodId: null,
  });

  const { data: regionsList = [] } = useQuery({
    queryKey: ["regions", "list", "region"],
    queryFn: () => regionsAPI.getAll({ type: "region" }).then((r) => r.data),
  });

  const { data: districtsList = [] } = useQuery({
    queryKey: ["regions", "list", "district", selectedRegionId],
    queryFn: () =>
      regionsAPI
        .getAll({ type: "district", parent: selectedRegionId })
        .then((r) => r.data),
    enabled: !!selectedRegionId,
  });

  const { data: neighborhoodsList = [] } = useQuery({
    queryKey: ["regions", "list", "neighborhood", selectedDistrictId],
    queryFn: () =>
      regionsAPI
        .getAll({ type: "neighborhood", parent: selectedDistrictId })
        .then((r) => r.data),
    enabled: !!selectedDistrictId,
  });

  const RegionMapComponent =
    getRegionByLabel(selectedRegion)?.component ||
    uzbekistanRegions[0].component;

  // Sub-map for the selected district
  const districtEntry = getDistrictByLabel(selectedRegion, selectedDistrict);
  const DistrictMapComponent =
    districtEntry?.component || andijanDistricts[0].component;

  const selectRegion = (regionId, regionName) => {
    setFields({
      selectedRegion: regionName,
      selectedRegionId: regionId,
      selectedDistrict: null,
      selectedDistrictId: null,
      selectedNeighborhood: null,
      selectedNeighborhoodId: null,
    });
    onRegionChange?.(regionId, regionName);
    onDistrictChange?.(null, null);
    onNeighborhoodChange?.(null, null);
  };

  const selectDistrict = (districtId, districtName) => {
    setFields({
      selectedDistrict: districtName,
      selectedDistrictId: districtId,
      selectedNeighborhood: null,
      selectedNeighborhoodId: null,
    });
    onDistrictChange?.(districtId, districtName);
    onNeighborhoodChange?.(null, null);
  };

  const selectNeighborhood = (neighborhoodId, neighborhoodName) => {
    setFields({
      selectedNeighborhood: neighborhoodName,
      selectedNeighborhoodId: neighborhoodId,
    });
    onNeighborhoodChange?.(neighborhoodId, neighborhoodName);
  };

  const handleMapRegionClick = (label) => {
    const region = regionsList.find(
      (r) => r.name.trim().toLowerCase() === label?.trim().toLowerCase(),
    );
    selectRegion(region?._id || null, label);
  };

  const handleMapDistrictClick = (label) => {
    const district = districtsList.find(
      (d) => d.name.trim().toLowerCase() === label?.trim().toLowerCase(),
    );
    selectDistrict(district?._id || null, label);
  };

  const handleMapNeighborhoodClick = (label) => {
    const neighborhood = neighborhoodsList.find(
      (n) => n.name.trim().toLowerCase() === label?.trim().toLowerCase(),
    );
    selectNeighborhood(neighborhood?._id || null, label);
  };

  const handleSelectRegion = (regionId) => {
    const region = regionsList.find((r) => r._id === regionId);
    if (!region) return;
    selectRegion(region._id, region.name);
  };

  const handleSelectDistrict = (districtId) => {
    const district = districtsList.find((d) => d._id === districtId);
    if (!district) return;
    selectDistrict(district._id, district.name);
  };

  const handleSelectNeighborhood = (neighborhoodId) => {
    const neighborhood = neighborhoodsList.find(
      (n) => n._id === neighborhoodId,
    );
    if (!neighborhood) return;
    selectNeighborhood(neighborhood._id, neighborhood.name);
  };

  const handleBackToUzbekistan = () => {
    setFields({
      selectedRegion: null,
      selectedRegionId: null,
      selectedDistrict: null,
      selectedDistrictId: null,
      selectedNeighborhood: null,
      selectedNeighborhoodId: null,
    });

    onRegionChange?.(null, null);
    onDistrictChange?.(null, null);
    onNeighborhoodChange?.(null, null);
  };

  // Go back from neighborhood sub-map to district-level map
  const handleBackToDistricts = () => {
    setFields({
      selectedDistrict: null,
      selectedDistrictId: null,
      selectedNeighborhood: null,
      selectedNeighborhoodId: null,
    });
    onDistrictChange?.(null, null);
    onNeighborhoodChange?.(null, null);
  };

  // Whether the district sub-map is currently visible
  const isDistrictMapVisible = !!(selectedDistrict && DistrictMapComponent);

  return (
    <div className={className}>
      {/* Top (Selects) */}
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

        <Select
          className="flex-1"
          disabled={!selectedDistrictId}
          placeholder="Mahallani tanlang"
          onChange={handleSelectNeighborhood}
          value={selectedNeighborhoodId || ""}
          triggerClassName="rounded-2xl border-none"
          options={neighborhoodsList.map((n) => ({
            value: n._id,
            label: n.name,
          }))}
        />
      </div>

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
            selectedRegion && !isDistrictMapVisible
              ? "scale-100 "
              : "scale-0 opacity-0 pointer-events-none",
          )}
        >
          <RegionMapComponent
            value={selectedDistrict}
            onChange={handleMapDistrictClick}
            className="w-full h-auto aspect-square"
          />
        </div>

        {/* District sub-map (neighborhood-level) — only when district has a component */}
        {DistrictMapComponent && (
          <div
            className={cn(
              "absolute inset-0 w-full h-auto aspect-square origin-bottom transition-all duration-500",
              isDistrictMapVisible
                ? "scale-100"
                : "scale-0 opacity-0 pointer-events-none",
            )}
          >
            <DistrictMapComponent
              value={selectedNeighborhood}
              onChange={handleMapNeighborhoodClick}
              className="w-full h-auto aspect-square"
            />
          </div>
        )}

        {/* Back button */}
        {selectedRegion && (
          <Button
            onClick={
              isDistrictMapVisible
                ? handleBackToDistricts
                : handleBackToUzbekistan
            }
            className="absolute top-5 left-5 animate__animated animate__fadeIn"
          >
            <ArrowLeft strokeWidth={1.5} />
            {isDistrictMapVisible
              ? `${selectedRegion?.split(" ")[0]} xaritasiga qaytish`
              : "O'zbekiston xaritasiga qaytish"}
          </Button>
        )}
      </Card>
    </div>
  );
};

export default RegionDistrictPicker;
