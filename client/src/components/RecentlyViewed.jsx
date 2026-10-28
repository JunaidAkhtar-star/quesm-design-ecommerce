import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const saveRecentlyViewedProduct = (product) => {
  if (!product || !product._id) return;
  try {
    let list = JSON.parse(localStorage.getItem('quesm_recent_views') || '[]');
    // Filter out current product if already in list
    list = list.filter(item => item._id !== product._id);
    // Add to front
    list.unshift({
      _id: product._id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      discountedPrice: product.discountedPrice,
      images: product.images,
      stockQuantity: product.stockQuantity,
      rating: product.rating,
      numReviews: product.numReviews,
      categorySlug: product.categorySlug,
      category: product.category
    });
    // Limit to 6
    if (list.length > 6) list = list.slice(0, 6);
    localStorage.setItem('quesm_recent_views', JSON.stringify(list));
  } catch (err) {
    console.warn('Recently viewed storage error:', err);
  }
};

const RecentlyViewed = ({ currentProductId }) => {
  const [recentProducts, setRecentProducts] = useState([]);
  const { t } = useLanguage();

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('quesm_recent_views') || '[]');
      const filtered = saved.filter(p => p._id !== currentProductId);
      setRecentProducts(filtered);
    } catch {
      setRecentProducts([]);
    }
  }, [currentProductId]);

  if (recentProducts.length === 0) return null;

  return (
    <section style={{ margin: '60px 0 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        <Sparkles size={20} className="gold-text" />
        <h3 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-heading)' }}>
          {t('recentlyViewed')}
        </h3>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '24px'
        }}
      >
        {recentProducts.slice(0, 4).map(prod => (
          <ProductCard key={prod._id} product={prod} />
        ))}
      </div>
    </section>
  );
};

export default RecentlyViewed;
