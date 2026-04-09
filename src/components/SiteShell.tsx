import { Link, Outlet } from "react-router-dom";
import boeLogo from "../assets/boe-logo.png";

export default function SiteShell() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link to="/landing" className="flex items-center gap-3">
            <img src={boeLogo} alt="St. Charles County Board of Equalization" className="h-9 w-auto object-contain" />
            <span className="hidden text-sm font-semibold text-slate-700 sm:inline">
              St. Charles County BOE
            </span>
          </Link>
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 sm:text-sm">
            Appeal Form
          </span>
        </div>
      </header>

      <main className="pt-16">
        <div className="mx-auto min-h-[calc(100vh-4rem)] w-full max-w-5xl border-slate-200 bg-white px-2 py-3 sm:border-x sm:px-6 sm:py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
