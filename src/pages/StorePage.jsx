import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { storeAPI, serviceAPI, reviewAPI } from '../api/api';
import {
  MapPin, Phone, Mail, Globe, Clock, Star,
  ChevronRight, Link2, LayoutGrid, List, X,
  ChevronLeft, ZoomIn, 
  Calendar, Award, ExternalLink
} from 'lucide-react';
import './StorePage.css';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/* ─────────────────────────────────────────
   Star Rating
───────────────────────────────────────── */
function StarRating({ rating, count, size = 14 }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <Star key={i} size={size}
            fill={i <= Math.round(rating) ? '#f59e0b' : 'none'}
            stroke={i <= Math.round(rating) ? '#f59e0b' : '#d1d5db'}
          />
        ))}
      </div>
      <span className="font-semibold text-slate-800 text-sm">{rating?.toFixed(1)}</span>
      <span className="text-slate-400 text-xs">({count} reviews)</span>
    </div>
  );
}

/* ─────────────────────────────────────────
   Lightbox
───────────────────────────────────────── */
function Lightbox({ images, startIdx, onClose }) {
  const [idx, setIdx] = useState(startIdx);
  const [dragStartX, setDragStartX] = useState(null);

  const prev = useCallback(() => setIdx(i => Math.max(0, i - 1)), []);
  const next = useCallback(() => setIdx(i => Math.min(images.length - 1, i + 1)), [images.length]);

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

  const onPointerDown = (e) => setDragStartX(e.clientX ?? e.touches?.[0]?.clientX);
  const onPointerUp = (e) => {
    if (dragStartX === null) return;
    const endX = e.clientX ?? e.changedTouches?.[0]?.clientX ?? dragStartX;
    const diff = dragStartX - endX;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
    setDragStartX(null);
  };

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div className="lightbox-inner" onClick={e => e.stopPropagation()}
        onMouseDown={onPointerDown} onMouseUp={onPointerUp}
        onTouchStart={onPointerDown} onTouchEnd={onPointerUp}
      >
        {/* Close */}
        <button className="lb-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        {/* Counter top */}
        <div className="lb-counter-top">{idx + 1} / {images.length}</div>

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
            <button className="lb-arrow lb-arrow-left" onClick={prev} disabled={idx === 0} aria-label="Previous">
              <ChevronLeft size={24} />
            </button>
            <button className="lb-arrow lb-arrow-right" onClick={next} disabled={idx === images.length - 1} aria-label="Next">
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="lb-thumbs">
            {images.map((url, i) => (
              <button key={i} className={`lb-thumb ${i === idx ? 'active' : ''}`} onClick={() => setIdx(i)}>
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
    return (
      <div className="w-full h-full bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center">
        <span className="text-5xl font-bold text-amber-300">{serviceName[0]}</span>
      </div>
    );
  }

  return (
    <>
      <div className="svc-img-strip" onClick={() => onImageClick(activeIdx)} style={{ cursor: 'zoom-in' }}>
        {images.map((url, i) => (
          <img key={i} src={url} alt={`${serviceName} ${i + 1}`}
            className={`svc-img-slide ${i === activeIdx ? 'active' : ''}`}
            onError={e => { e.currentTarget.style.display = 'none'; }}
            draggable={false}
          />
        ))}
        <div className="svc-img-zoom-hint">
          <ZoomIn size={13} />
          <span>View</span>
        </div>
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
          <div className="svc-img-counter">{activeIdx + 1}/{images.length}</div>
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
    <div className="service-card-grid group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col">
      {/* Image area */}
      <div className="service-card-img relative h-48 bg-amber-50 overflow-hidden flex-shrink-0">
        <CardCarousel images={images} serviceName={service.name} onImageClick={i => onOpenLightbox(images, i)} />
        {service.category && (
          <div className="absolute top-3 left-3 z-10 bg-slate-900/70 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
            {service.category}
          </div>
        )}
        {hasDiscount && (
          <div className="absolute top-3 right-3 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
            SALE
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 sm:p-5">
        <h3 className="font-semibold text-slate-900 text-base leading-snug mb-1.5 line-clamp-2">{service.name}</h3>
        {service.description && (
          <p className="text-slate-500 text-xs leading-relaxed mb-3 line-clamp-2 flex-1">{service.description}</p>
        )}

        <div className="flex items-center gap-3 mb-4 text-slate-400 text-xs">
          <span className="flex items-center gap-1.5">
            <Clock size={12} className="text-amber-500" />
            {service.duration} min
          </span>
          {service.rating?.count > 0 && (
            <span className="flex items-center gap-1 text-slate-700 font-medium">
              <Star size={12} fill="#f59e0b" stroke="#f59e0b" />
              {service.rating.average?.toFixed(1)}
              <span className="text-slate-400 font-normal">({service.rating.count})</span>
            </span>
          )}
          {service.totalBookings > 0 && (
            <span className="flex items-center gap-1">
              <Calendar size={12} className="text-amber-500" />
              {service.totalBookings}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 mt-auto">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900">₹{price}</span>
            {hasDiscount && <span className="text-xs text-slate-400 line-through">₹{service.price}</span>}
          </div>
          <Link to={`/book/${service._id}`}
            className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs px-3 py-2 rounded-xl transition-colors duration-200 whitespace-nowrap"
          >
            Book Now <ChevronRight size={13} />
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
    <div className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex">
      {/* Thumbnail */}
      <div
        className="relative flex-shrink-0 bg-amber-50 overflow-hidden svc-list-thumb-responsive"
        onClick={() => images.length > 0 && onOpenLightbox(images, 0)}
        style={{ cursor: images.length > 0 ? 'zoom-in' : 'default' }}
      >
        {images[0]
          ? <>
              <img src={images[0]} alt={service.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={e => { e.currentTarget.style.display = 'none'; }}
              />
              {images.length > 1 && (
                <div className="absolute bottom-2 right-2 bg-slate-900/65 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                  +{images.length - 1}
                </div>
              )}
              <div className="svc-img-zoom-hint">
                <ZoomIn size={12} /><span>View</span>
              </div>
            </>
          : <div className="w-full h-full flex items-center justify-content-center justify-center">
              <span className="text-4xl font-bold text-amber-300">{service.name[0]}</span>
            </div>
        }
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-3 sm:p-4 min-w-0">
        {/* Top row */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-900 text-sm sm:text-base leading-snug truncate">{service.name}</h3>
            {service.category && (
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600">{service.category}</span>
            )}
          </div>
          <div className="flex flex-col items-end flex-shrink-0">
            <span className="text-lg sm:text-xl font-bold text-slate-900">₹{price}</span>
            {hasDiscount && <span className="text-xs text-slate-400 line-through">₹{service.price}</span>}
          </div>
        </div>

        {service.description && (
          <p className="text-slate-500 text-xs leading-relaxed mb-2 line-clamp-2 hidden sm:block">{service.description}</p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 mt-auto pt-2">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Clock size={11} className="text-amber-500" />
              {service.duration}m
            </span>
            {service.rating?.count > 0 && (
              <span className="flex items-center gap-1 text-xs text-slate-600 font-medium">
                <Star size={11} fill="#f59e0b" stroke="#f59e0b" />
                {service.rating.average?.toFixed(1)}
                <span className="text-slate-400 font-normal hidden sm:inline">({service.rating.count})</span>
              </span>
            )}
            {service.totalBookings > 0 && (
              <span className="text-xs text-slate-400 hidden sm:inline">{service.totalBookings} booked</span>
            )}
          </div>
          <Link to={`/book/${service._id}`}
            className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs px-3 py-1.5 rounded-xl transition-colors duration-200 whitespace-nowrap flex-shrink-0"
          >
            Book <ChevronRight size={12} />
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
  const [layout, setLayout] = useState(() => localStorage.getItem('svc-layout') || 'grid');
  const [lightbox, setLightbox] = useState(null);
  const tabsRef = useRef(null);

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
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
      <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
      <p className="text-slate-500 font-medium text-sm">Loading store…</p>
    </div>
  );

  if (!store) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center">
        <div className="text-6xl mb-4">🏪</div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Store not found</h3>
        <p className="text-slate-500 text-sm mb-6">This store may not exist or has been deactivated.</p>
        <Link to="/" className="inline-flex items-center gap-2 bg-slate-900 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-colors">
          Go Home
        </Link>
      </div>
    </div>
  );

  const categories = [...new Set(services.map(s => s.category).filter(Boolean))];
  const filtered = selectedCategory ? services.filter(s => s.category === selectedCategory) : services;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ══ BANNER ══ */}
      <div className="store-banner-container relative h-44 sm:h-56 md:h-72 bg-slate-900 overflow-hidden">
        {store.banner
          ? <img src={store.banner} alt={store.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full store-banner-gradient" />
        }
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent" />
      </div>

      {/* ══ STORE HEADER ══ */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="relative">
            {/* Logo — overlapping banner */}
            <div className="absolute -top-10 sm:-top-12 left-0">
              <div className="store-logo-ring">
                {store.logo
                  ? <img src={store.logo} alt={store.name} className="w-full h-full object-cover rounded-2xl" />
                  : <div className="w-full h-full bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-content-center justify-center">
                      <span className="text-white font-black text-3xl sm:text-4xl">{store.name[0]}</span>
                    </div>
                }
              </div>
            </div>

            {/* Header content */}
            <div className="pt-14 sm:pt-16 pb-5 sm:pb-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

                {/* Left: name + desc + stats */}
                <div className="flex-1 min-w-0">
                  {store.category && (
                    <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-2">
                      <Award size={11} />
                      {store.category}
                    </div>
                  )}
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight mb-1.5">{store.name}</h1>
                  {store.description && (
                    <p className="text-slate-500 text-sm leading-relaxed max-w-xl mb-3">{store.description}</p>
                  )}

                  {/* Stats row */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    {store.rating?.count > 0 && (
                      <StarRating rating={store.rating.average} count={store.rating.count} />
                    )}
                    {store.address?.city && (
                      <span className="flex items-center gap-1.5 text-slate-400 text-xs">
                        <MapPin size={12} className="text-amber-500" />
                        {store.address.city}{store.address.state ? `, ${store.address.state}` : ''}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 text-slate-400 text-xs">
                      <Calendar size={12} className="text-amber-500" />
                      {services.length} services
                    </span>
                  </div>
                </div>

                {/* Right: contact */}
                <div className="flex flex-row sm:flex-col gap-2 sm:gap-2 flex-wrap sm:flex-nowrap sm:items-end">
                  {store.phone && (
                    <a href={`tel:${store.phone}`}
                      className="flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-amber-600 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-200 px-3 py-2 rounded-xl transition-all duration-200">
                      <Phone size={13} className="text-amber-500" />
                      <span className="hidden sm:inline">{store.phone}</span>
                      <span className="sm:hidden">Call</span>
                    </a>
                  )}
                  {store.email && (
                    <a href={`mailto:${store.email}`}
                      className="flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-amber-600 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-200 px-3 py-2 rounded-xl transition-all duration-200">
                      <Mail size={13} className="text-amber-500" />
                      <span className="hidden sm:inline truncate max-w-[160px]">{store.email}</span>
                      <span className="sm:hidden">Email</span>
                    </a>
                  )}
                  {store.website && (
                    <a href={store.website} target="_blank" rel="noopener"
                      className="flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-amber-600 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-200 px-3 py-2 rounded-xl transition-all duration-200">
                      <Globe size={13} className="text-amber-500" />
                      <ExternalLink size={11} />
                    </a>
                  )}
                  {/* Social */}
                  {(store.socialLinks?.instagram || store.socialLinks?.facebook || store.socialLinks?.twitter) && (
                    <div className="flex gap-1.5">
                      {store.socialLinks?.instagram && (
                        <a href={store.socialLinks.instagram} target="_blank" rel="noopener"
                          className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-400 hover:text-amber-500 hover:border-amber-200 transition-all">
                          <Link2 size={14} />
                        </a>
                      )}
                      {store.socialLinks?.facebook && (
                        <a href={store.socialLinks.facebook} target="_blank" rel="noopener"
                          className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-400 hover:text-amber-500 hover:border-amber-200 transition-all">
                          <Link2 size={14} />
                        </a>
                      )}
                      {store.socialLinks?.twitter && (
                        <a href={store.socialLinks.twitter} target="_blank" rel="noopener"
                          className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-400 hover:text-amber-500 hover:border-amber-200 transition-all">
                          <Link2 size={14} />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ TABS BAR ══ */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm" ref={tabsRef}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex gap-0 overflow-x-auto scrollbar-none">
            {[
              { id: 'services', label: 'Services', count: services.length },
              { id: 'reviews', label: 'Reviews', count: reviews.length },
              { id: 'hours', label: 'Hours', count: null },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`store-tab flex-shrink-0 flex items-center gap-2 px-4 sm:px-5 py-4 text-sm font-semibold transition-colors duration-200 border-b-2 whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }`}
              >
                {tab.label}
                {tab.count !== null && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                    ${activeTab === tab.id ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ══ BODY ══ */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-20">

        {/* ─── SERVICES TAB ─── */}
        {activeTab === 'services' && (
          <div className="animate-fadeIn">

            {/* Toolbar */}
            <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
              {/* Category filter — scrollable on mobile */}
              <div className="category-scroll flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 flex-1 min-w-0">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-200
                    ${!selectedCategory ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-700'}`}
                >
                  All <span className="opacity-60 ml-1">{services.length}</span>
                </button>
                {categories.map(c => (
                  <button
                    key={c}
                    onClick={() => setSelectedCategory(c)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-200
                      ${selectedCategory === c ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-700'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              {/* Layout toggle */}
              <div className="flex-shrink-0 flex items-center gap-0 bg-white border border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setLayoutPersist('grid')}
                  className={`flex items-center justify-center px-3 py-2.5 transition-all duration-200
                    ${layout === 'grid' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'}`}
                  title="Grid view"
                >
                  <LayoutGrid size={15} />
                </button>
                <div className="w-px h-5 bg-slate-200" />
                <button
                  onClick={() => setLayoutPersist('list')}
                  className={`flex items-center justify-center px-3 py-2.5 transition-all duration-200
                    ${layout === 'list' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'}`}
                  title="List view"
                >
                  <List size={15} />
                </button>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">No services found</h3>
                <p className="text-slate-400 text-sm">This store hasn't added any services yet.</p>
              </div>
            ) : layout === 'grid' ? (
              /* GRID */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {filtered.map(s => (
                  <ServiceCardGrid key={s._id} service={s} onOpenLightbox={openLightbox} />
                ))}
              </div>
            ) : (
              /* LIST */
              <div className="flex flex-col gap-3">
                {filtered.map(s => (
                  <ServiceRowList key={s._id} service={s} onOpenLightbox={openLightbox} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── REVIEWS TAB ─── */}
        {activeTab === 'reviews' && (
          <div className="animate-fadeIn max-w-2xl">
            {reviews.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">💬</div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">No reviews yet</h3>
                <p className="text-slate-400 text-sm">Be the first to book and leave a review!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {reviews.map(r => (
                  <div key={r._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-bold text-slate-900 text-sm mb-1">{r.customer.name}</div>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map(i => (
                            <Star key={i} size={12}
                              fill={i <= r.rating ? '#f59e0b' : 'none'}
                              stroke={i <= r.rating ? '#f59e0b' : '#d1d5db'}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    {r.comment && <p className="text-slate-600 text-sm leading-relaxed">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── HOURS TAB ─── */}
        {activeTab === 'hours' && (
          <div className="animate-fadeIn max-w-sm">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-5 pt-5 pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock size={16} className="text-amber-500" />
                  Business Hours
                </h3>
              </div>
              {store.businessHours?.length > 0 ? (
                <div className="divide-y divide-slate-50">
                  {days.map(day => {
                    const h = store.businessHours.find(b => b.day === day);
                    const isToday = new Date().toLocaleDateString('en-US', { weekday: 'short' }) === day;
                    return (
                      <div key={day} className={`flex justify-between items-center px-5 py-3 ${isToday ? 'bg-amber-50' : ''}`}>
                        <span className={`text-sm font-semibold ${isToday ? 'text-amber-700' : 'text-slate-700'}`}>
                          {day}
                          {isToday && <span className="ml-2 text-[10px] font-bold text-amber-600 uppercase tracking-wide">Today</span>}
                        </span>
                        {h?.isOpen
                          ? <span className="text-sm text-slate-500 flex items-center gap-1.5">
                              <Clock size={12} className="text-amber-400" />
                              {h.openTime} – {h.closeTime}
                            </span>
                          : <span className="text-xs font-semibold text-red-400 bg-red-50 px-2 py-0.5 rounded-full">Closed</span>
                        }
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-slate-400 text-sm px-5 py-6">Hours not set by this store.</p>
              )}
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