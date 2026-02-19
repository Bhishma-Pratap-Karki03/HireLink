import RecruiterOverlay from "./RecruiterOverlay";

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

type ReportItem = {
  candidate: {
    fullName: string;
  };
  matchedSkills: string[];
  missingSkills: string[];
  experienceMatch?: boolean;
  extracted?: {
    experienceYears?: number;
  };
};

type RecruiterAtsDetailsOverlayProps = {
  open: boolean;
  report: ReportItem | null;
  application?: ApplicantItem;
  statusUpdating: string | null;
  onClose: () => void;
  onStatusChange: (applicationId: string, nextStatus: string) => void;
  onViewAssessment: (applicationId: string) => void;
};

const formatStatusLabel = (status?: string) => {
  if (!status) return "-";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const formatExperienceLabel = (report: ReportItem) =>
  `${report.experienceMatch ? "Matched" : "Not matched"} ${
    report.extracted?.experienceYears ? `(${report.extracted.experienceYears} yrs)` : ""
  }`.trim();

const formatSubmittedDate = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString();
};

const hasAssessmentSubmission = (assessment?: AssessmentSummary) =>
  Boolean(
    assessment &&
      (assessment.submitted ||
        !!assessment.submittedAt ||
        assessment.score !== null ||
        !!assessment.writingResponse ||
        !!assessment.writingLink ||
        !!assessment.codeResponse ||
        !!assessment.codeLink),
  );

const RecruiterAtsDetailsOverlay = ({
  open,
  report,
  application,
  statusUpdating,
  onClose,
  onStatusChange,
  onViewAssessment,
}: RecruiterAtsDetailsOverlayProps) => {
  return (
    <RecruiterOverlay
      open={open}
      title={report?.candidate.fullName || "ATS details"}
      onClose={onClose}
    >
      {report && (
        <div className="recruiter-ats-overlay-grid">
          <div>
            <span>Status</span>
            <p>{formatStatusLabel(application?.status)}</p>
          </div>
          <div>
            <span>Matched Skills</span>
            <p>
              {report.matchedSkills?.length
                ? report.matchedSkills.join(", ")
                : "No matches"}
            </p>
          </div>
          <div>
            <span>Missing Skills</span>
            <p>
              {report.missingSkills?.length
                ? report.missingSkills.join(", ")
                : "None"}
            </p>
          </div>
          <div>
            <span>Experience Match</span>
            <p>{formatExperienceLabel(report)}</p>
          </div>
          <div>
            <span>Resume</span>
            {application?.resumeUrl ? (
              <a
                href={`http://localhost:5000${application.resumeUrl}`}
                target="_blank"
                rel="noreferrer"
                className="recruiter-ats-link-btn"
              >
                View Resume
              </a>
            ) : (
              <p>-</p>
            )}
          </div>
          <div>
            <span>Assessment Submitted</span>
            {application && hasAssessmentSubmission(application.assessment) ? (
              <div className="recruiter-ats-overlay-assessment">
                <button
                  className="recruiter-ats-link-btn"
                  onClick={() => onViewAssessment(application.id)}
                >
                  View Assessment
                </button>
                <small>
                  Submitted {formatSubmittedDate(application.assessment?.submittedAt)}
                </small>
              </div>
            ) : (
              <p>Not submitted</p>
            )}
          </div>
          {application && (
            <div>
              <span>Change Status</span>
              <div className="recruiter-ats-status-control">
                <select
                  value={application.status}
                  onChange={(e) => onStatusChange(application.id, e.target.value)}
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
          )}
        </div>
      )}
    </RecruiterOverlay>
  );
};

export default RecruiterAtsDetailsOverlay;
