// Data
import uzbekistanRegions, {
  getRegionByLabel,
} from "./map/data/uzbekistan.data";

// Utils
import { cn } from "@/shared/utils/cn";

// Icons
import { ArrowLeft } from "lucide-react";

// APIs
import { regionsAPI } from "@/shared/api";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

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
}) => {
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
  });

  const { data: districtsList = [] } = useQuery({
    queryKey: ["regions", "list", "district", selectedRegionId],
    queryFn: () =>
      regionsAPI
        .getAll({ type: "district", parent: selectedRegionId })
        .then((r) => r.data),
    enabled: !!selectedRegionId,
  });

  const RegionMapComponent =
    getRegionByLabel(selectedRegion)?.component ||
    uzbekistanRegions[0].component;

  const selectRegion = (regionId, regionName) => {
    setFields({
      selectedRegion: regionName,
      selectedRegionId: regionId,
      selectedDistrict: null,
      selectedDistrictId: null,
    });
    onRegionChange?.(regionId, regionName);
    onDistrictChange?.(null, null);
  };

  const selectDistrict = (districtId, districtName) => {
    setFields({
      selectedDistrict: districtName,
      selectedDistrictId: districtId,
    });
    onDistrictChange?.(districtId, districtName);
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

  const handleBackToUzbekistan = () => {
    setFields({
      selectedRegion: null,
      selectedRegionId: null,
      selectedDistrict: null,
      selectedDistrictId: null,
    });

    onRegionChange?.(null, null);
    onDistrictChange?.(null, null);
  };

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
            selectedRegion
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

        {/* Back to Uzbekistan button */}
        {selectedRegion && (
          <Button
            onClick={handleBackToUzbekistan}
            className="absolute top-5 left-5 animate__animated animate__fadeIn"
          >
            <ArrowLeft strokeWidth={1.5} />
            O'zbekiston xaritasiga qaytish
          </Button>
        )}
      </Card>
    </div>
  );
};

export default RegionDistrictPicker;
