import PortalFooter from "../../components/PortalFooter";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RecruiterSidebar from "../../components/recruitercomponents/RecruiterSidebar";
import RecruiterTopBar from "../../components/recruitercomponents/RecruiterTopBar";
import addIcon from "../../images/Recruiter Profile Page Images/plus icon.svg";
import "../../styles/RecruiterJobPostingsListPage.css";

type RecruiterJobItem = {
  _id: string;
  jobTitle: string;
  location: string;
  jobType: string;
  deadline: string;
  statusLabel: string;
  applicantsCount: number;
  isActive: boolean;
};

const formatDate = (value?: string) => {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";
  return date.toLocaleDateString();
};

const RecruiterJobPostingsListPage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<RecruiterJobItem[]>([]);
  const [titleSearch, setTitleSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const filteredJobs = jobs.filter((job) =>
    job.jobTitle.toLowerCase().includes(titleSearch.trim().toLowerCase()),
  );

  const toggleActive = async (jobId: string, nextValue: boolean) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      setTogglingId(jobId);
      const res = await fetch(`http://localhost:5000/api/jobs/${jobId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: nextValue }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to update status");
      }
      setJobs((prev) =>
        prev.map((job) =>
          job._id === jobId ? { ...job, isActive: nextValue } : job,
        ),
      );
    } catch (err: any) {
      setError(err?.message || "Failed to update status");
    } finally {
      setTogglingId(null);
    }
  };

  useEffect(() => {
    const fetchJobs = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        setLoading(true);
        setError("");
        const res = await fetch(
          "http://localhost:5000/api/jobs/recruiter/list",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.message || "Failed to load job postings");
        }
        setJobs(data.jobs || []);
      } catch (err: any) {
        setError(err?.message || "Failed to load job postings");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [navigate]);

  return (
    <div className="recruiter-joblist-layout">
      <RecruiterSidebar />
      <main className="recruiter-joblist-main">
        <RecruiterTopBar
          showSearch
          searchPlaceholder="Search by job title..."
          onSearch={setTitleSearch}
        />
        <div className="recruiter-joblist-content">
          <div className="recruiter-joblist-header">
            <div>
              <h1>Job Postings</h1>
              <p>Manage your job posts and track applicants.</p>
            </div>
            <button
              className="recruiter-btn-primary recruiter-joblist-create-btn"
              onClick={() => navigate("/recruiter/post-job")}
            >
              <img src={addIcon} alt="Add" />
              Post New Job
            </button>
          </div>

          {loading && <div className="recruiter-joblist-state">Loading...</div>}
          {error && !loading && (
            <div className="recruiter-joblist-state error">{error}</div>
          )}
          {!loading && !error && filteredJobs.length === 0 && (
            <div className="recruiter-joblist-state">
              {jobs.length === 0
                ? "No job postings yet."
                : "No jobs found for this title."}
            </div>
          )}

          <div className="recruiter-joblist-grid">
            {filteredJobs.map((job) => (
              <article key={job._id} className="recruiter-joblist-card">
                <div className="recruiter-joblist-card-header">
                  <h3>{job.jobTitle}</h3>
                  <span
                    className={`recruiter-joblist-status ${
                      job.isActive ? "status-open" : "status-closed"
                    }`}
                  >
                    {job.isActive ? "Open" : "Closed"}
                  </span>
                </div>
                <div className="recruiter-joblist-meta">
                  <span>{job.location}</span>
                  <span>{job.jobType}</span>
                  <span>Deadline: {formatDate(job.deadline)}</span>
                </div>
                <div className="recruiter-joblist-applicants">
                  Applicants: <strong>{job.applicantsCount}</strong>
                </div>
                <div className="recruiter-joblist-actions">
                  <button
                    className="recruiter-joblist-btn"
                    onClick={() =>
                      navigate(`/recruiter/job-postings/${job._id}/applicants`)
                    }
                  >
                    View Applicants
                  </button>
                  <button
                    className="recruiter-joblist-btn outline"
                    onClick={() =>
                      navigate(`/recruiter/job-postings/${job._id}/edit`)
                    }
                  >
                    Edit Job
                  </button>
                  <div className="recruiter-joblist-toggle">
                    <span
                      className={`recruiter-joblist-toggle-label ${
                        job.isActive ? "active" : "inactive"
                      }`}
                    >
                      {job.isActive ? "Active" : "Inactive"}
                    </span>
                    <button
                      className={`recruiter-joblist-switch ${
                        job.isActive ? "active" : "inactive"
                      }`}
                      onClick={() => toggleActive(job._id, !job.isActive)}
                      disabled={togglingId === job._id}
                      aria-label="Toggle job status"
                    >
                      <span className="recruiter-joblist-switch-dot" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
              <PortalFooter />
</main>
    </div>
  );
};

export default RecruiterJobPostingsListPage;


