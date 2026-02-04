import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admincomponents/AdminSidebar";
import AdminTopBar from "../../components/admincomponents/AdminTopBar";
import "../../styles/AdminAssessmentsPage.css";
import editIcon from "../../images/Recruiter Profile Page Images/6_215.svg";
import deleteIcon from "../../images/Recruiter Profile Page Images/6_80.svg";

type AssessmentItem = {
  id: string;
  title: string;
  type: string;
  status: string;
  difficulty: string;
  maxAttempts: number;
  createdAt: string;
};

const AdminAssessmentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<AssessmentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AssessmentItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("http://localhost:5000/api/assessments");
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Failed to load assessments");
      }
      const mapped = (data.assessments || []).map((item: any) => ({
        id: item._id || item.id,
        title: item.title || "Untitled",
        type: item.type || "quiz",
        status: item.status || "inactive",
        difficulty: item.difficulty || "beginner",
        maxAttempts: item.maxAttempts || 0,
        createdAt: item.createdAt || "",
      }));
      setAssessments(mapped);
    } catch (err: any) {
      setError(err?.message || "Failed to load assessments");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (assessment: AssessmentItem) => {
    setDeleteTarget(assessment);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Please login to delete assessments.");
      setDeleteTarget(null);
      return;
    }

    try {
      setDeleting(true);
      const response = await fetch(
        `http://localhost:5000/api/assessments/${deleteTarget.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Failed to delete assessment");
      }
      setAssessments((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: any) {
      setError(err?.message || "Failed to delete assessment");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  return (
    <div className="admin-assessments-page-container">
      <div className="admin-assessments-layout">
        <AdminSidebar />
        <div className="admin-assessments-main-area">
          <div className="admin-assessments-topbar-wrapper">
            <AdminTopBar />
          </div>

          <div className="admin-assessments-scrollable-content">
            <div className="admin-assessments-content-wrapper">
              <div className="admin-assessments-page-header">
                <h1>Quiz / Assessment</h1>
                <p>Manage and create assessments for job applications.</p>
              </div>

              <div className="admin-assessments-card">
                <div>
                  <h2>Create Quiz/Assessment</h2>
                  <p>
                    Build a new assessment with quizzes, writing tasks, or
                    coding challenges for candidates.
                  </p>
                </div>
                <button
                  className="admin-assessments-primary"
                  onClick={() => navigate("/admin/assessments/create")}
                >
                  Create Quiz/Assessment
                </button>
              </div>

              <div className="admin-assessments-list-card">
                <div className="admin-assessments-list-header">
                  <h2>Created Assessments</h2>
                </div>
                {loading && (
                  <div className="admin-assessments-state">Loading...</div>
                )}
                {error && !loading && (
                  <div className="admin-assessments-state error">{error}</div>
                )}
                {!loading && !error && assessments.length === 0 && (
                  <div className="admin-assessments-state">
                    No assessments created yet.
                  </div>
                )}
                {!loading && !error && assessments.length > 0 && (
                  <div className="admin-assessments-table">
                    <div className="admin-assessments-table-head">
                      <span>Title</span>
                      <span>Type</span>
                      <span>Status</span>
                      <span>Difficulty</span>
                      <span>Attempts</span>
                      <span>Created</span>
                      <span>Actions</span>
                    </div>
                    {assessments.map((item) => (
                      <div
                        key={item.id}
                        className="admin-assessments-table-row"
                      >
                        <span>{item.title}</span>
                        <span className={`chip ${item.type}`}>{item.type}</span>
                        <span className={`chip ${item.status}`}>
                          {item.status}
                        </span>
                        <span>{item.difficulty}</span>
                        <span>{item.maxAttempts}</span>
                        <span>
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleDateString()
                            : "-"}
                        </span>
                        <div className="admin-assessments-actions">
                          <button
                            type="button"
                            className="admin-assessments-icon-btn"
                            aria-label="Edit assessment"
                            onClick={() =>
                              navigate(`/admin/assessments/${item.id}/edit`)
                            }
                          >
                            <img src={editIcon} alt="Edit" />
                          </button>
                          <button
                            type="button"
                            className="admin-assessments-icon-btn danger"
                            aria-label="Delete assessment"
                            onClick={() => handleDelete(item)}
                          >
                            <img src={deleteIcon} alt="Delete" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                            {deleteTarget && (
                <div className="admin-assessments-modal-overlay">
                  <div className="admin-assessments-modal">
                    <h3>Delete Assessment</h3>
                    <p>
                      Are you sure you want to delete
                      <strong> {deleteTarget.title}</strong>?
                      This action cannot be undone.
                    </p>
                    <div className="admin-assessments-modal-actions">
                      <button
                        className="admin-assessments-outline"
                        onClick={() => setDeleteTarget(null)}
                        disabled={deleting}
                      >
                        Cancel
                      </button>
                      <button
                        className="admin-assessments-danger"
                        onClick={confirmDelete}
                        disabled={deleting}
                      >
                        {deleting ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAssessmentsPage;
