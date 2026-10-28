import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Gift, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { useLanguage } from '../context/LanguageContext';

const CartDrawer = () => {
  const {
    cartItems,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    subtotal,
    shippingFee,
    isFreeShipping,
    freeShippingThreshold,
    amountNeededForFreeShipping,
    appliedCoupon,
    discount,
    grandTotal,
    applyCouponCode,
    removeCouponCode
  } = useCart();

  const { formatPrice } = useSettings();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [loadingCoupon, setLoadingCoupon] = useState(false);

  if (!isCartOpen) return null;

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

  const handleProceedToCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  const percentToFreeShipping = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="cart-drawer-overlay" onClick={closeCart}>
      <div className="cart-drawer" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="cart-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={20} className="gold-text" />
            <h3 className="cart-drawer-title">{t('yourCart')}</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>({cartItems.length})</span>
          </div>
          <button className="cart-drawer-close" onClick={closeCart} aria-label="Close cart">
            <X size={22} />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div className="cart-free-shipping-progress">
          {isFreeShipping ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Check size={16} color="#2e7d32" />
              <span>{t('freeShippingUnlocked')}</span>
            </div>
          ) : (
            <div>
              <span>{t('freeShippingNotice', { amount: amountNeededForFreeShipping.toLocaleString('en-IN') })}</span>
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${percentToFreeShipping}%` }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Body Items */}
        <div className="cart-drawer-body">
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <ShoppingBag size={54} strokeWidth={1} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
              <h4 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{t('emptyCart')}</h4>
              <p style={{ fontSize: '0.88rem', marginBottom: '24px' }}>Discover our handmade collection of bangles, charms, and flower jewellery.</p>
              <button onClick={() => { closeCart(); navigate('/shop'); }} className="btn-primary">
                {t('continueShopping')}
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.itemKey} className="cart-item-row">
                <img src={item.image} alt={item.name} className="cart-item-img" />
                <div className="cart-item-details">
                  <Link
                    to={`/product/${item.slug}`}
                    onClick={closeCart}
                    className="cart-item-name"
                    title={item.name}
                  >
                    {item.name}
                  </Link>

                  {item.variant && <span className="cart-item-variant">{item.variant}</span>}

                  <span className="cart-item-price">{formatPrice(item.price)}</span>

                  <div className="cart-item-controls">
                    <div className="qty-pill">
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.itemKey, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="qty-val">{item.quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.itemKey, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <button
                      className="cart-item-remove-btn"
                      onClick={() => removeFromCart(item.itemKey)}
                      aria-label="Remove item"
                      title="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary */}
        {cartItems.length > 0 && (
          <div className="cart-drawer-footer">
            {/* Coupon field */}
            <div style={{ marginBottom: '16px' }}>
              {appliedCoupon ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: '#e8f5e9',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    color: '#2e7d32'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Tag size={15} />
                    <span>Coupon <strong>{appliedCoupon.code}</strong> applied (-{formatPrice(discount)})</span>
                  </div>
                  <button
                    onClick={removeCouponCode}
                    style={{ background: 'none', color: '#c62828', fontSize: '0.75rem', fontWeight: 'bold' }}
                  >
                    {t('removeCoupon')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Enter coupon (e.g. WELCOME10)"
                    value={couponInput}
                    onChange={e => setCouponInput(e.target.value.toUpperCase())}
                    style={{
                      flexGrow: 1,
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.85rem'
                    }}
                  />
                  <button
                    type="submit"
                    className="btn-outline"
                    disabled={loadingCoupon}
                    style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                  >
                    {loadingCoupon ? '...' : t('applyCoupon')}
                  </button>
                </form>
              )}

              {couponError && <p style={{ color: '#d32f2f', fontSize: '0.75rem', marginTop: '4px' }}>{couponError}</p>}
              {couponSuccess && <p style={{ color: '#2e7d32', fontSize: '0.75rem', marginTop: '4px' }}>{couponSuccess}</p>}
            </div>

            {/* Calculations */}
            <div className="cart-summary-line">
              <span style={{ color: 'var(--text-muted)' }}>{t('subtotal')}</span>
              <span>{formatPrice(subtotal)}</span>
            </div>

            {discount > 0 && (
              <div className="cart-summary-line" style={{ color: '#2e7d32' }}>
                <span>{t('discount')}</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}

            <div className="cart-summary-line">
              <span style={{ color: 'var(--text-muted)' }}>{t('shipping')}</span>
              <span>{shippingFee === 0 ? <strong style={{ color: '#2e7d32' }}>FREE</strong> : formatPrice(shippingFee)}</span>
            </div>

            <div className="cart-summary-total">
              <span>{t('total')}</span>
              <span className="gold-text">{formatPrice(grandTotal)}</span>
            </div>

            <button
              onClick={handleProceedToCheckout}
              className="btn-primary"
              style={{ width: '100%', marginTop: '16px', padding: '14px' }}
            >
              <span>{t('proceedToCheckout')}</span>
              <ArrowRight size={17} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
