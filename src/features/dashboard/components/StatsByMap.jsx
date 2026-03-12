import Card from "@/shared/components/ui/Card";
import useObjectState from "@/shared/hooks/useObjectState";
import UzbekistanMap from "./map/UzbekistanMap";
import { cn } from "@/shared/utils/cn";
import Button from "@/shared/components/ui/button/Button";
import { ArrowLeft } from "lucide-react";
import { getRegionByLabel } from "./map/data/uzbekistan.data";

import React, { useEffect } from "react";

const StatsByMap = () => {
  const { region, district, setField, state, setFields } = useObjectState({
    region: null,
    district: null,
  });

  return (
    <div className="mb-4">
      <Map onChange={setFields} />
    </div>
  );
};

const Map = ({ onChange }) => {
  const { selectedRegion, selectedDistrict, setField, setFields } =
    useObjectState({
      selectedRegion: null,
      selectedDistrict: null,
    });

  const handleClearRegion = () => {
    setFields({ selectedRegion: null, selectedDistrict: null });
  };

  const RegionComponent = getRegionByLabel(selectedRegion)?.component;

  useEffect(() => {
    onChange?.({ region: selectedRegion, district: selectedDistrict });
  }, [selectedDistrict, selectedRegion]);

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="relative">
        {/* All regions (Uzbekistan map) */}
        <UzbekistanMap
          value={selectedRegion}
          className={cn(
            "w-full h-auto aspect-square origin-bottom transition-all duration-500",
            selectedRegion ? "scale-0 opacity-0" : "scale-100 opacity-100",
          )}
          onChange={(region) => setField("selectedRegion", region)}
        />

        {/* Region-specific map */}
        <div
          className={cn(
            "absolute inset-0 w-full h-auto aspect-square origin-top transition-all duration-500",
            selectedRegion ? "scale-100 opacity-100" : "scale-0 opacity-0",
          )}
        >
          <RegionComponent
            value={selectedDistrict}
            className="w-full h-auto aspect-square"
            onChange={(district) => setField("selectedDistrict", district)}
          />
        </div>

        {/* Back button */}
        {selectedRegion && (
          <Button
            onClick={handleClearRegion}
            className="absolute top-5 right-5 animate__animated animate__fadeIn"
          >
            <ArrowLeft strokeWidth={1.5} className="size-5" />
            O'zbekiston xaritasiga qaytish
          </Button>
        )}
      </Card>
    </div>
  );
};

export default StatsByMap;
