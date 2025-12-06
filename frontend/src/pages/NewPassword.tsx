import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/NewPassword.css";

// Import images from Forget Password Page Images folder
import decorRight from "../images/Login Page Images/16_1331.svg";


const NewPassword = () => {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error">("success");
  const navigate = useNavigate();
  const location = useLocation();

  // Get email/token from location state (will come from reset password link)
  const email = location.state?.email || "";
  const resetToken = location.state?.token || "";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.password.trim()) {
      setStatusMessage("Please enter a new password");
      setStatusType("error");
      return;
    }

    if (!formData.confirmPassword.trim()) {
      setStatusMessage("Please confirm your password");
      setStatusType("error");
      return;
    }

    if (formData.password.length < 8) {
      setStatusMessage("Password must be at least 8 characters long");
      setStatusType("error");
      return;
    }

    // Password complexity validation
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
      setStatusMessage("Password must contain uppercase, lowercase, number, and special character");
      setStatusType("error");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setStatusMessage("Passwords do not match");
      setStatusType("error");
      return;
    }

    setIsLoading(true);
    setStatusMessage("");

    // For now, just show a success message
    // Later we'll implement actual backend API call
    setTimeout(() => {
      setStatusMessage("Password has been reset successfully! Redirecting to login...");
      setStatusType("success");
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login", {
          state: {
            message: "Password reset successful! You can now login with your new password.",
          },
        });
      }, 3000);
      
      setIsLoading(false);
    }, 1500);
  };

  return (
    <>
      <Navbar />
      
      <section id="section-header">
        <div className="header-container">
          {/* Decorative Element Top Right */}
          <img src={decorRight} className="decor-right" alt="decoration" />

          {/* Header Content */}
          <div className="header-content">
            <h1 className="header-title">Forget Password</h1>
            <div className="header-subtitle-wrapper">
              <span className="header-subtitle">New Password</span>
            </div>
          </div>

        </div>
      </section>
      
      <section id="section-main">
        <div className="main-container">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Forget Your Password</h2>
              <div className="separator">
                <div className="line-gray"></div>
                <div className="line-blue"></div>
              </div>
            </div>

            <p className="card-description">Enter your new password</p>

            {/* Status Message */}
            {statusMessage && (
              <div className={`status-message ${statusType}`}>
                {statusMessage}
              </div>
            )}

            <form className="reset-form" onSubmit={handleSubmit}>
              <div className="input-group">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  className="form-input"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="input-group">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  className="form-input"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <button 
                type="submit" 
                className="btn-verify"
                disabled={isLoading}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>
            </form>

            <div className="card-footer">
              <Link to="/login" className="link-back">Back to Login Page</Link>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </>
  );
};

export default NewPassword;