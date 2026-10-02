import React, { useEffect, useState, useRef } from 'react';
import { Users, Calendar, Zap, Ticket, Clock, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { checkPermission } from '../utils/roles';
import './HubDashboard.css';

const HubDashboard = () => {
  const [stats, setStats] = useState(null);
  const [mediaStats, setMediaStats] = useState({ gallery: 0, headers: 0 });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('tpvtc_user') || '{}');
  const role = user.role || 'Driver';
  
  const canViewSlots = checkPermission(role, 'manage_slots') || checkPermission(role, 'full_power');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('tpvtc_token');
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        
        // Use Promise.allSettled to not fail completely if one endpoint is down
        const responses = await Promise.allSettled([
          fetch(`${API_BASE_URL}/api/tmp/vtc/profile`),
          fetch(`${API_BASE_URL}/api/tmp/vtc/events`),
          canViewSlots ? fetch(`${API_BASE_URL}/api/slots/requests/pending`, { headers: { 'Authorization': `Bearer ${token}` }}) : Promise.resolve({ json: () => [] })
        ]);

        const parseRes = async (res) => (res.status === 'fulfilled' && res.value.ok) ? await res.value.json().catch(()=>null) : null;

        const p = await parseRes(responses[0]);
        const e = await parseRes(responses[1]);
        const r = await parseRes(responses[2]);

        setStats({
          members: p?.response?.members_count || 0,
          officialEvents: e?.response?.length || 0,
          albums: 2, // Mock data for albums for now
          pendingRequests: Array.isArray(r) ? r.length : 0
        });

        if (Array.isArray(r)) {
          setRecentRequests(r.sort((x,y) => new Date(y.createdAt) - new Date(x.createdAt)).slice(0, 5));
        }

      } catch (e) {
        console.error("Dashboard Stats Error:", e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [canViewSlots]);

  // Animated Counter Component
  const StatItem = ({ title, value, icon: Icon, colorClass }) => {
    const [displayValue, setDisplayValue] = useState(0);
    const hasAnimated = useRef(false);

    useEffect(() => {
      const end = parseInt(value) || 0;
      if (end === 0) return setDisplayValue(0);
      if (hasAnimated.current) return setDisplayValue(end);
      
      let start = 0;
      const duration = 1200;
      const fps = 60;
      const totalFrames = Math.round((duration / 1000) * fps);
      let frame = 0;

      const easeOutQuad = (x) => 1 - (1 - x) * (1 - x);
      const timer = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;
        setDisplayValue(Math.round(start + (end - start) * easeOutQuad(progress)));
        if (frame >= totalFrames) {
          clearInterval(timer);
          setDisplayValue(end);
          hasAnimated.current = true;
        }
      }, 1000 / fps);

      return () => clearInterval(timer);
    }, [value]);

    return (
      <div className={`hub-stat-card ${colorClass}`}>
        <div className="stat-icon-wrapper">
          <Icon size={24} />
        </div>
        <div className="stat-content">
          <h3>{displayValue}</h3>
          <p>{title}</p>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="hub-loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="hub-dashboard">
      <div className="welcome-banner">
        <h2>Welcome back, <span>{user.username}</span> 👋</h2>
        <p>Here is what's happening with Tamil Pasanga VTC today.</p>
      </div>

      <div className="hub-stats-grid">
        <StatItem title="VTC Members" value={stats?.members} icon={Users} colorClass="cyan-glow" />
        <StatItem title="Official Events" value={stats?.officialEvents} icon={Calendar} colorClass="purple-glow" />
        <StatItem title="Community Albums" value={stats?.albums} icon={Zap} colorClass="blue-glow" />
        {canViewSlots && (
          <StatItem title="Pending Slots" value={stats?.pendingRequests} icon={Ticket} colorClass="pink-glow" />
        )}
      </div>

      <div className="hub-bento-grid">
        {canViewSlots ? (
          <div className="bento-box slots-panel">
            <div className="bento-header">
              <h3>Live Slot Activity</h3>
              <Link to="/hub/slots" className="hub-btn-outline">View All</Link>
            </div>
            
            <div className="slots-table-wrapper">
              <table className="hub-table">
                <thead>
                  <tr>
                    <th>VTC PARTICIPANT</th>
                    <th>REQUESTED SLOT</th>
                    <th>DATE</th>
                    <th className="text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRequests.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="empty-state">
                        <Ticket size={32} />
                        <p>No active slot requests in queue.</p>
                      </td>
                    </tr>
                  ) : (
                    recentRequests.map(req => (
                      <tr key={req.id}>
                        <td className="fw-bold text-white">{req.vtc_name}</td>
                        <td className="text-accent">{req.EventSlot?.EventSlotImage?.slot_name || `Slot #${req.event_slot_id}`}</td>
                        <td className="text-muted">{new Date(req.createdAt).toLocaleDateString()}</td>
                        <td className="text-right">
                          <span className="status-badge pending">PENDING</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bento-box slots-panel">
            <div className="bento-header">
              <h3>VTC Media Activity</h3>
            </div>
            
            <div className="empty-state">
              <Zap size={32} />
              <p>You don't have access to slot requests.</p>
            </div>
          </div>
        )}

        <div className="bento-box vitals-panel">
          <div className="vitals-bg-icon">
            <Clock size={120} />
          </div>
          <h3>System Vitals</h3>
          
          <div className="vital-item">
            <span className="vital-label">Storage & Cloud</span>
            <div className="vital-value">
              <span>Cloudinary API</span>
              <span className="status-badge success">CONNECTED</span>
            </div>
          </div>

          <div className="vital-item">
            <span className="vital-label">External Feeds</span>
            <div className="vital-value">
              <span>TruckersMP API</span>
              <span className="status-badge warning">PROXIED</span>
            </div>
          </div>
          
          <div className="vital-footer">
            <p className="text-muted mb-1">Last system sync</p>
            <h4 className="text-accent m-0">Operational</h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HubDashboard;
