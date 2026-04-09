import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing";
import AppealForm from "./pages/AppealForm";
import UploadPage from "./pages/UploadPage";
import Scheduling from "./pages/Scheduling";
import ScheduleNote from "./pages/ScheduleNote";
import Confirmation from "./pages/Confirmation";
import Finish from "./pages/Finish";
import ServiceDown from "./pages/ServiceDown";
import SiteShell from "./components/SiteShell";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default */}
        <Route path="/" element={<Navigate to="/landing" replace />} />

        {/* Shared fixed frame */}
        <Route element={<SiteShell />}>
          {/* Wizard */}
          <Route path="/landing" element={<Landing />} />
          <Route path="/appeal" element={<AppealForm />} />
          <Route path="/uploads" element={<UploadPage />} />
          <Route path="/schedule-note" element={<ScheduleNote />} />
          <Route path="/scheduling" element={<Scheduling />} />
          <Route path="/confirmation" element={<Confirmation />} />

          {/* Outcomes */}
          <Route path="/finish" element={<Finish />} />
          <Route path="/service-down" element={<ServiceDown />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/landing" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
