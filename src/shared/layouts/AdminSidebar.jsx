import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  Wrench,
  AlertTriangle,
  MapPin,
  LogOut,
  FolderKanban,
} from "lucide-react";
import { logo } from "@/shared/assets/images";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("admin_user") || "{}");
  const isOwner = user.role === "owner";

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, show: true },
    { to: "/requests", label: "Murojaatlar", icon: FileText, show: true },
    {
      to: "/service-reports",
      label: "Servis reportlar",
      icon: AlertTriangle,
      show: true,
    },
    {
      to: "/msk/orders",
      label: "MSK buyurtmalar",
      icon: FolderKanban,
      show: true,
    },
    { to: "/admins", label: "Adminlar", icon: Users, show: isOwner },
    { to: "/services", label: "Servislar", icon: Settings, show: isOwner },
    {
      to: "/msk/categories",
      label: "MSK kategoriyalar",
      icon: Wrench,
      show: isOwner,
    },
    { to: "/regions", label: "Hududlar", icon: MapPin, show: isOwner },
  ];

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    navigate("/login");
  };

  return (
    <aside className="w-64 bg-white border-r flex flex-col">
      <div className="flex items-center gap-3 p-4 py-3 border-b">
        <img
          width={32}
          height={32}
          src={logo}
          alt="e-Murojaat logo"
          className="size-8"
        />
        <p className="font-bold text-lg">e-Murojaat</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems
          .filter((item) => item.show)
          .map((item) => (
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
          ))}
      </nav>

      <div className="p-3 pt-0 border-t">
        {/* User */}
        <div className="p-3">
          <p className="text-sm font-medium truncate">
            {user.alias || user.firstName || "Admin"}
          </p>
          <p className="text-xs text-gray-500 capitalize">{user.role}</p>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Chiqish
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
