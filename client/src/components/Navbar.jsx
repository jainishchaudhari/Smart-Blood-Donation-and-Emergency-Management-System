import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X, LogOut, Plus, UserRound } from "lucide-react";
import { Logo } from "./ui";

const roleLabels = {
  user: "Patient / family",
  donor: "Donor",
  hospital: "Hospital",
  admin: "Admin",
};

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  let currentUser;

  try {
    const savedUser = localStorage.getItem("lifeflowUser");
    currentUser = savedUser ? JSON.parse(savedUser) : null;
  } catch {
    currentUser = null;
  }

  const dashboardRoutes = {
    user: "/user-dashboard",
    donor: "/donor-dashboard",
    hospital: "/hospital-dashboard",
    admin: "/admin-dashboard",
  };

  const profileRoutes = {
    user: "/user-profile",
    donor: "/donor-profile",
    hospital: "/hospital-profile",
    admin: "/admin-profile",
  };

  const dashboardPath = currentUser
    ? dashboardRoutes[currentUser.role] || "/login"
    : "/login";

  const profilePath = currentUser
    ? profileRoutes[currentUser.role] || dashboardPath
    : "/login";

  const navLinks = [
    { name: "Home", path: "/" },
    ...(currentUser
      ? [
          { name: "Find blood", path: "/find-blood" },
          { name: "Requests", path: "/show-requests" },
          { name: "Dashboard", path: dashboardPath },
        ]
      : []),
  ];

  const displayName =
    currentUser?.name || currentUser?.email || "Account";

  const initial = displayName.trim().charAt(0).toUpperCase();
  const roleLabel = roleLabels[currentUser?.role] || "";

  const handleLogout = () => {
    localStorage.removeItem("lifeflowToken");
    localStorage.removeItem("lifeflowUser");

    setMenuOpen(false);
    navigate("/login", { replace: true });
  };

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const desktopLink = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? "bg-ink text-white"
        : "text-muted hover:bg-gray-100 hover:text-ink"
    }`;

  const mobileLink = ({ isActive }) =>
    `rounded-lg px-3 py-3 font-medium transition-colors ${
      isActive
        ? "bg-ink text-white"
        : "text-muted hover:bg-gray-100 hover:text-ink"
    }`;

  const authButton = (idleClass, size) => ({ isActive }) =>
    `btn ${size} ${
      isActive
        ? "bg-ink text-white hover:bg-ink"
        : idleClass
    }`;

  return (
    <nav
      aria-label="Main"
      className="sticky top-0 z-50 border-b border-line bg-white/90 backdrop-blur"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Logo */}
        <Link
          to="/"
          onClick={closeMenu}
          aria-label="LifeFlow home"
        >
          <Logo />
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              end={link.path === "/"}
              className={desktopLink}
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        {/* Desktop account actions */}
        <div className="hidden items-center gap-3 md:flex">
          {currentUser ? (
            <>
              <Link
                to="/emergency-request"
                className="btn btn-primary btn-sm"
              >
                <Plus size={16} />
                Emergency request
              </Link>

              <div className="flex items-center gap-2.5 border-l border-line pl-4">
                {/* Profile avatar, name and icon */}
                <Link
                  to={profilePath}
                  onClick={closeMenu}
                  className="flex items-center gap-2.5 rounded-lg transition-opacity hover:opacity-80"
                  aria-label="Open My Profile"
                  title="My Profile"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white"
                  >
                    {initial}
                  </span>

                  <div className="hidden leading-tight lg:block">
                    <p className="max-w-32 truncate text-sm font-semibold text-ink">
                      {displayName}
                    </p>

                    {roleLabel && (
                      <p className="text-xs text-muted">
                        {roleLabel}
                      </p>
                    )}
                  </div>

                  <UserRound
                    size={18}
                    className="text-muted"
                  />
                </Link>

                {/* Logout */}
                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="Logout"
                  title="Logout"
                  className="rounded-lg p-2 text-muted transition-colors hover:bg-paper hover:text-ink"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={authButton("btn-secondary", "btn-sm")}
              >
                Login
              </NavLink>

              <NavLink
                to="/register"
                className={authButton("btn-primary", "btn-sm")}
              >
                Register
              </NavLink>
            </>
          )}
        </div>

        {/* Mobile emergency button and menu */}
        <div className="flex items-center gap-2 md:hidden">
          {currentUser && (
            <Link
              to="/emergency-request"
              onClick={closeMenu}
              className="btn btn-primary btn-sm"
            >
              <Plus size={16} />
              Emergency
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="-mr-2 rounded-lg p-2 text-ink"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      {menuOpen && (
        <div className="flex flex-col gap-1 border-t border-line bg-white px-4 py-4 md:hidden">
          {/* Mobile account information */}
          {currentUser && (
            <div className="mb-2 flex items-center gap-3 rounded-lg bg-paper p-3">
              <span
                aria-hidden="true"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink font-semibold text-white"
              >
                {initial}
              </span>

              <div className="min-w-0 leading-tight">
                <p className="truncate font-semibold text-ink">
                  {displayName}
                </p>

                {roleLabel && (
                  <p className="text-sm text-muted">
                    {roleLabel}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Main mobile links */}
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              end={link.path === "/"}
              onClick={closeMenu}
              className={mobileLink}
            >
              {link.name}
            </NavLink>
          ))}

          {/* Profile link for every logged-in role */}
          {currentUser && (
            <NavLink
              to={profilePath}
              onClick={closeMenu}
              className={mobileLink}
            >
              <span className="flex items-center gap-2">
                <UserRound size={18} />
                My Profile
              </span>
            </NavLink>
          )}

          {/* Logout or authentication */}
          {currentUser ? (
            <button
              type="button"
              onClick={handleLogout}
              className="btn btn-secondary mt-3"
            >
              <LogOut size={16} />
              Logout
            </button>
          ) : (
            <>
              <NavLink
                to="/login"
                onClick={closeMenu}
                className={authButton("btn-secondary", "mt-2")}
              >
                Login
              </NavLink>

              <NavLink
                to="/register"
                onClick={closeMenu}
                className={authButton("btn-primary", "mt-1")}
              >
                Register
              </NavLink>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;