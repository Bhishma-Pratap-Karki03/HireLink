import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/ForgotPassword.css";

// Import images from Forgot Password Page Images folder
import decoShapeTopRight from "../images/Login Page Images/16_1331.svg";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error">("success");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!email.trim()) {
      setStatusMessage("Please enter your email address");
      setStatusType("error");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatusMessage("Please enter a valid email address");
      setStatusType("error");
      return;
    }

    setIsLoading(true);
    setStatusMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/password/request-reset",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (data.requiresVerification) {
          setStatusMessage(
            "Please verify your email first before resetting password."
          );
          setStatusType("error");
          setIsLoading(false);
          return;
        }

        setStatusMessage(data.message || "Failed to send reset code");
        setStatusType("error");
        setIsLoading(false);
        return;
      }

      // Success - redirect to verification page
      setStatusMessage(
        "Password reset code sent! Redirecting to verification..."
      );
      setStatusType("success");

      // Redirect to verification page after 2 seconds
      setTimeout(() => {
        navigate("/verify-email", {
          state: {
            email: email,
            message: "Please enter the password reset code sent to your email",
            isPasswordReset: true,
          },
        });
      }, 500);
    } catch (error) {
      console.error("Error requesting password reset:", error);
      setStatusMessage("Something went wrong. Please try again.");
      setStatusType("error");
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <section id="header-section" className="header-section">
        <div className="header-container">
          {/* Decorative Elements */}
          <img
            src={decoShapeTopRight}
            className="deco-shape-top-right"
            alt=""
          />

          {/* Main Title */}
          <div className="header-content">
            <h1>Forgot Password</h1>
          </div>
        </div>
      </section>

      <section id="content-section" className="content-section">
        <div className="card">
          <div className="card-content">
            {/* Form Header */}
            <div className="fp-form-header">
              <h2>Forgot Your Password</h2>
              <div className="separator-container">
                <div className="line-grey"></div>
                <div className="line-blue"></div>
              </div>
            </div>

            {/* Instruction */}
            <p className="instruction-text">
              Enter your Email to receive password reset code
            </p>

            {/* Status Message */}
            {statusMessage && (
              <div className={`status-message ${statusType}`}>
                {statusMessage}
              </div>
            )}

            {/* Form Elements */}
            <form className="verification-form" onSubmit={handleSubmit}>
              <div className="input-group">
                <input
                  type="email"
                  placeholder="Email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <button type="submit" className="btn-verify" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Code"}
              </button>
            </form>

            {/* Footer Link */}
            <div className="fp-form-footer">
              <Link to="/login" className="link-back">
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

export default ForgotPassword;
