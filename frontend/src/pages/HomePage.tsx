import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ApplyJobModal from "../components/ApplyJobModal";
import "../styles/HomePage.css";

import heroBadgeIcon from "../images/Public Page/I1_1112_1_3587.svg";
import heroSearchIcon from "../images/Public Page/I1_1112_1_3605.svg";
import heroLocationIcon from "../images/Public Page/I1_1112_1_3613.svg";
import heroArrowIcon from "../images/Public Page/I1_1112_1_3609.svg";
import heroBannerImage from "../images/Public Page/df6dadf31abcddb06b9e43b983e0fa10840be3a5.png";
import heroSuccessIcon from "../images/Public Page/1_1389.svg";
import heroTickIcon from "../images/Public Page/1_1396.svg";
import deco1121 from "../images/Public Page/1_1121.svg";
import deco1123 from "../images/Public Page/1_1123.svg";
import deco1127 from "../images/Public Page/1_1127.svg";
import deco1133 from "../images/Public Page/1_1133.svg";
import deco1135 from "../images/Public Page/1_1135.svg";

import brandGoogle from "../images/Public Page/I1_1145_1_3394.svg";
import brandHubspot from "../images/Public Page/I1_1145_1_3402.svg";
import brandWalmart from "../images/Public Page/I1_1145_1_3411.svg";
import brandDropbox from "../images/Public Page/I1_1145_1_3415.svg";
import brandFedex from "../images/Public Page/88cd42897ec6c9a3efbf0f41524050c0dd108ebf.png";

import categoryMarketing from "../images/Public Page/marketing-communication.png";
import categoryContent from "../images/Public Page/content-writer.png";
import categoryDirector from "../images/Public Page/marketing-director.png";
import categoryAnalyst from "../images/Public Page/system-analyst.png";
import categoryDesigner from "../images/Public Page/84397fb1e92a63dd32c5e324976b6f30796a4c67.png";
import categoryResearch from "../images/Public Page/44a46996784858096d67c1cf420f0663f3061d67.png";
import categoryHr from "../images/Public Page/fe1002e1f9c3608b2807e60cfac5c7219920f6ea.png";

import tabHr from "../images/Public Page/f043860b13ecca37b379692e3809129f600ba882.png";
import tabMarketing from "../images/Public Page/f610f60369b488e13a110d3a9043a76f51b5561b.png";
import tabSecurity from "../images/Public Page/e8f8dcc0d0ba473ab42373a148581436fa2a6bc4.png";
import tabResearch from "../images/Public Page/47cc530256ce7afaa7bfcc868c8fbd41fc1da0a0.png";

import bookmarkIcon from "../images/Recruiter Job Post Page Images/bookmarkIcon.svg";
import shareIcon from "../images/Recruiter Job Post Page Images/shareFg.svg";
import workModeIcon from "../images/Job List Page Images/work-mode.svg";
import locationIcon from "../images/Job List Page Images/location.svg";
import jobTypeIcon from "../images/Job List Page Images/job-type.svg";

import featureImage from "../images/Public Page/882f75bf60f070197e88b2ba5cf872266e58743d.png";
import candidateA from "../images/Public Page/I1_1399_1_3526.svg";
import candidateB from "../images/Public Page/I1_1399_1_3531.svg";
import candidateC from "../images/Public Page/I1_1399_1_3536.svg";

import stepMainImage from "../images/Public Page/abc46da86de8d4960be05461c8c6828035ee2295.png";
import stepFloatImage from "../images/Public Page/ac01f05469ba2dfecedcce7f92baba3a733e0dab.png";

import testimonialProfile from "../images/Public Page/I1_1436_1_3463.svg";
import testimonialQuote from "../images/Public Page/9689df8a36e8caab95b1c040886bfd30cb55779e.png";
import testimonialBg1 from "../images/Public Page/I1_1436_1_3461.svg";
import testimonialBg2 from "../images/Public Page/I1_1436_1_3462.svg";
import testimonialStar from "../images/Public Page/I1_1436_1_3469.svg";

import checkIcon from "../images/Public Page/1_1463.svg";

type JobCard = {
  id: string;
  companyName: string;
  jobTitle: string;
  workMode: string;
  location: string;
  jobType: string;
  companyLogo?: string;
  assessmentRequired?: boolean;
};

type ApplyModalJob = {
  jobTitle: string;
  companyName: string;
  education?: string;
  experience?: string;
};

const HomePage = () => {
  const navigate = useNavigate();
  const [heroSearch, setHeroSearch] = useState("");
  const [heroLocation, setHeroLocation] = useState("");
  const [jobs, setJobs] = useState<JobCard[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState("");
  const [appliedJobs, setAppliedJobs] = useState<Record<string, boolean>>({});
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applyJobId, setApplyJobId] = useState<string | null>(null);
  const [applyJobDetails, setApplyJobDetails] = useState<ApplyModalJob | null>(
    null,
  );
  const [applyProfileResume, setApplyProfileResume] = useState<string>("");
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyMessage, setApplyMessage] = useState("");
  const [applyError, setApplyError] = useState("");
  const [useCustomResume, setUseCustomResume] = useState(false);
  const [customResumeFile, setCustomResumeFile] = useState<File | null>(null);
  const [applyNote, setApplyNote] = useState("");
  const [confirmRequirements, setConfirmRequirements] = useState(false);
  const [confirmResume, setConfirmResume] = useState(false);

  const userDataStr = localStorage.getItem("userData");
  let userRole: string | null = null;
  if (userDataStr) {
    try {
      const parsed = JSON.parse(userDataStr);
      const isAdminEmail = parsed?.email === "hirelinknp@gmail.com";
      userRole = isAdminEmail ? "admin" : parsed?.role || null;
    } catch {
      userRole = null;
    }
  }

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setJobsLoading(true);
        setJobsError("");
        const response = await fetch(
          "http://localhost:5000/api/jobs?sort=newest&page=1&limit=6",
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.message || "Failed to load jobs");
        }

        const mappedJobs = (data.jobs || []).map((job: any) => ({
          id: job.id || job._id,
          companyName: job.companyName || job.department || "Company",
          jobTitle: job.jobTitle || "Untitled Role",
          workMode: job.workMode ? job.workMode.replace("-", " ") : "Remote",
          location: job.location || "Location",
          jobType: job.jobType || "Full-Time",
          companyLogo: job.companyLogo || "",
          assessmentRequired: Boolean(job.assessmentRequired),
        }));

        setJobs(mappedJobs);
      } catch (err: any) {
        setJobsError(err?.message || "Failed to load jobs");
      } finally {
        setJobsLoading(false);
      }
    };

    loadJobs();
  }, []);

  useEffect(() => {
    const fetchAppliedStatuses = async () => {
      if (userRole !== "candidate" || jobs.length === 0) {
        setAppliedJobs({});
        return;
      }

      const token = localStorage.getItem("authToken");
      if (!token) {
        setAppliedJobs({});
        return;
      }

      try {
        const checks = await Promise.all(
          jobs.map(async (job) => {
            const response = await fetch(
              `http://localhost:5000/api/applications/status/${job.id}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              },
            );
            const data = await response.json();
            return [job.id, Boolean(data?.applied)] as const;
          }),
        );

        const map: Record<string, boolean> = {};
        checks.forEach(([jobId, applied]) => {
          map[jobId] = applied;
        });
        setAppliedJobs(map);
      } catch {
        setAppliedJobs({});
      }
    };

    fetchAppliedStatuses();
  }, [jobs, userRole]);

  const resolveLogo = (logo?: string) => {
    if (!logo) return tabHr;
    if (logo.startsWith("http")) return logo;
    return `http://localhost:5000${logo.startsWith("/") ? "" : "/"}${logo}`;
  };

  const formatWorkMode = (mode?: string) => {
    if (!mode) return "Remote";
    const normalized = mode.toLowerCase();
    if (normalized === "on-site" || normalized === "onsite") return "On-site";
    if (normalized === "hybrid") return "Hybrid";
    return "Remote";
  };

  const handleFindNow = () => {
    const params = new URLSearchParams();
    const search = heroSearch.trim();
    const location = heroLocation.trim();
    if (search) params.set("search", search);
    if (location) params.set("location", location);
    const query = params.toString();
    navigate(query ? `/jobs?${query}` : "/jobs");
  };

  const openApplyModal = async (jobId: string) => {
    if (userRole !== "candidate") return;
    setApplyMessage("");
    setApplyError("");
    setApplyModalOpen(true);
    setApplyJobId(jobId);
    setApplyJobDetails(null);
    setUseCustomResume(false);
    setCustomResumeFile(null);
    setApplyNote("");
    setConfirmRequirements(false);
    setConfirmResume(false);

    const token = localStorage.getItem("authToken");
    if (!token) {
      setApplyError("Please log in to apply.");
      return;
    }

    try {
      setApplyLoading(true);
      const [jobRes, profileRes] = await Promise.all([
        fetch(`http://localhost:5000/api/jobs/${jobId}`),
        fetch("http://localhost:5000/api/profile/me", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const jobData = await jobRes.json();
      const profileData = await profileRes.json();
      if (jobRes.ok) {
        setApplyJobDetails(jobData.job);
      }
      if (profileRes.ok) {
        setApplyProfileResume(profileData.user?.resume || "");
      }
    } catch {
      setApplyError("Unable to load application details.");
    } finally {
      setApplyLoading(false);
    }
  };

  const closeApplyModal = () => {
    setApplyModalOpen(false);
  };

  const handleConfirmApply = async () => {
    if (!confirmRequirements || !confirmResume) {
      setApplyError("Please confirm the requirements and resume review.");
      return;
    }
    if (!applyJobId) {
      setApplyError("Job ID missing.");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      setApplyError("Please log in to apply.");
      return;
    }

    setApplyError("");
    try {
      setApplyLoading(true);
      const formData = new FormData();
      formData.append("jobId", applyJobId);
      formData.append("message", applyNote || "");
      if (useCustomResume && customResumeFile) {
        formData.append("resume", customResumeFile);
      } else if (applyProfileResume) {
        formData.append("resumeUrl", applyProfileResume);
      }

      const response = await fetch("http://localhost:5000/api/applications/apply", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Failed to apply");
      }

      setApplyMessage("Application submitted. Recruiter will be notified.");
      setAppliedJobs((prev) => ({ ...prev, [applyJobId]: true }));
      setTimeout(() => {
        setApplyModalOpen(false);
      }, 1200);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to apply";
      setApplyError(message);
    } finally {
      setApplyLoading(false);
    }
  };

  return (
    <div className="home-page">
      <Navbar />

      <section id="hero">
        <div className="container hero-container">
          <div className="hero-content">
            <div className="badge">
              <img src={heroBadgeIcon} alt="icon" />
              <span>BEST JOBS PLACE</span>
            </div>
            <h1>The Easiest Way to Get Your New Job</h1>
            <p>
              Each month, more than 3 million job seekers turn to website in
              their search for work, making over 140,000 applications every
              single day
            </p>

            <div className="search-bar">
              <div className="search-input-group">
                <img src={heroSearchIcon} alt="search" />
                <input
                  type="text"
                  placeholder="Job title, Company...."
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                />
              </div>
              <div className="divider"></div>
              <div className="search-input-group">
                <img src={heroLocationIcon} alt="location" />
                <input
                  type="text"
                  placeholder="Location"
                  value={heroLocation}
                  onChange={(e) => setHeroLocation(e.target.value)}
                />
                <img src={heroArrowIcon} alt="arrow" className="arrow-icon" />
              </div>
              <button className="find-btn" onClick={handleFindNow}>
                Find now
              </button>
            </div>

            <p className="popular-searches">
              Popular Searches: Designer, Developer, Web, Engineer, Senior
            </p>
          </div>

          <div className="hero-image-wrapper">
            <div className="main-banner">
              <img src={heroBannerImage} alt="Hero Banner" />
            </div>

            <div className="overlay-card success-card">
              <img src={heroSuccessIcon} alt="Email" className="email-icon" />
              <div className="success-content">
                <div className="success-header">
                  <span>Congratulation!</span>
                  <div className="tick-circle">
                    <img src={heroTickIcon} alt="tick" />
                  </div>
                </div>
                <span className="success-msg">Your Application is Selected</span>
              </div>
            </div>

            <div className="deco-circle-1">
              <div style={{ position: "relative", width: "94px", height: "97px" }}>
                <img src={deco1121} style={{ position: "absolute", left: 11, top: 0 }} />
                <img src={deco1123} style={{ position: "absolute", left: 26, top: 14 }} />
              </div>
            </div>
            <div className="deco-docs">
              <div style={{ position: "relative", width: "84px", height: "79px" }}>
                <img src={deco1127} style={{ position: "absolute", left: 5, top: 8 }} />
                <img src={deco1133} style={{ position: "absolute", left: 14, top: 0 }} />
                <img src={deco1135} style={{ position: "absolute", left: 52, top: 0 }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="brands">
        <div className="container">
          <div className="brands-wrapper">
            <div className="brand-item">
              <img src={brandGoogle} alt="Google" />
            </div>
            <div className="brand-item">
              <img src={brandHubspot} alt="HubSpot" />
            </div>
            <div className="brand-item">
              <img src={brandWalmart} alt="Walmart" />
            </div>
            <div className="brand-item">
              <img src={brandDropbox} alt="Dropbox" />
            </div>
            <div className="brand-item">
              <img src={brandFedex} alt="FedEx" />
            </div>
          </div>
        </div>
      </section>

      <section id="categories">
        <div className="container">
          <div className="categories-header">
            <h2 className="section-title">Browse by category</h2>
            <p className="section-subtitle">
              Find the type of work you need, clearly defined and ready to
              start. Work begins as soon as you purchase and provide
              requirements.
            </p>
          </div>

          <div className="categories-grid">
            <div className="category-card">
              <div className="cat-icon">
                <img src={categoryMarketing} alt="Marketing" />
              </div>
              <h3>
                Marketing &<br />
                Communication
              </h3>
              <span className="vacancy">156 Available Vacancy</span>
            </div>

            <div className="category-card">
              <div className="cat-icon">
                <img src={categoryContent} alt="Content Writer" />
              </div>
              <h3>
                Content
                <br />
                Writer
              </h3>
              <span className="vacancy">268 Available Vacancy</span>
            </div>

            <div className="category-card">
              <div className="cat-icon">
                <img src={categoryDirector} alt="Marketing Director" />
              </div>
              <h3>
                Marketing
                <br />
                Director
              </h3>
              <span className="vacancy">145 Available Vacancy</span>
            </div>

            <div className="category-card">
              <div className="cat-icon">
                <img src={categoryAnalyst} alt="System Analyst" />
              </div>
              <h3>
                System
                <br />
                Analyst
              </h3>
              <span className="vacancy">236 Available Vacancy</span>
            </div>

            <div className="category-card">
              <div className="cat-icon">
                <img src={categoryDesigner} alt="Digital Designer" />
              </div>
              <h3>
                Digital
                <br />
                Designer
              </h3>
              <span className="vacancy">56 Available Vacancy</span>
            </div>

            <div className="category-card">
              <div className="cat-icon">
                <img src={categoryResearch} alt="Market Research" />
              </div>
              <h3>
                Market
                <br />
                Research
              </h3>
              <span className="vacancy">168 Available Vacancy</span>
            </div>

            <div className="category-card">
              <div className="cat-icon">
                <img src={categoryHr} alt="Human Resource" />
              </div>
              <h3>
                Human
                <br />
                Resource
              </h3>
              <span className="vacancy">628 Available Vacancy</span>
            </div>

            <div className="category-card cta-card">
              <div className="cta-content">
                <h3>18,265 +</h3>
                <p>jobs are waiting for you</p>
                <button className="explore-btn">Explore more</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="jobs">
        <div className="container">
          <div className="jobs-header">
            <div className="jobs-title">
              <h2 className="section-title">Jobs of the day</h2>
              <div className="jobs-count">
                <span>{jobs.length}+ Jobs Posted Today</span>
              </div>
            </div>
            <div className="jobs-tabs">
              <div className="tab active">
                <img src={tabHr} alt="HR" />
                <span>Human Resource</span>
              </div>
              <div className="tab">
                <img src={tabMarketing} alt="Marketing" />
                <span>Marketing & Sales</span>
              </div>
              <div className="tab">
                <img src={tabSecurity} alt="Security" />
                <span>Security Analyst</span>
              </div>
              <div className="tab">
                <img src={tabResearch} alt="Research" />
                <span>Market Research</span>
              </div>
            </div>
          </div>

          {jobsError && <div className="home-jobs-error">{jobsError}</div>}
          {jobsLoading && <div className="home-jobs-loading">Loading jobs...</div>}

          {!jobsLoading && !jobsError && (
            <div className="home-jobs-grid">
              {jobs.map((job) => (
                <article key={job.id} className="joblist-card-item">
                  <div className="joblist-card-top">
                    <img
                      src={resolveLogo(job.companyLogo)}
                      alt={job.companyName}
                      className="joblist-company-logo"
                    />
                    <div className="joblist-card-actions">
                      <button className="joblist-icon-btn">
                        <img src={bookmarkIcon} alt="Save" />
                      </button>
                      <button className="joblist-icon-btn">
                        <img src={shareIcon} alt="Share" />
                      </button>
                    </div>
                  </div>
                  <div className="joblist-card-company">{job.companyName}</div>
                  <div className="joblist-card-meta">
                    <img src={workModeIcon} alt="Work mode" />
                    {formatWorkMode(job.workMode)}
                  </div>
                  <h3 className="joblist-card-title">{job.jobTitle}</h3>
                  <div className="joblist-card-info">
                    <span>
                      <img src={locationIcon} alt="Location" />
                      {job.location}
                    </span>
                    <span>
                      <img src={jobTypeIcon} alt="Job type" />
                      {job.jobType}
                    </span>
                  </div>
                  <div className="joblist-card-buttons">
                    <button
                      className="joblist-btn-outline"
                      onClick={() => navigate(`/jobs/${job.id}`)}
                    >
                      View Details
                    </button>
                    {userRole === "candidate" && (
                      <button
                        className={`joblist-btn-primary${
                          appliedJobs[job.id] ? " joblist-btn-applied" : ""
                        }`}
                        disabled={Boolean(appliedJobs[job.id])}
                        onClick={() => {
                          if (job.assessmentRequired) {
                            navigate(`/jobs/${job.id}`);
                            return;
                          }
                          openApplyModal(job.id);
                        }}
                      >
                        {appliedJobs[job.id] ? "Applied" : "Apply Now"}
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <ApplyJobModal
        isOpen={applyModalOpen}
        loading={applyLoading}
        job={applyJobDetails}
        profileResume={applyProfileResume}
        useCustomResume={useCustomResume}
        customResumeFile={customResumeFile}
        applyNote={applyNote}
        confirmRequirements={confirmRequirements}
        confirmResume={confirmResume}
        applyError={applyError}
        applyMessage={applyMessage}
        onClose={closeApplyModal}
        onConfirm={handleConfirmApply}
        onUseCustomResumeChange={setUseCustomResume}
        onCustomResumeChange={setCustomResumeFile}
        onApplyNoteChange={setApplyNote}
        onConfirmRequirementsChange={setConfirmRequirements}
        onConfirmResumeChange={setConfirmResume}
      />

      <section id="feature">
        <div className="container feature-container">
          <div className="feature-text">
            <h2 className="section-title">
              The #1 Job Board for
              <br />
              Graphic Design Jobs
            </h2>
            <p className="section-subtitle">
              Search and connect with the right candidates faster. This talent
              seach gives you the opportunity to find candidates who may be a
              perfect fit for your role
            </p>

            <div className="feature-actions">
              <button className="post-job-btn">Post a job Now</button>
              <a href="#" className="learn-more">
                Learn more
              </a>
            </div>
          </div>

          <div className="feature-image">
            <div className="image-bg">
              <img src={featureImage} alt="Feature Image" />
            </div>
            <div className="candidates-card">
              <div className="card-header">Top Candidates</div>
              <div className="candidate-list">
                <div className="candidate-item">
                  <img src={candidateA} alt="User" />
                  <div>
                    <h4>Sushant Pradhan</h4>
                    <span>UI/UX Designer</span>
                  </div>
                </div>
                <div className="candidate-item">
                  <img src={candidateB} alt="User" />
                  <div>
                    <h4>John Lennon</h4>
                    <span>Senior Art Director</span>
                  </div>
                </div>
                <div className="candidate-item">
                  <img src={candidateC} alt="User" />
                  <div>
                    <h4>Nadine Coyle</h4>
                    <span>Photographer</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="steps">
        <div className="container steps-container">
          <div className="steps-content">
            <h2 className="section-title">
              Follow ours steps
              <br />
              We will help you
            </h2>

            <div className="steps-list">
              <div className="step-line"></div>

              <div className="step-item">
                <div className="step-number" style={{ background: "#73b5e8" }}>
                  01
                </div>
                <div className="step-text">
                  <h3>Register Your Account</h3>
                  <p>
                    You need to create an account to find the best and preferred
                    job.
                  </p>
                </div>
              </div>

              <div className="step-item">
                <div className="step-number" style={{ background: "#edc882" }}>
                  02
                </div>
                <div className="step-text">
                  <h3>Search Your Job</h3>
                  <p>After creating an account, search for you favorite job</p>
                </div>
              </div>

              <div className="step-item">
                <div className="step-number" style={{ background: "#d1a8d7" }}>
                  03
                </div>
                <div className="step-text">
                  <h3>Apply For Dream Job</h3>
                  <p>
                    After creating the account, you have to apply for the desired
                    job.
                  </p>
                </div>
              </div>

              <div className="step-item">
                <div className="step-number" style={{ background: "#7ce2c7" }}>
                  04
                </div>
                <div className="step-text">
                  <h3>Upload Your Resume</h3>
                  <p>
                    Upload your resume after filling all relevant information.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="steps-image">
            <div className="image-wrapper">
              <img src={stepMainImage} alt="Steps Illustration" />
              <img src={stepFloatImage} className="floating-img img-1" alt="" />
              <img src={stepFloatImage} className="floating-img img-2" alt="" />
            </div>
          </div>
        </div>
      </section>

      <section id="testimonial">
        <div className="container testimonial-content">
          <div className="testimonial-heading">
            <div className="client-label">CLIENTS</div>
            <h2 className="section-title">Testimonial</h2>
          </div>

          <div className="testimonial-copy">
            <img src={testimonialQuote} alt="quote" className="quote-icon" />
            <p>
              This platform has completely transformed the way we manage our
              daily tasks. The interface is intuitive and user-friendly, making
              it easy for our team to adapt quickly. Overall, a fantastic
              experience so far!
            </p>
          </div>

          <div className="testimonial-author">
            <div className="author-avatar-wrap">
              <img src={testimonialProfile} alt="Jennifer Williams" />
            </div>
            <div className="author-meta">
              <h3>Jennifer Williams</h3>
              <p>Corporate Founder</p>
              <div className="stars">
                <img src={testimonialStar} alt="star" />
                <img src={testimonialStar} alt="star" />
                <img src={testimonialStar} alt="star" />
                <img src={testimonialStar} alt="star" />
                <img src={testimonialStar} alt="star" />
              </div>
            </div>
          </div>
        </div>
        <img src={testimonialBg1} className="bg-vector-1" />
        <img src={testimonialBg2} className="bg-vector-2" />
      </section>

      <section id="pricing">
        <div className="container">
          <div className="pricing-header">
            <h2 className="section-title">Simple, Transparent Pricing</h2>
            <p className="section-subtitle">
              Our pricing is completely transparent with no hidden fees. You
              always know exactly what you&apos;re paying for. We offer flexible
              options that fit every budget.
            </p>

            <div className="pricing-toggle">
              <span className="toggle-opt active">Candidates</span>
              <span className="toggle-opt">Recruiters</span>
            </div>
          </div>

          <div className="pricing-cards">
            <div className="price-card">
              <div className="price-amount">
                <span className="amount">$80</span>
                <span className="period">/month</span>
              </div>
              <div className="yearly-price">
                <span className="amount-sm">$280</span>
                <span className="period-sm">/yearly</span>
              </div>
              <h3>Base</h3>
              <p className="plan-desc">
                For most business that want to otpimize web queries
              </p>
              <ul className="features">
                <li>
                  <img src={checkIcon} /> All limited links
                </li>
                <li>
                  <img src={checkIcon} /> Own analytics platform
                </li>
                <li>
                  <img src={checkIcon} /> Chat support
                </li>
                <li>
                  <img src={checkIcon} /> Optimize hashtags
                </li>
                <li>
                  <img src={checkIcon} /> Unlimited users
                </li>
              </ul>
              <button className="plan-btn">Choose Plan</button>
            </div>

            <div className="price-card featured">
              <div className="price-amount">
                <span className="amount">$80</span>
                <span className="period">/month</span>
              </div>
              <div className="yearly-price">
                <span className="amount-sm">$280</span>
                <span className="period-sm">/yearly</span>
              </div>
              <h3>Pro</h3>
              <p className="plan-desc">
                For most business that want to otpimize web queries
              </p>
              <ul className="features">
                <li>
                  <img src={checkIcon} /> All limited links
                </li>
                <li>
                  <img src={checkIcon} /> Own analytics platform
                </li>
                <li>
                  <img src={checkIcon} /> Chat support
                </li>
                <li>
                  <img src={checkIcon} /> Optimize hashtags
                </li>
                <li>
                  <img src={checkIcon} /> Unlimited users
                </li>
              </ul>
              <button className="plan-btn">Choose Plan</button>
            </div>

            <div className="price-card">
              <div className="price-amount">
                <span className="amount">$260</span>
                <span className="period">/month</span>
              </div>
              <div className="yearly-price">
                <span className="amount-sm">$1180</span>
                <span className="period-sm">/yearly</span>
              </div>
              <h3>Enterprise</h3>
              <p className="plan-desc">
                For most business that want to otpimize web queries
              </p>
              <ul className="features">
                <li>
                  <img src={checkIcon} /> All limited links
                </li>
                <li>
                  <img src={checkIcon} /> Own analytics platform
                </li>
                <li>
                  <img src={checkIcon} /> Chat support
                </li>
                <li>
                  <img src={checkIcon} /> Optimize hashtags
                </li>
                <li>
                  <img src={checkIcon} /> Unlimited users
                </li>
              </ul>
              <button className="plan-btn">Choose Plan</button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
