import React from 'react';
import { X, Printer } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const InvoiceModal = ({ isOpen, onClose, order }) => {
  const { formatPrice, settings } = useSettings();

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="invoice-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 350,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px'
      }}
      onClick={onClose}
    >
      <div
        className="invoice-modal-card"
        style={{
          width: '100%',
          maxWidth: '740px',
          background: '#ffffff',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Controls Bar (Hidden during print) */}
        <div
          className="no-print"
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#fafafa',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          <span style={{ fontWeight: '600', fontSize: '0.92rem' }}>Invoice / Packing Slip Preview</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handlePrint}
              className="btn-primary"
              style={{ padding: '7px 16px', fontSize: '0.82rem' }}
            >
              <Printer size={15} />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', padding: '6px', cursor: 'pointer', borderRadius: '4px' }}
              aria-label="Close invoice"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Printable Invoice Area */}
        <div
          id="printable-invoice"
          className="printable-invoice-content"
          style={{
            padding: '30px',
            overflowY: 'auto',
            fontFamily: 'Helvetica, Arial, sans-serif',
            color: '#222'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', borderBottom: '2px solid #d4af37', paddingBottom: '18px', marginBottom: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src="/logo.png" alt="QueS.M design" style={{ width: '54px', height: '54px', borderRadius: '50%' }} />
              <div>
                <h1 style={{ fontSize: '1.45rem', margin: 0, color: '#121212', fontFamily: 'Georgia, serif' }}>QueS.M design</h1>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#b89742', fontStyle: 'italic' }}>Handmade Accessories & Bridal Keepsakes</p>
                <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: '#666' }}>
                  {settings?.storeEmail || 'contactquesmdesign@gmail.com'} | {settings?.storePhone || '+917978201960'}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#888' }}>
                  {settings?.storeAddress || 'QueS.M design Studio Khan Manzil, Odisha, India'}
                </p>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <h2 style={{ fontSize: '1.15rem', margin: '0 0 2px', color: '#aa820a' }}>TAX INVOICE</h2>
              <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 'bold' }}>#{order.orderNumber}</p>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#666' }}>
                Date: {new Date(order.createdAt).toLocaleDateString('en-IN')}
              </p>
            </div>
          </div>

          {/* Customer & Shipping Details */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px', fontSize: '0.86rem' }}>
            <div style={{ background: '#fdfcf9', padding: '14px', borderRadius: '8px', border: '1px solid #ebd9b4' }}>
              <h4 style={{ margin: '0 0 8px', color: '#aa820a', fontSize: '0.85rem', textTransform: 'uppercase' }}>Ship To:</h4>
              <p style={{ margin: '0 0 3px', fontWeight: 'bold' }}>{order.customer.name}</p>
              <p style={{ margin: '0 0 3px' }}>{order.customer.address}</p>
              <p style={{ margin: '0 0 3px' }}>{order.customer.city}, {order.customer.state} - {order.customer.pincode}</p>
              <p style={{ margin: '4px 0 0', color: '#444' }}>Phone: {order.customer.phone}</p>
              <p style={{ margin: '2px 0 0', color: '#444' }}>Email: {order.customer.email}</p>
            </div>

            <div style={{ background: '#fdfcf9', padding: '14px', borderRadius: '8px', border: '1px solid #ebd9b4' }}>
              <h4 style={{ margin: '0 0 8px', color: '#aa820a', fontSize: '0.85rem', textTransform: 'uppercase' }}>Order Information:</h4>
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
          <div style={{ overflowX: 'auto', marginBottom: '22px' }}>
            <table style={{ width: '100%', minWidth: '460px', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ background: '#f5f0e6', borderBottom: '2px solid #d4af37', textAlign: 'left' }}>
                  <th style={{ padding: '8px 10px' }}>#</th>
                  <th style={{ padding: '8px 10px' }}>Item Description</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center' }}>Qty</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Unit Price</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px' }}>{index + 1}</td>
                    <td style={{ padding: '10px' }}>
                      <strong>{item.name}</strong>
                      {item.variant && <div style={{ fontSize: '0.76rem', color: '#666' }}>Variant: {item.variant}</div>}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ padding: '10px', textAlign: 'right' }}>{formatPrice(item.price)}</td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>{formatPrice(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
            <div style={{ width: '100%', maxWidth: '280px', fontSize: '0.86rem' }}>
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
                  padding: '8px 0',
                  marginTop: '6px',
                  borderTop: '2px solid #121212',
                  fontSize: '1.05rem',
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
          <div style={{ borderTop: '1px solid #eee', paddingTop: '16px', textAlign: 'center', fontSize: '0.78rem', color: '#777' }}>
            <p style={{ margin: '0 0 4px', fontWeight: 'bold', color: '#aa820a' }}>
              Thank you for supporting authentic handmade craftsmanship!
            </p>
            <p style={{ margin: 0 }}>
              For support or inquiries, please WhatsApp {settings?.whatsappNumber || '917978201960'} or email {settings?.storeEmail || 'contactquesmdesign@gmail.com'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
