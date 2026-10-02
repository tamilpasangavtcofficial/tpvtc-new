import React, { useEffect, useState } from 'react';
import './About.css';
import logo from '../assets/logo.gif';
import img1 from '../assets/gallery/gallery1.PNG';
import img2 from '../assets/gallery/gallery2.PNG';
import img3 from '../assets/gallery/gallery3.PNG';
import img4 from '../assets/gallery/gallery4.png';
import img5 from '../assets/gallery/gallery5.PNG';

const VTC_ID = 73933;

const About = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Fetch Team
  useEffect(() => {
    let cancelled = false;
    const loadTeam = async () => {
      try {
        const res = await fetch(`/api/vtc/${VTC_ID}/members`);
        const json = await res.json();
        const members = json?.response?.members || [];
        const map = new Map();

        for (const m of members) {
          let memberRoles = [];
          if (m.roles && Array.isArray(m.roles) && m.roles.length > 0) {
            memberRoles = m.roles.map(r => ({ name: r.name, order: r.order ?? 99 }));
          } else {
            memberRoles = [{ name: m.role || 'Member', order: 99 }];
          }

          for (const roleInfo of memberRoles) {
            const key = roleInfo.name;
            if (!map.has(key)) {
              map.set(key, { role: roleInfo.name, order: roleInfo.order, members: [] });
            }
            map.get(key).members.push(m);
          }
        }

        const grouped = Array.from(map.values())
          .filter(g => g.role.toLowerCase() !== 'supporters' && g.role.toLowerCase() !== 'supporter')
          .sort((a, b) => (a.order - b.order) || a.role.localeCompare(b.role))
          .map(g => ({ ...g, members: g.members.sort((a, b) => b.username.localeCompare(a.username)) }));

        if (!cancelled) setGroups(grouped);
      } catch (e) {
        console.error("Failed to fetch team data:", e);
        if (!cancelled) setGroups([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadTeam();
    return () => { cancelled = true; };
  }, []);

  // Attach observer to newly rendered team members
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [groups]);

  return (
    <div className="about-wrapper">

      {/* Hero Section */}
      <section className="about-hero-section container">
        <div className="hero-grid">
          <div className="hero-text-content fade-up">
            <h4 className="overline">Virtual Trucking Company</h4>
            <h1 className="display-title">
              Built by <span className="text-accent">Truckers,</span> <br />
              Driven by <span className="text-accent">Passion.</span>
            </h1>
            <p className="lead-text mt-4">
              Tamil Pasanga VTC is a proud Virtual Trucking Company built by Tamil truckers and friends who share the same passion for driving, simulation, and community. Founded in 2024 to unite Tamil players in TruckersMP.
            </p>
          </div>
          <div className="hero-visual fade-up delay-1">
            <div className="logo-container">
              <img src={logo} alt="TPVTC Logo" className="brand-logo" />
              <div className="accent-line"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Corporate Philosophy */}
      <section className="philosophy-section container">
        <div className="philosophy-grid">
          <div className="phil-block fade-up">
            <div className="phil-number">01</div>
            <h3 className="phil-title">Our Vision</h3>
            <p className="phil-desc">
              We believe trucking is more than just reaching a destination – it’s about the journey, teamwork, and the bonds we build on the road. We focus on creating convoys that are enjoyable, realistic, and highly organized.
            </p>
          </div>
          <div className="phil-block fade-up delay-1">
            <div className="phil-number">02</div>
            <h3 className="phil-title">Our Goal</h3>
            <p className="phil-desc">
              To build a strong and united community of drivers who share a passion for trucking and brotherhood. We actively push boundaries for realistic driving and a family environment.
            </p>
          </div>
          <div className="phil-block fade-up delay-2">
            <div className="phil-number">03</div>
            <h3 className="phil-title">Core Values</h3>
            <ul className="core-values-list mt-3">
              <li><span className="value-dot"></span> Realistic Driving Experience</li>
              <li><span className="value-dot"></span> Unity & Respect Worldwide</li>
              <li><span className="value-dot"></span> Professional Convoy Operations</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Editorial Gallery */}
      <section className="editorial-gallery fade-up">
        <div className="gallery-header container">
          <h2>Life on the Road</h2>
          <p>Moments captured from our official convoys and events.</p>
        </div>
        <div className="collage-grid container mt-4">
          <div className="collage-item item-1">
            <img src={img1} alt="Convoy" />
          </div>
          <div className="collage-item item-2">
            <img src={img2} alt="Convoy" />
          </div>
          <div className="collage-item item-3">
            <img src={img3} alt="Convoy" />
          </div>
          <div className="collage-item item-4">
            <img src={img4} alt="Convoy" />
          </div>
          <div className="collage-item item-5">
            <img src={img5} alt="Convoy" />
          </div>
        </div>
      </section>

      {/* Quote Break */}
      <section className="quote-break container fade-up">
        <div className="quote-content">
          <span className="quote-mark">"</span>
          <blockquote>
            For us, trucking is not just about kilometers – it’s about the bonds we build, the teamwork we share, and the pride of riding together under one name.
          </blockquote>
        </div>
      </section>

      {/* Directory (Team) Section */}
      <section className="directory-section container">
        <div className="directory-header fade-up">
          <h2 className="section-heading">Our Team</h2>
          <div className="heading-line"></div>
        </div>

        {loading ? (
          <div className="loading-indicator fade-up mt-5">
            <div className="loader-bar"></div>
            <span>Accessing Personnel Database...</span>
          </div>
        ) : (
          <div className="directory-list mt-5">
            {groups.length === 0 && <p className="text-secondary">No personnel records found.</p>}

            {groups.map((group, gIndex) => (
              <div key={group.role} className={`directory-group fade-up ${gIndex > 0 ? 'mt-5' : ''}`}>
                <div className="role-header-wrap">
                  <h3 className="role-title">{group.role}</h3>
                  <span className="role-count">{group.members.length} MEMBERS</span>
                </div>

                <div className="staff-grid">
                  {group.members.map(member => (
                    <div className="staff-card" key={member.id}>
                      <div className="staff-card-inner">
                        <div className="staff-avatar-box">
                          <img src={logo} alt="Member Avatar" className="staff-avatar" />
                        </div>
                        <div className="staff-info">
                          <h4 className="staff-name">{member.username}</h4>
                          <span className="staff-role-label">{group.role}</span>
                        </div>

                        <div className="staff-meta">
                          <div className="meta-item">
                            <span className="meta-label">Joined</span>
                            <span className="meta-value">{new Date(member.joinDate.replace(' ', 'T') + 'Z').toLocaleDateString()}</span>
                          </div>
                        </div>

                        {member.steamID && (
                          <div className="staff-action">
                            <a
                              href={`https://truckersmp.com/user/${member.user_id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="staff-btn"
                            >
                              TMP Profile
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
};

export default About;
