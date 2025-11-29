import { useState } from "react";
import { Link } from "react-router-dom";
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
  // State to track which user type is selected: "candidate" or "recruiter"
  const [userType, setUserType] = useState<"candidate" | "recruiter">(
    "candidate"
  );
  // State to store form input values
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  // state to show success or error message after form submission
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"success" | "error" | null>(
    null
  );

  // Handle input changes for form fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value, //store checkbox as boolean
    }));
  };

  // handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Clear previous status
    setStatusMessage(null);
    setStatusType(null);

    // Basic client-side validation
    if (formData.password !== formData.confirmPassword) {
      console.error("Passwords do not match");
      setStatusMessage("Passwords do not match");
      setStatusType("error");
      return;
    }

    //check if terms are accepted
    if (!formData.terms) {
      console.error("Terms not accepted");
      setStatusMessage("Please accept the terms and conditions");
      setStatusType("error");
      return;
    }

    // log form submission data
    console.log("Form submitted (frontend):", {
      userType,
      fullName: formData.fullName,
      email: formData.email,
      terms: formData.terms,
    });

    try {
      //call backend API to register user
      const response = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          userType,
        }),
      });

      const data = await response.json();

      // handle error response from backend
      if (!response.ok) {
        console.error("Registration failed (frontend):", data);
        setStatusMessage(data.message || "Registration failed");
        setStatusType("error");
        return;
      }

      // Registration successful
      console.log("Registration successful (frontend):", data);
      setStatusMessage("Registration successful");
      setStatusType("success");

    
    } catch (error) {
      console.error("Error calling registration API (frontend):", error);
      setStatusMessage("Something went wrong. Please try again.");
      setStatusType("error");
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
            <div className="form-header">
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
              <button type="submit" className="btn-submit">
                Register Now
              </button>
            </form>

            <div className="login-prompt-wrapper">
              <p className="login-prompt">
                Already have an account? <Link to="/login">Login</Link>
              </p>
              {statusMessage && (
                <p
                  className={`status-message ${
                    statusType === "success" ? "status-success" : "status-error"
                  }`}
                >
                  {statusMessage}
                </p>
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
