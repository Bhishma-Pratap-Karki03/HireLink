import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RecruiterSidebar from "../../components/recruitercomponents/RecruiterSidebar";
import RecruiterTopBar from "../../components/recruitercomponents/RecruiterTopBar";
import "../../styles/RecruiterJobApplicantsPage.css";
import defaultAvatar from "../../images/Register Page Images/Default Profile.webp";

type CandidateInfo = {
  fullName: string;
  email: string;
  profilePicture?: string;
  currentJobTitle?: string;
};

type ApplicantItem = {
  id: string;
  candidate: CandidateInfo;
  resumeUrl: string;
  resumeFileName: string;
  resumeFileSize: number;
  message: string;
  status: string;
  appliedAt: string;
};

type JobInfo = {
  jobTitle: string;
  location: string;
  jobType: string;
  deadline: string;
};

const resolveAvatar = (profilePicture?: string) => {
  if (!profilePicture) return defaultAvatar;
  if (profilePicture.startsWith("http")) return profilePicture;
  return `http://localhost:5000${profilePicture}`;
};

const formatDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString();
};

const RecruiterJobApplicantsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobInfo | null>(null);
  const [applications, setApplications] = useState<ApplicantItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplicants = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        setLoading(true);
        setError("");
        const res = await fetch(
          `http://localhost:5000/api/applications/job/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.message || "Failed to load applicants");
        }
        setJob(data.job || null);
        setApplications(data.applications || []);
      } catch (err: any) {
        setError(err?.message || "Failed to load applicants");
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [id, navigate]);

  const handleStatusChange = async (applicationId: string, nextStatus: string) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      setStatusUpdating(applicationId);
      const res = await fetch(
        `http://localhost:5000/api/applications/${applicationId}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: nextStatus }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to update status");
      }
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: nextStatus } : app
        )
      );
    } catch (err: any) {
      setError(err?.message || "Failed to update status");
    } finally {
      setStatusUpdating(null);
    }
  };

  return (
    <div className="recruiter-applicants-layout">
      <RecruiterSidebar />
      <main className="recruiter-applicants-main">
        <RecruiterTopBar />
        <div className="recruiter-applicants-content">
          <div className="recruiter-applicants-header">
            <div>
              <h1>Applicants</h1>
              {job && (
                <p>
                  {job.jobTitle} · {job.location} · {job.jobType} · Deadline:{" "}
                  {formatDate(job.deadline)}
                </p>
              )}
            </div>
            <button
              className="recruiter-applicants-back"
              onClick={() => navigate("/recruiter/job-postings")}
            >
              Back to Job Posts
            </button>
          </div>
          <div className="recruiter-applicants-ats-callout">
            <div>
              <h2>Rank applicants with ATS</h2>
              <p>
                Use the ATS Resume Scanner to score and rank candidates for this
                job.
              </p>
            </div>
            <button
              className="recruiter-applicants-ats-btn"
              onClick={() => navigate("/recruiter/scanner")}
            >
              Go to ATS Scanner
            </button>
          </div>

          {loading && <div className="recruiter-applicants-state">Loading...</div>}
          {error && !loading && (
            <div className="recruiter-applicants-state error">{error}</div>
          )}
          {!loading && !error && applications.length === 0 && (
            <div className="recruiter-applicants-state">
              No applicants for this job yet.
            </div>
          )}

          <div className="recruiter-applicants-list">
            {applications.map((app) => (
              <article key={app.id} className="recruiter-applicant-card">
                <div className="recruiter-applicant-info">
                  <img
                    src={resolveAvatar(app.candidate.profilePicture)}
                    alt={app.candidate.fullName}
                  />
                  <div>
                    <h3>{app.candidate.fullName}</h3>
                    <p>{app.candidate.currentJobTitle || "Candidate"}</p>
                    <span>{app.candidate.email}</span>
                  </div>
                </div>
                <div className="recruiter-applicant-meta">
                  <div>
                    <span>Applied</span>
                    <strong>{formatDate(app.appliedAt)}</strong>
                  </div>
                  <div>
                    <span>Status</span>
                    <div className="recruiter-applicant-status-control">
                      <select
                        value={app.status}
                        onChange={(e) =>
                          handleStatusChange(app.id, e.target.value)
                        }
                          disabled={statusUpdating === app.id}
                        >
                          <option value="submitted">Submitted</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="interview">Interview</option>
                          <option value="rejected">Rejected</option>
                          <option value="hired">Hired</option>
                        </select>
                      </div>
                    </div>
                  <div>
                    <span>Resume</span>
                    <div className="recruiter-applicant-resume-actions">
                      <a
                        href={`http://localhost:5000${app.resumeUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="recruiter-applicant-resume-btn"
                      >
                        View Resume
                      </a>
                    </div>
                  </div>
                </div>
                {app.message && (
                  <div className="recruiter-applicant-message">
                    <span>Candidate Message</span>
                    <p>{app.message}</p>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RecruiterJobApplicantsPage;
