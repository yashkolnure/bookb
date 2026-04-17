import { useEffect, useState } from 'react';
import { reviewAPI } from '../../api/api';
import { Star, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import './ServicesPage.css';

function Stars({ rating }) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={14}
          fill={i <= rating ? 'var(--gold)' : 'none'}
          stroke={i <= rating ? 'var(--gold)' : 'var(--border-dark)'}
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const load = () => {
    setLoading(true);
    reviewAPI.getProviderReviews()
      .then(r => setReviews(r.data.reviews))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this review? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await reviewAPI.deleteReview(id);
      setReviews(prev => prev.filter(r => r._id !== id));
      toast.success('Review deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete review');
    } finally {
      setDeletingId(null);
    }
  };

  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—';
  const dist = [5, 4, 3, 2, 1].map(n => ({ n, count: reviews.filter(r => r.rating === n).length }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reviews</h1>
          <p className="page-subtitle">Customer feedback for your store and services</p>
        </div>
      </div>

      {loading ? (
        <div className="page-loading" style={{ minHeight: '30vh' }}>
          <div className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
        </div>
      ) : reviews.length === 0 ? (
        <div className="empty-state" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--warm-white)' }}>
          <div className="empty-state-icon">⭐</div>
          <h3>No reviews yet</h3>
          <p>Reviews appear after customers complete appointments and submit feedback.</p>
        </div>
      ) : (
        <div className="reviews-layout">
          {/* Summary sidebar */}
          <div className="card reviews-summary">
            <div className="rev-avg">{avg}</div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Stars rating={Math.round(Number(avg))} />
            </div>
            <div className="rev-total">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</div>
            <div className="divider" />
            <div className="rev-dist">
              {dist.map(({ n, count }) => (
                <div key={n} className="dist-row">
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: 'var(--ink-muted)', whiteSpace: 'nowrap' }}>
                    {n} <Star size={11} fill="var(--gold)" stroke="var(--gold)" />
                  </span>
                  <div className="dist-bar-wrap">
                    <div className="dist-bar" style={{ width: reviews.length ? `${(count / reviews.length * 100)}%` : '0%' }} />
                  </div>
                  <span style={{ fontSize: 12, color: 'var(--ink-muted)', minWidth: 20, textAlign: 'right' }}>{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Review feed */}
          <div className="reviews-feed">
            {reviews.map(r => (
              <div key={r._id} className="rev-card card">
                <div className="rev-card-header">
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{r.customer.name}</div>
                    <Stars rating={r.rating} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                    <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
                      {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    {r.service && (
                      <div style={{ fontSize: 12, color: 'var(--gold)' }}>{r.service.name}</div>
                    )}
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--error)', padding: '4px 8px' }}
                      onClick={() => handleDelete(r._id)}
                      disabled={deletingId === r._id}
                      title="Delete this review"
                    >
                      {deletingId === r._id
                        ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                        : <Trash2 size={14} />
                      }
                    </button>
                  </div>
                </div>
                {r.comment && (
                  <p style={{ marginTop: 12, fontSize: 14, color: 'var(--ink-light)', lineHeight: 1.6 }}>
                    {r.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
