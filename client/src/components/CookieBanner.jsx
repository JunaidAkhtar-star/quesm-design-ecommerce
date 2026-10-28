import React, { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const CookieBanner = () => {
  const [accepted, setAccepted] = useState(true);

  useEffect(() => {
    const hasConsent = localStorage.getItem('quesm_cookie_consent');
    if (!hasConsent) {
      setAccepted(false);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('quesm_cookie_consent', 'true');
    setAccepted(true);
  };

  if (accepted) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px',
        maxWidth: '420px',
        background: 'var(--luxury-black)',
        color: '#f4f0e6',
        padding: '20px',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid rgba(212, 175, 55, 0.3)',
        zIndex: 85,
        animation: 'fadeIn 0.3s ease-out'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
        <ShieldCheck size={24} className="gold-text" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '4px' }}>Artisanal Experience & Privacy</h4>
          <p style={{ color: '#aaa', fontSize: '0.8rem', lineHeight: '1.4' }}>
            We use essential boutique cookies to remember your bag and wishlist selections. By browsing, you agree to our{' '}
            <Link to="/privacy-policy" style={{ color: 'var(--primary-gold)', textDecoration: 'underline' }}>Privacy Policy</Link>.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button
          onClick={handleAccept}
          className="btn-primary"
          style={{ padding: '8px 18px', fontSize: '0.8rem' }}
        >
          Accept & Continue
        </button>
      </div>
    </div>
  );
};

export default CookieBanner;
