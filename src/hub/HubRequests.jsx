import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Inbox, CheckCircle, XCircle, ExternalLink, Users, Loader2, Check, X, Zap, Shield, Link as LinkIcon, User, MapPin } from 'lucide-react';
import './HubRequests.css';

const HubRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusModal, setStatusModal] = useState({ show: false, title: '', message: '', type: 'success' });
  const [officialEvents, setOfficialEvents] = useState({});

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchData = async () => {
    setLoading(true);
    try {
      const eRes = await fetch(`${API_BASE_URL}/api/tmp/vtc/events`);
      const eData = await eRes.json();
      const nameMap = {};
      (eData.response || []).forEach(e => { nameMap[e.id] = e.name; });
      setOfficialEvents(nameMap);

      const res = await fetch(`${API_BASE_URL}/api/slots/requests/pending`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setRequests(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      }
    } catch (e) {
      showStatus("Connection Error", "Could not reach the operational server.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [API_BASE_URL]);

  const handleAction = async (id, status) => {
    if (saving) return;
    setSaving(true);
    try {
      const endpoint = status === 'approved'
        ? `${API_BASE_URL}/api/slots/approve/${id}`
        : `${API_BASE_URL}/api/slots/reject/${id}`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('tpvtc_token')}` }
      });

      if (res.ok) {
        showStatus(
          status === 'approved' ? "Slot Reserved!" : "Request Removed",
          status === 'approved' ? "The VTC has been officially assigned their spot." : "The application has been cleared from the queue.",
          status === 'approved' ? "success" : "error"
        );
        fetchData();
      } else {
        showStatus("Action Failed", "Database rejected the command.", "error");
      }
    } catch (e) {
      showStatus("Execution Error", "Check server connectivity.", "error");
    } finally {
      setSaving(false);
    }
  };

  const showStatus = (title, message, type) => {
    setStatusModal({ show: true, title, message, type });
  };

  return (
    <div className="hub-requests-page">
      <header className="hub-page-header">
        <div className="header-content">
          <h1>VTC Request Hub</h1>
          <p>Review parking applications and manage event participants.</p>
        </div>
        <div className="header-actions">
          <button onClick={fetchData} className="hub-btn-outline icon-left">
            <Zap size={16} /> <span>REFRESH QUEUE</span>
          </button>
          <div className="requests-counter">
            <span className="count">{requests.length}</span>
            <span className="label">PENDING</span>
          </div>
        </div>
      </header>

      {loading && requests.length === 0 ? (
        <div className="hub-loading w-100">
          <div className="spinner"></div>
        </div>
      ) : requests.length === 0 ? (
        <div className="hub-empty-state grid-col-span-full">
          <Inbox size={48} />
          <h4 className="mt-3">Queue Status: Clear</h4>
          <p>No pending VTC applications were detected.</p>
        </div>
      ) : (
        <div className="hub-requests-grid">
          {requests.map(req => (
            <div key={req.id} className="bento-box request-card p-0">
              <div className="request-card-header">
                {req.EventSlot?.EventSlotImage?.slot_url ? (
                  <img src={req.EventSlot.EventSlotImage.slot_url} alt="Slot Map" className="slot-map-bg" />
                ) : (
                  <div className="slot-map-bg placeholder"><Shield size={40} /></div>
                )}
                
                <div className="request-card-overlay">
                  <a href={`https://truckersmp.com/events/${req.event_id}`} target="_blank" rel="noreferrer" className="event-link-badge">
                    <ExternalLink size={12} />
                    <span className="truncate-text">{officialEvents[req.event_id] || `EVENT #${req.event_id}`}</span>
                  </a>
                  <div className="slot-badge">
                    <MapPin size={12} /> SLOT #{req.EventSlot?.slot_no || req.event_slot_id}
                  </div>
                </div>
              </div>

              <div className="request-card-vtc">
                <h4><Shield size={16} className="text-accent" /> {req.vtc_name}</h4>
                <span className="participants-badge"><Users size={12} /> {req.vtc_member_count} PARTICIPANTS</span>
              </div>

              <div className="request-card-body">
                <div className="req-info-row">
                  <div className="req-icon"><User size={16} /></div>
                  <div className="req-info-text">
                    <label>DISCORD IDENTITY</label>
                    <span>{req.discord_username || 'NOT_PROVIDED'}</span>
                  </div>
                </div>
                
                <div className="req-info-row">
                  <div className="req-icon"><LinkIcon size={16} /></div>
                  <div className="req-info-text">
                    <label>TMP PROFILE</label>
                    <a href={req.vtc_link} target="_blank" rel="noreferrer">
                      {req.vtc_link?.replace('https://truckersmp.com/', '') || 'VIEW_LINK'}
                    </a>
                  </div>
                </div>

                <div className="request-actions">
                  <button onClick={() => handleAction(req.id, 'approved')} disabled={saving} className="hub-btn-primary approve-btn">
                    <Check size={18} /> APPROVE
                  </button>
                  <button onClick={() => handleAction(req.id, 'rejected')} disabled={saving} className="hub-btn-outline reject-btn">
                    <X size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {statusModal.show && createPortal(
        <div className="hub-modal-overlay">
          <div className="bento-box hub-modal text-center">
            <div className={`modal-icon ${statusModal.type}`}>
              {statusModal.type === 'error' ? <XCircle size={32} /> : <CheckCircle size={32} />}
            </div>
            <h3 className="mb-2">{statusModal.title}</h3>
            <p className="text-muted mb-4">{statusModal.message}</p>
            <button onClick={() => setStatusModal({ ...statusModal, show: false })} className="hub-btn-primary mx-auto">DISMISS</button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default HubRequests;
