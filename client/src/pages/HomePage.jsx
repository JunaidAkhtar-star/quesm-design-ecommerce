import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Heart, Star, ShieldCheck, Instagram, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import SEOMeta from '../components/SEOMeta';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';

const HomePage = () => {
  const { t } = useLanguage();
  const { getWhatsAppLink, formatPrice } = useSettings();

  const [banners, setBanners] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [bannersRes, catRes, featRes, newRes, bestRes] = await Promise.all([
          fetch('/api/banners'),
          fetch('/api/categories'),
          fetch('/api/products/featured'),
          fetch('/api/products/new-arrivals'),
          fetch('/api/products/best-sellers')
        ]);

        const [bannersData, catData, featData, newData, bestData] = await Promise.all([
          bannersRes.json(),
          catRes.json(),
          featRes.json(),
          newRes.json(),
          bestRes.json()
        ]);

        if (bannersData.success) setBanners(bannersData.banners);
        if (catData.success) setCategories(catData.categories);
        if (featData.success) setFeaturedProducts(featData.products);
        if (newData.success) setNewArrivals(newData.products);
        if (bestData.success) setBestSellers(bestData.products);
      } catch (err) {
        console.warn('Error fetching homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  // Banner carousel auto slide
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const fallbackBanners = [
    {
      title: 'Timeless Artisanal Elegance',
      subtitle: 'Handcrafted with Love, Created for You',
      badge: 'Boutique Collection 2026',
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1600&q=80',
      link: '/shop',
      buttonText: 'Explore Collection'
    }
  ];

  const activeBanners = banners.length > 0 ? banners : fallbackBanners;

  return (
    <div>
      <SEOMeta
        title="Luxury Handmade Accessories & Jewellery"
        description="Shop artisanal silk thread bangles, bridal flower jewellery, handmade earrings, designer phone charms, and custom cases handcrafted with love."
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'QueS.M design',
          url: 'http://localhost:5173',
          logo: 'http://localhost:5173/logo.png',
          sameAs: ['https://instagram.com/quesmdesign']
        }}
      />

      {/* 1. Hero Carousel */}
      <section className="hero-section">
        {activeBanners.map((slide, idx) => (
          <div key={idx} className={`hero-slide ${idx === currentSlide ? 'active' : ''}`}>
            <img
              src={slide.image || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1600&q=80'}
              alt={slide.title}
              className="hero-bg-img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1600&q=80';
              }}
            />
            <div className="container" style={{ position: 'relative', zIndex: 20 }}>
              <div className="hero-content">
                <span className="hero-badge">{slide.badge || 'Handmade With Love'}</span>
                <h1 className="hero-title">{slide.title}</h1>
                <p className="hero-subtitle">{slide.subtitle}</p>
                <Link to={slide.link || '/shop'} className="btn-primary" style={{ padding: '14px 34px', fontSize: '1rem' }}>
                  <span>{slide.buttonText || t('shopNow')}</span>
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        ))}

        {activeBanners.length > 1 && (
          <div className="hero-carousel-nav">
            {activeBanners.map((_, i) => (
              <div
                key={i}
                className={`hero-dot ${i === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(i)}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* 2. Curated Categories */}
      <section className="container" style={{ padding: '70px 20px 40px' }}>
        <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 40px' }}>
          <span className="gold-badge" style={{ marginBottom: '10px' }}>
            <Sparkles size={13} />
            <span>Artisanal Collections</span>
          </span>
          <h2 style={{ fontSize: '2.4rem', fontFamily: 'var(--font-heading)', marginBottom: '10px' }}>
            {t('exploreCategories')}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            {t('categoriesSubtitle')}
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px'
          }}
        >
          {categories.map((cat) => (
            <Link key={cat._id} to={`/category/${cat.slug}`} className="category-card">
              <img
                src={cat.image || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80'}
                alt={cat.name}
                className="category-img"
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80';
                }}
              />
              <div className="category-overlay">
                <h3 className="category-title">{cat.name}</h3>
                <span className="category-count">
                  {cat.productCount !== undefined ? `${cat.productCount} Handcrafted Pieces` : 'Explore Pieces'} &rarr;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Featured Treasures */}
      <section className="container" style={{ padding: '40px 20px 60px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
          <div>
            <span className="gold-badge" style={{ marginBottom: '8px' }}>
              <Heart size={12} fill="#d4af37" />
              <span>Hand-Picked Gems</span>
            </span>
            <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-heading)' }}>
              {t('featuredCollection')}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginTop: '4px' }}>
              {t('featuredSubtitle')}
            </p>
          </div>
          <Link to="/shop" className="btn-outline">
            <span>{t('viewAll')}</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '24px'
          }}
        >
          {featuredProducts.slice(0, 8).map(prod => (
            <ProductCard key={prod._id} product={prod} />
          ))}
        </div>
      </section>

      {/* 4. Artisanal Heritage Story Banner */}
      <section style={{ background: 'var(--luxury-black)', color: '#fff', padding: '70px 20px', margin: '40px 0', borderTop: '1px solid rgba(212,175,55,0.2)', borderBottom: '1px solid rgba(212,175,55,0.2)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '50px', alignItems: 'center' }}>
          <div>
            <span className="hero-badge" style={{ marginBottom: '14px' }}>Our Craftsmanship</span>
            <h2 style={{ fontSize: '2.6rem', color: '#fff', marginBottom: '18px', lineHeight: '1.2' }}>
              Handmade With Passion & Tradition
            </h2>
            <p style={{ color: '#b5b2aa', fontSize: '1rem', lineHeight: '1.7', marginBottom: '20px' }}>
              At <strong>QueS.M design</strong>, every silk thread bangle, delicate charm, and floral keepsake is born in our dedicated studio. We preserve authentic Indian artisanal techniques while blending contemporary boutique aesthetics.
            </p>
            <div style={{ display: 'flex', gap: '24px', marginBottom: '30px' }}>
              <div>
                <h4 className="gold-text" style={{ fontSize: '2rem', fontWeight: 'bold' }}>100%</h4>
                <p style={{ color: '#aaa', fontSize: '0.82rem' }}>Artisanal Handcrafted</p>
              </div>
              <div>
                <h4 className="gold-text" style={{ fontSize: '2rem', fontWeight: 'bold' }}>2,500+</h4>
                <p style={{ color: '#aaa', fontSize: '0.82rem' }}>Happy Patrons</p>
              </div>
              <div>
                <h4 className="gold-text" style={{ fontSize: '2rem', fontWeight: 'bold' }}>4.9★</h4>
                <p style={{ color: '#aaa', fontSize: '0.82rem' }}>Average Rating</p>
              </div>
            </div>
            <Link to="/about" className="btn-primary">
              <span>Read Our Full Story</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{ position: 'relative' }}>
            <img
              src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80"
              alt="Artisanal jewelry creation"
              style={{
                width: '100%',
                borderRadius: 'var(--radius-xl)',
                border: '2px solid rgba(212,175,55,0.4)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
              }}
            />
          </div>
        </div>
      </section>

      {/* 5. Best Sellers */}
      <section className="container" style={{ padding: '50px 20px' }}>
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 36px' }}>
          <span className="gold-badge" style={{ marginBottom: '8px' }}>
            <Sparkles size={12} />
            <span>Boutique Favorites</span>
          </span>
          <h2 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>
            {t('bestSellers')}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            {t('bestSellersSubtitle')}
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '24px'
          }}
        >
          {bestSellers.slice(0, 4).map(prod => (
            <ProductCard key={prod._id} product={prod} />
          ))}
        </div>
      </section>

      {/* 6. Customer Reviews Carousel / Grid */}
      <section style={{ background: '#f5f0e6', padding: '70px 20px', margin: '40px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 40px' }}>
            <span className="gold-badge" style={{ marginBottom: '8px' }}>
              <Star size={12} fill="#d4af37" />
              <span>Real Experiences</span>
            </span>
            <h2 style={{ fontSize: '2.3rem', fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>
              {t('customerStories')}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              {t('customerStoriesSubtitle')}
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px'
            }}
          >
            {[
              {
                name: 'Priya Sharma',
                city: 'Delhi',
                rating: 5,
                comment: 'The silk thread bangles matched my Haldi outfit perfectly! So neatly woven, and they arrived in a gorgeous gold box with dried rose petals.',
                item: 'Royal Kundan Silk Thread Bangle Set'
              },
              {
                name: 'Ananya Verma',
                city: 'Bengaluru',
                rating: 5,
                comment: 'I ordered the bridal flower jewellery set for my sister’s mehendi. The flowers looked as fresh as real blooms and were so feather-light to wear.',
                item: 'Bridal Haldi Flower Jewellery Set'
              },
              {
                name: 'Ritu Sen',
                city: 'Kolkata',
                rating: 5,
                comment: 'The real pressed flower phone case is a work of art! Everyone at my office asked where I got it from. 10/10 quality and finish.',
                item: 'Real Pressed Flower Resin Case'
              }
            ].map((rev, i) => (
              <div
                key={i}
                style={{
                  background: '#fff',
                  padding: '28px',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-sm)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', gap: '3px' }}>
                  {[...Array(rev.rating)].map((_, s) => (
                    <Star key={s} size={16} fill="#ff9800" color="#ff9800" />
                  ))}
                </div>
                <p style={{ fontStyle: 'italic', color: '#444', fontSize: '0.94rem', lineHeight: '1.6' }}>
                  "{rev.comment}"
                </p>
                <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #f0ebe0' }}>
                  <h4 style={{ fontSize: '0.95rem', color: 'var(--luxury-black)' }}>{rev.name}</h4>
                  <span style={{ fontSize: '0.78rem', color: '#888' }}>{rev.city} • Verified Buyer</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Instagram & Social Community Strip */}
      <section className="container" style={{ padding: '40px 20px 20px', textAlign: 'center' }}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--primary-gold-dark)', fontWeight: 'bold', fontSize: '0.85rem' }}>
            <Instagram size={16} />
            <span>@quesmdesign on Instagram</span>
          </div>
          <h3 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-heading)', marginTop: '4px' }}>
            Tag #QueSMdesign To Be Featured
          </h3>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '14px'
          }}
        >
          {[
            'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80',
            'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80',
            'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80',
            'https://images.unsplash.com/photo-1561828995-aa79a2db86dd?w=600&q=80',
            'https://images.unsplash.com/photo-1590548784585-643d2b9f2925?w=600&q=80',
            'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&q=80'
          ].map((img, idx) => (
            <div
              key={idx}
              style={{
                aspectRatio: '1/1',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              <img
                src={img}
                alt="QueS.M design customer look"
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
