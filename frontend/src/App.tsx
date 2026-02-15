import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import VerificationPage from "./pages/VerificationPage";
import ForgotPassword from "./pages/ForgotPassword";
import NewPassword from "./pages/NewPassword";
import RecruiterHomePage from "./pages/recruiterpages/RecruiterHomePage";
import CandidateHomePage from "./pages/candidatepages/CandidateHomePage";
import AdminHomePage from "./pages/adminpages/AdminHomePage";
import CandidateProfilePage from "./pages/candidatepages/CandidateProfilePage";
import RecruiterDashboard from "./pages/recruiterpages/RecruiterDashboard";
import CandidateDashboard from "./pages/candidatepages/CandidateDashboard";
import SavedJobsPage from "./pages/candidatepages/SavedJobsPage";
import RecruiterProfilePage from "./pages/recruiterpages/RecruiterProfilePage";
import RecruiterJobPostPage from "./pages/recruiterpages/RecruiterJobPostPage";
import RecruiterJobPostingsListPage from "./pages/recruiterpages/RecruiterJobPostingsListPage";
import RecruiterJobApplicantsPage from "./pages/recruiterpages/RecruiterJobApplicantsPage";
import RecruiterScannerPage from "./pages/recruiterpages/RecruiterScannerPage";
import RecruiterAtsRankingPage from "./pages/recruiterpages/RecruiterAtsRankingPage";
import AdminProfilePage from "./pages/adminpages/AdminProfilePage";
import AdminDashboard from "./pages/adminpages/AdminDashboard";
import NotFoundPage from "./pages/NotFoundPage";
import EmployersPage from "./pages/EmployersPage";
import EmployerDetailsPage from "./pages/EmployerDetailsPage";
import JobListingPage from "./pages/JobListingPage";
import CandidatesPage from "./pages/CandidatesPage";
import CandidateDetailsPage from "./pages/CandidateDetailsPage";
import JobDetailsPage from "./pages/JobDetailsPage";
import AssessmentListingPage from "./pages/AssessmentListingPage";
import AssessmentAttemptPage from "./pages/AssessmentAttemptPage";
import AssessmentPreviewPage from "./pages/AssessmentPreviewPage";
import AdminAssessmentCreatePage from "./pages/adminpages/AdminAssessmentCreatePage";
import AdminAssessmentEditPage from "./pages/adminpages/AdminAssessmentEditPage";
import AdminAssessmentsPage from "./pages/adminpages/AdminAssessmentsPage";
import CandidateFriendRequestsPage from "./pages/candidatepages/CandidateFriendRequestsPage";
import RecruiterFriendRequestsPage from "./pages/recruiterpages/RecruiterFriendRequestsPage";
import CandidateMessagesPage from "./pages/candidatepages/CandidateMessagesPage";
import RecruiterMessagesPage from "./pages/recruiterpages/RecruiterMessagesPage";
import CandidateAppliedStatusPage from "./pages/candidatepages/CandidateAppliedStatusPage";
import CandidateSettingsPage from "./pages/candidatepages/CandidateSettingsPage";
import RecruiterSettingsPage from "./pages/recruiterpages/RecruiterSettingsPage";
import AdminSettingsPage from "./pages/adminpages/AdminSettingsPage";
import "./App.css";

// Protected Route Component
const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: JSX.Element;
  allowedRoles?: string[];
}) => {
  const token = localStorage.getItem("authToken");
  const userDataStr = localStorage.getItem("userData");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && userDataStr) {
    try {
      const userData = JSON.parse(userDataStr);

      // Check if admin email - SPECIAL CASE
      const isAdminEmail = userData.email === "hirelinknp@gmail.com";
      const userRole = isAdminEmail ? "admin" : userData.role;

      console.log("ProtectedRoute check:", {
        userRole,
        allowedRoles,
        isAdminEmail,
        userDataRole: userData.role,
      });

      if (!allowedRoles.includes(userRole)) {
        // Redirect based on role TO HOME PAGE
        if (isAdminEmail) {
          return <Navigate to="/admin-home" replace />;
        } else if (userData.role === "recruiter") {
          return <Navigate to="/recruiter-home" replace />;
        } else {
          return <Navigate to="/candidate-home" replace />;
        }
      }
    } catch (error) {
      console.error("Error in ProtectedRoute:", error);
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

// Public Route Component (for login/register when already authenticated)
const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem("authToken");
  const userDataStr = localStorage.getItem("userData");

  if (token && userDataStr) {
    try {
      const userData = JSON.parse(userDataStr);
      // Check if admin email
      const isAdminEmail = userData.email === "hirelinknp@gmail.com";

      if (isAdminEmail) {
        return <Navigate to="/admin-home" replace />;
      } else if (userData.role === "recruiter") {
        return <Navigate to="/recruiter-home" replace />;
      } else {
        return <Navigate to="/candidate-home" replace />;
      }
    } catch (error) {
      return children;
    }
  }

  return children;
};

// Root route handler
const RootRedirect = () => {
  const token = localStorage.getItem("authToken");
  const userDataStr = localStorage.getItem("userData");

  if (token && userDataStr) {
    try {
      const userData = JSON.parse(userDataStr);
      // Check if admin email
      const isAdminEmail = userData.email === "hirelinknp@gmail.com";

      if (isAdminEmail) {
        return <Navigate to="/admin-home" replace />;
      } else if (userData.role === "recruiter") {
        return <Navigate to="/recruiter-home" replace />;
      } else {
        return <Navigate to="/candidate-home" replace />;
      }
    } catch (error) {
      return <Navigate to="/login" replace />;
    }
  }

  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Root route - redirects based on authentication */}
        <Route path="/" element={<RootRedirect />} />

        {/* Public routes - redirect if already authenticated */}
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route path="/verify-email" element={<VerificationPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<NewPassword />} />

        {/* Employers Page - Public access */}
        <Route path="/employers" element={<EmployersPage />} />
        <Route path="/employer/:id" element={<EmployerDetailsPage />} />
        <Route path="/jobs" element={<JobListingPage />} />
        <Route path="/candidates" element={<CandidatesPage />} />
        <Route path="/candidate/:id" element={<CandidateDetailsPage />} />
        <Route path="/jobs/:id" element={<JobDetailsPage />} />
        <Route
          path="/assessments"
          element={
            <ProtectedRoute allowedRoles={["candidate"]}>
              <AssessmentListingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessments/:assessmentId/attempts/:attemptId"
          element={
            <ProtectedRoute allowedRoles={["candidate"]}>
              <AssessmentAttemptPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessments/:assessmentId/preview"
          element={
            <ProtectedRoute allowedRoles={["recruiter", "admin"]}>
              <AssessmentPreviewPage />
            </ProtectedRoute>
          }
        />

        {/* HOME PAGES - Where users land after login */}
        <Route
          path="/recruiter-home"
          element={
            <ProtectedRoute allowedRoles={["recruiter"]}>
              <RecruiterHomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate-home"
          element={
            <ProtectedRoute allowedRoles={["candidate"]}>
              <CandidateHomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-home"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminHomePage />
            </ProtectedRoute>
          }
        />

        {/* DASHBOARD PAGES - Separate from home pages */}
        <Route
          path="/recruiter-dashboard"
          element={
            <ProtectedRoute allowedRoles={["recruiter"]}>
              <RecruiterDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate-dashboard"
          element={
            <ProtectedRoute allowedRoles={["candidate"]}>
              <CandidateDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Profile pages */}
        <Route
          path="/candidate-profile"
          element={
            <ProtectedRoute allowedRoles={["candidate"]}>
              <CandidateProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recruiter-profile"
          element={
            <ProtectedRoute allowedRoles={["recruiter"]}>
              <RecruiterProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-profile"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminProfilePage />
            </ProtectedRoute>
          }
        />

        {/* ADMIN PAGES - Match the sidebar navigation paths */}
        <Route
          path="/admin/manage-users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <div style={{ padding: "20px" }}>
                <h1>Manage Users</h1>
                <p>User management page coming soon</p>
                <p>
                  This page will allow you to view, edit, and manage all users
                  in the system.
                </p>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/messages"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <div style={{ padding: "20px" }}>
                <h1>Messages</h1>
                <p>Messages page coming soon</p>
                <p>
                  This page will show all system messages and notifications.
                </p>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <div style={{ padding: "20px" }}>
                <h1>Reports</h1>
                <p>Reports page coming soon</p>
                <p>
                  This page will provide analytics and reports about platform
                  usage.
                </p>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminSettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Additional admin pages for consistency */}
        <Route
          path="/admin/jobs"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <div style={{ padding: "20px" }}>
                <h1>Manage Jobs</h1>
                <p>Job management page coming soon</p>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/assessments"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminAssessmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/assessments/create"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminAssessmentCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/assessments/:id/edit"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminAssessmentEditPage />
            </ProtectedRoute>
          }
        />

        {/* RECRUITER PAGES */}
        <Route
          path="/recruiter/post-job"
          element={
            <ProtectedRoute allowedRoles={["recruiter"]}>
              <RecruiterJobPostPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recruiter/candidates"
          element={
            <ProtectedRoute allowedRoles={["recruiter"]}>
              <div style={{ padding: "20px" }}>
                <h1>View Candidates</h1>
                <p>Candidates page coming soon</p>
              </div>
            </ProtectedRoute>
          }
        />
          <Route
            path="/recruiter/applications"
            element={
              <ProtectedRoute allowedRoles={["recruiter"]}>
                <div style={{ padding: "20px" }}>
                  <h1>Applications</h1>
                  <p>Applications page coming soon</p>
                </div>
              </ProtectedRoute>
            }
          />
        <Route
          path="/recruiter/saved-candidates"
          element={
            <ProtectedRoute allowedRoles={["recruiter"]}>
              <div style={{ padding: "20px" }}>
                <h1>Saved Candidates</h1>
                <p>Saved candidates page coming soon</p>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/recruiter/settings"
          element={
            <ProtectedRoute allowedRoles={["recruiter"]}>
              <RecruiterSettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recruiter/job-postings"
          element={
            <ProtectedRoute allowedRoles={["recruiter"]}>
              <RecruiterJobPostingsListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recruiter/job-postings/:id/edit"
          element={
            <ProtectedRoute allowedRoles={["recruiter"]}>
              <RecruiterJobPostPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recruiter/job-postings/:id/applicants"
          element={
            <ProtectedRoute allowedRoles={["recruiter"]}>
              <RecruiterJobApplicantsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recruiter/messages"
          element={
            <ProtectedRoute allowedRoles={["recruiter"]}>
              <RecruiterMessagesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recruiter/friend-requests"
          element={
            <ProtectedRoute allowedRoles={["recruiter"]}>
              <RecruiterFriendRequestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recruiter/scanner"
          element={
            <ProtectedRoute allowedRoles={["recruiter"]}>
              <RecruiterScannerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recruiter/scanner/:jobId/ranking"
          element={
            <ProtectedRoute allowedRoles={["recruiter"]}>
              <RecruiterAtsRankingPage />
            </ProtectedRoute>
          }
        />

        {/* CANDIDATE PAGES */}
        <Route
          path="/candidate/resume"
          element={
            <ProtectedRoute allowedRoles={["candidate"]}>
              <div style={{ padding: "20px" }}>
                <h1>Resume</h1>
                <p>Resume page coming soon</p>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/messages"
          element={
            <ProtectedRoute allowedRoles={["candidate"]}>
              <CandidateMessagesPage />
            </ProtectedRoute>
          }
        />
          <Route
            path="/candidate/job-alerts"
            element={
              <ProtectedRoute allowedRoles={["candidate"]}>
                <div style={{ padding: "20px" }}>
                  <h1>Job Alerts</h1>
                  <p>Job alerts page coming soon</p>
                </div>
              </ProtectedRoute>
            }
          />
        <Route
          path="/candidate/saved-jobs"
          element={
            <ProtectedRoute allowedRoles={["candidate"]}>
              <SavedJobsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/applied-status"
          element={
            <ProtectedRoute allowedRoles={["candidate"]}>
              <CandidateAppliedStatusPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/friend-requests"
          element={
            <ProtectedRoute allowedRoles={["candidate"]}>
              <CandidateFriendRequestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/settings"
          element={
            <ProtectedRoute allowedRoles={["candidate"]}>
              <CandidateSettingsPage />
            </ProtectedRoute>
          }
        />

        {/* 404 Not Found Page - Catch-all route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
