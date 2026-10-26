import { Navigate, Link } from "react-router-dom";
import { Building2, Mail, ArrowLeft } from "lucide-react";
import { DashboardShell, SectionTitle } from "../components/ui";

function HospitalProfile() {
  const savedUser = localStorage.getItem("lifeflowUser");

  let currentUser;

  try {
    currentUser = savedUser ? JSON.parse(savedUser) : null;
  } catch {
    currentUser = null;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.role !== "hospital") {
    const dashboardRoutes = {
      user: "/user-dashboard",
      donor: "/donor-dashboard",
      admin: "/admin-dashboard",
    };

    return (
      <Navigate
        to={dashboardRoutes[currentUser.role] || "/login"}
        replace
      />
    );
  }

  return (
    <DashboardShell
      user={currentUser}
      subtitle="View your hospital account information."
    >
      <div className="mb-5">
        <Link
          to="/hospital-dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-ink"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
      </div>

      <SectionTitle>Hospital Profile</SectionTitle>

      <div className="card mt-4 space-y-5 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ink text-white">
            <Building2 size={30} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-ink">
              {currentUser.name || "Hospital"}
            </h2>

            <p className="text-sm text-muted">
              Hospital / Blood Bank Account
            </p>
          </div>
        </div>

        <div className="border-t border-line pt-5">
          <p className="mb-2 text-sm font-medium text-muted">
            Hospital Name
          </p>

          <div className="flex items-center gap-3 text-ink">
            <Building2 size={18} />
            <span>{currentUser.name || "Not available"}</span>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-muted">
            Email Address
          </p>

          <div className="flex items-center gap-3 text-ink">
            <Mail size={18} />
            <span>{currentUser.email || "Not available"}</span>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

export default HospitalProfile;