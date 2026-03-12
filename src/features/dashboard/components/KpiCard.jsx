// Components
import Card from "@/shared/components/ui/Card";

const KpiCard = ({ label, value, icon, iconColor }) => (
  <Card className="flex items-center gap-4">
    <div
      className={`size-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconColor}`}
    >
      {icon}
    </div>

    <div>
      <p className="text-2xl font-bold text-gray-900">{value ?? "0"}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </Card>
);

export default KpiCard;
