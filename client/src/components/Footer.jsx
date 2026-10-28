import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube, MessageCircle, Heart, ShieldCheck, Truck, RefreshCw, Send } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
  const { settings, getWhatsAppLink } = useSettings();
  const { t, language } = useLanguage();
  const [newsletterPhone, setNewsletterPhone] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterPhone) return;
    setSubscribed(true);
    setTimeout(() => {
      window.open(getWhatsAppLink(`Hi QueS.M design! I would like to join your VIP club and receive 10% off updates. Phone: ${newsletterPhone}`), '_blank');
    }, 400);
  };

  return (
    <footer className="site-footer">
      {/* Trust Badges */}
      <div className="container" style={{ marginBottom: '50px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '24px',
            padding: '28px',
            background: '#16161a',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(212, 175, 55, 0.2)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ background: 'rgba(212, 175, 55, 0.15)', padding: '12px', borderRadius: '50%', color: 'var(--primary-gold)' }}>
              <Heart size={22} />
            </div>
            <div>
              <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '2px' }}>100% Handcrafted</h4>
              <p style={{ color: '#888', fontSize: '0.78rem' }}>Lovingly made by skilled Indian women artisans</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ background: 'rgba(212, 175, 55, 0.15)', padding: '12px', borderRadius: '50%', color: 'var(--primary-gold)' }}>
              <Truck size={22} />
            </div>
            <div>
              <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '2px' }}>Free Express Shipping</h4>
              <p style={{ color: '#888', fontSize: '0.78rem' }}>On all domestic orders above ₹{settings.freeShippingThreshold || 799}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ background: 'rgba(212, 175, 55, 0.15)', padding: '12px', borderRadius: '50%', color: 'var(--primary-gold)' }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '2px' }}>Safe & Secure Checkout</h4>
              <p style={{ color: '#888', fontSize: '0.78rem' }}>UPI, Cards, NetBanking or Cash on Delivery</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ background: 'rgba(212, 175, 55, 0.15)', padding: '12px', borderRadius: '50%', color: 'var(--primary-gold)' }}>
              <RefreshCw size={22} />
            </div>
            <div>
              <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '2px' }}>Personal Assistance</h4>
              <p style={{ color: '#888', fontSize: '0.78rem' }}>Custom orders & instant WhatsApp support</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container footer-top">
        {/* Brand Story Column */}
        <div className="footer-brand">
          <img src="/logo.png" alt="QueS.M design" />
          <h3>QueS.M design</h3>
          <p>{t('handmadePromise')}</p>
          <div className="social-icons-row">
            {settings.socialLinks?.instagram && (
              <a href={settings.socialLinks.instagram} target="_blank" rel="noreferrer" className="social-icon-circle" aria-label="Instagram">
                <Instagram size={18} />
              </a>
            )}
            {settings.socialLinks?.facebook && (
              <a href={settings.socialLinks.facebook} target="_blank" rel="noreferrer" className="social-icon-circle" aria-label="Facebook">
                <Facebook size={18} />
              </a>
            )}
            {settings.socialLinks?.youtube && (
              <a href={settings.socialLinks.youtube} target="_blank" rel="noreferrer" className="social-icon-circle" aria-label="YouTube">
                <Youtube size={18} />
              </a>
            )}
            <a href={getWhatsAppLink()} target="_blank" rel="noreferrer" className="social-icon-circle" aria-label="WhatsApp">
              <MessageCircle size={18} />
            </a>
          </div>
        </div>

        {/* Categories Column */}
        <div>
          <h4 className="footer-title">{t('categories')}</h4>
          <ul className="footer-links">
            <li><Link to="/category/silk-thread-bangles">Silk Thread Bangles</Link></li>
            <li><Link to="/category/bracelets">Bracelets</Link></li>
            <li><Link to="/category/earrings">Earrings</Link></li>
            <li><Link to="/category/flower-jewellery">Flower Jewellery</Link></li>
            <li><Link to="/category/hair-accessories">Hair Accessories</Link></li>
            <li><Link to="/category/phone-charms-bag-charms">Phone & Bag Charms</Link></li>
            <li><Link to="/category/phone-covers">Resin Phone Covers</Link></li>
          </ul>
        </div>

        {/* Customer Care Column */}
        <div>
          <h4 className="footer-title">{t('customerService')}</h4>
          <ul className="footer-links">
            <li><Link to="/my-orders">{language === 'hi' ? 'मेरे ऑर्डर्स' : 'My Orders'}</Link></li>
            <li><Link to="/track-order">{t('trackOrder')}</Link></li>
            <li><Link to="/wishlist">{t('wishlist')}</Link></li>
            <li><Link to="/about">{t('about')}</Link></li>
            <li><Link to="/contact">{t('contact')}</Link></li>
            <li><Link to="/shipping-policy">{t('shippingPolicy')}</Link></li>
            <li><Link to="/return-policy">{t('returnPolicy')}</Link></li>
            <li><Link to="/privacy-policy">{t('privacyPolicy')}</Link></li>
            <li><Link to="/terms">{t('termsConditions')}</Link></li>
          </ul>
        </div>

        {/* WhatsApp VIP Club & Newsletter */}
        <div>
          <h4 className="footer-title">{t('joinNewsletter')}</h4>
          <p style={{ color: '#a09d94', fontSize: '0.86rem', lineHeight: '1.5', marginBottom: '14px' }}>
            {t('newsletterSubtitle')}
          </p>
          {subscribed ? (
            <div style={{ background: 'rgba(212, 175, 55, 0.15)', padding: '12px', borderRadius: 'var(--radius-sm)', color: '#f7e7b4', fontSize: '0.85rem' }}>
              ✨ Welcome to the QueS.M circle! Connecting you to WhatsApp...
            </div>
          ) : (
            <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="tel"
                placeholder="Enter WhatsApp / Mobile No."
                value={newsletterPhone}
                onChange={e => setNewsletterPhone(e.target.value)}
                required
                style={{
                  flexGrow: 1,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #333',
                  background: '#19191e',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              />
              <button
                type="submit"
                className="btn-primary"
                style={{ padding: '10px 16px', borderRadius: 'var(--radius-sm)' }}
                aria-label="Submit phone number"
              >
                <Send size={16} />
              </button>
            </form>
          )}

          <div style={{ marginTop: '22px', fontSize: '0.82rem', color: '#888' }}>
            <p><strong>Studio Address:</strong> {settings.storeAddress}</p>
            <p style={{ marginTop: '4px' }}><strong>Email:</strong> {settings.storeEmail}</p>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="container footer-bottom">
        <div>
          &copy; {new Date().getFullYear()} <strong>QueS.M design</strong>. {t('rightsReserved')}
        </div>
        <div>
          Crafted with love for artisanal excellence
        </div>
      </div>
    </footer>
  );
};

export default Footer;
