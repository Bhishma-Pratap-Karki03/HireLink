import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/Register.css";

// Import images
import heroBg from "../images/Register Page Images/79ebd70f3f76eb214e5a23bbdf28aea8bc96647b.png";
import shape1 from "../images/Register Page Images/1_2320.svg";
import shape2 from "../images/Register Page Images/1_2327.svg";
import shape3 from "../images/Register Page Images/1_2457.svg";
import shape4 from "../images/Register Page Images/1_2587.svg";
import arrowIcon from "../images/Register Page Images/1_2716.svg";
import candidateSelectedIcon from "../images/Register Page Images/Candidate Selected.png";
import candidateUnselectedIcon from "../images/Register Page Images/Candidate Unselected.png";
import recruiterSelectedIcon from "../images/Register Page Images/Recruiter Selected.png";
import recruiterUnselectedIcon from "../images/Register Page Images/Recruiter Unselected.png";

const Register = () => {
  const [userType, setUserType] = useState<"candidate" | "recruiter">(
    "candidate"
  );
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"success" | "error" | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationLink, setShowVerificationLink] = useState(false);
  const [existingUserEmail, setExistingUserEmail] = useState<string>("");
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Reset verification link when user changes email
    if (name === "email") {
      setShowVerificationLink(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isLoading) return;

    // Clear previous status
    setStatusMessage(null);
    setStatusType(null);
    setShowVerificationLink(false);

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setStatusMessage(
        "Please enter a valid email address (example@domain.com)"
      );
      setStatusType("error");
      return;
    }

    // Name validation
    if (formData.fullName.trim().length < 2) {
      setStatusMessage("Full name must be at least 2 characters long");
      setStatusType("error");
      return;
    }

    // Password length validation
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

    if (!formData.terms) {
      setStatusMessage("Please accept the terms and conditions");
      setStatusType("error");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          userType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If user exists but is verified
        if (data.isVerified) {
          setStatusMessage(
            data.message || "Email already verified. Please login."
          );
          setStatusType("error");
          setIsLoading(false);
          return;
        }

        // If user exists but not verified and has active code
        if (data.emailExists && data.hasActiveCode) {
          setStatusMessage(
            data.message ||
              "Email already registered but not verified. Please enter the verification code."
          );
          setStatusType("error");
          setShowVerificationLink(true);
          setExistingUserEmail(data.email);
          setIsLoading(false);
          return;
        }

        // If user exists, not verified, and code expired
        if (data.emailExists && data.codeExpired) {
          setStatusMessage(
            data.message || "Verification code expired. New code sent."
          );
          setStatusType("success");
          setShowVerificationLink(true);
          setExistingUserEmail(data.email);

          // Redirect to verification page after 3 seconds
          setTimeout(() => {
            navigate("/verify-email", {
              state: {
                email: data.email,
                message: data.message,
              },
            });
          }, 500);
          setIsLoading(false);
          return;
        }

        // If user exists and requires verification (new registration flow)
        if (data.requiresVerification) {
          setStatusMessage(
            data.message || "Please verify your email to continue"
          );
          setStatusType("success");

          // Redirect to verification page after 2 seconds
          setTimeout(() => {
            navigate("/verify-email", {
              state: {
                email: formData.email,
                message: data.message,
              },
            });
          }, 500);
          setIsLoading(false);
          return;
        }

        // Other errors
        setStatusMessage(data.message || "Registration failed");
        setStatusType("error");
        setIsLoading(false);
        return;
      }

      // Registration successful (new user)
      setStatusMessage(
        data.message ||
          "Registration successful! Redirecting to verification..."
      );
      setStatusType("success");

      // Clear the form
      setFormData({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        terms: false,
      });

      // Redirect to verification page after 2 seconds
      setTimeout(() => {
        navigate("/verify-email", {
          state: {
            email: formData.email,
            message: data.message,
          },
        });
      }, 500);
    } catch (error) {
      console.error("Error calling registration API:", error);
      setStatusMessage("Something went wrong. Please try again.");
      setStatusType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToVerification = () => {
    if (existingUserEmail) {
      navigate("/verify-email", {
        state: {
          email: existingUserEmail,
          message: "Please enter verification code sent to your email",
        },
      });
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
        <div className="hero-bg-overlay"></div>
        <div className="decorative-shapes">
          <img src={shape1} alt="decorative shape" className="shape shape-1" />
          <img src={shape2} alt="decorative shape" className="shape shape-2" />
          <img src={shape3} alt="decorative shape" className="shape shape-3" />
          <img src={shape4} alt="decorative shape" className="shape shape-4" />
        </div>
        <div className="container hero-content">
          <h1>Register</h1>
          <p className="breadcrumbs">
            <Link to="/">Home</Link>
            <img src={arrowIcon} alt="arrow icon" />
            <span>Register</span>
          </p>
        </div>
      </section>

      <section id="registration" className="registration-section">
        <div className="container">
          <div className="form-wrapper">
            <div className="form-header1">
              <h2>Register Now</h2>
              <div className="title-underline">
                <div className="title-underline-accent"></div>
              </div>
            </div>

            <div className="user-type-selector">
              <button
                className={`user-type-btn ${
                  userType === "candidate" ? "active" : ""
                }`}
                onClick={() => setUserType("candidate")}
                type="button"
              >
                <img
                  src={
                    userType === "candidate"
                      ? candidateSelectedIcon
                      : candidateUnselectedIcon
                  }
                  alt="Candidate"
                />
                Candidate
              </button>
              <button
                className={`user-type-btn ${
                  userType === "recruiter" ? "active" : ""
                }`}
                onClick={() => setUserType("recruiter")}
                type="button"
              >
                <img
                  src={
                    userType === "recruiter"
                      ? recruiterSelectedIcon
                      : recruiterUnselectedIcon
                  }
                  alt="Recruiter"
                />
                Recruiter
              </button>
            </div>

            <form className="registration-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>
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
              <div className="form-group">
                <input
                  type="password"
                  id="confirm-password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-check">
                <input
                  type="checkbox"
                  id="terms"
                  name="terms"
                  checked={formData.terms}
                  onChange={handleInputChange}
                  required
                />
                <label htmlFor="terms">
                  Accept our terms and conditions and privacy policy
                </label>
              </div>
              <button type="submit" className="btn-submit" disabled={isLoading}>
                {isLoading ? "Registering..." : "Register Now"}
              </button>
            </form>

            <div className="login-prompt-wrapper">
              <p className="login-prompt">
                Already have an account? <Link to="/login">Login</Link>
              </p>

              {statusMessage && (
                <div>
                  <p
                    className={`status-message ${
                      statusType === "success"
                        ? "status-success"
                        : "status-error"
                    }`}
                  >
                    {statusMessage}
                  </p>

                  {showVerificationLink && existingUserEmail && (
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
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Register;
