import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Events.css';

const VTC_ID = 73933;

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    const fetchEvents = async () => {
      try {
        const res = await fetch(`/api/vtc/${VTC_ID}/events`);
        const json = await res.json();
        const now = new Date();
        const parseDate = (s) => new Date(s.replace(' ', 'T') + 'Z');
        
        let upcomings = (json?.response || [])
          .filter(e => parseDate(e.start_at) > now)
          .sort((a, b) => parseDate(a.start_at) - parseDate(b.start_at));
        
        if (!cancelled) {
          setEvents(upcomings);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchEvents();
    return () => { cancelled = true; };
  }, []);

  // Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [loading, events]);

  return (
    <div className="events-wrapper">
      <section className="events-hero container fade-up">
        <h4 className="overline">Operations & Logistics</h4>
        <h1 className="display-title">Public <span className="text-accent">Events</span></h1>
        <p className="lead-text mt-3">
          Join Tamil Pasanga VTC on the road. We host high-quality, professional convoys 
          with dedicated CC teams and verified routes.
        </p>
      </section>

      <section className="events-content container">
        {loading ? (
          <div className="loading-indicator fade-up mt-5">
            <div className="loader-bar"></div>
            <span>Syncing TMP Operations...</span>
          </div>
        ) : events.length === 0 ? (
          <div className="no-events fade-up">
            <h3>No Operations Scheduled</h3>
            <p>We are currently planning our next big event. Stay tuned!</p>
          </div>
        ) : (
          <div className="event-ticket-list fade-up">
            {events.map((e) => (
              <div key={e.id} className="event-ticket">
                <div className="ticket-date-section">
                  <span className="t-month">{new Date(e.meetup_at.replace(' ', 'T') + 'Z').toLocaleString('en-US', { month: 'short' })}</span>
                  <span className="t-day">{new Date(e.meetup_at.replace(' ', 'T') + 'Z').toLocaleString('en-US', { day: '2-digit' })}</span>
                  <span className="t-year">{new Date(e.meetup_at.replace(' ', 'T') + 'Z').toLocaleString('en-US', { year: 'numeric' })}</span>
                </div>
                
                <div className="ticket-main-section">
                  {e.banner && <img src={e.banner} alt={e.name} className="ticket-bg" />}
                  <div className="ticket-overlay">
                    <div className="ticket-meta">
                      <span className="badge-game">{e.game}</span>
                      <span className="ticket-server">{e.server?.name || 'SERVER TBD'}</span>
                    </div>
                    <h3 className="ticket-title">{e.name}</h3>
                    <div className="ticket-route">
                      <div className="route-point">
                        <span className="r-label">DEPART</span>
                        <span className="r-val">{e.departure?.city || 'TBD'}</span>
                      </div>
                      <div className="route-divider">→</div>
                      <div className="route-point">
                        <span className="r-label">ARRIVE</span>
                        <span className="r-val">{e.arrive?.city || 'TBD'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="ticket-action-section">
                  <div className="ticket-times">
                    <div><small>MEETUP</small> <span>{new Date(e.meetup_at.replace(' ', 'T') + 'Z').toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></div>
                    <div><small>DEPART</small> <span>{new Date(e.start_at.replace(' ', 'T') + 'Z').toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></div>
                  </div>
                  
                  <div className="ticket-buttons">
                    <a href={`https://truckersmp.com${e.url}`} target="_blank" rel="noreferrer" className="btn-ticket-outline">
                      TMP Details
                    </a>
                    <button className="btn-ticket-fill" onClick={() => navigate(`/events/${e.id}`)}>
                      Reserve Slot
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Events;
