import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admincomponents/AdminSidebar";
import AdminTopBar from "../../components/admincomponents/AdminTopBar";
import "../../styles/AdminManageJobsPage.css";
import statsTotalJobsIcon from "../../images/Candidate Profile Page Images/stats-applied-icon.svg";
import statsActiveJobsIcon from "../../images/Candidate Profile Page Images/stats-offer-icon.svg";
import statsInactiveJobsIcon from "../../images/Candidate Profile Page Images/stats-reject.svg";
import statsApplicantsIcon from "../../images/Candidate Profile Page Images/statsCandidatesIcon.png";
import dropdownArrow from "../../images/Register Page Images/1_2307.svg";

type AdminJobItem = {
  _id: string;
  recruiterId?: string;
  jobTitle: string;
  recruiterName: string;
  location: string;
  jobType: string;
  deadline: string;
  createdAt: string;
  applicantsCount: number;
  isActive: boolean;
};

const AdminManageJobsPage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<AdminJobItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actingJobId, setActingJobId] = useState("");
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement | null>(null);

  const token = localStorage.getItem("authToken") || "";

  const fetchJobs = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError("");
      const query = new URLSearchParams({ search, status: statusFilter });
      const response = await fetch(
        `http://localhost:5000/api/jobs/admin/list?${query.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Failed to load jobs");
      }
      setJobs(data.jobs || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [statusFilter]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
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
    fetchJobs();
  };

  const stats = useMemo(() => {
    const total = jobs.length;
    const active = jobs.filter((job) => job.isActive).length;
    const inactive = jobs.filter((job) => !job.isActive).length;
    const applicants = jobs.reduce((sum, job) => sum + (job.applicantsCount || 0), 0);
    return { total, active, inactive, applicants };
  }, [jobs]);

  const formatDate = (value?: string) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString();
  };

  const toggleStatus = async (jobId: string, action: "activate" | "deactivate") => {
    try {
      setActingJobId(jobId);
      const response = await fetch(
        `http://localhost:5000/api/jobs/admin/${jobId}/status`,
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
        throw new Error(data?.message || "Failed to update job status");
      }
      setJobs((prev) =>
        prev.map((job) =>
          job._id === jobId ? { ...job, isActive: action === "activate" } : job,
        ),
      );
    } catch (err: any) {
      setError(err?.message || "Failed to update job status");
    } finally {
      setActingJobId("");
    }
  };

  return (
    <div className="admin-assessments-layout">
      <AdminSidebar />
      <main className="admin-manage-jobs-main-area">
        <div className="admin-manage-jobs-topbar-wrapper">
          <AdminTopBar />
        </div>
        <div className="admin-manage-jobs-scrollable-content">
          <section className="admin-manage-jobs-shell">
            <header className="admin-manage-jobs-header">
              <h1>Manage Jobs</h1>
              <p>Monitor and control job postings from recruiters.</p>
            </header>

            <div className="admin-manage-jobs-stats">
              <article className="admin-manage-jobs-stat-card">
                <div>
                  <h3>{stats.total}</h3>
                  <span>Total Jobs</span>
                </div>
                <img src={statsTotalJobsIcon} alt="Total jobs" />
              </article>
              <article className="admin-manage-jobs-stat-card">
                <div>
                  <h3>{stats.active}</h3>
                  <span>Active</span>
                </div>
                <img src={statsActiveJobsIcon} alt="Active jobs" />
              </article>
              <article className="admin-manage-jobs-stat-card">
                <div>
                  <h3>{stats.inactive}</h3>
                  <span>Inactive</span>
                </div>
                <img src={statsInactiveJobsIcon} alt="Inactive jobs" />
              </article>
              <article className="admin-manage-jobs-stat-card">
                <div>
                  <h3>{stats.applicants}</h3>
                  <span>Total Applicants</span>
                </div>
                <img src={statsApplicantsIcon} alt="Total applicants" />
              </article>
            </div>

            <form className="admin-manage-jobs-filters" onSubmit={onSearchSubmit}>
              <input
                type="text"
                placeholder="Search by title, department, or location"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <div
                className="admin-manage-jobs-filter-dropdown"
                ref={statusDropdownRef}
              >
                <button
                  type="button"
                  className={`admin-manage-jobs-filter-trigger ${
                    isStatusOpen ? "open" : ""
                  }`}
                  onClick={() => setIsStatusOpen((prev) => !prev)}
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
                    className={`admin-manage-jobs-filter-caret ${
                      isStatusOpen ? "open" : ""
                    }`}
                  />
                </button>
                {isStatusOpen && (
                  <div className="admin-manage-jobs-filter-menu" role="listbox">
                    {[
                      { value: "all", label: "All Status" },
                      { value: "active", label: "Active" },
                      { value: "inactive", label: "Inactive" },
                    ].map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        className={`admin-manage-jobs-filter-option ${
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

            <section className="admin-manage-jobs-table-wrap">
              <header className="admin-manage-jobs-table-head">
                <span>Job</span>
                <span>Recruiter</span>
                <span>Applicants</span>
                <span>Created Date</span>
                <span>Deadline</span>
                <span>Status</span>
                <span>Actions</span>
              </header>

              {loading && <div className="admin-manage-jobs-state">Loading jobs...</div>}
              {!loading && error && (
                <div className="admin-manage-jobs-state error">{error}</div>
              )}
              {!loading && !error && jobs.length === 0 && (
                <div className="admin-manage-jobs-state">No jobs found.</div>
              )}

              {!loading &&
                !error &&
                jobs.map((job) => (
                  <article className="admin-manage-jobs-row" key={job._id}>
                    <div className="admin-manage-jobs-job-cell">
                      <button
                        type="button"
                        className="admin-manage-jobs-link-btn"
                        onClick={() => navigate(`/jobs/${job._id}`)}
                      >
                        {job.jobTitle}
                      </button>
                      <p>
                        {job.location} - {job.jobType}
                      </p>
                    </div>
                    <div>
                      {job.recruiterId ? (
                        <button
                          type="button"
                          className="admin-manage-jobs-link-btn recruiter"
                          onClick={() => navigate(`/employer/${job.recruiterId}`)}
                        >
                          {job.recruiterName || "-"}
                        </button>
                      ) : (
                        job.recruiterName || "-"
                      )}
                    </div>
                    <div>{job.applicantsCount || 0}</div>
                    <div>{formatDate(job.createdAt)}</div>
                    <div>{formatDate(job.deadline)}</div>
                    <div>
                      <span
                        className={`admin-manage-jobs-status ${
                          job.isActive ? "active" : "inactive"
                        }`}
                      >
                        {job.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="admin-manage-jobs-actions">
                      {job.isActive ? (
                        <button
                          type="button"
                          className="action-deactivate"
                          onClick={() => toggleStatus(job._id, "deactivate")}
                          disabled={actingJobId === job._id}
                        >
                          Inactive
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="action-activate"
                          onClick={() => toggleStatus(job._id, "activate")}
                          disabled={actingJobId === job._id}
                        >
                          Active
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

export default AdminManageJobsPage;
