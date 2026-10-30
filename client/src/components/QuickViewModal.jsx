import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Heart, ShoppingBag, Star, ShieldCheck, Truck, MessageCircle, ArrowRight, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useSettings } from '../context/SettingsContext';

const QuickViewModal = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { formatPrice, getWhatsAppLink } = useSettings();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedImage(0);
      setQuantity(1);
      setAddedNotice(false);
      if (product.variants && product.variants.length > 0) {
        setSelectedVariant(product.variants[0]);
      } else {
        setSelectedVariant(null);
      }
    }
  }, [product]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const wishlisted = isInWishlist(product._id);
  const isSale = product.discountedPrice && product.discountedPrice < product.price;
  const discountPercent = isSale
    ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
    : 0;

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80'];

  const currentPrice = (isSale ? product.discountedPrice : product.price) + (selectedVariant?.priceAdjustment || 0);

  const handleAdd = () => {
    const variantStr = selectedVariant ? `${selectedVariant.name}: ${selectedVariant.value}` : '';
    addToCart(product, quantity, variantStr);
    setAddedNotice(true);
    setTimeout(() => {
      setAddedNotice(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="quickview-backdrop" onClick={onClose}>
      <div className="quickview-card" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="quickview-close-btn" onClick={onClose} aria-label="Close Preview">
          <X size={20} />
        </button>

        <div className="quickview-grid">
          {/* Left: Gallery */}
          <div className="quickview-gallery">
            <div className="quickview-main-img-box">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="quickview-main-img"
              />
              {isSale && <span className="quickview-sale-badge">-{discountPercent}% OFF</span>}
            </div>

            {images.length > 1 && (
              <div className="quickview-thumbs-row">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`quickview-thumb-btn ${i === selectedImage ? 'active' : ''}`}
                  >
                    <img src={img} alt={`Thumb ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details & Buying */}
          <div className="quickview-details">
            <div className="quickview-category-tag">
              {product.category?.name || product.categorySlug?.replace(/-/g, ' ')}
            </div>

            <h2 className="quickview-title">{product.name}</h2>

            {/* Rating & Stock */}
            <div className="quickview-meta-row">
              <div className="quickview-rating">
                <Star size={14} fill="#ff9800" color="#ff9800" />
                <span>{product.rating || '5.0'}</span>
                <span className="quickview-reviews-count">({product.numReviews || 0} reviews)</span>
              </div>
              <span className="quickview-stock-tag">
                {product.stockQuantity > 0 ? '✓ In Stock • Ready to Dispatch' : 'Sold Out'}
              </span>
            </div>

            {/* Price Box */}
            <div className="quickview-price-box">
              <span className="quickview-price-current">{formatPrice(currentPrice)}</span>
              {isSale && (
                <>
                  <span className="quickview-price-original">{formatPrice(product.price)}</span>
                  <span className="quickview-price-save">Save {discountPercent}%</span>
                </>
              )}
            </div>

            <p className="quickview-description">
              {product.shortDescription || product.description?.slice(0, 160) + '...'}
            </p>

            {/* Variant Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="quickview-variant-section">
                <label className="quickview-variant-label">
                  Select {product.variants[0]?.name || 'Variant'}:
                </label>
                <div className="quickview-variants-row">
                  {product.variants.map((v, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedVariant(v)}
                      className={`quickview-variant-btn ${selectedVariant?.value === v.value ? 'active' : ''}`}
                    >
                      {v.value}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="quickview-action-row">
              <div className="qty-pill">
                <button
                  className="qty-btn"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                >
                  -
                </button>
                <span className="qty-val">{quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => setQuantity(q => q + 1)}
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAdd}
                disabled={product.stockQuantity <= 0}
                className="btn-primary quickview-add-btn"
              >
                {addedNotice ? (
                  <>
                    <Check size={18} />
                    <span>Added to Bag!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={18} />
                    <span>Add to Bag • {formatPrice(currentPrice * quantity)}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => toggleWishlist(product)}
                className={`quickview-wishlist-btn ${wishlisted ? 'active' : ''}`}
                title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Heart size={18} fill={wishlisted ? '#d32f2f' : 'none'} color={wishlisted ? '#d32f2f' : 'currentColor'} />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="quickview-trust-grid">
              <div className="quickview-trust-item">
                <Truck size={14} className="gold-text" />
                <span>Free Express Shipping above ₹799</span>
              </div>
              <div className="quickview-trust-item">
                <ShieldCheck size={14} className="gold-text" />
                <span>100% Handcrafted Artisan Guarantee</span>
              </div>
            </div>

            {/* Direct Links */}
            <div className="quickview-footer-links">
              <Link
                to={`/product/${product.slug}`}
                onClick={onClose}
                className="quickview-full-link"
              >
                <span>View Full Product Details & Materials</span>
                <ArrowRight size={14} />
              </Link>

              <a
                href={getWhatsAppLink(`Hi QueS.M design! I'm interested in "${product.name}". Could you share more details on bridal sizing/colors?`)}
                target="_blank"
                rel="noreferrer"
                className="quickview-wa-link"
              >
                <MessageCircle size={14} />
                <span>Ask on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;

