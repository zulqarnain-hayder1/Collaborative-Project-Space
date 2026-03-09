import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navLinkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-semibold transition ${
    isActive ? "bg-indigo-600 text-white" : "text-slate-700 hover:bg-indigo-50"
  }`;

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="font-display text-lg font-bold text-indigo-700">
          Collaborative Project Space
        </Link>

        <div className="flex items-center gap-3">
          <NavLink to="/dashboard" className={navLinkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/projects/new" className={navLinkClass}>
            Create Project
          </NavLink>
          <span className="hidden text-sm text-slate-600 md:block">{user?.name}</span>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Logout
          </button>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
