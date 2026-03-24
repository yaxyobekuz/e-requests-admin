import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, UserCheck, UserPlus, UserX } from "lucide-react";

// API
import { statsAPI } from "@/features/statistics/api";

// Components
import KpiCard from "./KpiCard";
import Card from "@/shared/components/ui/Card";

const AnimatedNumber = ({ target }) => {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (target === undefined || target === null) return;
    let start = null;
    const duration = 800;

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - (1 - progress) * (1 - progress);
      setDisplay(Math.round(target * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target]);

  return <span>{display.toLocaleString("uz-UZ")}</span>;
};

const UserStats = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["stats", "users", { period: "30" }],
    queryFn: () => statsAPI.getUsers({ period: "30" }).then((r) => r.data),
    refetchInterval: 60_000,
  });

  if (isLoading) {
    return (
      <div className="mb-4 space-y-4">
        <div className="grid grid-cols-4 gap-4">
          {["bg-purple-50", "bg-green-50", "bg-blue-50", "bg-red-50"].map(
            (bg, i) => (
              <div
                key={i}
                className="bg-white p-4 rounded-2xl flex items-center gap-4"
              >
                <div
                  className={`size-10 rounded-lg ${bg} animate-pulse flex-shrink-0`}
                />
                <div className="space-y-2">
                  <div className="h-7 w-12 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3.5 w-28 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    );
  }

  const byStatus = data?.byStatus || { active: 0, inactive: 0, total: 0 };
  const trend = data?.trend || [];
  const byRegion = data?.byRegion || [];

  // Count new users from trend (sum of registrations in the period)
  const newUsers = trend.reduce((sum, t) => sum + t.count, 0);

  // Top 3 regions by total users
  const topRegions = [...byRegion]
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);

  return (
    <div className="mb-4 space-y-4">
      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard
          label="Jami foydalanuvchilar"
          value={<AnimatedNumber target={byStatus.total} />}
          iconColor="bg-purple-50 text-purple-600"
          icon={<Users className="size-5" strokeWidth={1.5} />}
        />
        <KpiCard
          label="Faol foydalanuvchilar"
          value={<AnimatedNumber target={byStatus.active} />}
          iconColor="bg-green-50 text-green-600"
          icon={<UserCheck className="size-5" strokeWidth={1.5} />}
        />
        <KpiCard
          label="Yangi (30 kun)"
          value={<AnimatedNumber target={newUsers} />}
          iconColor="bg-blue-50 text-blue-600"
          icon={<UserPlus className="size-5" strokeWidth={1.5} />}
        />
        <KpiCard
          label="Nofaol foydalanuvchilar"
          value={<AnimatedNumber target={byStatus.inactive} />}
          iconColor="bg-red-50 text-red-600"
          icon={<UserX className="size-5" strokeWidth={1.5} />}
        />
      </div>

      {/* Top 3 regions by users */}
      {topRegions.length > 0 && (
        <Card title="Eng ko'p foydalanuvchili hududlar">
          <div className="space-y-3 mt-2">
            {topRegions.map((region, idx) => {
              const maxTotal = topRegions[0]?.total || 1;
              const pct = Math.round((region.total / maxTotal) * 100);
              return (
                <div key={region.regionId || idx} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 font-medium">
                      {region.regionName}
                    </span>
                    <span className="text-gray-500">
                      {region.total} ta ({region.active} faol)
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};

export default UserStats;
