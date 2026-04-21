import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { storeAPI, serviceAPI, reviewAPI } from '../api/api';
import {
  MapPin, Phone, Mail, Globe, Clock, Star, ChevronRight,
  Link2, LayoutGrid, List, X, ChevronLeft, ZoomIn,
  Search, SlidersHorizontal, Award, Calendar, ExternalLink,
  ArrowUpDown, CheckCircle2, TrendingUp, DollarSign,
} from 'lucide-react';
import './StorePage.css';
import './StoreThemes.css';

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const SORT_OPTIONS = [
  { value: 'default',     label: 'Default',          icon: <ArrowUpDown size={13}/> },
  { value: 'price_asc',   label: 'Price: Low → High', icon: <DollarSign size={13}/> },
  { value: 'price_desc',  label: 'Price: High → Low', icon: <DollarSign size={13}/> },
  { value: 'popular',     label: 'Most Popular',      icon: <TrendingUp size={13}/> },
  { value: 'rating',      label: 'Top Rated',         icon: <Star size={13}/> },
  { value: 'duration_asc',label: 'Shortest First',    icon: <Clock size={13}/> },
];

/* ─── helpers ─── */
function sortServices(list, sort) {
  const arr = [...list];
  switch (sort) {
    case 'price_asc':    return arr.sort((a, b) => (a.discountedPrice||a.price) - (b.discountedPrice||b.price));
    case 'price_desc':   return arr.sort((a, b) => (b.discountedPrice||b.price) - (a.discountedPrice||a.price));
    case 'popular':      return arr.sort((a, b) => (b.totalBookings||0) - (a.totalBookings||0));
    case 'rating':       return arr.sort((a, b) => (b.rating?.average||0) - (a.rating?.average||0));
    case 'duration_asc': return arr.sort((a, b) => a.duration - b.duration);
    default:             return arr;
  }
}

/* ════════════════════════════════════════
   Lightbox
════════════════════════════════════════ */
function Lightbox({ images, startIdx, onClose }) {
  const [idx, setIdx] = useState(startIdx);
  const [dragStartX, setDragStartX] = useState(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  const prev = useCallback(() => { setIdx(i => Math.max(0, i - 1)); setImgLoaded(false); }, []);
  const next = useCallback(() => { setIdx(i => Math.min(images.length - 1, i + 1)); setImgLoaded(false); }, [images.length]);

  useEffect(() => {
    const fn = e => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', fn);
    return () => { window.removeEventListener('keydown', fn); document.body.style.overflow = ''; };
  }, [prev, next, onClose]);

  const onDown = e => setDragStartX(e.clientX ?? e.touches?.[0]?.clientX ?? null);
  const onUp   = e => {
    if (dragStartX === null) return;
    const end = e.clientX ?? e.changedTouches?.[0]?.clientX ?? dragStartX;
    if (Math.abs(dragStartX - end) > 50) dragStartX > end ? next() : prev();
    setDragStartX(null);
  };

  return (
    <div className="lb-overlay" onClick={onClose}>
      <div className="lb-shell" onClick={e => e.stopPropagation()}
        onMouseDown={onDown} onMouseUp={onUp}
        onTouchStart={onDown} onTouchEnd={onUp}
      >
        {/* Top bar */}
        <div className="lb-topbar">
          <span className="lb-counter">{idx + 1} <span>/</span> {images.length}</span>
          <button className="lb-close-btn" onClick={onClose} aria-label="Close"><X size={18}/></button>
        </div>

        {/* Main image */}
        <div className="lb-stage">
          {!imgLoaded && <div className="lb-skeleton"/>}
          <img
            key={idx}
            src={images[idx]}
            alt={`Image ${idx + 1}`}
            className={`lb-main-img ${imgLoaded ? 'lb-img-visible' : 'lb-img-hidden'}`}
            draggable={false}
            onLoad={() => setImgLoaded(true)}
            onError={e => { e.currentTarget.src=''; setImgLoaded(true); }}
          />
        </div>

        {/* Arrow buttons */}
        {images.length > 1 && (
          <>
            <button className="lb-arrow lb-arrow-l" onClick={prev} disabled={idx===0} aria-label="Previous"><ChevronLeft size={22}/></button>
            <button className="lb-arrow lb-arrow-r" onClick={next} disabled={idx===images.length-1} aria-label="Next"><ChevronRight size={22}/></button>
          </>
        )}

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="lb-strip">
            {images.map((url, i) => (
              <button key={i} className={`lb-strip-thumb ${i===idx?'active':''}`} onClick={() => { setIdx(i); setImgLoaded(false); }}>
                <img src={url} alt="" onError={e=>{ e.currentTarget.style.opacity='0.3'; }}/>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   Card Carousel (inside service card)
════════════════════════════════════════ */
function CardCarousel({ images, serviceName, onImageClick }) {
  const [idx, setIdx] = useState(0);

  if (!images.length) {
    return (
      <div className="card-img-fallback">
        <span>{serviceName[0]}</span>
      </div>
    );
  }

  const stopPrev = e => { e.stopPropagation(); setIdx(i => Math.max(0, i-1)); };
  const stopNext = e => { e.stopPropagation(); setIdx(i => Math.min(images.length-1, i+1)); };

  return (
    <>
      <div className="carousel-strip" onClick={() => onImageClick(idx)}>
        {images.map((url, i) => (
          <img key={i} src={url} alt={`${serviceName} ${i+1}`}
            className={`carousel-slide ${i===idx?'carousel-active':''}`}
            draggable={false}
            onError={e => { e.currentTarget.style.display='none'; }}
          />
        ))}
        <div className="carousel-zoom-hint"><ZoomIn size={13}/> View</div>
      </div>
      {images.length > 1 && (
        <>
          <button className="carousel-arrow carousel-arrow-l" onClick={stopPrev} disabled={idx===0}>‹</button>
          <button className="carousel-arrow carousel-arrow-r" onClick={stopNext} disabled={idx===images.length-1}>›</button>
          <div className="carousel-dots">
            {images.map((_, i) => (
              <button key={i} className={`carousel-dot ${i===idx?'active':''}`}
                onClick={e => { e.stopPropagation(); setIdx(i); }} />
            ))}
          </div>
          <div className="carousel-badge">{idx+1}/{images.length}</div>
        </>
      )}
    </>
  );
}

/* ════════════════════════════════════════
   Service Card — GRID
════════════════════════════════════════ */
function ServiceCardGrid({ service, onOpenLightbox }) {
  const images = service.images?.filter(Boolean) || [];
  const price  = service.discountedPrice || service.price;
  const saved  = service.discountedPrice ? service.price - service.discountedPrice : 0;

  return (
    <div className="svc-card-grid">
      {/* Image */}
      <div className="svc-card-img-wrap">
        <CardCarousel images={images} serviceName={service.name} onImageClick={i => onOpenLightbox(images, i)}/>
        {service.category && <div className="svc-tag">{service.category}</div>}
        {saved > 0 && <div className="svc-sale-badge">SALE</div>}
      </div>

      {/* Body */}
      <div className="svc-card-body">
        <h3 className="svc-card-name">{service.name}</h3>
        {service.description && <p className="svc-card-desc">{service.description}</p>}

        <div className="svc-card-meta">
          <span><Clock size={11}/> {service.duration}m</span>
          {service.rating?.count > 0 && (
            <span className="svc-rating-pill">
              <Star size={11} fill="currentColor"/> {service.rating.average?.toFixed(1)}
            </span>
          )}
          {service.totalBookings > 0 && <span><CheckCircle2 size={11}/> {service.totalBookings}</span>}
        </div>

        <div className="svc-card-footer">
          <div className="svc-price-block">
            <span className="svc-price">₹{price}</span>
            {saved > 0 && <span className="svc-price-old">₹{service.price}</span>}
          </div>
          <Link to={`/book/${service._id}`} className="svc-book-btn">
            Book <ChevronRight size={12}/>
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   Service Row — LIST
════════════════════════════════════════ */
function ServiceRowList({ service, onOpenLightbox }) {
  const images = service.images?.filter(Boolean) || [];
  const price  = service.discountedPrice || service.price;
  const saved  = service.discountedPrice ? service.price - service.discountedPrice : 0;

  return (
    <div className="svc-row-list">
      {/* Thumb */}
      <div className="svc-row-thumb"
        onClick={() => images.length > 0 && onOpenLightbox(images, 0)}
        style={{ cursor: images.length > 0 ? 'zoom-in' : 'default' }}
      >
        {images[0]
          ? <>
              <img src={images[0]} alt={service.name}
                onError={e => { e.currentTarget.style.display='none'; }}/>
              <div className="carousel-zoom-hint"><ZoomIn size={12}/> View</div>
              {images.length > 1 && <div className="thumb-more-badge">+{images.length-1}</div>}
            </>
          : <div className="card-img-fallback"><span>{service.name[0]}</span></div>
        }
        {saved > 0 && <div className="svc-sale-badge">SALE</div>}
      </div>

      {/* Content */}
      <div className="svc-row-content">
        <div className="svc-row-top">
          <div className="svc-row-title-group">
            {service.category && <span className="svc-row-cat">{service.category}</span>}
            <h3 className="svc-row-name">{service.name}</h3>
          </div>
          <div className="svc-row-price-group">
            <span className="svc-price">₹{price}</span>
            {saved > 0 && <span className="svc-price-old">₹{service.price}</span>}
          </div>
        </div>

        {service.description && <p className="svc-row-desc">{service.description}</p>}

        <div className="svc-row-footer">
          <div className="svc-row-meta">
            <span><Clock size={12}/> {service.duration} min</span>
            {service.rating?.count > 0 && (
              <span className="svc-rating-pill">
                <Star size={11} fill="currentColor"/> {service.rating.average?.toFixed(1)}
                <span className="rating-count">({service.rating.count})</span>
              </span>
            )}
            {service.totalBookings > 0 && <span><CheckCircle2 size={12}/> {service.totalBookings} booked</span>}
          </div>
          <Link to={`/book/${service._id}`} className="svc-book-btn">
            Book Now <ChevronRight size={13}/>
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   Sort Dropdown
════════════════════════════════════════ */
function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = SORT_OPTIONS.find(o => o.value === value);

  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  return (
    <div className="sort-dropdown" ref={ref}>
      <button className={`sort-trigger ${open ? 'active' : ''}`} onClick={() => setOpen(p => !p)}>
        <SlidersHorizontal size={14}/>
        <span className="sort-trigger-label">{current?.label}</span>
        <ChevronRight size={12} className={`sort-chevron ${open ? 'open' : ''}`}/>
      </button>
      {open && (
        <div className="sort-menu">
          <div className="sort-menu-header">Sort by</div>
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className={`sort-item ${value === opt.value ? 'active' : ''}`}
              onClick={() => { onChange(opt.value); setOpen(false); }}
            >
              <span className="sort-item-icon">{opt.icon}</span>
              {opt.label}
              {value === opt.value && <CheckCircle2 size={13} className="sort-check"/>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   MAIN — StorePage
════════════════════════════════════════ */
export default function StorePage() {
  const { slug } = useParams();
  const [store,    setStore]    = useState(null);
  const [services, setServices] = useState([]);
  const [reviews,  setReviews]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [activeTab, setActiveTab] = useState('services');
  const [category, setCategory] = useState('');
  const [layout,   setLayout]   = useState(() => localStorage.getItem('svc-layout') || 'grid');
  const [search,   setSearch]   = useState('');
  const [sort,     setSort]     = useState('default');
  const [lightbox, setLightbox] = useState(null);
  const searchRef = useRef(null);

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
    } catch { setStore(null); }
    finally  { setLoading(false); }
  }

  const setLayoutPersist = l => { setLayout(l); localStorage.setItem('svc-layout', l); };
  const openLightbox  = useCallback((images, i) => setLightbox({ images, startIdx: i }), []);
  const closeLightbox = useCallback(() => setLightbox(null), []);

  /* Derived list with search + category + sort */
  const filtered = useMemo(() => {
    let list = services;
    if (category) list = list.filter(s => s.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.category?.toLowerCase().includes(q) ||
        s.tags?.some(t => t.toLowerCase().includes(q))
      );
    }
    return sortServices(list, sort);
  }, [services, category, search, sort]);

  const categories = useMemo(() => [...new Set(services.map(s => s.category).filter(Boolean))], [services]);

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  /* ── Loading / Not found ── */
  if (loading) return (
    <div className="sp-loading">
      <div className="sp-spinner"/>
      <p>Loading store…</p>
    </div>
  );

  if (!store) return (
    <div className="sp-not-found">
      <div className="sp-nf-icon">🏪</div>
      <h3>Store not found</h3>
      <p>This store may not exist or has been deactivated.</p>
      <Link to="/" className="sp-nf-btn">Go Home</Link>
    </div>
  );

  return (
    <div className="sp-root" data-theme={store.theme || 'classic'}>

      {/* ══ BANNER ══ */}
      <div className="sp-banner">
        {store.banner
          ? <img src={store.banner} alt={store.name} className="sp-banner-img"/>
          : <div className="sp-banner-fallback"/>
        }
        <div className="sp-banner-gradient"/>
      </div>

      {/* ══ STORE HEADER ══ */}
      <div className="sp-header-wrap">
        <div className="sp-header-inner">
          {/* Logo */}
          <div className="sp-logo-wrap">
            {store.logo
              ? <img src={store.logo} alt={store.name} className="sp-logo"/>
              : <div className="sp-logo-fallback">{store.name[0]}</div>
            }
          </div>

          {/* Main info */}
          <div className="sp-header-body">
            <div className="sp-header-left">
              {store.category && (
                <div className="sp-category-pill">
                  <Award size={11}/> {store.category}
                </div>
              )}
              <h1 className="sp-store-name">{store.name}</h1>
              {store.description && <p className="sp-store-desc">{store.description}</p>}
              <div className="sp-store-stats">
                {avgRating && (
                  <div className="sp-stat-pill sp-stat-rating">
                    <Star size={12} fill="currentColor"/>
                    {avgRating}
                    <span>({reviews.length})</span>
                  </div>
                )}
                {store.address?.city && (
                  <div className="sp-stat-pill">
                    <MapPin size={12}/> {store.address.city}{store.address.state ? `, ${store.address.state}` : ''}
                  </div>
                )}
                <div className="sp-stat-pill">
                  <Calendar size={12}/> {services.length} services
                </div>
              </div>
            </div>

          {/* Contact */}
<div className="sp-header-right">
  {store.phone && (
    <a href={`tel:${store.phone}`} className="sp-contact-btn">
      <Phone size={14}/> <span>{store.phone}</span>
    </a>
  )}

  {store.email && (
    <a href={`mailto:${store.email}`} className="sp-contact-btn">
      <Mail size={14}/> <span>{store.email}</span>
    </a>
  )}

  {store.website && (
    <a href={store.website} target="_blank" rel="noopener noreferrer" className="sp-contact-btn">
      <Globe size={14}/> <span>Website</span> <ExternalLink size={12}/>
    </a>
  )}

  {(store.socialLinks?.instagram || store.socialLinks?.facebook || store.socialLinks?.twitter) && (
    <div className="sp-social-row">

      {/* Instagram */}
      {store.socialLinks?.instagram && (
        <a href={store.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="sp-social-btn" title="Instagram">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="2" width="20" height="20" rx="5"/>
            <circle cx="12" cy="12" r="4"/>
            <circle cx="17" cy="7" r="1"/>
          </svg>
        </a>
      )}

      {/* Facebook */}
      {store.socialLinks?.facebook && (
        <a href={store.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="sp-social-btn" title="Facebook">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
          </svg>
        </a>
      )}

      {/* Twitter (X) */}
      {store.socialLinks?.twitter && (
        <a href={store.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="sp-social-btn" title="Twitter">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4l16 16M20 4L4 20"/>
          </svg>
        </a>
      )}

    </div>
  )}
</div>
          </div>
        </div>
      </div>

      {/* ══ STICKY TABS ══ */}
      <div className="sp-tabs-bar">
        <div className="sp-tabs-inner">
          {[
            { id: 'services', label: 'Services', count: services.length },
            { id: 'reviews',  label: 'Reviews',  count: reviews.length  },
            { id: 'hours',    label: 'Hours',     count: null            },
          ].map(t => (
            <button key={t.id}
              className={`sp-tab ${activeTab === t.id ? 'sp-tab-active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
              {t.count !== null && <span className={`sp-tab-count ${activeTab === t.id ? 'sp-tab-count-active' : ''}`}>{t.count}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* ══ BODY ══ */}
      <div className="sp-body">

        {/* ── SERVICES ── */}
        {activeTab === 'services' && (
          <div className="sp-services-tab">

            {/* Search + Controls bar */}
            <div className="sp-controls">
              {/* Search */}
              <div className="sp-search-wrap">
                <Search size={15} className="sp-search-icon"/>
                <input
                  ref={searchRef}
                  className="sp-search"
                  placeholder="Search services…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {search && (
                  <button className="sp-search-clear" onClick={() => { setSearch(''); searchRef.current?.focus(); }}>
                    <X size={14}/>
                  </button>
                )}
              </div>

              {/* Sort */}
              <SortDropdown value={sort} onChange={setSort}/>

              {/* Layout */}
              <div className="sp-layout-toggle">
                <button className={`sp-layout-btn ${layout==='grid'?'active':''}`} onClick={() => setLayoutPersist('grid')} title="Grid"><LayoutGrid size={15}/></button>
                <button className={`sp-layout-btn ${layout==='list'?'active':''}`} onClick={() => setLayoutPersist('list')} title="List"><List size={15}/></button>
              </div>
            </div>

            {/* Category chips */}
            {categories.length > 0 && (
              <div className="sp-category-scroll">
                <button className={`sp-cat-chip ${!category?'active':''}`} onClick={() => setCategory('')}>
                  All <span>{services.length}</span>
                </button>
                {categories.map(c => {
                  const cnt = services.filter(s => s.category === c).length;
                  return (
                    <button key={c} className={`sp-cat-chip ${category===c?'active':''}`} onClick={() => setCategory(c)}>
                      {c} <span>{cnt}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Result count */}
            {(search || category) && (
              <div className="sp-result-info">
                {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                {search && <> for "<strong>{search}</strong>"</>}
                {category && <> in <strong>{category}</strong></>}
                <button className="sp-clear-filters" onClick={() => { setSearch(''); setCategory(''); }}>Clear filters</button>
              </div>
            )}

            {/* Empty */}
            {filtered.length === 0 ? (
              <div className="sp-empty">
                <div className="sp-empty-icon">🔍</div>
                <h3>No services found</h3>
                <p>{search || category ? 'Try different search terms or clear filters.' : 'This store hasn\'t added any services yet.'}</p>
                {(search || category) && (
                  <button className="sp-nf-btn" onClick={() => { setSearch(''); setCategory(''); }}>Clear filters</button>
                )}
              </div>
            ) : layout === 'grid' ? (
              <div className="sp-grid">
                {filtered.map(s => <ServiceCardGrid key={s._id} service={s} onOpenLightbox={openLightbox}/>)}
              </div>
            ) : (
              <div className="sp-list">
                {filtered.map(s => <ServiceRowList key={s._id} service={s} onOpenLightbox={openLightbox}/>)}
              </div>
            )}
          </div>
        )}

        {/* ── REVIEWS ── */}
        {activeTab === 'reviews' && (
          <div className="sp-reviews-tab">
            {reviews.length === 0 ? (
              <div className="sp-empty">
                <div className="sp-empty-icon">💬</div>
                <h3>No reviews yet</h3>
                <p>Reviews appear after customers complete their appointments.</p>
              </div>
            ) : (
              <>
                {/* Rating summary */}
                <div className="rv-summary">
                  <div className="rv-summary-score">
                    <div className="rv-big-num">{avgRating}</div>
                    <div className="rv-stars">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} size={18}
                          fill={i<=Math.round(Number(avgRating))?'#f59e0b':'none'}
                          stroke={i<=Math.round(Number(avgRating))?'#f59e0b':'#d1d5db'}/>
                      ))}
                    </div>
                    <div className="rv-total">{reviews.length} reviews</div>
                  </div>
                  <div className="rv-dist">
                    {[5,4,3,2,1].map(n => {
                      const cnt = reviews.filter(r => r.rating === n).length;
                      const pct = Math.round(cnt/reviews.length*100);
                      return (
                        <div key={n} className="rv-dist-row">
                          <span className="rv-dist-label">{n} <Star size={11} fill="#f59e0b" stroke="#f59e0b"/></span>
                          <div className="rv-dist-bar"><div className="rv-dist-fill" style={{width:`${pct}%`}}/></div>
                          <span className="rv-dist-count">{cnt}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rv-list">
                  {reviews.map(r => (
                    <div key={r._id} className="rv-card">
                      <div className="rv-card-head">
                        <div className="rv-avatar">{r.customer.name[0]}</div>
                        <div>
                          <div className="rv-name">{r.customer.name}</div>
                          <div className="rv-stars-sm">
                            {[1,2,3,4,5].map(i => <Star key={i} size={11} fill={i<=r.rating?'#f59e0b':'none'} stroke={i<=r.rating?'#f59e0b':'#d1d5db'}/>)}
                          </div>
                        </div>
                        <span className="rv-date">{new Date(r.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</span>
                      </div>
                      {r.comment && <p className="rv-comment">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── HOURS ── */}
        {activeTab === 'hours' && (
          <div className="sp-hours-tab">
            <div className="hours-card">
              <div className="hours-card-title"><Clock size={15}/> Business Hours</div>
              {store.businessHours?.length > 0 ? (
                <div className="hours-list">
                  {WEEK_DAYS.map(day => {
                    const h = store.businessHours.find(b => b.day === day);
                    const isToday = new Date().toLocaleDateString('en-US',{weekday:'short'}) === day;
                    return (
                      <div key={day} className={`hours-row ${isToday?'hours-today':''}`}>
                        <div className="hours-day-wrap">
                          <span className="hours-day">{day}</span>
                          {isToday && <span className="today-pill">Today</span>}
                        </div>
                        {h?.isOpen
                          ? <span className="hours-time"><Clock size={12}/> {h.openTime} – {h.closeTime}</span>
                          : <span className="hours-closed">Closed</span>
                        }
                      </div>
                    );
                  })}
                </div>
              ) : <p className="hours-empty">Business hours haven't been set yet.</p>}
            </div>
          </div>
        )}

      </div>

      {/* Lightbox */}
      {lightbox && <Lightbox images={lightbox.images} startIdx={lightbox.startIdx} onClose={closeLightbox}/>}
    </div>
  );
}