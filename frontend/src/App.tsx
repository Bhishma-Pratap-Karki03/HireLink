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
import RecruiterProfilePage from "./pages/recruiterpages/RecruiterProfilePage";
import NotFoundPage from "./pages/NotFoundPage";
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
              <AdminHomePage />
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
              <div style={{ padding: "20px" }}>
                <h1>Admin Profile Page</h1>
                <p>This page is under construction</p>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Placeholder routes for recruiter pages */}
        <Route
          path="/recruiter/post-job"
          element={
            <ProtectedRoute allowedRoles={["recruiter"]}>
              <div style={{ padding: "20px" }}>
                <h1>Post Job</h1>
                <p>Post Job page coming soon</p>
              </div>
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
          path="/recruiter/saved"
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
              <div style={{ padding: "20px" }}>
                <h1>Settings</h1>
                <p>Settings page coming soon</p>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Placeholder routes for candidate pages */}
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
              <div style={{ padding: "20px" }}>
                <h1>Messages</h1>
                <p>Messages page coming soon</p>
              </div>
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
              <div style={{ padding: "20px" }}>
                <h1>Saved Jobs</h1>
                <p>Saved jobs page coming soon</p>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/settings"
          element={
            <ProtectedRoute allowedRoles={["candidate"]}>
              <div style={{ padding: "20px" }}>
                <h1>Settings</h1>
                <p>Settings page coming soon</p>
              </div>
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
