import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { storeAPI, serviceAPI, reviewAPI } from '../api/api';
import {
  MapPin, Phone, Mail, Globe, Clock, Star,
  ChevronRight, Link2, LayoutGrid, List, X, ChevronLeft, ZoomIn
} from 'lucide-react';
import './StorePage.css';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/* ─────────────────────────────────────────
   Star Rating
───────────────────────────────────────── */
function StarRating({ rating, count }) {
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={14}
          fill={i <= Math.round(rating) ? 'var(--gold)' : 'none'}
          stroke={i <= Math.round(rating) ? 'var(--gold)' : 'var(--border-dark)'}
        />
      ))}
      <span>{rating?.toFixed(1)}</span>
      <span className="star-count">({count} reviews)</span>
    </div>
  );
}

/* ─────────────────────────────────────────
   Lightbox
───────────────────────────────────────── */
function Lightbox({ images, startIdx, onClose }) {
  const [idx, setIdx] = useState(startIdx);
  const [dragging, setDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);

  const prev = useCallback(() => setIdx(i => Math.max(0, i - 1)), []);
  const next = useCallback(() => setIdx(i => Math.min(images.length - 1, i + 1)), [images.length]);

  useEffect(() => {
    const fn = e => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [prev, next, onClose]);

  // Touch / mouse drag to swipe
  const onPointerDown = (e) => { setDragging(true); setDragStartX(e.clientX ?? e.touches?.[0]?.clientX); };
  const onPointerUp = (e) => {
    if (!dragging) return;
    const endX = e.clientX ?? e.changedTouches?.[0]?.clientX ?? dragStartX;
    const diff = dragStartX - endX;
    if (Math.abs(diff) > 50) { diff > 0 ? next() : prev(); }
    setDragging(false);
  };

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div className="lightbox-inner" onClick={e => e.stopPropagation()}
        onMouseDown={onPointerDown} onMouseUp={onPointerUp}
        onTouchStart={onPointerDown} onTouchEnd={onPointerUp}
      >
        {/* Close */}
        <button className="lb-close" onClick={onClose}><X size={20} /></button>

        {/* Image */}
        <div className="lb-img-wrap">
          <img
            key={idx}
            src={images[idx]}
            alt={`Image ${idx + 1}`}
            className="lb-img animate-fadeIn"
            draggable={false}
            onError={e => { e.currentTarget.src = ''; }}
          />
        </div>

        {/* Arrows */}
        {images.length > 1 && (
          <>
            <button className="lb-arrow lb-arrow-left" onClick={prev} disabled={idx === 0}>
              <ChevronLeft size={28} />
            </button>
            <button className="lb-arrow lb-arrow-right" onClick={next} disabled={idx === images.length - 1}>
              <ChevronRight size={28} />
            </button>
          </>
        )}

        {/* Counter */}
        <div className="lb-counter">{idx + 1} / {images.length}</div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="lb-thumbs">
            {images.map((url, i) => (
              <button
                key={i}
                className={`lb-thumb ${i === idx ? 'active' : ''}`}
                onClick={() => setIdx(i)}
              >
                <img src={url} alt={`thumb ${i + 1}`} onError={e => { e.currentTarget.style.opacity = '0.3'; }} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Image Carousel (inside card)
───────────────────────────────────────── */
function CardCarousel({ images, serviceName, onImageClick }) {
  const [activeIdx, setActiveIdx] = useState(0);

  const prev = (e) => { e.stopPropagation(); setActiveIdx(i => Math.max(0, i - 1)); };
  const next = (e) => { e.stopPropagation(); setActiveIdx(i => Math.min(images.length - 1, i + 1)); };

  if (images.length === 0) {
    return <div className="service-card-img-placeholder">{serviceName[0]}</div>;
  }

  return (
    <>
      {/* Image strip */}
      <div className="svc-img-strip" onClick={() => onImageClick(activeIdx)} style={{ cursor: 'zoom-in' }}>
        {images.map((url, i) => (
          <img key={i} src={url} alt={`${serviceName} ${i + 1}`}
            className={`svc-img-slide ${i === activeIdx ? 'active' : ''}`}
            onError={e => { e.currentTarget.style.display = 'none'; }}
            draggable={false}
          />
        ))}
        {/* Zoom hint */}
        <div className="svc-img-zoom-hint"><ZoomIn size={14} /> View</div>
      </div>

      {images.length > 1 && (
        <>
          <button className="svc-img-arrow svc-img-arrow-left" onClick={prev} disabled={activeIdx === 0}>‹</button>
          <button className="svc-img-arrow svc-img-arrow-right" onClick={next} disabled={activeIdx === images.length - 1}>›</button>
          <div className="svc-img-dots">
            {images.map((_, i) => (
              <button key={i} className={`svc-img-dot ${i === activeIdx ? 'active' : ''}`}
                onClick={e => { e.stopPropagation(); setActiveIdx(i); }} />
            ))}
          </div>
          <div className="svc-img-counter">{activeIdx + 1} / {images.length}</div>
        </>
      )}
    </>
  );
}

/* ─────────────────────────────────────────
   Service Card — GRID view
───────────────────────────────────────── */
function ServiceCardGrid({ service, onOpenLightbox }) {
  const images = service.images?.filter(Boolean) || [];
  const price = service.discountedPrice || service.price;
  const hasDiscount = service.discountedPrice && service.discountedPrice < service.price;

  return (
    <div className="service-card card">
      <div className="service-card-img">
        <CardCarousel images={images} serviceName={service.name} onImageClick={i => onOpenLightbox(images, i)} />
        {service.category && <div className="service-category-tag">{service.category}</div>}
      </div>
      <div className="service-card-body">
        <h3 className="service-name">{service.name}</h3>
        {service.description && <p className="service-desc">{service.description}</p>}
        <div className="service-meta">
          <span className="service-duration"><Clock size={13} /> {service.duration} min</span>
          {service.rating?.count > 0 && (
            <span className="service-rating">
              <Star size={13} fill="var(--gold)" stroke="var(--gold)" /> {service.rating.average?.toFixed(1)}
            </span>
          )}
        </div>
        <div className="service-card-footer">
          <div className="service-price-wrap">
            <span className="service-price">₹{price}</span>
            {hasDiscount && <span className="service-original-price">₹{service.price}</span>}
          </div>
          <Link to={`/book/${service._id}`} className="btn btn-gold btn-sm">
            Book Now <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Service Row — LIST view
───────────────────────────────────────── */
function ServiceRowList({ service, onOpenLightbox }) {
  const images = service.images?.filter(Boolean) || [];
  const price = service.discountedPrice || service.price;
  const hasDiscount = service.discountedPrice && service.discountedPrice < service.price;

  return (
    <div className="service-list-row card">
      {/* Thumbnail */}
      <div
        className="svc-list-thumb"
        onClick={() => images.length > 0 && onOpenLightbox(images, 0)}
        style={{ cursor: images.length > 0 ? 'zoom-in' : 'default' }}
      >
        {images[0]
          ? <>
              <img src={images[0]} alt={service.name} onError={e => { e.currentTarget.style.display = 'none'; }} />
              {images.length > 1 && <div className="svc-list-img-count">+{images.length - 1}</div>}
            </>
          : <div className="svc-list-placeholder">{service.name[0]}</div>
        }
      </div>

      {/* Info */}
      <div className="svc-list-info">
        <div className="svc-list-top">
          <div>
            <h3 className="svc-list-name">{service.name}</h3>
            {service.category && <span className="svc-list-cat">{service.category}</span>}
          </div>
          <div className="svc-list-price-wrap">
            <span className="service-price">₹{price}</span>
            {hasDiscount && <span className="service-original-price">₹{service.price}</span>}
          </div>
        </div>

        {service.description && <p className="svc-list-desc">{service.description}</p>}

        <div className="svc-list-footer">
          <div className="svc-list-meta">
            <span><Clock size={13} /> {service.duration} min</span>
            {service.rating?.count > 0 && (
              <span><Star size={13} fill="var(--gold)" stroke="var(--gold)" /> {service.rating.average?.toFixed(1)} ({service.rating.count})</span>
            )}
            {service.totalBookings > 0 && <span>{service.totalBookings} bookings</span>}
          </div>
          <Link to={`/book/${service._id}`} className="btn btn-gold btn-sm">
            Book Now <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Main StorePage
───────────────────────────────────────── */
export default function StorePage() {
  const { slug } = useParams();
  const [store, setStore] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('services');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [layout, setLayout] = useState(() => localStorage.getItem('svc-layout') || 'grid'); // 'grid' | 'list'
  const [lightbox, setLightbox] = useState(null); // { images, startIdx }

  useEffect(() => { loadStore(); }, [slug]);

  async function loadStore() {
    try {
      const res = await storeAPI.getBySlug(slug);
      setStore(res.data.store);
      const [svcRes, revRes] = await Promise.all([
        serviceAPI.getByStore(res.data.store._id),
        reviewAPI.getByStore(res.data.store._id),
      ]);
      setServices(svcRes.data.services);
      setReviews(revRes.data.reviews);
    } catch {
      setStore(null);
    } finally {
      setLoading(false);
    }
  }

  const setLayoutPersist = (l) => { setLayout(l); localStorage.setItem('svc-layout', l); };
  const openLightbox = useCallback((images, startIdx) => setLightbox({ images, startIdx }), []);
  const closeLightbox = useCallback(() => setLightbox(null), []);

  if (loading) return (
    <div className="page-loading">
      <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
      <p>Loading store...</p>
    </div>
  );

  if (!store) return (
    <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
      <div className="empty-state">
        <div className="empty-state-icon">🏪</div>
        <h3>Store not found</h3>
        <p>This store may not exist or has been deactivated.</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 8 }}>Go Home</Link>
      </div>
    </div>
  );

  const categories = [...new Set(services.map(s => s.category).filter(Boolean))];
  const filtered = selectedCategory ? services.filter(s => s.category === selectedCategory) : services;

  return (
    <div className="store-page">
      {/* Banner */}
      <div className="store-banner">
        {store.banner
          ? <img src={store.banner} alt={store.name} className="store-banner-img" />
          : <div className="store-banner-placeholder" />
        }
        <div className="store-banner-overlay" />
      </div>

      {/* Store header */}
      <div className="store-header-section">
        <div className="container">
          <div className="store-header">
            <div className="store-logo-wrap" style={{ zIndex: 1 }}>
              {store.logo
                ? <img src={store.logo} alt={store.name} className="store-logo" />
                : <div className="store-logo-placeholder">{store.name[0]}</div>
              }
            </div>
            <div className="store-meta">
              <div className="store-category-badge badge badge-gold">{store.category}</div>
              <h1 className="store-name">{store.name}</h1>
              {store.description && <p className="store-desc">{store.description}</p>}
              <div className="store-stats">
                {store.rating?.count > 0 && <StarRating rating={store.rating.average} count={store.rating.count} />}
                {store.address?.city && (
                  <span className="store-location">
                    <MapPin size={14} /> {store.address.city}{store.address.state ? `, ${store.address.state}` : ''}
                  </span>
                )}
              </div>
            </div>
            <div className="store-contact">
              {store.phone && <a href={`tel:${store.phone}`} className="contact-link"><Phone size={15} /> {store.phone}</a>}
              {store.email && <a href={`mailto:${store.email}`} className="contact-link"><Mail size={15} /> {store.email}</a>}
              {store.website && <a href={store.website} target="_blank" rel="noopener" className="contact-link"><Globe size={15} /> Website</a>}
              <div className="store-social">
                {store.socialLinks?.instagram && <a href={store.socialLinks.instagram} target="_blank" rel="noopener" title="Instagram"><Link2 size={16} /></a>}
                {store.socialLinks?.facebook && <a href={store.socialLinks.facebook} target="_blank" rel="noopener" title="Facebook"><Link2 size={16} /></a>}
                {store.socialLinks?.twitter && <a href={store.socialLinks.twitter} target="_blank" rel="noopener" title="Twitter / X"><Link2 size={16} /></a>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="store-tabs-bar">
        <div className="container">
          <div className="tabs">
            <button className={`tab ${activeTab === 'services' ? 'active' : ''}`} onClick={() => setActiveTab('services')}>
              Services ({services.length})
            </button>
            <button className={`tab ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>
              Reviews ({reviews.length})
            </button>
            <button className={`tab ${activeTab === 'hours' ? 'active' : ''}`} onClick={() => setActiveTab('hours')}>
              Business Hours
            </button>
          </div>
        </div>
      </div>

      <div className="container store-body">

        {/* ── Services Tab ── */}
        {activeTab === 'services' && (
          <div className="services-tab animate-fadeIn">
            {/* Toolbar: category filter + layout toggle */}
            <div className="services-toolbar">
              <div className="category-filter">
                <button className={`cat-btn ${!selectedCategory ? 'active' : ''}`} onClick={() => setSelectedCategory('')}>All</button>
                {categories.map(c => (
                  <button key={c} className={`cat-btn ${selectedCategory === c ? 'active' : ''}`} onClick={() => setSelectedCategory(c)}>{c}</button>
                ))}
              </div>

              <div className="layout-toggle">
                <button
                  className={`layout-btn ${layout === 'grid' ? 'active' : ''}`}
                  onClick={() => setLayoutPersist('grid')}
                  title="Grid view"
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  className={`layout-btn ${layout === 'list' ? 'active' : ''}`}
                  onClick={() => setLayoutPersist('list')}
                  title="List view"
                >
                  <List size={16} />
                </button>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                <h3>No services found</h3>
                <p>This store hasn't added any services yet.</p>
              </div>
            ) : layout === 'grid' ? (
              <div className="services-grid">
                {filtered.map(s => (
                  <ServiceCardGrid key={s._id} service={s} onOpenLightbox={openLightbox} />
                ))}
              </div>
            ) : (
              <div className="services-list-view">
                {filtered.map(s => (
                  <ServiceRowList key={s._id} service={s} onOpenLightbox={openLightbox} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Reviews Tab ── */}
        {activeTab === 'reviews' && (
          <div className="reviews-tab animate-fadeIn">
            {reviews.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">💬</div>
                <h3>No reviews yet</h3>
                <p>Be the first to book and leave a review!</p>
              </div>
            ) : (
              <div className="reviews-list">
                {reviews.map(r => (
                  <div key={r._id} className="review-card card">
                    <div className="review-header">
                      <div>
                        <div className="review-author">{r.customer.name}</div>
                        <div style={{ display: 'flex', gap: 3, marginTop: 4 }}>
                          {[1, 2, 3, 4, 5].map(i => (
                            <Star key={i} size={12}
                              fill={i <= r.rating ? 'var(--gold)' : 'none'}
                              stroke={i <= r.rating ? 'var(--gold)' : 'var(--border-dark)'}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="review-date">{new Date(r.createdAt).toLocaleDateString()}</div>
                    </div>
                    {r.comment && <p className="review-comment">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Hours Tab ── */}
        {activeTab === 'hours' && (
          <div className="hours-tab animate-fadeIn">
            <div className="card" style={{ maxWidth: 400 }}>
              <h3 style={{ marginBottom: 20, fontSize: '1.3rem' }}>Business Hours</h3>
              {store.businessHours?.length > 0 ? (
                <div className="hours-list">
                  {days.map(day => {
                    const h = store.businessHours.find(b => b.day === day);
                    return (
                      <div key={day} className="hours-row">
                        <span className="hours-day">{day}</span>
                        {h?.isOpen
                          ? <span className="hours-time"><Clock size={13} /> {h.openTime} – {h.closeTime}</span>
                          : <span className="hours-closed">Closed</span>
                        }
                      </div>
                    );
                  })}
                </div>
              ) : <p style={{ color: 'var(--ink-muted)', fontSize: 14 }}>Hours not set</p>}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <Lightbox images={lightbox.images} startIdx={lightbox.startIdx} onClose={closeLightbox} />
      )}
    </div>
  );
}