import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { regionsAPI } from "@/shared/api/http";
import RegionListPage from "../components/RegionListPage";

const NeighborhoodsPage = () => {
  const { regionId, districtId } = useParams();

  const { data: region } = useQuery({
    queryKey: ["region", regionId],
    queryFn: () => regionsAPI.getById(regionId).then((r) => r.data),
  });

  const { data: district } = useQuery({
    queryKey: ["region", districtId],
    queryFn: () => regionsAPI.getById(districtId).then((r) => r.data),
  });

  return (
    <RegionListPage
      type="neighborhood"
      parentId={districtId}
      getChildRoute={(item) =>
        `/regions/${regionId}/districts/${districtId}/neighborhoods/${item._id}/streets`
      }
      breadcrumbs={[
        { label: region?.name || "...", href: "/regions" },
        {
          label: district?.name || "...",
          href: `/regions/${regionId}/districts`,
        },
      ]}
    />
  );
};

export default NeighborhoodsPage;
