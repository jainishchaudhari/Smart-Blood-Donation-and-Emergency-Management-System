import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import UserDashboard from "./pages/UserDashboard";
import DonorDashboard from "./pages/DonorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import HospitalDashboard from "./pages/HospitalDashboard";

import EmergencyRequest from "./pages/EmergencyRequest";
import ShowRequests from "./pages/ShowRequests";
import FindBlood from "./pages/FindBlood";
import DonationHistory from "./pages/DonationHistory";
import DonorProfile from "./pages/DonorProfile";
import RequestDetails from "./pages/RequestDetails";
import DonorInvitations from "./pages/DonorInvitations";

// Scroll to top whenever the route changes
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:shadow-lg"
      >
        Skip to content
      </a>

      <div className="flex min-h-screen flex-col">
        <Navbar />

        <main id="main" className="flex-1">
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
              <Route path="/user-dashboard" element={<UserDashboard />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["donor"]} />}>
              <Route path="/donor-dashboard" element={<DonorDashboard />} />
              <Route path="/donation-history" element={<DonationHistory />} />
              <Route path="/donor-profile" element={<DonorProfile />} />
              <Route path="/donor-invitations" element={<DonorInvitations />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["hospital"]} />}>
              <Route
                path="/hospital-dashboard"
                element={<HospitalDashboard />}
              />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
            </Route>


            {/* Pages accessible to any logged-in role */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={["user", "donor", "hospital", "admin"]}
                />
              }
            >
              <Route path="/emergency-request" element={<EmergencyRequest />} />

              <Route path="/find-blood" element={<FindBlood />} />

              <Route path="/show-requests" element={<ShowRequests />} />

              <Route path="/requests/:id" element={<RequestDetails />} />
            </Route>
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;