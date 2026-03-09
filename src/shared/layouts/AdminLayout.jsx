// Icons
import {
  Tags,
  Users,
  MapPin,
  Wrench,
  LogOut,
  FileText,
  Settings,
  Briefcase,
  FolderKanban,
  AlertTriangle,
  LayoutDashboard,
  SlidersHorizontal,
} from "lucide-react";

// Images
import { logo } from "@/shared/assets/images";

// Components
import Button from "@/shared/components/ui/button/Button";

// Router
import { NavLink, useNavigate, Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

const Sidebar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("admin_user") || "{}");

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { isDivider: true },
    { to: "/requests", label: "Murojaatlar", icon: FileText },
    { to: "/service-reports", label: "Xizmat arizalari", icon: AlertTriangle },
    { to: "/msk/orders", label: "MSK buyurtmalar", icon: FolderKanban },
    { isDivider: true },
    { to: "/services", label: "Servislar", icon: Settings },
    { to: "/request-types", label: "Murojaat turlari", icon: Tags },
    { to: "/msk/categories", label: "MSK kategoriyalar", icon: Wrench },
    { to: "/regions", label: "Hududlar", icon: MapPin },
    { isDivider: true },
    { to: "/admins", label: "Adminlar", icon: Users },
    { to: "/admin-roles", label: "Lavozimlar", icon: Briefcase },
    { to: "/settings", label: "Sozlamalar", icon: SlidersHorizontal },
  ];

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    navigate("/login");
  };

  return (
    <aside className="w-64 h-screen sticky inset-y-0 left-0 bg-white border-r flex flex-col">
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

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
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
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to !== "/regions"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full bg-red-50 text-red-600"
        >
          <LogOut className="w-4 h-4" />
          Chiqish
        </Button>
      </div>
    </aside>
  );
};

export default AdminLayout;
