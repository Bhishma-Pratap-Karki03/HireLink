import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CandidateSidebar from "../../components/candidatecomponents/CandidateSidebar";
import CandidateTopBar from "../../components/candidatecomponents/CandidateTopBar";
import "../../styles/CandidateSmartJobsPage.css";

type Recommendation = {
  jobId: string;
  jobTitle: string;
  companyName: string;
  location: string;
  jobType: string;
  workMode: string;
  skillMatchPercent: number;
  matchedSkills: string[];
  reasons: string[];
};

const CandidateSmartJobsHistoryPage = () => {
  const navigate = useNavigate();
  const { historyId } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState<Recommendation[]>([]);

  const fetchHistory = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }
    if (!historyId) return;

    try {
      setLoading(true);
      setError("");
      const res = await fetch(
        `http://localhost:5000/api/recommendations/history/${historyId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to load recommendation history");
      }
      const sortedItems = [...(data.recommendations || [])].sort(
        (a: Recommendation, b: Recommendation) =>
          (b.skillMatchPercent || 0) - (a.skillMatchPercent || 0),
      );
      setItems(sortedItems);
    } catch (err: any) {
      setError(err?.message || "Failed to load recommendation history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [historyId]);

  return (
    <div className="candidate-dashboard-container">
      <CandidateSidebar />
      <main className="candidate-smart-main">
        <CandidateTopBar />
        <section className="candidate-smart-shell">
          <header className="candidate-smart-header">
            <div className="candidate-smart-header-left">
              <h2>Recommendation History</h2>
              <p>Saved recommendation run results.</p>
            </div>
            <div className="candidate-smart-header-right">
              <button
                type="button"
                className="candidate-smart-run-btn"
                onClick={() => navigate("/candidate/job-alerts")}
              >
                Back
              </button>
            </div>
          </header>

          {loading && <div className="candidate-smart-state">Loading recommendations...</div>}
          {!loading && error && (
            <div className="candidate-smart-state candidate-smart-error">{error}</div>
          )}
          {!loading && !error && items.length === 0 && (
            <div className="candidate-smart-state">No recommendations in this history run.</div>
          )}

          {items.length > 0 && (
            <div className="candidate-smart-list">
              {items.map((item) => (
                <article key={item.jobId} className="candidate-smart-card">
                  <div className="candidate-smart-card-top">
                    <div>
                      <h3 className="candidate-smart-history-job-title">{item.jobTitle}</h3>
                      <div className="candidate-smart-history-company-row">
                        <span className="candidate-smart-history-company-name">
                          {item.companyName || "Company"}
                        </span>
                      </div>
                      <p className="candidate-smart-history-job-location">{item.location}</p>
                    </div>
                    <div className="candidate-smart-score">
                      {item.skillMatchPercent ?? 0}%
                    </div>
                  </div>

                  <div className="candidate-smart-meta">
                    <span>{item.jobType || "-"}</span>
                    <span>{item.workMode || "-"}</span>
                    {(item.reasons || []).map((reason, idx) => (
                      <span key={`${item.jobId}-reason-${idx}`}>{reason}</span>
                    ))}
                  </div>

                  <div className="candidate-smart-bottom-row">
                    <div className="candidate-smart-skill-row">
                      <strong>Matched Skills:</strong>{" "}
                      {item.matchedSkills?.length
                        ? item.matchedSkills.join(", ")
                        : "No direct match"}
                    </div>
                    <div className="candidate-smart-actions candidate-smart-actions-right">
                      <button onClick={() => navigate(`/jobs/${item.jobId}`)}>View Details</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default CandidateSmartJobsHistoryPage;
