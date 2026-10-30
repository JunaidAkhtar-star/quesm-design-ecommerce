import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Truck, Search, CheckCircle2, Package, Clock, ShieldCheck, MessageCircle } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import LuxurySpinner from '../components/LuxurySpinner';
import SEOMeta from '../components/SEOMeta';

const OrderTrackingPage = () => {
  const [searchParams] = useSearchParams();
  const urlOrderId = searchParams.get('id') || '';

  const { formatPrice, getWhatsAppLink } = useSettings();

  const [orderNumber, setOrderNumber] = useState(urlOrderId);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const statusSteps = ['Placed', 'Confirmed', 'Packed', 'Shipped', 'Delivered'];

  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setOrder(null);

    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber, phone })
      });

      const data = await res.json();
      if (data.success && data.order) {
        setOrder(data.order);
      } else {
        setErrorMessage(data.message || 'No matching order found');
      }
    } catch (err) {
      setErrorMessage('Server connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (status) => {
    return statusSteps.indexOf(status);
  };

  const currentStepIdx = order ? getStepIndex(order.orderStatus) : 0;

  return (
    <div className="customer-dashboard-container">
      <SEOMeta title="Track Your Order" />

      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <span className="gold-badge" style={{ marginBottom: '10px' }}>Real-Time Dispatch Tracker</span>
        <h1 className="customer-header-title">
          Track Your Handmade Order
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '520px', margin: '0 auto' }}>
          Enter your Order ID and the phone number provided at checkout to view real-time delivery status.
        </p>
      </div>

      {/* Tracking Form */}
      <div className="customer-lookup-card">
        <form onSubmit={handleTrackSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '6px' }}>
              Order ID *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. QSM-20261028-1234"
              value={orderNumber}
              onChange={e => setOrderNumber(e.target.value.toUpperCase())}
              style={{ width: '100%', padding: '11px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.92rem', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 'bold', marginBottom: '6px' }}>
              Phone Number *
            </label>
            <input
              type="tel"
              required
              placeholder="10-digit mobile number"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              style={{ width: '100%', padding: '11px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.92rem', boxSizing: 'border-box' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ height: '46px', fontSize: '0.92rem', width: '100%', justifyContent: 'center' }}
          >
            <Search size={17} />
            <span>{loading ? 'Searching...' : 'Track Order'}</span>
          </button>
        </form>

        {errorMessage && (
          <div style={{ marginTop: '16px', padding: '12px', background: '#ffebee', color: '#c62828', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
            {errorMessage}
          </div>
        )}
      </div>

      {/* Rotating Luxury Loading State */}
      {loading && (
        <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '50px 20px', border: '1px solid var(--border-color)', margin: '20px 0' }}>
          <LuxurySpinner
            size="lg"
            message="Tracking Your Dispatch..."
            submessage="Connecting with courier networks and studio dispatch logs."
          />
        </div>
      )}

      {/* Tracking Results */}
      {order && (
        <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', padding: '24px 20px', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '18px' }}>
            <div>
              <span className="gold-badge" style={{ marginBottom: '6px' }}>Order Status</span>
              <h3 style={{ fontSize: '1.45rem', fontFamily: 'var(--font-heading)', margin: '4px 0' }}>#{order.orderNumber}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', margin: 0 }}>
                Recipient: <strong>{order.customerName}</strong> ({order.city}, {order.state})
              </p>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Amount</span>
              <h4 className="gold-text" style={{ fontSize: '1.35rem', fontWeight: 'bold', margin: '2px 0' }}>{formatPrice(order.totalAmount)}</h4>
              <span style={{ fontSize: '0.78rem', color: '#666', textTransform: 'capitalize' }}>Payment: {order.paymentMethod?.toUpperCase()} ({order.paymentStatus})</span>
            </div>
          </div>

          {/* Desktop Horizontal Step Progress Bar (Tablets/Desktops) */}
          <div className="stepper-desktop" style={{ margin: '36px 0 44px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
              {/* Connecting line */}
              <div
                style={{
                  position: 'absolute',
                  top: '18px',
                  left: '30px',
                  right: '30px',
                  height: '4px',
                  background: '#e0dbce',
                  zIndex: 1
                }}
              >
                <div
                  style={{
                    height: '100%',
                    background: 'var(--gold-gradient)',
                    width: currentStepIdx >= 0 ? `${(currentStepIdx / (statusSteps.length - 1)) * 100}%` : '0%',
                    transition: 'width 0.4s ease'
                  }}
                />
              </div>

              {statusSteps.map((step, idx) => {
                const isPassed = currentStepIdx >= idx;
                const isCurrent = currentStepIdx === idx;

                return (
                  <div key={step} style={{ position: 'relative', zIndex: 2, textAlign: 'center', width: '80px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: isPassed ? 'var(--primary-gold)' : '#fff',
                        border: isPassed ? '2px solid var(--primary-gold)' : '2px solid #ccc',
                        color: isPassed ? '#121214' : '#999',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 8px',
                        fontWeight: 'bold',
                        fontSize: '0.85rem',
                        boxShadow: isCurrent ? '0 0 0 6px rgba(212, 175, 55, 0.25)' : 'none'
                      }}
                    >
                      {isPassed ? '✓' : idx + 1}
                    </div>
                    <span style={{ fontSize: '0.82rem', fontWeight: isCurrent ? 'bold' : '500', color: isCurrent ? 'var(--luxury-black)' : 'var(--text-muted)' }}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile Vertical Step Progression (Phones < 768px) */}
          <div className="stepper-mobile">
            {statusSteps.map((step, idx) => {
              const isPassed = currentStepIdx >= idx;
              const isCurrent = currentStepIdx === idx;
              const isLast = idx === statusSteps.length - 1;

              return (
                <div key={step} className="stepper-mobile-step">
                  {!isLast && (
                    <div className={`stepper-mobile-line ${currentStepIdx > idx ? 'passed' : ''}`} />
                  )}
                  <div
                    className="stepper-mobile-bullet"
                    style={{
                      background: isPassed ? 'var(--primary-gold)' : '#fff',
                      border: isPassed ? '2px solid var(--primary-gold)' : '2px solid #ccc',
                      color: isPassed ? '#121214' : '#999',
                      boxShadow: isCurrent ? '0 0 0 5px rgba(212, 175, 55, 0.25)' : 'none'
                    }}
                  >
                    {isPassed ? '✓' : idx + 1}
                  </div>
                  <div style={{ flexGrow: 1, paddingTop: '3px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.92rem', fontWeight: isCurrent ? 'bold' : '600', color: isCurrent ? 'var(--luxury-black)' : (isPassed ? '#333' : '#999') }}>
                        {step}
                      </span>
                      {isCurrent && (
                        <span style={{ background: '#fef3c7', color: '#92400e', fontSize: '0.68rem', fontWeight: 'bold', padding: '2px 8px', borderRadius: '10px' }}>
                          CURRENT STATUS
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#777', margin: '2px 0 0' }}>
                      {step === 'Placed' && 'Order received and logged in QueS.M boutique systems.'}
                      {step === 'Confirmed' && 'Artisans verified materials and initiated handcrafting.'}
                      {step === 'Packed' && 'Handcrafted items gift-wrapped and securely sealed.'}
                      {step === 'Shipped' && 'Handed over to express courier dispatch partner.'}
                      {step === 'Delivered' && 'Successfully delivered to customer address.'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Courier Info if shipped */}
          {order.trackingNumber && (
            <div style={{ background: '#f5f9f6', padding: '16px 20px', borderRadius: 'var(--radius-md)', border: '1px solid #c8e6c9', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <Truck size={24} color="#2e7d32" />
              <div>
                <h4 style={{ fontSize: '0.95rem', color: '#1b5e20', marginBottom: '2px' }}>
                  Courier Tracking: {order.trackingCourier || 'Standard Speed Post / Delhivery'}
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#333' }}>
                  AWB Number: <strong>{order.trackingNumber}</strong>
                </p>
              </div>
            </div>
          )}

          {/* Timeline Events */}
          <div style={{ marginTop: '30px' }}>
            <h4 style={{ fontSize: '1.05rem', marginBottom: '16px', color: 'var(--luxury-black)' }}>Status History</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {order.timeline?.map((event, i) => (
                <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <Clock size={16} color="var(--primary-gold)" style={{ marginTop: '3px', flexShrink: 0 }} />
                  <div>
                    <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{event.status}</span>
                    <span style={{ fontSize: '0.78rem', color: '#888', marginLeft: '10px' }}>
                      {new Date(event.timestamp).toLocaleString('en-IN')}
                    </span>
                    {event.note && <p style={{ fontSize: '0.84rem', color: '#555', margin: '2px 0 0' }}>{event.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* WhatsApp Support Help */}
          <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Need priority help with this delivery?</span>
            <a
              href={getWhatsAppLink(`Hi! I am checking on my order #${order.orderNumber}. Can you help with tracking updates?`)}
              target="_blank"
              rel="noreferrer"
              className="btn-outline"
              style={{ padding: '8px 18px', fontSize: '0.82rem' }}
            >
              <MessageCircle size={15} color="#25d366" />
              <span>Contact Dispatch on WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTrackingPage;
