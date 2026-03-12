import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, X } from "lucide-react";
import { cn } from "@/shared/utils/cn";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// APIs
import { regionsAPI } from "@/shared/api";

// Map components
import UzbekistanMap from "@/features/dashboard/components/map/UzbekistanMap";
import { getRegionByLabel } from "@/features/dashboard/components/map/data/uzbekistan.data";

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

/**
 * StatsMap — hybrid region/district selector using both SVG maps and Select dropdowns.
 * Both methods stay in sync via shared state.
 *
 * @param {{
 *   onRegionChange: (regionId: string|null, label: string|null) => void,
 *   onDistrictChange: (districtId: string|null) => void,
 * }} props
 * @returns {JSX.Element}
 */
const StatsMap = ({ onRegionChange, onDistrictChange }) => {
  const {
    selectedRegion,    // label string for SVG map (e.g. "Toshkent")
    selectedRegionId,  // MongoDB _id for API calls
    selectedDistrict,  // label string for SVG map
    selectedDistrictId,
    setFields,
    setField,
  } = useObjectState({
    selectedRegion: null,
    selectedRegionId: null,
    selectedDistrict: null,
    selectedDistrictId: null,
  });

  // Fetch all top-level regions for dropdown
  const { data: regionsList = [] } = useQuery({
    queryKey: ["regions", "list", "region"],
    queryFn: () => regionsAPI.getAll({ type: "region" }).then((r) => r.data),
    staleTime: 10 * 60 * 1000,
  });

  // Fetch districts when a region is selected
  const { data: districtsList = [] } = useQuery({
    queryKey: ["regions", "list", "district", selectedRegionId],
    queryFn: () =>
      regionsAPI.getAll({ type: "district", parent: selectedRegionId }).then((r) => r.data),
    enabled: !!selectedRegionId,
    staleTime: 10 * 60 * 1000,
  });

  const RegionMapComponent = selectedRegion
    ? getRegionByLabel(selectedRegion)?.component
    : null;

  // Notify parent when region/district changes
  useEffect(() => {
    onRegionChange?.(selectedRegionId, selectedRegion);
  }, [selectedRegionId, selectedRegion]);

  useEffect(() => {
    onDistrictChange?.(selectedDistrictId);
  }, [selectedDistrictId]);

  /** Handle click on the Uzbekistan SVG map */
  const handleMapRegionClick = (label) => {
    const region = regionsList.find(
      (r) => r.name.trim().toLowerCase() === label?.trim().toLowerCase()
    );
    setFields({
      selectedRegion: label,
      selectedRegionId: region?._id || null,
      selectedDistrict: null,
      selectedDistrictId: null,
    });
  };

  /** Handle click on a regional SVG map (district level) */
  const handleMapDistrictClick = (label) => {
    const district = districtsList.find(
      (d) => d.name.trim().toLowerCase() === label?.trim().toLowerCase()
    );
    setFields({
      selectedDistrict: label,
      selectedDistrictId: district?._id || null,
    });
  };

  /** Handle region change via Select dropdown */
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

  /** Handle district change via Select dropdown */
  const handleSelectDistrict = (districtId) => {
    const district = districtsList.find((d) => d._id === districtId);
    if (!district) return;
    setFields({
      selectedDistrict: district.name,
      selectedDistrictId: district._id,
    });
  };

  /** Clear all selections */
  const handleClear = () => {
    setFields({
      selectedRegion: null,
      selectedRegionId: null,
      selectedDistrict: null,
      selectedDistrictId: null,
    });
  };

  return (
    <Card className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="size-4 text-blue-600" strokeWidth={1.5} />
        <h3 className="font-semibold text-gray-800">Hudud bo'yicha filtrlash</h3>
        {selectedRegion && (
          <button
            onClick={handleClear}
            className="ml-auto flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors"
          >
            <X className="size-3.5" />
            Tozalash
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Left: Select dropdowns */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">
              Viloyat
            </label>
            <Select
              value={selectedRegionId || ""}
              onValueChange={handleSelectRegion}
            >
              <SelectTrigger className="border border-gray-200 rounded-xl bg-gray-50 text-sm h-10">
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
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">
              Tuman / shahar
            </label>
            <Select
              value={selectedDistrictId || ""}
              onValueChange={handleSelectDistrict}
              disabled={!selectedRegionId}
            >
              <SelectTrigger className="border border-gray-200 rounded-xl bg-gray-50 text-sm h-10 disabled:opacity-50">
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

          {selectedRegion && (
            <div className="pt-1">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm">
                <p className="text-blue-700 font-medium">
                  {selectedDistrict
                    ? `${selectedRegion} — ${selectedDistrict}`
                    : selectedRegion}
                </p>
                <p className="text-blue-500 text-xs mt-0.5">
                  {selectedDistrict
                    ? "Tuman bo'yicha statistika ko'rsatilmoqda"
                    : "Viloyat bo'yicha statistika ko'rsatilmoqda"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right: SVG map */}
        <div className="relative min-h-56">
          {/* Uzbekistan overview map */}
          <UzbekistanMap
            value={selectedRegion}
            className={cn(
              "w-full h-auto aspect-square origin-bottom transition-all duration-500",
              selectedRegion ? "scale-0 opacity-0 pointer-events-none" : "scale-100 opacity-100"
            )}
            onChange={handleMapRegionClick}
          />

          {/* Regional map (district level) */}
          {RegionMapComponent && (
            <div
              className={cn(
                "absolute inset-0 w-full h-auto origin-top transition-all duration-500",
                selectedRegion ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
              )}
            >
              <RegionMapComponent
                value={selectedDistrict}
                className="w-full h-auto aspect-square"
                onChange={handleMapDistrictClick}
              />
            </div>
          )}

          {/* Back button */}
          {selectedRegion && (
            <Button
              onClick={handleClear}
              className="absolute top-3 right-3 animate__animated animate__fadeIn text-xs px-3 py-1.5 h-auto"
            >
              <ArrowLeft strokeWidth={1.5} className="size-3.5" />
              Orqaga
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default StatsMap;
