import RegionListPage from "../components/RegionListPage";

const RegionsPage = () => {
  return (
    <RegionListPage
      type="region"
      getChildRoute={(item) => `/regions/${item._id}/districts`}
    />
  );
};

export default RegionsPage;
