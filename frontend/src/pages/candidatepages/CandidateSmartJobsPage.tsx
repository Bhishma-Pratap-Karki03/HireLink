import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CandidateSidebar from "../../components/candidatecomponents/CandidateSidebar";
import CandidateTopBar from "../../components/candidatecomponents/CandidateTopBar";
import "../../styles/CandidateSmartJobsPage.css";
import eyeIcon from "../../images/Candidate Profile Page Images/eyeIcon.svg";
import deleteIcon from "../../images/Candidate Profile Page Images/trash.png";

type RecommendationHistoryItem = {
  id: string;
  createdAt: string;
  count: number;
};

const CandidateSmartJobsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasRun, setHasRun] = useState(false);
  const [history, setHistory] = useState<RecommendationHistoryItem[]>([]);

  const fetchHistory = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      const res = await fetch("http://localhost:5000/api/recommendations/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setHistory(data.history || []);
      }
    } catch (_) {}
  };

  const fetchRecommendations = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await fetch("http://localhost:5000/api/recommendations/me?limit=12", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to load recommendations");
      }
      setHasRun(true);
      fetchHistory();
    } catch (err: any) {
      setError(err?.message || "Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  };

  const handleViewHistory = (id: string) => {
    navigate(`/candidate/job-alerts/history/${id}`);
  };

  const handleDeleteHistory = async (id: string) => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:5000/api/recommendations/history/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to delete recommendation history");
      }
      setHistory((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      setError(err?.message || "Failed to delete recommendation history");
    }
  };

  const formatDateTime = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString();
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="candidate-dashboard-container">
      <CandidateSidebar />
      <main className="candidate-smart-main">
        <CandidateTopBar />
        <section className="candidate-smart-shell">
          <header className="candidate-smart-header">
            <div className="candidate-smart-header-left">
              <h2>Smart Jobs</h2>
              <p>AI-ranked jobs based on your profile, skills, and experience.</p>
              {!loading && !error && !hasRun && (
                <p className="candidate-smart-helper-text">
                  Click Run Recommendation to generate smart jobs.
                </p>
              )}
            </div>
            <div className="candidate-smart-header-right">
              <button
                type="button"
                className="candidate-smart-run-btn"
                onClick={fetchRecommendations}
                disabled={loading}
              >
                {loading ? "Running..." : "Run Recommendation"}
              </button>
            </div>
          </header>

          {loading && <div className="candidate-smart-state">Loading recommendations...</div>}
          {!loading && error && (
            <div className="candidate-smart-state candidate-smart-error">{error}</div>
          )}
          {!loading && !error && hasRun && (
            <div className="candidate-smart-state">
              Recommendation run completed. Use the eye icon in history to view the list.
            </div>
          )}
          {!loading && history.length > 0 && (
            <section className="candidate-smart-history">
              <h4>Recommendation History</h4>
              <div className="candidate-smart-history-list">
                {history.map((row) => (
                  <article key={row.id} className="candidate-smart-history-row-wrap">
                    <div className="candidate-smart-history-row">
                      <div>
                        <strong>{formatDateTime(row.createdAt)}</strong>
                        <p>{row.count} jobs recommended</p>
                      </div>
                      <div className="candidate-smart-history-actions">
                        <button
                          type="button"
                          className="candidate-smart-icon-btn"
                          onClick={() => handleViewHistory(row.id)}
                          title="View recommendation run"
                        >
                          <img src={eyeIcon} alt="View" />
                        </button>
                        <button
                          type="button"
                          className="candidate-smart-icon-btn"
                          onClick={() => handleDeleteHistory(row.id)}
                          title="Delete recommendation run"
                        >
                          <img src={deleteIcon} alt="Delete" />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </section>
      </main>
    </div>
  );
};

export default CandidateSmartJobsPage;
