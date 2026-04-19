import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import MissionFamilyPage from "./pages/MissionFamilyPage";
import PayloadPage from "./pages/PayloadPage";
import RoiPage from "./pages/RoiPage";
import ParametersPage from "./pages/ParametersPage";
import ResultPage from "./pages/ResultPage";
import SceneBridge from "./scene/SceneBridge";
import SceneCanvas from "./scene/SceneCanvas";
import RouteTransition from "./ui/RouteTransition";

function RootLayout() {
  return (
    <div className="appRoot">
      <SceneCanvas />
      <div className="uiLayer">
        <SceneBridge />
        <RouteTransition>
          <Outlet />
        </RouteTransition>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<MissionFamilyPage />} />
        <Route path="/payload" element={<PayloadPage />} />
        <Route path="/roi" element={<RoiPage />} />
        <Route path="/parameters" element={<ParametersPage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
