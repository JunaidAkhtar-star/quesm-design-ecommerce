import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const LiveSearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { formatPrice } = useSettings();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setSuggestions([]);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/suggestions?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.success) {
          setSuggestions(data.suggestions || []);
        }
      } catch (err) {
        console.warn('Search suggestions error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelectProduct = (slug) => {
    onClose();
    navigate(`/product/${slug}`);
  };

  const handleSearchAll = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    onClose();
    navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 110,
        background: 'rgba(15, 15, 18, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        justifyContent: 'center',
        padding: '80px 20px 20px',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '640px',
          background: '#fff',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)',
          height: 'fit-content',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <form
          onSubmit={handleSearchAll}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color)',
            gap: '12px'
          }}
        >
          <Search size={22} className="gold-text" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search bangles, earrings, flower sets, phone charms..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              flexGrow: 1,
              border: 'none',
              outline: 'none',
              fontSize: '1.05rem',
              color: 'var(--luxury-black)'
            }}
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} style={{ background: 'none' }}>
              <X size={18} color="#888" />
            </button>
          )}
          <button type="button" onClick={onClose} style={{ background: 'none', padding: '4px' }}>
            <X size={22} />
          </button>
        </form>

        {/* Live Suggestions Results */}
        <div style={{ overflowY: 'auto', padding: '16px 20px' }}>
          {loading && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#888', fontSize: '0.9rem' }}>
              Finding handmade treasures...
            </div>
          )}

          {!loading && suggestions.length > 0 && (
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '1px' }}>
                Quick Matches
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {suggestions.map(item => (
                  <div
                    key={item._id}
                    onClick={() => handleSelectProduct(item.slug)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      transition: 'background 0.2s ease',
                      border: '1px solid transparent'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'var(--primary-gold-subtle)';
                      e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.3)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.borderColor = 'transparent';
                    }}
                  >
                    <img
                      src={item.images?.[0] || ''}
                      alt={item.name}
                      style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                    />
                    <div style={{ flexGrow: 1 }}>
                      <h4 style={{ fontSize: '0.92rem', color: 'var(--luxury-black)', marginBottom: '2px' }}>
                        {item.name}
                      </h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                        {item.categorySlug?.replace(/-/g, ' ')}
                      </span>
                    </div>
                    <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>
                      {formatPrice(item.discountedPrice || item.price)}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSearchAll}
                className="btn-outline"
                style={{ width: '100%', marginTop: '16px', fontSize: '0.88rem' }}
              >
                <span>View all results for "{query}"</span>
                <ArrowRight size={15} />
              </button>
            </div>
          )}

          {!loading && query.length >= 2 && suggestions.length === 0 && (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)' }}>
              <p>No products matching "{query}".</p>
              <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>Try searching for "silk", "bangles", "earrings", or "charms".</p>
            </div>
          )}

          {!query && (
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '1px' }}>
                Popular Searches
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['Silk Thread Bangles', 'Flower Jewellery', 'Kundan Jhumkas', 'Pearl Bracelets', 'Phone Charms', 'Resin Cases'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setQuery(tag);
                    }}
                    style={{
                      padding: '6px 14px',
                      background: 'var(--bg-alt)',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.82rem',
                      color: 'var(--text-main)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <Sparkles size={12} color="var(--primary-gold)" />
                    <span>{tag}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveSearchModal;
