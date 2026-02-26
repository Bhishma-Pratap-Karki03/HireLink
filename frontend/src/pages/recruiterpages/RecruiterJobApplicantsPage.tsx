import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RecruiterSidebar from "../../components/recruitercomponents/RecruiterSidebar";
import RecruiterTopBar from "../../components/recruitercomponents/RecruiterTopBar";
import RecruiterAtsDetailsOverlay from "../../components/recruitercomponents/RecruiterAtsDetailsOverlay";
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

const getApplicationId = (report: ReportItem) => {
  if (!report.application) return "";
  return typeof report.application === "string"
    ? report.application
    : report.application._id;
};

const getCandidateId = (candidate?: CandidateInfo) => candidate?.id || candidate?._id || "";

const RecruiterJobApplicantsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobInfo | null>(null);
  const [applications, setApplications] = useState<ApplicantItem[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scanMessage, setScanMessage] = useState("");
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const openApplicantOverlay = (report: ReportItem) => {
    setSelectedReport(report);
  };

  const openCandidateMessage = (candidateId?: string) => {
    if (!candidateId) return;
    navigate(`/recruiter/messages?user=${candidateId}`);
  };

  useEffect(() => {
    const fetchApplicantsWithAts = async () => {
      if (!id) {
        setError("Invalid job id");
        return;
      }
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        setLoading(true);
        setError("");

        const scanRes = await fetch(`http://localhost:5000/api/ats/scan/${id}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
        const scanData = await scanRes.json();
        if (!scanRes.ok) {
          throw new Error(scanData?.message || "Failed to run ATS scan");
        }
        setScanMessage(scanData?.message || "ATS scan completed and applicants ranked.");

        const [applicationsRes, atsRes] = await Promise.all([
          fetch(`http://localhost:5000/api/applications/job/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://localhost:5000/api/ats/results/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const applicationsData = await applicationsRes.json();
        const atsData = await atsRes.json();

        if (!applicationsRes.ok) {
          throw new Error(applicationsData?.message || "Failed to load applicants");
        }
        if (!atsRes.ok) {
          throw new Error(atsData?.message || "Failed to load ATS ranking");
        }

        setJob(applicationsData.job || atsData.job || null);
        setApplications(applicationsData.applications || []);
        setReports(atsData.reports || []);
      } catch (err: any) {
        setError(err?.message || "Failed to load applicants");
      } finally {
        setLoading(false);
      }
    };

    fetchApplicantsWithAts();
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
    } catch (err: any) {
      setError(err?.message || "Failed to update status");
    } finally {
      setStatusUpdating(null);
    }
  };

  const reportsByApplicationId = reports.reduce(
    (acc: Record<string, ReportItem>, report) => {
      const applicationId = getApplicationId(report);
      if (applicationId) acc[applicationId] = report;
      return acc;
    },
    {},
  );

  const rankedApplications = [...applications]
    .sort((a, b) => {
      const scoreA = reportsByApplicationId[a.id]?.score || 0;
      const scoreB = reportsByApplicationId[b.id]?.score || 0;
      return scoreB - scoreA;
    })
    .map((application, index) => ({
      application,
      rank: index + 1,
      report:
        reportsByApplicationId[application.id] ||
        ({
          _id: `fallback-${application.id}`,
          application: application.id,
          candidate: application.candidate,
          score: 0,
          matchedSkills: [],
          missingSkills: [],
          experienceMatch: false,
          extracted: { experienceYears: 0 },
        } as ReportItem),
    }));

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredRankedApplications = rankedApplications.filter(
    ({ application, report }) => {
      if (!normalizedQuery) return true;
      const fullName = (
        report.candidate?.fullName ||
        application.candidate?.fullName ||
        ""
      ).toLowerCase();
      const email = (
        report.candidate?.email ||
        application.candidate?.email ||
        ""
      ).toLowerCase();
      return fullName.includes(normalizedQuery) || email.includes(normalizedQuery);
    },
  );

  const selectedApplication = selectedReport
    ? applications.find((application) => application.id === getApplicationId(selectedReport))
    : undefined;

  return (
    <div className="recruiter-applicants-layout">
      <RecruiterSidebar />
      <main className="recruiter-applicants-main">
        <RecruiterTopBar
          showSearch
          searchPlaceholder="Search applicants by name or email..."
          onSearch={setSearchQuery}
        />
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

          <div className={`recruiter-applicants-state ${scanMessage ? "success" : ""}`}>
            {scanMessage
              ? `${scanMessage}. Applicants are listed with latest ATS score, status controls, and quick actions.`
              : "ATS ranking is auto-run when this page opens. Applicants are listed with latest ATS score, status controls, and quick actions."}
          </div>

          {loading && <div className="recruiter-applicants-state">Loading...</div>}
          {error && !loading && (
            <div className="recruiter-applicants-state error">{error}</div>
          )}
          {!loading && !error && applications.length === 0 && (
            <div className="recruiter-applicants-state">No applicants for this job yet.</div>
          )}

          {!loading && !error && applications.length > 0 && filteredRankedApplications.length === 0 && (
            <div className="recruiter-applicants-state">
              No applicants match "{searchQuery}".
            </div>
          )}

          <div className="recruiter-applicants-list">
            {filteredRankedApplications.map(({ application, report, rank }) => {
              const candidateId =
                getCandidateId(report.candidate) || getCandidateId(application.candidate);
              return (
                <article key={application.id} className="recruiter-applicant-card">
                  <div className="recruiter-applicant-info recruiter-ats-top-row">
                    <div className="recruiter-applicant-left">
                      <div className="recruiter-ats-rank">#{rank}</div>
                      <img
                        src={resolveAvatar(report.candidate.profilePicture)}
                        alt={report.candidate.fullName}
                        className="recruiter-applicant-avatar"
                      />
                      <div className="recruiter-applicant-user">
                        <h3>{report.candidate.fullName}</h3>
                        <p>{report.candidate.currentJobTitle || "Candidate"}</p>
                        <span>{report.candidate.email}</span>
                      </div>
                    </div>
                    <div className="recruiter-applicant-status-inline">
                      <span>Status</span>
                      <div className="recruiter-applicant-status-control">
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
                    </div>
                    <div className="recruiter-applicant-score recruiter-ats-score">
                      <span>Score</span>
                      <strong>{report.score || 0}</strong>
                    </div>
                    <div className="recruiter-applicant-top-actions">
                      <button
                        type="button"
                        className="recruiter-applicant-icon-btn"
                        onClick={() => openApplicantOverlay(report)}
                        title="View ATS details"
                      >
                        <img src={actionEyeIcon} alt="View ATS details" />
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

        <RecruiterAtsDetailsOverlay
          open={Boolean(selectedReport)}
          report={selectedReport}
          application={selectedApplication}
          statusUpdating={statusUpdating}
          onClose={() => setSelectedReport(null)}
          onStatusChange={handleStatusChange}
          onViewAssessment={(applicationId) =>
            navigate(`/recruiter/job-postings/${id}/applicants/${applicationId}/assessment`)
          }
        />
      </main>
    </div>
  );
};

export default RecruiterJobApplicantsPage;
