import React, { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admincomponents/AdminSidebar";
import AdminTopBar from "../../components/admincomponents/AdminTopBar";
import "../../styles/AdminAssessmentsPage.css";
import "../../styles/AdminManageUsersPage.css";
import editIcon from "../../images/Recruiter Profile Page Images/6_215.svg";
import deleteIcon from "../../images/Recruiter Profile Page Images/6_80.svg";
import statsTotalUsersIcon from "../../images/Candidate Profile Page Images/statsTotalUsersIcon.png";
import statsAppliedIcon from "../../images/Candidate Profile Page Images/stats-applied-icon.svg";
import statsRejectedIcon from "../../images/Candidate Profile Page Images/stats-reject.svg";
import statsCandidatesIcon from "../../images/Candidate Profile Page Images/statsCandidatesIcon.png";
import dropdownArrow from "../../images/Register Page Images/1_2307.svg";

type AssessmentItem = {
  id: string;
  title: string;
  type: string;
  status: string;
  difficulty: string;
  maxAttempts: number;
  actualAttempts: number;
  correctAttempts: number;
  createdAt: string;
};

const AdminAssessmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<AssessmentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AssessmentItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const typeDropdownRef = useRef<HTMLDivElement | null>(null);
  const statusDropdownRef = useRef<HTMLDivElement | null>(null);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("http://localhost:5000/api/assessments");
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Failed to load assessments");
      }
      const mapped = (data.assessments || []).map((item: any) => ({
        id: item._id || item.id,
        title: item.title || "Untitled",
        type: item.type || "quiz",
        status: item.status || "inactive",
        difficulty: item.difficulty || "beginner",
        maxAttempts: item.maxAttempts || 0,
        actualAttempts: item.actualAttempts || 0,
        correctAttempts: item.correctAttempts || 0,
        createdAt: item.createdAt || "",
      }));
      setAssessments(mapped);
    } catch (err: any) {
      setError(err?.message || "Failed to load assessments");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (assessment: AssessmentItem) => {
    setDeleteTarget(assessment);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Please login to delete assessments.");
      setDeleteTarget(null);
      return;
    }

    try {
      setDeleting(true);
      const response = await fetch(
        `http://localhost:5000/api/assessments/${deleteTarget.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Failed to delete assessment");
      }
      setAssessments((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: any) {
      setError(err?.message || "Failed to delete assessment");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        typeDropdownRef.current &&
        !typeDropdownRef.current.contains(event.target as Node)
      ) {
        setIsTypeOpen(false);
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

  const filteredAssessments = useMemo(() => {
    return assessments.filter((item) => {
      const query = search.trim().toLowerCase();
      const matchesSearch = query
        ? item.title.toLowerCase().includes(query) ||
          item.type.toLowerCase().includes(query) ||
          item.difficulty.toLowerCase().includes(query)
        : true;

      const matchesType = typeFilter === "all" ? true : item.type === typeFilter;
      const matchesStatus =
        statusFilter === "all" ? true : item.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [assessments, search, typeFilter, statusFilter]);

  const insights = useMemo(
    () => ({
      total: filteredAssessments.length,
      active: filteredAssessments.filter((item) => item.status === "active")
        .length,
      inactive: filteredAssessments.filter((item) => item.status === "inactive")
        .length,
      attempts: filteredAssessments.reduce(
        (sum, item) => sum + (Number(item.actualAttempts) || 0),
        0,
      ),
    }),
    [filteredAssessments],
  );

  const onSearchSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSearch(searchInput);
  };

  return (
    <div className="admin-assessments-page-container">
      <div className="admin-assessments-layout">
        <AdminSidebar />
        <div className="admin-manage-main-area">
          <div className="admin-manage-topbar-wrapper">
            <AdminTopBar />
          </div>

          <div className="admin-manage-scrollable-content">
            <div className="admin-manage-shell">
              <div className="admin-manage-header admin-assessments-page-header">
                <div>
                  <h1>Quiz / Assessment</h1>
                  <p>Manage and create assessments for job applications.</p>
                </div>
                <div className="admin-assessments-header-actions">
                  <button
                    className="admin-assessments-outline"
                    onClick={() => navigate("/admin/assessments/attempts")}
                  >
                    Attempt History
                  </button>
                  <button
                    className="admin-assessments-primary"
                    onClick={() => navigate("/admin/assessments/create")}
                  >
                    Create Quiz/Assessment
                  </button>
                </div>
              </div>

              <div className="admin-manage-stats admin-assessments-stats">
                <article className="admin-manage-stat-card admin-assessments-stat-card">
                  <div>
                    <h3>{insights.total}</h3>
                    <span>Total Assessments</span>
                  </div>
                  <img src={statsTotalUsersIcon} alt="Total assessments" />
                </article>
                <article className="admin-manage-stat-card admin-assessments-stat-card">
                  <div>
                    <h3>{insights.active}</h3>
                    <span>Active</span>
                  </div>
                  <img src={statsAppliedIcon} alt="Active assessments" />
                </article>
                <article className="admin-manage-stat-card admin-assessments-stat-card">
                  <div>
                    <h3>{insights.inactive}</h3>
                    <span>Inactive</span>
                  </div>
                  <img src={statsRejectedIcon} alt="Inactive assessments" />
                </article>
                <article className="admin-manage-stat-card admin-assessments-stat-card">
                  <div>
                    <h3>{insights.attempts}</h3>
                    <span>Total Attempts</span>
                  </div>
                  <img src={statsCandidatesIcon} alt="Total attempts" />
                </article>
              </div>

              <form
                className="admin-manage-filters admin-assessments-filters"
                onSubmit={onSearchSubmit}
              >
                <input
                  type="text"
                  placeholder="Search by title, type, or difficulty"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                />
                <div
                  className="admin-assessments-filter-dropdown"
                  ref={typeDropdownRef}
                >
                  <button
                    type="button"
                    className={`admin-assessments-filter-trigger ${
                      isTypeOpen ? "open" : ""
                    }`}
                    onClick={() => {
                      setIsTypeOpen((prev) => !prev);
                      setIsStatusOpen(false);
                    }}
                  >
                    <span>
                      {typeFilter === "quiz"
                        ? "Quiz"
                        : typeFilter === "writing"
                          ? "Writing"
                          : typeFilter === "task"
                            ? "Task"
                            : typeFilter === "code"
                              ? "Code"
                              : "All Type"}
                    </span>
                    <img
                      src={dropdownArrow}
                      alt=""
                      aria-hidden="true"
                      className={`admin-assessments-filter-caret ${
                        isTypeOpen ? "open" : ""
                      }`}
                    />
                  </button>
                  {isTypeOpen && (
                    <div className="admin-assessments-filter-menu" role="listbox">
                      {[
                        { value: "all", label: "All Type" },
                        { value: "quiz", label: "Quiz" },
                        { value: "writing", label: "Writing" },
                        { value: "task", label: "Task" },
                        { value: "code", label: "Code" },
                      ].map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          className={`admin-assessments-filter-option ${
                            typeFilter === item.value ? "active" : ""
                          }`}
                          onClick={() => {
                            setTypeFilter(item.value);
                            setIsTypeOpen(false);
                          }}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div
                  className="admin-assessments-filter-dropdown"
                  ref={statusDropdownRef}
                >
                  <button
                    type="button"
                    className={`admin-assessments-filter-trigger ${
                      isStatusOpen ? "open" : ""
                    }`}
                    onClick={() => {
                      setIsStatusOpen((prev) => !prev);
                      setIsTypeOpen(false);
                    }}
                  >
                    <span>
                      {statusFilter === "active"
                        ? "Active"
                        : statusFilter === "inactive"
                          ? "Inactive"
                          : "All Status"}
                    </span>
                    <img
                      src={dropdownArrow}
                      alt=""
                      aria-hidden="true"
                      className={`admin-assessments-filter-caret ${
                        isStatusOpen ? "open" : ""
                      }`}
                    />
                  </button>
                  {isStatusOpen && (
                    <div className="admin-assessments-filter-menu" role="listbox">
                      {[
                        { value: "all", label: "All Status" },
                        { value: "active", label: "Active" },
                        { value: "inactive", label: "Inactive" },
                      ].map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          className={`admin-assessments-filter-option ${
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

              <section className="admin-manage-table-wrap admin-assessments-table-wrap">
                <header className="admin-manage-table-head admin-assessments-table-head">
                  <span>Title</span>
                  <span>Type</span>
                  <span>Status</span>
                  <span>Difficulty</span>
                  <span>Attempts</span>
                  <span>Created</span>
                  <span>Actions</span>
                </header>

                {loading && (
                  <div className="admin-manage-state admin-assessments-state">Loading...</div>
                )}
                {error && !loading && (
                  <div className="admin-manage-state admin-assessments-state error">{error}</div>
                )}
                {!loading && !error && filteredAssessments.length === 0 && (
                  <div className="admin-manage-state admin-assessments-state">
                    No assessments found.
                  </div>
                )}
                {!loading &&
                  !error &&
                  filteredAssessments.map((item) => (
                    <div
                      key={item.id}
                      className="admin-manage-row admin-assessments-table-row"
                    >
                      <span>{item.title}</span>
                      <span className={`chip ${item.type}`}>{item.type}</span>
                      <span className={`chip ${item.status}`}>{item.status}</span>
                      <span>{item.difficulty}</span>
                      <span>{item.actualAttempts}</span>
                      <span>
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString()
                          : "-"}
                      </span>
                      <div className="admin-assessments-actions">
                        <button
                          type="button"
                          className="admin-assessments-icon-btn"
                          aria-label="Edit assessment"
                          onClick={() =>
                            navigate(`/admin/assessments/${item.id}/edit`)
                          }
                        >
                          <img src={editIcon} alt="Edit" />
                        </button>
                        <button
                          type="button"
                          className="admin-assessments-icon-btn danger"
                          aria-label="Delete assessment"
                          onClick={() => handleDelete(item)}
                        >
                          <img src={deleteIcon} alt="Delete" />
                        </button>
                      </div>
                    </div>
                  ))}
              </section>

              {deleteTarget && (
                <div className="admin-assessments-modal-overlay">
                  <div className="admin-assessments-modal">
                    <h3>Delete Assessment</h3>
                    <p>
                      Are you sure you want to delete
                      <strong> {deleteTarget.title}</strong>? This action cannot
                      be undone.
                    </p>
                    <div className="admin-assessments-modal-actions">
                      <button
                        className="admin-assessments-outline"
                        onClick={() => setDeleteTarget(null)}
                        disabled={deleting}
                      >
                        Cancel
                      </button>
                      <button
                        className="admin-assessments-danger"
                        onClick={confirmDelete}
                        disabled={deleting}
                      >
                        {deleting ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAssessmentsPage;
