import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/CandidateDetailsPage.css";
import heroBgLeft from "../images/Employers Page Images/8_189.svg";
import heroBgRight from "../images/Employers Page Images/8_197.svg";
import heroCircle from "../images/Employers Page Images/8_205.svg";
import heroIcon1 from "../images/Employers Page Images/8_208.svg";
import heroIcon2 from "../images/Employers Page Images/8_209.svg";
import defaultAvatar from "../images/Register Page Images/Default Profile.webp";
import projectImage from "../images/Candidate Profile Page Images/project-image.png";
import arrowIcon from "../images/Candidate Profile Page Images/267_1325.svg";
import starIcon from "../images/Candidate Profile Page Images/star-icon.svg";
import emptyStarIcon from "../images/Candidate Profile Page Images/empty-star-icon.png";
import connectIcon from "../images/Employers Page Images/connect-icon.png";
import pendingIcon from "../images/Employers Page Images/pending-icon.png";
import friendIcon from "../images/Employers Page Images/friend-icon.png";
import messageIcon from "../images/Employers Page Images/message-icon.png";

type Skill = {
  skillName: string;
};

type Experience = {
  jobTitle?: string;
  organization?: string;
  location?: string;
  startDate?: string;
  endDate?: string | null;
  isCurrent?: boolean;
  description?: string;
};

type Education = {
  degreeTitle?: string;
  institution?: string;
  location?: string;
  startDate?: string;
  endDate?: string | null;
  isCurrent?: boolean;
  description?: string;
};

type Certification = {
  certificationName?: string;
  issuingOrganization?: string;
  issueDate?: string;
};

type Language = {
  languageName?: string;
  rating?: number;
};

type Project = {
  projectTitle?: string;
  description?: string;
  technologies?: string;
  coverImage?: string;
  projectUrl?: string;
  projectDescription?: string;
  startDate?: string;
  endDate?: string | null;
  isOngoing?: boolean;
};

type CandidateProfile = {
  id: string;
  fullName: string;
  email?: string;
  currentJobTitle?: string;
  address?: string;
  profilePicture?: string;
  about?: string;
  resume?: string;
  resumeFileName?: string;
  resumeFileSize?: number;
  skills?: Skill[];
  experience?: Experience[];
  education?: Education[];
  certifications?: Certification[];
  languages?: Language[];
  projects?: Project[];
};

type ConnectionState = "none" | "pending" | "friend";
type MutualConnection = {
  id: string;
  fullName: string;
  profilePicture?: string;
};

const formatDate = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  });
};

const resolveAvatar = (profilePicture?: string) => {
  if (!profilePicture) return defaultAvatar;
  if (profilePicture.startsWith("http")) return profilePicture;
  return `http://localhost:5000${profilePicture}`;
};

const getProjectImageUrl = (coverImage?: string) => {
  if (!coverImage) return projectImage;
  if (coverImage.startsWith("http")) return coverImage;
  return `http://localhost:5000${coverImage}`;
};

const formatProjectDateRange = (
  startDate?: string,
  endDate?: string | null,
  isOngoing?: boolean,
) => {
  const start = formatDate(startDate);
  if (!start) return "";
  if (isOngoing) return `${start} - Present`;
  const end = formatDate(endDate || undefined);
  return end ? `${start} - ${end}` : start;
};

const formatFileSize = (bytes = 0) => {
  if (!bytes) return "";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
};

const renderLanguageStars = (rating = 0) => {
  const stars = [];
  const totalStars = 5;
  for (let i = 1; i <= totalStars; i++) {
    stars.push(
      <img
        key={i}
        src={i <= rating ? starIcon : emptyStarIcon}
        alt={i <= rating ? "Filled Star" : "Empty Star"}
        className="candidate-star-icon"
      />
    );
  }
  return stars;
};

const CandidateDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<ConnectionState>("none");
  const [sendingConnection, setSendingConnection] = useState(false);
  const [mutualConnections, setMutualConnections] = useState<MutualConnection[]>([]);
  const userDataStr = localStorage.getItem("userData");
  const currentUser = userDataStr ? JSON.parse(userDataStr) : null;
  const currentUserId =
    currentUser?.id || currentUser?._id || currentUser?.userId || "";
  const isAllowedRole =
    currentUser?.role === "candidate" || currentUser?.role === "recruiter";

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`http://localhost:5000/api/profile/user/${id}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.message || "Failed to load candidate profile");
        }
        setProfile(data.user);
      } catch (err: any) {
        setError(err?.message || "Failed to load candidate profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  useEffect(() => {
    const fetchConnectionStatus = async () => {
      if (!profile?.id || !currentUserId || profile.id === currentUserId) return;
      if (!isAllowedRole) return;

      const token = localStorage.getItem("authToken");
      if (!token) return;

      try {
        const res = await fetch(
          `http://localhost:5000/api/connections/statuses?targetIds=${profile.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const data = await res.json();
        if (!res.ok) return;
        const next = (data?.statuses?.[profile.id] || "none") as ConnectionState;
        setConnectionStatus(next);
      } catch {
        setConnectionStatus("none");
      }
    };

    fetchConnectionStatus();
  }, [profile?.id, currentUserId, isAllowedRole]);

  useEffect(() => {
    const fetchMutualConnections = async () => {
      if (!profile?.id || !currentUserId || profile.id === currentUserId) {
        setMutualConnections([]);
        return;
      }
      if (!isAllowedRole) {
        setMutualConnections([]);
        return;
      }

      const token = localStorage.getItem("authToken");
      if (!token) {
        setMutualConnections([]);
        return;
      }

      try {
        const res = await fetch(
          `http://localhost:5000/api/connections/mutual/${profile.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const data = await res.json();
        if (!res.ok) {
          setMutualConnections([]);
          return;
        }
        setMutualConnections(data?.mutualConnections || []);
      } catch {
        setMutualConnections([]);
      }
    };

    fetchMutualConnections();
  }, [profile?.id, currentUserId, isAllowedRole]);

  const handleSendConnection = async () => {
    if (!profile?.id || !isAllowedRole || profile.id === currentUserId) return;

    const token = localStorage.getItem("authToken");
    if (!token) return;
    if (sendingConnection || connectionStatus !== "none") return;

    try {
      setSendingConnection(true);
      const res = await fetch("http://localhost:5000/api/connections/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipientId: profile.id }),
      });
      const data = await res.json();
      if (!res.ok) return;
      setConnectionStatus(data.status === "accepted" ? "friend" : "pending");
    } finally {
      setSendingConnection(false);
    }
  };

  const connectionLabel =
    connectionStatus === "friend"
      ? "Friend"
      : connectionStatus === "pending"
        ? "Pending"
        : "Connect";
  const connectionIcon =
    connectionStatus === "friend"
      ? friendIcon
      : connectionStatus === "pending"
        ? pendingIcon
        : connectIcon;
  const isSelfProfile = Boolean(profile?.id && profile.id === currentUserId);

  const handleOpenMessages = () => {
    if (!profile?.id) return;
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
      return;
    }
    if (!isAllowedRole) return;
    const role = currentUser?.role;
    if (role !== "candidate" && role !== "recruiter") return;
    navigate(`/${role}/messages?user=${profile.id}`);
  };

  return (
    <div className="candidate-details-page">
      <Navbar />

      <section className="candidate-details-hero">
        <img src={heroBgLeft} alt="" className="candidate-details-bg left" />
        <img src={heroBgRight} alt="" className="candidate-details-bg right" />
        <img src={heroCircle} alt="" className="candidate-details-circle" />
        <img src={heroIcon1} alt="" className="candidate-details-icon icon-1" />
        <img src={heroIcon2} alt="" className="candidate-details-icon icon-2" />
        <div className="candidate-details-hero-inner">
          {profile && (
            <div className="candidate-details-hero-card">
              <div className="candidate-details-hero-main">
                <img
                  src={resolveAvatar(profile.profilePicture)}
                  alt={profile.fullName}
                  className="candidate-details-avatar"
                />
                <div>
                  <h1>{profile.fullName}</h1>
                  <p>{profile.currentJobTitle || "Candidate"}</p>
                  <span>{profile.address || "Location not specified"}</span>
                  {profile.email && (
                    <div className="candidate-details-email">
                      {profile.email}
                    </div>
                  )}
                </div>
              </div>
              {!isSelfProfile && isAllowedRole && (
                <div className="candidate-details-hero-side">
                  <div className="candidate-details-connect-actions">
                    <button
                      type="button"
                      className={`candidate-details-connect-btn ${
                        connectionStatus === "pending"
                          ? "is-pending"
                          : connectionStatus === "friend"
                            ? "is-friend"
                            : ""
                      }`}
                      disabled={sendingConnection || connectionStatus !== "none"}
                      onClick={handleSendConnection}
                    >
                      <img src={connectionIcon} alt={connectionLabel} />
                      <span>{connectionLabel}</span>
                    </button>
                    <button
                      type="button"
                      className="candidate-details-connect-btn"
                      onClick={handleOpenMessages}
                    >
                      <img src={messageIcon} alt="Message" />
                      <span>Message</span>
                    </button>
                  </div>
                  {mutualConnections.length > 0 && (
                    <div className="candidate-details-mutuals">
                      <div className="candidate-details-mutual-avatars">
                        {mutualConnections.slice(0, 4).map((item) => (
                          <img
                            key={item.id}
                            src={resolveAvatar(item.profilePicture)}
                            alt={item.fullName}
                            title={item.fullName}
                          />
                        ))}
                      </div>
                      <span>
                        {mutualConnections.length} mutual connection
                        {mutualConnections.length > 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {loading && <div className="candidate-details-state">Loading...</div>}
          {error && !loading && (
            <div className="candidate-details-state error">{error}</div>
          )}
        </div>
      </section>

      <section className="candidate-details-content">
        {profile && (
          <div className="candidate-details-grid">
            <div className="candidate-details-column">
              <div className="candidate-details-card">
                <h3>About</h3>
                <div
                  className="candidate-description-text"
                  dangerouslySetInnerHTML={{
                    __html: profile.about || "No bio provided.",
                  }}
                />
              </div>

              <div className="candidate-details-card">
                <h3>Experience</h3>
                {profile.experience && profile.experience.length > 0 ? (
                  <div className="candidate-details-list">
                    {profile.experience.map((item, index) => (
                      <div key={index} className="candidate-details-item">
                        <h4>{item.jobTitle || "Role"}</h4>
                        <span>
                          {(item.organization || "Organization") +
                            (item.location ? ` • ${item.location}` : "")}
                        </span>
                        <div className="candidate-details-dates">
                          {formatDate(item.startDate)}{" "}
                          {item.isCurrent
                            ? " - Present"
                            : item.endDate
                              ? ` - ${formatDate(item.endDate)}`
                              : ""}
                        </div>
                        {item.description && (
                          <div
                            className="candidate-description-text"
                            dangerouslySetInnerHTML={{
                              __html: item.description,
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No experience added.</p>
                )}
              </div>

            </div>

          <div className="candidate-details-column">
            <div className="candidate-details-card">
              <h3>Skills</h3>
              <div className="candidate-details-tags">
                  {profile.skills && profile.skills.length > 0 ? (
                    profile.skills.map((skill, index) => (
                      <span key={index}>{skill.skillName}</span>
                    ))
                  ) : (
                    <span className="empty">Skills not added</span>
                  )}
                </div>
              </div>

              <div className="candidate-details-card">
                <h3>Resume</h3>
                {profile.resume ? (
                  <div className="candidate-details-resume">
                    <span className="candidate-details-resume-name">
                      Resume
                    </span>
                    {profile.resumeFileSize ? (
                      <span className="candidate-details-resume-size">
                        {formatFileSize(profile.resumeFileSize)}
                      </span>
                    ) : null}
                    <a
                      href={`http://localhost:5000${profile.resume}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="candidate-details-resume-view"
                    >
                      View
                    </a>
                  </div>
                ) : (
                  <p>No resume uploaded.</p>
                )}
              </div>

              <div className="candidate-details-card">
                <h3>Certifications</h3>
                {profile.certifications && profile.certifications.length > 0 ? (
                  <ul>
                    {profile.certifications.map((item, index) => (
                      <li key={index}>
                        {item.certificationName || "Certification"}{" "}
                        {item.issuingOrganization
                          ? `• ${item.issuingOrganization}`
                          : ""}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No certifications added.</p>
                )}
              </div>

              <div className="candidate-details-card">
                <h3>Languages</h3>
                {profile.languages && profile.languages.length > 0 ? (
                  <ul>
                    {profile.languages.map((item, index) => (
                      <li key={index}>
                        <div className="candidate-details-language">
                          <span>{item.languageName || "Language"}</span>
                          <div className="candidate-details-language-stars">
                            {renderLanguageStars(item.rating || 0)}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No languages added.</p>
                )}
              </div>

              <div className="candidate-details-card">
                <h3>Education</h3>
                {profile.education && profile.education.length > 0 ? (
                  <div className="candidate-details-list">
                    {profile.education.map((item, index) => (
                      <div key={index} className="candidate-details-item">
                        <h4>{item.degreeTitle || "Degree"}</h4>
                        <span>
                          {(item.institution || "Institution") +
                            (item.location ? ` • ${item.location}` : "")}
                        </span>
                        <div className="candidate-details-dates">
                          {formatDate(item.startDate)}{" "}
                          {item.isCurrent
                            ? " - Present"
                            : item.endDate
                              ? ` - ${formatDate(item.endDate)}`
                              : ""}
                        </div>
                        {item.description && (
                          <div
                            className="candidate-description-text"
                            dangerouslySetInnerHTML={{
                              __html: item.description,
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No education added.</p>
                )}
              </div>
            </div>

            <div className="candidate-details-card candidate-details-card-full">
              <h3>Projects</h3>
              {profile.projects && profile.projects.length > 0 ? (
                <div className="candidate-project-list">
                  {profile.projects.map((item, index) => (
                    <div key={index} className="candidate-project-item">
                      <img
                        src={getProjectImageUrl(item.coverImage)}
                        alt={item.projectTitle || "Project"}
                        className="candidate-project-img"
                        onError={(event) => {
                          event.currentTarget.src = projectImage;
                        }}
                      />
                      <div className="candidate-project-details">
                        <div className="candidate-project-header">
                          <div className="candidate-project-title-row">
                            <h4 className="candidate-project-title">
                              {item.projectTitle || "Project"}
                            </h4>
                          </div>
                          {formatProjectDateRange(
                            item.startDate,
                            item.endDate,
                            item.isOngoing,
                          ) && (
                            <p className="candidate-project-date-range">
                              {formatProjectDateRange(
                                item.startDate,
                                item.endDate,
                                item.isOngoing,
                              )}
                            </p>
                          )}
                        </div>

                        {item.technologies && (
                          <div className="candidate-project-technologies">
                            <span className="candidate-project-tech-label">
                              Technologies:
                            </span>
                            <div className="candidate-tech-tags">
                              {(Array.isArray(item.technologies)
                                ? item.technologies
                                : item.technologies.split(",")
                              )
                                .map((tech) => tech.trim())
                                .filter(Boolean)
                                .map((tech, techIndex) => (
                                  <span
                                    key={`${tech}-${techIndex}`}
                                    className="candidate-tech-tag"
                                  >
                                    {tech}
                                  </span>
                                ))}
                            </div>
                          </div>
                        )}

                        {item.projectUrl && (
                          <a
                            href={item.projectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="candidate-show-project-btn"
                          >
                            <span>View Project</span>
                            <img src={arrowIcon} alt="Arrow" />
                          </a>
                        )}

                        {(item.projectDescription || item.description) && (
                          <div
                            className="candidate-description-text-project"
                            dangerouslySetInnerHTML={{
                              __html:
                                item.projectDescription || item.description || "",
                            }}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No projects added.</p>
              )}
            </div>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default CandidateDetailsPage;

