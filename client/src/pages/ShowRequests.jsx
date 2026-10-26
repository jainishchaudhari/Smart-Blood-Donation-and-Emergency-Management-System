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
import { EmptyState, PageContainer, PageHeader, Pill } from "../components/ui";

const API_URL = "http://localhost:5000/api/requests";

const getSavedUser = () => {
  try {
    return JSON.parse(localStorage.getItem("lifeflowUser") || "null");
  } catch {
    return null;
  }
};

// Status of the request itself (pending -> accepted -> in progress -> completed/cancelled).
const STATUS_INFO = {
  pending: { tone: "warn", label: "Pending" },
  accepted: { tone: "ok", label: "Accepted" },
  in_progress: { tone: "ok", label: "In progress" },
  completed: { tone: "ok", label: "Completed" },
  cancelled: { tone: "neutral", label: "Cancelled" },
  scheduled: { tone: "neutral", label: "Scheduled" },
};

const getStatusInfo = (status) =>
  STATUS_INFO[(status || "pending").toLowerCase()] || {
    tone: "neutral",
    label: status || "Pending",
  };

// Urgency of the request (how soon blood is needed).
const URGENCY_INFO = {
  critical: { tone: "critical", label: "Critical" },
  high: { tone: "warn", label: "High" },
};

const getUrgencyInfo = (urgency) =>
  URGENCY_INFO[(urgency || "normal").toLowerCase()] || {
    tone: "ok",
    label: "Normal",
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
    <PageContainer>
      <PageHeader
        title="Blood requests"
        text="View blood requests and track your accepted requests."
        action={
          <button
            type="button"
            onClick={fetchRequests}
            disabled={loading}
            className="btn btn-secondary"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        }
      />

      {/* Success message */}
      {success && (
        <div
          role="status"
          className="mt-6 flex items-start gap-3 rounded-lg border border-ok/30 bg-ok-soft p-4 text-ok"
        >
          <CheckCircle size={21} className="mt-0.5 shrink-0" />
          <p>{success}</p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div
          role="alert"
          className="mt-6 rounded-lg border border-blood/30 bg-plasma p-4 text-blood-deep"
        >
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="mt-8 flex flex-wrap gap-3 border-b border-line pb-5">
        <button
          type="button"
          onClick={() => {
            setSuccess("");
            setError("");
            setActiveTab("pending");
            setUrgencyFilter("all");
          }}
          aria-current={activeTab === "pending" ? "page" : undefined}
          className="btn btn-secondary"
        >
          <ClipboardList size={18} />
          Pending requests
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
            aria-current={activeTab === "accepted" ? "page" : undefined}
            className="btn btn-secondary"
          >
            <CheckCircle size={18} />
            My accepted requests
          </button>
        )}
      </div>

      {/* Status information */}
      <div className="mt-6 flex flex-col gap-3 rounded-xl border border-line bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-ink">
            {activeTab === "pending"
              ? "Available blood requests"
              : "Requests accepted by me"}
          </h2>

          <p className="mt-1 text-sm text-muted">
            {activeTab === "pending"
              ? "Accept a request to move it to your accepted requests."
              : "These requests have been accepted by your donor account."}
          </p>
        </div>

        <span className="w-fit rounded-full bg-paper px-3 py-1.5 text-sm font-medium text-muted">
          {filteredRequests.length} request
          {filteredRequests.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Urgency filters */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm font-medium text-muted">
          Urgency:
        </span>

        {["all", "critical", "high", "normal"].map((level) => (
          <button
            type="button"
            key={level}
            onClick={() => setUrgencyFilter(level)}
            className={`rounded-lg border px-4 py-2 text-sm font-semibold capitalize transition-colors ${
              urgencyFilter === level
                ? "border-ink bg-ink text-white"
                : "border-ink/20 bg-white text-ink hover:border-ink/40"
            }`}
          >
            {level === "all" ? "All" : level}
          </button>
        ))}
      </div>

      {/* Map of requests */}
      {!loading && filteredRequests.length > 0 && (
        <div className="mt-6">
          <RequestsMap requests={filteredRequests} />
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 text-muted">
          <RefreshCw size={32} className="mb-3 animate-spin" />
          <p>Loading blood requests...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filteredRequests.length === 0 && (
        <div className="mt-6">
          <EmptyState
            icon={Droplet}
            title={
              activeTab === "pending"
                ? "No pending requests found"
                : "No accepted requests yet"
            }
            text={
              activeTab === "pending"
                ? "New blood requests will appear here when available."
                : "When you accept a blood request, it will appear here with its current status."
            }
          />

          {activeTab === "accepted" && (
            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => {
                  setSuccess("");
                  setActiveTab("pending");
                }}
                className="btn btn-primary"
              >
                Browse pending requests
              </button>
            </div>
          )}
        </div>
      )}

      {/* Request cards */}
      {!loading && filteredRequests.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {filteredRequests.map((request) => {
            const urgencyInfo = getUrgencyInfo(request.urgency);
            const statusInfo = getStatusInfo(request.status);

            return (
              <div key={request._id} className="card overflow-hidden">
                {/* Card header */}
                <div className="flex items-start justify-between gap-3 border-b border-line p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-plasma text-blood">
                      <Droplet size={25} />
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-ink">
                        {request.patientName || "Patient"}
                      </h3>

                      <p className="mt-1 text-xs text-muted">
                        Request ID: {request._id}
                      </p>
                    </div>
                  </div>

                  <Pill tone={urgencyInfo.tone}>{urgencyInfo.label}</Pill>
                </div>

                <div className="space-y-5 p-5">
                  {/* Blood group and units */}
                  <div className="flex flex-wrap gap-3">
                    <div className="rounded-xl bg-plasma px-4 py-3">
                      <p className="text-xs text-muted">Blood group</p>
                      <p className="mt-1 text-2xl font-bold text-blood">
                        {request.bloodGroup || "N/A"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-paper px-4 py-3">
                      <p className="text-xs text-muted">Units required</p>
                      <p className="mt-1 text-2xl font-bold text-ink">
                        {request.units ?? "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Request status */}
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-paper p-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-ink">
                      <CheckCircle size={18} />
                      Request status
                    </div>

                    <Pill tone={statusInfo.tone}>{statusInfo.label}</Pill>
                  </div>

                  {/* Hospital */}
                  <div className="flex items-start gap-3">
                    <Hospital
                      size={19}
                      className="mt-0.5 shrink-0 text-muted"
                    />

                    <div>
                      <p className="text-xs text-muted">Hospital</p>
                      <p className="font-medium text-ink">
                        {request.hospitalName || "Not provided"}
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-3">
                    <MapPin
                      size={19}
                      className="mt-0.5 shrink-0 text-muted"
                    />

                    <div>
                      <p className="text-xs text-muted">Location</p>
                      <p className="font-medium text-ink">
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
                            className="mt-1 inline-block text-sm font-semibold text-blood hover:text-blood-deep"
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
                      className="mt-0.5 shrink-0 text-muted"
                    />

                    <div>
                      <p className="text-xs text-muted">Contact number</p>
                      <p className="font-medium text-ink">
                        {request.contactNumber || "Shared after you accept"}
                      </p>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-3">
                    <CalendarDays size={19} className="shrink-0 text-muted" />

                    <div>
                      <p className="text-xs text-muted">Request date</p>
                      <p className="font-medium text-ink">
                        {formatDate(request.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Notes */}
                  {request.notes && (
                    <div className="rounded-xl border border-line bg-paper p-3">
                      <p className="mb-1 text-xs font-semibold text-muted">
                        Additional notes
                      </p>
                      <p className="text-sm text-ink">{request.notes}</p>
                    </div>
                  )}

                  {/* Accepted donor details */}
                  {activeTab === "accepted" && request.acceptedBy && (
                    <div className="rounded-xl border border-ok/25 bg-ok-soft p-3">
                      <p className="text-xs font-semibold text-ok">
                        Accepted by
                      </p>
                      <p className="mt-1 font-medium text-ink">
                        {request.acceptedBy.name || "You"}
                      </p>
                    </div>
                  )}

                  <Link
                    to={`/requests/${request._id}`}
                    className="btn btn-secondary block w-full"
                  >
                    View details and map
                  </Link>

                  {/* Accept button */}
                  {activeTab === "pending" && isDonor && (
                    <button
                      type="button"
                      onClick={() => handleAcceptRequest(request._id)}
                      disabled={acceptingId !== null}
                      className="btn btn-primary w-full"
                    >
                      {acceptingId === request._id ? (
                        <>
                          <RefreshCw size={19} className="animate-spin" />
                          Accepting...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={19} />
                          Accept request
                        </>
                      )}
                    </button>
                  )}

                  {/* Pending status for non-donor */}
                  {activeTab === "pending" && !isDonor && (
                    <div className="flex items-center justify-center gap-2 rounded-lg bg-paper px-4 py-3 text-center text-sm text-muted">
                      <Clock size={16} />
                      Waiting for a donor to accept this request.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}