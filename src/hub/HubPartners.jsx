import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Users, Plus, Edit2, Trash2, X, ExternalLink, ImageIcon, Loader2 } from 'lucide-react';
import './HubPartners.css';

const HubPartners = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    vtc_link: '',
    partner_type: 'VTC Partner',
    description: '',
    image_url: ''
  });

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/partners`);
      const data = await res.json();
      if (res.ok) setPartners(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPartners(); }, [API_BASE_URL]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem('tpvtc_token');
      const url = editingId ? `${API_BASE_URL}/api/partners/${editingId}` : `${API_BASE_URL}/api/partners`;
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        resetForm();
        fetchPartners();
      }
    } catch (err) { console.error('Server error'); } finally { setSubmitting(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete partner "${name}"?`)) return;
    try {
      const token = localStorage.getItem('tpvtc_token');
      const res = await fetch(`${API_BASE_URL}/api/partners/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchPartners();
    } catch (err) { console.error('Server error'); }
  };

  const openEdit = (p) => {
    setFormData({
      name: p.name,
      vtc_link: p.vtc_link,
      partner_type: p.partner_type,
      description: p.description,
      image_url: p.image_url || ''
    });
    setEditingId(p.id);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ name: '', vtc_link: '', partner_type: 'VTC Partner', description: '', image_url: '' });
    setEditingId(null);
  };

  return (
    <div className="hub-partners-page">
      <header className="hub-page-header">
        <div className="header-content">
          <h1>Partners Management</h1>
          <p>Manage VTC Partners, CCs, and Realops Partners.</p>
        </div>
        <button className="hub-btn-primary icon-left" onClick={() => { resetForm(); setShowModal(true); }}>
          <Plus size={16} /> <span>Add Partner</span>
        </button>
      </header>

      {loading ? (
        <div className="hub-loading w-100"><div className="spinner"></div></div>
      ) : partners.length === 0 ? (
        <div className="hub-empty-state">
          <Users size={48} />
          <p>No partners added yet.</p>
        </div>
      ) : (
        <div className="partners-grid">
          {partners.map(p => (
            <div key={p.id} className="bento-box partner-card">
              <div className="partner-header">
                <div>
                  <span className="partner-type-badge">{p.partner_type}</span>
                  <h3>{p.name}</h3>
                  {p.vtc_link && (
                    <a href={p.vtc_link} target="_blank" rel="noreferrer" className="vtc-link">
                      <ExternalLink size={12} /> VTC Link
                    </a>
                  )}
                </div>
                <div className="partner-actions">
                  <button className="hub-btn-icon sm" onClick={() => openEdit(p)}><Edit2 size={14} /></button>
                  <button className="hub-btn-icon sm text-danger border-danger" onClick={() => handleDelete(p.id, p.name)}><Trash2 size={14} /></button>
                </div>
              </div>
              <p className="partner-desc">{p.description}</p>
            </div>
          ))}
        </div>
      )}

      {showModal && createPortal(
        <div className="hub-modal-overlay">
          <div className="bento-box hub-modal large">
            <div className="modal-header">
              <h3 className="d-flex align-items-center gap-2">
                <Users size={20} className="text-accent" /> {editingId ? 'Edit Partner' : 'Add New Partner'}
              </h3>
              <button onClick={() => setShowModal(false)} className="modal-close"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="hub-row mb-3">
                <div className="hub-input-group">
                  <label>PARTNER NAME</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="e.g. New Era Logistics" />
                </div>
                <div className="hub-input-group">
                  <label>PARTNER TYPE</label>
                  <select value={formData.partner_type} onChange={e => setFormData({...formData, partner_type: e.target.value})}>
                    <option value="VTC Partner">VTC Partner</option>
                    <option value="CC & Realops Partner">CC & Realops Partner</option>
                  </select>
                </div>
              </div>

              <div className="hub-input-group mb-3">
                <label>TRUCKERSMP VTC LINK</label>
                <input type="url" value={formData.vtc_link || ''} onChange={e => setFormData({...formData, vtc_link: e.target.value})} placeholder={formData.partner_type === 'VTC Partner' ? "Required for VTC" : "Optional"} required={formData.partner_type === 'VTC Partner'} />
              </div>

              <div className="hub-input-group mb-3">
                <label>DESCRIPTION</label>
                <textarea rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required placeholder="Write about the partner..."></textarea>
              </div>

              <div className="hub-input-group mb-4">
                <label className="d-flex align-items-center gap-2"><ImageIcon size={14} /> CUSTOM IMAGE URL (OPTIONAL)</label>
                <input type="url" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} placeholder="Leave blank to use TruckersMP logo" />
              </div>

              <div className="hub-row">
                <button type="button" onClick={() => setShowModal(false)} className="hub-btn-outline w-100">CANCEL</button>
                <button type="submit" disabled={submitting} className="hub-btn-primary w-100">
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : 'SAVE PARTNER'}
                </button>
              </div>
            </form>
          </div>
        </div>, document.body
      )}
    </div>
  );
};

export default HubPartners;
