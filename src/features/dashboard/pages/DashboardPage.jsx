// Components
import TopPanel from "../components/TopPanel";
import UserStats from "../components/UserStats";
import StatsByMap from "../components/StatsByMap";
import AdminStats from "../components/AdminStats";
import TotalStats from "../components/TotalStats";

const DashboardPage = () => {
  return (
    <div className="p-6 space-y-4">
      {/* Greeting */}
      <TopPanel />

      {/* Total stats */}
      <TotalStats />

      {/* Stats by map */}
      <StatsByMap />

      {/* Admin stats */}
      <AdminStats />

      {/* User stats */}
      <UserStats />
    </div>
  );
};

export default DashboardPage;
