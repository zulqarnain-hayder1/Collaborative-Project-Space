import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navLinkClass = ({ isActive }) =>
  `rounded-xl px-4 py-2 text-xs font-bold transition-all duration-200 ${
    isActive
      ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;

function Navbar() {
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl shadow-xs">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-blue-600 text-white font-black text-lg shadow-md shadow-indigo-200">
            C
          </div>
          <span className="font-display text-lg font-extrabold tracking-tight text-slate-900">
            Collaborative <span className="text-indigo-600">Space</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <NavLink to="/dashboard" className={navLinkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/projects/new" className={navLinkClass}>
            + New Project
          </NavLink>

          <div className="h-5 w-px bg-slate-200 mx-1 hidden md:block" />

          {user && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-xs font-bold text-white shadow-xs">
                  {initials}
                </div>
                <span className="hidden text-xs font-bold text-slate-700 md:block">{user.name}</span>
              </div>
              <button
                type="button"
                onClick={logout}
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
