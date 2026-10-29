import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ShieldAlert, KeyRound, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SEOMeta from '../components/SEOMeta';

const AdminLoginPage = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Strictly enforce empty inputs and clear any browser autofill cache
  useEffect(() => {
    setEmail('');
    setPassword('');
    const t1 = setTimeout(() => {
      setEmail('');
      setPassword('');
    }, 50);
    const t2 = setTimeout(() => {
      setEmail('');
      setPassword('');
    }, 200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    const res = await login(email, password, requires2FA ? totpCode : undefined);
    setLoading(false);

    if (res.requires2FA) {
      setRequires2FA(true);
    } else if (res.success) {
      navigate('/admin/dashboard');
    } else {
      setErrorMessage(res.message || 'Login failed');
    }
  };

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        background: 'linear-gradient(135deg, #141417 0%, #0d0d0f 100%)'
      }}
    >
      <SEOMeta title="Owner Portal Login" />

      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          background: '#1a1a20',
          borderRadius: 'var(--radius-xl)',
          padding: '40px 32px',
          border: '1px solid rgba(212, 175, 55, 0.3)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
          color: '#fff'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <img
            src="/logo.png"
            alt="QueS.M design"
            style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              margin: '0 auto 16px',
              border: '2px solid var(--primary-gold)'
            }}
          />
          <span className="hero-badge" style={{ marginBottom: '8px' }}>Store Owner Area</span>
          <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-heading)', color: '#f7e7b4' }}>
            Owner Authentication
          </h2>
          <p style={{ color: '#888', fontSize: '0.84rem', marginTop: '4px' }}>
            Single authorized proprietor access point
          </p>
        </div>

        {errorMessage && (
          <div
            style={{
              background: 'rgba(211, 47, 47, 0.15)',
              border: '1px solid #d32f2f',
              color: '#ff8a80',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.84rem',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <ShieldAlert size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          autoCapitalize="none"
          style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}
        >
          {/* Decoy trap inputs to capture aggressive browser autofill */}
          <input type="text" name="fake_user_autofill_trap" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
          <input type="password" name="fake_pass_autofill_trap" style={{ display: 'none' }} tabIndex={-1} autoComplete="new-password" />

          {!requires2FA ? (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#ccc', marginBottom: '6px', fontWeight: '600', letterSpacing: '0.6px' }}>
                  USERNAME
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    name="studio_vault_owner_id"
                    required
                    autoComplete="new-password"
                    autoCapitalize="none"
                    spellCheck="false"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter USERNAME"
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 40px',
                      background: '#121215',
                      border: '1px solid #333',
                      borderRadius: 'var(--radius-sm)',
                      color: '#fff',
                      fontSize: '0.92rem'
                    }}
                  />
                  <User size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#777' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#ccc', marginBottom: '6px', fontWeight: '600', letterSpacing: '0.6px' }}>
                  PASSWORD
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    name="studio_vault_owner_secret"
                    required
                    autoComplete="new-password"
                    autoCapitalize="none"
                    spellCheck="false"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter PASSWORD"
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 40px',
                      background: '#121215',
                      border: '1px solid #333',
                      borderRadius: 'var(--radius-sm)',
                      color: '#fff',
                      fontSize: '0.92rem'
                    }}
                  />
                  <Lock size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#777' }} />
                </div>
              </div>
            </>
          ) : (
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#f7e7b4', marginBottom: '6px' }}>
                Enter 6-Digit Authenticator Code
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={6}
                  value={totpCode}
                  onChange={e => setTotpCode(e.target.value)}
                  placeholder="123456"
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 40px',
                    background: '#121215',
                    border: '1px solid var(--primary-gold)',
                    borderRadius: 'var(--radius-sm)',
                    color: '#fff',
                    fontSize: '1.2rem',
                    letterSpacing: '4px',
                    textAlign: 'center'
                  }}
                />
                <KeyRound size={17} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary-gold)' }} />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '14px', marginTop: '8px', fontSize: '0.95rem' }}
          >
            <Sparkles size={16} />
            <span>{loading ? 'Authenticating...' : requires2FA ? 'Verify 2FA & Access' : 'Sign In as Owner'}</span>
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.75rem', color: '#666' }}>
          🛡️ Protected by brute-force rate locking, device detection, and audit logging.
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
