import React, { useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, Image as ImageIcon, Users, LogOut, Settings, Ticket, BarChart3 } from 'lucide-react';
import './HubLayout.css';

const HubLayout = () => {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('tpvtc_user');
  
  if (!userStr) {
    navigate('/login');
    return null;
  }

  const user = JSON.parse(userStr);

  useEffect(() => {
    const playClickSound = () => {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); 
        oscillator.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
      } catch (e) {
        // ignore if audio context is blocked
      }
    };

    const handleClick = (e) => {
      const target = e.target.closest('button, a, .hub-nav-link');
      if (target) {
        playClickSound();
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('tpvtc_token');
    localStorage.removeItem('tpvtc_user');
    navigate('/login');
  };

  return (
    <div className="hub-layout">
      {/* Sidebar */}
      <aside className="hub-sidebar">
        <div className="hub-sidebar-header">
          <img src="/src/assets/logo.svg" alt="TPVTC Logo" className="hub-logo" />
          <div className="hub-brand">
            <h4>Driver's Hub</h4>
            <span>Tamil Pasanga VTC</span>
          </div>
        </div>

        <nav className="hub-nav">
          <div className="nav-section-title">MAIN MENU</div>
          <NavLink to="/hub" end className={({isActive}) => `hub-nav-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/hub/stats" className={({isActive}) => `hub-nav-link ${isActive ? 'active' : ''}`}>
            <BarChart3 size={20} />
            <span>Analytics</span>
          </NavLink>
          
          <div className="nav-section-title mt-4">EVENTS & SLOTS</div>
          <NavLink to="/hub/slots" className={({isActive}) => `hub-nav-link ${isActive ? 'active' : ''}`}>
            <Ticket size={20} />
            <span>Official Event Slots</span>
          </NavLink>
          <NavLink to="/hub/requests" className={({isActive}) => `hub-nav-link ${isActive ? 'active' : ''}`}>
            <Users size={20} />
            <span>VTC Requests</span>
          </NavLink>
          <NavLink to="/hub/slot-logs" className={({isActive}) => `hub-nav-link ${isActive ? 'active' : ''}`}>
            <Ticket size={20} />
            <span>Slot Request Logs</span>
          </NavLink>

          <div className="nav-section-title mt-4">MEDIA & CONTENT</div>
          <NavLink to="/hub/albums" className={({isActive}) => `hub-nav-link ${isActive ? 'active' : ''}`}>
            <ImageIcon size={20} />
            <span>Albums</span>
          </NavLink>

          <div className="nav-section-title mt-4">COMMUNITY</div>
          <NavLink to="/hub/supporters" className={({isActive}) => `hub-nav-link ${isActive ? 'active' : ''}`}>
            <Users size={20} />
            <span>Our Supporters</span>
          </NavLink>
          <NavLink to="/hub/partners" className={({isActive}) => `hub-nav-link ${isActive ? 'active' : ''}`}>
            <Users size={20} />
            <span>Partners</span>
          </NavLink>
          <NavLink to="/hub/recognition" className={({isActive}) => `hub-nav-link ${isActive ? 'active' : ''}`}>
            <Users size={20} />
            <span>Monthly Recognition</span>
          </NavLink>

          <div className="nav-section-title mt-4">SYSTEM</div>
          <NavLink to="/hub/users" className={({isActive}) => `hub-nav-link ${isActive ? 'active' : ''}`}>
            <Users size={20} />
            <span>Users</span>
          </NavLink>
        </nav>

        <div className="hub-sidebar-footer">
          <button className="hub-nav-link text-danger w-100" onClick={handleLogout} style={{ border: 'none', background: 'transparent' }}>
            <LogOut size={20} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="hub-main">
        <header className="hub-topbar">
          <div className="hub-breadcrumbs">
            <span className="text-muted">Driver's Hub</span>
            <span className="mx-2 text-muted">/</span>
            <span className="text-white fw-bold">Overview</span>
          </div>
          <div className="hub-topbar-actions">
            <div className="hub-topbar-profile">
              <div className="hub-user-info text-end">
                <h5>{user.username}</h5>
                <span className="hub-role-badge">{user.role}</span>
              </div>
              <img src={user.avatar_url || 'https://via.placeholder.com/150'} alt={user.username} className="hub-avatar" />
            </div>
            <button className="icon-btn ms-3">
              <Settings size={20} />
            </button>
          </div>
        </header>

        <div className="hub-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default HubLayout;
