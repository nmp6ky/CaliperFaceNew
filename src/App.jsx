import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import AppealForm from "./pages/AppealForm";
import UploadPage from "./pages/UploadPage";
import Scheduling from "./pages/Scheduling";
import Confirmation from "./pages/Confirmation";
import Finish from "./pages/Finish";
import ServiceDown from "./pages/ServiceDown";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default */}
        <Route path="/" element={<Navigate to="/landing" replace />} />

        {/* Wizard */}
        <Route path="/landing" element={<Landing />} />
        <Route path="/appeal" element={<AppealForm />} />
        <Route path="/uploads" element={<UploadPage />} />
        <Route path="/scheduling" element={<Scheduling />} />
        <Route path="/confirmation" element={<Confirmation />} />

        {/* Outcomes */}
        <Route path="/finish" element={<Finish />} />
        <Route path="/service-down" element={<ServiceDown />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/landing" replace />} />
      </Routes>
    </BrowserRouter>
  );
}