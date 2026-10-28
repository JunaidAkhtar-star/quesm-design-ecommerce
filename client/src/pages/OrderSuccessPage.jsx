import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, MessageCircle, Package, ArrowRight, Truck } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import SEOMeta from '../components/SEOMeta';

const OrderSuccessPage = () => {
  const { orderNumber } = useParams();
  const { formatPrice, getWhatsAppLink } = useSettings();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/details/${orderNumber}`);
        const data = await res.json();
        if (data.success) {
          setOrder(data.order);
        }
      } catch (err) {
        console.warn('Could not load order:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderNumber]);

  return (
    <div className="container" style={{ padding: '60px 20px 100px', maxWidth: '720px' }}>
      <SEOMeta title={`Order #${orderNumber} Confirmed`} />

      <div
        style={{
          background: '#fff',
          borderRadius: 'var(--radius-xl)',
          padding: '40px 32px',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-md)',
          textAlign: 'center'
        }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'var(--primary-gold-subtle)',
            color: 'var(--primary-gold-dark)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            border: '2px solid rgba(212, 175, 55, 0.4)'
          }}
        >
          <CheckCircle2 size={44} />
        </div>

        <span className="gold-badge" style={{ marginBottom: '12px' }}>Order Confirmed</span>
        <h1 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>
          Thank You For Supporting Handmade!
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '24px' }}>
          We have received your order and our artisans are preparing your pieces with love.
        </p>

        {/* Order ID Badge */}
        <div style={{ background: '#faf9f5', border: '1px dashed var(--primary-gold)', padding: '14px 20px', borderRadius: 'var(--radius-md)', display: 'inline-block', marginBottom: '32px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Order ID:</span>{' '}
          <strong style={{ fontSize: '1.15rem', color: 'var(--luxury-black)', letterSpacing: '0.5px' }}>{orderNumber}</strong>
        </div>

        {order && (
          <div style={{ textAlign: 'left', background: '#fdfcf9', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid #ebd9b4', marginBottom: '32px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '14px', color: 'var(--luxury-black)' }}>Delivery To:</h3>
            <p style={{ margin: '0 0 4px', fontWeight: 'bold' }}>{order.customer.name}</p>
            <p style={{ margin: '0 0 4px', color: '#555', fontSize: '0.9rem' }}>{order.customer.address}, {order.customer.city}, {order.customer.state} - {order.customer.pincode}</p>
            <p style={{ margin: '0 0 14px', color: '#555', fontSize: '0.9rem' }}>Phone: {order.customer.phone}</p>

            <div style={{ borderTop: '1px dashed #d4af37', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <span>Total Amount:</span>
              <span className="gold-text">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'center' }}>
          <Link to={`/track-order?id=${orderNumber}`} className="btn-primary" style={{ padding: '12px 28px' }}>
            <Truck size={17} />
            <span>Track Order Status</span>
          </Link>

          <a
            href={getWhatsAppLink(`Hi QueS.M design! I just placed order #${orderNumber}. Can you please confirm the dispatch timeline?`)}
            target="_blank"
            rel="noreferrer"
            className="btn-outline"
            style={{ padding: '12px 24px' }}
          >
            <MessageCircle size={17} color="#25d366" />
            <span>Ask on WhatsApp</span>
          </a>

          <Link to="/shop" className="btn-dark" style={{ padding: '12px 28px' }}>
            <span>Continue Shopping</span>
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
