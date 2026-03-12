// Components
import KpiCard from "./KpiCard";

// Icons
import { AlertTriangle, Files, FileText, FolderKanban } from "lucide-react";

const TotalStats = () => {
  return (
    <div className="grid grid-cols-4 gap-4 mb-4">
      <KpiCard
        label="Umumiy arizalar soni"
        // value={stats?.total}
        iconColor="bg-green-50 text-green-600"
        icon={<Files className="size-5" strokeWidth={1.5} />}
      />
      <KpiCard
        label="Jami murojaatlar soni"
        // value={stats?.requests}
        iconColor="bg-blue-50 text-blue-600"
        icon={<FileText className="size-5" strokeWidth={1.5} />}
      />
      <KpiCard
        label="Xizmat arizalari soni"
        // value={stats?.services}
        iconColor="bg-yellow-50 text-yellow-600"
        icon={<AlertTriangle className="size-5" strokeWidth={1.5} />}
      />
      <KpiCard
        label="MSK buyurtmalar soni"
        // value={stats?.mskOrders}
        iconColor="bg-pink-50 text-pink-600"
        icon={<FolderKanban className="size-5" strokeWidth={1.5} />}
      />
    </div>
  );
};

export default TotalStats;
