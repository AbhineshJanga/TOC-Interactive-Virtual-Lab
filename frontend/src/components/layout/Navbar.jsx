import { Link, NavLink } from "react-router";

function Navbar() {
  const navLinkClass = ({ isActive }) =>
    `transition-colors ${
      isActive
        ? "text-white"
        : "text-slate-400 hover:text-white"
    }`;

  return (
    <nav className="border-b border-slate-800 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">
            T
          </div>

          <div>
            <div className="font-semibold text-white">
              TOC Virtual Lab
            </div>
            <div className="text-xs text-slate-500">
              Interactive Theory of Computation
            </div>
          </div>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-8 text-sm font-medium">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>

          <NavLink to="/learn" className={navLinkClass}>
            Learn
          </NavLink>

          <NavLink to="/experiment" className={navLinkClass}>
            Experiment
          </NavLink>
        </div>

        {/* Status */}
        <div className="hidden items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-400 md:flex">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          System Ready
        </div>
      </div>
    </nav>
  );
}

export default Navbar;