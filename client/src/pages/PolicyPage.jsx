import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import SEOMeta from '../components/SEOMeta';

const PolicyPage = () => {
  const { pathname } = useLocation();

  let title = 'Policy';
  let content = null;

  if (pathname.includes('shipping')) {
    title = 'Shipping & Delivery Policy';
    content = (
      <div style={{ lineHeight: '1.8', color: '#444', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <p>At <strong>QueS.M design</strong>, every accessory is handmade with meticulous attention to detail. We ensure your treasures are safely nestled in protective, premium packaging.</p>
        <h3 style={{ color: 'var(--luxury-black)', marginTop: '12px' }}>1. Order Processing Time</h3>
        <p>Ready-to-ship products are dispatched within 24–48 hours of order confirmation. Custom bespoke pieces (such as personalized bridal flower sets or custom silk thread bangle sizes) require 2–4 business days for artisanal crafting prior to dispatch.</p>
        <h3 style={{ color: 'var(--luxury-black)', marginTop: '12px' }}>2. Shipping Charges & Free Delivery</h3>
        <p>• Standard Express Delivery: ₹70 across India.<br/>• <strong>FREE Express Shipping</strong> on all domestic orders above ₹799.</p>
        <h3 style={{ color: 'var(--luxury-black)', marginTop: '12px' }}>3. Delivery Timelines</h3>
        <p>• Metro Cities: 3–5 business days.<br/>• Rest of India: 4–7 business days.<br/>Real-time tracking links via SMS and email are provided the moment your package is handed over to our verified courier partners.</p>
      </div>
    );
  } else if (pathname.includes('return')) {
    title = 'Return & Exchange Policy';
    content = (
      <div style={{ lineHeight: '1.8', color: '#444', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <p>We take deep pride in the heirloom quality of our handmade collections. Because our accessories are intimate wearable items and custom-crafted, please review our exchange guidelines below.</p>
        <h3 style={{ color: 'var(--luxury-black)', marginTop: '12px' }}>1. Damaged or Incorrect Items</h3>
        <p>If your package arrives damaged in transit or if you received an incorrect item, please notify us within 48 hours of delivery with clear unboxing photographs/video via WhatsApp at +91 98765 43210 or email at contactquesmdesign@gmail.com. We will send a complimentary replacement immediately.</p>
        <h3 style={{ color: 'var(--luxury-black)', marginTop: '12px' }}>2. Size Exchanges for Bangles</h3>
        <p>If you mistakenly ordered the incorrect bangle size, we gladly assist with an exchange. Customer bears return transit shipping.</p>
        <h3 style={{ color: 'var(--luxury-black)', marginTop: '12px' }}>3. Non-Returnable Items</h3>
        <p>Custom-monogrammed items, personalized phone covers, and opened hair accessories are not returnable for hygiene reasons.</p>
      </div>
    );
  } else if (pathname.includes('privacy')) {
    title = 'Privacy Policy';
    content = (
      <div style={{ lineHeight: '1.8', color: '#444', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <p>QueS.M design respects your personal privacy. We only collect essential customer data (name, shipping address, contact number, and email) strictly for fulfilling your handmade orders and dispatch notifications.</p>
        <h3 style={{ color: 'var(--luxury-black)', marginTop: '12px' }}>1. Payment Security</h3>
        <p>We do not store your credit/debit card numbers or UPI MPINs. All online payments are securely processed through RBI-authorized payment gateways (Razorpay) utilizing 256-bit SSL encryption.</p>
        <h3 style={{ color: 'var(--luxury-black)', marginTop: '12px' }}>2. Data Protection</h3>
        <p>We never sell, rent, or trade customer contact information to third-party marketing companies.</p>
      </div>
    );
  } else {
    title = 'Terms & Conditions';
    content = (
      <div style={{ lineHeight: '1.8', color: '#444', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <p>By accessing or purchasing from QueS.M design, you agree to our terms of service.</p>
        <h3 style={{ color: 'var(--luxury-black)', marginTop: '12px' }}>1. Artisanal Variations</h3>
        <p>Because each piece is handmade by human hands, slight variations in silk thread grain, stone alignment, or natural pressed petal colors are natural and celebrate authentic craftsmanship.</p>
        <h3 style={{ color: 'var(--luxury-black)', marginTop: '12px' }}>2. Pricing & Offers</h3>
        <p>All prices are listed in Indian Rupees (₹). Promotional coupon codes must be entered during guest checkout prior to order submission.</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '50px 20px 80px', maxWidth: '820px' }}>
      <SEOMeta title={title} />
      <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-heading)', marginBottom: '30px' }}>
        {title}
      </h1>
      <div style={{ background: '#fff', padding: '36px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
        {content}
      </div>
    </div>
  );
};

export default PolicyPage;
