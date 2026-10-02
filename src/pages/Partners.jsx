import React, { useState, useEffect } from 'react';
import './Partners.css';

const Partners = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchPartners = async () => {
      const CACHE_KEY = 'tpvtc_partners_cache';
      const CACHE_EXPIRY = 30 * 60 * 1000;
      const cached = localStorage.getItem(CACHE_KEY);
      
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_EXPIRY) {
            setPartners(data);
            setLoading(false);
            return;
          }
        } catch (e) {}
      }

      try {
        const response = await fetch('/api/partners');
        const data = await response.json();
        const validData = Array.isArray(data) ? data : [];
        setPartners(validData);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data: validData, timestamp: Date.now() }));
      } catch (error) {
        console.error('Failed to fetch partners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  return (
    <div className="partners-wrapper">
      <div className="partners-hero">
        <h4 className="overline">United We Drive</h4>
        <h1 className="display-title">Our <span className="text-accent">Partners</span></h1>
        <p className="hero-subtitle">
          Collaborating with the finest Virtual Trucking Companies around the globe.
        </p>
      </div>

      <div className="container">
        {loading ? (
          <div className="loading-indicator">
            <div className="loader-bar"></div>
            <span>Loading Partners...</span>
          </div>
        ) : partners.length === 0 ? (
          <div className="text-center text-muted py-5">No partners found at this time.</div>
        ) : (
          <div className="partners-list">
            {partners.map((partner, idx) => {
              // Parse links from description
              const lines = (partner.description || '').split('\n');
              const cleanDesc = [];
              const socialLinks = [];
              const urlRegex = /(https?:\/\/[^\s]+)/;

              lines.forEach(line => {
                const match = line.match(urlRegex);
                if (match) {
                  const url = match[0];
                  let label = line.replace(url, '').replace(':', '').trim();
                  if (!label) label = 'Visit Link';
                  socialLinks.push({ label, url });
                } else {
                  cleanDesc.push(line);
                }
              });

              return (
                <div 
                  key={partner.id} 
                  className={`partner-row ${idx % 2 !== 0 ? 'row-reversed' : ''}`}
                >
                  <div className="partner-img-col">
                    <div className="partner-img-wrapper">
                      <img src={partner.image_url} alt={partner.name} className="partner-img" />
                      <div className="partner-glow"></div>
                    </div>
                  </div>
                  
                  <div className="partner-info-col">
                    <div className="partner-badge">{partner.partner_type}</div>
                    <h2 className="partner-name">{partner.name}</h2>
                    <p className="partner-desc">{cleanDesc.join('\n').trim()}</p>
                    
                    {socialLinks.length > 0 && (
                      <div className="partner-social-links">
                        {socialLinks.map((link, i) => (
                          <a key={i} href={link.url} target="_blank" rel="noreferrer" className="btn-social-link">
                            {link.label}
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                              <polyline points="15 3 21 3 21 9"></polyline>
                              <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                          </a>
                        ))}
                      </div>
                    )}
                    
                    {partner.vtc_link && partner.vtc_link.trim() !== '' && partner.vtc_link !== '#' && (
                      <a 
                        href={partner.vtc_link} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="btn-visit-partner"
                      >
                        <span>Visit VTC Page</span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                          <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Partners;
