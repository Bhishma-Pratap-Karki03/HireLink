import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";

// Import images
import logoImg from "../images/Register Page Images/Logo.png";
import dropdownArrow1 from "../images/Register Page Images/1_2299.svg";
import dropdownArrow2 from "../images/Register Page Images/1_2303.svg";
import dropdownArrow3 from "../images/Register Page Images/1_2307.svg";
import dropdownArrow4 from "../images/Register Page Images/1_2311.svg";
import applyDot from "../images/Register Page Images/1_2315.svg";
import menuIcon from "../images/Register Page Images/menu.png";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="site-header">
      <div className="container header-container">
        <Link to="/" className="logo-link">
          <img src={logoImg} alt="HireLink Logo" className="logo-img" />
        </Link>
        <nav className="main-navigation">
          <ul>
            <li>
              <a href="#">
                Home <img src={dropdownArrow1} alt="dropdown arrow" />
              </a>
            </li>
            <li>
              <a href="#">
                Browse Jobs <img src={dropdownArrow2} alt="dropdown arrow" />
              </a>
            </li>
            <li>
              <a href="#">
                Employers <img src={dropdownArrow3} alt="dropdown arrow" />
              </a>
            </li>
            <li>
              <a href="#">
                Candidates <img src={dropdownArrow4} alt="dropdown arrow" />
              </a>
            </li>
          </ul>
        </nav>
        <div className="header-actions">
          <a href="#" className="apply-now-link">
            <img src={applyDot} alt="" className="apply-dot" />
            Apply Now
          </a>
          <Link to="/register" className="btn btn-primary">
            Register/Login
          </Link>
        </div>
        <button
          className="mobile-nav-toggle"
          aria-label="Toggle navigation"
          onClick={toggleMobileMenu}
        >
          <img src={menuIcon} alt="Menu" className="menu-icon" />
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      <div
        className={`mobile-menu-overlay ${isMobileMenuOpen ? "active" : ""}`}
        onClick={closeMobileMenu}
      ></div>
      <nav className={`mobile-navigation ${isMobileMenuOpen ? "active" : ""}`}>
        <div className="mobile-menu-header">
          <h3>Menu</h3>
          <button
            className="mobile-menu-close"
            onClick={closeMobileMenu}
            aria-label="Close menu"
          >
            x
          </button>
        </div>
        <ul className="mobile-menu-list">
          <li>
            <a href="#" onClick={closeMobileMenu}>
              Home <img src={dropdownArrow1} alt="dropdown arrow" />
            </a>
          </li>
          <li>
            <a href="#" onClick={closeMobileMenu}>
              Browse Jobs <img src={dropdownArrow2} alt="dropdown arrow" />
            </a>
          </li>
          <li>
            <a href="#" onClick={closeMobileMenu}>
              Employers <img src={dropdownArrow3} alt="dropdown arrow" />
            </a>
          </li>
          <li>
            <a href="#" onClick={closeMobileMenu}>
              Candidates <img src={dropdownArrow4} alt="dropdown arrow" />
            </a>
          </li>
          <li>
            <a href="#" className="mobile-apply-now" onClick={closeMobileMenu}>
              <img src={applyDot} alt="" className="apply-dot" />
              Apply Now
            </a>
          </li>
          <li>
            <Link
              to="/register"
              className="btn btn-primary mobile-register-btn"
              onClick={closeMobileMenu}
            >
              Register/Login
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;