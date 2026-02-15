import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CandidateSidebar from "../../components/candidatecomponents/CandidateSidebar";
import CandidateTopBar from "../../components/candidatecomponents/CandidateTopBar";
import defaultAvatar from "../../images/Register Page Images/Default Profile.webp";
import "../../styles/CandidateFriendRequestsPage.css";

type FriendRequestItem = {
  id: string;
  requester: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    profilePicture?: string;
    currentJobTitle?: string;
  };
  createdAt: string;
};

type ConnectedUserItem = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  profilePicture?: string;
  currentJobTitle?: string;
  connectedAt?: string;
};

const CandidateFriendRequestsPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<FriendRequestItem[]>([]);
  const [friends, setFriends] = useState<ConnectedUserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"requests" | "connected">(
    "requests",
  );

  const fetchRequests = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      setLoading(true);
      setError("");
      const res = await fetch("http://localhost:5000/api/connections/incoming", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to load friend requests");
      }
      setRequests(data.requests || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load friend requests");
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (requesterId: string, action: "accept" | "delete") => {
    const token = localStorage.getItem("authToken");
    if (!token || !requesterId) return;
    try {
      setActionLoadingId(requesterId);
      const res = await fetch("http://localhost:5000/api/connections/respond", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requesterId, action }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to update request");
      }
      setRequests((prev) => prev.filter((item) => item.requester.id !== requesterId));
      if (action === "accept") {
        fetchFriends();
      }
    } catch (err: any) {
      setError(err?.message || "Failed to update request");
    } finally {
      setActionLoadingId(null);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      const res = await fetch("http://localhost:5000/api/connections/friends", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to load connections");
      }
      setFriends(data.friends || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load connections");
    }
  };

  const handleRemoveConnection = async (targetUserId: string) => {
    const token = localStorage.getItem("authToken");
    if (!token || !targetUserId) return;
    try {
      setActionLoadingId(targetUserId);
      const res = await fetch("http://localhost:5000/api/connections/remove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetUserId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to remove connection");
      }
      setFriends((prev) => prev.filter((item) => item.id !== targetUserId));
    } catch (err: any) {
      setError(err?.message || "Failed to remove connection");
    } finally {
      setActionLoadingId(null);
    }
  };

  const resolveAvatar = (value?: string) => {
    if (!value) return defaultAvatar;
    if (value.startsWith("http")) return value;
    return `http://localhost:5000${value}`;
  };

  const formatDate = (value?: string) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString();
  };

  const getDisplayRole = (item: {
    role?: string;
    currentJobTitle?: string;
  }) => {
    return item.currentJobTitle || item.role || "User";
  };

  const goToProfileDetails = (requester: FriendRequestItem["requester"]) => {
    const path =
      requester.role === "recruiter"
        ? `/employer/${requester.id}`
        : `/candidate/${requester.id}`;
    navigate(path);
  };

  return (
    <div className="candidate-dashboard-container">
      <CandidateSidebar />
      <main className="candidate-friend-main-content">
        <CandidateTopBar />
        <section className="candidate-friend-content-card">
          <header className="candidate-friend-header">
            <h1>Friend Requests</h1>
            <p>Accept, remove, or keep pending requests as you prefer.</p>
          </header>

          <div className="candidate-friend-tabs">
            <button
              type="button"
              className={`candidate-friend-tab ${
                activeTab === "requests" ? "active" : ""
              }`}
              onClick={() => setActiveTab("requests")}
            >
              Requests ({requests.length})
            </button>
            <button
              type="button"
              className={`candidate-friend-tab ${
                activeTab === "connected" ? "active" : ""
              }`}
              onClick={() => setActiveTab("connected")}
            >
              Connected ({friends.length})
            </button>
          </div>

          {loading && <div className="candidate-friend-state">Loading...</div>}
          {error && !loading && (
            <div className="candidate-friend-state error">{error}</div>
          )}
          {!loading && !error && activeTab === "requests" && requests.length === 0 && (
            <div className="candidate-friend-state">No pending requests.</div>
          )}
          {!loading && !error && activeTab === "connected" && friends.length === 0 && (
            <div className="candidate-friend-state">No connected users yet.</div>
          )}

          {activeTab === "requests" && (
            <div className="candidate-friend-list">
              {requests.map((item) => (
                <article key={item.id} className="candidate-friend-card">
                  <div
                    className="candidate-friend-user candidate-friend-user-clickable"
                    onClick={() => goToProfileDetails(item.requester)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        goToProfileDetails(item.requester);
                      }
                    }}
                  >
                    <img
                      src={resolveAvatar(item.requester.profilePicture)}
                      alt={item.requester.fullName}
                      className="candidate-friend-avatar"
                      onError={(e) => {
                        e.currentTarget.src = defaultAvatar;
                      }}
                    />
                    <div className="candidate-friend-info">
                      <h3>{item.requester.fullName}</h3>
                      <p>{getDisplayRole(item.requester)}</p>
                      <span>{item.requester.email}</span>
                      <small>Requested on {formatDate(item.createdAt)}</small>
                    </div>
                  </div>

                  <div className="candidate-friend-actions">
                    <button
                      type="button"
                      className="candidate-friend-btn profile"
                      onClick={() => goToProfileDetails(item.requester)}
                    >
                      View Profile
                    </button>
                    <button
                      type="button"
                      className="candidate-friend-btn accept"
                      onClick={() => handleRespond(item.requester.id, "accept")}
                      disabled={actionLoadingId === item.requester.id}
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      className="candidate-friend-btn delete"
                      onClick={() => handleRespond(item.requester.id, "delete")}
                      disabled={actionLoadingId === item.requester.id}
                    >
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {activeTab === "connected" && (
            <div className="candidate-friend-list">
              {friends.map((item) => (
                <article key={item.id} className="candidate-friend-card">
                  <div
                    className="candidate-friend-user candidate-friend-user-clickable"
                    onClick={() => goToProfileDetails(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        goToProfileDetails(item);
                      }
                    }}
                  >
                    <img
                      src={resolveAvatar(item.profilePicture)}
                      alt={item.fullName}
                      className="candidate-friend-avatar"
                      onError={(e) => {
                        e.currentTarget.src = defaultAvatar;
                      }}
                    />
                    <div className="candidate-friend-info">
                      <h3>{item.fullName}</h3>
                      <p>{getDisplayRole(item)}</p>
                      <span>{item.email}</span>
                      <small>Connected on {formatDate(item.connectedAt)}</small>
                    </div>
                  </div>

                  <div className="candidate-friend-actions">
                    <button
                      type="button"
                      className="candidate-friend-btn profile"
                      onClick={() => goToProfileDetails(item)}
                    >
                      View Profile
                    </button>
                    <button
                      type="button"
                      className="candidate-friend-btn delete"
                      onClick={() => handleRemoveConnection(item.id)}
                      disabled={actionLoadingId === item.id}
                    >
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default CandidateFriendRequestsPage;
