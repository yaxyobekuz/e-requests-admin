import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { regionsAPI } from "@/shared/api/http";
import RegionListPage from "../components/RegionListPage";

const DistrictsPage = () => {
  const { regionId } = useParams();

  const { data: region } = useQuery({
    queryKey: ["region", regionId],
    queryFn: () => regionsAPI.getById(regionId).then((r) => r.data),
  });

  return (
    <RegionListPage
      type="district"
      parentId={regionId}
      getChildRoute={(item) =>
        `/regions/${regionId}/districts/${item._id}/neighborhoods`
      }
      breadcrumbs={[
        { label: region?.name || "...", href: "/regions" },
      ]}
    />
  );
};

export default DistrictsPage;
