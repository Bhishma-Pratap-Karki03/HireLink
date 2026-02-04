import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/AssessmentListingPage.css";
import searchIcon from "../images/Job List Page Images/search.svg";

type AssessmentCard = {
  id: string;
  title: string;
  type: "quiz" | "writing" | "code";
  difficulty: "beginner" | "intermediate" | "advanced";
  timeLimit: string;
  maxAttempts: number;
  attemptsUsed: number;
  attemptsLeft: number;
  status: "not_started" | "in_progress" | "submitted";
  deadline?: string;
  latestSubmittedAttemptId?: string | null;
  latestScore?: number | null;
  quizTotal?: number | null;
};

const AssessmentListingPage = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<AssessmentCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({
    search: "",
    type: "",
    status: "",
    difficulty: "",
  });
  const userDataStr = localStorage.getItem("userData");
  const userData = userDataStr ? JSON.parse(userDataStr) : null;
  const userRole = userData?.email === "hirelinknp@gmail.com"
    ? "admin"
    : userData?.role || "candidate";
  const isCandidate = userRole === "candidate";

  const fetchAssessments = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Please log in to view assessments.");
      return;
    }
    try {
      setLoading(true);
      setError("");
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
        throw new Error(data?.message || "Failed to load assessments");
      }
      setAssessments(data.assessments || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load assessments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  const formatType = (type: AssessmentCard["type"]) => {
    if (type === "quiz") return "MCQ";
    if (type === "writing") return "Writing";
    return "Coding";
  };

  const formatDeadline = (deadline?: string) => {
    if (!deadline) return "No deadline";
    const date = new Date(deadline);
    if (Number.isNaN(date.getTime())) return "No deadline";
    return date.toLocaleDateString();
  };

  const applyFilters = () => {
    setAppliedFilters({
      search: searchTerm.trim(),
      type: filterType,
      status: filterStatus,
      difficulty: filterDifficulty,
    });
  };

  const filteredAssessments = assessments.filter((assessment) => {
    const matchesSearch = appliedFilters.search
      ? assessment.title
          .toLowerCase()
          .includes(appliedFilters.search.toLowerCase())
      : true;
    const matchesType = appliedFilters.type
      ? assessment.type === appliedFilters.type
      : true;
    const matchesStatus = appliedFilters.status
      ? assessment.status === appliedFilters.status
      : true;
    const matchesDifficulty = appliedFilters.difficulty
      ? assessment.difficulty === appliedFilters.difficulty
      : true;
    return matchesSearch && matchesType && matchesStatus && matchesDifficulty;
  });

  const handleStart = async (assessment: AssessmentCard) => {
    if (!isCandidate) return;
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Please log in to start an assessment.");
      return;
    }
    if (assessment.attemptsLeft <= 0) {
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:5000/api/assessments/${assessment.id}/attempts/start`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Unable to start assessment");
      }
      const attemptId = data.attempt?._id || data.attempt?.id;
      if (attemptId) {
        navigate(`/assessments/${assessment.id}/attempts/${attemptId}`);
      }
    } catch (err: any) {
      setError(err?.message || "Unable to start assessment");
    }
  };

  const handleViewSubmission = (assessment: AssessmentCard) => {
    if (!assessment.latestSubmittedAttemptId) return;
    navigate(
      `/assessments/${assessment.id}/attempts/${assessment.latestSubmittedAttemptId}`,
    );
  };

  return (
    <div className="assessment-listing-page">
      <Navbar />
      <section className="assessment-listing-hero">
        <div className="assessment-listing-hero-content">
          <h1>Quiz / Assessment</h1>
          <p>Browse and complete assessments assigned to you.</p>
        </div>
        <div className="assessment-listing-search">
          <div className="assessment-search-pill">
            <div className="assessment-search-field">
              <img src={searchIcon} alt="Search" />
              <input
                type="text"
                placeholder="Search assessment title"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="assessment-search-field">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">Type</option>
                <option value="quiz">MCQ</option>
                <option value="writing">Writing</option>
                <option value="code">Coding</option>
              </select>
            </div>
            <div className="assessment-search-field">
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
              >
                <option value="">Difficulty</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div className="assessment-search-field">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Status</option>
                <option value="not_started">Not started</option>
                <option value="in_progress">In progress</option>
                <option value="submitted">Submitted</option>
              </select>
            </div>
            <button className="assessment-search-btn" onClick={applyFilters}>
              Search
            </button>
          </div>
        </div>
      </section>

      <section className="assessment-listing-content">
        <div className="assessment-listing-container">
          {loading && <div className="assessment-state">Loading...</div>}
          {error && !loading && (
            <div className="assessment-state assessment-error">{error}</div>
          )}
          

          <div className="assessment-grid">
            {filteredAssessments.map((assessment) => (
              <div
                key={assessment.id}
                className="assessment-card"
                onClick={() => handleStart(assessment)}
                role="button"
              >
                <div className="assessment-card-header">
                  <div>
                    <h3>{assessment.title}</h3>
                    <p>{formatType(assessment.type)}</p>
                  </div>
                  <span className={`assessment-status ${assessment.status}`}>
                    {assessment.status === "not_started"
                      ? "Not started"
                      : assessment.status === "in_progress"
                        ? "In progress"
                        : "Submitted"}
                  </span>
                </div>

                <div className="assessment-card-meta">
                  <div>
                    <span>Duration</span>
                    <strong>{assessment.timeLimit || "60 min"}</strong>
                  </div>
                  <div>
                    <span>Attempts</span>
                    <strong>
                      {assessment.attemptsUsed}/{assessment.maxAttempts}
                    </strong>
                  </div>
                </div>

                <div className="assessment-card-meta secondary">
                  <div>
                    <span>Deadline</span>
                    <strong>{formatDeadline(assessment.deadline)}</strong>
                  </div>
                  <div>
                    <span>
                      {assessment.type === "quiz" ? "Score" : "Attempts left"}
                    </span>
                    <strong>
                      {assessment.type === "quiz"
                        ? assessment.latestScore !== null &&
                          assessment.latestScore !== undefined
                          ? `${assessment.latestScore}/${assessment.quizTotal ?? "-"}`
                          : "-"
                        : assessment.attemptsLeft}
                    </strong>
                  </div>
                </div>

                <button
                  className="assessment-card-action"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isCandidate) {
                      handleStart(assessment);
                    } else {
                      navigate(`/assessments/${assessment.id}/preview`);
                    }
                  }}
                >
                  {isCandidate
                    ? assessment.attemptsLeft <= 0
                      ? "Unavailable"
                      : assessment.status === "in_progress"
                        ? "Resume"
                        : assessment.status === "submitted"
                          ? "Start new attempt"
                          : "Start"
                    : "View Questions"}
                </button>
                {isCandidate && assessment.status === "submitted" && (
                  <button
                    className="assessment-card-view"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewSubmission(assessment);
                    }}
                  >
                    View Submission
                  </button>
                )}
              </div>
            ))}
            {!loading && filteredAssessments.length === 0 && (
              <div className="assessment-state">
                No assessments match your filters.
              </div>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default AssessmentListingPage;
