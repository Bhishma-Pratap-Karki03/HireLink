import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/JobListingPage.css";

// TODO: Replace with actual files in Job List Page Images folder
import heroBg from "../images/Job List Page Images/hero-bg.svg";
import searchIcon from "../images/Job List Page Images/search.svg";
import locationIcon from "../images/Job List Page Images/location.svg";
import categoryIcon from "../images/Job List Page Images/category.svg";
import jobTypeIcon from "../images/Job List Page Images/job-type.svg";
import salaryIcon from "../images/Job List Page Images/salary.svg";
import levelIcon from "../images/Job List Page Images/level.svg";
import workModeIcon from "../images/Job List Page Images/work-mode.svg";
import educationIcon from "../images/Job List Page Images/education.svg";
import experienceIcon from "../images/Job List Page Images/experience.svg";
import skillIcon from "../images/Job List Page Images/skills.svg";
import promoIllustration from "../images/Job List Page Images/promo-illustration.svg";
import bookmarkIcon from "../images/Recruiter Job Post Page Images/bookmarkIcon.svg";
import shareIcon from "../images/Recruiter Job Post Page Images/shareFg.svg";
import closeIcon from "../images/Candidate Profile Page Images/corss icon.png";
import companyLogo from "../images/Recruiter Job Post Page Images/companyLogo.png";
import prevIcon from "../images/Employers Page Images/Prev Icon.svg";
import nextIcon from "../images/Employers Page Images/Next Icon.svg";
import minusIcon from "../images/Employers Page Images/minus.png";
import plusIcon from "../images/Employers Page Images/expand.png";
import brandSamsung from "../images/Job List Page Images/brand-samsung.svg";
import brandGoogle from "../images/Job List Page Images/brand-google.svg";
import brandFacebook from "../images/Job List Page Images/brand-facebook.svg";
import brandPinterest from "../images/Job List Page Images/brand-pinterest.svg";
import brandAvaya from "../images/Job List Page Images/brand-avaya.svg";
import brandAvis from "../images/Job List Page Images/brand-avis.svg";
import brandNielsen from "../images/Job List Page Images/brand-nielsen.svg";
import brandDoordash from "../images/Job List Page Images/brand-doordash.svg";

type JobCard = {
  id: string;
  companyName: string;
  jobTitle: string;
  workMode: string;
  location: string;
  jobType: string;
  companyLogo?: string;
};

type AppliedFilters = {
  search: string;
  location: string;
  department: string;
  workMode: string[];
  jobType: string[];
  jobLevel: string[];
  experience: string;
  education: string;
  skills: string;
  currency: string;
  salaryFrom: string;
  salaryTo: string;
};

const JobListingPage = () => {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState("newest");
  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const limit = 20;
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterWorkMode, setFilterWorkMode] = useState({
    remote: false,
    "on-site": false,
    hybrid: false,
  });
  const [filterJobType, setFilterJobType] = useState({
    "Full Time": false,
    "Part Time": false,
    Contract: false,
    Internship: false,
  });
  const [filterJobLevel, setFilterJobLevel] = useState({
    Junior: false,
    Mid: false,
    Senior: false,
    Lead: false,
  });
  const [filterExperience, setFilterExperience] = useState("");
  const [filterEducation, setFilterEducation] = useState("");
  const [filterSkills, setFilterSkills] = useState("");
  const [filterCurrency, setFilterCurrency] = useState("");
  const [filterSalaryFrom, setFilterSalaryFrom] = useState("");
  const [filterSalaryTo, setFilterSalaryTo] = useState("");
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>({
    search: "",
    location: "",
    department: "",
    workMode: [],
    jobType: [],
    jobLevel: [],
    experience: "",
    education: "",
    skills: "",
    currency: "",
    salaryFrom: "",
    salaryTo: "",
  });
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applyJobId, setApplyJobId] = useState<string | null>(null);
  const [applyJobDetails, setApplyJobDetails] = useState<any>(null);
  const [applyProfileResume, setApplyProfileResume] = useState<string>("");
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyMessage, setApplyMessage] = useState("");
  const [applyError, setApplyError] = useState("");
  const [useCustomResume, setUseCustomResume] = useState(false);
  const [customResumeFile, setCustomResumeFile] = useState<File | null>(null);
  const [applyNote, setApplyNote] = useState("");
  const [confirmRequirements, setConfirmRequirements] = useState(false);
  const [confirmResume, setConfirmResume] = useState(false);

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      ["clean"],
    ],
  };
  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "list",
    "bullet",
    "link",
  ];

  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    location: false,
    department: false,
    workMode: false,
    jobType: false,
    jobLevel: false,
    experience: false,
    education: false,
    skills: false,
    salaryRange: false,
  });

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

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    params.set("sort", sortBy);
    params.set("page", String(page));
    params.set("limit", String(limit));

    if (appliedFilters.search) params.set("search", appliedFilters.search);
    if (appliedFilters.location)
      params.set("location", appliedFilters.location);
    if (appliedFilters.department)
      params.set("department", appliedFilters.department);
    if (appliedFilters.workMode.length > 0) {
      params.set("workMode", appliedFilters.workMode.join(","));
    }
    if (appliedFilters.jobType.length > 0) {
      params.set("jobType", appliedFilters.jobType.join(","));
    }
    if (appliedFilters.jobLevel.length > 0) {
      params.set("jobLevel", appliedFilters.jobLevel.join(","));
    }
    if (appliedFilters.experience)
      params.set("experience", appliedFilters.experience);
    if (appliedFilters.education)
      params.set("education", appliedFilters.education);
    if (appliedFilters.skills) params.set("skills", appliedFilters.skills);
    if (appliedFilters.currency)
      params.set("currency", appliedFilters.currency);
    if (appliedFilters.salaryFrom)
      params.set("salaryFrom", appliedFilters.salaryFrom);
    if (appliedFilters.salaryTo)
      params.set("salaryTo", appliedFilters.salaryTo);

    return params.toString();
  };

  const applyFilters = (override?: Partial<AppliedFilters>) => {
    const workModeSelected = Object.entries(filterWorkMode)
      .filter(([, selected]) => selected)
      .map(([value]) => value);
    const jobTypeSelected = Object.entries(filterJobType)
      .filter(([, selected]) => selected)
      .map(([value]) => value);
    const jobLevelSelected = Object.entries(filterJobLevel)
      .filter(([, selected]) => selected)
      .map(([value]) => value);

    setAppliedFilters({
      search: searchTerm.trim(),
      location: filterLocation.trim(),
      department: filterDepartment.trim(),
      workMode: workModeSelected,
      jobType: jobTypeSelected,
      jobLevel: jobLevelSelected,
      experience: filterExperience.trim(),
      education: filterEducation.trim(),
      skills: filterSkills.trim(),
      currency: filterCurrency,
      salaryFrom: filterSalaryFrom.trim(),
      salaryTo: filterSalaryTo.trim(),
      ...override,
    });
    setPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterLocation("");
    setFilterDepartment("");
    setFilterWorkMode({
      remote: false,
      "on-site": false,
      hybrid: false,
    });
    setFilterJobType({
      "Full Time": false,
      "Part Time": false,
      Contract: false,
      Internship: false,
    });
    setFilterJobLevel({
      Junior: false,
      Mid: false,
      Senior: false,
      Lead: false,
    });
    setFilterExperience("");
    setFilterEducation("");
    setFilterSkills("");
    setFilterCurrency("");
    setFilterSalaryFrom("");
    setFilterSalaryTo("");
    setAppliedFilters({
      search: "",
      location: "",
      department: "",
      workMode: [],
      jobType: [],
      jobLevel: [],
      experience: "",
      education: "",
      skills: "",
      currency: "",
      salaryFrom: "",
      salaryTo: "",
    });
    setPage(1);
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(
          `http://localhost:5000/api/jobs?${buildQueryParams()}`,
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.message || "Failed to load job posts");
        }

        const mappedJobs = (data.jobs || []).map((job: any) => ({
          id: job.id || job._id,
          companyName: job.companyName || job.department || "Company",
          jobTitle: job.jobTitle || "Untitled Role",
          workMode: job.workMode ? job.workMode.replace("-", " ") : "Remote",
          location: job.location || "Location",
          jobType: job.jobType || "Full-Time",
          companyLogo: job.companyLogo || "",
        }));

        setJobCards(mappedJobs);
        setTotalJobs(data.total || 0);
      } catch (err: any) {
        setError(err?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [sortBy, page, appliedFilters]);

  const startIndex = totalJobs > 0 ? (page - 1) * limit + 1 : 0;
  const endIndex = totalJobs > 0 ? (page - 1) * limit + jobCards.length : 0;
  const totalPages = Math.max(Math.ceil(totalJobs / limit), 1);
  const visiblePages = Array.from(
    { length: Math.min(totalPages, 7) },
    (_, index) => index + 1,
  );

  const resolveLogo = (logo?: string) => {
    if (!logo) return images.companyLogo;
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

  const images = {
    heroBg,
    searchIcon,
    locationIcon,
    categoryIcon,
    jobTypeIcon,
    salaryIcon,
    levelIcon,
    workModeIcon,
    educationIcon,
    experienceIcon,
    skillIcon,
    promoIllustration,
    bookmarkIcon,
    shareIcon,
    companyLogo,
    brandSamsung,
    brandGoogle,
    brandFacebook,
    brandPinterest,
    brandAvaya,
    brandAvis,
    brandNielsen,
    brandDoordash,
    prevIcon,
    nextIcon,
    minusIcon,
    plusIcon,
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
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
    } catch (err) {
      setApplyError("Unable to load application details.");
    } finally {
      setApplyLoading(false);
    }
  };

  const closeApplyModal = () => {
    setApplyModalOpen(false);
  };

  const handleConfirmApply = () => {
    if (!confirmRequirements || !confirmResume) {
      setApplyError("Please confirm the requirements and resume review.");
      return;
    }
    setApplyError("");
    setApplyMessage("Application submitted. Recruiter will be notified.");
    setTimeout(() => {
      setApplyModalOpen(false);
    }, 1200);
  };

  return (
    <div className="joblist-page">
      <Navbar />

      <section className="joblist-hero">
        <div className="joblist-hero-inner">
          <div className="joblist-hero-text">
            <h1>There Are {totalJobs.toLocaleString()} Jobs Here For you!</h1>
            <p>Discover your next career move, freelance gig, or internship</p>
          </div>
          <div className="joblist-breadcrumb">Home / Jobs Listing</div>
        </div>
        <div className="joblist-hero-search">
          <div className="joblist-search-pill">
            <div className="joblist-search-field">
              <img src={images.searchIcon} alt="Search" />
              <input
                type="text"
                placeholder="Search company or job title"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    applyFilters();
                  }
                }}
              />
            </div>
            <button
              className="joblist-search-btn"
              onClick={() => applyFilters()}
            >
              Search
            </button>
          </div>
        </div>
      </section>

      <section className="joblist-content">
        <div className="joblist-layout">
          <aside className="joblist-sidebar">
            <div className="joblist-card joblist-filter-group">
              <div className="joblist-filter-header">
                <span>Location</span>
                <button
                  className="joblist-toggle-icon"
                  onClick={() => toggleSection("location")}
                  aria-label={expandedSections.location ? "Collapse" : "Expand"}
                >
                  <img
                    src={
                      expandedSections.location
                        ? images.minusIcon
                        : images.plusIcon
                    }
                    alt={expandedSections.location ? "Collapse" : "Expand"}
                  />
                </button>
              </div>
              {expandedSections.location && (
                <div className="joblist-input-row">
                  <img src={images.locationIcon} alt="Location" />
                  <input
                    type="text"
                    placeholder="City or country"
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="joblist-divider"></div>

            <div className="joblist-card joblist-filter-group">
              <div className="joblist-filter-header">
                <span>Department</span>
                <button
                  className="joblist-toggle-icon"
                  onClick={() => toggleSection("department")}
                  aria-label={
                    expandedSections.department ? "Collapse" : "Expand"
                  }
                >
                  <img
                    src={
                      expandedSections.department
                        ? images.minusIcon
                        : images.plusIcon
                    }
                    alt={expandedSections.department ? "Collapse" : "Expand"}
                  />
                </button>
              </div>
              {expandedSections.department && (
                <div className="joblist-input-row">
                  <img src={images.categoryIcon} alt="Department" />
                  <input
                    type="text"
                    placeholder="Design, Product, Engineering"
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="joblist-divider"></div>

            <div className="joblist-card joblist-filter-group">
              <div className="joblist-filter-header">
                <span>Work Mode</span>
                <button
                  className="joblist-toggle-icon"
                  onClick={() => toggleSection("workMode")}
                  aria-label={expandedSections.workMode ? "Collapse" : "Expand"}
                >
                  <img
                    src={
                      expandedSections.workMode
                        ? images.minusIcon
                        : images.plusIcon
                    }
                    alt={expandedSections.workMode ? "Collapse" : "Expand"}
                  />
                </button>
              </div>
              {expandedSections.workMode && (
                <div className="joblist-checklist">
                  <label>
                    <input
                      type="checkbox"
                      checked={filterWorkMode.remote}
                      onChange={(e) =>
                        setFilterWorkMode((prev) => ({
                          ...prev,
                          remote: e.target.checked,
                        }))
                      }
                    />{" "}
                    Remote
                    <span className="joblist-count">235</span>
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={filterWorkMode["on-site"]}
                      onChange={(e) =>
                        setFilterWorkMode((prev) => ({
                          ...prev,
                          "on-site": e.target.checked,
                        }))
                      }
                    />{" "}
                    On-Site
                    <span className="joblist-count">128</span>
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={filterWorkMode.hybrid}
                      onChange={(e) =>
                        setFilterWorkMode((prev) => ({
                          ...prev,
                          hybrid: e.target.checked,
                        }))
                      }
                    />{" "}
                    Hybrid
                    <span className="joblist-count">67</span>
                  </label>
                </div>
              )}
            </div>

            <div className="joblist-divider"></div>

            <div className="joblist-card joblist-filter-group">
              <div className="joblist-filter-header">
                <span>Job Type</span>
                <button
                  className="joblist-toggle-icon"
                  onClick={() => toggleSection("jobType")}
                  aria-label={expandedSections.jobType ? "Collapse" : "Expand"}
                >
                  <img
                    src={
                      expandedSections.jobType
                        ? images.minusIcon
                        : images.plusIcon
                    }
                    alt={expandedSections.jobType ? "Collapse" : "Expand"}
                  />
                </button>
              </div>
              {expandedSections.jobType && (
                <div className="joblist-checklist">
                  <label>
                    <input
                      type="checkbox"
                      checked={filterJobType["Full Time"]}
                      onChange={(e) =>
                        setFilterJobType((prev) => ({
                          ...prev,
                          "Full Time": e.target.checked,
                        }))
                      }
                    />{" "}
                    Full Time
                    <span className="joblist-count">235</span>
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={filterJobType["Part Time"]}
                      onChange={(e) =>
                        setFilterJobType((prev) => ({
                          ...prev,
                          "Part Time": e.target.checked,
                        }))
                      }
                    />{" "}
                    Part Time
                    <span className="joblist-count">28</span>
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={filterJobType.Contract}
                      onChange={(e) =>
                        setFilterJobType((prev) => ({
                          ...prev,
                          Contract: e.target.checked,
                        }))
                      }
                    />{" "}
                    Contract
                    <span className="joblist-count">97</span>
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={filterJobType.Internship}
                      onChange={(e) =>
                        setFilterJobType((prev) => ({
                          ...prev,
                          Internship: e.target.checked,
                        }))
                      }
                    />{" "}
                    Internship
                    <span className="joblist-count">14</span>
                  </label>
                </div>
              )}
            </div>

            <div className="joblist-divider"></div>

            <div className="joblist-card joblist-filter-group">
              <div className="joblist-filter-header">
                <span>Job Level</span>
                <button
                  className="joblist-toggle-icon"
                  onClick={() => toggleSection("jobLevel")}
                  aria-label={expandedSections.jobLevel ? "Collapse" : "Expand"}
                >
                  <img
                    src={
                      expandedSections.jobLevel
                        ? images.minusIcon
                        : images.plusIcon
                    }
                    alt={expandedSections.jobLevel ? "Collapse" : "Expand"}
                  />
                </button>
              </div>
              {expandedSections.jobLevel && (
                <div className="joblist-checklist">
                  <label>
                    <input
                      type="checkbox"
                      checked={filterJobLevel.Junior}
                      onChange={(e) =>
                        setFilterJobLevel((prev) => ({
                          ...prev,
                          Junior: e.target.checked,
                        }))
                      }
                    />{" "}
                    Junior
                    <span className="joblist-count">235</span>
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={filterJobLevel.Mid}
                      onChange={(e) =>
                        setFilterJobLevel((prev) => ({
                          ...prev,
                          Mid: e.target.checked,
                        }))
                      }
                    />{" "}
                    Mid
                    <span className="joblist-count">198</span>
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={filterJobLevel.Senior}
                      onChange={(e) =>
                        setFilterJobLevel((prev) => ({
                          ...prev,
                          Senior: e.target.checked,
                        }))
                      }
                    />{" "}
                    Senior
                    <span className="joblist-count">126</span>
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={filterJobLevel.Lead}
                      onChange={(e) =>
                        setFilterJobLevel((prev) => ({
                          ...prev,
                          Lead: e.target.checked,
                        }))
                      }
                    />{" "}
                    Lead
                    <span className="joblist-count">66</span>
                  </label>
                </div>
              )}
            </div>

            <div className="joblist-divider"></div>

            <div className="joblist-card joblist-filter-group">
              <div className="joblist-filter-header">
                <span>Experience</span>
                <button
                  className="joblist-toggle-icon"
                  onClick={() => toggleSection("experience")}
                  aria-label={
                    expandedSections.experience ? "Collapse" : "Expand"
                  }
                >
                  <img
                    src={
                      expandedSections.experience
                        ? images.minusIcon
                        : images.plusIcon
                    }
                    alt={expandedSections.experience ? "Collapse" : "Expand"}
                  />
                </button>
              </div>
              {expandedSections.experience && (
                <div className="joblist-input-row">
                  <img src={images.experienceIcon} alt="Experience" />
                  <input
                    type="text"
                    placeholder="E.g. 2+ years"
                    value={filterExperience}
                    onChange={(e) => setFilterExperience(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="joblist-divider"></div>

            <div className="joblist-card joblist-filter-group">
              <div className="joblist-filter-header">
                <span>Education</span>
                <button
                  className="joblist-toggle-icon"
                  onClick={() => toggleSection("education")}
                  aria-label={
                    expandedSections.education ? "Collapse" : "Expand"
                  }
                >
                  <img
                    src={
                      expandedSections.education
                        ? images.minusIcon
                        : images.plusIcon
                    }
                    alt={expandedSections.education ? "Collapse" : "Expand"}
                  />
                </button>
              </div>
              {expandedSections.education && (
                <div className="joblist-input-row">
                  <img src={images.educationIcon} alt="Education" />
                  <input
                    type="text"
                    placeholder="Bachelor's Degree"
                    value={filterEducation}
                    onChange={(e) => setFilterEducation(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="joblist-divider"></div>

            <div className="joblist-card joblist-filter-group">
              <div className="joblist-filter-header">
                <span>Required Skills</span>
                <button
                  className="joblist-toggle-icon"
                  onClick={() => toggleSection("skills")}
                  aria-label={expandedSections.skills ? "Collapse" : "Expand"}
                >
                  <img
                    src={
                      expandedSections.skills
                        ? images.minusIcon
                        : images.plusIcon
                    }
                    alt={expandedSections.skills ? "Collapse" : "Expand"}
                  />
                </button>
              </div>
              {expandedSections.skills && (
                <div className="joblist-input-row">
                  <img src={images.skillIcon} alt="Skills" />
                  <input
                    type="text"
                    placeholder="React, Figma, UX Research"
                    value={filterSkills}
                    onChange={(e) => setFilterSkills(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="joblist-divider"></div>

            <div className="joblist-card joblist-filter-group">
              <div className="joblist-filter-header">
                <span>Salary Range</span>
                <button
                  className="joblist-toggle-icon"
                  onClick={() => toggleSection("salaryRange")}
                  aria-label={
                    expandedSections.salaryRange ? "Collapse" : "Expand"
                  }
                >
                  <img
                    src={
                      expandedSections.salaryRange
                        ? images.minusIcon
                        : images.plusIcon
                    }
                    alt={expandedSections.salaryRange ? "Collapse" : "Expand"}
                  />
                </button>
              </div>
              {expandedSections.salaryRange && (
                <div className="joblist-salary-range">
                  <div className="joblist-input-row">
                    <img src={images.salaryIcon} alt="Currency" />
                    <select
                      value={filterCurrency}
                      onChange={(e) => setFilterCurrency(e.target.value)}
                    >
                      <option value="" disabled>
                        Select currency
                      </option>
                      <option value="NPR">NPR (Rs.)</option>
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                  <div className="joblist-salary-inputs">
                    <input
                      type="text"
                      placeholder="From"
                      value={filterSalaryFrom}
                      onChange={(e) => setFilterSalaryFrom(e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="To"
                      value={filterSalaryTo}
                      onChange={(e) => setFilterSalaryTo(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="joblist-filter-actions">
              <button
                className="joblist-apply-filter"
                onClick={() => applyFilters()}
              >
                Apply Filter
              </button>
              <button className="joblist-clear-filter" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>

            <div className="joblist-card joblist-promo-card">
              <h4>Recruiting?</h4>
              <p>Advertise your jobs to millions of monthly users.</p>
              <button className="joblist-btn-outline">Post a Job</button>
              <img src={images.promoIllustration} alt="" />
            </div>
          </aside>

          <main className="joblist-main">
            <div className="joblist-main-header">
              <span>
                {loading
                  ? "Loading jobs..."
                  : `Showing ${startIndex}-${endIndex} of ${totalJobs} jobs`}
              </span>
              <div className="joblist-sort">
                <span>Sort by:</span>
                <select
                  className="joblist-sort-select"
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="newest">Newest Post</option>
                  <option value="oldest">Oldest Post</option>
                  <option value="salary">Salary</option>
                </select>
              </div>
            </div>

            {error && <div className="joblist-error">{error}</div>}
            {!error && !loading && jobCards.length === 0 && (
              <div className="joblist-empty">No jobs found.</div>
            )}
            <div className="joblist-grid">
              {jobCards.map((job) => (
                <article key={job.id} className="joblist-card-item">
                  <div className="joblist-card-top">
                    <img
                      src={resolveLogo(job.companyLogo)}
                      alt={job.companyName}
                      className="joblist-company-logo"
                    />
                    <div className="joblist-card-actions">
                      <button className="joblist-icon-btn">
                        <img src={images.bookmarkIcon} alt="Bookmark" />
                      </button>
                      <button className="joblist-icon-btn">
                        <img src={images.shareIcon} alt="Share" />
                      </button>
                    </div>
                  </div>
                  <div className="joblist-card-company">{job.companyName}</div>
                  <div className="joblist-card-meta">
                    <img src={images.workModeIcon} alt="Work mode" />
                    {formatWorkMode(job.workMode)}
                  </div>
                  <h3 className="joblist-card-title">{job.jobTitle}</h3>
                  <div className="joblist-card-info">
                    <span>
                      <img src={images.locationIcon} alt="Location" />
                      {job.location}
                    </span>
                    <span>
                      <img src={images.jobTypeIcon} alt="Job type" />
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
                    <button
                      className="joblist-btn-primary"
                      onClick={() => openApplyModal(job.id)}
                      disabled={userRole !== "candidate"}
                    >
                      Apply Now
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className="joblist-pagination">
              <div className="joblist-page-controls">
                <button
                  className="joblist-page-nav"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                >
                  <img src={images.prevIcon} alt="Previous" />
                </button>
                <div className="joblist-page-numbers">
                  {visiblePages.map((pageNumber) => (
                    <span
                      key={pageNumber}
                      className={`joblist-page-num ${
                        pageNumber === page ? "joblist-active" : ""
                      }`}
                      onClick={() => setPage(pageNumber)}
                      role="button"
                    >
                      {pageNumber}
                    </span>
                  ))}
                  {totalPages > 7 && (
                    <span className="joblist-page-num joblist-dots">...</span>
                  )}
                </div>
                <button
                  className="joblist-page-nav"
                  onClick={() =>
                    setPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={page === totalPages}
                >
                  <img src={images.nextIcon} alt="Next" />
                </button>
              </div>
              <div className="joblist-page-info">
                Showing {startIndex} to {endIndex} of {totalJobs}
              </div>
            </div>
          </main>
        </div>
      </section>

      {applyModalOpen && (
        <div className="apply-modal-overlay">
          <div className="apply-modal">
            <div className="apply-modal-header">
              <div>
                <h3>Confirm Application</h3>
                <p>Review your resume and confirm the requirements before applying.</p>
              </div>
              <button className="apply-modal-close" onClick={closeApplyModal}>
                <img src={closeIcon} alt="Close" />
              </button>
            </div>

            {applyLoading && <p>Loading details...</p>}
            {!applyLoading && applyJobDetails && (
              <div className="apply-modal-body">
                <div className="apply-modal-section">
                  <h4>{applyJobDetails.jobTitle}</h4>
                  <p className="apply-modal-muted">{applyJobDetails.companyName}</p>
                </div>

                <div className="apply-modal-section">
                  <h5>Resume</h5>
                  {applyProfileResume ? (
                    <a
                      href={`http://localhost:5000${applyProfileResume}`}
                      target="_blank"
                      rel="noreferrer"
                      className="apply-modal-link"
                    >
                      View current resume
                    </a>
                  ) : (
                    <p className="apply-modal-muted">No resume on profile.</p>
                  )}
                  <label className="apply-modal-checkbox">
                    <input
                      type="checkbox"
                      checked={useCustomResume}
                      onChange={(e) => setUseCustomResume(e.target.checked)}
                    />
                    Use a different resume for this application (won't change your profile)
                  </label>
                  {useCustomResume && (
                    <label className="apply-modal-upload">
                      <input
                        type="file"
                        onChange={(e) =>
                          setCustomResumeFile(e.target.files ? e.target.files[0] : null)
                        }
                      />
                      <div className="apply-modal-upload-inner">
                        <span className="apply-modal-upload-title">Upload new resume</span>
                        <span className="apply-modal-upload-subtitle">PDF or DOCX ? Max 5MB</span>
                        {customResumeFile && (
                          <>
                            <span className="apply-modal-upload-file">
                              {customResumeFile.name}
                            </span>
                            <button
                              type="button"
                              className="apply-modal-link apply-modal-preview-btn"
                              onClick={(e) => {
                                e.preventDefault();
                                const url = URL.createObjectURL(customResumeFile);
                                window.open(url, "_blank", "noopener,noreferrer");
                              }}
                            >
                              Preview selected resume
                            </button>
                          </>
                        )}
                      </div>
                    </label>
                  )}
                </div>

                <div className="apply-modal-divider" />

                <div className="apply-modal-section">
                  <h5>Requirements</h5>
                  <p className="apply-modal-muted">
                    Education: {applyJobDetails.education || "Not specified"}
                  </p>
                  <p className="apply-modal-muted">
                    Experience: {applyJobDetails.experience || "Not specified"}
                  </p>
                  <label className="apply-modal-checkbox">
                    <input
                      type="checkbox"
                      checked={confirmRequirements}
                      onChange={(e) => setConfirmRequirements(e.target.checked)}
                    />
                    I confirm I meet the listed requirements.
                  </label>
                </div>

                <div className="apply-modal-divider" />

                <div className="apply-modal-section">
                  <h5>Message to recruiter (optional)</h5>
                  <div className="apply-modal-quill">
                    <ReactQuill
                      theme="snow"
                      value={applyNote}
                      onChange={setApplyNote}
                      modules={quillModules}
                      formats={quillFormats}
                      placeholder="Add a short note for the recruiter..."
                    />
                  </div>
                </div>

                <label className="apply-modal-checkbox">
                  <input
                    type="checkbox"
                    checked={confirmResume}
                    onChange={(e) => setConfirmResume(e.target.checked)}
                  />
                  I have reviewed my resume and want to apply.
                </label>
              </div>
            )}

            {applyError && <div className="apply-modal-error">{applyError}</div>}
            {applyMessage && <div className="apply-modal-success">{applyMessage}</div>}

            <div className="apply-modal-actions">
              <button className="apply-modal-secondary" onClick={closeApplyModal}>
                Cancel
              </button>
              <button
                className="apply-modal-primary"
                onClick={handleConfirmApply}
                disabled={applyLoading}
              >
                Confirm & Apply
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="joblist-brands">
        <div className="joblist-brands-row">
          <img src={images.brandSamsung} alt="Samsung" />
          <img src={images.brandGoogle} alt="Google" />
          <img src={images.brandFacebook} alt="Facebook" />
          <img src={images.brandPinterest} alt="Pinterest" />
          <img src={images.brandAvaya} alt="Avaya" />
          <img src={images.brandAvis} alt="Avis" />
          <img src={images.brandNielsen} alt="Nielsen" />
          <img src={images.brandDoordash} alt="DoorDash" />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default JobListingPage;
