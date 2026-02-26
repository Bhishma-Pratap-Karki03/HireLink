import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admincomponents/AdminSidebar";
import AdminTopBar from "../../components/admincomponents/AdminTopBar";
import defaultAvatar from "../../images/Register Page Images/Default Profile.webp";
import "../../styles/AdminManageUsersPage.css";
import statsTotalUsersIcon from "../../images/Candidate Profile Page Images/statsTotalUsersIcon.png";
import statsCandidatesIcon from "../../images/Candidate Profile Page Images/statsCandidatesIcon.png";
import statsRecruitersIcon from "../../images/Candidate Profile Page Images/statsRecruitersIcon.png";
import statsBlockedIcon from "../../images/Candidate Profile Page Images/stats-reject.svg";
import dropdownArrow from "../../images/Register Page Images/1_2307.svg";

type AdminUserItem = {
  _id: string;
  fullName: string;
  email: string;
  role: "candidate" | "recruiter";
  isBlocked: boolean;
  createdAt: string;
  lastLoginAt?: string | null;
  profilePicture?: string;
};

const AdminManageUsersPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actingUserId, setActingUserId] = useState("");
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement | null>(null);
  const statusDropdownRef = useRef<HTMLDivElement | null>(null);

  const token = localStorage.getItem("authToken") || "";

  const fetchUsers = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError("");
      const query = new URLSearchParams({
        search,
        role: roleFilter,
        status: statusFilter,
      });

      const response = await fetch(
        `http://localhost:5000/api/users/admin/list?${query.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Failed to load users");
      }
      setUsers(data.users || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        roleDropdownRef.current &&
        !roleDropdownRef.current.contains(event.target as Node)
      ) {
        setIsRoleOpen(false);
      }
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target as Node)
      ) {
        setIsStatusOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const onSearchSubmit = (event: FormEvent) => {
    event.preventDefault();
    fetchUsers();
  };

  const roleCounts = useMemo(() => {
    return {
      total: users.length,
      candidates: users.filter((user) => user.role === "candidate").length,
      recruiters: users.filter((user) => user.role === "recruiter").length,
      blocked: users.filter((user) => user.isBlocked).length,
    };
  }, [users]);

  const formatDate = (value?: string | null) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString();
  };

  const resolveAvatar = (value?: string) => {
    if (!value) return defaultAvatar;
    if (value.startsWith("http")) return value;
    return `http://localhost:5000${value}`;
  };

  const updateStatus = async (userId: string, action: "block" | "unblock") => {
    try {
      setActingUserId(userId);
      const response = await fetch(
        `http://localhost:5000/api/users/admin/${userId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ action }),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Failed to update status");
      }
      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId
            ? { ...user, isBlocked: action === "block" }
            : user,
        ),
      );
    } catch (err: any) {
      setError(err?.message || "Failed to update status");
    } finally {
      setActingUserId("");
    }
  };

  const updateRole = async (
    userId: string,
    role: "candidate" | "recruiter",
  ) => {
    try {
      setActingUserId(userId);
      const response = await fetch(
        `http://localhost:5000/api/users/admin/${userId}/role`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role }),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Failed to update role");
      }
      setUsers((prev) =>
        prev.map((user) => (user._id === userId ? { ...user, role } : user)),
      );
    } catch (err: any) {
      setError(err?.message || "Failed to update role");
    } finally {
      setActingUserId("");
    }
  };

  const goToUserDetails = (user: AdminUserItem) => {
    if (user.role === "recruiter") {
      navigate(`/employer/${user._id}`);
      return;
    }
    navigate(`/candidate/${user._id}`);
  };

  const onUserCardKeyDown = (event: KeyboardEvent, user: AdminUserItem) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      goToUserDetails(user);
    }
  };

  return (
    <div className="admin-assessments-layout">
      <AdminSidebar />
      <main className="admin-manage-main-area">
        <div className="admin-manage-topbar-wrapper">
          <AdminTopBar />
        </div>
        <div className="admin-manage-scrollable-content">
          <section className="admin-manage-shell">
            <header className="admin-manage-header">
              <h1>Manage Users</h1>
              <p>Filter and manage candidates and recruiters from one place.</p>
            </header>

            <div className="admin-manage-stats">
              <article className="admin-manage-stat-card">
                <div>
                  <h3>{roleCounts.total}</h3>
                  <span>Total Users</span>
                </div>
                <img src={statsTotalUsersIcon} alt="Total users" />
              </article>
              <article className="admin-manage-stat-card">
                <div>
                  <h3>{roleCounts.candidates}</h3>
                  <span>Candidates</span>
                </div>
                <img src={statsCandidatesIcon} alt="Candidates" />
              </article>
              <article className="admin-manage-stat-card">
                <div>
                  <h3>{roleCounts.recruiters}</h3>
                  <span>Recruiters</span>
                </div>
                <img src={statsRecruitersIcon} alt="Recruiters" />
              </article>
              <article className="admin-manage-stat-card">
                <div>
                  <h3>{roleCounts.blocked}</h3>
                  <span>Blocked</span>
                </div>
                <img src={statsBlockedIcon} alt="Blocked users" />
              </article>
            </div>

            <form className="admin-manage-filters" onSubmit={onSearchSubmit}>
              <input
                type="text"
                placeholder="Search by full name or email"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <div
                className="admin-manage-filter-dropdown"
                ref={roleDropdownRef}
              >
                <button
                  type="button"
                  className={`admin-manage-filter-trigger ${
                    isRoleOpen ? "open" : ""
                  }`}
                  onClick={() => {
                    setIsRoleOpen((prev) => !prev);
                    setIsStatusOpen(false);
                  }}
                >
                  <span>
                    {roleFilter === "candidate"
                      ? "Candidate"
                      : roleFilter === "recruiter"
                        ? "Recruiter"
                        : "All Roles"}
                  </span>
                  <img
                    src={dropdownArrow}
                    alt=""
                    aria-hidden="true"
                    className={`admin-manage-filter-caret ${
                      isRoleOpen ? "open" : ""
                    }`}
                  />
                </button>
                {isRoleOpen && (
                  <div className="admin-manage-filter-menu" role="listbox">
                    {[
                      { value: "all", label: "All Roles" },
                      { value: "candidate", label: "Candidate" },
                      { value: "recruiter", label: "Recruiter" },
                    ].map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        className={`admin-manage-filter-option ${
                          roleFilter === item.value ? "active" : ""
                        }`}
                        onClick={() => {
                          setRoleFilter(item.value);
                          setIsRoleOpen(false);
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div
                className="admin-manage-filter-dropdown"
                ref={statusDropdownRef}
              >
                <button
                  type="button"
                  className={`admin-manage-filter-trigger ${
                    isStatusOpen ? "open" : ""
                  }`}
                  onClick={() => {
                    setIsStatusOpen((prev) => !prev);
                    setIsRoleOpen(false);
                  }}
                >
                  <span>
                    {statusFilter === "active"
                      ? "Active"
                      : statusFilter === "blocked"
                        ? "Blocked"
                        : "All Status"}
                  </span>
                  <img
                    src={dropdownArrow}
                    alt=""
                    aria-hidden="true"
                    className={`admin-manage-filter-caret ${
                      isStatusOpen ? "open" : ""
                    }`}
                  />
                </button>
                {isStatusOpen && (
                  <div className="admin-manage-filter-menu" role="listbox">
                    {[
                      { value: "all", label: "All Status" },
                      { value: "active", label: "Active" },
                      { value: "blocked", label: "Blocked" },
                    ].map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        className={`admin-manage-filter-option ${
                          statusFilter === item.value ? "active" : ""
                        }`}
                        onClick={() => {
                          setStatusFilter(item.value);
                          setIsStatusOpen(false);
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button type="submit">Search</button>
            </form>

            <section className="admin-manage-table-wrap">
              <header className="admin-manage-table-head">
                <span>User</span>
                <span>Role</span>
                <span>Status</span>
                <span>Created Date</span>
                <span>Last Login</span>
                <span>Actions</span>
              </header>

              {loading && (
                <div className="admin-manage-state">Loading users...</div>
              )}
              {!loading && error && (
                <div className="admin-manage-state error">{error}</div>
              )}
              {!loading && !error && users.length === 0 && (
                <div className="admin-manage-state">No users found.</div>
              )}

              {!loading &&
                !error &&
                users.map((user) => (
                  <article className="admin-manage-row" key={user._id}>
                    <div
                      className="admin-manage-user-cell admin-manage-user-clickable"
                      onClick={() => goToUserDetails(user)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => onUserCardKeyDown(event, user)}
                    >
                      <img
                        src={resolveAvatar(user.profilePicture)}
                        alt={user.fullName}
                        className={
                          user.role === "recruiter"
                            ? "admin-manage-avatar recruiter-logo"
                            : "admin-manage-avatar"
                        }
                        onError={(event) => {
                          event.currentTarget.src = defaultAvatar;
                        }}
                      />
                      <div>
                        <h4>{user.fullName}</h4>
                        <p>{user.email}</p>
                      </div>
                    </div>
                    <div>
                      <span
                        className={`admin-role-badge ${
                          user.role === "candidate" ? "candidate" : "recruiter"
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>
                    <div>
                      <span
                        className={`admin-status-badge ${
                          user.isBlocked ? "blocked" : "active"
                        }`}
                      >
                        {user.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </div>
                    <div>{formatDate(user.createdAt)}</div>
                    <div>{formatDate(user.lastLoginAt)}</div>
                    <div className="admin-manage-actions">
                      <select
                        value={user.role}
                        onChange={(event) =>
                          updateRole(
                            user._id,
                            event.target.value as "candidate" | "recruiter",
                          )
                        }
                        disabled={actingUserId === user._id}
                      >
                        <option value="candidate">Candidate</option>
                        <option value="recruiter">Recruiter</option>
                      </select>
                      {user.isBlocked ? (
                        <button
                          type="button"
                          className="action-unblock"
                          onClick={() => updateStatus(user._id, "unblock")}
                          disabled={actingUserId === user._id}
                        >
                          Unblock
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="action-block"
                          onClick={() => updateStatus(user._id, "block")}
                          disabled={actingUserId === user._id}
                        >
                          Block
                        </button>
                      )}
                    </div>
                  </article>
                ))}
            </section>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AdminManageUsersPage;
