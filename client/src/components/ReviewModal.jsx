import React, { useState } from 'react';
import { X, Star, Send } from 'lucide-react';

const ReviewModal = ({ isOpen, onClose, productId, productName, onReviewSubmitted }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          customerName: name,
          customerEmail: email,
          rating,
          comment,
          photoUrl
        })
      });

      const data = await res.json();
      if (data.success) {
        setSubmittedMessage(data.message);
        if (onReviewSubmitted) onReviewSubmitted();
        setTimeout(() => {
          onClose();
          setSubmittedMessage('');
          setName('');
          setEmail('');
          setComment('');
          setPhotoUrl('');
        }, 2200);
      } else {
        setErrorMessage(data.message || 'Error submitting review');
      }
    } catch (err) {
      setErrorMessage('Could not connect to server. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 120,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          background: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-color)'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div
          style={{
            padding: '20px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>Write a Review</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{productName}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        {submittedMessage ? (
          <div style={{ padding: '40px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>✨</div>
            <h4 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--luxury-black)' }}>Review Submitted!</h4>
            <p style={{ fontSize: '0.9rem', color: '#2e7d32' }}>{submittedMessage}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Star Rating Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '6px' }}>
                Your Rating
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{ background: 'none', padding: '4px' }}
                  >
                    <Star
                      size={28}
                      fill={(hoverRating || rating) >= star ? '#ff9800' : 'none'}
                      color={(hoverRating || rating) >= star ? '#ff9800' : '#ccc'}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '4px' }}>
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Radhika"
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '4px' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '4px' }}>
                Your Feedback & Experience *
              </label>
              <textarea
                required
                rows={4}
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Tell us what you liked about the handcrafted quality, finishing, or packaging..."
                style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', resize: 'vertical' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '4px' }}>
                Photo URL (optional)
              </label>
              <input
                type="url"
                value={photoUrl}
                onChange={e => setPhotoUrl(e.target.value)}
                placeholder="https://... (image link showing you wearing it)"
                style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
              />
            </div>

            {errorMessage && (
              <p style={{ color: '#d32f2f', fontSize: '0.82rem' }}>{errorMessage}</p>
            )}

            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              🔒 To ensure authentic feedback for our boutique patrons, reviews appear after owner verification.
            </p>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{ width: '100%', padding: '12px', marginTop: '6px' }}
            >
              <Send size={16} />
              <span>{submitting ? 'Submitting...' : 'Submit Review'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReviewModal;
