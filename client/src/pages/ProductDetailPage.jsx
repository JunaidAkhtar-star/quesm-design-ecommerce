import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Share2, Check, ShieldCheck, Truck, Sparkles, MessageCircle, ArrowRight } from 'lucide-react';
import ProductGallery from '../components/ProductGallery';
import ReviewModal from '../components/ReviewModal';
import RecentlyViewed, { saveRecentlyViewedProduct } from '../components/RecentlyViewed';
import ProductCard from '../components/ProductCard';
import SEOMeta from '../components/SEOMeta';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useSettings } from '../context/SettingsContext';
import { useLanguage } from '../context/LanguageContext';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { formatPrice, getWhatsAppLink } = useSettings();
  const { t } = useLanguage();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('details'); // 'details', 'materials', 'reviews'
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/slug/${slug}`);
        const data = await res.json();
        if (data.success && data.product) {
          setProduct(data.product);
          setRelatedProducts(data.relatedProducts || []);

          // Set default variant if available
          if (data.product.variants && data.product.variants.length > 0) {
            setSelectedVariant(data.product.variants[0]);
          } else {
            setSelectedVariant(null);
          }

          // Save to recently viewed
          saveRecentlyViewedProduct(data.product);

          // Fetch product reviews
          fetchProductReviews(data.product._id);
        }
      } catch (err) {
        console.warn('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const fetchProductReviews = async (productId) => {
    try {
      const res = await fetch(`/api/reviews/product/${productId}`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.warn('Reviews error:', err);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading handcrafted treasure...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2>Product Not Found</h2>
        <p style={{ color: 'var(--text-muted)', margin: '12px 0 24px' }}>
          This handcrafted piece might have been archived or renamed.
        </p>
        <Link to="/shop" className="btn-primary">Browse All Pieces</Link>
      </div>
    );
  }

  const wishlisted = isInWishlist(product._id);
  const isOutOfStock = product.stockQuantity <= 0;

  // Base price + variant adjustment
  const priceAdjustment = selectedVariant?.priceAdjustment || 0;
  const currentBasePrice = (product.discountedPrice || product.price) + priceAdjustment;
  const originalBasePrice = product.price + priceAdjustment;
  const hasDiscount = product.discountedPrice && product.discountedPrice < product.price;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const variantStr = selectedVariant ? `${selectedVariant.name}: ${selectedVariant.value}` : '';
    addToCart(product, quantity, variantStr);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const whatsAppAskText = `Hello QueS.M design! I'm interested in ordering "${product.name}"${selectedVariant ? ` (${selectedVariant.name}: ${selectedVariant.value})` : ''} priced at ${formatPrice(currentBasePrice)}. Is this currently available? Link: ${window.location.href}`;

  return (
    <div className="container" style={{ padding: '30px 20px 80px' }}>
      <SEOMeta
        title={product.seoTitle || product.name}
        description={product.seoDescription || product.shortDescription || product.description}
        image={product.images?.[0]}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          image: product.images,
          description: product.description,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'INR',
            price: currentBasePrice,
            availability: isOutOfStock ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
            seller: { '@type': 'Organization', name: 'QueS.M design' }
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.rating || 5.0,
            reviewCount: Math.max(1, product.numReviews || 1)
          }
        }}
      />

      {/* Breadcrumb */}
      <nav style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
        <Link to="/" style={{ color: 'var(--text-muted)' }}>Home</Link>
        <span style={{ margin: '0 8px' }}>/</span>
        <Link to={`/category/${product.categorySlug}`} style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>
          {product.category?.name || product.categorySlug?.replace(/-/g, ' ')}
        </Link>
        <span style={{ margin: '0 8px' }}>/</span>
        <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{product.name}</span>
      </nav>

      {/* Product Main Display */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '48px', marginBottom: '60px' }}>
        {/* Left: Gallery */}
        <div>
          <ProductGallery images={product.images} productName={product.name} />
        </div>

        {/* Right: Info & Purchase */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <span className="product-category-name">
              {product.category?.name || product.categorySlug?.replace(/-/g, ' ')}
            </span>
            <h1 style={{ fontSize: '2.4rem', fontFamily: 'var(--font-heading)', margin: '4px 0 10px', lineHeight: '1.2' }}>
              {product.name}
            </h1>

            {/* Rating Stars */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={16}
                    fill={s <= Math.round(product.rating || 5) ? '#ff9800' : 'none'}
                    color="#ff9800"
                  />
                ))}
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{product.rating || '5.0'}</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                ({product.numReviews || reviews.length} customer reviews)
              </span>
            </div>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <span style={{ fontSize: '1.9rem', fontWeight: 'bold', color: 'var(--luxury-black)' }}>
                {formatPrice(currentBasePrice)}
              </span>
              {hasDiscount && (
                <>
                  <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                    {formatPrice(originalBasePrice)}
                  </span>
                  <span className="badge-tag badge-sale">
                    Save {Math.round(((originalBasePrice - currentBasePrice) / originalBasePrice) * 100)}%
                  </span>
                </>
              )}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Inclusive of all handcrafted taxes • Free shipping above ₹799
            </p>
          </div>

          <hr style={{ borderColor: 'var(--border-subtle)' }} />

          {/* Short description */}
          {product.shortDescription && (
            <p style={{ color: '#444', fontSize: '0.96rem', lineHeight: '1.6' }}>
              {product.shortDescription}
            </p>
          )}

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 'bold', marginBottom: '8px' }}>
                Select {product.variants[0].name}: <span style={{ color: 'var(--primary-gold-dark)' }}>{selectedVariant?.value}</span>
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {product.variants.map((variant, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedVariant(variant)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      border: selectedVariant?.value === variant.value ? '2px solid var(--primary-gold)' : '1px solid var(--border-color)',
                      background: selectedVariant?.value === variant.value ? 'var(--primary-gold-subtle)' : '#fff',
                      color: selectedVariant?.value === variant.value ? 'var(--primary-gold-dark)' : 'var(--text-main)',
                      cursor: 'pointer'
                    }}
                  >
                    {variant.value}
                    {variant.priceAdjustment > 0 && ` (+${formatPrice(variant.priceAdjustment)})`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock Status */}
          <div>
            {isOutOfStock ? (
              <span className="gold-badge" style={{ background: '#ffebee', color: '#c62828', borderColor: '#ef9a9a' }}>
                ● Out of Stock (Made to order on request)
              </span>
            ) : product.stockQuantity <= 5 ? (
              <span className="gold-badge" style={{ background: '#fff3e0', color: '#e65100', borderColor: '#ffcc80' }}>
                ● {t('lowStock')} ({product.stockQuantity} left)
              </span>
            ) : (
              <span className="gold-badge" style={{ background: '#e8f5e9', color: '#2e7d32', borderColor: '#a5d6a7' }}>
                ● {t('inStock')}
              </span>
            )}
          </div>

          {/* Quantity & Actions */}
          {!isOutOfStock ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                {/* Quantity */}
                <div className="qty-pill" style={{ height: '48px', padding: '0 4px' }}>
                  <button className="qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                  <span className="qty-val" style={{ fontSize: '1rem', padding: '0 12px' }}>{quantity}</span>
                  <button className="qty-btn" onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}>+</button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  className="btn-primary"
                  style={{ flexGrow: 1, height: '48px', fontSize: '0.95rem' }}
                >
                  <ShoppingBag size={18} />
                  <span>{t('addToCart')}</span>
                </button>

                {/* Wishlist Button */}
                <button
                  onClick={() => toggleWishlist(product)}
                  className="nav-action-btn"
                  style={{ width: '48px', height: '48px' }}
                  aria-label="Wishlist toggle"
                >
                  <Heart size={20} fill={wishlisted ? '#d32f2f' : 'none'} color={wishlisted ? '#d32f2f' : 'currentColor'} />
                </button>
              </div>

              {/* Buy Now Direct Button */}
              <button
                onClick={handleBuyNow}
                className="btn-dark"
                style={{ width: '100%', height: '48px', fontSize: '0.95rem' }}
              >
                <span>{t('buyNow')}</span>
                <ArrowRight size={17} />
              </button>
            </div>
          ) : (
            <div>
              <a
                href={getWhatsAppLink(`Hello! I would like to order the out-of-stock piece: "${product.name}". Please notify me when made.`)}
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
                style={{ width: '100%', padding: '14px', background: '#25d366', color: '#fff' }}
              >
                <MessageCircle size={18} />
                <span>{t('notifyOnWhatsApp')}</span>
              </a>
            </div>
          )}

          {/* WhatsApp Direct Order / Inquiry */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <a
              href={getWhatsAppLink(whatsAppAskText)}
              target="_blank"
              rel="noreferrer"
              className="btn-outline"
              style={{ flexGrow: 1, padding: '12px', fontSize: '0.88rem' }}
            >
              <MessageCircle size={17} color="#25d366" />
              <span>{t('askOnWhatsApp')}</span>
            </a>

            <button
              onClick={handleShare}
              className="btn-outline"
              style={{ padding: '12px', fontSize: '0.85rem' }}
              title="Copy product link"
            >
              <Share2 size={16} />
              <span>{copiedLink ? 'Copied!' : 'Share'}</span>
            </button>
          </div>

          {/* Trust Guarantees */}
          <div style={{ background: '#fdfcf9', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Truck size={17} className="gold-text" />
              <span>Dispatched within 24-48 hours with premium tracking</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={17} className="gold-text" />
              <span>Gift wrapping available with handwritten greeting at checkout</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description, Materials & Care, Reviews */}
      <div style={{ marginTop: '50px', borderTop: '1px solid var(--border-color)', paddingTop: '40px' }}>
        <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '28px' }}>
          {[
            { id: 'details', label: t('details') },
            { id: 'materials', label: t('materials') },
            { id: 'reviews', label: `${t('reviews')} (${reviews.length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'none',
                fontFamily: 'var(--font-heading)',
                fontSize: '1.15rem',
                fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                color: activeTab === tab.id ? 'var(--luxury-black)' : 'var(--text-muted)',
                position: 'relative',
                paddingBottom: '8px'
              }}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div style={{ position: 'absolute', bottom: '-13px', left: 0, right: 0, height: '2px', background: 'var(--primary-gold)' }} />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'details' && (
          <div style={{ lineHeight: '1.8', color: '#444', maxWidth: '850px' }}>
            <p style={{ whiteSpace: 'pre-line', fontSize: '1rem' }}>{product.description}</p>
          </div>
        )}

        {activeTab === 'materials' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', maxWidth: '850px' }}>
            <div style={{ background: '#fff', padding: '20px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '8px', color: 'var(--primary-gold-dark)' }}>
                Materials & Craftsmanship
              </h4>
              <p style={{ fontSize: '0.9rem', color: '#555' }}>
                {product.materials || 'Handcrafted Silk Thread, Gold Zari, Kundan Stones, Premium Anti-Allergic Base.'}
              </p>
            </div>

            <div style={{ background: '#fff', padding: '20px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '8px', color: 'var(--primary-gold-dark)' }}>
                Care & Maintenance
              </h4>
              <p style={{ fontSize: '0.9rem', color: '#555' }}>
                {product.careInstructions || 'Keep away from moisture, perfume sprays, and harsh chemicals. Store individually in an airtight pouch or box.'}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-heading)' }}>Customer Reviews</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Honest thoughts from fellow jewelry lovers</p>
              </div>
              <button onClick={() => setIsReviewModalOpen(true)} className="btn-primary">
                {t('writeReview')}
              </button>
            </div>

            {reviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', background: '#fdfcf9', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <p style={{ color: 'var(--text-muted)' }}>No customer reviews yet. Be the first to share your thoughts!</p>
                <button onClick={() => setIsReviewModalOpen(true)} className="btn-outline" style={{ marginTop: '16px' }}>
                  Write First Review
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {reviews.map(rev => (
                  <div key={rev._id} style={{ background: '#fff', padding: '20px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{rev.customerName}</span>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} size={14} fill="#ff9800" color="#ff9800" />
                        ))}
                      </div>
                    </div>
                    <p style={{ color: '#555', fontSize: '0.92rem', lineHeight: '1.6' }}>{rev.comment}</p>
                    {rev.photoUrl && (
                      <img src={rev.photoUrl} alt="Review photo" style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover', marginTop: '10px' }} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section style={{ marginTop: '70px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <Sparkles size={20} className="gold-text" />
            <h3 style={{ fontSize: '1.7rem', fontFamily: 'var(--font-heading)' }}>
              {t('relatedProducts')}
            </h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px' }}>
            {relatedProducts.map(prod => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* Recently Viewed */}
      <RecentlyViewed currentProductId={product._id} />

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        productId={product._id}
        productName={product.name}
        onReviewSubmitted={() => fetchProductReviews(product._id)}
      />
    </div>
  );
};

export default ProductDetailPage;
