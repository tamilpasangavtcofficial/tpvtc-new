import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Edit2, Trash2, Image as ImageIcon, X, Loader2, Check } from 'lucide-react';
import './HubAlbums.css';

const HubAlbums = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', cover_image_url: '' });
  const [saving, setSaving] = useState(false);
  const [statusModal, setStatusModal] = useState({ show: false, title: '', message: '', type: 'success' });
  
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const showStatus = (title, message, type = 'success') => setStatusModal({ show: true, title, message, type });

  const fetchAlbums = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/images/albums`);
      if (res.ok) {
        const data = await res.json();
        setAlbums(data);
      }
    } catch (err) {
      console.error("Failed to load albums", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  const openNewModal = () => {
    setEditingId(null);
    setFormData({ title: '', cover_image_url: '' });
    setShowModal(true);
  };

  const openEditModal = (album) => {
    setEditingId(album.id);
    setFormData({ title: album.title, cover_image_url: album.cover_image_url || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this album?')) return;
    const token = localStorage.getItem('tpvtc_token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/images/albums/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showStatus('Deleted', 'Album deleted successfully', 'success');
        fetchAlbums();
      } else {
        showStatus('Error', 'Failed to delete album', 'error');
      }
    } catch (e) {
      showStatus('Error', 'Network error', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem('tpvtc_token');
    
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_BASE_URL}/api/images/albums/${editingId}` : `${API_BASE_URL}/api/images/albums`;
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        showStatus('Success', `Album ${editingId ? 'updated' : 'created'} successfully`, 'success');
        setShowModal(false);
        fetchAlbums();
      } else {
        showStatus('Error', 'Operation failed', 'error');
      }
    } catch (e) {
      showStatus('Error', 'Network error', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="hub-page-container hub-albums-page">
      <div className="hub-page-header">
        <div>
          <h2>Media Albums</h2>
          <p>Manage community gallery albums and photos</p>
        </div>
        <button onClick={openNewModal} className="hub-btn-primary">
          <Plus size={18} />
          <span>New Album</span>
        </button>
      </div>

      <div className="hub-albums-grid">
        {loading ? (
          <div className="hub-loading w-100 mt-5"><div className="spinner mx-auto"></div></div>
        ) : albums.length === 0 ? (
          <div className="text-center w-100 py-5 text-muted">No albums found. Create one to get started.</div>
        ) : (
          albums.map(album => (
            <div key={album.id} className="hub-album-card">
              <div className="hub-album-cover" style={{ backgroundImage: `url(${album.cover_image_url || 'https://via.placeholder.com/400x300'})` }}>
                <div className="hub-album-overlay">
                  <button onClick={() => openEditModal(album)} className="hub-icon-btn"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(album.id)} className="hub-icon-btn hub-icon-btn-danger"><Trash2 size={16} /></button>
                </div>
                <div className="hub-album-count">
                  <ImageIcon size={14} />
                  <span>{album.images?.length || 0} Photos</span>
                </div>
              </div>
              <div className="hub-album-info">
                <h3>{album.title}</h3>
                <p>Created on {new Date(album.createdAt || album.created_at || Date.now()).toLocaleDateString()}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && createPortal(
        <div className="hub-modal-overlay">
          <div className="bento-box hub-modal">
            <div className="modal-header">
              <h3 className="d-flex align-items-center gap-2"><ImageIcon size={20} className="text-accent" /> {editingId ? 'Edit Album' : 'Create Album'}</h3>
              <button type="button" onClick={() => setShowModal(false)} className="modal-close"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body pb-2">
              <div className="hub-input-group mb-4">
                <label>ALBUM TITLE</label>
                <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g., Summer Convoy 2026" />
              </div>
              <div className="hub-input-group mb-4">
                <label>COVER IMAGE URL</label>
                <input type="url" required value={formData.cover_image_url} onChange={e => setFormData({ ...formData, cover_image_url: e.target.value })} placeholder="https://..." />
              </div>
              <button type="submit" disabled={saving} className="hub-btn-primary w-100 py-3 mt-2">
                {saving ? <Loader2 size={18} className="animate-spin" /> : (editingId ? 'SAVE CHANGES' : 'CREATE ALBUM')}
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
            <button type="button" onClick={() => setStatusModal({ ...statusModal, show: false })} className="hub-btn-primary mx-auto">DISMISS</button>
          </div>
        </div>, document.body
      )}
    </div>
  );
};

export default HubAlbums;
