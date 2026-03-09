// Pages
import LoginPage from "@/features/auth/pages/LoginPage";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import AdminsPage from "@/features/admin-management/pages/AdminsPage";
import AdminDetailPage from "@/features/admin-management/pages/AdminDetailPage";
import RequestsListPage from "@/features/requests/pages/RequestsListPage";
import RequestDetailPage from "@/features/requests/pages/RequestDetailPage";
import ServicesPage from "@/features/services/pages/ServicesPage";
import ServiceReportsPage from "@/features/services/pages/ServiceReportsPage";
import ServiceReportDetailPage from "@/features/services/pages/ServiceReportDetailPage";
import MskCategoriesPage from "@/features/msk/pages/MskCategoriesPage";
import MskOrdersPage from "@/features/msk/pages/MskOrdersPage";
import MskOrderDetailPage from "@/features/msk/pages/MskOrderDetailPage";
import RequestTypesPage from "@/features/request-types/pages/RequestTypesPage";
import RegionsPage from "@/features/regions/pages/RegionsPage";
import DistrictsPage from "@/features/regions/pages/DistrictsPage";
import NeighborhoodsPage from "@/features/regions/pages/NeighborhoodsPage";
import StreetsPage from "@/features/regions/pages/StreetsPage";
import SettingsPage from "@/features/settings/pages/SettingsPage";
import AdminRolesPage from "@/features/admin-roles/pages/AdminRolesPage";

// Guards
import AuthGuard from "@/shared/components/guards/AuthGuard";
import GuestGuard from "@/shared/components/guards/GuestGuard";

// Layouts
import AdminLayout from "@/shared/layouts/AdminLayout";

// Router
import { Routes as RoutesWrapper, Route, Navigate } from "react-router-dom";

const Routes = () => {
  return (
    <RoutesWrapper>
      {/* Guest only */}
      <Route element={<GuestGuard />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Protected routes */}
      <Route element={<AuthGuard />}>
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/requests" element={<RequestsListPage />} />
          <Route path="/requests/:id" element={<RequestDetailPage />} />
          <Route path="/service-reports" element={<ServiceReportsPage />} />
          <Route path="/service-reports/:id" element={<ServiceReportDetailPage />} />
          <Route path="/msk/orders" element={<MskOrdersPage />} />
          <Route path="/msk/orders/:id" element={<MskOrderDetailPage />} />
          <Route path="/admins" element={<AdminsPage />} />
          <Route path="/admins/:id" element={<AdminDetailPage />} />
          <Route path="/admin-roles" element={<AdminRolesPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/request-types" element={<RequestTypesPage />} />
          <Route path="/msk/categories" element={<MskCategoriesPage />} />
          <Route path="/regions" element={<RegionsPage />} />
          <Route path="/regions/:regionId/districts" element={<DistrictsPage />} />
          <Route path="/regions/:regionId/districts/:districtId/neighborhoods" element={<NeighborhoodsPage />} />
          <Route path="/regions/:regionId/districts/:districtId/neighborhoods/:neighborhoodId/streets" element={<StreetsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </RoutesWrapper>
  );
};

export default Routes;
