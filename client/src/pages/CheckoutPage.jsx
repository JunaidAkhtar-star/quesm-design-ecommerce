import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { ShieldCheck, Truck, ArrowLeft, CreditCard, Banknote, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { useLanguage } from '../context/LanguageContext';
import SEOMeta from '../components/SEOMeta';

const CheckoutPage = () => {
  const {
    cartItems,
    subtotal,
    shippingFee,
    giftWrap,
    setGiftWrap,
    giftMessage,
    setGiftMessage,
    appliedCoupon,
    discount,
    grandTotal,
    clearCart
  } = useCart();

  const { formatPrice, settings } = useSettings();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    notes: ''
  });

  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' or 'razorpay'
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (cartItems.length === 0) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2>Your bag is empty</h2>
        <p style={{ margin: '14px 0 24px', color: 'var(--text-muted)' }}>Add pieces to your bag before proceeding to checkout.</p>
        <Link to="/shop" className="btn-primary">Browse Pieces</Link>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      // 1. Create order on backend
      const orderPayload = {
        customer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        },
        items: cartItems.map(item => ({
          productId: item.productId,
          name: item.name,
          variant: item.variant,
          quantity: item.quantity
        })),
        paymentMethod,
        couponCode: appliedCoupon?.code || null,
        giftWrap,
        giftMessage: giftWrap ? giftMessage : '',
        notes: formData.notes
      };

      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const orderData = await orderRes.json();

      if (!orderData.success) {
        setErrorMessage(orderData.message || 'Failed to place order');
        setSubmitting(false);
        return;
      }

      const createdOrder = orderData.order;

      // Save order number & phone to customer browser storage for My Orders
      try {
        const stored = JSON.parse(localStorage.getItem('quesm_placed_orders') || '[]');
        if (!stored.includes(createdOrder.orderNumber)) {
          stored.unshift(createdOrder.orderNumber);
          localStorage.setItem('quesm_placed_orders', JSON.stringify(stored));
        }
        localStorage.setItem('quesm_cust_phone', formData.phone);
      } catch (e) {}

      // 2. If Cash on Delivery, finish immediately
      if (paymentMethod === 'cod') {
        confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
        clearCart();
        navigate(`/order-success/${createdOrder.orderNumber}`);
        return;
      }

      // 3. If Razorpay, initiate online gateway
      if (paymentMethod === 'razorpay') {
        const razorpayRes = await fetch('/api/payments/razorpay/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: grandTotal, receipt: createdOrder.orderNumber })
        });

        const rzpData = await razorpayRes.json();

        // Check if Razorpay script is ready
        if (window.Razorpay && !rzpData.isSandboxMock) {
          const options = {
            key: rzpData.keyId,
            amount: rzpData.amount,
            currency: 'INR',
            name: 'QueS.M design',
            description: `Order #${createdOrder.orderNumber}`,
            image: '/logo.png',
            order_id: rzpData.orderId,
            prefill: {
              name: formData.name,
              email: formData.email,
              contact: formData.phone
            },
            theme: { color: '#d4af37' },
            handler: async function (response) {
              // Verify signature on server
              const verifyRes = await fetch('/api/payments/razorpay/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderNumber: createdOrder.orderNumber,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                })
              });

              const verifyData = await verifyRes.json();
              if (verifyData.success) {
                confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
                clearCart();
                navigate(`/order-success/${createdOrder.orderNumber}`);
              } else {
                setErrorMessage('Payment verification failed. Please contact support.');
                setSubmitting(false);
              }
            },
            modal: {
              ondismiss: function () {
                setSubmitting(false);
                setErrorMessage('Payment cancelled by customer.');
              }
            }
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        } else {
          // Development / simulated online mode
          const verifyRes = await fetch('/api/payments/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderNumber: createdOrder.orderNumber,
              razorpay_order_id: rzpData.orderId,
              razorpay_payment_id: `pay_simulated_${Date.now()}`
            })
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
            clearCart();
            navigate(`/order-success/${createdOrder.orderNumber}`);
          }
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error communicating with server');
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 20px 80px' }}>
      <SEOMeta title="Guest Checkout" />

      <div style={{ marginBottom: '24px' }}>
        <Link to="/cart" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          <ArrowLeft size={16} />
          <span>Return to Shopping Bag</span>
        </Link>
        <h1 style={{ fontSize: '2.4rem', fontFamily: 'var(--font-heading)', marginTop: '12px' }}>
          {t('checkoutTitle')}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
          Instant guest checkout • No password or account registration needed
        </p>
      </div>

      <form onSubmit={handleCheckoutSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '48px', alignItems: 'start' }}>
        {/* Left Column: Shipping & Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Customer Shipping Form */}
          <div style={{ background: '#fff', padding: '28px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck size={20} className="gold-text" />
              <span>{t('shippingDetails')}</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '6px' }}>
                  {t('fullName')} *
                </label>
                <input
                  type="text"
                  required
                  name="name"
                  placeholder="e.g. Radhika Sharma"
                  value={formData.name}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.95rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '6px' }}>
                    {t('phoneNumber')} *
                  </label>
                  <input
                    type="tel"
                    required
                    name="phone"
                    placeholder="10-digit mobile no."
                    value={formData.phone}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.95rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '6px' }}>
                    {t('emailAddress')} *
                  </label>
                  <input
                    type="email"
                    required
                    name="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.95rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '6px' }}>
                  {t('streetAddress')} *
                </label>
                <input
                  type="text"
                  required
                  name="address"
                  placeholder="House/Flat number, Street name, Landmark"
                  value={formData.address}
                  onChange={handleChange}
                  style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.95rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '4px' }}>
                    {t('city')} *
                  </label>
                  <input
                    type="text"
                    required
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '4px' }}>
                    {t('state')} *
                  </label>
                  <input
                    type="text"
                    required
                    name="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '4px' }}>
                    {t('pincode')} *
                  </label>
                  <input
                    type="text"
                    required
                    name="pincode"
                    placeholder="PIN Code"
                    value={formData.pincode}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div style={{ background: '#fff', padding: '28px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', marginBottom: '18px' }}>
              {t('paymentMethod')}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Cash on Delivery */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: paymentMethod === 'cod' ? '2px solid var(--primary-gold)' : '1px solid var(--border-color)',
                  background: paymentMethod === 'cod' ? 'var(--primary-gold-subtle)' : '#fff',
                  cursor: 'pointer'
                }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary-gold)' }}
                />
                <Banknote size={22} color="var(--primary-gold-dark)" />
                <div style={{ flexGrow: 1 }}>
                  <span style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{t('cod')}</span>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Pay with cash or UPI on doorstep arrival</p>
                </div>
              </label>

              {/* Online Payment (Razorpay) */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: paymentMethod === 'razorpay' ? '2px solid var(--primary-gold)' : '1px solid var(--border-color)',
                  background: paymentMethod === 'razorpay' ? 'var(--primary-gold-subtle)' : '#fff',
                  cursor: 'pointer'
                }}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="razorpay"
                  checked={paymentMethod === 'razorpay'}
                  onChange={() => setPaymentMethod('razorpay')}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary-gold)' }}
                />
                <CreditCard size={22} color="var(--primary-gold-dark)" />
                <div style={{ flexGrow: 1 }}>
                  <span style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{t('razorpay')}</span>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Pay instantly with GPay, PhonePe, Paytm, Cards, or NetBanking</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Review & Submit */}
        <div style={{ background: '#fff', padding: '28px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-heading)', marginBottom: '18px' }}>
            Review Order ({cartItems.length} items)
          </h3>

          <div style={{ maxHeight: '280px', overflowY: 'auto', marginBottom: '20px', paddingRight: '4px' }}>
            {cartItems.map((item) => (
              <div key={item.itemKey} style={{ display: 'flex', gap: '12px', paddingBottom: '12px', marginBottom: '12px', borderBottom: '1px solid #f0ebe0', alignItems: 'center' }}>
                <img src={item.image} alt={item.name} style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover' }} />
                <div style={{ flexGrow: 1 }}>
                  <p style={{ fontSize: '0.9rem', fontWeight: '600', margin: 0 }}>{item.name}</p>
                  {item.variant && <span style={{ fontSize: '0.75rem', color: '#777' }}>{item.variant}</span>}
                  <span style={{ display: 'block', fontSize: '0.82rem', color: '#666' }}>Qty: {item.quantity}</span>
                </div>
                <span style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.92rem' }}>
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
                <span>{formatPrice(settings.giftWrapCharge || 49)}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-color)', paddingTop: '14px', marginTop: '4px', fontSize: '1.3rem', fontWeight: 'bold' }}>
              <span>{t('total')}</span>
              <span className="gold-text">{formatPrice(grandTotal)}</span>
            </div>
          </div>

          {errorMessage && (
            <div style={{ marginTop: '16px', padding: '12px', background: '#ffebee', color: '#c62828', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
            style={{ width: '100%', padding: '16px', marginTop: '24px', fontSize: '1.05rem' }}
          >
            <Sparkles size={18} />
            <span>{submitting ? t('placingOrder') : t('placeOrder')}</span>
          </button>

          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <ShieldCheck size={16} color="var(--primary-gold)" />
            <span>100% Encrypted & Authenticated Order</span>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
