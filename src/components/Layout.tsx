import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { routeSeoList } from '../lib/seoConfig';
import ThemeToggle from './ThemeToggle';
import Footer from './Footer';
import FaqModal from './FaqModal';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 overflow-hidden light:bg-slate-50 light:text-slate-900">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-slate-900 p-6 flex flex-col space-y-4 shadow-xl border-r border-slate-800 transform transition-transform duration-300 md:translate-x-0 light:bg-white light:border-slate-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Link
          to="/"
          onClick={() => setSidebarOpen(false)}
          className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-6"
        >
          ConvertGrove
        </Link>
        <nav>
          <ul className="space-y-2">
            {routeSeoList.map((r) => (
              <li key={r.path}>
                <NavLink
                  to={r.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `block w-full text-left py-3 px-4 rounded-lg transition-all duration-300 font-medium ${
                      isActive
                        ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent light:text-slate-500 light:hover:bg-slate-100 light:hover:text-slate-900'
                    }`
                  }
                >
                  {r.navLabel}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800 light:border-slate-200">
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">100% Client-Side</p>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-y-auto bg-[radial-gradient(circle_at_center,rgba(15,23,42,1)_0%,rgba(2,6,23,1)_100%)] light:bg-none">
        <div className="flex items-center justify-between gap-3 p-4 md:p-6 md:pb-0">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 light:border-slate-300 light:bg-white light:text-slate-500"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link
            to="/"
            className="md:hidden font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500"
          >
            ConvertGrove
          </Link>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>

        <main className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col">
          <Outlet />
        </main>

        <Footer onOpenFaq={() => setFaqOpen(true)} />
      </div>

      {faqOpen && <FaqModal onClose={() => setFaqOpen(false)} />}
    </div>
  );
};

export default Layout;
