import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import SEOMeta from '../components/SEOMeta';

const NotFoundPage = () => {
  return (
    <div className="container" style={{ padding: '100px 20px', textAlign: 'center' }}>
      <SEOMeta title="Page Not Found" />
      <span className="gold-badge" style={{ marginBottom: '16px' }}>
        <Sparkles size={14} />
        <span>404 Error</span>
      </span>
      <h1 style={{ fontSize: '3.6rem', fontFamily: 'var(--font-heading)', margin: '10px 0 16px' }}>
        Lost in Craftsmanship?
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '480px', margin: '0 auto 30px' }}>
        The page or handcrafted piece you are looking for has been moved or does not exist. Let's guide you back to our boutique treasures.
      </p>
      <Link to="/shop" className="btn-primary" style={{ padding: '14px 34px', fontSize: '1rem' }}>
        <span>Browse All Collections</span>
        <ArrowRight size={18} />
      </Link>
    </div>
  );
};

export default NotFoundPage;
