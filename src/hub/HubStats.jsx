import React, { useState, useEffect } from 'react';
import { Activity, Map, Truck, DollarSign, RefreshCw, Trophy, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import './HubStats.css';

const HubStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState(0);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/stats`);
      if (res.status === 202) {
        const data = await res.json();
        setSyncing(true);
        setProgress(data.syncProgress || 0);
        setTimeout(fetchStats, 2000); // Poll faster during initial sync
        return;
      }
      const data = await res.json();
      let parsedStats = data.stats;
      if (typeof parsedStats === 'string') {
        try { parsedStats = JSON.parse(parsedStats); } catch(e) {}
      }
      setStats(parsedStats);
      setSyncing(data.isSyncing);
      setProgress(data.syncProgress || 0);
      if (data.isSyncing) {
        setTimeout(fetchStats, 2000); // continue polling until done
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const triggerSync = async () => {
    setSyncing(true);
    setProgress(0);
    try {
      await fetch(`${API_BASE_URL}/api/stats/sync`);
      setTimeout(fetchStats, 2000);
    } catch (err) {
      console.error(err);
      setSyncing(false);
    }
  };

  if (loading && !syncing) {
    return (
      <div className="hub-page-container d-flex align-items-center justify-content-center h-100">
        <div className="spinner"></div>
      </div>
    );
  }

  if (syncing && !stats) {
    return (
      <div className="hub-page-container d-flex flex-column align-items-center justify-content-center h-100 text-center">
        <div className="spinner mb-4"></div>
        <h3 className="text-white">Analyzing Data...</h3>
        <p className="text-muted mb-4">Fetching historical data from TruckersHub & TruckersMP</p>
        <div className="progress-container" style={{ width: '300px', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
          <div className="progress-bar" style={{ width: `${progress}%`, height: '100%', background: 'var(--glass-accent)', transition: 'width 0.5s ease' }}></div>
        </div>
        <p className="mt-2 text-accent fw-bold">{progress}%</p>
      </div>
    );
  }

  // Formatting for Recharts tooltips
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="intro" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()} {entry.name === 'Distance' ? 'km' : (entry.name === 'Income' ? '€' : '')}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="hub-page-container hub-stats-page">
      <div className="hub-page-header">
        <div>
          <h2>VTC Analytics</h2>
          <p>Real-time statistics powered by TruckersHub & TruckersMP. Automatically synced daily.</p>
        </div>
        <button onClick={triggerSync} disabled={syncing} className="hub-btn-primary position-relative overflow-hidden">
          <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
          <span>{syncing ? `Syncing... ${progress}%` : 'Manual Sync'}</span>
          {syncing && (
            <div className="position-absolute bottom-0 start-0 h-100" style={{ width: `${progress}%`, background: 'rgba(255,255,255,0.2)', transition: 'width 0.3s ease', zIndex: 0 }}></div>
          )}
        </button>
      </div>

      {stats ? (
        <>
          <div className="stats-overview">
            <div className="bento-box stat-card glow-card">
              <div className="stat-icon bg-blue"><Truck size={24} /></div>
              <div className="stat-content">
                <h3>Total Jobs</h3>
                <p className="text-accent">{stats?.overview?.totalJobs?.toLocaleString() || 0}</p>
              </div>
            </div>
            <div className="bento-box stat-card glow-card">
              <div className="stat-icon bg-purple"><Map size={24} /></div>
              <div className="stat-content">
                <h3>Total Distance</h3>
                <p className="text-purple">{stats?.overview?.totalDistance?.toLocaleString() || 0} <span className="text-muted fs-6">km</span></p>
              </div>
            </div>
            <div className="bento-box stat-card glow-card">
              <div className="stat-icon bg-green"><DollarSign size={24} /></div>
              <div className="stat-content">
                <h3>Total Income</h3>
                <p className="text-green">€{stats?.overview?.totalIncome?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>

          {stats.monthly && stats.monthly.length > 0 && (
            <div className="hub-row mt-4 mb-4">
              <div className="bento-box flex-fill chart-container">
                <div className="bento-header mb-4">
                  <h3 className="d-flex align-items-center gap-2"><Activity size={20} className="text-accent" /> Monthly Distance & Income</h3>
                </div>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <AreaChart data={stats.monthly} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorDistance" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" tick={{fill: 'rgba(255,255,255,0.5)'}} />
                      <YAxis stroke="rgba(255,255,255,0.2)" tick={{fill: 'rgba(255,255,255,0.5)'}} />
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" name="Distance" dataKey="distance" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorDistance)" />
                      <Area type="monotone" name="Income" dataKey="income" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          <div className="bento-box">
            <div className="bento-header mb-4">
              <h3 className="d-flex align-items-center gap-2"><Trophy size={20} className="text-accent" /> Top Drivers</h3>
            </div>
            <div className="table-responsive">
              <table className="hub-table">
                <thead>
                  <tr>
                    <th>Driver</th>
                    <th>Jobs Completed</th>
                    <th>Distance Driven</th>
                    <th>Total Revenue</th>
                    <th>TMP Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.drivers?.map((driver, index) => (
                    <tr key={driver.steamID}>
                      <td>
                        <div className="driver-info">
                          <span className="rank text-muted">#{index + 1}</span>
                          <img src={driver.avatar} alt="Avatar" className="driver-avatar" />
                          <div className="driver-names">
                            <strong>{driver.username}</strong>
                            <span className="text-muted small">Steam: {driver.steamID}</span>
                          </div>
                        </div>
                      </td>
                      <td>{driver.jobs}</td>
                      <td>{driver.distance.toLocaleString()} km</td>
                      <td className="text-green">€{driver.income.toLocaleString()}</td>
                      <td>
                        {driver.tmpData ? (
                          <div className="tmp-status">
                            <span className={`badge ${driver.tmpData.banned ? 'bg-danger' : 'bg-blue'} text-white rounded px-2 py-1 small`}>
                              TMP ID: {driver.tmpData.id}
                            </span>
                          </div>
                        ) : <span className="text-muted small">Not Found</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="bento-box text-center py-5">
          <p className="text-muted mb-3">No stats available right now.</p>
          <div className="spinner mx-auto"></div>
        </div>
      )}
    </div>
  );
};

export default HubStats;
