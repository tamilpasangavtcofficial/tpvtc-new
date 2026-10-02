import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Heart, Plus, Search, Trash2, Upload, Loader2, User, Check, X, ImageIcon } from 'lucide-react';
import './HubSupporters.css';

const HubSupporters = () => {
  const [supporters, setSupporters] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    truckersmp_id: '',
    amount: '',
    evidence: ''
  });

  const fileInputRef = useRef(null);
  const [statusModal, setStatusModal] = useState({ show: false, title: '', message: '', type: 'success' });
  const showStatus = (title, message, type = 'success') => setStatusModal({ show: true, title, message, type });

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('tpvtc_token');
    try {
      const responses = await Promise.allSettled([
        fetch(`${API_BASE_URL}/api/supporters/admin`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/tmp/vtc/members`)
      ]);

      const parseRes = async (res) => (res.status === 'fulfilled' && res.value.ok) ? await res.value.json().catch(()=>null) : null;
      
      let sData = await parseRes(responses[0]);
      const mData = await parseRes(responses[1]);
      
      if (!sData) {
        // Fallback if admin route is forbidden
        const fallbackRes = await fetch(`${API_BASE_URL}/api/supporters`);
        if (fallbackRes.ok) sData = await fallbackRes.json();
      }
      
      setSupporters(Array.isArray(sData) ? sData : []);
      setMembers(mData?.response?.members || []);
    } catch (e) {
      console.error(e);
      showStatus("Sync Failed", "Could not reach the database.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [API_BASE_URL]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const token = localStorage.getItem('tpvtc_token');
    try {
      const signRes = await fetch(`${API_BASE_URL}/api/images/upload-sign`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
      const signData = await signRes.json();
      const form = new FormData();
      form.append('file', file);
      form.append('api_key', signData.api_key);
      form.append('timestamp', signData.timestamp);
      form.append('signature', signData.signature);
      form.append('folder', signData.folder);

      const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${signData.cloud_name}/image/upload`, { method: 'POST', body: form });
      const cloudData = await cloudRes.json();
      if (cloudData.secure_url) {
        setFormData({ ...formData, evidence: cloudData.secure_url });
      }
    } catch (err) { showStatus("Upload Failed", "Cloudinary upload failed.", "error"); } finally { setUploading(false); }
  };

  const handleMemberSelect = (m) => {
    setFormData({ ...formData, name: m.username, truckersmp_id: m.user_id });
    setSearchTerm('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('tpvtc_token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/supporters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        showStatus("Supporter Verified", "Recognition has been published.", "success");
        setShowAddModal(false);
        setFormData({ name: '', truckersmp_id: '', amount: '', evidence: '' });
        fetchData();
      }
    } catch (err) { showStatus("Database Error", "Failed to save record.", "error"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Archive this recognition record?")) return;
    const token = localStorage.getItem('tpvtc_token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/supporters/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) fetchData();
    } catch (e) { showStatus("Operation Failed", "Connection timeout.", "error"); }
  };

  const filteredMembers = searchTerm.length > 1
    ? members.filter(m => m.username.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  return (
    <div className="hub-supporters-page">
      <header className="hub-page-header">
        <div className="header-content">
          <h1>Our Supporters</h1>
          <p>Manage and honor our dedicated VTC supporters.</p>
        </div>
        <div className="header-actions">
          <button onClick={() => setShowAddModal(true)} className="hub-btn-primary icon-left">
            <Plus size={16} /> <span>New Support</span>
          </button>
        </div>
      </header>

      {loading ? (
        <div className="hub-loading w-100"><div className="spinner"></div></div>
      ) : (
        <div className="bento-box supporters-container p-0">
          <div className="table-responsive">
            <table className="hub-table">
              <thead>
                <tr>
                  <th>Supporter</th>
                  <th>TruckersMP ID</th>
                  <th>Contribution</th>
                  <th>Evidence</th>
                  <th>Date Recorded</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {supporters.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-5 text-muted">No supporters recorded yet.</td></tr>
                ) : (
                  supporters.map(s => (
                    <tr key={s.id}>
                      <td>
                        <div className="supporter-name">
                          <div className="avatar-icon"><User size={16} /></div>
                          <strong>{s.name}</strong>
                        </div>
                      </td>
                      <td><code className="text-accent">{s.truckersmp_id || 'N/A'}</code></td>
                      <td>
                        <span className="contribution-badge">₹ {s.amount}</span>
                      </td>
                      <td>
                        {s.evidence ? (
                          <a href={s.evidence} target="_blank" rel="noreferrer" className="evidence-link">
                            <ImageIcon size={14} /> VIEW PROOF
                          </a>
                        ) : <span className="text-muted">NONE</span>}
                      </td>
                      <td><span className="text-muted small">{new Date(s.created_at).toLocaleDateString()}</span></td>
                      <td className="text-end">
                        <button onClick={() => handleDelete(s.id)} className="hub-btn-icon text-danger border-danger sm d-inline-flex">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAddModal && createPortal(
        <div className="hub-modal-overlay">
          <div className="bento-box hub-modal">
            <div className="modal-header">
              <h3 className="d-flex align-items-center gap-2"><Heart size={20} className="text-accent" /> Acknowledge Donor</h3>
              <button onClick={() => setShowAddModal(false)} className="modal-close"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body pb-2">
              <div className="hub-input-group mb-4 position-relative">
                <label>SEARCH MEMBER (FROM TEAM)</label>
                <div className="input-with-icon">
                  <Search size={16} className="text-muted" />
                  <input type="text" placeholder="Type username..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                {filteredMembers.length > 0 && (
                  <div className="member-dropdown">
                    {filteredMembers.map(m => (
                      <button key={m.user_id} type="button" onClick={() => handleMemberSelect(m)} className="dropdown-item">
                        <span>{m.username}</span>
                        <span className="id">ID: {m.user_id}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="hub-row mb-4">
                <div className="hub-input-group">
                  <label>FULL NAME</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Display Name" />
                </div>
                <div className="hub-input-group">
                  <label>TMP ID</label>
                  <input type="number" required value={formData.truckersmp_id} onChange={e => setFormData({ ...formData, truckersmp_id: e.target.value })} placeholder="123456" />
                </div>
              </div>

              <div className="hub-input-group mb-4">
                <label>CONTRIBUTION AMOUNT (₹)</label>
                <input type="number" required value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} placeholder="0.00" className="text-accent fw-bold" />
              </div>

              <div className="hub-input-group mb-4">
                <label>EVIDENCE / PROOF</label>
                <div className="upload-zone-compact">
                  {uploading ? (
                    <Loader2 size={24} className="animate-spin text-accent mx-auto" />
                  ) : formData.evidence ? (
                    <div className="d-flex align-items-center justify-content-between text-accent w-100 px-3">
                      <span><Check size={16} /> FILE ATTACHED</span>
                      <button type="button" onClick={() => setFormData({ ...formData, evidence: '' })} className="hub-btn-icon text-danger border-danger sm"><Trash2 size={14} /></button>
                    </div>
                  ) : (
                    <label className="w-100 text-center m-0 cursor-pointer py-3">
                      <input type="file" className="d-none" onChange={handleFileUpload} accept="image/*" />
                      <Upload size={16} className="me-2" /> Select Image Proof
                    </label>
                  )}
                </div>
              </div>

              <button type="submit" disabled={uploading} className="hub-btn-primary w-100 py-3 mt-2">
                {uploading ? <Loader2 size={18} className="animate-spin" /> : 'PUBLISH RECOGNITION'}
              </button>
            </form>
          </div>
        </div>, document.body
      )}

      {statusModal.show && createPortal(
        <div className="hub-modal-overlay">
          <div className="bento-box hub-modal text-center">
            <div className={`modal-icon ${statusModal.type}`}>
              {statusModal.type === 'error' ? <X size={32} /> : <Check size={32} />}
            </div>
            <h3 className="mb-2">{statusModal.title}</h3>
            <p className="text-muted mb-4">{statusModal.message}</p>
            <button onClick={() => setStatusModal({ ...statusModal, show: false })} className="hub-btn-primary mx-auto">DISMISS</button>
          </div>
        </div>, document.body
      )}
    </div>
  );
};

export default HubSupporters;
