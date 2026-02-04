import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/JobDetailsPage.css";
import closeIcon from "../images/Candidate Profile Page Images/corss icon.png";

// Hero background (reuse Employers Page assets)
import heroBgLeft from "../images/Employers Page Images/8_189.svg";
import heroBgRight from "../images/Employers Page Images/8_197.svg";
import heroCircle from "../images/Employers Page Images/8_205.svg";
import heroIcon1 from "../images/Employers Page Images/8_208.svg";
import heroIcon2 from "../images/Employers Page Images/8_209.svg";

// Job list icons (paths reserved in Job List Page Images)
import locationIcon from "../images/Job List Page Images/location.svg";
import jobTypeIcon from "../images/Job List Page Images/job-type.svg";
import workModeIcon from "../images/Job List Page Images/work-mode.svg";

// Interview stage icons (placeholders in Job List Page Images)
import stageIcon1 from "../images/Job List Page Images/interview-stage-1.png";
import stageIcon2 from "../images/Job List Page Images/interview-stage-2.png";
import stageIcon3 from "../images/Job List Page Images/interview-stage-3.png";
import stageIcon4 from "../images/Job List Page Images/interview-stage-4.png";
import stageIcon5 from "../images/Job List Page Images/interview-stage-5.png";
import stageIcon6 from "../images/Job List Page Images/interview-stage-6.png";
import stageIcon7 from "../images/Job List Page Images/interview-stage-7.png";

// Sidebar icons (placeholders in Job List Page Images)
import employeeTypeIcon from "../images/Job List Page Images/employee-type.svg";
import emailIcon from "../images/Job List Page Images/email.svg";
import salaryIcon from "../images/Job List Page Images/salary.svg";
import departmentIcon from "../images/Job List Page Images/department.svg";
import experienceIcon from "../images/Job List Page Images/experience.svg";
import qualificationIcon from "../images/Job List Page Images/qualification.svg";
import levelIcon from "../images/Job List Page Images/level.svg";
import genderIcon from "../images/Job List Page Images/gender.svg";
import calendarIcon from "../images/Job List Page Images/clock.svg";
import expiryIcon from "../images/Job List Page Images/expiry.svg";

// Default logo
import defaultLogo from "../images/Register Page Images/Default Profile.webp";

type InterviewStage = {
  name: string;
  salary?: string;
};

type JobDetails = {
  id: string;
  jobTitle: string;
  companyName: string;
  companyLogo: string;
  companyEmail: string;
  companyLocation: string;
  location: string;
  department: string;
  jobLevel: string;
  jobType: string;
  workMode: string;
  gender: string;
  openings: number;
  deadline: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  requiredSkills: string[];
  experience: string;
  education: string;
  salaryFrom: string;
  salaryTo: string;
  currency: string;
  benefits: string[];
  interviewStages: InterviewStage[];
  createdAt: string;
  companyAbout?: string;
  assessmentId?: string | null;
  assessmentRequired?: boolean;
  assessmentSource?: "admin" | "recruiter";
};

type AssessmentDetails = {
  id: string;
  title: string;
  description: string;
  type: "quiz" | "writing" | "code";
  difficulty: "beginner" | "intermediate" | "advanced";
  timeLimit?: string;
  maxAttempts?: number;
  quizQuestions?: {
    question: string;
    options: string[];
    correctIndex: number | null;
  }[];
  writingTask?: string;
  writingInstructions?: string;
  writingFormat?: "text" | "file" | "link";
  codeProblem?: string;
  codeLanguages?: string[];
  codeSubmission?: "file" | "repo";
  codeEvaluation?: string;
  skillTags?: string[];
};

type AssessmentMeta = {
  status: "not_started" | "in_progress" | "submitted";
  attemptsLeft: number;
  activeAttemptId?: string | null;
  latestSubmittedAttemptId?: string | null;
  latestScore?: number | null;
  quizTotal?: number | null;
};

const JobDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<JobDetails | null>(null);
  const [assessment, setAssessment] = useState<AssessmentDetails | null>(null);
  const [assessmentLoading, setAssessmentLoading] = useState(false);
  const [assessmentError, setAssessmentError] = useState("");
  const [assessmentMeta, setAssessmentMeta] = useState<AssessmentMeta | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const userDataStr = localStorage.getItem("userData");
  let userRole: string | null = null;
  if (userDataStr) {
    try {
      const parsed = JSON.parse(userDataStr);
      const isAdminEmail = parsed?.email === "hirelinknp@gmail.com";
      userRole = isAdminEmail ? "admin" : parsed?.role || null;
    } catch {
      userRole = null;
    }
  }

  const [error, setError] = useState("");
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applyProfileResume, setApplyProfileResume] = useState("");
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyMessage, setApplyMessage] = useState("");
  const [applyError, setApplyError] = useState("");
  const [useCustomResume, setUseCustomResume] = useState(false);
  const [customResumeFile, setCustomResumeFile] = useState<File | null>(null);
  const [applyNote, setApplyNote] = useState("");
  const [confirmRequirements, setConfirmRequirements] = useState(false);
  const [confirmResume, setConfirmResume] = useState(false);

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      ["clean"],
    ],
  };
  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "list",
    "bullet",
    "link",
  ];


  const fetchJobDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`http://localhost:5000/api/jobs/${id}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Failed to load job details");
      }
      setJob(data.job);
    } catch (err: any) {
      setError(err?.message || "Failed to load job details");
      setJob(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  useEffect(() => {
    const loadAssessment = async () => {
      if (!job?.assessmentId) {
        setAssessment(null);
        setAssessmentError("");
        return;
      }
      try {
        setAssessmentLoading(true);
        setAssessmentError("");
        const endpoint =
          job.assessmentSource === "admin"
            ? `http://localhost:5000/api/assessments/${job.assessmentId}`
            : `http://localhost:5000/api/recruiter-assessments/${job.assessmentId}`;
        const response = await fetch(endpoint);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.message || "Failed to load assessment");
        }
        setAssessment({
          id: data.assessment._id || data.assessment.id,
          title: data.assessment.title || "Assessment",
          description: data.assessment.description || "",
          type: data.assessment.type || "quiz",
          difficulty: data.assessment.difficulty || "beginner",
          timeLimit: data.assessment.timeLimit || "",
          maxAttempts: data.assessment.maxAttempts || 1,
          quizQuestions: data.assessment.quizQuestions || [],
          writingTask: data.assessment.writingTask || "",
          writingInstructions: data.assessment.writingInstructions || "",
          writingFormat: data.assessment.writingFormat || "text",
          codeProblem: data.assessment.codeProblem || "",
          codeLanguages: data.assessment.codeLanguages || [],
          codeSubmission: data.assessment.codeSubmission || "file",
          codeEvaluation: data.assessment.codeEvaluation || "",
          skillTags: data.assessment.skillTags || [],
        });
      } catch (err: any) {
        setAssessmentError(err?.message || "Failed to load assessment");
        setAssessment(null);
      } finally {
        setAssessmentLoading(false);
      }
    };

    loadAssessment();
  }, [job?.assessmentId]);

  useEffect(() => {
    const loadAssessmentMeta = async () => {
      if (!job?.assessmentId) {
        setAssessmentMeta(null);
        return;
      }
      const token = localStorage.getItem("authToken");
      if (!token) {
        setAssessmentMeta(null);
        return;
      }
      try {
        if (job.assessmentSource === "recruiter") {
          const response = await fetch(
            `http://localhost:5000/api/recruiter-assessments/${job.assessmentId}/meta`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );
          const data = await response.json();
          if (!response.ok) return;
          const meta = data.meta;
          if (meta) {
            setAssessmentMeta({
              status: meta.status,
              attemptsLeft: meta.attemptsLeft ?? 0,
              activeAttemptId: meta.activeAttemptId || null,
              latestSubmittedAttemptId: meta.latestSubmittedAttemptId || null,
              latestScore:
                typeof meta.latestScore === "number" ? meta.latestScore : null,
              quizTotal: typeof meta.quizTotal === "number" ? meta.quizTotal : null,
            });
          }
          return;
        }

        const response = await fetch(
          "http://localhost:5000/api/assessments/available",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const data = await response.json();
        if (!response.ok) {
          return;
        }
        const found = (data.assessments || []).find(
          (item: any) => item.id === job.assessmentId || item.id === job.assessmentId,
        );
        if (found) {
          setAssessmentMeta({
            status: found.status,
            attemptsLeft: found.attemptsLeft ?? 0,
            activeAttemptId: found.activeAttemptId || null,
            latestSubmittedAttemptId: found.latestSubmittedAttemptId || null,
            latestScore:
              typeof found.latestScore === "number" ? found.latestScore : null,
            quizTotal:
              typeof found.quizTotal === "number" ? found.quizTotal : null,
          });
        }
      } catch {
        setAssessmentMeta(null);
      }
    };

    loadAssessmentMeta();
  }, [job?.assessmentId]);

  const resolveLogo = (logo?: string) => {
    if (!logo) return defaultLogo;
    if (logo.startsWith("http")) return logo;
    return `http://localhost:5000${logo.startsWith("/") ? "" : "/"}${logo}`;
  };

  const formatWorkMode = (mode?: string) => {
    if (!mode) return "Remote";
    const normalized = mode.toLowerCase();
    if (normalized === "on-site" || normalized === "onsite") return "On-site";
    if (normalized === "hybrid") return "Hybrid";
    return "Remote";
  };

  const formatDate = (value?: string) => {
    if (!value) return "Not specified";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Not specified";
    return date.toLocaleDateString();
  };

  const stepIcons = [
    stageIcon1,
    stageIcon2,
    stageIcon3,
    stageIcon4,
    stageIcon5,
    stageIcon6,
    stageIcon7,
  ];

  const displayValue = (value?: string) => {
    if (!value) return "Not specified";
    const trimmed = value.trim();
    return trimmed ? trimmed : "Not specified";
  };

  const formatGender = (value?: string) => {
    const normalized = value?.toLowerCase();
    if (!normalized) return "Not specified";
    if (normalized === "both") return "Male / Female";
    if (normalized === "male") return "Male";
    if (normalized === "female") return "Female";
    return "Not specified";
  };

  const formatDifficulty = (value?: string) => {
    if (!value) return "Beginner";
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const openApplyModal = async () => {
    if (!job || !isCandidate) return;
    if (!canApply) {
      setApplyError("Complete the assessment before applying.");
      return;
    }
    setApplyMessage("");
    setApplyError("");
    setApplyModalOpen(true);
    setUseCustomResume(false);
    setCustomResumeFile(null);
    setApplyNote("");
    setConfirmRequirements(false);
    setConfirmResume(false);

    const token = localStorage.getItem("authToken");
    if (!token) {
      setApplyError("Please log in to apply.");
      return;
    }
    try {
      setApplyLoading(true);
      const profileRes = await fetch("http://localhost:5000/api/profile/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profileData = await profileRes.json();
      if (profileRes.ok) {
        setApplyProfileResume(profileData.user?.resume || "");
      }
    } catch (err) {
      setApplyError("Unable to load resume details.");
    } finally {
      setApplyLoading(false);
    }
  };

  const closeApplyModal = () => {
    setApplyModalOpen(false);
  };

  const handleConfirmApply = () => {
    if (!confirmRequirements || !confirmResume) {
      setApplyError("Please confirm the requirements and resume review.");
      return;
    }
    setApplyError("");
    setApplyMessage("Application submitted. Recruiter will be notified.");
    setTimeout(() => {
      setApplyModalOpen(false);
    }, 1200);
  };

  const isMandatoryAssessment = Boolean(
    job?.assessmentId && job?.assessmentRequired,
  );
  const isCandidate = userRole === "candidate";
  const isReviewer = userRole === "admin" || userRole === "recruiter";
  const isAssessmentSubmitted = assessmentMeta?.status === "submitted";
  const canApply = !isMandatoryAssessment || isAssessmentSubmitted;

  return (
    <div className="job-details-page">
      <Navbar />

      <section className="job-details-hero">
        <div className="job-details-hero-wrapper">
          <div className="job-details-hero-bg-elements">
            <img src={heroBgLeft} className="job-details-bg-left" alt="" />
            <img src={heroBgRight} className="job-details-bg-right" alt="" />
            <img src={heroCircle} className="job-details-bg-circle" alt="" />
            <img src={heroIcon1} className="job-details-bg-icon-1" alt="" />
            <img src={heroIcon2} className="job-details-bg-icon-2" alt="" />
          </div>
          <div className="job-details-hero-content">
            <div className="job-details-company-header">
              <div className="job-details-logo-wrapper">
                <img
                  src={resolveLogo(job?.companyLogo)}
                  alt={job?.companyName}
                />
              </div>
              <div>
                <h1>{job?.jobTitle || "Job Title"}</h1>
                <div className="job-details-hero-meta">
                  <span>{job?.companyName || "Company"}</span>
                  <span className="job-details-divider">/</span>
                  <span>Home / Jobs Description</span>
                </div>
              </div>
              <div className="job-details-hero-actions">
                <button
                  className="job-details-primary-btn"
                  disabled={!canApply || !isCandidate}
                  title={
                    isMandatoryAssessment && !isAssessmentSubmitted
                      ? "Complete the assessment before applying."
                      : undefined
                  }
                  onClick={openApplyModal}
                >
                  Apply Now
                </button>
                <button className="job-details-outline-btn">Save Job</button>
              </div>
              {isMandatoryAssessment && !isAssessmentSubmitted && (
                <p className="job-details-assessment-note">
                  Complete the mandatory assessment before applying.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="job-details-content">
        <div className="job-details-container">
          {loading && <div className="job-details-state">Loading...</div>}
          {error && !loading && (
            <div className="job-details-state job-details-error">{error}</div>
          )}

          {!loading && !error && job && (
            <div className="job-details-layout">
              <div className="job-details-main">
                <section className="job-details-section">
                  <h2>About Company</h2>
                  <div
                    className="job-details-richtext"
                    dangerouslySetInnerHTML={{
                      __html:
                        job.companyAbout && job.companyAbout.trim() !== ""
                          ? job.companyAbout
                          : "Company description is not available yet.",
                    }}
                  />
                </section>

                <section className="job-details-section">
                  <h2>Job Overview</h2>
                  <div
                    className="job-details-richtext"
                    dangerouslySetInnerHTML={{
                      __html: job.description || "No job overview provided.",
                    }}
                  />
                </section>

                <section className="job-details-section">
                  <h2>Interview Stages</h2>
                  {job.interviewStages && job.interviewStages.length > 0 ? (
                    <div className="job-details-stages-grid">
                      {job.interviewStages.map((stage, index) => (
                        <div
                          className="job-details-stage-card"
                          key={`${stage.name}-${index}`}
                        >
                          <div className="job-details-stage-icon">
                            <img
                              src={stepIcons[index % stepIcons.length]}
                              alt="Step"
                            />
                          </div>
                          <div className="job-details-stage-content">
                            <div className="job-details-stage-step">
                              {String(index + 1).padStart(2, "0")}
                              <span>STEP</span>
                            </div>
                            <div className="job-details-stage-pill">
                              {stage.name}
                            </div>
                            {stage.salary && (
                              <p className="job-details-stage-salary">
                                Salary: {stage.salary}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="job-details-muted">
                      Interview stages will be shared after application.
                    </p>
                  )}
                </section>

                <section className="job-details-section">
                  <h2>Requirements</h2>
                  {job.requirements && job.requirements.length > 0 ? (
                    <ul className="job-details-list">
                      {job.requirements.map((item, index) => (
                        <li key={`req-${index}`}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="job-details-muted">No requirements listed.</p>
                  )}
                </section>

                <section className="job-details-section">
                  <h2>Responsibilities</h2>
                  {job.responsibilities && job.responsibilities.length > 0 ? (
                    <ul className="job-details-list">
                      {job.responsibilities.map((item, index) => (
                        <li key={`resp-${index}`}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="job-details-muted">
                      No responsibilities listed.
                    </p>
                  )}
                </section>

                <section className="job-details-section">
                  <h2>Assessment / Quiz</h2>
                  {assessmentLoading && (
                    <p className="job-details-muted">Loading assessment...</p>
                  )}
                  {assessmentError && !assessmentLoading && (
                    <p className="job-details-muted">{assessmentError}</p>
                  )}
                  {!assessmentLoading &&
                    !assessmentError &&
                    job.assessmentId &&
                    assessment && (
                      <div className="job-details-assessment">
                        <div className="job-details-assessment-header">
                          <div>
                            <h3>{assessment.title}</h3>
                            <p className="job-details-muted">
                              {formatDifficulty(assessment.difficulty)} ·{" "}
                              {assessment.type.toUpperCase()}
                            </p>
                          </div>
                          <span className="job-details-assessment-badge">
                            {job.assessmentRequired ? "Mandatory" : "Optional"}
                          </span>
                        </div>

                        {assessmentMeta && isCandidate && (
                          <div className="job-details-assessment-status">
                            <span>
                              Status:{" "}
                              {assessmentMeta.status === "in_progress"
                                ? "In progress"
                                : assessmentMeta.status === "submitted"
                                  ? "Submitted"
                                  : "Not started"}
                            </span>
                            <span>
                              Attempts left: {assessmentMeta.attemptsLeft}
                            </span>
                            {assessment.type === "quiz" &&
                              assessmentMeta.latestScore !== null && (
                                <span>
                                  Score: {assessmentMeta.latestScore}/
                                  {assessmentMeta.quizTotal ?? "-"}
                                </span>
                              )}
                          </div>
                        )}

                        <div
                          className="job-details-richtext"
                          dangerouslySetInnerHTML={{
                            __html:
                              assessment.description ||
                              "Assessment instructions are not available.",
                          }}
                        />

                        <div className="job-details-assessment-actions">
                          {isReviewer && (
                            <button
                              className="job-details-outline-btn"
                              onClick={() =>
                                (window.location.href = `/assessments/${job.assessmentId}/preview?source=${job.assessmentSource || 'admin'}`)
                              }
                            >
                              View Questions
                            </button>
                          )}
                          {assessmentMeta?.status === "submitted" &&
                            assessmentMeta.latestSubmittedAttemptId && isCandidate && (
                              <button
                                className="job-details-outline-btn"
                                onClick={() =>
                                  (window.location.href = `/assessments/${job.assessmentId}/attempts/${assessmentMeta.latestSubmittedAttemptId}?fromJob=${job.id}`)
                                }
                              >
                                View Submission
                              </button>
                            )}
                          {assessmentMeta &&
                            assessmentMeta.status !== "submitted" &&
                            assessmentMeta.attemptsLeft > 0 && isCandidate && (
                              <button
                                className="job-details-primary-btn"
                                onClick={() => {
                                  const token =
                                    localStorage.getItem("authToken");
                                  if (!token) {
                                    window.location.href = "/login";
                                    return;
                                  }
                                  const attemptId = assessmentMeta.activeAttemptId;
                                  if (attemptId) {
                                    window.location.href = `/assessments/${job.assessmentId}/attempts/${attemptId}?fromJob=${job.id}`;
                                    return;
                                  }
                                  const base =
                                    job.assessmentSource === "admin"
                                      ? "http://localhost:5000/api/assessments"
                                      : "http://localhost:5000/api/recruiter-assessments";
                                  fetch(
                                    `${base}/${job.assessmentId}/attempts/start`,
                                    {
                                      method: "POST",
                                      headers: {
                                        Authorization: `Bearer ${token}`,
                                        "Content-Type": "application/json",
                                      },
                                    },
                                  )
                                    .then((res) => res.json().then((data) => ({ res, data })))
                                    .then(({ res, data }) => {
                                      if (!res.ok) return;
                                      const newAttempt =
                                        data.attempt?._id || data.attempt?.id;
                                      if (newAttempt) {
                                        window.location.href = `/assessments/${job.assessmentId}/attempts/${newAttempt}?fromJob=${job.id}`;
                                      }
                                    })
                                    .catch(() => {});
                                }}
                              >
                                {assessmentMeta.status === "in_progress"
                                  ? "Resume Assessment"
                                  : "Start Assessment"}
                              </button>
                            )}
                          {assessmentMeta &&
                            assessmentMeta.status !== "submitted" &&
                            assessmentMeta.attemptsLeft === 0 && isCandidate && (
                              <span className="job-details-muted">
                                No attempts remaining.
                              </span>
                            )}
                        </div>

                        <p className="job-details-muted">
                          Assessment questions are shown after you start the
                          assessment.
                        </p>
                      </div>
                    )}
                  {!assessmentLoading &&
                    !assessmentError &&
                    !job.assessmentId && (
                      <p className="job-details-muted">
                        No assessment required for this role.
                      </p>
                    )}
                </section>
              </div>

              <aside className="job-details-sidebar">
                <div className="job-details-card">
                  <h3>Overview</h3>
                  <div className="job-details-info-item">
                    <img src={employeeTypeIcon} alt="Employee Type" />
                    <div>
                      <span>Employee Type</span>
                      <strong>
                        {job.jobType} / {formatWorkMode(job.workMode)}
                      </strong>
                    </div>
                  </div>
                  <div className="job-details-info-item">
                    <img src={locationIcon} alt="Location" />
                    <div>
                      <span>Location</span>
                      <strong>
                        {displayValue(job.location || job.companyLocation)}
                      </strong>
                    </div>
                  </div>
                  <div className="job-details-info-item">
                    <img src={emailIcon} alt="Email" />
                    <div>
                      <span>Email</span>
                      <strong>{job.companyEmail || "Not provided"}</strong>
                    </div>
                  </div>
                  <div className="job-details-info-item">
                    <img src={salaryIcon} alt="Salary" />
                    <div>
                      <span>Salary</span>
                      <strong>
                        {job.currency} {job.salaryFrom} - {job.salaryTo}
                      </strong>
                    </div>
                  </div>
                  <div className="job-details-info-item">
                    <img src={departmentIcon} alt="Department" />
                    <div>
                      <span>Department</span>
                      <strong>{job.department || "Not specified"}</strong>
                    </div>
                  </div>
                  <div className="job-details-info-item">
                    <img src={experienceIcon} alt="Experience" />
                    <div>
                      <span>Experience</span>
                      <strong>{displayValue(job.experience)}</strong>
                    </div>
                  </div>
                  <div className="job-details-info-item">
                    <img src={qualificationIcon} alt="Qualification" />
                    <div>
                      <span>Qualification</span>
                      <strong>{displayValue(job.education)}</strong>
                    </div>
                  </div>
                  <div className="job-details-info-item">
                    <img src={levelIcon} alt="Job Level" />
                    <div>
                      <span>Job Level</span>
                      <strong>{job.jobLevel || "Not specified"}</strong>
                    </div>
                  </div>
                  <div className="job-details-info-item">
                    <img src={genderIcon} alt="Gender" />
                    <div>
                      <span>Gender</span>
                      <strong>{formatGender(job.gender)}</strong>
                    </div>
                  </div>
                  <div className="job-details-info-item">
                    <img src={calendarIcon} alt="Date Posted" />
                    <div>
                      <span>Date Posted</span>
                      <strong>{formatDate(job.createdAt)}</strong>
                    </div>
                  </div>
                  <div className="job-details-info-item">
                    <img src={expiryIcon} alt="Expiration Date" />
                    <div>
                      <span>Expiration Date</span>
                      <strong>{formatDate(job.deadline)}</strong>
                    </div>
                  </div>
                </div>

                <div className="job-details-card job-details-skills">
                  <h3>Skills</h3>
                  <div className="job-details-skill-tags">
                    {job.requiredSkills && job.requiredSkills.length > 0 ? (
                      job.requiredSkills.map((skill, index) => (
                        <span key={`${skill}-${index}`}>{skill}</span>
                      ))
                    ) : (
                      <span>Not specified</span>
                    )}
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </section>

      {applyModalOpen && (
        <div className="apply-modal-overlay">
          <div className="apply-modal">
            <div className="apply-modal-header">
              <div>
                <h3>Confirm Application</h3>
                <p>Review your resume and confirm the requirements before applying.</p>
              </div>
              <button className="apply-modal-close" onClick={closeApplyModal}>
                <img src={closeIcon} alt="Close" />
              </button>
            </div>

            {applyLoading && <p>Loading details...</p>}
            {!applyLoading && job && (
              <div className="apply-modal-body">
                <div className="apply-modal-section">
                  <h4>{job.jobTitle}</h4>
                  <p className="apply-modal-muted">{job.companyName}</p>
                </div>

                <div className="apply-modal-section">
                  <h5>Resume</h5>
                  {applyProfileResume ? (
                    <a
                      href={`http://localhost:5000${applyProfileResume}`}
                      target="_blank"
                      rel="noreferrer"
                      className="apply-modal-link"
                    >
                      View current resume
                    </a>
                  ) : (
                    <p className="apply-modal-muted">No resume on profile.</p>
                  )}
                  <label className="apply-modal-checkbox">
                    <input
                      type="checkbox"
                      checked={useCustomResume}
                      onChange={(e) => setUseCustomResume(e.target.checked)}
                    />
                    Use a different resume for this application (won't change your profile)
                  </label>
                  {useCustomResume && (
                    <label className="apply-modal-upload">
                      <input
                        type="file"
                        onChange={(e) =>
                          setCustomResumeFile(e.target.files ? e.target.files[0] : null)
                        }
                      />
                      <div className="apply-modal-upload-inner">
                        <span className="apply-modal-upload-title">Upload new resume</span>
                        <span className="apply-modal-upload-subtitle">PDF or DOCX ? Max 5MB</span>
                        {customResumeFile && (
                          <>
                            <span className="apply-modal-upload-file">
                              {customResumeFile.name}
                            </span>
                            <button
                              type="button"
                              className="apply-modal-link apply-modal-preview-btn"
                              onClick={(e) => {
                                e.preventDefault();
                                const url = URL.createObjectURL(customResumeFile);
                                window.open(url, "_blank", "noopener,noreferrer");
                              }}
                            >
                              Preview selected resume
                            </button>
                          </>
                        )}
                      </div>
                    </label>
                  )}
                </div>

                <div className="apply-modal-divider" />

                <div className="apply-modal-section">
                  <h5>Requirements</h5>
                  <p className="apply-modal-muted">
                    Education: {job.education || "Not specified"}
                  </p>
                  <p className="apply-modal-muted">
                    Experience: {job.experience || "Not specified"}
                  </p>
                  <label className="apply-modal-checkbox">
                    <input
                      type="checkbox"
                      checked={confirmRequirements}
                      onChange={(e) => setConfirmRequirements(e.target.checked)}
                    />
                    I confirm I meet the listed requirements.
                  </label>
                </div>

                <div className="apply-modal-divider" />

                <div className="apply-modal-section">
                  <h5>Message to recruiter (optional)</h5>
                  <div className="apply-modal-quill">
                    <ReactQuill
                      theme="snow"
                      value={applyNote}
                      onChange={setApplyNote}
                      modules={quillModules}
                      formats={quillFormats}
                      placeholder="Add a short note for the recruiter..."
                    />
                  </div>
                </div>

                <label className="apply-modal-checkbox">
                  <input
                    type="checkbox"
                    checked={confirmResume}
                    onChange={(e) => setConfirmResume(e.target.checked)}
                  />
                  I have reviewed my resume and want to apply.
                </label>
              </div>
            )}

            {applyError && <div className="apply-modal-error">{applyError}</div>}
            {applyMessage && <div className="apply-modal-success">{applyMessage}</div>}

            <div className="apply-modal-actions">
              <button className="apply-modal-secondary" onClick={closeApplyModal}>
                Cancel
              </button>
              <button
                className="apply-modal-primary"
                onClick={handleConfirmApply}
                disabled={applyLoading}
              >
                Confirm & Apply
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default JobDetailsPage;
