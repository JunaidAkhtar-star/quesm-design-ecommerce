import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, Search, Calendar, ChevronRight, MessageCircle, ExternalLink, ShoppingBag, ArrowRight } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useLanguage } from '../context/LanguageContext';
import SEOMeta from '../components/SEOMeta';

const MyOrdersPage = () => {
  const { formatPrice, getWhatsAppLink } = useSettings();
  const { t, language } = useLanguage();

  const [identifier, setIdentifier] = useState(() => {
    return localStorage.getItem('quesm_cust_phone') || '';
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Automatically fetch orders on load if order IDs or phone are stored in localStorage
  useEffect(() => {
    const autoFetchOrders = async () => {
      try {
        const storedOrderNumbers = JSON.parse(localStorage.getItem('quesm_placed_orders') || '[]');
        const storedPhone = localStorage.getItem('quesm_cust_phone');

        if (storedOrderNumbers.length > 0) {
          setLoading(true);
          const res = await fetch('/api/orders/my-orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderNumbers: storedOrderNumbers })
          });
          const data = await res.json();
          if (data.success && data.orders?.length > 0) {
            setOrders(data.orders);
            setHasSearched(true);
          }
        } else if (storedPhone) {
          fetchByIdentifier(storedPhone);
        }
      } catch (err) {
        console.warn('Auto fetch orders error:', err);
      } finally {
        setLoading(false);
      }
    };

    autoFetchOrders();
  }, []);

  const fetchByIdentifier = async (idVal) => {
    const val = (idVal || identifier).trim();
    if (!val) {
      setErrorMessage('Please enter your phone number or email.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/orders/my-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: val })
      });
      const data = await res.json();
      setHasSearched(true);

      if (data.success && data.orders) {
        setOrders(data.orders);
        if (!data.orders.length) {
          setErrorMessage('No orders found with this phone number or email.');
        } else {
          // Save identifier for future visits
          localStorage.setItem('quesm_cust_phone', val);
        }
      } else {
        setErrorMessage(data.message || 'Could not find any orders.');
      }
    } catch (err) {
      setErrorMessage('Failed to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchByIdentifier(identifier);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return { bg: '#e8f5e9', text: '#2e7d32' };
      case 'Shipped':
        return { bg: '#e3f2fd', text: '#1565c0' };
      case 'Packed':
        return { bg: '#ede7f6', text: '#512da8' };
      case 'Confirmed':
        return { bg: '#fff8e1', text: '#f57f17' };
      case 'Cancelled':
      case 'Returned':
        return { bg: '#ffebee', text: '#c62828' };
      default:
        return { bg: '#fff3e0', text: '#e65100' };
    }
  };

  return (
    <div className="container" style={{ padding: '40px 20px 80px', maxWidth: '880px' }}>
      <SEOMeta
        title="My Orders"
        description="View your order history, delivery progression, and order summaries at QueS.M design."
      />

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <span className="gold-badge" style={{ marginBottom: '10px' }}>
          Customer Purchase History
        </span>
        <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>
          {language === 'hi' ? 'मेरे ऑर्डर्स' : 'My Orders'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '540px', margin: '0 auto' }}>
          View, track, and manage all your handcrafted accessory orders in one place.
        </p>
      </div>

      {/* Search / Lookup Box */}
      <div
        style={{
          background: '#fff',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '32px'
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flexGrow: 1, minWidth: '240px' }}>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter your Phone Number or Email"
              style={{
                width: '100%',
                padding: '12px 14px 12px 40px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                fontSize: '0.95rem'
              }}
            />
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ padding: '12px 28px', fontSize: '0.92rem', whiteSpace: 'nowrap' }}
          >
            {loading ? 'Searching...' : 'Find My Orders'}
          </button>
        </form>

        {errorMessage && (
          <p style={{ color: '#d32f2f', fontSize: '0.85rem', marginTop: '12px', marginBottom: 0 }}>
            {errorMessage}
          </p>
        )}
      </div>

      {/* Orders List */}
      {orders.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map((o) => {
            const statusStyle = getStatusColor(o.orderStatus);
            const dateStr = new Date(o.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            });

            return (
              <div
                key={o._id}
                style={{
                  background: '#fff',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-sm)',
                  overflow: 'hidden',
                  transition: 'box-shadow 0.2s ease'
                }}
              >
                {/* Order Card Header */}
                <div
                  style={{
                    padding: '16px 20px',
                    background: 'var(--bg-alt)',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1rem', color: 'var(--luxury-black)' }}>
                      #{o.orderNumber}
                    </span>
                    <span style={{ fontSize: '0.82rem', color: '#666', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={13} />
                      {dateStr}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        background: statusStyle.bg,
                        color: statusStyle.text,
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '0.78rem',
                        fontWeight: 'bold',
                        letterSpacing: '0.5px'
                      }}
                    >
                      {o.orderStatus}
                    </span>
                    <span style={{ fontWeight: 'bold', color: 'var(--luxury-black)', fontSize: '1.05rem' }}>
                      {formatPrice(o.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Items Summary */}
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                    {o.items?.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&q=80'}
                          alt={item.name}
                          style={{ width: '50px', height: '50px', borderRadius: 'var(--radius-sm)', objectFit: 'cover', border: '1px solid #eee' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&q=80';
                          }}
                        />
                        <div style={{ flexGrow: 1 }}>
                          <h4 style={{ fontSize: '0.92rem', marginBottom: '2px', color: 'var(--luxury-black)' }}>
                            {item.name}
                          </h4>
                          <span style={{ fontSize: '0.8rem', color: '#777' }}>
                            Qty: {item.quantity} {item.variant ? `• ${item.variant.name}: ${item.variant.value}` : ''}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Tracking info if dispatched */}
                  {o.trackingNumber && (
                    <div style={{ background: '#f5f7fa', padding: '10px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', marginBottom: '16px' }}>
                      <strong>Tracking Number:</strong> {o.trackingNumber} ({o.trackingCourier || 'Express Delivery'})
                    </div>
                  )}

                  {/* Actions Row */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px',
                      paddingTop: '16px',
                      borderTop: '1px solid #f0f0f0'
                    }}
                  >
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                      Payment: <strong>{o.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online / UPI'}</strong> ({o.paymentStatus})
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <Link
                        to={`/track-order?id=${o.orderNumber}`}
                        className="btn-primary"
                        style={{ padding: '8px 16px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Truck size={14} />
                        <span>Track Live Progress</span>
                      </Link>

                      <Link
                        to={`/order-success/${o.orderNumber}`}
                        className="btn-outline"
                        style={{ padding: '8px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <ExternalLink size={14} />
                        <span>Invoice & Slip</span>
                      </Link>

                      <a
                        href={getWhatsAppLink(`Hi QueS.M design! I have a question regarding my order #${o.orderNumber}.`)}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-outline"
                        style={{ padding: '8px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px', color: '#25D366' }}
                      >
                        <MessageCircle size={14} />
                        <span>WhatsApp Help</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : hasSearched && !loading ? (
        <div
          style={{
            background: '#fff',
            borderRadius: 'var(--radius-xl)',
            padding: '60px 24px',
            textAlign: 'center',
            border: '1px solid var(--border-color)'
          }}
        >
          <Package size={50} style={{ color: '#bbb', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>
            No Orders Found
          </h3>
          <p style={{ color: '#666', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 24px' }}>
            We could not find any orders placed with "{identifier}". Please double-check your phone number or email.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link to="/shop" className="btn-primary" style={{ padding: '12px 24px' }}>
              <span>Browse Catalog</span>
              <ArrowRight size={16} />
            </Link>
            <Link to="/track-order" className="btn-outline" style={{ padding: '12px 24px' }}>
              <span>Track Single Order ID</span>
            </Link>
          </div>
        </div>
      ) : (
        <div
          style={{
            background: '#fff',
            borderRadius: 'var(--radius-xl)',
            padding: '50px 24px',
            textAlign: 'center',
            border: '1px solid var(--border-color)'
          }}
        >
          <ShoppingBag size={48} style={{ color: 'var(--primary-gold)', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>
            Look Up Your Order History
          </h3>
          <p style={{ color: '#666', fontSize: '0.9rem', maxWidth: '460px', margin: '0 auto 20px' }}>
            Enter the mobile number or email you provided during checkout to view all your past and active orders.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link to="/track-order" className="btn-outline" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
              <Truck size={15} />
              <span>Have an Order ID? Track here</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;

