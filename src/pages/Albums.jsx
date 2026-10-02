import React from 'react';
import { Settings, Image as ImageIcon } from 'lucide-react';

const Albums = () => {
  return (
    <div className="container" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '80px' }}>
      <div className="glass-panel text-center" style={{ padding: '4rem', maxWidth: '600px', width: '100%' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(0, 240, 255, 0.1)', border: '1px solid var(--accent-cyan)', marginBottom: '2rem' }}>
          <ImageIcon size={40} className="text-accent" style={{ position: 'absolute' }} />
          <Settings size={20} className="text-accent" style={{ animation: 'spin 4s linear infinite', position: 'absolute', top: '10px', right: '10px' }} />
        </div>
        <h1 className="section-title" style={{ fontSize: '2.5rem' }}>Our Gallery</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '2rem' }}>
          The Gallery is currently under development. Stay tuned for stunning media showcases.
        </p>
        <a href="/" className="btn-primary">Return Home</a>
        <style>{`
          @keyframes spin {
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default Albums;
