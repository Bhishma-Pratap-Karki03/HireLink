import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RecruiterSidebar from "../../components/recruitercomponents/RecruiterSidebar";
import RecruiterTopBar from "../../components/recruitercomponents/RecruiterTopBar";
import RecruiterAtsDetailsOverlay from "../../components/recruitercomponents/RecruiterAtsDetailsOverlay";
import "../../styles/RecruiterAtsRankingPage.css";
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

type ReportItem = {
  _id: string;
  application?: string | { _id: string };
  candidate: CandidateInfo;
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  skillsScore?: number;
  experienceScore?: number;
  experienceMatch?: boolean;
  extracted?: {
    experienceYears?: number;
  };
};

type AssessmentSummary = {
  attached: boolean;
  required: boolean;
  submitted: boolean;
  submittedAt: string | null;
  score: number | null;
  writingResponse: string;
  writingLink: string;
  codeResponse: string;
  codeLink: string;
};

type ApplicantItem = {
  id: string;
  status: string;
  resumeUrl: string;
  assessment?: AssessmentSummary;
};

type JobInfo = {
  jobTitle: string;
  location: string;
  jobType: string;
};

const resolveAvatar = (profilePicture?: string) => {
  if (!profilePicture) return defaultAvatar;
  if (profilePicture.startsWith("http")) return profilePicture;
  return `http://localhost:5000${profilePicture}`;
};

const getApplicationId = (report: ReportItem) => {
  if (!report.application) return "";
  return typeof report.application === "string"
    ? report.application
    : report.application._id;
};

const getCandidateId = (report: ReportItem) =>
  report.candidate.id || report.candidate._id || "";

const RecruiterAtsRankingPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobInfo | null>(null);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [applicationsById, setApplicationsById] = useState<Record<string, ApplicantItem>>(
    {},
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        setLoading(true);
        setError("");

        const [atsRes, applicationsRes] = await Promise.all([
          fetch(`http://localhost:5000/api/ats/results/${jobId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://localhost:5000/api/applications/job/${jobId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const atsData = await atsRes.json();
        const applicationsData = await applicationsRes.json();

        if (!atsRes.ok) {
          throw new Error(atsData?.message || "Failed to load ATS results");
        }
        if (!applicationsRes.ok) {
          throw new Error(applicationsData?.message || "Failed to load applications");
        }

        const appMap = (applicationsData.applications || []).reduce(
          (acc: Record<string, ApplicantItem>, item: ApplicantItem) => {
            acc[item.id] = item;
            return acc;
          },
          {},
        );

        setJob(atsData.job || null);
        setReports(atsData.reports || []);
        setApplicationsById(appMap);
      } catch (err: any) {
        setError(err?.message || "Failed to load ATS results");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [jobId, navigate]);

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

      setApplicationsById((prev) => ({
        ...prev,
        [applicationId]: {
          ...prev[applicationId],
          status: nextStatus,
        },
      }));
    } catch (err: any) {
      setError(err?.message || "Failed to update status");
    } finally {
      setStatusUpdating(null);
    }
  };

  const openCandidateMessage = (candidateId: string) => {
    if (!candidateId) return;
    navigate(`/recruiter/messages?user=${candidateId}`);
  };

  const selectedApplication = selectedReport
    ? applicationsById[getApplicationId(selectedReport)]
    : undefined;

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredReports = normalizedQuery
    ? reports.filter((report) => {
        const name = report.candidate.fullName?.toLowerCase() || "";
        const role = report.candidate.currentJobTitle?.toLowerCase() || "";
        const email = report.candidate.email?.toLowerCase() || "";
        return (
          name.includes(normalizedQuery) ||
          role.includes(normalizedQuery) ||
          email.includes(normalizedQuery)
        );
      })
    : reports;

  return (
    <div className="recruiter-ats-layout">
      <RecruiterSidebar />
      <main className="recruiter-ats-main">
        <RecruiterTopBar
          showSearch
          searchPlaceholder="Search candidate by name, role, or email..."
          onSearch={setSearchQuery}
        />
        <div className="recruiter-ats-content">
          <div className="recruiter-ats-header">
            <div>
              <h1>ATS Ranking</h1>
              {job && (
                <p>
                  {job.jobTitle} - {job.location} - {job.jobType}
                </p>
              )}
            </div>
            <button
              className="recruiter-ats-back"
              onClick={() => navigate("/recruiter/scanner")}
            >
              Back to Scanner
            </button>
          </div>

          {loading && <div className="recruiter-ats-state">Loading...</div>}
          {error && !loading && <div className="recruiter-ats-state error">{error}</div>}
          {!loading && !error && reports.length === 0 && (
            <div className="recruiter-ats-state">Run ATS scan to see rankings.</div>
          )}
          {!loading && !error && reports.length > 0 && filteredReports.length === 0 && (
            <div className="recruiter-ats-state">No candidates match your search.</div>
          )}

          <div className="recruiter-ats-list">
            {filteredReports.map((report, index) => {
              const applicationId = getApplicationId(report);
              const application = applicationsById[applicationId];
              const candidateId = getCandidateId(report);

              return (
                <article key={report._id} className="recruiter-ats-card">
                  <div className="recruiter-ats-top-row">
                    <div className="recruiter-ats-candidate">
                      <div className="recruiter-ats-rank">#{index + 1}</div>
                      <img
                        src={resolveAvatar(report.candidate.profilePicture)}
                        alt={report.candidate.fullName}
                      />
                      <div>
                        <h3>{report.candidate.fullName}</h3>
                        <p>{report.candidate.currentJobTitle || "Candidate"}</p>
                        <span>{report.candidate.email}</span>
                      </div>
                    </div>

                    <div className="recruiter-ats-status-inline">
                      <span>Status</span>
                      {application ? (
                        <div className="recruiter-ats-status-control">
                          <select
                            value={application.status}
                            onChange={(e) =>
                              handleStatusChange(application.id, e.target.value)
                            }
                            disabled={statusUpdating === application.id}
                          >
                            <option value="submitted">Submitted</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="shortlisted">Shortlisted</option>
                            <option value="interview">Interview</option>
                            <option value="rejected">Rejected</option>
                            <option value="hired">Hired</option>
                          </select>
                        </div>
                      ) : (
                        <p className="recruiter-ats-status-text">-</p>
                      )}
                    </div>

                    <div className="recruiter-ats-score">
                      <span>Score</span>
                      <strong>{report.score}</strong>
                    </div>

                    <div className="recruiter-ats-actions">
                      <button
                        type="button"
                        className="recruiter-ats-action-icon-btn"
                        onClick={() => setSelectedReport(report)}
                        title="View ATS details"
                      >
                        <img src={actionEyeIcon} alt="View ATS details" />
                      </button>
                      <button
                        type="button"
                        className="recruiter-ats-action-icon-btn"
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

        <RecruiterAtsDetailsOverlay
          open={Boolean(selectedReport)}
          report={selectedReport}
          application={selectedApplication}
          statusUpdating={statusUpdating}
          onClose={() => setSelectedReport(null)}
          onStatusChange={handleStatusChange}
          onViewAssessment={(applicationId) =>
            navigate(`/recruiter/job-postings/${jobId}/applicants/${applicationId}/assessment`)
          }
        />
      </main>
    </div>
  );
};

export default RecruiterAtsRankingPage;
