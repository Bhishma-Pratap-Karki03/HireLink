import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/Login.css";

import heroBg from "../images/Login Page Images/79ebd70f3f76eb214e5a23bbdf28aea8bc96647b.png";
import decorShape1 from "../images/Login Page Images/16_1331.svg";
import decorShape2 from "../images/Login Page Images/16_1338.svg";
import breadcrumbArrow from "../images/Login Page Images/16_1727.svg";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"success" | "error" | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVerificationLink, setShowVerificationLink] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState<string>("");
  const navigate = useNavigate();
  const location = useLocation();

  // Handle location state messages (e.g., from verification page)
  useEffect(() => {
    if (location.state?.message) {
      setStatusMessage(location.state.message);
      setStatusType(location.state.verifiedSuccess ? "success" : "error");

      // Clear location state to prevent showing message again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Reset verification link when user changes email
    if (name === "email") {
      setShowVerificationLink(false);
    }
  };

  const handleGoToVerification = () => {
    if (verificationEmail) {
      navigate("/verify-email", {
        state: {
          email: verificationEmail,
          message: "Please enter verification code sent to your email",
          fromLogin: true,
        },
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatusMessage(null);
    setStatusType(null);
    setIsSubmitting(true);

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setStatusMessage("Please enter a valid email address");
      setStatusType("error");
      setIsSubmitting(false);
      return;
    }

    // Password validation
    if (!formData.password.trim()) {
      setStatusMessage("Please enter your password");
      setStatusType("error");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If login failed because user is not verified
        if (data.requiresVerification) {
          setStatusMessage(data.message || "Please verify your email first.");
          setStatusType("error");
          setShowVerificationLink(true);
          setVerificationEmail(data.email || formData.email);
          setIsSubmitting(false);
          return;
        }

        console.error("Login failed:", data);
        setStatusMessage(data.message || "Login failed");
        setStatusType("error");
        setIsSubmitting(false);
        return;
      }

      // Login successful
      console.log("Login successful:", data);
      setStatusMessage("Login successful! Redirecting...");
      setStatusType("success");

      // Store token and user data in localStorage
      if (data.token) {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("userData", JSON.stringify(data.user));

        // Simple redirect based on user role
        setTimeout(() => {
          if (data.user.role === "recruiter") {
            window.location.href = "/recruiter-home";
          } else {
            window.location.href = "/candidate-home";
          }
        }, 2000);
      }
    } catch (error) {
      console.error("Error calling login API:", error);
      setStatusMessage("Something went wrong. Please try again.");
      setStatusType("error");
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />

      <section
        id="hero"
        className="hero-section"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="hero-background-decor">
          <img
            src={decorShape1}
            alt="decorative shape"
            className="decor-shape-1"
          />
          <img
            src={decorShape2}
            alt="decorative shape"
            className="decor-shape-2"
          />
        </div>

        <div className="hero-content">
          <h1>Login</h1>
          <p className="breadcrumbs">
            <Link to="/">Home</Link>
            <img src={breadcrumbArrow} alt="breadcrumb separator" />
            <span>Login</span>
          </p>
        </div>
      </section>

      <main id="login" className="login-section">
        <div className="login-container">
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-header">
              <h2>Login Now</h2>
              <div className="title-underline"></div>
            </div>
            <div className="form-inputs">
              <div className="form-group">
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Logging in..." : "Login Now"}
            </button>

            <div className="form-options">
              <Link to="/forgot-password" className="forgot-password">
                Forgot Password?
              </Link>
            </div>

            <p className="form-footer">
              Don&apos;t have an account? <Link to="/register">Register</Link>
            </p>

            {statusMessage && (
              <div>
                <p
                  className={`status-message ${
                    statusType === "success" ? "status-success" : "status-error"
                  }`}
                >
                  {statusMessage}
                </p>
                {showVerificationLink && verificationEmail && (
                  <div style={{ marginTop: "10px", textAlign: "center" }}>
                    <button
                      onClick={handleGoToVerification}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#0068ce",
                        textDecoration: "underline",
                        cursor: "pointer",
                        fontSize: "14px",
                        padding: "0",
                        fontFamily: "inherit",
                      }}
                    >
                      Go to Verification Page
                    </button>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Login;
