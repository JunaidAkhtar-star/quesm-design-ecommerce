import React, { useState, useEffect } from 'react';
import { ShoppingBag, X, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';

const AbandonedCartReminder = () => {
  const { cartItems, openCart } = useCart();
  const { formatPrice } = useSettings();
  const [showReminder, setShowReminder] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (cartItems.length === 0 || dismissed) {
      setShowReminder(false);
      return;
    }

    // Check if user has idle items in cart after 35 seconds
    const timer = setTimeout(() => {
      const alreadyShown = sessionStorage.getItem('quesm_abandoned_shown');
      if (!alreadyShown && cartItems.length > 0) {
        setShowReminder(true);
        sessionStorage.setItem('quesm_abandoned_shown', 'true');
      }
    }, 35000);

    return () => clearTimeout(timer);
  }, [cartItems, dismissed]);

  if (!showReminder || cartItems.length === 0) return null;

  const firstItem = cartItems[0];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '100px',
        left: '24px',
        maxWidth: '360px',
        background: '#ffffff',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--primary-gold)',
        padding: '16px',
        zIndex: 80,
        animation: 'fadeIn 0.3s ease-out',
        display: 'flex',
        gap: '12px',
        alignItems: 'center'
      }}
    >
      <img
        src={firstItem.image}
        alt={firstItem.name}
        style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }}
      />
      <div style={{ flexGrow: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--primary-gold-dark)', fontWeight: 'bold' }}>
          <Sparkles size={12} />
          <span>YOUR BAG IS WAITING</span>
        </div>
        <p style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--luxury-black)', margin: '2px 0' }}>
          Don't forget your handmade pieces!
        </p>
        <button
          onClick={() => {
            setShowReminder(false);
            openCart();
          }}
          style={{
            background: 'none',
            color: 'var(--primary-gold-dark)',
            fontSize: '0.78rem',
            fontWeight: 'bold',
            textDecoration: 'underline'
          }}
        >
          View Bag & Checkout &rarr;
        </button>
      </div>

      <button
        onClick={() => {
          setShowReminder(false);
          setDismissed(true);
        }}
        style={{ background: 'none', color: '#999', padding: '4px', alignSelf: 'flex-start' }}
        aria-label="Dismiss reminder"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default AbandonedCartReminder;
