import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Search, Heart, ShoppingBag, Menu, X, Globe, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const Navbar = ({ onOpenSearch }) => {
  const { t, language, toggleLanguage } = useLanguage();
  const { totalItemsCount, openCart } = useCart();
  const { count: wishlistCount } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="site-header">
        <div className="container nav-container">
          {/* Mobile Hamburger */}
          <button
            className="mobile-nav-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>

          {/* Brand Logo */}
          <Link to="/" className="nav-logo">
            <img src="/logo.png" alt="QueS.M design logo" />
            <div className="nav-logo-text">
              <span className="nav-logo-title">QueS.M</span>
              <span className="nav-logo-subtitle">design</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav>
            <ul className="nav-links">
              <li>
                <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  {t('home')}
                </NavLink>
              </li>
              <li>
                <NavLink to="/shop" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  {t('shop')}
                </NavLink>
              </li>
              <li>
                <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  {t('about')}
                </NavLink>
              </li>
              <li>
                <NavLink to="/my-orders" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  {language === 'hi' ? 'मेरे ऑर्डर्स' : 'My Orders'}
                </NavLink>
              </li>
              <li>
                <NavLink to="/track-order" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  {t('trackOrder')}
                </NavLink>
              </li>
              <li>
                <NavLink to="/contact" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  {t('contact')}
                </NavLink>
              </li>
            </ul>
          </nav>

          {/* Nav Actions */}
          <div className="nav-actions">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="lang-switch-btn"
              title="Change Language / भाषा बदलें"
            >
              <Globe size={14} />
              <span>{language === 'en' ? 'हिन्दी' : 'EN'}</span>
            </button>

            {/* Live Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="nav-action-btn"
              aria-label="Search collection"
              title="Search"
            >
              <Search size={19} />
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="nav-action-btn"
              aria-label="View Wishlist"
              title="Wishlist"
            >
              <Heart size={19} />
              {wishlistCount > 0 && <span className="nav-badge">{wishlistCount}</span>}
            </Link>

            {/* Cart Drawer Trigger */}
            <button
              onClick={openCart}
              className="nav-action-btn"
              aria-label="View Shopping Bag"
              title="Shopping Bag"
            >
              <ShoppingBag size={19} />
              {totalItemsCount > 0 && <span className="nav-badge">{totalItemsCount}</span>}
            </button>

            {/* Owner Studio Vault Link */}
            <Link
              to="/studio-vault"
              className="nav-action-btn"
              aria-label="Owner Studio Vault"
              title="Owner Studio Vault"
              style={{ color: '#d4af37' }}
            >
              <ShieldCheck size={20} />
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Slide-out Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex'
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            style={{
              width: '280px',
              height: '100%',
              background: '#fff',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              boxShadow: '4px 0 20px rgba(0,0,0,0.1)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src="/logo.png" alt="QueS.M design" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 'bold' }}>QueS.M design</span>
              </Link>
              <button onClick={() => setMobileMenuOpen(false)} style={{ background: 'none', padding: '6px' }}>
                <X size={20} />
              </button>
            </div>

            <hr style={{ borderColor: 'var(--border-color)', margin: '10px 0' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '1rem', fontWeight: '500' }}>
              <Link to="/" onClick={() => setMobileMenuOpen(false)}>{t('home')}</Link>
              <Link to="/shop" onClick={() => setMobileMenuOpen(false)}>{t('shop')}</Link>
              <Link to="/about" onClick={() => setMobileMenuOpen(false)}>{t('about')}</Link>
              <Link to="/my-orders" onClick={() => setMobileMenuOpen(false)}>
                {language === 'hi' ? 'मेरे ऑर्डर्स' : 'My Orders'}
              </Link>
              <Link to="/track-order" onClick={() => setMobileMenuOpen(false)}>{t('trackOrder')}</Link>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>{t('contact')}</Link>
              <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)}>{t('wishlist')} ({wishlistCount})</Link>
              <Link
                to="/studio-vault"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  color: '#d4af37',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  paddingTop: '8px',
                  borderTop: '1px solid #eee'
                }}
              >
                <ShieldCheck size={18} /> Owner Studio Vault
              </Link>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
              <button
                onClick={toggleLanguage}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-alt)',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Globe size={16} />
                <span>{language === 'en' ? 'Switch to हिन्दी' : 'Switch to English'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
