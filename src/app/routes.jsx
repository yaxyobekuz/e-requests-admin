// Pages
import LoginPage from "@/features/auth/pages/LoginPage";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import StatisticsPage from "@/features/statistics/pages/StatisticsPage";
import AdminsPage from "@/features/admin-management/pages/AdminsPage";
import AdminDetailPage from "@/features/admin-management/pages/AdminDetailPage";
import RequestsListPage from "@/features/requests/pages/RequestsListPage";
import ServicesPage from "@/features/services/pages/ServicesPage";
import ServiceReportsPage from "@/features/services/pages/ServiceReportsPage";
import MskCategoriesPage from "@/features/msk/pages/MskCategoriesPage";
import MskOrdersPage from "@/features/msk/pages/MskOrdersPage";
import RequestTypesPage from "@/features/request-types/pages/RequestTypesPage";
import RegionsPage from "@/features/regions/pages/RegionsPage";
import DistrictsPage from "@/features/regions/pages/DistrictsPage";
import NeighborhoodsPage from "@/features/regions/pages/NeighborhoodsPage";
import StreetsPage from "@/features/regions/pages/StreetsPage";

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
          <Route path="/dashboard" element={<StatisticsPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="/requests" element={<RequestsListPage />} />
          <Route path="/service-reports" element={<ServiceReportsPage />} />
          <Route path="/msk/orders" element={<MskOrdersPage />} />
          <Route path="/admins" element={<AdminsPage />} />
          <Route path="/admins/:id" element={<AdminDetailPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/request-types" element={<RequestTypesPage />} />
          <Route path="/msk/categories" element={<MskCategoriesPage />} />
          <Route path="/regions" element={<RegionsPage />} />
          <Route path="/regions/:regionId/districts" element={<DistrictsPage />} />
          <Route path="/regions/:regionId/districts/:districtId/neighborhoods" element={<NeighborhoodsPage />} />
          <Route path="/regions/:regionId/districts/:districtId/neighborhoods/:neighborhoodId/streets" element={<StreetsPage />} />
        </Route>
      </Route>

      {/* Redirects */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </RoutesWrapper>
  );
};

export default Routes;
