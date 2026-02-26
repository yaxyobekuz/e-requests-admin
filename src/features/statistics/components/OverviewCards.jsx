import { FileText, AlertTriangle, Wrench, Users, TrendingUp, TrendingDown, Minus } from "lucide-react";

const StatCardSkeleton = () => (
  <div className="bg-white rounded-xl border p-5 animate-pulse">
    <div className="flex items-center justify-between mb-3">
      <div className="h-4 bg-gray-200 rounded w-28" />
      <div className="w-10 h-10 bg-gray-200 rounded-xl" />
    </div>
    <div className="h-9 bg-gray-200 rounded w-20 mb-2" />
    <div className="h-3 bg-gray-200 rounded w-36" />
  </div>
);

const TrendBadge = ({ today, yesterday }) => {
  if (yesterday === 0 && today === 0) return null;

  const diff = today - yesterday;
  if (diff > 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
        <TrendingUp className="w-3 h-3" />+{diff} bugun
      </span>
    );
  } else if (diff < 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
        <TrendingDown className="w-3 h-3" />{diff} bugun
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
      <Minus className="w-3 h-3" />Kechagidek
    </span>
  );
};

const KpiCard = ({ label, sublabel, total, today, yesterday, resolutionRate, icon: Icon, colorClass, bgClass, rateColor }) => (
  <div className="bg-white rounded-xl border p-5 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-3">
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        {sublabel && <p className="text-xs text-gray-400">{sublabel}</p>}
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgClass}`}>
        <Icon className={`w-5 h-5 ${colorClass}`} />
      </div>
    </div>

    <p className="text-3xl font-bold text-gray-900 mb-2">{total ?? 0}</p>

    <div className="flex items-center gap-2 flex-wrap">
      <TrendBadge today={today} yesterday={yesterday} />
      {resolutionRate !== undefined && (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${rateColor}`}>
          {resolutionRate}% hal qilindi
        </span>
      )}
    </div>

    {today !== undefined && (
      <p className="text-xs text-gray-400 mt-2">
        Bugun: <span className="font-medium text-gray-600">{today}</span>
        {" · "}Kecha: <span className="font-medium text-gray-600">{yesterday}</span>
      </p>
    )}
  </div>
);

const UsersCard = ({ users }) => (
  <div className="bg-white rounded-xl border p-5 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-3">
      <p className="text-sm text-gray-500 font-medium">Foydalanuvchilar</p>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-50">
        <Users className="w-5 h-5 text-green-600" />
      </div>
    </div>
    <p className="text-3xl font-bold text-gray-900 mb-2">{users.total ?? 0}</p>
    <p className="text-xs text-gray-400">
      Bugun: <span className="font-medium text-gray-600">{users.today}</span>
      {" · "}Bu hafta: <span className="font-medium text-gray-600">{users.thisWeek}</span>
    </p>
  </div>
);

const OverviewCards = ({ stats, isLoading, isOwner }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => <StatCardSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      <KpiCard
        label="Jami murojaatlar"
        sublabel="Barcha statuslar"
        total={stats?.requests?.total}
        today={stats?.requests?.today}
        yesterday={stats?.requests?.yesterday}
        resolutionRate={stats?.requests?.resolutionRate}
        icon={FileText}
        colorClass="text-blue-600"
        bgClass="bg-blue-50"
        rateColor="text-blue-700 bg-blue-50"
      />
      <KpiCard
        label="Servis reportlar"
        sublabel="Xizmat muammolari"
        total={stats?.serviceReports?.total}
        today={stats?.serviceReports?.today}
        yesterday={stats?.serviceReports?.yesterday}
        resolutionRate={stats?.serviceReports?.resolutionRate}
        icon={AlertTriangle}
        colorClass="text-orange-600"
        bgClass="bg-orange-50"
        rateColor="text-orange-700 bg-orange-50"
      />
      <KpiCard
        label="MSK buyurtmalar"
        sublabel="Mahalla servis"
        total={stats?.mskOrders?.total}
        today={stats?.mskOrders?.today}
        yesterday={stats?.mskOrders?.yesterday}
        resolutionRate={stats?.mskOrders?.resolutionRate}
        icon={Wrench}
        colorClass="text-purple-600"
        bgClass="bg-purple-50"
        rateColor="text-purple-700 bg-purple-50"
      />
      {isOwner && stats?.users ? (
        <UsersCard users={stats.users} />
      ) : (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-5 flex flex-col justify-center">
          <p className="text-xs text-blue-400 font-medium mb-1">Jami arizalar</p>
          <p className="text-3xl font-bold text-blue-700">
            {((stats?.requests?.total || 0) +
              (stats?.serviceReports?.total || 0) +
              (stats?.mskOrders?.total || 0))}
          </p>
          <p className="text-xs text-blue-400 mt-1">Barcha modullar bo'yicha</p>
        </div>
      )}
    </div>
  );
};

export default OverviewCards;
