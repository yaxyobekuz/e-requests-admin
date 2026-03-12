// Components
import TopPanel from "../components/TopPanel";
import StatsByMap from "../components/StatsByMap";
import AdminStats from "../components/AdminStats";
import TotalStats from "../components/TotalStats";

const DashboardPage = () => {
  return (
    <div className="p-6">
      {/* Greeting */}
      <TopPanel />

      {/* Total stats */}
      <TotalStats />

      {/* Stats by map */}
      <StatsByMap />

      {/* Admin stats */}
      <AdminStats />
    </div>
  );
};

export default DashboardPage;
