import React, { useEffect, useState } from 'react';
import { Trophy, Save, Loader2, Award } from 'lucide-react';
import './HubRecognition.css';

const HubRecognition = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [members, setMembers] = useState([]);
  const [existingMonths, setExistingMonths] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    month: '',
    p1_name: '', p1_role: '', p1_tmp_id: '', p1_distance: '', p1_dlc: '',
    p2_name: '', p2_role: '', p2_tmp_id: '', p2_distance: '', p2_dlc: '',
    p3_name: '', p3_role: '', p3_tmp_id: '', p3_distance: '', p3_dlc: '',
    published: false
  });

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const generateMonths = () => {
    const months = [];
    const date = new Date();
    date.setMonth(date.getMonth() - 3);
    const monthsNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    for (let i = 0; i < 12; i++) {
      months.push(`${monthsNames[date.getMonth()]} ${date.getFullYear()}`);
      date.setMonth(date.getMonth() + 1);
    }
    return months;
  };

  const monthOptions = generateMonths();

  useEffect(() => {
    const now = new Date();
    const monthsNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const currentMonth = `${monthsNames[now.getMonth()]} ${now.getFullYear()}`;
    
    setFormData(prev => ({ ...prev, month: prev.month || currentMonth }));
    
    const initFetch = async () => {
      try {
        const mRes = await fetch(`${API_BASE_URL}/api/tmp/vtc/members`);
        const mData = await mRes.json();
        if (mData.response?.members) setMembers(mData.response.members);

        const aRes = await fetch(`${API_BASE_URL}/api/achievements/all`);
        const aData = await aRes.json();
        if (Array.isArray(aData)) setExistingMonths(aData.map(a => a.month));
      } catch (e) { console.error(e); }
    };
    initFetch();
  }, [API_BASE_URL]);

  const fetchMonthData = async (month) => {
    if (!month) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/achievements/find`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: month.trim() })
      });
      const data = await res.json();

      if (data && data.month) {
        setFormData({
          month: data.month,
          p1_name: data.p1_name || '', p1_role: data.p1_role || '', p1_tmp_id: data.p1_tmp_id || '', p1_distance: data.p1_distance || '', p1_dlc: data.p1_dlc || '',
          p2_name: data.p2_name || '', p2_role: data.p2_role || '', p2_tmp_id: data.p2_tmp_id || '', p2_distance: data.p2_distance || '', p2_dlc: data.p2_dlc || '',
          p3_name: data.p3_name || '', p3_role: data.p3_role || '', p3_tmp_id: data.p3_tmp_id || '', p3_distance: data.p3_distance || '', p3_dlc: data.p3_dlc || '',
          published: data.published || false
        });
      } else {
        setFormData(prev => ({
          month: prev.month,
          p1_name: '', p1_role: '', p1_tmp_id: '', p1_distance: '', p1_dlc: '',
          p2_name: '', p2_role: '', p2_tmp_id: '', p2_distance: '', p2_dlc: '',
          p3_name: '', p3_role: '', p3_tmp_id: '', p3_distance: '', p3_dlc: '',
          published: false
        }));
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => {
    if (formData.month) fetchMonthData(formData.month);
  }, [formData.month]);

  const handleMemberSelect = (prefix, id) => {
    const member = members.find(m => m.user_id === parseInt(id));
    if (member) {
      setFormData(prev => ({
        ...prev,
        [`${prefix}_name`]: member.username,
        [`${prefix}_role`]: member.role,
        [`${prefix}_tmp_id`]: member.user_id
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    const token = localStorage.getItem('tpvtc_token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/achievements/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Achievements updated successfully!' });
        const aRes = await fetch(`${API_BASE_URL}/api/achievements/all`);
        const aData = await aRes.json();
        if (Array.isArray(aData)) setExistingMonths(aData.map(a => a.month));
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.message || 'Update failed' });
      }
    } catch (e) { setMessage({ type: 'error', text: 'Server error' }); } finally { setSaving(false); }
  };

  return (
    <div className="hub-recognition-page">
      <header className="hub-page-header">
        <div className="header-content">
          <h1>Monthly Achievements</h1>
          <p>Manage top performers of the month.</p>
        </div>
      </header>

      {message.text && (
        <div className={`hub-alert ${message.type}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="hub-loading w-100"><div className="spinner"></div></div>
      ) : (
        <form onSubmit={handleSubmit} className="recognition-form">
          <div className="bento-box settings-panel mb-4">
            <div className="bento-header mb-4">
              <h3 className="d-flex align-items-center gap-2"><Award size={20} className="text-accent" /> General Settings</h3>
            </div>
            
            <div className="hub-row align-items-end">
              <div className="hub-input-group flex-grow-1">
                <label>TARGET MONTH</label>
                <select value={formData.month} onChange={e => setFormData({...formData, month: e.target.value})}>
                  <optgroup label="Saved in Database">
                    {existingMonths.map(m => <option key={m} value={m}>{m}</option>)}
                  </optgroup>
                  <optgroup label="Other Months">
                    {monthOptions.filter(m => !existingMonths.includes(m)).map(m => <option key={m} value={m}>{m}</option>)}
                  </optgroup>
                </select>
              </div>
              
              <div className="publish-toggle p-3 border rounded-3 ms-3 d-flex align-items-center gap-3">
                <label className="switch">
                  <input type="checkbox" checked={formData.published} onChange={e => setFormData({...formData, published: e.target.checked})} />
                  <span className="slider round"></span>
                </label>
                <span className="fw-bold">{formData.published ? 'VISIBLE ON WEBSITE' : 'HIDDEN FROM WEBSITE'}</span>
              </div>
            </div>
          </div>

          <div className="bento-box performers-panel">
            <div className="bento-header mb-4">
              <h3 className="d-flex align-items-center gap-2"><Trophy size={20} className="text-accent" /> Top 3 Performers</h3>
            </div>

            {[1, 2, 3].map(num => (
              <div key={num} className="performer-block">
                <div className="performer-badge"># {num} Performer</div>
                
                <div className="hub-input-group mb-3">
                  <select value={formData[`p${num}_tmp_id`] || ""} onChange={e => handleMemberSelect(`p${num}`, e.target.value)}>
                    <option value="">Select Member...</option>
                    {members.map(m => <option key={m.user_id} value={m.user_id}>{m.username} ({m.role})</option>)}
                  </select>
                </div>

                <div className="hub-row mb-3">
                  <div className="hub-input-group flex-1">
                    <input type="text" readOnly value={formData[`p${num}_name`]} placeholder="Name" className="readonly-input" />
                  </div>
                  <div className="hub-input-group flex-1">
                    <input type="text" readOnly value={formData[`p${num}_role`]} placeholder="Role" className="readonly-input" />
                  </div>
                  <div className="hub-input-group flex-2">
                    <input type="text" value={formData[`p${num}_distance`]} onChange={e => setFormData({...formData, [`p${num}_distance`]: e.target.value})} placeholder="Distance (e.g. 50,000 KM)" required />
                  </div>
                </div>
                
                <div className="hub-input-group">
                  <input type="text" value={formData[`p${num}_dlc`] || ''} onChange={e => setFormData({...formData, [`p${num}_dlc`]: e.target.value})} placeholder="Giveaway Prize DLC (Optional)" />
                </div>
              </div>
            ))}
          </div>

          <div className="form-actions mt-4">
            <button type="submit" disabled={saving} className="hub-btn-primary w-100 py-3 h-lg">
              {saving ? <Loader2 size={24} className="animate-spin" /> : <><Save size={20} /> SAVE MONTHLY ACHIEVEMENTS</>}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default HubRecognition;
