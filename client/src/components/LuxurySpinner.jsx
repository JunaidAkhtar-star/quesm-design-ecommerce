import React, { useState, useEffect } from 'react';
import { Sparkles, WifiOff } from 'lucide-react';

/**
 * Luxury Rotating Spinner Component
 * Gracefully rotates while data is fetching or when network is slow.
 */
const LuxurySpinner = ({
  size = 'md',
  message = 'Loading Handcrafted Treasures...',
  submessage = '',
  fullScreen = false,
  showSlowNotice = true,
  inline = false,
  className = ''
}) => {
  const [isSlowNoticeVisible, setIsSlowNoticeVisible] = useState(false);

  useEffect(() => {
    let timer;
    if (showSlowNotice) {
      timer = setTimeout(() => {
        setIsSlowNoticeVisible(true);
      }, 2400); // Trigger slow notice after 2.4s
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showSlowNotice]);

  const sizeStyles = {
    sm: { container: 30, outer: 28, inner: 18, icon: 11, font: '0.8rem' },
    md: { container: 64, outer: 60, inner: 42, icon: 18, font: '0.95rem' },
    lg: { container: 92, outer: 86, inner: 60, icon: 26, font: '1.05rem' },
    xl: { container: 120, outer: 112, inner: 80, icon: 34, font: '1.2rem' }
  }[size] || { container: 64, outer: 60, inner: 42, icon: 18, font: '0.95rem' };

  const spinnerGraphic = (
    <div
      className="luxury-spinner-graphic"
      style={{
        width: `${sizeStyles.container}px`,
        height: `${sizeStyles.container}px`,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: inline ? '0 8px 0 0' : '0 auto 16px'
      }}
    >
      {/* Outer Rotating Golden Ring */}
      <div
        className="luxury-spinner-ring-outer"
        style={{
          width: `${sizeStyles.outer}px`,
          height: `${sizeStyles.outer}px`
        }}
      />

      {/* Inner Counter-Rotating Ring */}
      <div
        className="luxury-spinner-ring-inner"
        style={{
          width: `${sizeStyles.inner}px`,
          height: `${sizeStyles.inner}px`
        }}
      />

      {/* Center Sparkling Star */}
      <div className="luxury-spinner-center-sparkle">
        <Sparkles size={sizeStyles.icon} />
      </div>
    </div>
  );

  if (inline) {
    return (
      <span className={`luxury-spinner-inline ${className}`} style={{ display: 'inline-flex', alignItems: 'center' }}>
        {spinnerGraphic}
        {message && <span style={{ fontSize: sizeStyles.font }}>{message}</span>}
      </span>
    );
  }

  const content = (
    <div className={`luxury-spinner-box ${className}`} style={{ textAlign: 'center', padding: fullScreen ? '0 20px' : '30px 20px' }}>
      {spinnerGraphic}

      {message && (
        <h4
          className="luxury-spinner-title"
          style={{
            fontFamily: 'var(--font-heading, "Playfair Display", Georgia, serif)',
            fontSize: sizeStyles.font,
            color: 'var(--luxury-black, #141414)',
            margin: '0 0 6px',
            letterSpacing: '0.3px'
          }}
        >
          {message}
        </h4>
      )}

      {submessage && (
        <p style={{ color: 'var(--text-muted, #777)', fontSize: '0.85rem', margin: '0 0 10px', maxWidth: '380px' }}>
          {submessage}
        </p>
      )}

      {/* Automatic slow network gentle notification */}
      {isSlowNoticeVisible && (
        <div className="luxury-slow-network-notice">
          <div className="slow-notice-dot" />
          <span>Slow network detected — connecting to QueS.M Studio cloud...</span>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="luxury-spinner-fullscreen-backdrop">
        <div className="luxury-spinner-fullscreen-card">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default LuxurySpinner;

