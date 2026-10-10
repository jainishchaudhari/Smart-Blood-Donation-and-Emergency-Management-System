import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import UserDashboard from "./pages/UserDashboard";
import DonorDashboard from "./pages/DonorDashboard";
import AdminDashboard from "./pages/AdminDashboard";

import EmergencyRequest from "./pages/EmergencyRequest";
import ShowRequests from "./pages/ShowRequests";
import FindBlood from "./pages/FindBlood";
import DonationHistory from "./pages/DonationHistory";

import HospitalDashboard from "./pages/HospitalDashboard";

// Start every page at the top when the route changes
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
        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User Dashboard */}
        <Route path="/user-dashboard" element={<UserDashboard />} />

        {/* Donor Dashboard */}
        <Route path="/donor-dashboard" element={<DonorDashboard />} />

        {/* Admin Dashboard */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />

        {/* Emergency Request */}
        <Route path="/emergency-request" element={<EmergencyRequest />} />

        {/* Show Requests */}
        <Route path="/show-requests" element={<ShowRequests />} />

        {/* Find Blood */}
        <Route path="/find-blood" element={<FindBlood />} />

        {/* Donation History */}
        <Route path="/donation-history" element={<DonationHistory />} />

        {/* Hospital Dashboard */}
        <Route path="/hospital-dashboard" element={<HospitalDashboard />} />
      </Routes>
      </main>

      <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
