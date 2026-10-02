import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Check, X, Ticket, Calendar, Clock, Loader2, Upload, Grid, Map as MapIcon, Hash, RotateCcw } from 'lucide-react';
import './HubSlots.css';

const HubSlots = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [setupEvent, setSetupEvent] = useState(null);
  const [existingSlots, setExistingSlots] = useState([]);
  
  // Custom Modal State
  const [statusModal, setStatusModal] = useState({ show: false, title: '', message: '', type: 'success' });
  const [confirmAction, setConfirmAction] = useState(null);
  const [nameModal, setNameModal] = useState({ show: false, id: null, name: '' });
  const [assignModal, setAssignModal] = useState({ show: false, slot: null, vtcName: '' });
  
  const [slotUrl, setSlotUrl] = useState('');
  const [slotFrom, setSlotFrom] = useState(1);
  const [slotTo, setSlotTo] = useState(50);
  const [slotName, setSlotName] = useState('Main Area');
  
  const [slotType, setSlotType] = useState('range');
  const [customSlotsText, setCustomSlotsText] = useState('');
  
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const showStatus = (title, message, type = 'success', onConfirm = null) => {
    setStatusModal({ show: true, title, message, type });
    if (onConfirm) setConfirmAction(() => onConfirm);
    else setConfirmAction(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventRes = await fetch(`${API_BASE_URL}/api/tmp/vtc/events`);
        const eData = await eventRes.json();
        
        const now = new Date();
        const filtered = (eData.response || [])
          .filter(e => new Date(e.start_at) >= now)
          .sort((a, b) => new Date(a.start_at) - new Date(b.start_at));
        setEvents(filtered);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchData();
  }, [API_BASE_URL]);

  useEffect(() => {
    const fetchExisting = async () => {
      if (!setupEvent) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/slots/${setupEvent.id}`);
        const data = await res.json();
        setExistingSlots(data.sort((a,b) => parseInt(a.slot_no) - parseInt(b.slot_no)));
      } catch(e) { console.error(e); }
    };
    fetchExisting();
  }, [setupEvent, API_BASE_URL]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const token = localStorage.getItem('tpvtc_token');
    try {
      const signRes = await fetch(`${API_BASE_URL}/api/images/upload-sign`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const signData = await signRes.json();
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', signData.api_key);
      formData.append('timestamp', signData.timestamp);
      formData.append('signature', signData.signature);
      formData.append('folder', signData.folder);

      const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${signData.cloud_name}/image/upload`, {
        method: 'POST',
        body: formData
      });
      const cloudData = await cloudRes.json();
      if (cloudData.secure_url) setSlotUrl(cloudData.secure_url);
    } catch (err) { showStatus("Upload Error", "Cloudinary access restricted.", "error"); } finally { setUploading(false); }
  };

  const handleSaveSetup = async () => {
    if (!slotUrl || !slotName) return showStatus("Setup Required", "Complete map and name fields.", "error");
    if (slotType === 'range' && parseInt(slotFrom) > parseInt(slotTo)) return showStatus("Range Conflict", "The 'From' slot cannot be higher than 'To'.", "error");
    
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/slots/official/setup`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('tpvtc_token')}`
        },
        body: JSON.stringify({ 
          event_id: setupEvent.id, 
          slot_url: slotUrl, 
          slot_name: slotName,
          from: slotType === 'range' ? slotFrom : undefined, 
          to: slotType === 'range' ? slotTo : undefined,
          custom_slots: slotType === 'custom' ? customSlotsText.split('\n').map(s => s.trim()).filter(s => s) : undefined
        })
      });
      if (res.ok) {
        showStatus("Batch Online", `Successfully setup Slots!`, "success");
        const updatedRes = await fetch(`${API_BASE_URL}/api/slots/${setupEvent.id}`);
        const updatedData = await updatedRes.json();
        setExistingSlots(updatedData.sort((a,b) => parseInt(a.slot_no) - parseInt(b.slot_no)));
      }
    } catch (e) { showStatus("Setup Failed", "Database rejected slot range injection.", "error"); } finally { setSaving(false); }
  };

  const handleSaveName = async () => {
    if (!nameModal.name) return showStatus("Required field", "Enter a name for the sector.", "error");
    
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/slots/official/sector/name/${nameModal.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('tpvtc_token')}`
        },
        body: JSON.stringify({ slot_name: nameModal.name })
      });
      
      if (res.ok) {
        showStatus("Success", "Sector name updated!", "success");
        setNameModal({ ...nameModal, show: false });
        const updatedRes = await fetch(`${API_BASE_URL}/api/slots/${setupEvent.id}`);
        const updatedData = await updatedRes.json();
        setExistingSlots(updatedData.sort((a,b) => parseInt(a.slot_no) - parseInt(b.slot_no)));
      } else {
        const data = await res.json();
        showStatus("Update Blocked", data.message || "Failed to update name.", "error");
      }
    } catch (e) { showStatus("Update Failed", "Connection failure.", "error"); } finally { setSaving(false); }
  };

  const handleDeleteSector = (sectorId, sectorName) => {
    showStatus(
      "Remove Parking Zone?",
      `This will completely delete "${sectorName}" and all its slots. This action CANNOT be undone.`,
      "confirm",
      async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/slots/official/sector/${sectorId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('tpvtc_token')}` }
          });
          if (res.ok) {
            showStatus("Sector Removed", "Zone deleted successfully.", "success");
            const updatedRes = await fetch(`${API_BASE_URL}/api/slots/${setupEvent.id}`);
            const updatedData = await updatedRes.json();
            setExistingSlots(updatedData.sort((a,b) => parseInt(a.slot_no) - parseInt(b.slot_no)));
          }
        } catch (e) { showStatus("Error", "Could not remove sector.", "error"); }
      }
    );
  };

  const handleClearSlot = (slot) => {
    showStatus(
      "Clear Reservation?", 
      `Are you sure you want to remove the booking for ${slot.booked_by}? This will make Slot #${slot.slot_no} available again.`,
      "confirm",
      async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/slots/clear/${slot.id}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('tpvtc_token')}` }
          });
          if (res.ok) {
            const updatedRes = await fetch(`${API_BASE_URL}/api/slots/${setupEvent.id}`);
            const updatedData = await updatedRes.json();
            setExistingSlots(updatedData.sort((a,b) => parseInt(a.slot_no) - parseInt(b.slot_no)));
          }
        } catch (e) { showStatus("Error", "Could not clear slot.", "error"); }
      }
    );
  };

  const handleManualAssign = async () => {
    if (!assignModal.vtcName) return showStatus("Required field", "Enter VTC name to assign.", "error");
    try {
      const res = await fetch(`${API_BASE_URL}/api/slots/assign/${assignModal.slot.id}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('tpvtc_token')}` 
        },
        body: JSON.stringify({ vtc_name: assignModal.vtcName })
      });
      if (res.ok) {
        showStatus("Success", `Slot assigned to ${assignModal.vtcName}`, "success");
        setAssignModal({ show: false, slot: null, vtcName: '' });
        const updatedRes = await fetch(`${API_BASE_URL}/api/slots/${setupEvent.id}`);
        const updatedData = await updatedRes.json();
        setExistingSlots(updatedData.sort((a,b) => parseInt(a.slot_no) - parseInt(b.slot_no)));
      }
    } catch(e) { showStatus("Error", "Could not assign slot.", "error"); }
  };

  return (
    <div className="hub-slots-page">
      <header className="hub-page-header">
        <div className="header-content">
          <h1>Event Slot Engine</h1>
          <p>Configure dynamic parking maps and handle incoming VTC reservations.</p>
        </div>
        {setupEvent && (
          <button onClick={() => setSetupEvent(null)} className="hub-btn-outline icon-left">
            <RotateCcw size={16} /> <span>Back to Events</span>
          </button>
        )}
      </header>

      {setupEvent ? (
        <div className="hub-setup-container">
          <div className="bento-grid-2-col">
            {/* Left Column: Event Card */}
            <div className="bento-box event-overview">
              <div className="overview-image-wrapper">
                <img src={setupEvent.banner} alt="Event Banner" />
              </div>
              <div className="overview-info">
                <h3>{setupEvent.name}</h3>
                <span className="hub-badge text-accent">
                  <Calendar size={14} /> {new Date(setupEvent.start_at).toLocaleDateString()}
                </span>
              </div>
              
              <div className="overview-notes">
                <div className="note-item">
                  <div className="note-icon"><Check size={14} /></div>
                  <p>Existing slots in the selected range will be seamlessly overwritten.</p>
                </div>
                <div className="note-item">
                  <div className="note-icon"><Check size={14} /></div>
                  <p>Changes synchronize instantly with the public booking interface.</p>
                </div>
              </div>
            </div>

            {/* Right Column: Configuration */}
            <div className="bento-box config-panel">
              <div className="bento-header mb-4">
                <h3 className="d-flex align-items-center gap-2">
                  <MapIcon size={20} className="text-accent" /> Configure Sector
                </h3>
              </div>
              
              <div className="config-section">
                <label className="hub-label">1. PARKING GRAPHIC</label>
                <div className="hub-upload-zone">
                  {uploading ? (
                    <Loader2 size={32} className="animate-spin text-accent" />
                  ) : slotUrl ? (
                    <div className="upload-preview">
                      <img src={slotUrl} alt="Slot Map" />
                      <label className="upload-edit-btn">
                        <input type="file" className="d-none" onChange={handleFileUpload} accept="image/*" />
                        <Upload size={16} />
                      </label>
                    </div>
                  ) : (
                    <label className="upload-prompt">
                      <input type="file" className="d-none" onChange={handleFileUpload} accept="image/*" />
                      <div className="upload-icon-circle">
                        <Upload size={24} />
                      </div>
                      <h5>Select Map Image</h5>
                      <p>Upload a high-res JPG/PNG floor plan</p>
                    </label>
                  )}
                </div>
              </div>

              <div className="config-section mt-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <label className="hub-label m-0">2. SECTOR DETAILS</label>
                  <div className="hub-toggle-group">
                    <button className={slotType === 'range' ? 'active' : ''} onClick={() => setSlotType('range')}>Range</button>
                    <button className={slotType === 'custom' ? 'active' : ''} onClick={() => setSlotType('custom')}>Custom</button>
                  </div>
                </div>
                
                <div className="hub-input-group mb-3">
                  <label>SECTOR NAME</label>
                  <input type="text" value={slotName} onChange={e => setSlotName(e.target.value)} placeholder="e.g. Premium Garage" />
                </div>

                {slotType === 'range' ? (
                  <div className="hub-row">
                    <div className="hub-input-group">
                      <label>FROM SLOT #</label>
                      <div className="input-with-icon">
                        <Hash size={16} className="text-accent" />
                        <input type="number" value={slotFrom} onChange={e => setSlotFrom(e.target.value)} />
                      </div>
                    </div>
                    <div className="hub-input-group">
                      <label>TO SLOT #</label>
                      <div className="input-with-icon">
                        <Hash size={16} className="text-accent" />
                        <input type="number" value={slotTo} onChange={e => setSlotTo(e.target.value)} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="hub-input-group">
                    <label>CUSTOM SLOTS (ONE PER LINE)</label>
                    <textarea 
                      rows="4" 
                      value={customSlotsText} 
                      onChange={e => setCustomSlotsText(e.target.value)}
                      placeholder="Top Truck&#10;VIP Area"
                    ></textarea>
                  </div>
                )}
              </div>

              <button onClick={handleSaveSetup} disabled={saving || uploading} className="hub-btn-primary w-100 mt-4 h-lg">
                {saving ? <Loader2 size={24} className="animate-spin" /> : 'GENERATE SECTOR'}
              </button>
            </div>
          </div>

          {/* Active Sectors List */}
          <div className="hub-sectors-container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="d-flex align-items-center gap-2 m-0 text-white fw-bold">
                <Grid size={22} className="text-accent" /> Strategy Map
              </h3>
              <span className="hub-badge">Live DB Sync</span>
            </div>
            
            <div className="sectors-list">
              {(() => {
                const groups = existingSlots.reduce((acc, s) => {
                  const sectorId = s.EventSlotImage?.id || 'default';
                  if(!acc[sectorId]) acc[sectorId] = [];
                  acc[sectorId].push(s);
                  return acc;
                }, {});

                if (Object.keys(groups).length === 0) {
                  return (
                    <div className="hub-empty-state">
                      <MapIcon size={48} />
                      <p>No parking sectors active for this event yet.</p>
                    </div>
                  );
                }

                return Object.entries(groups).map(([sectorId, slots], idx) => (
                  <div key={idx} className="bento-box sector-card">
                    <div className="sector-image">
                      <img src={slots[0]?.EventSlotImage?.slot_url} alt="Sector Map" />
                      <div className="sector-badge">{slots[0]?.EventSlotImage?.slot_name || `SECTOR ${idx + 1}`}</div>
                    </div>
                    <div className="sector-details">
                      <div className="sector-header">
                        <span className="capacity-label">CAPACITY: {slots.length} SLOTS</span>
                        <div className="sector-actions">
                          <button onClick={() => handleEditName(slots[0]?.EventSlotImage)} className="hub-btn-outline icon-left sm text-accent border-accent">
                            <RotateCcw size={12} /> Rename
                          </button>
                          <button onClick={() => handleDeleteSector(slots[0]?.EventSlotImage?.id, slots[0]?.EventSlotImage?.slot_name)} className="hub-btn-outline icon-left sm text-danger border-danger">
                            <X size={12} /> Delete
                          </button>
                        </div>
                      </div>
                      <div className="slot-grid">
                        {slots.map(s => (
                          <div 
                            key={s.id} 
                            onClick={() => s.booked_by ? handleClearSlot(s) : setAssignModal({ show: true, slot: s, vtcName: '' })}
                            className={`slot-item ${s.booked_by ? 'booked' : 'available'}`}
                            title={s.booked_by ? `RESERVED BY: ${s.booked_by}` : 'CLICK TO ALLOCATE'}
                          >
                            <span className="slot-num">{s.slot_no}</span>
                            {s.booked_by && (
                              <span className="slot-vtc">{s.booked_by}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      ) : (
        <div className="hub-events-grid">
          {loading ? (
            <div className="hub-loading w-100 grid-col-span-full">
              <div className="spinner"></div>
            </div>
          ) : events.length === 0 ? (
            <div className="hub-empty-state grid-col-span-full">
              <Calendar size={48} />
              <p>No upcoming official convoys detected for this VTC.</p>
            </div>
          ) : (
            events.map(e => (
              <div key={e.id} className="bento-box event-card-compact p-0">
                <div className="event-card-img">
                  <img src={e.banner} alt={e.name} />
                  <div className="event-date-badge">{new Date(e.start_at).toLocaleDateString()}</div>
                </div>
                <div className="event-card-body p-4">
                  <h4 className="text-truncate">{e.name}</h4>
                  <p className="event-server"><Clock size={14} /> {e.server.name.toUpperCase()}</p>
                  <button onClick={() => setSetupEvent(e)} className="hub-btn-primary w-100 mt-3">
                    CONFIGURE SLOTS
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Reusable Modals using Portals */}
      {nameModal.show && createPortal(
        <div className="hub-modal-overlay">
          <div className="bento-box hub-modal">
            <div className="modal-header">
              <h3>Rename Sector</h3>
              <button onClick={() => setNameModal({ ...nameModal, show: false })} className="modal-close"><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="hub-input-group mb-4">
                <label>NEW ZONE NAME</label>
                <input 
                  type="text" 
                  value={nameModal.name} 
                  onChange={e => setNameModal({...nameModal, name: e.target.value})} 
                  placeholder="e.g. Primary Garage" 
                />
              </div>
              <div className="hub-row">
                <button onClick={() => setNameModal({ ...nameModal, show: false })} className="hub-btn-outline w-100">CANCEL</button>
                <button onClick={handleSaveName} disabled={saving} className="hub-btn-primary w-100">
                  {saving ? <Loader2 size={18} className="animate-spin" /> : 'SAVE'}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {assignModal.show && createPortal(
        <div className="hub-modal-overlay">
          <div className="bento-box hub-modal">
            <div className="modal-header">
              <h3>Manual Assignment</h3>
              <button onClick={() => setAssignModal({ ...assignModal, show: false })} className="modal-close"><X size={20} /></button>
            </div>
            <div className="modal-body text-center">
              <div className="modal-icon text-accent"><Ticket size={32} /></div>
              <h4 className="mb-4">Slot #{assignModal.slot.slot_no}</h4>
              
              <div className="hub-input-group mb-4 text-left">
                <label>TARGET VTC NAME</label>
                <input 
                  type="text" 
                  value={assignModal.vtcName} 
                  onChange={e => setAssignModal({...assignModal, vtcName: e.target.value})} 
                  placeholder="Enter full VTC name..." 
                />
              </div>
              <div className="hub-row">
                <button onClick={() => setAssignModal({ ...assignModal, show: false })} className="hub-btn-outline w-100">CANCEL</button>
                <button onClick={handleManualAssign} className="hub-btn-primary w-100">ASSIGN</button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {statusModal.show && createPortal(
        <div className="hub-modal-overlay">
          <div className="bento-box hub-modal text-center">
            <div className={`modal-icon ${statusModal.type}`}>
              {statusModal.type === 'error' ? <X size={32} /> : statusModal.type === 'confirm' ? <Ticket size={32} /> : <Check size={32} />}
            </div>
            <h3 className="mb-2">{statusModal.title}</h3>
            <p className="text-muted mb-4">{statusModal.message}</p>
            
            {statusModal.type === 'confirm' ? (
              <div className="hub-row justify-content-center">
                <button onClick={() => setStatusModal({ ...statusModal, show: false })} className="hub-btn-outline">CANCEL</button>
                <button onClick={() => { confirmAction?.(); setStatusModal({ ...statusModal, show: false }); }} className="hub-btn-primary">CONFIRM</button>
              </div>
            ) : (
              <button onClick={() => setStatusModal({ ...statusModal, show: false })} className="hub-btn-primary mx-auto">DISMISS</button>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default HubSlots;
