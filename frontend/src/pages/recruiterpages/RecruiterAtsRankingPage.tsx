import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RecruiterSidebar from "../../components/recruitercomponents/RecruiterSidebar";
import RecruiterTopBar from "../../components/recruitercomponents/RecruiterTopBar";
import "../../styles/RecruiterAtsRankingPage.css";
import defaultAvatar from "../../images/Register Page Images/Default Profile.webp";

type CandidateInfo = {
  fullName: string;
  email: string;
  profilePicture?: string;
  currentJobTitle?: string;
};

type ReportItem = {
  _id: string;
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

const RecruiterAtsRankingPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobInfo | null>(null);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        const res = await fetch(
          `http://localhost:5000/api/ats/results/${jobId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.message || "Failed to load ATS results");
        }
        setJob(data.job || null);
        setReports(data.reports || []);
      } catch (err: any) {
        setError(err?.message || "Failed to load ATS results");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [jobId, navigate]);

  return (
    <div className="recruiter-ats-layout">
      <RecruiterSidebar />
      <main className="recruiter-ats-main">
        <RecruiterTopBar />
        <div className="recruiter-ats-content">
          <div className="recruiter-ats-header">
            <div>
              <h1>ATS Ranking</h1>
              {job && (
                <p>
                  {job.jobTitle} · {job.location} · {job.jobType}
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
          {error && !loading && (
            <div className="recruiter-ats-state error">{error}</div>
          )}
          {!loading && !error && reports.length === 0 && (
            <div className="recruiter-ats-state">
              Run ATS scan to see rankings.
            </div>
          )}

          <div className="recruiter-ats-list">
            {reports.map((report, index) => (
              <article key={report._id} className="recruiter-ats-card">
                <div className="recruiter-ats-rank">#{index + 1}</div>
                <div className="recruiter-ats-candidate">
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
                <div className="recruiter-ats-score">
                  <span>Score</span>
                  <strong>{report.score}</strong>
                </div>
                <div className="recruiter-ats-skills">
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
                    <p>
                      {report.experienceMatch ? "Matched" : "Not matched"}{" "}
                      {report.extracted?.experienceYears
                        ? `(${report.extracted.experienceYears} yrs)`
                        : ""}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RecruiterAtsRankingPage;
