import React from 'react';
import { X, Printer } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const InvoiceModal = ({ isOpen, onClose, order }) => {
  const { formatPrice } = useSettings();

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 130,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '720px',
          background: '#ffffff',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Controls Bar (Hidden during print) */}
        <div
          className="no-print"
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#fafafa'
          }}
        >
          <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>Invoice / Packing Slip Preview</span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handlePrint}
              className="btn-primary"
              style={{ padding: '8px 18px', fontSize: '0.85rem' }}
            >
              <Printer size={16} />
              <span>Print Invoice</span>
            </button>
            <button onClick={onClose} style={{ background: 'none', padding: '6px' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Invoice Area */}
        <div
          id="printable-invoice"
          style={{
            padding: '40px',
            overflowY: 'auto',
            fontFamily: 'Helvetica, Arial, sans-serif',
            color: '#222'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #d4af37', paddingBottom: '20px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <img src="/logo.png" alt="QueS.M design" style={{ width: '60px', height: '60px', borderRadius: '50%' }} />
              <div>
                <h1 style={{ fontSize: '1.6rem', margin: 0, color: '#121212', fontFamily: 'Georgia, serif' }}>QueS.M design</h1>
                <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#b89742', fontStyle: 'italic' }}>Handmade Accessories & Bridal Keepsakes</p>
                <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#666' }}>contactquesmdesign@gmail.com | +91 98765 43210</p>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <h2 style={{ fontSize: '1.2rem', margin: '0 0 4px', color: '#aa820a' }}>TAX INVOICE</h2>
              <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 'bold' }}>#{order.orderNumber}</p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>
                Date: {new Date(order.createdAt).toLocaleDateString('en-IN')}
              </p>
            </div>
          </div>

          {/* Customer & Shipping Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '28px', fontSize: '0.88rem' }}>
            <div style={{ background: '#fdfcf9', padding: '16px', borderRadius: '8px', border: '1px solid #ebd9b4' }}>
              <h4 style={{ margin: '0 0 8px', color: '#aa820a', fontSize: '0.9rem', textTransform: 'uppercase' }}>Ship To:</h4>
              <p style={{ margin: '0 0 3px', fontWeight: 'bold' }}>{order.customer.name}</p>
              <p style={{ margin: '0 0 3px' }}>{order.customer.address}</p>
              <p style={{ margin: '0 0 3px' }}>{order.customer.city}, {order.customer.state} - {order.customer.pincode}</p>
              <p style={{ margin: '4px 0 0', color: '#444' }}>Phone: {order.customer.phone}</p>
              <p style={{ margin: '2px 0 0', color: '#444' }}>Email: {order.customer.email}</p>
            </div>

            <div style={{ background: '#fdfcf9', padding: '16px', borderRadius: '8px', border: '1px solid #ebd9b4' }}>
              <h4 style={{ margin: '0 0 8px', color: '#aa820a', fontSize: '0.9rem', textTransform: 'uppercase' }}>Order Information:</h4>
              <p style={{ margin: '0 0 4px' }}><strong>Payment Method:</strong> {order.paymentMethod?.toUpperCase()}</p>
              <p style={{ margin: '0 0 4px' }}><strong>Payment Status:</strong> <span style={{ textTransform: 'capitalize', color: order.paymentStatus === 'paid' ? '#2e7d32' : '#e65100', fontWeight: 'bold' }}>{order.paymentStatus}</span></p>
              <p style={{ margin: '0 0 4px' }}><strong>Order Status:</strong> {order.orderStatus}</p>
              {order.trackingNumber && (
                <p style={{ margin: '0 0 4px' }}><strong>Tracking #:</strong> {order.trackingCourier} {order.trackingNumber}</p>
              )}
              {order.giftWrap && (
                <div style={{ marginTop: '8px', padding: '8px', background: '#fff', borderRadius: '6px', border: '1px dashed #d4af37', fontSize: '0.8rem' }}>
                  <strong>🎁 Gift Wrap Requested!</strong>
                  {order.giftMessage && <p style={{ fontStyle: 'italic', margin: '4px 0 0' }}>"{order.giftMessage}"</p>}
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#f5f0e6', borderBottom: '2px solid #d4af37', textAlign: 'left' }}>
                <th style={{ padding: '10px 12px' }}>#</th>
                <th style={{ padding: '10px 12px' }}>Item Description</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Qty</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Unit Price</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{index + 1}</td>
                  <td style={{ padding: '12px' }}>
                    <strong>{item.name}</strong>
                    {item.variant && <div style={{ fontSize: '0.78rem', color: '#666' }}>Variant: {item.variant}</div>}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>{formatPrice(item.price)}</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>{formatPrice(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals Summary */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '30px' }}>
            <div style={{ width: '280px', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span>Subtotal:</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span>Shipping Fee:</span>
                <span>{order.shippingFee === 0 ? 'FREE' : formatPrice(order.shippingFee)}</span>
              </div>
              {order.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#2e7d32' }}>
                  <span>Discount ({order.couponApplied?.code || 'Coupon'}):</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              {order.giftWrap && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span>Gift Wrapping:</span>
                  <span>{formatPrice(order.giftWrapFee || 49)}</span>
                </div>
              )}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  marginTop: '8px',
                  borderTop: '2px solid #121212',
                  fontSize: '1.15rem',
                  fontWeight: 'bold',
                  color: '#121212'
                }}
              >
                <span>Grand Total:</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Footer Thank You */}
          <div style={{ borderTop: '1px solid #eee', paddingTop: '20px', textAlign: 'center', fontSize: '0.8rem', color: '#777' }}>
            <p style={{ margin: '0 0 4px', fontWeight: 'bold', color: '#aa820a' }}>
              Thank you for supporting authentic handmade craftsmanship!
            </p>
            <p style={{ margin: 0 }}>
              For support or inquiries, please WhatsApp +91 98765 43210 or email contactquesmdesign@gmail.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
