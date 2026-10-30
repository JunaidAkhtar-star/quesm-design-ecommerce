import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star, MessageCircle, Eye } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { useLanguage } from '../context/LanguageContext';

const ProductCard = ({ product, onQuickView }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { formatPrice, getWhatsAppLink } = useSettings();
  const { t } = useLanguage();

  const [isHovered, setIsHovered] = useState(false);
  const wishlisted = isInWishlist(product._id);

  const isOutOfStock = product.stockQuantity <= 0;
  const isLowStock = !isOutOfStock && product.stockQuantity <= 5;
  const isSale = product.discountedPrice && product.discountedPrice < product.price;
  const discountPercent = isSale
    ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
    : 0;

  const primaryImage = product.images?.[0] || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80';
  const hoverImage = product.images?.[1] || primaryImage;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) {
      window.open(getWhatsAppLink(`Hello, I'd like to be notified when "${product.name}" is back in stock.`), '_blank');
      return;
    }

    // Default variant if exists
    const defaultVariant = product.variants?.[0] ? `${product.variants[0].name}: ${product.variants[0].value}` : '';
    addToCart(product, 1, defaultVariant);
  };

  const handleQuickViewClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) onQuickView(product);
  };

  return (
    <div
      className="product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="product-thumb-container">
        {/* Badges */}
        <div className="product-badges">
          {isSale && <span className="badge-tag badge-sale">-{discountPercent}%</span>}
          {product.isBestSeller && <span className="badge-tag badge-bestseller">Best Seller</span>}
          {product.isNewArrival && !isSale && <span className="badge-tag badge-new">New</span>}
          {isLowStock && <span className="badge-tag badge-lowstock">Only {product.stockQuantity} Left</span>}
          {isOutOfStock && <span className="badge-tag" style={{ background: '#555', color: '#fff' }}>Sold Out</span>}
        </div>

        {/* Wishlist Button */}
        <button
          className={`product-wishlist-btn ${wishlisted ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={18} fill={wishlisted ? '#d32f2f' : 'none'} color={wishlisted ? '#d32f2f' : 'currentColor'} />
        </button>

        {/* Quick View Button on Hover */}
        {onQuickView && (
          <button
            className="product-quickview-btn"
            onClick={handleQuickViewClick}
            aria-label="Quick View product"
            title="Quick View"
          >
            <Eye size={15} />
            <span>Quick View</span>
          </button>
        )}

        {/* Thumbnail Image */}
        <Link to={`/product/${product.slug}`}>
          <img
            src={isHovered ? hoverImage : primaryImage}
            alt={product.name}
            className="product-thumb"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80';
            }}
          />
        </Link>
      </div>

      <div className="product-info">
        <span className="product-category-name">
          {product.category?.name || product.categorySlug?.replace(/-/g, ' ')}
        </span>

        <Link to={`/product/${product.slug}`}>
          <h3 className="product-title" title={product.name}>
            {product.name}
          </h3>
        </Link>

        {/* Star Rating */}
        <div className="product-rating">
          <Star size={14} fill="#ff9800" color="#ff9800" />
          <span>{product.rating || '5.0'}</span>
          <span className="product-rating-count">({product.numReviews || 0})</span>
        </div>

        {/* Price Row */}
        <div className="product-price-row">
          <span className="price-current">
            {formatPrice(isSale ? product.discountedPrice : product.price)}
          </span>
          {isSale && (
            <>
              <span className="price-original">{formatPrice(product.price)}</span>
              <span className="price-discount-percent">Save {discountPercent}%</span>
            </>
          )}
        </div>

        {/* Action Button */}
        {isOutOfStock ? (
          <button
            onClick={handleQuickAdd}
            className="product-card-btn"
            style={{ background: '#f5efe0', color: 'var(--primary-gold-dark)' }}
          >
            <MessageCircle size={15} />
            <span>{t('notifyOnWhatsApp')}</span>
          </button>
        ) : (
          <button onClick={handleQuickAdd} className="product-card-btn">
            <ShoppingBag size={15} />
            <span>{t('addToCart')}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
