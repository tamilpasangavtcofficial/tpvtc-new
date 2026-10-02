import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Trash2, Shield, UserPlus, Edit2, X, Check, Loader2, Key } from 'lucide-react';
import './HubUsers.css';

const HubUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'Event Team' });
  const [passwordData, setPasswordData] = useState({ password: '' });
  const [statusModal, setStatusModal] = useState({ show: false, title: '', message: '', type: 'success' });
  const [confirmAction, setConfirmAction] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  let currentUserStr = localStorage.getItem('tpvtc_user') || sessionStorage.getItem('user') || '{}';
  const currentUser = JSON.parse(currentUserStr);
  
  // Here we use the generic staff checking from TMP roles, but let's assume we can parse it from user data
  // The user wanted this page migrated, so let's preserve the local role string check if they are logged in locally
  const role = String(currentUser?.role || 'Guest').toLowerCase();
  const isHighRole = role === 'founder' || role === 'developer' || role === 'managing director';

  const showStatus = (title, message, type = 'success', onConfirm = null) => {
    setStatusModal({ show: true, title, message, type });
    if (onConfirm) setConfirmAction(() => onConfirm);
    else setConfirmAction(null);
  };

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem('tpvtc_token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [API_BASE_URL]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('tpvtc_token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowAddModal(false);
        setFormData({ username: '', email: '', password: '', role: 'Event Team' });
        fetchData();
      } else {
        const err = await res.json();
        showStatus("Creation Failed", err.message || "Failed to create user", "error");
      }
    } catch (e) { showStatus("Server Error", "Could not reach database", "error"); }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('tpvtc_token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ role: formData.role, username: formData.username })
      });
      if (res.ok) {
        setShowEditModal(false);
        fetchData();
      } else { showStatus("Permission Error", "Failed to update permissions", "error"); }
    } catch (e) { showStatus("Server Error", "Could not reach database", "error"); }
  };

  const handleDelete = async (id) => {
    showStatus(
      "Confirm Removal",
      "Are you sure you want to delete this staff member?",
      "confirm",
      async () => {
         const token = localStorage.getItem('tpvtc_token');
         try {
           const res = await fetch(`${API_BASE_URL}/api/auth/users/${id}`, {
             method: 'DELETE',
             headers: { 'Authorization': `Bearer ${token}` }
           });
           if (res.ok) fetchData();
           else showStatus("Deletion Failed", "Failed to delete user", "error");
         } catch (e) { showStatus("Server Error", "Could not reach database", "error"); }
      }
    );
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('tpvtc_token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/users/${selectedUser.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ password: passwordData.password })
      });
      if (res.ok) {
        setShowPasswordModal(false);
        showStatus("Security Key Updated", "Password updated successfully.", "success");
      } else { showStatus("Security Error", "Failed to change password", "error"); }
    } catch (e) { showStatus("Server Error", "Could not reach database", "error"); }
  };

  return (
    <div className="hub-users-page">
      <header className="hub-page-header">
        <div className="header-content">
          <h1>Team Manager</h1>
          <p>Manage staff access and operational roles.</p>
        </div>
        {isHighRole && (
          <button onClick={() => { setFormData({ username: '', email: '', password: '', role: 'Event Team' }); setShowAddModal(true); }} className="hub-btn-primary icon-left">
            <UserPlus size={16} /> <span>Add User</span>
          </button>
        )}
      </header>

      {loading ? (
        <div className="hub-loading w-100"><div className="spinner"></div></div>
      ) : (
        <div className="bento-box p-0 users-container">
          <div className="table-responsive">
            <table className="hub-table">
              <thead>
                <tr>
                  <th>Staff Member</th>
                  <th>Email Account</th>
                  <th>Operational Role</th>
                  <th className="text-end">Action Interface</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan="4" className="py-5 text-center text-muted">No staff found.</td></tr>
                ) : (
                  users.map(u => {
                    const roleName = u.UserRole?.role || u.role || 'Guest';
                    return (
                      <tr key={u.id}>
                        <td><strong>{u.username}</strong></td>
                        <td className="text-muted">{u.email}</td>
                        <td>
                          <span className={`role-badge ${roleName.toLowerCase().replace(' ', '-')}`}>
                            <Shield size={12} /> {roleName}
                          </span>
                        </td>
                        <td className="text-end">
                          <div className="actions-group">
                            {(currentUser.id === u.id || isHighRole) && (
                              <button onClick={() => { setSelectedUser(u); setPasswordData({ password: '' }); setShowPasswordModal(true); }} className="hub-btn-outline sm">
                                <Key size={14} /> Key
                              </button>
                            )}
                            {isHighRole && (
                              <>
                                <button onClick={() => { setSelectedUser(u); setFormData({ ...u, role: roleName }); setShowEditModal(true); }} className="hub-btn-outline sm">
                                  <Edit2 size={14} /> Edit
                                </button>
                                <button onClick={() => handleDelete(u.id)} className="hub-btn-outline sm text-danger border-danger">
                                  <Trash2 size={14} /> Delete
                                </button>
                              </>
                            )}
                            {!isHighRole && currentUser.id !== u.id && (
                              <span className="text-muted small">Restricted</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && createPortal(
        <div className="hub-modal-overlay">
          <div className="bento-box hub-modal">
            <div className="modal-header">
              <h3 className="d-flex align-items-center gap-2"><UserPlus size={20} className="text-accent" /> Register New Staff</h3>
              <button onClick={() => setShowAddModal(false)} className="modal-close"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddSubmit} className="modal-body">
              <div className="hub-input-group mb-4">
                <label>USERNAME</label>
                <input type="text" required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} placeholder="e.g. SRINIVAS" />
              </div>
              <div className="hub-input-group mb-4">
                <label>EMAIL ADDRESS</label>
                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="staff@tamilpasanga.com" />
              </div>
              <div className="hub-input-group mb-4">
                <label>INITIAL PASSWORD</label>
                <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
              </div>
              <div className="hub-input-group mb-4">
                <label>OPERATIONAL ROLE</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="Founder">Founder</option>
                  <option value="Developer">Developer</option>
                  <option value="Staff">Staff</option>
                  <option value="Event Team">Event Team</option>
                  <option value="Media Team">Media Team</option>
                </select>
              </div>
              <button type="submit" className="hub-btn-primary w-100 py-3 mt-2">CREATE PROFILE</button>
            </form>
          </div>
        </div>, document.body
      )}

      {/* Edit Role Modal */}
      {showEditModal && selectedUser && createPortal(
        <div className="hub-modal-overlay">
          <div className="bento-box hub-modal">
            <div className="modal-header">
              <h3 className="d-flex align-items-center gap-2"><Edit2 size={20} className="text-accent" /> Modify Permissions</h3>
              <button onClick={() => setShowEditModal(false)} className="modal-close"><X size={20} /></button>
            </div>
            <form onSubmit={handleEditSubmit} className="modal-body">
              <div className="text-center mb-4"><div className="text-muted small fw-bold">{selectedUser.email}</div></div>
              <div className="hub-input-group mb-4">
                <label>USERNAME</label>
                <input type="text" required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
              </div>
              <div className="hub-input-group mb-4">
                <label>NEW ASSIGNED ROLE</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="Founder">Founder</option>
                  <option value="Developer">Developer</option>
                  <option value="Staff">Staff</option>
                  <option value="Event Team">Event Team</option>
                  <option value="Media Team">Media Team</option>
                </select>
              </div>
              <button type="submit" className="hub-btn-primary w-100 py-3 mt-2">UPDATE PERMISSIONS</button>
            </form>
          </div>
        </div>, document.body
      )}

      {/* Password Modal */}
      {showPasswordModal && selectedUser && createPortal(
        <div className="hub-modal-overlay">
          <div className="bento-box hub-modal">
            <div className="modal-header">
              <h3 className="d-flex align-items-center gap-2"><Key size={20} className="text-accent" /> Change Password</h3>
              <button onClick={() => setShowPasswordModal(false)} className="modal-close"><X size={20} /></button>
            </div>
            <form onSubmit={handlePasswordSubmit} className="modal-body">
              <div className="hub-input-group mb-4">
                <label>NEW SECURITY KEY</label>
                <input type="password" required minLength={4} value={passwordData.password} onChange={e => setPasswordData({ password: e.target.value })} placeholder="••••••••" />
              </div>
              <button type="submit" className="hub-btn-primary w-100 py-3 mt-2">SET NEW PASSWORD</button>
            </form>
          </div>
        </div>, document.body
      )}

      {/* Status Modal */}
      {statusModal.show && createPortal(
        <div className="hub-modal-overlay">
          <div className="bento-box hub-modal text-center">
            <div className={`modal-icon ${statusModal.type === 'error' ? 'error' : statusModal.type === 'confirm' ? 'warning' : 'success'}`}>
              {statusModal.type === 'error' ? <X size={32} /> : statusModal.type === 'confirm' ? <Shield size={32} /> : <Check size={32} />}
            </div>
            <h3 className="mb-2">{statusModal.title}</h3>
            <p className="text-muted mb-4">{statusModal.message}</p>
            
            <div className="d-flex gap-3 justify-content-center">
              {statusModal.type === 'confirm' ? (
                <>
                  <button onClick={() => setStatusModal({ ...statusModal, show: false })} className="hub-btn-outline">CANCEL</button>
                  <button onClick={() => { confirmAction?.(); setStatusModal({ ...statusModal, show: false }); }} className="hub-btn-primary bg-danger border-danger">EXECUTE</button>
                </>
              ) : (
                <button onClick={() => setStatusModal({ ...statusModal, show: false })} className="hub-btn-primary">UNDERSTOOD</button>
              )}
            </div>
          </div>
        </div>, document.body
      )}
    </div>
  );
};

export default HubUsers;
