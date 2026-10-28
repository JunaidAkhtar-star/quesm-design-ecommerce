import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Tag, Gift, Check, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { useLanguage } from '../context/LanguageContext';
import SEOMeta from '../components/SEOMeta';

const CartPage = () => {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    shippingFee,
    isFreeShipping,
    freeShippingThreshold,
    amountNeededForFreeShipping,
    giftWrap,
    setGiftWrap,
    giftMessage,
    setGiftMessage,
    giftWrapFee,
    appliedCoupon,
    discount,
    grandTotal,
    applyCouponCode,
    removeCouponCode
  } = useCart();

  const { formatPrice, settings } = useSettings();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [loadingCoupon, setLoadingCoupon] = useState(false);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setLoadingCoupon(true);
    setCouponError('');
    setCouponSuccess('');

    const res = await applyCouponCode(couponInput);
    setLoadingCoupon(false);

    if (res.success) {
      setCouponSuccess(res.message);
      setCouponInput('');
    } else {
      setCouponError(res.message);
    }
  };

  const percentToFreeShipping = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  if (cartItems.length === 0) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <SEOMeta title="Your Shopping Bag" />
        <ShoppingBag size={64} strokeWidth={1} style={{ margin: '0 auto 20px', opacity: 0.3 }} />
        <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', marginBottom: '12px' }}>
          {t('emptyCart')}
        </h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 24px' }}>
          Your bag is currently empty. Explore our handcrafted collection of silk thread bangles, hair accessories, and floral jewellery!
        </p>
        <Link to="/shop" className="btn-primary" style={{ padding: '14px 34px' }}>
          {t('continueShopping')}
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 20px 80px' }}>
      <SEOMeta title="Your Shopping Bag" />

      <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-heading)', marginBottom: '30px' }}>
        {t('yourCart')}
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px', alignItems: 'start' }}>
        {/* Left: Items List */}
        <div>
          {/* Free Shipping Banner */}
          <div style={{ background: '#fcf8ee', padding: '16px 20px', borderRadius: 'var(--radius-md)', border: '1px solid #ebd9b4', marginBottom: '24px' }}>
            {isFreeShipping ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2e7d32', fontWeight: 'bold', fontSize: '0.92rem' }}>
                <Check size={18} />
                <span>{t('freeShippingUnlocked')}</span>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '0.88rem', color: 'var(--primary-gold-dark)', fontWeight: '600' }}>
                  {t('freeShippingNotice', { amount: amountNeededForFreeShipping.toLocaleString('en-IN') })}
                </p>
                <div className="progress-bar-container" style={{ marginTop: '8px' }}>
                  <div className="progress-bar-fill" style={{ width: `${percentToFreeShipping}%` }}></div>
                </div>
              </div>
            )}
          </div>

          {/* Items Table / Cards */}
          <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            {cartItems.map((item) => (
              <div
                key={item.itemKey}
                style={{
                  display: 'flex',
                  gap: '18px',
                  padding: '20px',
                  borderBottom: '1px solid var(--border-color)',
                  alignItems: 'center'
                }}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  style={{ width: '84px', height: '84px', borderRadius: '10px', objectFit: 'cover' }}
                />

                <div style={{ flexGrow: 1 }}>
                  <Link to={`/product/${item.slug}`} style={{ fontWeight: 'bold', fontSize: '1.05rem', color: 'var(--luxury-black)' }}>
                    {item.name}
                  </Link>

                  {item.variant && (
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {item.variant}
                    </p>
                  )}

                  <p style={{ fontWeight: '700', fontSize: '1rem', marginTop: '6px' }}>
                    {formatPrice(item.price)}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div className="qty-pill">
                    <button className="qty-btn" onClick={() => updateQuantity(item.itemKey, item.quantity - 1)}>-</button>
                    <span className="qty-val">{item.quantity}</span>
                    <button className="qty-btn" onClick={() => updateQuantity(item.itemKey, item.quantity + 1)}>+</button>
                  </div>

                  <span style={{ fontWeight: 'bold', width: '90px', textAlign: 'right', fontSize: '1.05rem' }}>
                    {formatPrice(item.price * item.quantity)}
                  </span>

                  <button
                    onClick={() => removeFromCart(item.itemKey)}
                    style={{ background: 'none', color: '#999', padding: '6px' }}
                    aria-label="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Luxury Gift Wrap Section */}
          <div style={{ background: '#fff', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginTop: '24px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={giftWrap}
                onChange={e => setGiftWrap(e.target.checked)}
                style={{ width: '18px', height: '18px', marginTop: '3px', accentColor: 'var(--primary-gold)' }}
              />
              <div>
                <span style={{ fontWeight: 'bold', fontSize: '0.98rem' }}>
                  {t('giftWrapOption', { fee: settings.giftWrapCharge || 49 })}
                </span>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {t('giftWrapDesc')}
                </p>
              </div>
            </label>

            {giftWrap && (
              <div style={{ marginTop: '16px', paddingLeft: '30px' }}>
                <textarea
                  rows={2}
                  placeholder={t('giftMessagePlaceholder')}
                  value={giftMessage}
                  onChange={e => setGiftMessage(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.88rem'
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right: Order Summary */}
        <div style={{ background: '#fff', padding: '28px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-heading)', marginBottom: '20px' }}>
            {t('orderSummary')}
          </h3>

          {/* Coupon Input */}
          <div style={{ marginBottom: '20px' }}>
            {appliedCoupon ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#e8f5e9', padding: '10px 14px', borderRadius: 'var(--radius-sm)', color: '#2e7d32', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Tag size={16} />
                  <span>Coupon <strong>{appliedCoupon.code}</strong> applied</span>
                </div>
                <button onClick={removeCouponCode} style={{ background: 'none', color: '#c62828', fontWeight: 'bold', fontSize: '0.8rem' }}>
                  {t('removeCoupon')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Coupon code (e.g. WELCOME10)"
                  value={couponInput}
                  onChange={e => setCouponInput(e.target.value.toUpperCase())}
                  style={{ flexGrow: 1, padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.88rem' }}
                />
                <button type="submit" disabled={loadingCoupon} className="btn-outline" style={{ padding: '10px 18px', fontSize: '0.85rem' }}>
                  {loadingCoupon ? '...' : t('applyCoupon')}
                </button>
              </form>
            )}

            {couponError && <p style={{ color: '#d32f2f', fontSize: '0.78rem', marginTop: '6px' }}>{couponError}</p>}
            {couponSuccess && <p style={{ color: '#2e7d32', fontSize: '0.78rem', marginTop: '6px' }}>{couponSuccess}</p>}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.94rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>{t('subtotal')}</span>
              <span>{formatPrice(subtotal)}</span>
            </div>

            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2e7d32' }}>
                <span>{t('discount')} ({appliedCoupon?.code})</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>{t('shipping')}</span>
              <span>{shippingFee === 0 ? <strong style={{ color: '#2e7d32' }}>FREE</strong> : formatPrice(shippingFee)}</span>
            </div>

            {giftWrap && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Luxury Gift Wrap</span>
                <span>{formatPrice(giftWrapFee)}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-color)', paddingTop: '16px', marginTop: '4px', fontSize: '1.3rem', fontWeight: 'bold' }}>
              <span>{t('total')}</span>
              <span className="gold-text">{formatPrice(grandTotal)}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="btn-primary"
            style={{ width: '100%', marginTop: '24px', padding: '15px', fontSize: '1rem' }}
          >
            <span>{t('proceedToCheckout')}</span>
            <ArrowRight size={18} />
          </button>

          <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <ShieldCheck size={16} color="var(--primary-gold)" />
            <span>Guaranteed Safe & Secure Checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
