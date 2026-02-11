import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RecruiterSidebar from "../../components/recruitercomponents/RecruiterSidebar";
import RecruiterTopBar from "../../components/recruitercomponents/RecruiterTopBar";
import "../../styles/RecruiterScannerPage.css";

type RecruiterJobItem = {
  _id: string;
  jobTitle: string;
  location: string;
  jobType: string;
  deadline: string;
  statusLabel: string;
  applicantsCount: number;
  isActive: boolean;
};

const formatDate = (value?: string) => {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";
  return date.toLocaleDateString();
};

const RecruiterScannerPage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<RecruiterJobItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scanningJobId, setScanningJobId] = useState<string | null>(null);
  const [scanMessage, setScanMessage] = useState<string>("");

  useEffect(() => {
    const fetchJobs = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        setLoading(true);
        setError("");
        const res = await fetch(
          "http://localhost:5000/api/jobs/recruiter/list",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.message || "Failed to load job postings");
        }
        setJobs(data.jobs || []);
      } catch (err: any) {
        setError(err?.message || "Failed to load job postings");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [navigate]);

  const handleScan = async (jobId: string) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      setScanMessage("");
      setScanningJobId(jobId);
      const res = await fetch(`http://localhost:5000/api/ats/scan/${jobId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Failed to run ATS scan");
      }
      setScanMessage("ATS scan completed.");
    } catch (err: any) {
      setError(err?.message || "Failed to run ATS scan");
    } finally {
      setScanningJobId(null);
    }
  };

  return (
    <div className="recruiter-scanner-layout">
      <RecruiterSidebar />
      <main className="recruiter-scanner-main">
        <RecruiterTopBar />
        <div className="recruiter-scanner-content">
          <div className="recruiter-scanner-header">
            <div>
              <h1>ATS Resume Scanner</h1>
              <p>Scan and rank applicants for each job post.</p>
            </div>
          </div>

          {scanMessage && (
            <div className="recruiter-scanner-state success">
              {scanMessage}
            </div>
          )}
          {loading && <div className="recruiter-scanner-state">Loading...</div>}
          {error && !loading && (
            <div className="recruiter-scanner-state error">{error}</div>
          )}
          {!loading && !error && jobs.length === 0 && (
            <div className="recruiter-scanner-state">
              No job postings yet.
            </div>
          )}

          <div className="recruiter-scanner-grid">
            {jobs.map((job) => (
              <article key={job._id} className="recruiter-scanner-card">
                <div className="recruiter-scanner-card-header">
                  <h3>{job.jobTitle}</h3>
                  <span
                    className={`recruiter-scanner-badge ${
                      job.isActive ? "" : "closed"
                    }`}
                  >
                    {job.isActive ? "Open" : "Closed"}
                  </span>
                </div>
                <div className="recruiter-scanner-meta">
                  <span>{job.location}</span>
                  <span>{job.jobType}</span>
                  <span>Deadline: {formatDate(job.deadline)}</span>
                </div>
                <div className="recruiter-scanner-count">
                  Applicants: <strong>{job.applicantsCount}</strong>
                </div>
                <div className="recruiter-scanner-actions">
                  <button
                    className="recruiter-scanner-btn outline"
                    onClick={() => navigate(`/jobs/${job._id}`)}
                  >
                    View Job
                  </button>
                  <button
                    className="recruiter-scanner-btn"
                    onClick={() => handleScan(job._id)}
                    disabled={scanningJobId === job._id}
                  >
                    {scanningJobId === job._id ? "Scanning..." : "Run ATS"}
                  </button>
                  <button
                    className="recruiter-scanner-btn outline"
                    onClick={() =>
                      navigate(`/recruiter/scanner/${job._id}/ranking`)
                    }
                  >
                    View Ranking
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RecruiterScannerPage;
