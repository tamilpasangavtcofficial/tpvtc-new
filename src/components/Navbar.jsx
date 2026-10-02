import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Menu, X } from 'lucide-react';
import logo from '../assets/logo.svg';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Our Public Events', path: '/events' },
    { name: 'Our Calendar', path: '/calendar' },
    { name: 'Our Supporters', path: '/supporters' },
    { name: 'Our Partners', path: '/partners' },
    { name: 'Our Gallery', path: '/albums' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src={logo} alt="Tamil Pasanga VTC" className="navbar-logo-img" />
          <span className="logo-text">Tamil Pasanga <span className="logo-highlight">VTC</span></span>
        </Link>

        <nav className={`navbar-links ${isOpen ? 'active' : ''}`}>
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path} 
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="navbar-actions">
          <Link to="/login" className="btn-login">
            <User size={18} />
            <span>Login</span>
          </Link>
          <button className="mobile-menu-btn" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
