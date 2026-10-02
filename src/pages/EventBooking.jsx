import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Events.css';

const API_BASE_URL = 'https://tpvtc-backend.vercel.app';
const VTC_ID = 73933;

const EventBooking = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [activeEvent, setActiveEvent] = useState(null);
  const [eventLoading, setEventLoading] = useState(true);

  // Booking State
  const [slotsData, setSlotsData] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookingGroup, setBookingGroup] = useState(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  
  const [formData, setFormData] = useState({
    vtc_name: '',
    vtc_member_count: '',
    discord_username: '',
    vtc_role: '',
    vtc_link: '',
    selected_slot_id: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  // Fetch Event Details from backend or TMP
  useEffect(() => {
    window.scrollTo(0, 0);
    let cancelled = false;
    const fetchEventData = async () => {
      try {
        const res = await fetch(`/api/vtc/${VTC_ID}/events`);
        const json = await res.json();
        
        let foundEvent = (json?.response || []).find(e => String(e.id) === String(eventId));
        
        if (!cancelled && foundEvent) {
          setActiveEvent(foundEvent);
        } else if (!cancelled && !foundEvent) {
          // fallback if event not in upcoming list
          console.error("Event not found in list");
          navigate('/events');
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setEventLoading(false);
      }
    };
    fetchEventData();
    return () => { cancelled = true; };
  }, [eventId, navigate]);

  // Fetch Slots when Event is loaded
  useEffect(() => {
    if (!activeEvent) return;
    let cancelled = false;
    setSlotsLoading(true);
    const fetchSlots = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/slots/${activeEvent.id}`);
        const data = await res.json();
        if (!cancelled) {
          setSlotsData(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setSlotsLoading(false);
      }
    };
    fetchSlots();
    return () => { cancelled = true; };
  }, [activeEvent]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!formData.selected_slot_id) {
      setStatusMsg({ type: 'error', text: 'Please select a specific slot number.' });
      return;
    }

    setSubmitting(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/slots/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          vtc_member_count: Number(formData.vtc_member_count),
          event_id: Number(activeEvent.id),
          event_slot_id: Number(formData.selected_slot_id)
        })
      });
      if (res.ok) {
        setStatusMsg({ type: 'success', text: 'Slot requested successfully! Our team will review it within 24 hours.' });
        setFormData({ vtc_name: '', vtc_member_count: '', discord_username: '', vtc_role: '', vtc_link: '', selected_slot_id: '' });
        // Refresh slots
        const slotsRes = await fetch(`${API_BASE_URL}/api/slots/${activeEvent.id}`);
        const newSlots = await slotsRes.json();
        setSlotsData(newSlots);
        setTimeout(() => {
          setBookingGroup(null);
          setStatusMsg(null);
          setBookingModalOpen(false);
        }, 3000);
      } else {
        const d = await res.json();
        setStatusMsg({ type: 'error', text: d.message || 'Booking failed.' });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Network error occurred.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadImage = async (url, filename) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("Failed to download image", error);
      // Fallback: just open it in a new tab
      window.open(url, '_blank');
    }
  };

  if (eventLoading) {
    return (
      <div className="events-wrapper">
        <div className="loading-indicator mt-5">
          <div className="loader-bar"></div>
          <span>Loading Event Data...</span>
        </div>
      </div>
    );
  }

  if (!activeEvent) return null;

  const groups = slotsData.reduce((acc, s) => {
    const url = s.EventSlotImage?.slot_url || 'default';
    if (!acc[url]) acc[url] = [];
    acc[url].push(s);
    return acc;
  }, {});

  return (
    <div className="events-wrapper">
      <section className="event-detail-view container mt-5 pt-5">
        <button className="btn-back-events mb-4" onClick={() => navigate('/events')}>
          ← Back to Events List
        </button>
        
        <div className="event-showcase booking-only-view">
          <div className="booking-engine-section">
            <div className="booking-header">
              <div>
                <h2 className="event-title mb-2">{activeEvent.name}</h2>
                <h3 className="sub-heading text-accent">Slot Reservation Engine</h3>
              </div>
              <div className="legend">
                <span className="legend-item"><div className="dot avail"></div> Available</span>
                <span className="legend-item"><div className="dot pend"></div> Pending</span>
                <span className="legend-item"><div className="dot rsrv"></div> Reserved</span>
              </div>
            </div>

            {slotsLoading ? (
              <div className="loading-indicator mt-4">
                <div className="loader-bar"></div>
                <span>Loading parking telemetry...</span>
              </div>
            ) : Object.keys(groups).length === 0 ? (
              <div className="no-events mt-4"><p>No parking slots configured for this event yet.</p></div>
            ) : (
              <div className="parking-grid mt-4">
                {Object.entries(groups).map(([url, groupSlots], gIdx) => {
                  const booked = groupSlots.filter(s => s.booked_by).length;
                  const total = groupSlots.length;
                  const avail = total - booked;
                  const zoneName = groupSlots[0]?.EventSlotImage?.slot_name || `ZONE ${String.fromCharCode(65 + gIdx)}`;

                  return (
                    <div className="parking-zone-card" key={gIdx}>
                      <div className="map-view">
                        {url !== 'default' ? (
                          <>
                            <img src={url} alt="Parking Map" />
                            <div className="map-actions">
                              <button 
                                onClick={() => handleDownloadImage(url, `Parking_Map_${String(zoneName).replace(/\s+/g, '_')}.png`)}
                                className="btn-map-action"
                                title="Download Image"
                              >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                  <polyline points="7 10 12 15 17 10"></polyline>
                                  <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                              </button>
                              <button 
                                className="btn-map-action" 
                                onClick={() => setPreviewImage(url)}
                                title="Maximize Image"
                              >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="15 3 21 3 21 9"></polyline>
                                  <polyline points="9 21 3 21 3 15"></polyline>
                                  <line x1="21" y1="3" x2="14" y2="10"></line>
                                  <line x1="3" y1="21" x2="10" y2="14"></line>
                                </svg>
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="map-placeholder">No Map</div>
                        )}
                      </div>
                      <div className="zone-info">
                        
                        <div className="zone-head-old">
                          <div className="zone-head-top">
                            <span className="zone-label">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                              </svg>
                              PARKING ZONE
                            </span>
                            <span className="zone-count-pill">{avail} / {total} AVAILABLE</span>
                          </div>
                          <h4 className="zone-name">{zoneName}</h4>
                        </div>
                        
                        <div className="slots-chips-old">
                          {groupSlots.sort((a,b) => parseInt(a.slot_no) - parseInt(b.slot_no)).map(s => {
                            const isReserved = !!s.booked_by;
                            const isPending = !isReserved && s.BookingRequests?.length > 0;
                            let cName = 'chip-avail';
                            if (isReserved) cName = 'chip-rsrv';
                            else if (isPending) cName = 'chip-pend';
                            return <span key={s.id} className={`slot-chip-old ${cName}`}>#{s.slot_no}</span>;
                          })}
                        </div>
                        
                        <div className="slot-allocations-box">
                          <div className="allocations-title">SLOT ALLOCATIONS</div>
                          <div className="allocations-list">
                            {groupSlots.sort((a,b) => parseInt(a.slot_no) - parseInt(b.slot_no)).map(s => {
                              const isReserved = !!s.booked_by;
                              const isPending = !isReserved && s.BookingRequests?.length > 0;
                              let badgeText = 'AVAILABLE';
                              let badgeClass = 'badge-avail';
                              let nameText = '';
                              
                              if (isReserved) {
                                badgeText = 'RESERVED';
                                badgeClass = 'badge-rsrv';
                                nameText = s.booked_by;
                              } else if (isPending) {
                                badgeText = 'PENDING';
                                badgeClass = 'badge-pend';
                                nameText = s.BookingRequests[0]?.vtc_name || 'Pending Approval';
                              }

                              if (!isReserved && !isPending) {
                                return null;
                              }

                              return (
                                <div key={s.id} className="allocation-row">
                                  <span className="allocation-name">
                                    #{s.slot_no} {nameText && nameText.toLowerCase() !== String(s.slot_no).toLowerCase() ? nameText : ''}
                                  </span>
                                  <span className={`allocation-badge ${badgeClass}`}>{badgeText}</span>
                                </div>
                              );
                            })}
                            
                            {groupSlots.filter(s => s.booked_by || s.BookingRequests?.length > 0).length === 0 && (
                              <div className="allocation-row text-muted-custom">
                                <span>No slots allocated yet.</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <button 
                          className="btn-book-slot-old" 
                          disabled={avail === 0}
                          onClick={() => {
                            setBookingGroup(groupSlots);
                            setFormData({ ...formData, selected_slot_id: '' });
                            setStatusMsg(null);
                            setBookingModalOpen(true);
                          }}
                        >
                          {avail === 0 ? 'ZONE FULL' : 'REQUEST SLOT'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      {bookingGroup && bookingModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Reserve Slot</h3>
                <span className="modal-subtitle">SUBMIT OFFICIAL VTC CREDENTIALS</span>
              </div>
              <button className="btn-close" onClick={() => setBookingModalOpen(false)}>×</button>
            </div>

            <form onSubmit={handleBookingSubmit} className="booking-form">
              {statusMsg && (
                <div className={`status-msg ${statusMsg.type}`}>
                  {statusMsg.text}
                </div>
              )}

              <div className="input-group full-width">
                <label>Select Your Slot</label>
                <div className="slots-chips-old" style={{ gap: '10px' }}>
                  {bookingGroup.sort((a,b) => parseInt(a.slot_no) - parseInt(b.slot_no)).map(s => {
                    const disabled = !!s.booked_by;
                    const isSelected = formData.selected_slot_id == s.id;
                    let cName = 'chip-avail';
                    if (disabled) cName = 'chip-rsrv';
                    else if (isSelected) cName = 'chip-pend'; // Use pend style for selected visually, or create new
                    
                    return (
                      <label 
                        key={s.id} 
                        className={`slot-chip-old ${cName}`} 
                        style={{ 
                          cursor: disabled ? 'not-allowed' : 'pointer', 
                          opacity: disabled ? 0.5 : 1,
                          backgroundColor: isSelected ? 'var(--accent-blue)' : '',
                          borderColor: isSelected ? 'var(--accent-blue)' : ''
                        }}
                      >
                        <input 
                          type="radio" 
                          name="selected_slot_id" 
                          value={s.id} 
                          disabled={disabled}
                          onChange={(e) => setFormData({...formData, selected_slot_id: e.target.value})}
                          required
                          style={{ display: 'none' }}
                        />
                        #{s.slot_no}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="form-grid">
                <div className="input-group">
                  <label>VTC Name *</label>
                  <input type="text" value={formData.vtc_name} onChange={e => setFormData({...formData, vtc_name: e.target.value})} required placeholder="Enter your VTC Name"/>
                </div>
                <div className="input-group">
                  <label>Member Count *</label>
                  <input type="number" min="1" value={formData.vtc_member_count} onChange={e => setFormData({...formData, vtc_member_count: e.target.value})} required placeholder="e.g. 15"/>
                </div>
              
                <div className="input-group">
                  <label>Discord Tag *</label>
                  <input type="text" value={formData.discord_username} onChange={e => setFormData({...formData, discord_username: e.target.value})} required placeholder="User#1234"/>
                </div>
                <div className="input-group">
                  <label>Your Role *</label>
                  <input type="text" value={formData.vtc_role} onChange={e => setFormData({...formData, vtc_role: e.target.value})} required placeholder="e.g. Event Manager"/>
                </div>
              </div>

              <div className="input-group full-width">
                <label>VTC Link (Optional)</label>
                <input type="url" value={formData.vtc_link} onChange={e => setFormData({...formData, vtc_link: e.target.value})} placeholder="https://truckersmp.com/vtc/..."/>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setBookingModalOpen(false)}>CANCEL</button>
                <button type="submit" className="btn-submit" disabled={submitting}>
                  {submitting ? 'TRANSMITTING...' : 'SUBMIT REQUEST'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="modal-overlay image-preview-modal" onClick={() => setPreviewImage(null)}>
          <div className="image-preview-content" onClick={e => e.stopPropagation()}>
            <button className="btn-close-preview" onClick={() => setPreviewImage(null)}>×</button>
            <img src={previewImage} alt="Map Preview Full" className="full-preview-img" />
            <button 
              onClick={() => handleDownloadImage(previewImage, 'Parking_Map_Full.png')}
              className="btn-download-img"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              DOWNLOAD IMAGE
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default EventBooking;
