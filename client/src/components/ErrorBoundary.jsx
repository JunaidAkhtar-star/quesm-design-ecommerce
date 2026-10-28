import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('QueS.M UI Caught Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '60vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px',
            textAlign: 'center',
            background: 'var(--bg-warm, #FAF9F5)'
          }}
        >
          <div
            style={{
              maxWidth: '480px',
              padding: '36px',
              background: '#fff',
              borderRadius: '16px',
              border: '1px solid #e8e2d5',
              boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
            }}
          >
            <img
              src="/logo.png"
              alt="QueS.M design"
              style={{ width: '60px', height: '60px', borderRadius: '50%', margin: '0 auto 16px', border: '1px solid #D4AF37' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)', color: '#0F0F12', marginBottom: '8px' }}>
              Artisanal Boutique
            </h2>
            <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '20px' }}>
              We encountered a minor refresh issue while loading this page. Please click below to refresh and continue shopping.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #aa820a 100%)',
                color: '#fff',
                border: 'none',
                padding: '12px 28px',
                borderRadius: '30px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

