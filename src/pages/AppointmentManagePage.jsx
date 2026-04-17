import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { appointmentAPI, reviewAPI } from '../api/api';
import { Clock, Calendar, Store, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import './AppointmentManagePage.css';

export default function AppointmentManagePage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const token = params.get('token');
  const [appt, setAppt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    appointmentAPI.manage(id, token)
      .then(r => setAppt(r.data.appointment))
      .catch(() => toast.error('Unable to load appointment'))
      .finally(() => setLoading(false));
  }, [id, token]);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    setCancelling(true);
    try {
      const res = await appointmentAPI.cancel(id, token, 'Cancelled by customer');
      setAppt(res.data.appointment);
      toast.success('Appointment cancelled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel');
    } finally {
      setCancelling(false);
    }
  };

  const handleReview = async () => {
    if (!review.rating) { toast.error('Please select a rating'); return; }
    setSubmittingReview(true);
    try {
      await reviewAPI.submit({ appointmentId: id, token, ...review });
      setReviewDone(true);
      setShowReview(false);
      toast.success('Review submitted! Thank you.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div className="page-loading"><div className="spinner" style={{width:36,height:36,borderWidth:3}}/><p>Loading appointment...</p></div>;
  if (!token || !appt) return (
    <div className="page-loading">
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:48,marginBottom:16}}>🔒</div>
        <h3>Invalid or expired link</h3>
        <p style={{color:'var(--ink-muted)',marginTop:8}}>This appointment link is invalid or has expired.</p>
        <Link to="/" className="btn btn-primary" style={{marginTop:16}}>Go Home</Link>
      </div>
    </div>
  );

  const dateStr = new Date(appt.appointmentDate).toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  const canCancel = ['pending','confirmed'].includes(appt.status);
  const canReview = appt.status === 'completed' && !reviewDone;

  return (
    <div className="manage-page">
      <div className="manage-nav">
        <div className="container">
          <span className="manage-logo">BookEase</span>
        </div>
      </div>

      <div className="container manage-layout">
        <div className="manage-main animate-fadeUp">
          <div className="manage-header">
            <div>
              <div className="section-eyebrow">Appointment</div>
              <h1>#{appt.appointmentId}</h1>
            </div>
            <div className={`badge badge-${appt.status}`}>{appt.status}</div>
          </div>

          <div className="manage-card card">
            <h3>Appointment Details</h3>
            <div className="manage-details">
              <div className="detail-row">
                <Calendar size={16} className="detail-icon"/>
                <div>
                  <div className="detail-label">Date & Time</div>
                  <div className="detail-val">{dateStr} at {appt.startTime}</div>
                </div>
              </div>
              <div className="detail-row">
                <Clock size={16} className="detail-icon"/>
                <div>
                  <div className="detail-label">Duration</div>
                  <div className="detail-val">{appt.service?.duration} minutes</div>
                </div>
              </div>
              <div className="detail-row">
                <Store size={16} className="detail-icon"/>
                <div>
                  <div className="detail-label">Store</div>
                  <div className="detail-val">{appt.store?.name}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="manage-card card">
            <h3>Service</h3>
            <div className="svc-info">
              <div className="svc-name">{appt.service?.name}</div>
              {appt.selectedOptions?.length > 0 && (
                <div className="svc-opts">
                  {appt.selectedOptions.map(o => <span key={o.label} className="badge badge-gold">{o.label}: {o.value}</span>)}
                </div>
              )}
            </div>
          </div>

          <div className="manage-card card">
            <h3>Payment Summary</h3>
            <div className="payment-rows">
              <div className="p-row"><span>Service Price</span><span>₹{appt.originalPrice}</span></div>
              {appt.discountAmount > 0 && (
                <div className="p-row discount"><span>Discount {appt.couponCode ? `(${appt.couponCode})` : ''}</span><span>−₹{appt.discountAmount}</span></div>
              )}
              <div className="p-row total"><span>Total</span><span>₹{appt.totalAmount}</span></div>
              <div className="p-row"><span>Payment Status</span><span className={`badge badge-${appt.payment?.status === 'paid' ? 'paid' : 'pending'}`}>{appt.payment?.status || 'pending'}</span></div>
            </div>
          </div>

          {appt.cancellationReason && (
            <div className="manage-card card" style={{borderColor:'var(--error)',background:'#fce4ec20'}}>
              <h3 style={{color:'var(--error)'}}>Cancellation Reason</h3>
              <p style={{marginTop:8,fontSize:14,color:'var(--ink-muted)'}}>{appt.cancellationReason}</p>
            </div>
          )}

          <div className="manage-actions">
            {canCancel && (
              <button className="btn btn-danger" onClick={handleCancel} disabled={cancelling}>
                {cancelling ? <span className="spinner" style={{borderTopColor:'#fff'}}/> : 'Cancel Appointment'}
              </button>
            )}
            {canReview && (
              <button className="btn btn-gold" onClick={() => setShowReview(true)}>
                <Star size={15}/> Leave a Review
              </button>
            )}
            {reviewDone && <div className="review-done-msg">✓ Review submitted. Thank you!</div>}
            {appt.store?.slug && (
              <Link to={`/store/${appt.store.slug}`} className="btn btn-outline">View Store</Link>
            )}
          </div>
        </div>

        <div className="manage-sidebar">
          <div className="card">
            <h3>Customer Info</h3>
            <div className="cust-info">
              <div className="cust-row"><span>Name</span><span>{appt.customer?.name}</span></div>
              <div className="cust-row"><span>Email</span><span>{appt.customer?.email}</span></div>
              <div className="cust-row"><span>Phone</span><span>{appt.customer?.phone}</span></div>
              {appt.customer?.notes && <div className="cust-row"><span>Notes</span><span>{appt.customer.notes}</span></div>}
            </div>
          </div>
          {appt.store && (
            <div className="card" style={{marginTop:16}}>
              <h3>Store Contact</h3>
              <div className="cust-info">
                {appt.store.phone && <div className="cust-row"><span>Phone</span><span>{appt.store.phone}</span></div>}
                {appt.store.email && <div className="cust-row"><span>Email</span><span>{appt.store.email}</span></div>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showReview && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setShowReview(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Leave a Review</h2>
              <button className="modal-close" onClick={() => setShowReview(false)}>×</button>
            </div>
            <div className="form-group">
              <label className="form-label">Rating</label>
              <div className="star-picker">
                {[1,2,3,4,5].map(n => (
                  <button key={n} className={`star-pick ${review.rating >= n ? 'active' : ''}`}
                    onClick={() => setReview(p=>({...p,rating:n}))}>
                    <Star size={28} fill={review.rating>=n?'var(--gold)':'none'} stroke={review.rating>=n?'var(--gold)':'var(--border-dark)'}/>
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Comment (optional)</label>
              <textarea className="form-input" rows={4} placeholder="Share your experience..."
                value={review.comment} onChange={e => setReview(p=>({...p,comment:e.target.value}))} />
            </div>
            <div style={{display:'flex',gap:12,justifyContent:'flex-end'}}>
              <button className="btn btn-outline" onClick={() => setShowReview(false)}>Cancel</button>
              <button className="btn btn-gold" onClick={handleReview} disabled={submittingReview}>
                {submittingReview ? <span className="spinner" style={{borderTopColor:'#fff'}}/> : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
