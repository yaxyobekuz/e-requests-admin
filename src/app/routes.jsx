// Pages
import Home from "@/features/home/pages/HomePage";

// Layouts
import RootLayout from "@/shared/layouts/RootLayout.jsx";

// Router
import { Routes as RoutesWrapper, Route, Navigate } from "react-router-dom";

const Routes = () => {
  return (
    <>
      <RoutesWrapper>
        {/* Main routes */}
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Home />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </RoutesWrapper>
    </>
  );
};

export default Routes;
