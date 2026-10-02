import React, { useState, useEffect } from 'react';
import { History, Search, Filter, Shield, Calendar, MapPin, Loader2 } from 'lucide-react';
import './HubSlotLogs.css';

const HubSlotLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [officialEvents, setOfficialEvents] = useState({});

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const eRes = await fetch(`${API_BASE_URL}/api/tmp/vtc/events`);
      const eData = await eRes.json();
      const nameMap = {};
      (eData.response || []).forEach(e => { nameMap[e.id] = e.name; });
      setOfficialEvents(nameMap);

      const res = await fetch(`${API_BASE_URL}/api/slots/requests/logs`);
      const data = await res.json();
      if (Array.isArray(data)) setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, [API_BASE_URL]);

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === 'all' || log.status === filter;
    const matchesSearch = log.vtc_name.toLowerCase().includes(searchTerm.toLowerCase()) || log.event_id.toString().includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="hub-slot-logs-page">
      <header className="hub-page-header">
        <div className="header-content">
          <h1>Slot Request History</h1>
          <p>Audit log of all processed and pending VTC applications.</p>
        </div>
        
        <div className="header-actions logs-actions">
          <div className="search-container">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search VTC or Event ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </header>

      {loading ? (
        <div className="hub-loading w-100">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="bento-box logs-container p-0">
          <div className="table-responsive">
            <table className="hub-table">
              <thead>
                <tr>
                  <th>VTC INFORMATION</th>
                  <th>EVENT & SLOT</th>
                  <th>ACTION DATE</th>
                  <th className="text-end">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-5 text-muted">No matching records found in the archive.</td>
                  </tr>
                ) : (
                  filteredLogs.map(log => (
                    <tr key={log.id}>
                      <td>
                        <div className="vtc-info-cell">
                          <strong className="d-block mb-1 text-white">{log.vtc_name}</strong>
                          <div className="info-tags">
                            <span className="tag text-muted"><Shield size={12} className="text-accent" /> {log.vtc_member_count} MBRS</span>
                            <span className="tag text-accent"><History size={12} /> {log.discord_username || 'NO_DISCORD'}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="event-info-cell">
                          <a href={`https://truckersmp.com/events/${log.event_id}`} target="_blank" rel="noreferrer" className="event-link">
                            <Calendar size={14} className="text-accent" /> {officialEvents[log.event_id] || `EVENT #${log.event_id}`}
                          </a>
                          <span className="slot-tag">
                            <MapPin size={12} /> SLOT #{log.EventSlot?.slot_no || log.event_slot_id}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="date-info-cell">
                          <span className="date-text">{new Date(log.updatedAt).toLocaleDateString()}</span>
                          <span className="time-text">{new Date(log.updatedAt).toLocaleTimeString()}</span>
                          {log.processed_by && (
                            <span className="processed-by">BY: {log.processed_by.toUpperCase()}</span>
                          )}
                        </div>
                      </td>
                      <td className="text-end">
                        <span className={`status-badge ${log.status}`}>
                          {log.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default HubSlotLogs;
