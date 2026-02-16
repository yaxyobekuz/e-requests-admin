import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { regionsAPI } from "@/shared/api/http";
import RegionListPage from "../components/RegionListPage";

const StreetsPage = () => {
  const { regionId, districtId, neighborhoodId } = useParams();

  const { data: region } = useQuery({
    queryKey: ["region", regionId],
    queryFn: () => regionsAPI.getById(regionId).then((r) => r.data),
  });

  const { data: district } = useQuery({
    queryKey: ["region", districtId],
    queryFn: () => regionsAPI.getById(districtId).then((r) => r.data),
  });

  const { data: neighborhood } = useQuery({
    queryKey: ["region", neighborhoodId],
    queryFn: () => regionsAPI.getById(neighborhoodId).then((r) => r.data),
  });

  return (
    <RegionListPage
      type="street"
      parentId={neighborhoodId}
      breadcrumbs={[
        { label: region?.name || "...", href: "/regions" },
        {
          label: district?.name || "...",
          href: `/regions/${regionId}/districts`,
        },
        {
          label: neighborhood?.name || "...",
          href: `/regions/${regionId}/districts/${districtId}/neighborhoods`,
        },
      ]}
    />
  );
};

export default StreetsPage;
