import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiSun, FiMoon, FiLogOut } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

function getInitialTheme() {
  try {
    const saved = localStorage.getItem("tudum-theme");
    if (saved === "light" || saved === "dark") return saved;
  } catch { /* ignore */ }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

const LINKS = [
  { to: "/dashboard", label: "Home" },
  { to: "/tasks", label: "Tasks" },
  { to: "/interviews", label: "Mock interview" },
  { to: "/about", label: "About" },
];

const Navbar = () => {
  const [theme, setTheme] = useState(getInitialTheme);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("tudum-theme", theme); } catch { /* ignore */ }
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  const handleLogout = () => { logout(); navigate("/login"); };

  const linkClass = ({ isActive }) =>
    (isActive ? "text-[var(--amber)] font-semibold" : "text-[var(--muted)]") +
    " hover:text-[var(--text)] transition-colors";

  return (
    <nav className="bg-[var(--surface)] border-b border-[var(--border)] px-4 py-3">
      <div className="container mx-auto flex justify-between items-center">
        <NavLink to="/dashboard" className="font-display text-2xl font-extrabold tracking-tight text-[var(--text)]">
          TuDummmm
        </NavLink>
        <div className="flex items-center gap-6">
          <ul className="flex gap-6 items-center">
            {LINKS.map((l) => (
              <li key={l.to}><NavLink to={l.to} className={linkClass}>{l.label}</NavLink></li>
            ))}
          </ul>
          <button onClick={toggle} aria-label="Toggle theme"
            className="grid place-items-center w-9 h-9 rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--border-strong)] transition-colors">
            {theme === "dark" ? <FiSun /> : <FiMoon />}
          </button>
          {user && (
            <button onClick={handleLogout} title={`Sign out (${user.email})`} aria-label="Sign out"
              className="grid place-items-center w-9 h-9 rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-[var(--amber-2)] hover:border-[var(--border-strong)] transition-colors">
              <FiLogOut />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;