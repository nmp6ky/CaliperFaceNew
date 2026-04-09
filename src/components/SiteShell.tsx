import { Link, Outlet, useLocation } from "react-router-dom";
import boeLogo from "../assets/boe-logo.png";

const NAV_LINKS = [
  { to: "/landing", label: "Start" },
  { to: "/appeal", label: "Appeal" },
  { to: "/uploads", label: "Uploads" },
  { to: "/scheduling", label: "Schedule" },
  { to: "/confirmation", label: "Confirm" },
];

export default function SiteShell() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/landing" className="flex items-center gap-3">
            <img src={boeLogo} alt="St. Charles County Board of Equalization" className="h-9 w-auto object-contain" />
            <span className="hidden text-sm font-semibold text-slate-700 sm:inline">
              St. Charles County BOE
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                    isActive ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 pb-24 pt-20 sm:px-6">
        <Outlet />
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 text-xs text-slate-600 sm:px-6 sm:text-sm">
          <span>St. Charles County Board of Equalization</span>
          <span>Public Appeal Intake</span>
        </div>
      </footer>
    </div>
  );
}
