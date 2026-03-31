// Icons
import {
  Tags,
  Users,
  MapPin,
  Wrench,
  Sprout,
  FileText,
  PieChart,
  Settings,
  Briefcase,
  UserCircle,
  UserRound,
  FolderKanban,
  AlertTriangle,
  LayoutDashboard,
  SlidersHorizontal,
  BarChart2,
} from "lucide-react";

// Utils
import { cn } from "../utils/cn";

// Images
import { logo } from "@/shared/assets/images";

// API
import { authAPI } from "@/features/auth/api";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// Router
import { NavLink, Outlet } from "react-router-dom";

// Components
import BugReport from "../components/layout/BugReport";

const AdminLayout = () => {
  return (
    <div className="flex min-h-svh bg-slate-50 relative">
      {/* Sidebar */}
      <Sidebar />

      {/* Outlet(Main) */}
      <main className="flex-1 min-h-svh relative z-10">
        <Outlet />
      </main>

      {/* Background Patterns */}
      <BackgroundPatterns />

      <BugReport />
    </div>
  );
};

const Sidebar = () => {
  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/statistics", label: "Statistika", icon: BarChart2 },
    { to: "/users", label: "Foydalanuvchilar", icon: UserRound },
    { to: "/users-stats", label: "Aholi statistikasi", icon: PieChart },
    { isDivider: true },
    { to: "/requests", label: "Murojaatlar", icon: FileText },
    { to: "/service-reports", label: "Xizmat arizalari", icon: AlertTriangle },
    { to: "/msk/orders", label: "MSK buyurtmalar", icon: FolderKanban },
    { isDivider: true },
    { to: "/services", label: "Servislar", icon: Settings },
    { to: "/request-types", label: "Murojaat turlari", icon: Tags },
    { to: "/msk/categories", label: "MSK kategoriyalar", icon: Wrench },
    { to: "/products", label: "Mahsulotlar", icon: Sprout },
    { to: "/regions", label: "Hududlar", icon: MapPin },
    { isDivider: true },
    { to: "/admins", label: "Adminlar", icon: Users },
    { to: "/admin-roles", label: "Lavozimlar", icon: Briefcase },
    { to: "/settings", label: "Sozlamalar", icon: SlidersHorizontal },
  ];

  return (
    <div className="relative w-64 h-auto">
      <aside className="flex flex-col w-full h-svh sticky top-0 left-0 z-20 bg-white/60 backdrop-blur-xl border-r border-white/50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 py-3 border-b">
          <img
            width={32}
            src={logo}
            height={32}
            className="size-8"
            alt="e-Murojaat logo"
          />
          <p className="font-bold text-lg">e-Murojaat</p>
        </div>

        {/* Main (Nav items) */}
        <nav className="flex-1 p-3 w-full overflow-y-auto space-y-1 hidden-scrollbar">
          {navItems.map((item, idx) => {
            if (item.isDivider) {
              return (
                <hr
                  key={`divider-${idx}`}
                  className="mx-2 border-t border-gray-200"
                />
              );
            }

            return (
              <NavItem
                to={item.to}
                key={item.to}
                icon={item.icon}
                label={item.label}
                end={item.to !== "/regions"}
              />
            );
          })}
        </nav>

        {/* Footer */}
        <SidebarFooter />
      </aside>
    </div>
  );
};

const SidebarFooter = () => {
  const { data: user = {} } = useQuery({
    queryKey: ["auth", "me"],
    staleTime: 5 * 60 * 1000,
    queryFn: () => authAPI.getMe().then((res) => res.data),
  });

  return (
    <div className="p-3 border-t">
      {/* Profil */}
      <NavItem
        to="/profile"
        icon={UserCircle}
        label={user.firstName || "Owner"}
      />
    </div>
  );
};

const NavItem = ({ to, label, ...rest }) => (
  <NavLink
    to={to}
    end={to}
    className={({ isActive }) =>
      cn(
        "flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors",
        isActive
          ? "bg-blue-50 text-blue-700"
          : "text-gray-600 hover:bg-gray-50",
      )
    }
  >
    {({ isActive }) => (
      <>
        <rest.icon
          strokeWidth={1.5}
          className={cn(
            "size-5 transition-all duration-300",
            isActive
              ? "text-blue-600 scale-110 rotate-0"
              : "text-gray-400 scale-90 rotate-[360deg]",
          )}
        />
        {label}
      </>
    )}
  </NavLink>
);

const BackgroundPatterns = () => (
  <>
    <div className="fixed inset-0 z-0 h-full w-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
    <div className="fixed left-0 right-0 top-[-10%] z-0 m-auto h-[300px] w-[300px] rounded-full bg-blue-500 opacity-20 blur-[100px]" />
    <div className="fixed bottom-[-10%] left-[-10%] z-0 h-[300px] w-[300px] rounded-full bg-indigo-500 opacity-20 blur-[100px]" />
    <div className="fixed top-[20%] right-[-5%] z-0 h-[250px] w-[250px] rounded-full bg-purple-500 opacity-20 blur-[100px]" />
  </>
);

export default AdminLayout;
