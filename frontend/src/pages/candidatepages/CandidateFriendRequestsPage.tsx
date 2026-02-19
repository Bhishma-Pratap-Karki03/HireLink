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
  const [topSearch, setTopSearch] = useState("");

  const fetchRequests = async (silent = false) => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      if (!silent) {
        setLoading(true);
        setError("");
      }
      const res = await fetch("http://localhost:5000/api/connections/incoming", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to load friend requests");
      }
      setRequests(data.requests || []);
    } catch (err: any) {
      if (!silent) {
        setError(err?.message || "Failed to load friend requests");
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
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

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (document.hidden) return;
      fetchRequests(true);
      fetchFriends();
    }, 2500);
    return () => window.clearInterval(intervalId);
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
    const title = (item.currentJobTitle || "").trim();
    const role = (item.role || "").trim();
    if (role.toLowerCase() === "recruiter") {
      return "Recruiter";
    }
    if (title && title.toLowerCase() !== "this is the logo") {
      return title;
    }
    return role || "User";
  };

  const goToProfileDetails = (requester: FriendRequestItem["requester"]) => {
    const path =
      requester.role === "recruiter"
        ? `/employer/${requester.id}`
        : `/candidate/${requester.id}`;
    navigate(path);
  };

  const shouldShowRoleLine = (item: {
    role?: string;
    currentJobTitle?: string;
  }) => {
    const role = (item.role || "").trim().toLowerCase();
    if (role === "recruiter") return false;
    const title = (item.currentJobTitle || "").trim().toLowerCase();
    return title !== "this is the logo";
  };

  const filteredRequests = requests.filter((item) =>
    item.requester.fullName
      .toLowerCase()
      .includes(topSearch.trim().toLowerCase()),
  );
  const filteredFriends = friends.filter((item) =>
    item.fullName.toLowerCase().includes(topSearch.trim().toLowerCase()),
  );

  return (
    <div className="candidate-dashboard-container">
      <CandidateSidebar />
      <main className="candidate-friend-main-content">
        <CandidateTopBar
          showSearch
          searchPlaceholder={
            activeTab === "requests"
              ? "Search requests by user name..."
              : "Search connected users by name..."
          }
          onSearch={setTopSearch}
        />
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
          {!loading &&
            !error &&
            activeTab === "requests" &&
            filteredRequests.length === 0 && (
            <div className="candidate-friend-state">
              {requests.length === 0
                ? "No pending requests."
                : "No request matches this name."}
            </div>
          )}
          {!loading &&
            !error &&
            activeTab === "connected" &&
            filteredFriends.length === 0 && (
            <div className="candidate-friend-state">
              {friends.length === 0
                ? "No connected users yet."
                : "No connected user matches this name."}
            </div>
          )}

          {activeTab === "requests" && (
            <div className="candidate-friend-list">
              {filteredRequests.map((item) => (
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
                      className={
                        item.requester.role === "recruiter"
                          ? "candidate-friend-avatar recruiter-logo"
                          : "candidate-friend-avatar"
                      }
                      onError={(e) => {
                        e.currentTarget.src = defaultAvatar;
                      }}
                    />
                    <div className="candidate-friend-info">
                      <h3>{item.requester.fullName}</h3>
                      {shouldShowRoleLine(item.requester) && (
                        <p>{getDisplayRole(item.requester)}</p>
                      )}
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
              {filteredFriends.map((item) => (
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
                      className={
                        item.role === "recruiter"
                          ? "candidate-friend-avatar recruiter-logo"
                          : "candidate-friend-avatar"
                      }
                      onError={(e) => {
                        e.currentTarget.src = defaultAvatar;
                      }}
                    />
                    <div className="candidate-friend-info">
                      <h3>{item.fullName}</h3>
                      {shouldShowRoleLine(item) && <p>{getDisplayRole(item)}</p>}
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
