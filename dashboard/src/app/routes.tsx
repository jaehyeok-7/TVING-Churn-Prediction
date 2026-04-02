import { createBrowserRouter, Navigate } from "react-router";
import { ProtectedRoot } from "./components/layout/ProtectedRoot";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AnalysisPage } from "./pages/AnalysisPage";
import { ChurnActionPage } from "./pages/ChurnActionPage"; // ✅ 이게 있어야 함
import { RiskDrilldownPage } from "./pages/RiskDrilldownPage";
import { DeviceAnalysisPage } from "./pages/DeviceAnalysisPage";
import { SegmentDrilldownPage } from "./pages/SegmentDrilldownPage";

export const router = createBrowserRouter([
  { path: "/login", Component: LoginPage },
  {
    path: "/",
    Component: ProtectedRoot,
    children: [
      { index: true, Component: DashboardPage },
      { path: "analysis", Component: AnalysisPage },
      { path: "churn-action", Component: ChurnActionPage }, // ✅
      {
        path: "drilldown/risk/:band",
        Component: RiskDrilldownPage,
      },
      {
        path: "drilldown/device/:device",
        Component: DeviceAnalysisPage,
      },
      {
        path: "drilldown/segment/:segment",
        Component: SegmentDrilldownPage,
      },

      // 구 경로 리다이렉트
      {
        path: "service-status",
        element: (
          <Navigate to="/analysis?tab=service" replace />
        ),
      },
      {
        path: "behavior-patterns",
        element: (
          <Navigate to="/analysis?tab=behavior" replace />
        ),
      },
      {
        path: "user-analysis",
        element: <Navigate to="/analysis?tab=user" replace />,
      },
      {
        path: "churn-risk",
        element: (
          <Navigate to="/churn-action?tab=churn" replace />
        ),
      },
      {
        path: "intervention",
        element: (
          <Navigate to="/churn-action?tab=action" replace />
        ),
      },
    ],
  },
  { path: "*", element: <Navigate to="/login" replace /> },
]);