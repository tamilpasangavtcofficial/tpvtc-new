import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, Mail, MapPin, Phone } from 'lucide-react';
import logo from '../assets/logo.svg';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-top container">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <img src={logo} alt="Tamil Pasanga VTC" className="footer-logo-img" />
            <span className="logo-text">Tamil Pasanga <span className="logo-highlight">VTC</span></span>
          </Link>
          <p className="footer-description">
            Next-generation virtual trucking network delivering precision logistics and unmatched realism across Euro Truck Simulator 2 and American Truck Simulator.
          </p>
          <div className="system-status">
            <span className="status-dot"></span>
            <span>All Fleet Systems Operational</span>
          </div>
        </div>

        <div className="footer-links-grid">
          <div className="footer-column">
            <h4>COMPANY</h4>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/supporters">Supporters</Link></li>
              <li><Link to="/partners">Partners</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>EVENTS & MEDIA</h4>
            <ul>
              <li><Link to="/events">Public Events</Link></li>
              <li><Link to="/calendar">Event Calendar</Link></li>
              <li><Link to="/albums">Media Albums</Link></li>
              <li><Link to="/leaderboard">Driver Rankings</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>SUPPORT</h4>
            <ul>
              <li><a href="mailto:tamilpasangavtcofficial@gmail.com"><Mail size={14} /> tamilpasangavtcofficial@gmail.com</a></li>
              <li><a href="https://discord.com/invite/FtYBxZxTBF" target="_blank" rel="noopener noreferrer"><Phone size={14} /> Discord Support</a></li>
              <li><Link to="/contact"><MapPin size={14} /> Global Hub</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom container">
        <div className="copyright">
          &copy; {new Date().getFullYear()} Tamil Pasanga VTC . All rights reserved.
        </div>
        <div className="legal-links">
          <Link to="/terms-of-use">Terms of Use</Link>
          <Link to="/privacy-policy">Privacy Policy</Link>
        </div>
        <div className="social-links">
          <a href="https://www.instagram.com/tamil_pasanga_vtc" target="_blank" rel="noopener noreferrer" title="Instagram">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          </a>
          <a href="https://www.facebook.com/profile.php?id=61590679895200" target="_blank" rel="noopener noreferrer" title="Facebook">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
          </a>
          <a href="https://x.com/tamilpasangavtc" target="_blank" rel="noopener noreferrer" title="Twitter / X">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
          </a>
          <a href="https://www.youtube.com/@powerfulgamingtamil" target="_blank" rel="noopener noreferrer" title="YouTube">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
          </a>
        </div>
      </div>

      <div className="footer-developer">
        <span className="dev-text">Developed by</span>
        <a href="https://bavithragithan-portfolio.netlify.app/" target="_blank" rel="noopener noreferrer" className="dev-name text-gradient" style={{ textDecoration: 'none' }}>SK BAVI</a>
      </div>
    </footer>
  );
};

export default Footer;
