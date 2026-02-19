import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RecruiterSidebar from "../../components/recruitercomponents/RecruiterSidebar";
import RecruiterTopBar from "../../components/recruitercomponents/RecruiterTopBar";
import RecruiterOverlay from "../../components/recruitercomponents/RecruiterOverlay";
import "../../styles/RecruiterJobApplicantsPage.css";
import defaultAvatar from "../../images/Register Page Images/Default Profile.webp";
import actionMessageIcon from "../../images/Candidate Profile Page Images/message-icon.svg";
import actionEyeIcon from "../../images/Candidate Profile Page Images/eyeIcon.svg";

type CandidateInfo = {
  id?: string;
  _id?: string;
  fullName: string;
  email: string;
  profilePicture?: string;
  currentJobTitle?: string;
};

type AssessmentSummary = {
  attached: boolean;
  required: boolean;
  source: "admin" | "recruiter" | null;
    type: "quiz" | "writing" | "task" | "code" | null;
  title: string;
  submitted: boolean;
  submittedAt: string | null;
  score: number | null;
  quizTotal: number | null;
  writingResponse: string;
  writingLink: string;
  codeResponse: string;
  codeLink: string;
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
  assessment?: AssessmentSummary;
};

type JobInfo = {
  jobTitle: string;
  location: string;
  jobType: string;
  deadline: string;
  assessmentRequired?: boolean;
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
  const [selectedApplicant, setSelectedApplicant] = useState<ApplicantItem | null>(
    null,
  );

  const openApplicantOverlay = (applicant: ApplicantItem) => {
    setSelectedApplicant(applicant);
  };

  const openCandidateMessage = (candidateId?: string) => {
    if (!candidateId) return;
    navigate(`/recruiter/messages?user=${candidateId}`);
  };

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
        const res = await fetch(`http://localhost:5000/api/applications/job/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
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
        },
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to update status");
      }

      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: nextStatus } : app,
        ),
      );
      setSelectedApplicant((prev) =>
        prev && prev.id === applicationId ? { ...prev, status: nextStatus } : prev,
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
                  {job.jobTitle} - {job.location} - {job.jobType} - Deadline:{" "}
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
              <p>Use the ATS Resume Scanner to score and rank candidates for this job.</p>
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
            <div className="recruiter-applicants-state">No applicants for this job yet.</div>
          )}

          <div className="recruiter-applicants-list">
            {applications.map((app) => {
              const candidateId = app.candidate.id || app.candidate._id || "";
              return (
                <article key={app.id} className="recruiter-applicant-card">
                  <div className="recruiter-applicant-info">
                    <div className="recruiter-applicant-left">
                      <img
                        src={resolveAvatar(app.candidate.profilePicture)}
                        alt={app.candidate.fullName}
                        className="recruiter-applicant-avatar"
                      />
                      <div className="recruiter-applicant-user">
                        <h3>{app.candidate.fullName}</h3>
                        <p>{app.candidate.currentJobTitle || "Candidate"}</p>
                        <span>{app.candidate.email}</span>
                      </div>
                    </div>
                    <div className="recruiter-applicant-status-inline">
                      <span>Status</span>
                      <div className="recruiter-applicant-status-control">
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app.id, e.target.value)}
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
                    <div className="recruiter-applicant-top-actions">
                      <button
                        type="button"
                        className="recruiter-applicant-icon-btn"
                        onClick={() => openApplicantOverlay(app)}
                        title="View application details"
                      >
                        <img src={actionEyeIcon} alt="View application details" />
                      </button>
                      <button
                        type="button"
                        className="recruiter-applicant-icon-btn"
                        onClick={() => openCandidateMessage(candidateId)}
                        title="Message candidate"
                      >
                        <img src={actionMessageIcon} alt="Message candidate" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <RecruiterOverlay
          open={Boolean(selectedApplicant)}
          title={selectedApplicant?.candidate.fullName || "Applicant details"}
          onClose={() => setSelectedApplicant(null)}
        >
          {selectedApplicant && (
            <>
              <div className="recruiter-applicant-overlay-grid">
                <div>
                  <span>Applied</span>
                  <strong>{formatDate(selectedApplicant.appliedAt)}</strong>
                </div>
                <div>
                  <span>Status</span>
                  <div className="recruiter-applicant-status-control">
                    <select
                      value={selectedApplicant.status}
                      onChange={(e) =>
                        handleStatusChange(selectedApplicant.id, e.target.value)
                      }
                      disabled={statusUpdating === selectedApplicant.id}
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
                  <a
                    href={`http://localhost:5000${selectedApplicant.resumeUrl}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View Resume
                  </a>
                </div>
                <div>
                  <span>Assessment</span>
                  {!selectedApplicant.assessment?.attached && (
                    <small>No assessment linked to this job</small>
                  )}
                  {selectedApplicant.assessment?.attached &&
                    !selectedApplicant.assessment?.submitted && (
                      <small>
                        Not submitted
                        {selectedApplicant.assessment.required ? "" : " (optional)"}
                      </small>
                    )}
                  {selectedApplicant.assessment?.attached &&
                    selectedApplicant.assessment.submitted && (
                      <div className="recruiter-applicant-overlay-assessment">
                        <small>
                          Submitted
                          {selectedApplicant.assessment.required ? "" : " (optional)"}
                        </small>
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/recruiter/job-postings/${id}/applicants/${selectedApplicant.id}/assessment`,
                            )
                          }
                          className="recruiter-applicant-assessment-btn"
                        >
                          View Assessment
                        </button>
                        <small>
                          Submitted{" "}
                          {formatDate(
                            selectedApplicant.assessment.submittedAt || undefined,
                          )}
                        </small>
                      </div>
                    )}
                </div>
              </div>

              <div className="recruiter-applicant-overlay-message">
                <span>Candidate Message</span>
                <p>
                  {selectedApplicant.message?.trim()
                    ? selectedApplicant.message
                    : "No message was provided by the candidate while applying."}
                </p>
              </div>
            </>
          )}
        </RecruiterOverlay>
      </main>
    </div>
  );
};

export default RecruiterJobApplicantsPage;
