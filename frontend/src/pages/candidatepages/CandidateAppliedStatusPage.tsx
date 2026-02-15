import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CandidateSidebar from "../../components/candidatecomponents/CandidateSidebar";
import CandidateTopBar from "../../components/candidatecomponents/CandidateTopBar";
import "../../styles/CandidateAppliedStatusPage.css";
import statsAppliedIcon from "../../images/Candidate Profile Page Images/stats-applied-icon.svg";
import statsInterviewIcon from "../../images/Candidate Profile Page Images/stats-interview-icon.svg";
import statsOfferIcon from "../../images/Candidate Profile Page Images/stats-offer-icon.svg";
import statsTotalIcon from "../../images/Candidate Profile Page Images/stats-reject.svg";
import actionMessageIcon from "../../images/Candidate Profile Page Images/message-icon.svg";
import actionResumeIcon from "../../images/Candidate Profile Page Images/eyeIcon.svg";

type AppliedStatusItem = {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  location: string;
  jobType: string;
  appliedAt: string;
  updatedAt: string;
  status: string;
  resumeUrl: string;
  resumeFileName: string;
  resumeFileSize: number;
  recruiter: {
    id: string;
    fullName: string;
    profilePicture?: string;
  } | null;
};

const CandidateAppliedStatusPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<AppliedStatusItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const formatDate = (value?: string) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString();
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes <= 0) return "-";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const resolveResume = (resumeUrl?: string) => {
    if (!resumeUrl) return "";
    if (resumeUrl.startsWith("http")) return resumeUrl;
    return `http://localhost:5000${resumeUrl}`;
  };

  const cleanLabel = (value?: string) =>
    String(value || "")
      .replace(/â€¢/g, "-")
      .replace(/�/g, "-")
      .trim();

  const labelFromStatus = (status?: string) => {
    const normalized = String(status || "").toLowerCase();
    if (normalized === "interview") return "Interview";
    if (normalized === "shortlisted") return "Shortlisted";
    if (normalized === "reviewed") return "Reviewed";
    if (normalized === "hired") return "Hired";
    if (normalized === "rejected") return "Rejected";
    return "Applied";
  };

  const statusClass = (status?: string) => {
    const normalized = String(status || "").toLowerCase();
    if (normalized === "interview") return "status-interview";
    if (normalized === "hired") return "status-hired";
    if (normalized === "rejected") return "status-rejected";
    if (normalized === "shortlisted") return "status-shortlisted";
    if (normalized === "reviewed") return "status-reviewed";
    return "status-applied";
  };

  const stats = useMemo(() => {
    const total = items.length;
    const interview = items.filter((item) => item.status === "interview").length;
    const offers = items.filter((item) => item.status === "hired").length;
    const rejected = items.filter((item) => item.status === "rejected").length;
    return { total, interview, offers, rejected, applied: total };
  }, [items]);

  const fetchAppliedStatus = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res = await fetch("http://localhost:5000/api/applications/mine", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to load applied jobs");
      }
      setItems(data.applications || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load applied jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppliedStatus();
  }, []);

  return (
    <div className="candidate-dashboard-container">
      <CandidateSidebar />
      <main className="candidate-applied-main">
        <CandidateTopBar />
        <section className="candidate-applied-shell">
          <div className="candidate-applied-stats">
            <article className="candidate-applied-stat-card">
              <div>
                <h3>{stats.applied}</h3>
                <p>Applied Jobs</p>
              </div>
              <img src={statsAppliedIcon} alt="Applied jobs" />
            </article>
            <article className="candidate-applied-stat-card">
              <div>
                <h3>{stats.interview}</h3>
                <p>Interviews</p>
              </div>
              <img src={statsInterviewIcon} alt="Interviews" />
            </article>
            <article className="candidate-applied-stat-card">
              <div>
                <h3>{stats.offers}</h3>
                <p>Job Offers</p>
              </div>
              <img src={statsOfferIcon} alt="Job offers" />
            </article>
            <article className="candidate-applied-stat-card">
              <div>
                <h3>{stats.rejected}</h3>
                <p>Rejected</p>
              </div>
              <img src={statsTotalIcon} alt="Rejected jobs" />
            </article>
          </div>

          <section className="candidate-applied-table-wrap">
            <header className="candidate-applied-table-head">
              <span>Job Role & Company</span>
              <span>Date Applied</span>
              <span>Status</span>
              <span>Resume</span>
              <span>Actions</span>
            </header>

            {loading && (
              <div className="candidate-applied-state">Loading applied jobs...</div>
            )}
            {!loading && error && (
              <div className="candidate-applied-state candidate-applied-error">
                {error}
              </div>
            )}
            {!loading && !error && items.length === 0 && (
              <div className="candidate-applied-state">No applied jobs found.</div>
            )}

            {!loading &&
              !error &&
              items.map((item) => (
                <article key={item.id} className="candidate-applied-row">
                  <div className="candidate-applied-cell candidate-applied-job">
                    <h4>{item.jobTitle}</h4>
                    <p>
                      {cleanLabel(item.companyName)} - {cleanLabel(item.location)}
                    </p>
                  </div>
                  <div className="candidate-applied-cell">
                    {formatDate(item.appliedAt)}
                  </div>
                  <div className="candidate-applied-cell">
                    <span
                      className={`candidate-applied-status ${statusClass(item.status)}`}
                    >
                      {labelFromStatus(item.status)}
                    </span>
                  </div>
                  <div className="candidate-applied-cell">
                    <a
                      href={resolveResume(item.resumeUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="candidate-applied-resume-link"
                    >
                      View Resume
                    </a>
                    <small>{formatFileSize(item.resumeFileSize)}</small>
                  </div>
                  <div className="candidate-applied-cell candidate-applied-actions">
                    {item.recruiter?.id ? (
                      <button
                        type="button"
                        className="candidate-applied-icon-btn"
                        onClick={() =>
                          navigate(`/candidate/messages?user=${item.recruiter?.id}`)
                        }
                        title="Message recruiter"
                      >
                        <img src={actionMessageIcon} alt="Message recruiter" />
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="candidate-applied-icon-btn"
                      onClick={() => navigate(`/jobs/${item.jobId}`)}
                      title="View job details"
                    >
                      <img src={actionResumeIcon} alt="View details" />
                    </button>
                  </div>
                </article>
              ))}
          </section>
        </section>
      </main>
    </div>
  );
};

export default CandidateAppliedStatusPage;

