import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Files, FileText, FolderKanban } from "lucide-react";

// API (from statistics feature)
import { statsAPI } from "@/features/statistics/api";

// Components
import KpiCard from "./KpiCard";

/**
 * Animated counter from 0 → target using requestAnimationFrame (ease-out quad).
 *
 * @param {{ target: number }} props
 * @returns {JSX.Element}
 */
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

/**
 * TotalStats — 4 animated KPI cards with real data from /api/stats/overview.
 *
 * @returns {JSX.Element}
 */
const TotalStats = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["stats", "overview", { period: "30" }],
    queryFn: () => statsAPI.getOverview({ period: "30" }).then((r) => r.data),
    refetchInterval: 60_000,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-4 mb-4">
        {["bg-green-50", "bg-blue-50", "bg-yellow-50", "bg-pink-50"].map((bg, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl flex items-center gap-4">
            <div className={`size-10 rounded-lg ${bg} animate-pulse flex-shrink-0`} />
            <div className="space-y-2">
              <div className="h-7 w-12 bg-gray-200 rounded animate-pulse" />
              <div className="h-3.5 w-28 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const total = (data?.requests ?? 0) + (data?.services ?? 0) + (data?.msk ?? 0);

  return (
    <div className="grid grid-cols-4 gap-4 mb-4">
      <KpiCard
        label="Umumiy arizalar soni"
        value={<AnimatedNumber target={total} />}
        iconColor="bg-green-50 text-green-600"
        icon={<Files className="size-5" strokeWidth={1.5} />}
      />
      <KpiCard
        label="Murojaatlar"
        value={<AnimatedNumber target={data?.requests ?? 0} />}
        iconColor="bg-blue-50 text-blue-600"
        icon={<FileText className="size-5" strokeWidth={1.5} />}
      />
      <KpiCard
        label="Xizmat arizalari"
        value={<AnimatedNumber target={data?.services ?? 0} />}
        iconColor="bg-yellow-50 text-yellow-600"
        icon={<AlertTriangle className="size-5" strokeWidth={1.5} />}
      />
      <KpiCard
        label="MSK buyurtmalar"
        value={<AnimatedNumber target={data?.msk ?? 0} />}
        iconColor="bg-pink-50 text-pink-600"
        icon={<FolderKanban className="size-5" strokeWidth={1.5} />}
      />
    </div>
  );
};

export default TotalStats;
