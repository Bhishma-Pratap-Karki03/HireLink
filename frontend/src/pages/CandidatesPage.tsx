import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/CandidatesPage.css";
import heroBgLeft from "../images/Employers Page Images/8_189.svg";
import heroBgRight from "../images/Employers Page Images/8_197.svg";
import heroCircle from "../images/Employers Page Images/8_205.svg";
import heroIcon1 from "../images/Employers Page Images/8_208.svg";
import heroIcon2 from "../images/Employers Page Images/8_209.svg";
import defaultAvatar from "../images/Register Page Images/Default Profile.webp";
import connectIcon from "../images/Employers Page Images/connect-icon.png";
import messageIcon from "../images/Employers Page Images/message-icon.png";

type CandidateSkill = {
  skillName: string;
};

type CandidateExperience = {
  startDate?: string;
  endDate?: string | null;
  isCurrent?: boolean;
};

type CandidateItem = {
  id?: string;
  _id?: string;
  fullName: string;
  email: string;
  currentJobTitle?: string;
  address?: string;
  profilePicture?: string;
  skills?: CandidateSkill[];
  experience?: CandidateExperience[];
};

const resolveAvatar = (profilePicture?: string) => {
  if (!profilePicture) return defaultAvatar;
  if (profilePicture.startsWith("http")) return profilePicture;
  return `http://localhost:5000${profilePicture}`;
};

const getExperienceYears = (experience?: CandidateExperience[]) => {
  if (!experience || experience.length === 0) return 0;
  const now = new Date();
  const totalMonths = experience.reduce((sum, item) => {
    const start = item.startDate ? new Date(item.startDate) : null;
    const end = item.isCurrent
      ? now
      : item.endDate
        ? new Date(item.endDate)
        : now;
    if (
      !start ||
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return sum;
    }
    const months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());
    return sum + Math.max(0, months);
  }, 0);
  return Math.round(totalMonths / 12);
};

const CandidatesPage = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<CandidateItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [minExperience, setMinExperience] = useState("");

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch("http://localhost:5000/api/users/candidates");
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.message || "Failed to load candidates");
        }
        setCandidates(data.candidates || []);
      } catch (err: any) {
        setError(err?.message || "Failed to load candidates");
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  const filteredCandidates = useMemo(() => {
    const searchValue = search.trim().toLowerCase();
    const locationValue = locationFilter.trim().toLowerCase();
    const skillValue = skillFilter.trim().toLowerCase();
    const minYears = Number(minExperience) || 0;

    return candidates.filter((candidate) => {
      const skills = (candidate.skills || []).map((s) => s.skillName || "");
      const skillsText = skills.join(" ").toLowerCase();
      const nameMatch = candidate.fullName.toLowerCase().includes(searchValue);
      const titleMatch = (candidate.currentJobTitle || "")
        .toLowerCase()
        .includes(searchValue);
      const skillMatch = skillsText.includes(searchValue);
      const searchPass = !searchValue || nameMatch || titleMatch || skillMatch;

      const locationPass =
        !locationValue ||
        (candidate.address || "").toLowerCase().includes(locationValue);

      const skillFilterPass = !skillValue || skillsText.includes(skillValue);

      const experienceYears = getExperienceYears(candidate.experience);
      const experiencePass = !minExperience || experienceYears >= minYears;

      return searchPass && locationPass && skillFilterPass && experiencePass;
    });
  }, [candidates, search, locationFilter, skillFilter, minExperience]);

  return (
    <div className="candidates-page">
      <Navbar />
      <section className="candidates-hero">
        <img src={heroBgLeft} alt="" className="candidates-hero-bg left" />
        <img src={heroBgRight} alt="" className="candidates-hero-bg right" />
        <img src={heroCircle} alt="" className="candidates-hero-circle" />
        <img src={heroIcon1} alt="" className="candidates-hero-icon icon-1" />
        <img src={heroIcon2} alt="" className="candidates-hero-icon icon-2" />
        <div className="candidates-hero-inner">
          <div className="candidates-hero-content">
            <h1>Browse Candidates</h1>
            <p>Find skilled candidates and explore their profiles.</p>
          </div>
        </div>
      </section>

      <section className="candidates-search">
        <input
          type="text"
          placeholder="Search by name, title, or skill"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </section>

      <section className="candidates-body">
        <aside className="candidates-filters">
          <div className="candidates-filter-card">
            <h3>Location</h3>
            <input
              type="text"
              placeholder="e.g. Kathmandu"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            />
          </div>
          <div className="candidates-filter-card">
            <h3>Skill</h3>
            <input
              type="text"
              placeholder="e.g. React, UI/UX"
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
            />
          </div>
          <div className="candidates-filter-card">
            <h3>Experience (years)</h3>
            <input
              type="number"
              min="0"
              placeholder="Min years"
              value={minExperience}
              onChange={(e) => setMinExperience(e.target.value)}
            />
          </div>
        </aside>

        <div className="candidates-grid">
          {loading && <div className="candidates-state">Loading...</div>}
          {error && !loading && (
            <div className="candidates-state error">{error}</div>
          )}
          {!loading && !error && filteredCandidates.length === 0 && (
            <div className="candidates-state">No candidates found.</div>
          )}

          {filteredCandidates.map((candidate) => {
            const allSkills = (candidate.skills || [])
              .map((s) => s.skillName)
              .filter(Boolean);
            const maxVisibleSkills = 2;
            const skills = allSkills.slice(0, maxVisibleSkills);
            const remainingSkills = Math.max(
              allSkills.length - skills.length,
              0,
            );
            const experienceYears = getExperienceYears(candidate.experience);
            const cardId = candidate.id || candidate._id || candidate.email;

            return (
              <article
                key={cardId}
                className="candidates-card"
                onClick={() => navigate(`/candidate/${cardId}`)}
                role="button"
              >
                <div className="candidates-card-header">
                  <img
                    src={resolveAvatar(candidate.profilePicture)}
                    alt={candidate.fullName}
                  />
                  <div>
                    <h3>{candidate.fullName}</h3>
                    <p>{candidate.currentJobTitle || "Candidate"}</p>
                    <span>{candidate.address || "Location not specified"}</span>
                  </div>
                </div>
                <div className="candidates-card-meta">
                  <div>
                    <span>Email</span>
                    <strong>{candidate.email}</strong>
                  </div>
                </div>
                <div className="candidates-card-skills">
                  {skills.length > 0 ? (
                    <>
                      {skills.map((skill) => (
                        <span key={skill}>{skill}</span>
                      ))}
                      {remainingSkills > 0 && (
                        <span className="more">+{remainingSkills}</span>
                      )}
                    </>
                  ) : (
                    <span className="empty">Skills not added</span>
                  )}
                </div>
                <div className="candidates-card-actions">
                  <button
                    type="button"
                    title="Send connection request"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <img src={connectIcon} alt="Connect" />
                    <span>Connect</span>
                  </button>
                  <button
                    type="button"
                    title="Message"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <img src={messageIcon} alt="Message" />
                    <span>Message</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CandidatesPage;
