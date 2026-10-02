import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Calendar.css';

const VTC_ID = 73933;

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    let cancelled = false;
    
    const fetchAllEvents = async () => {
      try {
        setLoading(true);
        // Fetch hosting events
        const resHost = await fetch(`/api/vtc/${VTC_ID}/events`);
        const jsonHost = await resHost.json();
        
        // Fetch attending events
        const resAttend = await fetch(`/api/vtc/${VTC_ID}/events/attending`);
        const jsonAttend = await resAttend.json();
        
        const hostList = (jsonHost?.response || []).map(e => ({...e, calType: 'hosting'}));
        const attendList = (jsonAttend?.response || []).map(e => ({...e, calType: 'attending'}));
        
        const uniqueEventsMap = new Map();
        
        // Add hosted events first
        hostList.forEach(e => uniqueEventsMap.set(e.id, e));
        
        // Add attended events only if they aren't already in the map
        attendList.forEach(e => {
          if (!uniqueEventsMap.has(e.id)) {
            uniqueEventsMap.set(e.id, e);
          }
        });
        
        const combined = Array.from(uniqueEventsMap.values());
        
        // Sort by date ascending
        combined.sort((a, b) => new Date(a.start_at.replace(' ', 'T') + 'Z') - new Date(b.start_at.replace(' ', 'T') + 'Z'));
        
        if (!cancelled) {
          setEvents(combined);
        }
      } catch (err) {
        console.error("Failed to fetch calendar events:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    
    fetchAllEvents();
    
    // Observer for animations
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
    
    return () => { 
      cancelled = true; 
      observer.disconnect();
    };
  }, []);

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay(); // 0 is Sunday
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  // Make Monday the first day of the week
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase();
  const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  
  const calendarDays = [];
  const now = new Date();
  
  // Fill empty slots from previous month
  const prevMonthDays = getDaysInMonth(year, month - 1);
  for (let i = 0; i < startOffset; i++) {
    calendarDays.push({ type: 'empty', id: `empty-${i}`, date: prevMonthDays - startOffset + i + 1 });
  }
  
  // Fill actual days
  let monthEventsCount = 0;
  let pastEventsCount = 0;
  let upcomingEventsCount = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const dayEvents = events.filter(e => {
      const eDate = new Date(e.start_at.replace(' ', 'T') + 'Z');
      return eDate.getDate() === d && eDate.getMonth() === month && eDate.getFullYear() === year;
    });
    
    dayEvents.forEach(e => {
      monthEventsCount++;
      const eDate = new Date(e.start_at.replace(' ', 'T') + 'Z');
      if (eDate < now) pastEventsCount++;
      else upcomingEventsCount++;
    });
    
    calendarDays.push({
      type: 'day',
      id: `day-${d}`,
      date: d,
      events: dayEvents,
      isToday: now.getDate() === d && now.getMonth() === month && now.getFullYear() === year
    });
  }

  // Fill remaining slots for next month
  const totalSlots = startOffset + daysInMonth;
  const remainingSlots = totalSlots % 7 === 0 ? 0 : 7 - (totalSlots % 7);
  for (let i = 1; i <= remainingSlots; i++) {
    calendarDays.push({ type: 'empty', id: `empty-next-${i}`, date: i });
  }

  const isCurrentOrPastMonth = () => {
    return currentDate.getFullYear() < now.getFullYear() || 
           (currentDate.getFullYear() === now.getFullYear() && currentDate.getMonth() <= now.getMonth());
  };

  return (
    <div className="calendar-wrapper">
      <div className="calendar-app-container fade-up">
        
        {/* App Header */}
        <div className="app-header">
          <div className="header-left">
            <div className="header-title-row">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <h1>Event Calendar</h1>
            </div>
            
            <div className="header-stats">
              <div className="stat-pill upcoming">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                {monthEventsCount} Convoys This Month
              </div>
            </div>
          </div>
          
          <div className="header-right">
            <div className="month-navigator">
              <button 
                className="nav-btn" 
                onClick={prevMonth}
                disabled={isCurrentOrPastMonth()}
                style={{ opacity: isCurrentOrPastMonth() ? 0.2 : 1, cursor: isCurrentOrPastMonth() ? 'not-allowed' : 'pointer' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>
              <div className="current-month">{monthName}</div>
              <button className="nav-btn" onClick={nextMonth}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="cal-grid-header">
          {dayNames.map(d => (
            <div key={d} className="cal-day-name">{d}</div>
          ))}
        </div>
        
        {loading ? (
          <div className="loading-indicator my-5">
            <div className="loader-bar"></div>
            <span>Syncing events...</span>
          </div>
        ) : (
          <div className="cal-grid">
            {calendarDays.map((cell) => {
              if (cell.type === 'empty') {
                return (
                  <div key={cell.id} className="cal-day empty">
                    <span className="day-number">{cell.date}</span>
                  </div>
                );
              }
              
              return (
                <div key={cell.id} className={`cal-day ${cell.isToday ? 'today' : ''}`}>
                  <span className="day-number">{cell.date}</span>
                  
                  <div className="day-events-list">
                    {cell.events.map(ev => (
                      <div 
                        key={ev.id} 
                        className={`day-event type-${ev.calType}`}
                        title={ev.name}
                        onClick={() => ev.calType === 'hosting' ? navigate(`/events/${ev.id}`) : window.open(`https://truckersmp.com${ev.url}`, '_blank')}
                      >
                        {ev.calType === 'hosting' ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                        ) : (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                        )}
                        <span className="event-text">{ev.name}</span>
                      </div>
                    ))}
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

export default Calendar;
