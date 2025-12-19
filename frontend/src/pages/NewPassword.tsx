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

  // Get email and token from location state
  const email = location.state?.email || "";
  const resetToken = location.state?.token || "";
  const initialMessage = location.state?.message || "";

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
    if (
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(
        formData.password
      )
    ) {
      setStatusMessage(
        "Password must contain uppercase, lowercase, number, and special character"
      );
      setStatusType("error");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setStatusMessage("Passwords do not match");
      setStatusType("error");
      return;
    }

    if (!resetToken) {
      setStatusMessage("Invalid reset token. Please request a new reset link.");
      setStatusType("error");
      return;
    }

    setIsLoading(true);
    setStatusMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: resetToken,
          newPassword: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatusMessage(data.message || "Failed to reset password");
        setStatusType("error");
        setIsLoading(false);
        return;
      }

      // Password reset successful
      setStatusMessage(
        "Password has been reset successfully! Redirecting to login..."
      );
      setStatusType("success");

      // Clear form
      setFormData({
        password: "",
        confirmPassword: "",
      });

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login", {
          state: {
            message:
              "Password reset successful! You can now login with your new password.",
            verifiedSuccess: true,
          },
        });
      }, 500);
    } catch (error) {
      console.error("Error resetting password:", error);
      setStatusMessage("Something went wrong. Please try again.");
      setStatusType("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <section id="new-password-header" className="new-password-header-section">
        <div className="new-password-header-container">
          {/* Decorative Element Top Right */}
          <img
            src={decorRight}
            className="new-password-decor-right"
            alt="decoration"
          />

          {/* Header Content */}
          <div className="new-password-header-content">
            <h1 className="new-password-header-title">Reset Password</h1>
            <div className="new-password-header-subtitle-wrapper">
              <span className="new-password-header-subtitle">
                Set New Password
              </span>
            </div>
          </div>
        </div>
      </section>

      <section id="new-password-main" className="new-password-main-section">
        <div className="new-password-main-container">
          <div className="new-password-card">
            <div className="new-password-card-header">
              <h2 className="new-password-card-title">Set New Password</h2>
              <div className="new-password-separator">
                <div className="new-password-line-gray"></div>
                <div className="new-password-line-blue"></div>
              </div>
            </div>

            <p className="new-password-card-description">
              {email
                ? `Enter your new password for ${email}`
                : "Enter your new password"}
            </p>

            {/* Initial message from location state */}
            {initialMessage && !statusMessage && (
              <div className={`new-password-status-message success`}>
                {initialMessage}
              </div>
            )}

            {/* Status Message */}
            {statusMessage && (
              <div className={`new-password-status-message ${statusType}`}>
                {statusMessage}
              </div>
            )}

            <form className="new-password-form" onSubmit={handleSubmit}>
              <div className="new-password-input-group">
                <input
                  type="password"
                  name="password"
                  placeholder="New Password"
                  className="new-password-form-input"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="new-password-input-group">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm New Password"
                  className="new-password-form-input"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                className="new-password-btn-verify"
                disabled={isLoading}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>
            </form>

            <div className="new-password-card-footer">
              <Link to="/login" className="new-password-link-back">
                Back to Login Page
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default NewPassword;
