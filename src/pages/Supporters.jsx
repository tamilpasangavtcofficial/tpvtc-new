import React, { useState, useEffect } from 'react';
import './Supporters.css';

const Supporters = () => {
  const [supporters, setSupporters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchSupporters = async () => {
      const CACHE_KEY = 'tpvtc_supporters_cache';
      const CACHE_EXPIRY = 30 * 60 * 1000; // 30 mins
      const cached = localStorage.getItem(CACHE_KEY);
      
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_EXPIRY) {
            setSupporters(data);
            setLoading(false);
            return;
          }
        } catch (e) {}
      }

      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${API_URL}/supporters`);
        const data = await response.json();
        if (Array.isArray(data)) {
          const uniqueSupportersMap = new Map();
          data.forEach(sup => {
            const id = sup.truckersmp_id || sup.name;
            const amt = Number(sup.amount) || 0;
            if (uniqueSupportersMap.has(id)) {
              const existing = uniqueSupportersMap.get(id);
              existing.totalAmount += amt;
              // Ensure we keep the first/earliest support date
              if (new Date(sup.created_at) < new Date(existing.created_at)) {
                existing.created_at = sup.created_at;
              }
            } else {
              uniqueSupportersMap.set(id, { ...sup, totalAmount: amt });
            }
          });
          const sortedSupporters = Array.from(uniqueSupportersMap.values())
            .sort((a, b) => b.totalAmount - a.totalAmount);
          setSupporters(sortedSupporters);
          localStorage.setItem(CACHE_KEY, JSON.stringify({ data: sortedSupporters, timestamp: Date.now() }));
        } else {
          setSupporters([]);
        }
      } catch (error) {
        console.error('Failed to fetch supporters:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSupporters();
  }, []);

  return (
    <div className="supporters-wrapper">
      <div className="supporters-hero">
        <h4 className="overline">Wall of Fame</h4>
        <h1 className="display-title">Our <span className="text-accent">Supporters</span></h1>
        <p className="hero-subtitle">
          The incredible individuals who fuel our journey. Thank you for your unwavering support.
        </p>
      </div>

      <div className="container">
        {loading ? (
          <div className="loading-indicator">
            <div className="loader-bar"></div>
            <span>Loading Supporters...</span>
          </div>
        ) : supporters.length === 0 ? (
          <div className="text-center text-muted py-5">No supporters found at this time.</div>
        ) : (
          <div className="supporters-modern-container">
            <div className="supporters-tabs">
              <button className="tab-btn active">OFFICIAL PATRONS</button>
              <button className="tab-btn">COMMUNITY HEROES</button>
            </div>

            <div className="supporters-card-grid">
              {supporters.map((sup) => (
                <div key={sup.id} className="modern-supporter-card">
                  <div className="card-bg"></div>
                  <div className="card-overlay"></div>
                  
                  <div className="card-content">
                    <div className="card-header">
                      <div className="card-logo">
                        <img src="/src/assets/logo.svg" alt="TPVTC Logo" />
                      </div>
                      <div className="card-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                        </svg>
                      </div>
                    </div>

                    <div className="card-body">
                      <h3 className="card-name">{sup.name}</h3>
                      <div className="card-meta">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                        </svg>
                        <span>Member Since {new Date(sup.created_at || Date.now()).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="card-amount">
                        <span className="amt-label">Contributed:</span>
                        <span className="amt-value">₹{sup.totalAmount}</span>
                      </div>
                    </div>

                    <div className="card-footer">
                      <span className="footer-label">ID REFERENCE</span>
                      <span className="footer-value">#{sup.truckersmp_id}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Supporters;
