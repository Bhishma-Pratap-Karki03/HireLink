import "../styles/Footer.css";
import { Link } from "react-router-dom";

// Import images
import logoImg from "../images/Register Page Images/Logo.png";
import socialBg1 from "../images/Register Page Images/1_2758.svg";
import socialFg1 from "../images/Register Page Images/1_2759.svg";
import socialBg2 from "../images/Register Page Images/1_2762.svg";
import socialFg2 from "../images/Register Page Images/1_2768.svg";
import socialBg3 from "../images/Register Page Images/1_2771.svg";
import socialFg3 from "../images/Register Page Images/1_2773.svg";
import socialBg4 from "../images/Register Page Images/1_2777.svg";
import socialFg4 from "../images/Register Page Images/1_2778.svg";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-main">
          <div className="footer-about">
            <img src={logoImg} alt="HireLink Logo" className="footer-logo" />
            <p>
              HireLink connects candidates and recruiters in one smart platform
              to discover opportunities, manage applications, and hire faster.
            </p>
          </div>
          <div className="footer-links-grid">
            <div className="footer-links-col">
              <h4>Company</h4>
              <ul>
                <li>
                  <Link to="/about-us">About us</Link>
                </li>
                <li>
                  <a href="#">Our Team</a>
                </li>
                <li>
                  <a href="#">Products</a>
                </li>
                <li>
                  <a href="#">Contact</a>
                </li>
              </ul>
            </div>
            <div className="footer-links-col">
              <h4>Product</h4>
              <ul>
                <li>
                  <a href="#">Feature</a>
                </li>
                <li>
                  <a href="#">Pricing</a>
                </li>
                <li>
                  <a href="#">Credit</a>
                </li>
                <li>
                  <a href="#">FAQ</a>
                </li>
              </ul>
            </div>
            <div className="footer-links-col">
              <h4>Download</h4>
              <ul>
                <li>
                  <a href="#">iOS</a>
                </li>
                <li>
                  <a href="#">Android</a>
                </li>
                <li>
                  <a href="#">Microsoft</a>
                </li>
                <li>
                  <a href="#">Desktop</a>
                </li>
              </ul>
            </div>
            <div className="footer-links-col">
              <h4>Support</h4>
              <ul>
                <li>
                  <a href="#">Privacy</a>
                </li>
                <li>
                  <a href="#">Help</a>
                </li>
                <li>
                  <a href="#">Terms</a>
                </li>
                <li>
                  <a href="#">FAQ</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <hr className="footer-divider" />
        <div className="footer-bottom">
          <p className="copyright">
            Copyright {String.fromCharCode(169)}{currentYear} <a href="#">HireLink</a>. All Rights Reserved
          </p>
          <div className="social-links">
            <a href="#" className="social-icon" aria-label="Facebook">
              <img src={socialBg1} alt="" className="social-bg" />
              <img src={socialFg1} alt="Facebook icon" className="social-fg" />
            </a>
            <a href="#" className="social-icon" aria-label="Twitter">
              <img src={socialBg2} alt="" className="social-bg" />
              <img src={socialFg2} alt="Twitter icon" className="social-fg" />
            </a>
            <a href="#" className="social-icon" aria-label="Instagram">
              <img src={socialBg3} alt="" className="social-bg" />
              <img src={socialFg3} alt="Instagram icon" className="social-fg" />
            </a>
            <a href="#" className="social-icon" aria-label="TikTok">
              <img src={socialBg4} alt="" className="social-bg" />
              <img src={socialFg4} alt="TikTok icon" className="social-fg" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

