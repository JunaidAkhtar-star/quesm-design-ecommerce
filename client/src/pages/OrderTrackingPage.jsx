import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Truck, Search, CheckCircle2, Package, Clock, ShieldCheck, MessageCircle } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
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
    <div className="container" style={{ padding: '40px 20px 80px', maxWidth: '800px' }}>
      <SEOMeta title="Track Your Order" />

      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <span className="gold-badge" style={{ marginBottom: '10px' }}>Real-Time Dispatch</span>
        <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>
          Track Your Handmade Order
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Enter your Order ID and the phone number provided at checkout to view real-time delivery status.
        </p>
      </div>

      {/* Tracking Form */}
      <div style={{ background: '#fff', padding: '30px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', marginBottom: '40px' }}>
        <form onSubmit={handleTrackSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '6px' }}>
              Order ID *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. QSM-20261028-1234"
              value={orderNumber}
              onChange={e => setOrderNumber(e.target.value.toUpperCase())}
              style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.95rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '6px' }}>
              Phone Number *
            </label>
            <input
              type="tel"
              required
              placeholder="10-digit mobile number"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.95rem' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ height: '48px', fontSize: '0.95rem' }}
          >
            <Search size={18} />
            <span>{loading ? 'Searching...' : 'Track Order'}</span>
          </button>
        </form>

        {errorMessage && (
          <div style={{ marginTop: '16px', padding: '12px', background: '#ffebee', color: '#c62828', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
            {errorMessage}
          </div>
        )}
      </div>

      {/* Tracking Results */}
      {order && (
        <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', padding: '32px', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '32px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
            <div>
              <span className="gold-badge" style={{ marginBottom: '6px' }}>Order Status</span>
              <h3 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-heading)' }}>#{order.orderNumber}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Recipient: <strong>{order.customerName}</strong> ({order.city}, {order.state})
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Total Amount</span>
              <h4 className="gold-text" style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{formatPrice(order.totalAmount)}</h4>
              <span style={{ fontSize: '0.78rem', color: '#666', textTransform: 'capitalize' }}>Payment: {order.paymentMethod?.toUpperCase()} ({order.paymentStatus})</span>
            </div>
          </div>

          {/* Step Progress Bar */}
          <div style={{ margin: '40px 0 50px' }}>
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
