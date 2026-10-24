import { useCallback, useEffect, useState } from "react";
import {
  Droplet,
  Hospital,
  Phone,
  CalendarDays,
  MapPin,
  CheckCircle,
  Clock,
  ClipboardList,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import RequestsMap from "../components/RequestsMap";

const API_URL = "http://localhost:5000/api/requests";

const getSavedUser = () => {
  try {
    return JSON.parse(localStorage.getItem("lifeflowUser") || "null");
  } catch {
    return null;
  }
};

const getStatusStyle = (status) => {
  switch ((status || "pending").toLowerCase()) {
    case "accepted":
      return "bg-blue-100 text-blue-700";
    case "completed":
      return "bg-green-100 text-green-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    case "scheduled":
      return "bg-purple-100 text-purple-700";
    default:
      return "bg-yellow-100 text-yellow-800";
  }
};

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function ShowRequests() {
  const currentUser = getSavedUser();
  const token = localStorage.getItem("lifeflowToken");
  const isDonor = currentUser?.role === "donor";

  const [activeTab, setActiveTab] = useState("pending");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("all");

  const fetchRequests = useCallback(async () => {
    if (!token) {
      setError("Please log in to view blood requests.");
      setRequests([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const query =
        activeTab === "accepted"
          ? "?myAccepted=true"
          : "?status=pending";

      const response = await fetch(`${API_URL}${query}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message || "Unable to fetch blood requests."
        );
      }

      setRequests(Array.isArray(data.requests) ? data.requests : []);
    } catch (err) {
      setRequests([]);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [token, activeTab]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAcceptRequest = async (requestId) => {
    if (!window.confirm("Do you want to accept this blood request?")) {
      return;
    }

    setAcceptingId(requestId);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/${requestId}/accept`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message || "Failed to accept blood request."
        );
      }

      setSuccess(
        "Request accepted successfully! You can view it in My Accepted Requests."
      );

      // Switch to the accepted requests tab
      setActiveTab("accepted");
    } catch (err) {
      setError(err.message || "Unable to accept this request.");
    } finally {
      setAcceptingId(null);
    }
  };

  const filteredRequests = requests.filter((request) => {
    if (urgencyFilter === "all") return true;

    const urgency = (request.urgency || "medium").toLowerCase();

    // Backend stores low / medium / high / critical.
    // The "normal" filter covers everything that is not high or critical.
    if (urgencyFilter === "normal") {
      return urgency !== "critical" && urgency !== "high";
    }

    return urgency === urgencyFilter.toLowerCase();
  });

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Page heading */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Blood Requests
            </h1>

            <p className="mt-2 text-gray-600">
              View blood requests and track your accepted requests.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchRequests}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={18}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Success message */}
        {success && (
          <div
            role="status"
            className="mb-5 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800"
          >
            <CheckCircle size={21} className="mt-0.5 shrink-0" />
            <p>{success}</p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
          >
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-3 border-b border-gray-200 pb-4">
          <button
            type="button"
            onClick={() => {
              setSuccess("");
              setError("");
              setActiveTab("pending");
              setUrgencyFilter("all");
            }}
            className={`inline-flex items-center gap-2 rounded-lg px-5 py-3 font-semibold transition ${
              activeTab === "pending"
                ? "bg-red-600 text-white shadow"
                : "bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-100"
            }`}
          >
            <ClipboardList size={19} />
            Pending Requests
          </button>

          {isDonor && (
            <button
              type="button"
              onClick={() => {
                setSuccess("");
                setError("");
                setActiveTab("accepted");
                setUrgencyFilter("all");
              }}
              className={`inline-flex items-center gap-2 rounded-lg px-5 py-3 font-semibold transition ${
                activeTab === "accepted"
                  ? "bg-blue-600 text-white shadow"
                  : "bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-100"
              }`}
            >
              <CheckCircle size={19} />
              My Accepted Requests
            </button>
          )}
        </div>

        {/* Status information */}
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">
              {activeTab === "pending"
                ? "Available Blood Requests"
                : "Requests Accepted by Me"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {activeTab === "pending"
                ? "Accept a request to move it to your accepted requests."
                : "These requests have been accepted by your donor account."}
            </p>
          </div>

          <span className="w-fit rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700">
            {filteredRequests.length} request
            {filteredRequests.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Urgency filters */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm font-medium text-gray-600">
            Urgency:
          </span>

          {["all", "critical", "high", "normal"].map((level) => (
            <button
              type="button"
              key={level}
              onClick={() => setUrgencyFilter(level)}
              className={`rounded-full px-4 py-2 text-sm font-medium capitalize ${
                urgencyFilter === level
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-100"
              }`}
            >
              {level === "all" ? "All" : level}
            </button>
          ))}
        </div>

        {/* Map of requests */}
        {!loading && filteredRequests.length > 0 && (
          <RequestsMap requests={filteredRequests} />
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <RefreshCw size={32} className="mb-3 animate-spin" />
            <p>Loading blood requests...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredRequests.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-16 text-center">
            <Droplet
              size={44}
              className="mx-auto mb-4 text-gray-300"
            />

            <h3 className="text-xl font-semibold text-gray-800">
              {activeTab === "pending"
                ? "No pending requests found"
                : "No accepted requests yet"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-gray-500">
              {activeTab === "pending"
                ? "New blood requests will appear here when available."
                : "When you accept a blood request, it will appear here with its current status."}
            </p>

            {activeTab === "accepted" && (
              <button
                type="button"
                onClick={() => {
                  setSuccess("");
                  setActiveTab("pending");
                }}
                className="mt-5 rounded-lg bg-red-600 px-5 py-2.5 font-semibold text-white hover:bg-red-700"
              >
                Browse Pending Requests
              </button>
            )}
          </div>
        )}

        {/* Request cards */}
        {!loading && filteredRequests.length > 0 && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {filteredRequests.map((request) => {
              const urgency = (
                request.urgency || "normal"
              ).toLowerCase();

              const urgencyStyle =
                urgency === "critical"
                  ? "bg-red-100 text-red-700"
                  : urgency === "high"
                  ? "bg-orange-100 text-orange-700"
                  : "bg-green-100 text-green-700";

              return (
                <div
                  key={request._id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  {/* Card header */}
                  <div className="flex items-start justify-between gap-3 border-b border-gray-100 p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                        <Droplet size={25} />
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {request.patientName || "Patient"}
                        </h3>

                        <p className="mt-1 text-xs text-gray-500">
                          Request ID: {request._id}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${urgencyStyle}`}
                    >
                      {urgency}
                    </span>
                  </div>

                  <div className="space-y-5 p-5">
                    {/* Blood group and units */}
                    <div className="flex flex-wrap gap-3">
                      <div className="rounded-xl bg-red-50 px-4 py-3">
                        <p className="text-xs text-gray-500">
                          Blood Group
                        </p>
                        <p className="mt-1 text-2xl font-bold text-red-600">
                          {request.bloodGroup || "N/A"}
                        </p>
                      </div>

                      <div className="rounded-xl bg-gray-50 px-4 py-3">
                        <p className="text-xs text-gray-500">
                          Units Required
                        </p>
                        <p className="mt-1 text-2xl font-bold text-gray-900">
                          {request.units ?? "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Request status */}
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-gray-50 p-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <CheckCircle size={18} />
                        Request Status
                      </div>

                      <span
                        className={`rounded-full px-3 py-1.5 text-sm font-semibold capitalize ${getStatusStyle(
                          request.status
                        )}`}
                      >
                        {request.status || "pending"}
                      </span>
                    </div>

                    {/* Hospital */}
                    <div className="flex items-start gap-3">
                      <Hospital
                        size={19}
                        className="mt-0.5 shrink-0 text-gray-400"
                      />

                      <div>
                        <p className="text-xs text-gray-500">
                          Hospital
                        </p>
                        <p className="font-medium text-gray-800">
                          {request.hospitalName || "Not provided"}
                        </p>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-start gap-3">
                      <MapPin
                        size={19}
                        className="mt-0.5 shrink-0 text-gray-400"
                      />

                      <div>
                        <p className="text-xs text-gray-500">
                          Location
                        </p>
                        <p className="font-medium text-gray-800">
                          {[request.area, request.city]
                            .filter(Boolean)
                            .join(", ") || "Not provided"}
                        </p>

                        {typeof request.latitude === "number" &&
                          typeof request.longitude === "number" && (
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${request.latitude},${request.longitude}`}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-1 inline-block text-sm font-semibold text-blue-600 hover:underline"
                            >
                              Get directions
                            </a>
                          )}
                      </div>
                    </div>

                    {/* Contact */}
                    <div className="flex items-start gap-3">
                      <Phone
                        size={19}
                        className="mt-0.5 shrink-0 text-gray-400"
                      />

                      <div>
                        <p className="text-xs text-gray-500">
                          Contact Number
                        </p>
                        <p className="font-medium text-gray-800">
                          {request.contactNumber || "Not provided"}
                        </p>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-3">
                      <CalendarDays
                        size={19}
                        className="shrink-0 text-gray-400"
                      />

                      <div>
                        <p className="text-xs text-gray-500">
                          Request Date
                        </p>
                        <p className="font-medium text-gray-800">
                          {formatDate(request.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Notes */}
                    {request.notes && (
                      <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                        <p className="mb-1 text-xs font-semibold text-gray-500">
                          Additional Notes
                        </p>
                        <p className="text-sm text-gray-700">
                          {request.notes}
                        </p>
                      </div>
                    )}

                    {/* Accepted donor details */}
                    {activeTab === "accepted" &&
                      request.acceptedBy && (
                        <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
                          <p className="text-xs font-semibold text-blue-700">
                            Accepted By
                          </p>
                          <p className="mt-1 font-medium text-blue-900">
                            {request.acceptedBy.name || "You"}
                          </p>
                        </div>
                      )}

                    <Link
                      to={`/requests/${request._id}`}
                      className="block rounded-xl border border-gray-200 px-5 py-3 text-center font-semibold text-gray-700 transition hover:bg-gray-50"
                    >
                      View details and map
                    </Link>

                    {/* Accept button */}
                    {activeTab === "pending" && isDonor && (
                      <button
                        type="button"
                        onClick={() =>
                          handleAcceptRequest(request._id)
                        }
                        disabled={acceptingId !== null}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {acceptingId === request._id ? (
                          <>
                            <RefreshCw
                              size={19}
                              className="animate-spin"
                            />
                            Accepting...
                          </>
                        ) : (
                          <>
                            <CheckCircle size={19} />
                            Accept Request
                          </>
                        )}
                      </button>
                    )}

                    {/* Pending status for non-donor */}
                    {activeTab === "pending" && !isDonor && (
                      <div className="rounded-lg bg-gray-100 px-4 py-3 text-center text-sm text-gray-600">
                        <Clock
                          size={16}
                          className="mr-1 inline"
                        />
                        Waiting for a donor to accept this request.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}