import React, { useEffect } from 'react';
import './Contact.css';
import heroBanner from '../assets/gallery/gallery1.PNG';

const Contact = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="contact-page-simple" style={{ backgroundColor: '#000', minHeight: '100vh', padding: '100px 20px 50px 20px', fontFamily: 'var(--font-body)' }}>
      
      {/* Header Section */}
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: 'white', marginBottom: '15px' }}>Contact Tamil Pasanga VTC</h1>
        <div style={{ width: '40px', height: '3px', backgroundColor: 'white', margin: '0 auto 30px auto' }}></div>
        <p style={{ color: '#6b7280', fontSize: '1.2rem', maxWidth: '650px', margin: '0 auto', lineHeight: '1.6' }}>
          Connect with us through our active community channels. Whether you want to join our convoys or just hang out, you are always welcome!
        </p>
      </div>

      {/* Cards Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px', maxWidth: '1100px', margin: '0 auto 60px auto' }}>
        
        {/* Discord Card */}
        <div style={{ border: '1px solid #222', borderRadius: '12px', padding: '40px', backgroundColor: '#0a0a0a', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.8rem', color: 'white', marginBottom: '15px', fontWeight: 'bold' }}>Discord Community</h2>
          <p style={{ color: '#9ca3af', fontSize: '1.1rem', marginBottom: '40px', lineHeight: '1.6', flex: 1 }}>
            Join our active Discord server for real-time communication, convoy announcements, and community discussions.
          </p>
          <a href="https://discord.com/invite/FtYBxZxTBF" target="_blank" rel="noreferrer" style={{ display: 'block', textAlign: 'center', backgroundColor: 'white', color: 'black', padding: '16px', borderRadius: '30px', fontWeight: 'bold', fontSize: '1.1rem', textDecoration: 'none', transition: 'transform 0.2s' }} onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'} onMouseOut={(e) => e.target.style.transform = 'scale(1)'}>
            Join Discord Server
          </a>
        </div>
        
        {/* TruckersMP Card */}
        <div style={{ border: '1px solid #222', borderRadius: '12px', padding: '40px', backgroundColor: '#0a0a0a', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.8rem', color: 'white', marginBottom: '15px', fontWeight: 'bold' }}>TruckersMP Profile</h2>
          <p style={{ color: '#9ca3af', fontSize: '1.1rem', marginBottom: '40px', lineHeight: '1.6', flex: 1 }}>
            Visit our official TruckersMP VTC page to see our latest statistics, member list, and convoy schedules.
          </p>
          <a href="https://truckersmp.com/vtc/73933-tamil_pasanga" target="_blank" rel="noreferrer" style={{ display: 'block', textAlign: 'center', backgroundColor: 'white', color: 'black', padding: '16px', borderRadius: '30px', fontWeight: 'bold', fontSize: '1.1rem', textDecoration: 'none', transition: 'transform 0.2s' }} onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'} onMouseOut={(e) => e.target.style.transform = 'scale(1)'}>
            View VTC Profile
          </a>
        </div>

      </div>

      {/* Bottom Banner */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', borderRadius: '16px', overflow: 'hidden', height: '350px' }}>
        <img 
          src={heroBanner} 
          alt="Tamil Pasanga VTC Banner" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
      </div>

    </div>
  );
};

export default Contact;
