import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/EmployersPage.css";
import { useNavigate } from "react-router-dom";

// Import images from Employers Page Images folder
import searchIcon from "../images/Employers Page Images/8_285.svg";
import locationIcon from "../images/Employers Page Images/8_298.svg";
import saveIcon from "../images/Employers Page Images/8_426.svg";
import savedIcon from "../images/Employers Page Images/Saved icon.svg";
import prevIcon from "../images/Employers Page Images/Prev Icon.svg";
import nextIcon from "../images/Employers Page Images/Next Icon.svg";
import minusIcon from "../images/Employers Page Images/minus.png";
import plusIcon from "../images/Employers Page Images/expand.png";
import featuredIcon from "../images/Employers Page Images/8_413.svg";
import badgeBg from "../images/Employers Page Images/8_412.svg";
import heroBgLeft from "../images/Employers Page Images/8_189.svg";
import heroBgRight from "../images/Employers Page Images/8_197.svg";
import heroCircle from "../images/Employers Page Images/8_205.svg";
import heroIcon1 from "../images/Employers Page Images/8_208.svg";
import heroIcon2 from "../images/Employers Page Images/8_209.svg";
import connectIcon from "../images/Employers Page Images/connect-icon.png";
import pendingIcon from "../images/Employers Page Images/pending-icon.png";
import friendIcon from "../images/Employers Page Images/friend-icon.png";
import messageIcon from "../images/Employers Page Images/message-icon.png";
import viewProfileIcon from "../images/Employers Page Images/view-profile-icon.png";

// Import default logo for companies without logo
import defaultLogo from "../images/Register Page Images/Default Profile.webp";

// Define interface for Company data
interface Company {
  id: string;
  name: string;
  logo: string;
  location: string;
  vacancies: number;
  isFeatured: boolean;
  companySize?: string;
  foundedYear?: string;
  websiteUrl?: string;
}

type ConnectionState = "none" | "pending" | "friend";

const EmployersPage = () => {
  // State for UI controls
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    companyName: false,
    location: false,
    team: false,
  });
  const navigate = useNavigate();

  const [savedCompanies, setSavedCompanies] = useState<Record<string, boolean>>(
    {}
  );
  const [sortBy, setSortBy] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 20;
  const [quickSearch, setQuickSearch] = useState("");

  const [searchCompanyName, setSearchCompanyName] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [searchTeamFrom, setSearchTeamFrom] = useState("");
  const [searchTeamTo, setSearchTeamTo] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({
    companyName: "",
    location: "",
    teamFrom: "",
    teamTo: "",
  });

  // State for companies data from backend
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatuses, setConnectionStatuses] = useState<
    Record<string, ConnectionState>
  >({});
  const [sendingConnectionId, setSendingConnectionId] = useState<string | null>(
    null
  );
  const userDataStr = localStorage.getItem("userData");
  const currentUser = userDataStr ? JSON.parse(userDataStr) : null;
  const currentUserId =
    currentUser?.id || currentUser?._id || currentUser?.userId || "";

  // Function to fetch companies from backend
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);

      // Make API call to fetch recruiters
      const response = await fetch("http://localhost:5000/api/employers", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch companies: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.recruiters) {
        // Map the backend data to our frontend format
        const formattedCompanies: Company[] = data.recruiters.map(
          (recruiter: any) => ({
            id: recruiter.id,
            name: recruiter.name,
            logo: recruiter.logo || defaultLogo,
            location: recruiter.location,
            vacancies: recruiter.vacancies,
            isFeatured: recruiter.isFeatured,
            companySize: recruiter.companySize,
            foundedYear: recruiter.foundedYear,
            websiteUrl: recruiter.websiteUrl,
          })
        );

        setCompanies(formattedCompanies);
      } else {
        throw new Error(data.message || "Failed to fetch companies");
      }
    } catch (err: any) {
      console.error("Error fetching companies:", err);
      setError(err.message || "Failed to load companies. Please try again.");

      // Set empty array on error
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch companies on component mount
  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    const fetchConnectionStatuses = async () => {
      const token = localStorage.getItem("authToken");
      const role = currentUser?.role;
      const isAllowed = role === "candidate" || role === "recruiter";

      if (!token || !isAllowed) {
        setConnectionStatuses({});
        return;
      }

      const targetIds = companies
        .map((company) => company.id)
        .filter((id) => Boolean(id) && id !== currentUserId);
      if (targetIds.length === 0) {
        setConnectionStatuses({});
        return;
      }

      try {
        const res = await fetch(
          `http://localhost:5000/api/connections/statuses?targetIds=${targetIds.join(",")}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        if (!res.ok) return;
        setConnectionStatuses(
          (data.statuses || {}) as Record<string, ConnectionState>
        );
      } catch {
        setConnectionStatuses({});
      }
    };

    fetchConnectionStatuses();

    const intervalId = window.setInterval(() => {
      if (document.hidden) return;
      fetchConnectionStatuses();
    }, 2500);

    return () => window.clearInterval(intervalId);
  }, [companies, currentUser?.role, currentUserId]);

  const handleSendConnection = async (targetUserId: string) => {
    const token = localStorage.getItem("authToken");
    const role = currentUser?.role;
    const isAllowed = role === "candidate" || role === "recruiter";

    if (!token || !isAllowed) {
      navigate("/login");
      return;
    }

    if (
      !targetUserId ||
      targetUserId === currentUserId ||
      sendingConnectionId ||
      (connectionStatuses[targetUserId] || "none") !== "none"
    ) {
      return;
    }

    try {
      setSendingConnectionId(targetUserId);
      const res = await fetch("http://localhost:5000/api/connections/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipientId: targetUserId }),
      });
      const data = await res.json();
      if (!res.ok) return;

      const nextState: ConnectionState =
        data.status === "accepted" ? "friend" : "pending";
      setConnectionStatuses((prev) => ({
        ...prev,
        [targetUserId]: nextState,
      }));
    } finally {
      setSendingConnectionId(null);
    }
  };

  const getConnectionLabel = (targetUserId: string) => {
    const status = connectionStatuses[targetUserId] || "none";
    if (status === "friend") return "Friend";
    if (status === "pending") return "Pending";
    return "Connect";
  };

  const getConnectionIcon = (targetUserId: string) => {
    const status = connectionStatuses[targetUserId] || "none";
    if (status === "friend") return friendIcon;
    if (status === "pending") return pendingIcon;
    return connectIcon;
  };

  const openMessages = (targetUserId: string) => {
    const token = localStorage.getItem("authToken");
    const role = currentUser?.role;
    if (!token) {
      navigate("/login");
      return;
    }
    if (!targetUserId || (role !== "candidate" && role !== "recruiter")) {
      return;
    }
    navigate(`/${role}/messages?user=${targetUserId}`);
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const applyFilters = () => {
    setAppliedFilters({
      companyName: searchCompanyName.trim(),
      location: searchLocation.trim(),
      teamFrom: searchTeamFrom.replace(/,/g, "").trim(),
      teamTo: searchTeamTo.replace(/,/g, "").trim(),
    });
    setPage(1);
  };

  const clearFilters = () => {
    setQuickSearch("");
    setSearchCompanyName("");
    setSearchLocation("");
    setSearchTeamFrom("");
    setSearchTeamTo("");
    setAppliedFilters({
      companyName: "",
      location: "",
      teamFrom: "",
      teamTo: "",
    });
    setSortBy("");
    setPage(1);
  };

  const parseTeamSize = (value?: string) => {
    if (!value) return null;
    const numeric = Number(String(value).replace(/,/g, "").match(/\d+/)?.[0] || "");
    return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
  };

  const filteredCompanies = companies.filter((company) => {
    const quickMatch = quickSearch
      ? `${company.name} ${company.location}`
          .toLowerCase()
          .includes(quickSearch.toLowerCase())
      : true;
    const nameMatch = appliedFilters.companyName
      ? company.name
          .toLowerCase()
          .includes(appliedFilters.companyName.toLowerCase())
      : true;
    const locationMatch = appliedFilters.location
      ? company.location
          .toLowerCase()
          .includes(appliedFilters.location.toLowerCase())
      : true;
    const teamSize = parseTeamSize(company.companySize);
    const teamFrom = Number(appliedFilters.teamFrom || 0);
    const teamTo = Number(appliedFilters.teamTo || 0);
    const teamFromMatch =
      !appliedFilters.teamFrom || (teamSize !== null && teamSize >= teamFrom);
    const teamToMatch =
      !appliedFilters.teamTo || (teamSize !== null && teamSize <= teamTo);
    return quickMatch && nameMatch && locationMatch && teamFromMatch && teamToMatch;
  });

  const sortedCompanies = [...filteredCompanies].sort((a, b) => {
    if (!sortBy) return 0;
    if (sortBy === "alphabetical") {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === "highest") {
      return b.vacancies - a.vacancies;
    }
    if (sortBy === "lowest") {
      return a.vacancies - b.vacancies;
    }
    if (sortBy === "oldest") {
      return a.id.localeCompare(b.id);
    }
    return 0;
  });

  const totalPages = Math.max(Math.ceil(sortedCompanies.length / perPage), 1);
  const paginatedCompanies = sortedCompanies.slice(
    (page - 1) * perPage,
    page * perPage,
  );

  const toggleSaveCompany = (id: string) => {
    setSavedCompanies((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const sortOptions = [
    { value: "newest", label: "Newest Employers" },
    { value: "alphabetical", label: "Alphabetical Order" },
    { value: "highest", label: "Highest Number of Vacancy" },
    { value: "lowest", label: "Lowest Number of Vacancy" },
    { value: "oldest", label: "Oldest Employers" },
  ];

  // Handle retry if there's an error
  const handleRetry = () => {
    fetchCompanies();
  };

  // Handle image error - fallback to default logo
  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    e.currentTarget.src = defaultLogo;
  };

  return (
    <div className="employerspublic-page">
      <Navbar />

      {/* Hero Section */}
      <section className="employerspublic-hero">
        <div className="employerspublic-hero-wrapper">
          <div className="employerspublic-hero-bg-elements">
            <img
              src={heroBgLeft}
              className="employerspublic-bg-left"
              alt="Background decoration left"
            />
            <img
              src={heroBgRight}
              className="employerspublic-bg-right"
              alt="Background decoration right"
            />
            <img
              src={heroCircle}
              className="employerspublic-bg-circle"
              alt="Background circle"
            />
            <img
              src={heroIcon1}
              className="employerspublic-bg-icon-1"
              alt="Background icon 1"
            />
            <img
              src={heroIcon2}
              className="employerspublic-bg-icon-2"
              alt="Background icon 2"
            />
          </div>

          <div className="employerspublic-hero-content">
            <h1>Company</h1>
            <p>Find you desire company and get your dream job</p>
          </div>
        </div>
      </section>

      <section className="employerspublic-top-search">
        <div className="employerspublic-top-search-inner">
          <img src={searchIcon} alt="Search" />
          <input
            type="text"
            placeholder="Search by company name or location"
            value={quickSearch}
            onChange={(e) => {
              setQuickSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </section>

      {/* Main Content */}
      <section className="employerspublic-main-content">
        <div className="employerspublic-content-container">
          {/* Sidebar Filters */}
          <aside className="employerspublic-sidebar">
            <div className="employerspublic-filter-group employerspublic-search-group">
              <div className="employerspublic-filter-header">
                <span>Company Name</span>
                <button
                  className="employerspublic-toggle-icon"
                  onClick={() => toggleSection("companyName")}
                  aria-label={
                    expandedSections.companyName ? "Collapse" : "Expand"
                  }
                >
                  <img
                    src={expandedSections.companyName ? minusIcon : plusIcon}
                    alt={expandedSections.companyName ? "Collapse" : "Expand"}
                  />
                </button>
              </div>
              {expandedSections.companyName && (
                <div className="employerspublic-input-wrapper">
                  <img src={searchIcon} alt="Search" />
                  <input
                    type="text"
                    placeholder="Company Name"
                    value={searchCompanyName}
                    onChange={(e) => setSearchCompanyName(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="employerspublic-divider"></div>

            <div className="employerspublic-filter-group employerspublic-location-group">
              <div className="employerspublic-filter-header">
                <span>Location</span>
                <button
                  className="employerspublic-toggle-icon"
                  onClick={() => toggleSection("location")}
                  aria-label={expandedSections.location ? "Collapse" : "Expand"}
                >
                  <img
                    src={expandedSections.location ? minusIcon : plusIcon}
                    alt={expandedSections.location ? "Collapse" : "Expand"}
                  />
                </button>
              </div>
              {expandedSections.location && (
                <div className="employerspublic-input-wrapper">
                  <img src={locationIcon} alt="Location" />
                  <input
                    type="text"
                    placeholder="Location"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="employerspublic-divider"></div>

            <div className="employerspublic-filter-group employerspublic-checkbox-group">
              <div className="employerspublic-filter-header">
                <span>Team</span>
                <button
                  className="employerspublic-toggle-icon"
                  onClick={() => toggleSection("team")}
                  aria-label={expandedSections.team ? "Collapse" : "Expand"}
                >
                  <img
                    src={expandedSections.team ? minusIcon : plusIcon}
                    alt={expandedSections.team ? "Collapse" : "Expand"}
                  />
                </button>
              </div>
              {expandedSections.team && (
                <div className="employerspublic-checkbox-list">
                  <div className="employerspublic-input-wrapper employerspublic-mb-4">
                    <input
                      type="text"
                      placeholder="From (e.g. 10)"
                      value={searchTeamFrom}
                      onChange={(e) => setSearchTeamFrom(e.target.value)}
                    />
                  </div>
                  <div className="employerspublic-input-wrapper">
                    <input
                      type="text"
                      placeholder="To (e.g. 200)"
                      value={searchTeamTo}
                      onChange={(e) => setSearchTeamTo(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="employerspublic-divider"></div>
            <div className="employerspublic-filter-actions">
              <button
                className="employerspublic-btn-apply-filter"
                onClick={applyFilters}
              >
                Apply Filter
              </button>
              <button
                className="employerspublic-btn-clear-filter"
                onClick={clearFilters}
              >
                Cancel Filter
              </button>
            </div>
          </aside>

          {/* Main Listing */}
          <main className="employerspublic-listing-area">
            <div className="employerspublic-listing-header">
              <span className="employerspublic-result-count">
                {loading
                  ? "Loading companies..."
                  : `All ${sortedCompanies.length} company found`}
              </span>
              <div className="employerspublic-sort-dropdown">
                <span>Sort by: </span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  className="employerspublic-sort-select"
                >
                  <option value="">Select</option>
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="employerspublic-loading">
                <p>Loading companies from database...</p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="employerspublic-error">
                <p>{error}</p>
                <button
                  onClick={handleRetry}
                  className="employerspublic-btn-retry"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Companies Grid */}
            {!loading && !error && (
              <>
                <div className="employerspublic-company-grid">
                  {paginatedCompanies.length > 0 ? (
                    paginatedCompanies.map((company) => {
                      const companyStatus = connectionStatuses[company.id] || "none";
                      const statusClass =
                        companyStatus === "friend"
                          ? "is-friend"
                          : companyStatus === "pending"
                            ? "is-pending"
                            : "";
                      const isDisabled =
                        !company.id ||
                        company.id === currentUserId ||
                        sendingConnectionId === company.id ||
                        companyStatus !== "none";
                      const isSelfCard =
                        Boolean(currentUserId) && company.id === currentUserId;

                      return (
                      <article
                        key={company.id}
                        className="employerspublic-company-card"
                        onClick={() => navigate(`/employer/${company.id}`)}
                        style={{ cursor: "pointer" }}
                      >
                        {company.isFeatured && (
                          <div className="employerspublic-card-badge">
                            <img
                              src={badgeBg}
                              className="employerspublic-badge-bg"
                              alt=""
                            />
                            <img
                              src={featuredIcon}
                              className="employerspublic-badge-icon"
                              alt="featured"
                            />
                          </div>
                        )}
                          <div className="employerspublic-card-content">
                            <div className="employerspublic-company-logo">
                              <img
                                src={company.logo}
                                alt={company.name}
                              onError={handleImageError}
                            />
                          </div>
                          <h3 className="employerspublic-company-name">
                            {company.name}
                          </h3>
                            <p className="employerspublic-company-location">
                              {company.location.split("\n").map((line, i) => (
                                <span key={i}>
                                  {line}
                                  <br />
                                </span>
                              ))}
                            </p>
                            <div className="employerspublic-vacancy-tag">
                              {company.vacancies} Vacancy
                            </div>
                          </div>
                          <div className="employerspublic-card-footer">
                            <div className={`employerspublic-contact-actions ${isSelfCard ? "is-single" : ""}`}>
                              {isSelfCard ? (
                                <button
                                  type="button"
                                  className="employerspublic-contact-btn"
                                  title="View profile"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    navigate(`/employer/${company.id}`);
                                  }}
                                  onMouseDown={(event) => event.stopPropagation()}
                                >
                                  <img src={viewProfileIcon} alt="View profile" />
                                  <span>View Profile</span>
                                </button>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    className={`employerspublic-contact-btn ${statusClass}`}
                                    title="Send connection request"
                                    disabled={isDisabled}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      handleSendConnection(company.id);
                                    }}
                                    onMouseDown={(event) => event.stopPropagation()}
                                  >
                                    <img
                                      src={getConnectionIcon(company.id)}
                                      alt={getConnectionLabel(company.id)}
                                    />
                                    <span>{getConnectionLabel(company.id)}</span>
                                  </button>
                                  <button
                                    type="button"
                                    className="employerspublic-contact-btn"
                                    title="Message"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      openMessages(company.id);
                                    }}
                                  >
                                    <img src={messageIcon} alt="Message" />
                                    <span>Message</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                      </article>
                      );
                    })
                  ) : (
                    <div className="employerspublic-no-data">
                      <p>No companies found in the database.</p>
                    </div>
                  )}
                </div>

                <div className="employerspublic-pagination">
                  <div className="employerspublic-page-controls">
                    <button
                      className="employerspublic-page-nav employerspublic-prev"
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                      disabled={page === 1}
                    >
                      <img src={prevIcon} alt="Previous" />
                    </button>
                    <div className="employerspublic-page-numbers">
                      {Array.from(
                        { length: Math.min(totalPages, 7) },
                        (_, index) => index + 1,
                      ).map((pageNumber) => (
                        <span
                          key={pageNumber}
                          className={`employerspublic-page-num ${
                            pageNumber === page ? "employerspublic-active" : ""
                          }`}
                          onClick={() => setPage(pageNumber)}
                          role="button"
                        >
                          {pageNumber}
                        </span>
                      ))}
                      {totalPages > 7 && (
                        <span className="employerspublic-page-num employerspublic-dots">
                          ...
                        </span>
                      )}
                    </div>
                    <button
                      className="employerspublic-page-nav employerspublic-next"
                      onClick={() =>
                        setPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={page === totalPages}
                    >
                      <img src={nextIcon} alt="Next" />
                    </button>
                  </div>
                  <div className="employerspublic-page-info">
                    Showing {paginatedCompanies.length ? (page - 1) * perPage + 1 : 0} to{" "}
                    {(page - 1) * perPage + paginatedCompanies.length} of{" "}
                    {sortedCompanies.length}
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default EmployersPage;
