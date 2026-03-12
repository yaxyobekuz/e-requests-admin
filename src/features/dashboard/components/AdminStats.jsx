// API
import { adminsAPI } from "@/shared/api";

// Components
import KpiCard from "./KpiCard";
import Card from "@/shared/components/ui/Card";

// Tanstack query
import { useQuery } from "@tanstack/react-query";

// Icons
import { Users, UserCheck, UserX, Shield } from "lucide-react";

const AdminStats = () => {
  const { data: stats } = useQuery({
    queryKey: ["admins", "stats"],
    queryFn: () => adminsAPI.getStats().then((res) => res.data),
  });

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Adminlar statistikasi</h2>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Jami adminlar"
          value={stats?.total}
          icon={<Users className="size-5" />}
          iconColor="bg-blue-50 text-blue-600"
        />
        <KpiCard
          label="Faol"
          value={stats?.active}
          icon={<UserCheck className="size-5" />}
          iconColor="bg-green-50 text-green-600"
        />
        <KpiCard
          label="Nofaol"
          value={stats?.inactive}
          icon={<UserX className="size-5" />}
          iconColor="bg-red-50 text-red-600"
        />
        <KpiCard
          label="Tahrirlash huquqi bor"
          value={stats?.withDelegation}
          icon={<Shield className="size-5" />}
          iconColor="bg-amber-50 text-amber-600"
        />
      </div>

      {stats?.byRole?.length > 0 && (
        <Card className="space-y-3.5">
          {stats.byRole.map((item) => (
            <div
              key={item.roleId || "no-role"}
              className="flex items-center gap-3"
            >
              <span className="font-medium text-sm text-gray-700 w-44 truncate flex-shrink-0">
                {item.roleName || "Lavozim belgilanmagan"}
              </span>

              <div className="flex-1 bg-gray-100 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full"
                  style={{ width: `${(item.count / stats.total) * 100}%` }}
                />
              </div>

              <span className="text-sm font-medium text-gray-900 w-6 text-right flex-shrink-0">
                {item.count}
              </span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
};

export default AdminStats;
