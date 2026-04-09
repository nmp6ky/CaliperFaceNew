import { Link, Outlet, useLocation } from "react-router-dom";
import boeLogo from "../assets/boe-logo.png";

export default function SiteShell() {
  const { pathname } = useLocation();

  const steps = [
    { path: "/landing", label: "Start" },
    { path: "/appeal", label: "Appeal Details" },
    { path: "/uploads", label: "Uploads" },
    { path: "/scheduling", label: "Scheduling" },
    { path: "/confirmation", label: "Confirmation" },
  ];

  const currentIndex = steps.findIndex((s) => pathname.startsWith(s.path));
  const stepIndex = currentIndex >= 0 ? currentIndex : 0;
  const stepPercent = Math.max(8, ((stepIndex + 1) / steps.length) * 100);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center px-4 sm:px-6">
          <Link to="/landing" className="flex items-center gap-3">
            <img src={boeLogo} alt="St. Charles County Board of Equalization" className="h-9 w-auto object-contain" />
            <span className="hidden text-sm font-semibold text-slate-700 sm:inline">
              St. Charles County BOE
            </span>
          </Link>
        </div>
        <div className="border-t border-slate-200 bg-slate-50">
          <div className="mx-auto w-full max-w-5xl px-4 py-2 sm:px-6">
            <div className="mb-1 flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-wide text-slate-600 sm:text-sm">
              <span>Step {stepIndex + 1} of {steps.length}</span>
              <span>{steps[stepIndex]?.label || "Appeal Intake"}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-300"
                style={{ width: `${stepPercent}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="pt-28">
        <div className="mx-auto min-h-[calc(100vh-7rem)] w-full max-w-5xl bg-white px-3 py-4 sm:rounded-xl sm:border sm:border-slate-200 sm:px-6 sm:py-6 sm:shadow-sm">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
