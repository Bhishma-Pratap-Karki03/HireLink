import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/EmployersPage.css";
import { useNavigate } from "react-router-dom";

// Import images from Employers Page Images folder
import searchIcon from "../images/Employers Page Images/8_285.svg";
import locationIcon from "../images/Employers Page Images/8_298.svg";
import categoryIcon from "../images/Employers Page Images/8_360.svg";
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

const EmployersPage = () => {
  // State for UI controls
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    companyName: true,
    location: true,
    companyStatus: true,
    category: true,
    team: true,
  });
  const navigate = useNavigate();

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    new: true,
    topRated: true,
    older: true,
    webDesign: true,
    designCreative: true,
    itDevelopment: true,
    webMobileDev: true,
    writing: true,
    team12: true,
    team7: true,
    team10: true,
    team15: true,
    team5: true,
  });

  const [savedCompanies, setSavedCompanies] = useState<Record<string, boolean>>(
    {}
  );
  const [sortBy, setSortBy] = useState("newest");

  // State for companies data from backend
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleCheckboxChange = (item: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

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
                  <input type="text" placeholder="Company Name" />
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
                  <input type="text" placeholder="Location" />
                </div>
              )}
            </div>

            <div className="employerspublic-divider"></div>

            <div className="employerspublic-filter-group employerspublic-checkbox-group">
              <div className="employerspublic-filter-header">
                <span>Company Status</span>
                <button
                  className="employerspublic-toggle-icon"
                  onClick={() => toggleSection("companyStatus")}
                  aria-label={
                    expandedSections.companyStatus ? "Collapse" : "Expand"
                  }
                >
                  <img
                    src={expandedSections.companyStatus ? minusIcon : plusIcon}
                    alt={expandedSections.companyStatus ? "Collapse" : "Expand"}
                  />
                </button>
              </div>
              {expandedSections.companyStatus && (
                <div className="employerspublic-checkbox-list">
                  <label className="employerspublic-checkbox-item">
                    <input
                      type="checkbox"
                      checked={checkedItems.new}
                      onChange={() => handleCheckboxChange("new")}
                    />
                    <span
                      className={`employerspublic-checkmark ${
                        checkedItems.new ? "employerspublic-checked" : ""
                      }`}
                    >
                      {checkedItems.new && (
                        <span className="employerspublic-checkmark-tick">
                          ✓
                        </span>
                      )}
                    </span>
                    <span className="employerspublic-label-text">New</span>
                  </label>
                  <label className="employerspublic-checkbox-item">
                    <input
                      type="checkbox"
                      checked={checkedItems.topRated}
                      onChange={() => handleCheckboxChange("topRated")}
                    />
                    <span
                      className={`employerspublic-checkmark ${
                        checkedItems.topRated ? "employerspublic-checked" : ""
                      }`}
                    >
                      {checkedItems.topRated && (
                        <span className="employerspublic-checkmark-tick">
                          ✓
                        </span>
                      )}
                    </span>
                    <span className="employerspublic-label-text">
                      Top Rated
                    </span>
                  </label>
                  <label className="employerspublic-checkbox-item">
                    <input
                      type="checkbox"
                      checked={checkedItems.older}
                      onChange={() => handleCheckboxChange("older")}
                    />
                    <span
                      className={`employerspublic-checkmark ${
                        checkedItems.older ? "employerspublic-checked" : ""
                      }`}
                    >
                      {checkedItems.older && (
                        <span className="employerspublic-checkmark-tick">
                          ✓
                        </span>
                      )}
                    </span>
                    <span className="employerspublic-label-text">Older</span>
                  </label>
                </div>
              )}
            </div>

            <div className="employerspublic-divider"></div>

            <div className="employerspublic-filter-group employerspublic-checkbox-group">
              <div className="employerspublic-filter-header">
                <span>Category</span>
                <button
                  className="employerspublic-toggle-icon"
                  onClick={() => toggleSection("category")}
                  aria-label={expandedSections.category ? "Collapse" : "Expand"}
                >
                  <img
                    src={expandedSections.category ? minusIcon : plusIcon}
                    alt={expandedSections.category ? "Collapse" : "Expand"}
                  />
                </button>
              </div>
              {expandedSections.category && (
                <>
                  <div className="employerspublic-input-wrapper employerspublic-mb-4">
                    <img src={categoryIcon} alt="Category" />
                    <input type="text" placeholder="Category" />
                  </div>
                  <div className="employerspublic-checkbox-list">
                    <label className="employerspublic-checkbox-item employerspublic-justify-between">
                      <div className="employerspublic-flex employerspublic-items-center employerspublic-gap-2">
                        <input
                          type="checkbox"
                          checked={checkedItems.webDesign}
                          onChange={() => handleCheckboxChange("webDesign")}
                        />
                        <span
                          className={`employerspublic-checkmark ${
                            checkedItems.webDesign
                              ? "employerspublic-checked"
                              : ""
                          }`}
                        >
                          {checkedItems.webDesign && (
                            <span className="employerspublic-checkmark-tick">
                              ✓
                            </span>
                          )}
                        </span>
                        <span className="employerspublic-label-text">
                          Web Design
                        </span>
                      </div>
                      <span className="employerspublic-count-badge">235</span>
                    </label>
                    <label className="employerspublic-checkbox-item employerspublic-justify-between">
                      <div className="employerspublic-flex employerspublic-items-center employerspublic-gap-2">
                        <input
                          type="checkbox"
                          checked={checkedItems.designCreative}
                          onChange={() =>
                            handleCheckboxChange("designCreative")
                          }
                        />
                        <span
                          className={`employerspublic-checkmark ${
                            checkedItems.designCreative
                              ? "employerspublic-checked"
                              : ""
                          }`}
                        >
                          {checkedItems.designCreative && (
                            <span className="employerspublic-checkmark-tick">
                              ✓
                            </span>
                          )}
                        </span>
                        <span className="employerspublic-label-text">
                          Design & Creative
                        </span>
                      </div>
                      <span className="employerspublic-count-badge">28</span>
                    </label>
                    <label className="employerspublic-checkbox-item employerspublic-justify-between">
                      <div className="employerspublic-flex employerspublic-items-center employerspublic-gap-2">
                        <input
                          type="checkbox"
                          checked={checkedItems.itDevelopment}
                          onChange={() => handleCheckboxChange("itDevelopment")}
                        />
                        <span
                          className={`employerspublic-checkmark ${
                            checkedItems.itDevelopment
                              ? "employerspublic-checked"
                              : ""
                          }`}
                        >
                          {checkedItems.itDevelopment && (
                            <span className="employerspublic-checkmark-tick">
                              ✓
                            </span>
                          )}
                        </span>
                        <span className="employerspublic-label-text">
                          IT & Development
                        </span>
                      </div>
                      <span className="employerspublic-count-badge">67</span>
                    </label>
                    <label className="employerspublic-checkbox-item employerspublic-justify-between">
                      <div className="employerspublic-flex employerspublic-items-center employerspublic-gap-2">
                        <input
                          type="checkbox"
                          checked={checkedItems.webMobileDev}
                          onChange={() => handleCheckboxChange("webMobileDev")}
                        />
                        <span
                          className={`employerspublic-checkmark ${
                            checkedItems.webMobileDev
                              ? "employerspublic-checked"
                              : ""
                          }`}
                        >
                          {checkedItems.webMobileDev && (
                            <span className="employerspublic-checkmark-tick">
                              ✓
                            </span>
                          )}
                        </span>
                        <span className="employerspublic-label-text">
                          Web & Mobile Dev
                        </span>
                      </div>
                      <span className="employerspublic-count-badge">97</span>
                    </label>
                    <label className="employerspublic-checkbox-item employerspublic-justify-between">
                      <div className="employerspublic-flex employerspublic-items-center employerspublic-gap-2">
                        <input
                          type="checkbox"
                          checked={checkedItems.writing}
                          onChange={() => handleCheckboxChange("writing")}
                        />
                        <span
                          className={`employerspublic-checkmark ${
                            checkedItems.writing
                              ? "employerspublic-checked"
                              : ""
                          }`}
                        >
                          {checkedItems.writing && (
                            <span className="employerspublic-checkmark-tick">
                              ✓
                            </span>
                          )}
                        </span>
                        <span className="employerspublic-label-text">
                          Writing
                        </span>
                      </div>
                      <span className="employerspublic-count-badge">14</span>
                    </label>
                  </div>
                </>
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
                  <label className="employerspublic-checkbox-item employerspublic-justify-between">
                    <div className="employerspublic-flex employerspublic-items-center employerspublic-gap-2">
                      <input
                        type="checkbox"
                        checked={checkedItems.team12}
                        onChange={() => handleCheckboxChange("team12")}
                      />
                      <span
                        className={`employerspublic-checkmark ${
                          checkedItems.team12 ? "employerspublic-checked" : ""
                        }`}
                      >
                        {checkedItems.team12 && (
                          <span className="employerspublic-checkmark-tick">
                            ✓
                          </span>
                        )}
                      </span>
                      <span className="employerspublic-label-text">
                        12+ Team Size
                      </span>
                    </div>
                    <span className="employerspublic-count-badge">235</span>
                  </label>
                  <label className="employerspublic-checkbox-item employerspublic-justify-between">
                    <div className="employerspublic-flex employerspublic-items-center employerspublic-gap-2">
                      <input
                        type="checkbox"
                        checked={checkedItems.team7}
                        onChange={() => handleCheckboxChange("team7")}
                      />
                      <span
                        className={`employerspublic-checkmark ${
                          checkedItems.team7 ? "employerspublic-checked" : ""
                        }`}
                      >
                        {checkedItems.team7 && (
                          <span className="employerspublic-checkmark-tick">
                            ✓
                          </span>
                        )}
                      </span>
                      <span className="employerspublic-label-text">
                        7+ Team Size
                      </span>
                    </div>
                    <span className="employerspublic-count-badge">28</span>
                  </label>
                  <label className="employerspublic-checkbox-item employerspublic-justify-between">
                    <div className="employerspublic-flex employerspublic-items-center employerspublic-gap-2">
                      <input
                        type="checkbox"
                        checked={checkedItems.team10}
                        onChange={() => handleCheckboxChange("team10")}
                      />
                      <span
                        className={`employerspublic-checkmark ${
                          checkedItems.team10 ? "employerspublic-checked" : ""
                        }`}
                      >
                        {checkedItems.team10 && (
                          <span className="employerspublic-checkmark-tick">
                            ✓
                          </span>
                        )}
                      </span>
                      <span className="employerspublic-label-text">
                        10+ Team Size
                      </span>
                    </div>
                    <span className="employerspublic-count-badge">67</span>
                  </label>
                  <label className="employerspublic-checkbox-item employerspublic-justify-between">
                    <div className="employerspublic-flex employerspublic-items-center employerspublic-gap-2">
                      <input
                        type="checkbox"
                        checked={checkedItems.team15}
                        onChange={() => handleCheckboxChange("team15")}
                      />
                      <span
                        className={`employerspublic-checkmark ${
                          checkedItems.team15 ? "employerspublic-checked" : ""
                        }`}
                      >
                        {checkedItems.team15 && (
                          <span className="employerspublic-checkmark-tick">
                            ✓
                          </span>
                        )}
                      </span>
                      <span className="employerspublic-label-text">
                        15+ Team Size
                      </span>
                    </div>
                    <span className="employerspublic-count-badge">97</span>
                  </label>
                  <label className="employerspublic-checkbox-item employerspublic-justify-between">
                    <div className="employerspublic-flex employerspublic-items-center employerspublic-gap-2">
                      <input
                        type="checkbox"
                        checked={checkedItems.team5}
                        onChange={() => handleCheckboxChange("team5")}
                      />
                      <span
                        className={`employerspublic-checkmark ${
                          checkedItems.team5 ? "employerspublic-checked" : ""
                        }`}
                      >
                        {checkedItems.team5 && (
                          <span className="employerspublic-checkmark-tick">
                            ✓
                          </span>
                        )}
                      </span>
                      <span className="employerspublic-label-text">
                        5+ Team Size
                      </span>
                    </div>
                    <span className="employerspublic-count-badge">14</span>
                  </label>
                </div>
              )}
            </div>

            <div className="employerspublic-divider"></div>

            <button className="employerspublic-btn-apply-filter">
              Apply Filter
            </button>
          </aside>

          {/* Main Listing */}
          <main className="employerspublic-listing-area">
            <div className="employerspublic-listing-header">
              <span className="employerspublic-result-count">
                {loading
                  ? "Loading companies..."
                  : `All ${companies.length} company found`}
              </span>
              <div className="employerspublic-sort-dropdown">
                <span>Sort by: </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="employerspublic-sort-select"
                >
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
                  {companies.length > 0 ? (
                    companies.map((company) => (
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
                        </div>
                        <div className="employerspublic-card-footer">
                          <div className="employerspublic-vacancy-tag">
                            {company.vacancies} Vacancy
                          </div>
                          <div className="employerspublic-card-divider"></div>
                          <button
                            className={`employerspublic-save-action ${
                              savedCompanies[company.id] ? "saved" : ""
                            }`}
                            onClick={() => toggleSaveCompany(company.id)}
                          >
                            <img
                              src={
                                savedCompanies[company.id]
                                  ? savedIcon
                                  : saveIcon
                              }
                              alt="save"
                            />
                            <span>
                              {savedCompanies[company.id] ? "Saved" : "Save"}
                            </span>
                          </button>
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="employerspublic-no-data">
                      <p>No companies found in the database.</p>
                    </div>
                  )}
                </div>

                <div className="employerspublic-pagination">
                  <div className="employerspublic-page-controls">
                    <button className="employerspublic-page-nav employerspublic-prev">
                      <img src={prevIcon} alt="Previous" />
                    </button>
                    <div className="employerspublic-page-numbers">
                      <span className="employerspublic-page-num employerspublic-active">
                        1
                      </span>
                      <span className="employerspublic-page-num">2</span>
                      <span className="employerspublic-page-num">3</span>
                      <span className="employerspublic-page-num">4</span>
                      <span className="employerspublic-page-num">5</span>
                      <span className="employerspublic-page-num employerspublic-dots">
                        ...
                      </span>
                      <span className="employerspublic-page-num">6</span>
                      <span className="employerspublic-page-num">7</span>
                    </div>
                    <button className="employerspublic-page-nav employerspublic-next">
                      <img src={nextIcon} alt="Next" />
                    </button>
                  </div>
                  <div className="employerspublic-page-info">
                    Showing 1 to {Math.min(companies.length, 20)} of{" "}
                    {companies.length}
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
