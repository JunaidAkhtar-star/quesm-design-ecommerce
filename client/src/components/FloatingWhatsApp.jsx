import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const FloatingWhatsApp = () => {
  const { getWhatsAppLink } = useSettings();
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{ position: 'fixed', bottom: '28px', right: '28px', zIndex: 90 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && (
        <div
          style={{
            position: 'absolute',
            bottom: '68px',
            right: '0',
            background: 'var(--luxury-black)',
            color: '#fff',
            padding: '8px 14px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8rem',
            whiteSpace: 'nowrap',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          💬 Need help? Chat with our team!
        </div>
      )}
      <a
        href={getWhatsAppLink('Hello QueS.M design! I need help with an order/product inquiries.')}
        target="_blank"
        rel="noreferrer"
        className="floating-whatsapp"
        aria-label="Chat on WhatsApp"
        title="Chat on WhatsApp"
      >
        <MessageCircle size={30} />
      </a>
    </div>
  );
};

export default FloatingWhatsApp;
