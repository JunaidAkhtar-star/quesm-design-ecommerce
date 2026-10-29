import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { useLanguage } from '../context/LanguageContext';
import SEOMeta from '../components/SEOMeta';

const WishlistPage = () => {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { formatPrice } = useSettings();
  const { t } = useLanguage();

  if (wishlist.length === 0) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <SEOMeta title="Your Wishlist" />
        <Heart size={64} strokeWidth={1} style={{ margin: '0 auto 20px', opacity: 0.3 }} />
        <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', marginBottom: '12px' }}>
          Your Wishlist is Empty
        </h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 24px' }}>
          Save your favorite handcrafted items here to review and purchase whenever you're ready!
        </p>
        <Link to="/shop" className="btn-primary" style={{ padding: '14px 34px' }}>
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 20px 80px' }}>
      <SEOMeta title="Your Wishlist" />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', fontFamily: 'var(--font-heading)' }}>
            {t('wishlist')} ({wishlist.length})
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Your personally saved handmade pieces
          </p>
        </div>

        <button
          onClick={clearWishlist}
          style={{ background: 'none', color: '#999', fontSize: '0.85rem', cursor: 'pointer' }}
        >
          Clear All
        </button>
      </div>

      <div
        className="customer-wishlist-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '24px'
        }}
      >
        {wishlist.map(item => (
          <div
            key={item._id}
            style={{
              background: '#fff',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{ position: 'relative', aspectRatio: '1/1', background: '#f5f0e6' }}>
              <img
                src={item.image}
                alt={item.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <button
                onClick={() => removeFromWishlist(item._id)}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#d32f2f',
                  border: 'none'
                }}
                aria-label="Remove from wishlist"
              >
                <Trash2 size={15} />
              </button>
            </div>

            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <Link to={`/product/${item.slug}`} style={{ fontWeight: '600', fontSize: '1rem', color: 'var(--luxury-black)', marginBottom: '8px' }}>
                {item.name}
              </Link>

              <div style={{ marginTop: 'auto', marginBottom: '14px', fontWeight: 'bold', fontSize: '1.1rem' }}>
                {formatPrice(item.discountedPrice || item.price)}
              </div>

              <button
                onClick={() => {
                  addToCart(item, 1, '');
                  removeFromWishlist(item._id);
                }}
                className="btn-primary"
                style={{ width: '100%', padding: '10px', fontSize: '0.88rem' }}
              >
                <ShoppingBag size={15} />
                <span>Move to Bag</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;
