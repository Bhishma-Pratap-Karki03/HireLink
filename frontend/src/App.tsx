import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import VerificationPage from "./pages/VerificationPage";
import ForgotPassword from "./pages/ForgotPassword";
import NewPassword from "./pages/NewPassword";
import RecruiterHomePage from "./pages/RecruiterHomePage";
import CandidateHomePage from "./pages/CandidateHomePage";
import AdminHomePage from "./pages/AdminHomePage";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email" element={<VerificationPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<NewPassword />} />
        <Route path="/recruiter-home" element={<RecruiterHomePage />} />
        <Route path="/candidate-home" element={<CandidateHomePage />} />
        <Route path="/admin-dashboard" element={<AdminHomePage />} />
      </Routes>
    </Router>
  );
}

export default App;
