import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle, Send, Clock, Sparkles, Navigation, ExternalLink } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import SEOMeta from '../components/SEOMeta';

const ContactPage = () => {
  const { settings, getWhatsAppLink } = useSettings();

  // Derive Google Map Embed URL
  const getMapEmbedUrl = () => {
    if (settings.googleMapsUrl) {
      const match = settings.googleMapsUrl.match(/src=["']([^"']+)["']/i);
      if (match && match[1]) return match[1];
      if (settings.googleMapsUrl.startsWith('http')) return settings.googleMapsUrl;
    }
    const query = encodeURIComponent(settings.storeAddress || 'QueS.M design Studio Khan Manzil, Odisha, India');
    return `https://maps.google.com/maps?q=${query}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  };

  const getDirectDirectionsUrl = () => {
    const query = encodeURIComponent(settings.storeAddress || 'QueS.M design Studio Khan Manzil, Odisha, India');
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Bespoke Order / Inquiry',
    message: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMessage('Thank you! Your message has been received. Our team will contact you shortly.');
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: 'Bespoke Order / Inquiry',
          message: ''
        });
      } else {
        setErrorMessage(data.message || 'Error sending message');
      }
    } catch (err) {
      setErrorMessage('Could not connect to server. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 20px 80px', maxWidth: '1080px' }}>
      <SEOMeta
        title="Contact Our Studio"
        description="Get in touch with QueS.M design for custom bridal jewelry orders, bulk inquiries, or order assistance."
      />

      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <span className="gold-badge" style={{ marginBottom: '10px' }}>
          <Sparkles size={13} />
          <span>We'd Love To Hear From You</span>
        </span>
        <h1 style={{ fontSize: '2.8rem', fontFamily: 'var(--font-heading)', marginBottom: '10px' }}>
          Get in Touch
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '540px', margin: '0 auto' }}>
          Have questions about sizing, bridal color customization, or order delivery? We are here to assist!
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '32px', alignItems: 'start' }}>
        {/* Left: Contact Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ background: '#fff', padding: '30px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-heading)', marginBottom: '20px' }}>
              Studio Contact Details
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-gold-subtle)', color: 'var(--primary-gold-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MapPin size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.92rem', marginBottom: '2px' }}>Studio Address</h4>
                  <p style={{ color: '#666', fontSize: '0.86rem', lineHeight: '1.5' }}>
                    {settings.storeAddress}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-gold-subtle)', color: 'var(--primary-gold-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Phone size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.92rem', marginBottom: '2px' }}>Phone Support</h4>
                  <p style={{ color: '#666', fontSize: '0.86rem' }}>
                    {settings.storePhone}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-gold-subtle)', color: 'var(--primary-gold-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Mail size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.92rem', marginBottom: '2px' }}>Email Inquiries</h4>
                  <p style={{ color: '#666', fontSize: '0.86rem' }}>
                    {settings.storeEmail}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-gold-subtle)', color: 'var(--primary-gold-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Clock size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.92rem', marginBottom: '2px' }}>Studio Timings</h4>
                  <p style={{ color: '#666', fontSize: '0.86rem' }}>
                    Monday – Saturday: 10:00 AM – 7:30 PM IST
                  </p>
                </div>
              </div>
            </div>

            <hr style={{ margin: '24px 0', borderColor: 'var(--border-subtle)' }} />

            {/* Direct WhatsApp Action */}
            <a
              href={getWhatsAppLink('Hello QueS.M design! I have a question about custom handmade jewelry.')}
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
              style={{ width: '100%', background: '#25d366', color: '#fff', padding: '12px' }}
            >
              <MessageCircle size={18} />
              <span>Instant Chat on WhatsApp</span>
            </a>
          </div>

          {/* Interactive Google Map Card */}
          <div
            style={{
              background: '#fff',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div
              style={{
                padding: '16px 18px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px'
              }}
            >
              <div>
                <h4 style={{ fontSize: '0.98rem', fontFamily: 'var(--font-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={16} className="gold-text" />
                  <span>Studio Location Map</span>
                </h4>
                <p style={{ fontSize: '0.78rem', color: '#777', margin: '2px 0 0' }}>
                  {settings.storeAddress || 'QueS.M design Studio Khan Manzil, Odisha, India'}
                </p>
              </div>

              <a
                href={getDirectDirectionsUrl()}
                target="_blank"
                rel="noreferrer"
                className="btn-outline"
                style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                title="Open in Google Maps / Get Directions"
              >
                <Navigation size={13} />
                <span>Get Directions</span>
                <ExternalLink size={12} />
              </a>
            </div>

            <div style={{ position: 'relative', width: '100%', height: '260px', background: '#f5f5f5' }}>
              <iframe
                title="QueS.M design Studio Location Map"
                src={getMapEmbedUrl()}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>

        {/* Right: Message Form */}
        <div style={{ background: '#fff', padding: '36px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>
            Send Us a Message
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '24px' }}>
            Fill out the form below and we will get back to you within 24 hours.
          </p>

          {successMessage && (
            <div style={{ padding: '16px', background: '#e8f5e9', color: '#2e7d32', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '0.9rem' }}>
              ✨ {successMessage}
            </div>
          )}

          {errorMessage && (
            <div style={{ padding: '16px', background: '#ffebee', color: '#c62828', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '0.9rem' }}>
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '6px' }}>
                Your Name *
              </label>
              <input
                type="text"
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Meera"
                style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.95rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '6px' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.95rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '6px' }}>
                  Phone / WhatsApp
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Mobile number"
                  style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.95rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '6px' }}>
                Subject
              </label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.95rem', background: '#fff' }}
              >
                <option value="Bespoke Order / Custom Color Request">Bespoke Order / Custom Color Request</option>
                <option value="Bulk / Bridesmaids Order">Bulk / Bridesmaids Order</option>
                <option value="Order Tracking & Delivery Status">Order Tracking & Delivery Status</option>
                <option value="General Inquiry">General Inquiry</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '6px' }}>
                Message *
              </label>
              <textarea
                required
                rows={5}
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Share your requirements or questions with us..."
                style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: '0.95rem', resize: 'vertical' }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{ width: '100%', padding: '14px', marginTop: '6px', fontSize: '0.95rem' }}
            >
              <Send size={16} />
              <span>{submitting ? 'Sending Message...' : 'Send Message'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
