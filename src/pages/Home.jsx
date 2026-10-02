import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, CheckCircle2, Navigation, Activity, ShieldCheck, Users, CalendarDays, Award, Target, Trophy, Star, TrendingUp, Volume2, VolumeX } from 'lucide-react';
import './Home.css';
import gallery1 from '../assets/gallery/gallery1.PNG';
import gallery2 from '../assets/gallery/gallery2.PNG';
import gallery4 from '../assets/gallery/gallery4.png';
import gallery5 from '../assets/gallery/gallery5.PNG';
import gallery6 from '../assets/gallery/gallery6.png';

const newsImages = [gallery1, gallery2, gallery4, gallery5, gallery6];

import introVideo from '../assets/tpvtc - intro.mp4';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const MedalBadge = ({ rank }) => {
  const rankText = rank === 1 ? "1st" : rank === 2 ? "2nd" : "3rd";
  const bgColor = rank === 1 ? "#FFD700" : rank === 2 ? "#C0C0C0" : "#CD7F32";
  const darkColor = rank === 1 ? "#B8860B" : rank === 2 ? "#808080" : "#8B4513";

  return (
    <div className="medal-wrapper" style={{ position: 'relative', width: rank === 1 ? '140px' : '110px', height: rank === 1 ? '160px' : '130px' }}>
      <svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg">
        <path d="M35 60 L25 95 L40 85 L50 95 L65 105 L75 95 L65 60" fill={bgColor} opacity="0.8" />
        <path d="M35 60 L20 100 L40 85 L35 60" fill={darkColor} />
        <path d="M65 60 L80 100 L60 85 L65 60" fill={darkColor} />
        <path d="M50 10 L54 12 L58 10 L62 14 L67 13 L70 18 L75 18 L77 23 L82 25 L82 30 L86 33 L85 38 L88 42 L85 47 L86 52 L82 55 L82 60 L77 62 L75 67 L70 67 L67 72 L62 71 L58 75 L54 73 L50 75 L46 73 L42 75 L38 71 L33 72 L30 67 L25 67 L23 62 L18 60 L18 55 L14 52 L15 47 L12 42 L15 38 L14 33 L18 30 L18 25 L23 23 L25 18 L30 18 L33 13 L38 14 L42 10 L46 12 Z"
          fill={bgColor}
          stroke={darkColor}
          strokeWidth="1"
        />
        <circle cx="50" cy="42" r="24" fill={`url(#grad-${rank})`} stroke={darkColor} strokeWidth="1" />
        <circle cx="50" cy="42" r="21" fill="none" stroke={darkColor} strokeWidth="0.5" strokeDasharray="1,1" />
        <defs>
          <linearGradient id={`grad-${rank}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: bgColor, stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: darkColor, stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        <text x="50" y="50" textAnchor="middle" fill="black" style={{ fontSize: '20px', fontWeight: '900', fontFamily: 'serif' }}>{rankText}</text>
      </svg>
    </div>
  );
};

const Home = () => {
  const [news, setNews] = useState([]);
  const [achievements, setAchievements] = useState(null);
  const [partners, setPartners] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [loadingAchievements, setLoadingAchievements] = useState(true);
  const [loadingPartners, setLoadingPartners] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = 0.15; // Set volume to 15%
    }
  }, []);

  useEffect(() => {
    const fetchNews = async () => {
      const CACHE_KEY = 'tpvtc_news_cache';
      const CACHE_EXPIRY = 30 * 60 * 1000;
      const cached = localStorage.getItem(CACHE_KEY);
      
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_EXPIRY) {
            setNews(data);
            setLoadingNews(false);
            return;
          }
        } catch (e) {}
      }

      try {
        const res = await fetch(`${API_URL}/tmp/vtc/news`);
        const data = await res.json();
        if (!data.error && data.response && data.response.news) {
          // Sort news by published date descending (latest first)
          const sortedNews = data.response.news.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
          const slicedNews = sortedNews.slice(0, 3);
          setNews(slicedNews);
          localStorage.setItem(CACHE_KEY, JSON.stringify({ data: slicedNews, timestamp: Date.now() }));
        } else {
          setNews([]);
        }
      } catch (err) {
        console.error('Error fetching news:', err);
        setNews([]);
      } finally {
        setLoadingNews(false);
      }
    };

    // Fetch Achievements with caching
    const CACHE_KEY = 'tpvtc_achievements_cache';
    const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

    const fetchAchievements = async () => {
      // Check cache first
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_EXPIRY) {
            setAchievements(data);
            setLoadingAchievements(false);
            return;
          }
        } catch (e) {
          // ignore parsing error
        }
      }

      try {
        const res = await fetch(`${API_URL}/achievements/latest`);
        const data = await res.json();
        if (data && data.p1_name) {
          setAchievements(data);
          localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
        } else {
          // Mock if missing
          const mockData = {
            month: 'August 2026',
            p1_name: 'Rubanoffl', p1_role: 'DRIVER', p1_distance: 23278,
            p2_name: 'jesustyson', p2_role: 'DRIVER', p2_distance: 8708,
            p3_name: 'Siranjeevi_123', p3_role: 'SENIOR DRIVER', p3_distance: 8192
          };
          setAchievements(mockData);
          localStorage.setItem(CACHE_KEY, JSON.stringify({ data: mockData, timestamp: Date.now() }));
        }
      } catch (err) {
        console.error('Error fetching achievements:', err);
        const mockData = {
          month: 'August 2026',
          p1_name: 'Rubanoffl', p1_role: 'DRIVER', p1_distance: 23278,
          p2_name: 'jesustyson', p2_role: 'DRIVER', p2_distance: 8708,
          p3_name: 'Siranjeevi_123', p3_role: 'SENIOR DRIVER', p3_distance: 8192
        };
        setAchievements(mockData);
      } finally {
        setLoadingAchievements(false);
      }
    };

    const fetchPartners = async () => {
      const CACHE_KEY = 'tpvtc_home_partners_cache';
      const CACHE_EXPIRY = 30 * 60 * 1000;
      const cached = localStorage.getItem(CACHE_KEY);
      
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_EXPIRY) {
            setPartners(data);
            setLoadingPartners(false);
            return;
          }
        } catch (e) {}
      }

      try {
        const res = await fetch(`${API_URL}/partners`);
        const data = await res.json();
        const validData = Array.isArray(data) ? data : [];
        setPartners(validData);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data: validData, timestamp: Date.now() }));
      } catch (err) {
        console.error('Error fetching partners:', err);
      } finally {
        setLoadingPartners(false);
      }
    };

    fetchNews();
    fetchAchievements();
    fetchPartners();
  }, []);

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <video
          ref={videoRef}
          autoPlay
          loop
          playsInline
          muted={isMuted}
          disablePictureInPicture
          disableRemotePlayback
          className="hero-video-bg"
        >
          <source src={introVideo} type="video/mp4" />
        </video>
        <div className="hero-overlay"></div>
        <button
          className="mute-toggle-btn"
          onClick={() => setIsMuted(!isMuted)}
          aria-label={isMuted ? "Unmute video" : "Mute video"}
        >
          {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </button>
        <div className="hero-glow hero-glow-1"></div>
        <div className="hero-glow hero-glow-2"></div>

        <div className="hero-content">
          <div className="badge animate-fade-in-up">
            <span className="badge-dot pulse-dot"></span>
            NEXT-GENERATION VIRTUAL TRUCKING
          </div>
          <h1 className="hero-title animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Your Passion. <br />
            <span className="text-gradient">Our Brotherhood.</span>
          </h1>
          <p className="hero-subtitle animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Engineered for community, realism, and uncompromised precision across Euro Truck Simulator 2 and American Truck Simulator. Tamil Pasanga VTC connects virtual drivers with dedicated convoy events and intelligent real-time tracking.
          </p>
          <div className="hero-actions animate-fade-in-up" style={{ animationDelay: '0.3s', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <a href="https://discord.com/invite/FtYBxZxTBF" target="_blank" rel="noopener noreferrer" className="btn-primary btn-large">
              Join Discord <ArrowRight size={18} />
            </a>
            <a href="https://truckersmp.com/vtc/73933-tamil_pasanga" target="_blank" rel="noopener noreferrer" className="btn-outline btn-large">
              Apply to VTC
            </a>
            <a href="/events" className="btn-outline btn-large">
              Explore Events
            </a>
          </div>

          <div className="hero-features animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="feature-item">
              <CheckCircle2 size={18} className="text-accent" />
              <span>Verified Top VTC</span>
            </div>
            <div className="feature-item">
              <Navigation size={18} className="text-accent" />
              <span>Weekly Convoys</span>
            </div>
            <div className="feature-item">
              <Activity size={18} className="text-accent" />
              <span>Live Telematics</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container stats-grid">
          <div className="stat-item">
            <div className="stat-icon-wrapper">
              <Award size={18} /> <span>LEGACY</span>
            </div>
            <h2 className="stat-value text-gradient">2+</h2>
            <p className="stat-desc">Years Virtual Trucking Experience</p>
          </div>
          <div className="stat-item">
            <div className="stat-icon-wrapper">
              <Navigation size={18} /> <span>DISTANCE</span>
            </div>
            <h2 className="stat-value text-gradient">2.4M+</h2>
            <p className="stat-desc">Virtual Miles Driven Annually</p>
          </div>
          <div className="stat-item">
            <div className="stat-icon-wrapper">
              <CheckCircle2 size={18} /> <span>ATTENDANCE</span>
            </div>
            <h2 className="stat-value text-gradient">98.9%</h2>
            <p className="stat-desc">Event Participation Rate</p>
          </div>
          <div className="stat-item">
            <div className="stat-icon-wrapper">
              <Users size={18} /> <span>COMMUNITY</span>
            </div>
            <h2 className="stat-value text-gradient">24/7</h2>
            <p className="stat-desc">Active Discord & Support Team</p>
          </div>
        </div>
      </section>

      {/* Partners Showcase Section */}
      <section className="home-partners-section container" style={{ marginTop: '4rem', marginBottom: '4rem' }}>
        <div className="section-header text-center">
          <span className="section-subtitle">OUR NETWORK</span>
          <h2 className="section-title mx-auto">Our Partners</h2>
        </div>

        {loadingPartners ? (
          <div className="loading-state glass-panel text-center">Loading Partners...</div>
        ) : partners.length > 0 ? (
          <div className="home-partners-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center' }}>
            {partners.map(partner => (
              <div key={partner.id} className="home-partner-card glass-panel" style={{ width: '240px', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', transition: 'transform 0.3s ease' }}>
                <div className="home-partner-logo" style={{ width: '100%', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', backgroundColor: '#0f172a', borderRadius: '12px', padding: '10px' }}>
                  <img src={partner.image_url} alt={partner.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
                <h4 className="home-partner-name" style={{ fontSize: '1.1rem', margin: '0', fontWeight: '700', color: '#fff' }}>{partner.name}</h4>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {/* Monthly Achievements Podium Section */}
      <section className="achievements-section container">
        <div className="section-header text-center">
          <span className="section-subtitle">RECOGNITION</span>
          <h2 className="section-title mx-auto">
            Monthly Achievements
            {achievements?.month && <span style={{ color: 'var(--text-secondary)', fontWeight: 500, marginLeft: '12px' }}>— {achievements.month}</span>}
          </h2>
          <div className="d-flex align-items-center justify-content-center" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '1.5rem', color: 'var(--text-primary)', fontWeight: '800', fontSize: '1.1rem' }}>
            <TrendingUp size={22} color="var(--accent-blue)" />
            <span style={{ letterSpacing: '1px' }}>TOP 3 PERFORMERS</span>
          </div>
        </div>

        {loadingAchievements ? (
          <div className="loading-state glass-panel">Loading Achievements...</div>
        ) : achievements ? (
          <div className="podium-container">
            {[
              { rank: 2, name: achievements.p2_name || 'TBA', km: achievements.p2_distance || 0, role: achievements.p2_role || 'DRIVER' },
              { rank: 1, name: achievements.p1_name || 'TBA', km: achievements.p1_distance || 0, role: achievements.p1_role || 'DRIVER' },
              { rank: 3, name: achievements.p3_name || 'TBA', km: achievements.p3_distance || 0, role: achievements.p3_role || 'DRIVER' }
            ].map((p, i) => (
              <div key={i} className={`podium-item podium-item--${p.rank}`}>
                <div className="podium-avatar-wrap">
                  <MedalBadge rank={p.rank} />
                </div>
                <div className="podium-rank-box">
                  <h3 className="podium-name">{p.name}</h3>
                  <div className="podium-role">{p.role}</div>
                  <div className="podium-distance">{p.km}</div>
                  <div className="podium-label">KM DRIVEN</div>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {/* Identity & Mission Section (Redesigned) */}
      <section className="identity-mission-section container">
        <div className="im-grid">

          {/* Identity */}
          <div className="im-card identity-card glass-panel">
            <div className="im-icon-wrapper">
              <Users size={28} />
            </div>
            <span className="section-subtitle">IDENTITY</span>
            <h2 className="im-title">Who We Are</h2>
            <p className="im-desc">
              Tamil Pasanga VTC is a completely community-driven Virtual Trucking Company forged by Tamil players who share an intense passion for trucks, deep simulation, and unbreakable brotherhood. We proudly carry our Tamil identity into the global scene of TruckersMP, crafting not just a VTC, but a resilient family where organic teamwork, pure fun, and utmost respect always take priority.
            </p>
          </div>

          {/* Mission */}
          <div className="im-card mission-card glass-panel">
            <div className="im-icon-wrapper mission-icon">
              <Target size={28} />
            </div>
            <span className="section-subtitle mission-subtitle">MISSION</span>
            <h2 className="im-title">Our Directive</h2>
            <p className="im-desc">
              Our essential mission is to powerfully unite Tamil truckers and dedicated friends from around the globe under one single, unified banner. We exist to provide a highly polished, professional space to enjoy remarkably realistic trucking, coordinate massive cross-continental convoys, and build unforgettable memories on the open digital road. We welcome both veterans and beginners.
            </p>
          </div>

        </div>

        {/* Mission Features Below */}
        <div className="mission-features-grid">
          <div className="mission-feature-item glass-panel">
            <CheckCircle2 size={24} className="text-accent-green" />
            <span className="mf-text">Professional Driving Standards</span>
          </div>
          <div className="mission-feature-item glass-panel">
            <CheckCircle2 size={24} className="text-accent-green" />
            <span className="mf-text">Exceptional Team Spirit</span>
          </div>
          <div className="mission-feature-item glass-panel">
            <CheckCircle2 size={24} className="text-accent-green" />
            <span className="mf-text">Proud Culture & Global Vibes</span>
          </div>
          <div className="mission-feature-item glass-panel">
            <CheckCircle2 size={24} className="text-accent-green" />
            <span className="mf-text">Premium Convoys & High-End Events</span>
          </div>
        </div>
      </section>

      {/* Services/Features Section */}
      <section className="features-section container">
        <div className="section-header text-center">
          <span className="section-subtitle">OUR CAPABILITIES</span>
          <h2 className="section-title mx-auto">Precision Virtual Trucking Designed for Enthusiasts</h2>
        </div>

        <div className="features-grid">
          <div className="feature-card glass-panel">
            <div className="card-icon"><CalendarDays size={24} /></div>
            <h3>Public Events</h3>
            <p>Join our massive community convoys. We organize meticulously planned routes with dedicated convoy control and media teams.</p>
            <a href="/events" className="card-link">Learn more <ArrowRight size={14} /></a>
          </div>
          <div className="feature-card glass-panel">
            <div className="card-icon"><Activity size={24} /></div>
            <h3>Real-time Tracking</h3>
            <p>Advanced job logging and real-time telematics for all our drivers, ensuring fair competition and accurate leaderboards.</p>
            <a href="/about" className="card-link">Learn more <ArrowRight size={14} /></a>
          </div>
          <div className="feature-card glass-panel">
            <div className="card-icon"><ShieldCheck size={24} /></div>
            <h3>Dedicated Teams</h3>
            <p>From Media to Event Control, our specialized teams work around the clock to provide the best virtual trucking experience.</p>
            <a href="/supporters" className="card-link">Learn more <ArrowRight size={14} /></a>
          </div>
          <div className="feature-card glass-panel">
            <div className="card-icon"><Users size={24} /></div>
            <h3>Active Community</h3>
            <p>Engage with hundreds of passionate drivers. Share your journey, join voice channels, and make lifelong friends.</p>
            <a href="/contact" className="card-link">Learn more <ArrowRight size={14} /></a>
          </div>
        </div>
      </section>

      {/* News & Announcements Section (Integrated) */}
      <section className="news-section container">
        <div className="section-header text-center">
          <span className="section-subtitle">LATEST UPDATES</span>
          <h2 className="section-title mx-auto">News & Announcements</h2>
        </div>

        {loadingNews ? (
          <div className="loading-state glass-panel">Loading Latest News...</div>
        ) : (
          <div className="news-grid">
            {news.map((item, i) => {
              const bgImage = newsImages[i % newsImages.length];
              const formattedDate = new Date(item.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

              return (
                <div key={item.id} className="news-card glass-panel">
                  <div className="news-image" style={{ backgroundImage: `url(${bgImage})` }}></div>
                  <div className="news-content">
                    <span className="news-date">{formattedDate}</span>
                    <h3>{item.title}</h3>
                    <p>{item.content_summary ? item.content_summary.substring(0, 120) + (item.content_summary.length > 120 ? '...' : '') : 'Check out our latest news and community updates.'}</p>
                    <a href={`https://truckersmp.com/vtc/73933/news/${item.id}`} target="_blank" rel="noopener noreferrer" className="card-link">Read full story <ArrowRight size={14} /></a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="cta-section container">
        <div className="cta-content glass-panel">
          <div className="cta-glow"></div>
          <h2 className="cta-title">Ready to Start Your Engines?</h2>
          <p className="cta-desc">Connect with our community today and experience virtual trucking at its finest.</p>
          <div className="cta-actions">
            <a href="https://discord.com/invite/FtYBxZxTBF" target="_blank" rel="noopener noreferrer" className="btn-primary btn-large cta-btn">Join Discord <ArrowRight size={18} /></a>
            <a href="https://truckersmp.com/vtc/73933-tamil_pasanga" target="_blank" rel="noopener noreferrer" className="btn-outline btn-large cta-btn">Apply to VTC</a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
