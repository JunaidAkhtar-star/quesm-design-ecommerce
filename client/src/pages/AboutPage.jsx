import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, Flower2, Award, ArrowRight } from 'lucide-react';
import SEOMeta from '../components/SEOMeta';

const AboutPage = () => {
  return (
    <div className="container" style={{ padding: '40px 20px 80px', maxWidth: '960px' }}>
      <SEOMeta
        title="Our Story & Handmade Craftsmanship"
        description="Learn about QueS.M design, our commitment to Indian handmade artistry, and the skilled artisans behind our silk thread and floral creations."
      />

      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <span className="gold-badge" style={{ marginBottom: '12px' }}>
          <Sparkles size={13} />
          <span>The QueS.M Journey</span>
        </span>
        <h1 style={{ fontSize: '3rem', fontFamily: 'var(--font-heading)', marginBottom: '16px' }}>
          Crafted by Hand, Cherished by Heart
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '640px', margin: '0 auto', lineHeight: '1.7' }}>
          A boutique sanctuary where traditional Indian craftsmanship meets modern, feminine grace.
        </p>
      </div>

      {/* Featured Story Image */}
      <div style={{ position: 'relative', borderRadius: 'var(--radius-xl)', overflow: 'hidden', marginBottom: '50px', maxHeight: '440px' }}>
        <img
          src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=80"
          alt="Handmade silk thread jewelry process"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&q=80';
          }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(15,15,18,0.7) 100%)' }} />
      </div>

      {/* Main Narrative */}
      <div style={{ lineHeight: '1.9', color: '#3d3d42', fontSize: '1.05rem', display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '60px' }}>
        <p>
          Welcome to <strong>QueS.M design</strong>. Born out of an unwavering reverence for timeless handmade accessories, our brand is a tribute to the delicate rhythm of artisanal creation. In an era dominated by mass-produced fast fashion, we believe genuine luxury lies in the human touch — in the patience it takes to wrap yards of raw silk thread around curved kada molds and the precision required to encrust each Kundan stone by hand.
        </p>
        <p>
          Every single collection in our studio — from royal bridal silk bangles and fragrant ceremonial flower jewellery to custom botanical phone covers — is conceived with intentionality. We draw inspiration from heritage motifs, seasonal blossoms, and the celebratory essence of Indian festivals and wedding ceremonies.
        </p>

        {/* Highlight quote */}
        <div style={{ background: '#f8f5ee', borderLeft: '4px solid var(--primary-gold)', padding: '24px 30px', borderRadius: '0 var(--radius-md) var(--radius-md) 0', margin: '14px 0' }}>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--luxury-black)', fontStyle: 'italic', margin: 0 }}>
            "We don't merely manufacture accessories; we craft heirloom memories designed to be passed down and treasured across life’s milestone celebrations."
          </p>
          <span style={{ display: 'block', marginTop: '10px', fontSize: '0.85rem', color: 'var(--primary-gold-dark)', fontWeight: 'bold' }}>
            — Founder & Lead Artisan, QueS.M design
          </span>
        </div>

        <p>
          Beyond aesthetic beauty, QueS.M design stands firmly committed to supporting women artisans and local craft communities. By providing flexible, dignified home-based craft opportunities, our patrons directly empower talented women to preserve their craft traditions while nurturing their families.
        </p>
      </div>

      {/* Core Values Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginBottom: '60px' }}>
        <div style={{ background: '#fff', padding: '28px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--primary-gold-subtle)', color: 'var(--primary-gold-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <Award size={22} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>Uncompromising Quality</h3>
          <p style={{ color: '#666', fontSize: '0.88rem', lineHeight: '1.6' }}>
            We source only premium anti-tarnish alloys, authentic raw silk, fresh water baroque pearls, and non-toxic UV resin.
          </p>
        </div>

        <div style={{ background: '#fff', padding: '28px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--primary-gold-subtle)', color: 'var(--primary-gold-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <Heart size={22} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>Handmade with Love</h3>
          <p style={{ color: '#666', fontSize: '0.88rem', lineHeight: '1.6' }}>
            Each piece takes anywhere from 4 to 12 painstaking hours of focused craftsmanship to achieve seamless symmetry.
          </p>
        </div>

        <div style={{ background: '#fff', padding: '28px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--primary-gold-subtle)', color: 'var(--primary-gold-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
            <Flower2 size={22} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>Bespoke Customization</h3>
          <p style={{ color: '#666', fontSize: '0.88rem', lineHeight: '1.6' }}>
            Need a specific bangle diameter, bridal palette match, or custom phone charm initial? We love crafting personalized dreams.
          </p>
        </div>
      </div>

      {/* CTA Box */}
      <div style={{ background: 'var(--luxury-black)', color: '#fff', padding: '40px', borderRadius: 'var(--radius-xl)', textAlign: 'center', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
        <h3 style={{ fontSize: '1.8rem', color: '#f7e7b4', marginBottom: '10px' }}>Experience The Artisanal Difference</h3>
        <p style={{ color: '#aaa', fontSize: '0.95rem', maxWidth: '500px', margin: '0 auto 24px' }}>
          Browse our newest creations and discover your next signature accessory.
        </p>
        <Link to="/shop" className="btn-primary" style={{ padding: '14px 34px' }}>
          <span>Shop The Collection</span>
          <ArrowRight size={17} />
        </Link>
      </div>
    </div>
  );
};

export default AboutPage;
