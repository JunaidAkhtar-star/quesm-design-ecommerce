import React, { useState } from 'react';

const ProductGallery = ({ images = [], productName = 'Product' }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });

  const activeImage = images[activeImageIndex] || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80';

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Main Image with Zoom */}
      <div
        style={{
          position: 'relative',
          aspectRatio: '1/1',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          backgroundColor: '#f7f4ed',
          border: '1px solid var(--border-color)',
          cursor: 'crosshair'
        }}
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <img
          src={activeImage}
          alt={`${productName} view ${activeImageIndex + 1}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
            transform: isZoomed ? 'scale(1.8)' : 'scale(1)',
            transition: isZoomed ? 'none' : 'transform 0.3s ease'
          }}
        />

        {isZoomed && (
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              background: 'rgba(0,0,0,0.65)',
              color: '#fff',
              fontSize: '0.72rem',
              padding: '3px 8px',
              borderRadius: 'var(--radius-xs)',
              pointerEvents: 'none'
            }}
          >
            Zoom Mode Active
          </div>
        )}
      </div>

      {/* Thumbnails Row */}
      {images.length > 1 && (
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImageIndex(idx)}
              style={{
                width: '76px',
                height: '76px',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                border: idx === activeImageIndex ? '2px solid var(--primary-gold)' : '1px solid var(--border-color)',
                padding: '2px',
                background: '#fff',
                opacity: idx === activeImageIndex ? 1 : 0.65,
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
            >
              <img
                src={img}
                alt={`${productName} thumbnail ${idx + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
