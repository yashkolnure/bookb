import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import {
  Calendar, Zap, Shield, TrendingUp, ChevronRight,
  Check, ArrowRight, Smartphone, Layers, Plus, Minus,
  Play, ShieldCheck, CreditCard, Star, X, MessageCircle,
  Clock, Users, DollarSign, Bell, Globe, Award, ChevronDown, Menu
} from 'lucide-react';

/* ─── Language Picker (landing page) ─── */
const LANDING_LANGS = [
  { code: 'en', label: 'English' }, { code: 'hi', label: 'हिंदी' },
  { code: 'bn', label: 'বাংলা' }, { code: 'te', label: 'తెలుగు' },
  { code: 'mr', label: 'मराठी' }, { code: 'ta', label: 'தமிழ்' },
  { code: 'gu', label: 'ગુજરાતી' }, { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'മലയാളം' }, { code: 'or', label: 'ଓଡ଼ିଆ' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ' }, { code: 'ur', label: 'اردو' },
  { code: 'as', label: 'অসমীয়া' }, { code: 'ne', label: 'नेपाली' },
];

/* Normalise 'en-US' → 'en', 'hi-IN' → 'hi', etc. */
const normLng = (lng) => (lng || 'en').split('-')[0];

function LandingLangPicker({ dark = false }) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const activeLng = normLng(i18n.language);
  const current = LANDING_LANGS.find(l => l.code === activeLng) || LANDING_LANGS[0];

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = (l) => {
    i18n.changeLanguage(l.code);
    toast.success(`🌐 Language set to ${l.label}`, { duration: 2500, id: 'lang-change' });
    setOpen(false);
  };

  const btnStyle = {
    display: 'flex', alignItems: 'center', gap: 5,
    padding: '7px 11px', borderRadius: 8, cursor: 'pointer',
    fontSize: 13, fontWeight: 600, border: 'none',
    background: dark ? 'rgba(255,255,255,0.10)' : 'rgba(15,23,42,0.06)',
    color: dark ? '#fff' : '#334155',
    transition: 'background 0.2s',
  };

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button onClick={() => setOpen(p => !p)} style={btnStyle}>
        <Globe size={14} />
        <span>{current.label}</span>
        <ChevronDown size={12} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0,
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12,
          boxShadow: '0 8px 28px rgba(0,0,0,0.13)', minWidth: 160, zIndex: 500,
          maxHeight: 280, overflowY: 'auto',
        }}>
          {LANDING_LANGS.map(l => (
            <button
              key={l.code}
              onClick={() => handleChange(l)}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '9px 16px',
                background: activeLng === l.code ? '#fef3c7' : 'none',
                border: 'none', borderBottom: '1px solid #f1f5f9',
                cursor: 'pointer', fontSize: 13,
                fontWeight: activeLng === l.code ? 700 : 400,
                color: '#0f172a',
              }}
            >
              {activeLng === l.code && <span style={{ marginRight: 6, fontSize: 11 }}>✓</span>}
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Google Fonts ─── */
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --amber: #f59e0b;
      --amber-light: #fef3c7;
      --amber-dark: #d97706;
      --slate-900: #0f172a;
      --slate-700: #334155;
      --slate-500: #64748b;
      --slate-200: #e2e8f0;
      --slate-50: #f8fafc;
      --green: #10b981;
      --white: #ffffff;
    }

    body { font-family: 'DM Sans', sans-serif; }

    .font-display { font-family: 'Bricolage Grotesque', sans-serif; }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulse-ring {
      0%   { box-shadow: 0 0 0 0 rgba(245,158,11,0.4); }
      70%  { box-shadow: 0 0 0 12px rgba(245,158,11,0); }
      100% { box-shadow: 0 0 0 0 rgba(245,158,11,0); }
    }
    @keyframes ticker {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    @keyframes shimmer {
      0%   { background-position: -200% center; }
      100% { background-position: 200% center; }
    }

    .animate-float   { animation: float 4s ease-in-out infinite; }
    .animate-fade-up { animation: fadeUp 0.6s ease forwards; }
    .animate-ticker  { animation: ticker 30s linear infinite; }

    .delay-100 { animation-delay: 0.1s; }
    .delay-200 { animation-delay: 0.2s; }
    .delay-300 { animation-delay: 0.3s; }
    .delay-400 { animation-delay: 0.4s; }

    .gradient-text {
      background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-bg {
      background: radial-gradient(ellipse 80% 60% at 60% -10%, rgba(245,158,11,0.12) 0%, transparent 60%),
                  radial-gradient(ellipse 60% 40% at -10% 60%, rgba(245,158,11,0.06) 0%, transparent 50%),
                  #f8fafc;
    }

    .card-hover {
      transition: all 0.25s ease;
    }
    .card-hover:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.08);
    }

    .sticky-bar-visible { transform: translateY(0); }
    .sticky-bar-hidden  { transform: translateY(-100%); }

    .whatsapp-btn {
      position: fixed;
      bottom: 28px;
      right: 28px;
      z-index: 999;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #25d366;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(37,211,102,0.45);
      cursor: pointer;
      animation: pulse-ring 2.5s ease-out infinite;
      transition: transform 0.2s;
      border: none;
    }
    .whatsapp-btn:hover { transform: scale(1.1); }

    .noise-overlay::before {
      content: '';
      position: absolute;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
      pointer-events: none;
      z-index: 0;
    }

    .plan-popular {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: white;
    }
    .plan-popular .plan-price,
    .plan-popular .plan-name { color: white !important; }
    .plan-popular .feature-item { color: rgba(255,255,255,0.8) !important; }

    .step-line::after {
      content: '';
      position: absolute;
      top: 28px;
      left: calc(50% + 28px);
      width: calc(100% - 56px);
      height: 2px;
      background: linear-gradient(90deg, #f59e0b, rgba(245,158,11,0.1));
    }

    /* ── Mobile nav menu ── */
    .mobile-menu {
      display: none;
      flex-direction: column;
      gap: 0;
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: rgba(255,255,255,0.98);
      border-bottom: 1px solid #e2e8f0;
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      padding: 8px 0 16px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.08);
    }
    .mobile-menu.open { display: flex; }
    .mobile-menu a {
      padding: 12px 24px;
      font-size: 15px;
      font-weight: 500;
      color: #334155;
      text-decoration: none;
      border-bottom: 1px solid #f1f5f9;
    }
    .mobile-menu a:last-child { border-bottom: none; }

    @media (max-width: 767px) {
      .whatsapp-btn { bottom: 16px; right: 16px; width: 48px; height: 48px; }
    }
  `}</style>
);

/* ─── Data ─── */
const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Fitness Coach, Mumbai',
    avatar: 'PS',
    color: '#fde68a',
    text: 'I went from chasing clients on WhatsApp to fully automated bookings in 2 days. My revenue jumped 40% in the first month.',
    stars: 5,
  },
  {
    name: 'Rohan Mehta',
    role: 'Hair Salon Owner, Pune',
    avatar: 'RM',
    color: '#bbf7d0',
    text: 'No-shows dropped to almost zero after SMS reminders. BookEase paid for itself in the very first week.',
    stars: 5,
  },
  {
    name: 'Ananya Iyer',
    role: 'Business Consultant, Bengaluru',
    avatar: 'AI',
    color: '#bfdbfe',
    text: 'My clients love the clean booking experience. The Stripe integration is seamless and I get paid before every session.',
    stars: 5,
  },
  {
    name: 'Karan Desai',
    role: 'Yoga Instructor, Delhi',
    avatar: 'KD',
    color: '#fecaca',
    text: "I'm not tech-savvy at all and had my store live in under 10 minutes. The calendar sync alone saves me 2 hours a week.",
    stars: 5,
  },
];

const FEATURE_ICONS = [
  <Zap size={22} />,
  <Calendar size={22} />,
  <DollarSign size={22} />,
  <Bell size={22} />,
  <TrendingUp size={22} />,
  <Smartphone size={22} />,
];

const STEP_ICONS = [
  <Globe size={28} />,
  <ArrowRight size={28} />,
  <CreditCard size={28} />,
];

const USE_CASE_EMOJIS = ['💆', '🏋️', '📸', '🧑‍💼', '🎓', '✂️', '🧘', '🩺'];

/* ─── Main Component ─── */
const LandingPage = () => {
  const { t } = useTranslation();

  const features = [
    { icon: FEATURE_ICONS[0], title: t('landing.f1Title'), desc: t('landing.f1Desc'), outcome: t('landing.f1Out') },
    { icon: FEATURE_ICONS[1], title: t('landing.f2Title'), desc: t('landing.f2Desc'), outcome: t('landing.f2Out') },
    { icon: FEATURE_ICONS[2], title: t('landing.f3Title'), desc: t('landing.f3Desc'), outcome: t('landing.f3Out') },
    { icon: FEATURE_ICONS[3], title: t('landing.f4Title'), desc: t('landing.f4Desc'), outcome: t('landing.f4Out') },
    { icon: FEATURE_ICONS[4], title: t('landing.f5Title'), desc: t('landing.f5Desc'), outcome: t('landing.f5Out') },
    { icon: FEATURE_ICONS[5], title: t('landing.f6Title'), desc: t('landing.f6Desc'), outcome: t('landing.f6Out') },
  ];

  const steps = [
    { num: '01', icon: STEP_ICONS[0], title: t('landing.s1Title'), desc: t('landing.s1Desc') },
    { num: '02', icon: STEP_ICONS[1], title: t('landing.s2Title'), desc: t('landing.s2Desc') },
    { num: '03', icon: STEP_ICONS[2], title: t('landing.s3Title'), desc: t('landing.s3Desc') },
  ];

  const plans = [
    {
      name: t('landing.starterName'), price: '0', tag: t('landing.starterTag'),
      features: [t('landing.starterF1'), t('landing.starterF2'), t('landing.starterF3'), t('landing.starterF4'), t('landing.starterF5')],
      days: '/ 7 days', popular: false, cta: t('landing.starterCta'),
    },
    {
      name: t('landing.proName'), price: '899', tag: t('landing.proTag'),
      features: [t('landing.proF1'), t('landing.proF2'), t('landing.proF3'), t('landing.proF4'), t('landing.proF5'), t('landing.proF6')],
      days: '/ 1 month', popular: true, cta: t('landing.proCta'),
    },
    {
      name: t('landing.bizName'), price: '4999', tag: t('landing.bizTag'),
      features: [t('landing.bizF1'), t('landing.bizF2'), t('landing.bizF3'), t('landing.bizF4'), t('landing.bizF5'), t('landing.bizF6')],
      days: '/ 1 year', popular: false, cta: t('landing.bizCta'),
    },
  ];

  const faqs = [
    { q: t('landing.faq1q'), a: t('landing.faq1a') },
    { q: t('landing.faq2q'), a: t('landing.faq2a') },
    { q: t('landing.faq3q'), a: t('landing.faq3a') },
    { q: t('landing.faq4q'), a: t('landing.faq4a') },
    { q: t('landing.faq5q'), a: t('landing.faq5a') },
  ];

  const useCases = USE_CASE_EMOJIS.map((emoji, i) => ({
    emoji,
    label: t(`landing.uc${i + 1}`),
  }));

  const [activeFaq, setActiveFaq] = useState(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [exitPopupDismissed, setExitPopupDismissed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const onScroll = () => setShowStickyBar(window.scrollY > 500);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onMouseLeave = (e) => {
      if (e.clientY < 20 && !exitPopupDismissed) setShowExitPopup(true);
    };
    document.addEventListener('mouseleave', onMouseLeave);
    return () => document.removeEventListener('mouseleave', onMouseLeave);
  }, [exitPopupDismissed]);

  const sectionPad = isMobile ? '64px 16px' : '96px 24px';
  const sectionPadSm = isMobile ? '48px 16px' : '72px 24px';

  return (
    <>
      <FontLoader />

      {/* ── STICKY TOP BAR ── */}
      <div
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 999,
          background: 'linear-gradient(90deg, #0f172a 0%, #1e293b 100%)',
          padding: isMobile ? '10px 16px' : '12px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: isMobile ? 10 : 16,
          flexWrap: 'wrap',
          transition: 'transform 0.35s ease',
          transform: showStickyBar ? 'translateY(0)' : 'translateY(-100%)',
          boxShadow: '0 2px 20px rgba(0,0,0,0.25)',
        }}
      >
        <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: isMobile ? 12 : 14, fontFamily: 'Bricolage Grotesque, sans-serif', textAlign: 'center' }}>
          {t('landing.stickyOffer')}
        </span>
        <Link to="/register" style={{
          background: '#f59e0b', color: '#0f172a',
          padding: isMobile ? '6px 16px' : '8px 20px', borderRadius: 999,
          fontWeight: 800, fontSize: isMobile ? 12 : 13, textDecoration: 'none',
          fontFamily: 'Bricolage Grotesque, sans-serif',
          transition: 'background 0.2s',
          whiteSpace: 'nowrap',
        }}>
          {t('landing.stickyCta')}
        </Link>
      </div>

      {/* ── EXIT INTENT POPUP ── */}
      {showExitPopup && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24,
        }}>
          <div style={{
            background: '#fff', borderRadius: 24, padding: isMobile ? 28 : 40, maxWidth: 480, width: '100%',
            boxShadow: '0 40px 80px rgba(0,0,0,0.2)',
            textAlign: 'center', position: 'relative',
            fontFamily: 'DM Sans, sans-serif',
          }}>
            <button
              onClick={() => { setShowExitPopup(false); setExitPopupDismissed(true); }}
              style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            >
              <X size={20} />
            </button>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎁</div>
            <h3 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: isMobile ? 22 : 26, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
              {t('landing.exitTitle')}
            </h3>
            <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>
              {t('landing.exitDesc')}
            </p>
            <Link to="/register" onClick={() => setShowExitPopup(false)} style={{
              display: 'block', background: '#f59e0b', color: '#0f172a',
              padding: '14px 32px', borderRadius: 14, fontWeight: 800,
              fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 16,
              textDecoration: 'none', marginBottom: 12,
            }}>
              {t('landing.exitCta')}
            </Link>
            <button
              onClick={() => { setShowExitPopup(false); setExitPopupDismissed(true); }}
              style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 13, cursor: 'pointer' }}
            >
              {t('landing.exitNo')}
            </button>
          </div>
        </div>
      )}

      <div style={{ fontFamily: 'DM Sans, sans-serif', color: '#0f172a', background: '#f8fafc', overflowX: 'hidden' }}>

        {/* ══════════════════ NAVIGATION ══════════════════ */}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 100,
          borderBottom: '1px solid rgba(226,232,240,0.8)',
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}>
          <div style={{
            maxWidth: 1200, margin: '0 auto',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: isMobile ? '14px 16px' : '16px 24px',
            position: 'relative',
          }}>
            <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 26, fontWeight: 800, color: '#0f172a' }}>
              Book<span style={{ color: '#f59e0b' }}>Ease</span>
            </div>

            {/* Desktop nav links */}
            {!isMobile && (
              <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
                <a href="#features" style={{ fontSize: 14, fontWeight: 500, color: '#64748b', textDecoration: 'none' }}>{t('landing.navFeatures')}</a>
                <a href="#how-it-works" style={{ fontSize: 14, fontWeight: 500, color: '#64748b', textDecoration: 'none' }}>{t('landing.navHowItWorks')}</a>
                <a href="#pricing" style={{ fontSize: 14, fontWeight: 500, color: '#64748b', textDecoration: 'none' }}>{t('landing.navPricing')}</a>
                <a href="#faq" style={{ fontSize: 14, fontWeight: 500, color: '#64748b', textDecoration: 'none' }}>{t('landing.navFaq')}</a>
              </div>
            )}

            <div style={{ display: 'flex', gap: isMobile ? 8 : 12, alignItems: 'center' }}>
              {!isMobile && <LandingLangPicker />}
              {!isMobile && (
                <Link to="/login" style={{ fontSize: 14, fontWeight: 600, color: '#334155', textDecoration: 'none' }}>{t('landing.navSignIn')}</Link>
              )}
              <Link to="/register" style={{
                background: '#0f172a', color: '#fff',
                padding: isMobile ? '9px 16px' : '10px 22px', borderRadius: 999,
                fontSize: isMobile ? 13 : 14, fontWeight: 700, textDecoration: 'none',
                fontFamily: 'Bricolage Grotesque, sans-serif',
                boxShadow: '0 4px 14px rgba(15,23,42,0.18)',
                whiteSpace: 'nowrap',
              }}>
                {isMobile ? t('landing.navGetStartedMobile') : t('landing.navGetStarted')}
              </Link>
              {/* Mobile hamburger */}
              {isMobile && (
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#334155', padding: 4, display: 'flex', alignItems: 'center' }}
                >
                  <Menu size={22} />
                </button>
              )}
            </div>

            {/* Mobile dropdown menu */}
            {isMobile && (
              <div className={`mobile-menu${mobileMenuOpen ? ' open' : ''}`}>
                <a href="#features" onClick={() => setMobileMenuOpen(false)}>{t('landing.navFeatures')}</a>
                <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>{t('landing.navHowItWorks')}</a>
                <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>{t('landing.navPricing')}</a>
                <a href="#faq" onClick={() => setMobileMenuOpen(false)}>{t('landing.navFaq')}</a>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} style={{ padding: '12px 24px', fontSize: 15, fontWeight: 500, color: '#334155', textDecoration: 'none', borderBottom: '1px solid #f1f5f9' }}>{t('landing.navSignIn')}</Link>
                <div style={{ padding: '12px 24px', borderBottom: '1px solid #f1f5f9' }}>
                  <LandingLangPicker />
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* ══════════════════ HERO ══════════════════ */}
        <section className="hero-bg" style={{ padding: isMobile ? '56px 16px 48px' : '96px 24px 80px', position: 'relative', overflow: 'hidden' }}>
          {/* Decorative blobs */}
          <div style={{
            position: 'absolute', top: -100, right: -100, width: isMobile ? 280 : 500, height: isMobile ? 280 : 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: -50, left: -80, width: isMobile ? 200 : 350, height: isMobile ? 200 : 350,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{
            maxWidth: 1200, margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? 40 : 64,
            alignItems: 'center',
          }}>
            <div style={{ animation: 'fadeUp 0.7s ease forwards' }}>
              {/* Badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#fef3c7', border: '1px solid rgba(245,158,11,0.3)',
                borderRadius: 999, padding: '6px 14px',
                fontSize: isMobile ? 12 : 13, fontWeight: 600, color: '#92400e', marginBottom: 24,
              }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', display: 'inline-block', animation: 'pulse-ring 2s ease-out infinite' }} />
                {t('landing.heroBadge')}
              </div>

              <h1 style={{
                fontFamily: 'Bricolage Grotesque, sans-serif',
                fontSize: 'clamp(36px, 5vw, 68px)',
                fontWeight: 800, lineHeight: 1.08,
                color: '#0f172a', marginBottom: 24,
                letterSpacing: '-1.5px',
              }}>
                {t('landing.heroH1')}<br />
                <span style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  {t('landing.heroH1b')}
                </span>
              </h1>

              <p style={{ fontSize: isMobile ? 16 : 18, lineHeight: 1.7, color: '#475569', maxWidth: 480, marginBottom: 36 }}>
                {t('landing.heroDesc')}
              </p>

              <div style={{ display: 'flex', gap: isMobile ? 12 : 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
                <Link to="/register" style={{
                  background: '#f59e0b', color: '#0f172a',
                  padding: isMobile ? '14px 24px' : '16px 32px', borderRadius: 14,
                  fontSize: isMobile ? 15 : 16, fontWeight: 800, textDecoration: 'none',
                  fontFamily: 'Bricolage Grotesque, sans-serif',
                  boxShadow: '0 8px 28px rgba(245,158,11,0.4)',
                  transition: 'all 0.2s',
                }}>
                  {t('landing.heroCta1')}
                </Link>
                <Link to="/demo" style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  fontSize: 14, fontWeight: 700, color: '#0f172a', textDecoration: 'none',
                }}>
                  <span style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: '#fff', border: '1px solid #e2e8f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    flexShrink: 0,
                  }}>
                    <Play size={16} fill="#0f172a" />
                  </span>
                  {t('landing.heroCta2')}
                </Link>
              </div>

              {/* Social proof row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ display: 'flex' }}>
                  {['#fde68a', '#bbf7d0', '#bfdbfe', '#fecaca'].map((c, i) => (
                    <div key={i} style={{
                      width: 36, height: 36, borderRadius: '50%',
                      border: '2.5px solid #fff',
                      background: c, marginLeft: i ? -10 : 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700, color: '#0f172a',
                    }}>
                      {['PS', 'RM', 'AI', 'KD'][i]}
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ display: 'flex', gap: 2, marginBottom: 2 }}>
                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />)}
                  </div>
                  <p style={{ fontSize: 13, color: '#64748b' }}>
                    <strong style={{ color: '#0f172a' }}>4.9/5</strong> {t('landing.heroSocial')}
                  </p>
                </div>
              </div>
            </div>

            {/* Hero card */}
            <div style={{ position: 'relative', animation: 'fadeUp 0.7s 0.2s ease both' }}>
              <div style={{
                background: '#fff', borderRadius: 24,
                padding: isMobile ? 18 : 24, boxShadow: '0 30px 80px rgba(0,0,0,0.12)',
                border: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden',
              }}>
                {/* Mock booking UI */}
                <div style={{ background: '#0f172a', borderRadius: 14, padding: '16px 20px', marginBottom: 16 }}>
                  <p style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Your BookEase Store</p>
                  <p style={{ color: '#fbbf24', fontSize: 14, fontWeight: 700, fontFamily: 'Bricolage Grotesque, sans-serif' }}>bookease.io/priya-sharma</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                  {[
                    { label: 'Bookings Today', val: '8', up: true },
                    { label: 'Revenue (MTD)', val: '₹32,400', up: true },
                    { label: 'No-shows', val: '0', up: false },
                    { label: 'New Clients', val: '5', up: true },
                  ].map((s, i) => (
                    <div key={i} style={{ background: '#f8fafc', borderRadius: 12, padding: '14px 16px', border: '1px solid #e2e8f0' }}>
                      <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 4 }}>{s.label}</p>
                      <p style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: '#0f172a', fontFamily: 'Bricolage Grotesque, sans-serif' }}>{s.val}</p>
                    </div>
                  ))}
                </div>
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <CreditCard size={18} color="#16a34a" />
                  </div>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: 0.5 }}>New Booking Confirmed</p>
                    <p style={{ fontSize: isMobile ? 13 : 15, fontWeight: 800, color: '#0f172a', fontFamily: 'Bricolage Grotesque, sans-serif' }}>+₹2,400 received • Rahul M.</p>
                  </div>
                </div>
              </div>

              {/* Floating badges — hidden on mobile to avoid overflow */}
              {!isMobile && (
                <>
                  <div className="animate-float" style={{
                    position: 'absolute', top: -20, right: -20,
                    background: '#fff', borderRadius: 16, padding: '12px 16px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <span style={{ fontSize: 20 }}>⚡</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Live in 60 sec</span>
                  </div>
                  <div style={{
                    position: 'absolute', bottom: -16, left: -20,
                    background: '#0f172a', borderRadius: 16, padding: '12px 18px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <ShieldCheck size={18} color="#f59e0b" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>0% commission</span>
                  </div>
                </>
              )}

              {/* Mobile inline badges */}
              {isMobile && (
                <div style={{ display: 'flex', gap: 10, marginTop: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <div style={{
                    background: '#fff', borderRadius: 12, padding: '10px 14px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <span style={{ fontSize: 16 }}>⚡</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>Live in 60 sec</span>
                  </div>
                  <div style={{
                    background: '#0f172a', borderRadius: 12, padding: '10px 14px',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <ShieldCheck size={14} color="#f59e0b" />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>0% commission</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ══════════════════ STATS TICKER ══════════════════ */}
        <div style={{ background: '#0f172a', padding: '14px 0', overflow: 'hidden' }}>
          <div className="animate-ticker" style={{ display: 'flex', gap: 64, whiteSpace: 'nowrap', width: 'max-content' }}>
            {[
              '🚀 10,000+ bookings processed this week',
              '💰 ₹5 Cr+ in payments facilitated',
              '⭐ 4.9/5 average rating from professionals',
              '📉 80% reduction in no-shows',
              '🌍 2,000+ service professionals across India',
              '⚡ Average setup time: 4 minutes',
              '🚀 10,000+ bookings processed this week',
              '💰 ₹5 Cr+ in payments facilitated',
              '⭐ 4.9/5 average rating from professionals',
              '📉 80% reduction in no-shows',
              '🌍 2,000+ service professionals across India',
              '⚡ Average setup time: 4 minutes',
            ].map((item, i) => (
              <span key={i} style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.7)', fontFamily: 'DM Sans, sans-serif' }}>
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* ══════════════════ PROBLEM → SOLUTION ══════════════════ */}
        <section style={{ padding: isMobile ? '56px 16px' : '96px 24px', background: '#fff' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: isMobile ? 40 : 64 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: 2 }}>{t('landing.probLabel')}</span>
              <h2 style={{
                fontFamily: 'Bricolage Grotesque, sans-serif',
                fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 800, color: '#0f172a',
                marginTop: 8, letterSpacing: '-1px',
              }}>
                {t('landing.probTitle')}
              </h2>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr auto 1fr',
              gap: isMobile ? 24 : 40,
              alignItems: isMobile ? 'stretch' : 'center',
            }}>
              {/* Pain points */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {isMobile && (
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{t('landing.probCol')}</p>
                )}
                {[
                  { emoji: '😩', text: t('landing.pain1') },
                  { emoji: '💸', text: t('landing.pain2') },
                  { emoji: '📅', text: t('landing.pain3') },
                  { emoji: '⏰', text: t('landing.pain4') },
                  { emoji: '😰', text: t('landing.pain5') },
                ].map((p, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    background: '#fef2f2', border: '1px solid #fecaca',
                    borderRadius: 14, padding: isMobile ? '12px 14px' : '14px 18px',
                  }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{p.emoji}</span>
                    <span style={{ fontSize: isMobile ? 13 : 14, color: '#7f1d1d', fontWeight: 500, lineHeight: 1.4 }}>{p.text}</span>
                  </div>
                ))}
              </div>

              {/* Arrow */}
              <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'row' : 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                margin: isMobile ? '8px 0' : 0,
              }}>
                <div style={{
                  width: isMobile ? 44 : 56, height: isMobile ? 44 : 56, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(245,158,11,0.4)',
                  flexShrink: 0,
                  transform: isMobile ? 'rotate(90deg)' : 'none',
                }}>
                  <ArrowRight size={isMobile ? 20 : 24} color="#fff" />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' }}>
                  Book{isMobile ? ' ' : <br />}Ease
                </span>
              </div>

              {/* Solutions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {isMobile && (
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{t('landing.solCol')}</p>
                )}
                {[
                  { emoji: '✅', text: t('landing.sol1') },
                  { emoji: '📲', text: t('landing.sol2') },
                  { emoji: '📆', text: t('landing.sol3') },
                  { emoji: '💳', text: t('landing.sol4') },
                  { emoji: '📊', text: t('landing.sol5') },
                ].map((s, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    background: '#f0fdf4', border: '1px solid #bbf7d0',
                    borderRadius: 14, padding: isMobile ? '12px 14px' : '14px 18px',
                  }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{s.emoji}</span>
                    <span style={{ fontSize: isMobile ? 13 : 14, color: '#14532d', fontWeight: 500, lineHeight: 1.4 }}>{s.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════ USE CASES ══════════════════ */}
        <section style={{ padding: sectionPadSm, background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 }}>
              {t('landing.ucLabel')}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: isMobile ? 10 : 12, justifyContent: 'center' }}>
              {useCases.map((u, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: '#fff', border: '1px solid #e2e8f0', borderRadius: 999,
                  padding: isMobile ? '8px 14px' : '10px 20px',
                  fontSize: isMobile ? 13 : 14, fontWeight: 600, color: '#334155',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s',
                  cursor: 'default',
                }}>
                  <span style={{ fontSize: isMobile ? 16 : 20 }}>{u.emoji}</span>
                  {u.label}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════ HOW IT WORKS ══════════════════ */}
        <section id="how-it-works" style={{ padding: sectionPad, background: '#fff' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: 2 }}>
              {t('landing.howLabel')}
            </span>
            <h2 style={{
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, color: '#0f172a',
              marginTop: 8, marginBottom: 16, letterSpacing: '-1px',
            }}>
              {t('landing.howTitle')}
            </h2>
            <p style={{ color: '#64748b', fontSize: isMobile ? 15 : 16, maxWidth: 520, margin: '0 auto', marginBottom: isMobile ? 40 : 64 }}>
              {t('landing.howDesc')}
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: isMobile ? 32 : 32,
              position: 'relative',
            }}>
              {/* Connecting line — desktop only */}
              {!isMobile && (
                <div style={{
                  position: 'absolute', top: 36, left: 'calc(16.66% + 36px)',
                  width: 'calc(66.66% - 72px)', height: 2,
                  background: 'linear-gradient(90deg, #f59e0b 0%, rgba(245,158,11,0.2) 100%)',
                }} />
              )}

              {/* Vertical line — mobile only */}
              {isMobile && (
                <div style={{
                  position: 'absolute', top: 36, left: '50%', transform: 'translateX(-50%)',
                  width: 2, height: 'calc(100% - 72px)',
                  background: 'linear-gradient(180deg, #f59e0b 0%, rgba(245,158,11,0.1) 100%)',
                  zIndex: 0,
                }} />
              )}

              {steps.map((step, i) => (
                <div key={i} style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                    <div style={{
                      width: 72, height: 72, borderRadius: '50%',
                      background: i === 0 ? '#f59e0b' : '#fff',
                      border: `2px solid ${i === 0 ? '#f59e0b' : '#e2e8f0'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: i === 0 ? '#fff' : '#64748b',
                      boxShadow: i === 0 ? '0 8px 24px rgba(245,158,11,0.35)' : '0 4px 16px rgba(0,0,0,0.06)',
                      position: 'relative', zIndex: 1,
                    }}>
                      {step.icon}
                    </div>
                  </div>
                  <span style={{
                    fontFamily: 'Bricolage Grotesque, sans-serif',
                    fontSize: 13, fontWeight: 800, color: '#f59e0b',
                    textTransform: 'uppercase', letterSpacing: 2, display: 'block', marginBottom: 8,
                  }}>
                    {t('landing.howStep')} {step.num}
                  </span>
                  <h3 style={{
                    fontFamily: 'Bricolage Grotesque, sans-serif',
                    fontSize: isMobile ? 20 : 22, fontWeight: 700, color: '#0f172a', marginBottom: 10,
                  }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.6, maxWidth: 260, margin: '0 auto' }}>
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Demo CTA */}
            <div style={{ marginTop: 56 }}>
              <Link to="/demo" style={{
                display: 'inline-flex', alignItems: 'center', gap: 12,
                background: '#0f172a', color: '#fff',
                padding: isMobile ? '14px 24px' : '16px 32px', borderRadius: 14,
                fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, fontSize: isMobile ? 15 : 16,
                textDecoration: 'none', boxShadow: '0 8px 24px rgba(15,23,42,0.2)',
              }}>
                <Play size={18} fill="#fff" />
                {t('landing.howDemoCta')}
              </Link>
            </div>
          </div>
        </section>

        {/* ══════════════════ FEATURES ══════════════════ */}
        <section id="features" style={{ padding: sectionPad, background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: isMobile ? 40 : 64 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: 2 }}>
                {t('landing.featLabel')}
              </span>
              <h2 style={{
                fontFamily: 'Bricolage Grotesque, sans-serif',
                fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, color: '#0f172a',
                marginTop: 8, letterSpacing: '-1px',
              }}>
                {t('landing.featTitle')}
              </h2>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: isMobile ? 16 : 24,
            }}>
              {features.map((feature, i) => (
                <div key={i} className="card-hover" style={{
                  background: '#fff', borderRadius: 20, padding: isMobile ? 22 : 28,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#f59e0b', marginBottom: 18,
                  }}>
                    {feature.icon}
                  </div>
                  <h3 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: isMobile ? 17 : 18, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
                    {feature.title}
                  </h3>
                  <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.65, marginBottom: 16 }}>
                    {feature.desc}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#92400e' }}>{feature.outcome}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════ TESTIMONIALS ══════════════════ */}
        <section style={{ padding: sectionPad, background: '#0f172a', position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', top: -100, right: -100, width: 400, height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
            <div style={{ textAlign: 'center', marginBottom: isMobile ? 40 : 64 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: 2 }}>
                {t('landing.testLabel')}
              </span>
              <h2 style={{
                fontFamily: 'Bricolage Grotesque, sans-serif',
                fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, color: '#fff',
                marginTop: 8, letterSpacing: '-1px',
              }}>
                {t('landing.testTitle')}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: 12, fontSize: isMobile ? 15 : 16 }}>
                {t('landing.testDesc')}
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: isMobile ? 16 : 24,
            }}>
              {testimonials.map((t, i) => (
                <div key={i} className="card-hover" style={{
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 20, padding: isMobile ? 22 : 28,
                  backdropFilter: 'blur(10px)',
                }}>
                  <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
                    {[...Array(t.stars)].map((_, j) => <Star key={j} size={16} fill="#f59e0b" color="#f59e0b" />)}
                  </div>
                  <p style={{ fontSize: isMobile ? 15 : 16, color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>
                    "{t.text}"
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%',
                      background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, fontWeight: 800, color: '#0f172a',
                      fontFamily: 'Bricolage Grotesque, sans-serif',
                      flexShrink: 0,
                    }}>
                      {t.avatar}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>{t.name}</p>
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust badges */}
            <div style={{ marginTop: 56, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: isMobile ? 20 : 32, flexWrap: 'wrap' }}>
              {[
                { icon: <ShieldCheck size={18} />, label: 'SSL Secured' },
                { icon: <CreditCard size={18} />, label: 'Stripe Verified' },
                { icon: <Shield size={18} />, label: 'PCI-DSS Compliant' },
                { icon: <Award size={18} />, label: 'GDPR Ready' },
              ].map((b, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 600,
                }}>
                  {b.icon}
                  {b.label}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════ PRICING ══════════════════ */}
        <section id="pricing" style={{ padding: sectionPad, background: '#f8fafc' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: isMobile ? 40 : 64 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: 2 }}>
                {t('landing.pricLabel')}
              </span>
              <h2 style={{
                fontFamily: 'Bricolage Grotesque, sans-serif',
                fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, color: '#0f172a',
                marginTop: 8, letterSpacing: '-1px',
              }}>
                {t('landing.pricTitle')}
              </h2>
              <p style={{ color: '#64748b', marginTop: 12, fontSize: isMobile ? 15 : 16 }}>
                {t('landing.pricDesc')}
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: isMobile ? 20 : 24,
              alignItems: 'start',
            }}>
              {plans.map((plan, i) => (
                <div key={i} style={{
                  borderRadius: 24, padding: isMobile ? 24 : 32,
                  border: plan.popular ? '2px solid #f59e0b' : '1px solid #e2e8f0',
                  background: plan.popular ? '#0f172a' : '#fff',
                  boxShadow: plan.popular ? '0 24px 60px rgba(15,23,42,0.18)' : '0 4px 20px rgba(0,0,0,0.05)',
                  transform: (!isMobile && plan.popular) ? 'scale(1.04)' : 'none',
                  position: 'relative',
                }}>
                  {plan.popular && (
                    <div style={{
                      position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                      background: '#f59e0b', color: '#0f172a',
                      padding: '5px 18px', borderRadius: 999,
                      fontSize: 12, fontWeight: 800, fontFamily: 'Bricolage Grotesque, sans-serif',
                      whiteSpace: 'nowrap',
                    }}>
                      MOST POPULAR
                    </div>
                  )}

                  <span style={{
                    display: 'inline-block', fontSize: 12, fontWeight: 700,
                    color: plan.popular ? 'rgba(255,255,255,0.5)' : '#64748b',
                    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12,
                  }}>
                    {plan.tag}
                  </span>

                  <h3 style={{
                    fontFamily: 'Bricolage Grotesque, sans-serif',
                    fontSize: 24, fontWeight: 800,
                    color: plan.popular ? '#fff' : '#0f172a', marginBottom: 8,
                  }}>
                    {plan.name}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 28, paddingBottom: 28, borderBottom: `1px solid ${plan.popular ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}` }}>
                    <span style={{
                      fontFamily: 'Bricolage Grotesque, sans-serif',
                      fontSize: isMobile ? 44 : 52, fontWeight: 800,
                      color: plan.popular ? '#fff' : '#0f172a',
                    }}>
                      ₹{plan.price}
                    </span>
                    <span style={{ fontSize: 14, color: plan.popular ? 'rgba(255,255,255,0.4)' : '#94a3b8', fontWeight: 500 }}>
                      {plan.days}
                    </span>
                  </div>

                  <ul style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32, listStyle: 'none' }}>
                    {plan.features.map((f, j) => (
                      <li key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: plan.popular ? 'rgba(255,255,255,0.75)' : '#475569' }}>
                        <Check size={16} color={plan.popular ? '#f59e0b' : '#10b981'} style={{ flexShrink: 0 }} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link to="/register" style={{
                    display: 'block', textAlign: 'center',
                    padding: '14px 24px', borderRadius: 12,
                    fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, fontSize: 15,
                    textDecoration: 'none',
                    background: plan.popular ? '#f59e0b' : '#0f172a',
                    color: plan.popular ? '#0f172a' : '#fff',
                    boxShadow: plan.popular ? '0 6px 20px rgba(245,158,11,0.4)' : 'none',
                  }}>
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>

            <p style={{ textAlign: 'center', marginTop: 32, fontSize: 14, color: '#94a3b8' }}>
              {t('landing.pricNote')}
            </p>
          </div>
        </section>

        {/* ══════════════════ FAQ ══════════════════ */}
        <section id="faq" style={{ padding: sectionPad, background: '#fff' }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: isMobile ? 40 : 56 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: 2 }}>
                {t('landing.faqLabel')}
              </span>
              <h2 style={{
                fontFamily: 'Bricolage Grotesque, sans-serif',
                fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 800, color: '#0f172a',
                marginTop: 8, letterSpacing: '-1px',
              }}>
                {t('landing.faqTitle')}
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {faqs.map((faq, i) => (
                <div key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <button
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: isMobile ? '16px 0' : '20px 0', background: 'none', border: 'none', cursor: 'pointer',
                      textAlign: 'left', gap: 12,
                    }}
                  >
                    <span style={{
                      fontFamily: 'Bricolage Grotesque, sans-serif',
                      fontSize: isMobile ? 15 : 17, fontWeight: 700,
                      color: activeFaq === i ? '#f59e0b' : '#0f172a',
                      lineHeight: 1.4,
                    }}>
                      {faq.q}
                    </span>
                    <span style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: activeFaq === i ? '#f59e0b' : '#f1f5f9',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      {activeFaq === i
                        ? <Minus size={14} color="#fff" />
                        : <Plus size={14} color="#64748b" />}
                    </span>
                  </button>
                  {activeFaq === i && (
                    <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.7, paddingBottom: 20 }}>
                      {faq.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════ FINAL CTA ══════════════════ */}
        <section style={{
          padding: sectionPad,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)',
            width: 600, height: 600, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', position: 'relative', padding: isMobile ? '0 4px' : 0 }}>
            <span style={{ fontSize: 40, display: 'block', marginBottom: 20 }}>🚀</span>
            <h2 style={{
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontSize: 'clamp(28px, 5vw, 58px)', fontWeight: 800, color: '#fff',
              letterSpacing: '-1.5px', marginBottom: 20, lineHeight: 1.1,
            }}>
              {t('landing.ctaTitle')}<br />
              <span style={{ color: '#f59e0b' }}>{t('landing.ctaTitle2')}</span>
            </h2>
            <p style={{ fontSize: isMobile ? 16 : 18, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, marginBottom: 40, maxWidth: 500, margin: '0 auto 40px' }}>
              {t('landing.ctaDesc')}
            </p>
            <div style={{ display: 'flex', gap: isMobile ? 12 : 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" style={{
                background: '#f59e0b', color: '#0f172a',
                padding: isMobile ? '15px 28px' : '18px 40px', borderRadius: 14,
                fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: isMobile ? 15 : 17,
                textDecoration: 'none', boxShadow: '0 10px 32px rgba(245,158,11,0.45)',
              }}>
                {t('landing.ctaCta1')}
              </Link>
              <Link to="/demo" style={{
                border: '1px solid rgba(255,255,255,0.2)', color: '#fff',
                padding: isMobile ? '15px 24px' : '18px 32px', borderRadius: 14,
                fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, fontSize: isMobile ? 15 : 16,
                textDecoration: 'none', background: 'rgba(255,255,255,0.07)',
              }}>
                {t('landing.ctaCta2')}
              </Link>
            </div>
            <p style={{ marginTop: 24, fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
              {t('landing.ctaNote')}
            </p>
          </div>
        </section>

        {/* ══════════════════ FOOTER ══════════════════ */}
        <footer style={{ background: '#060d1a', padding: isMobile ? '56px 16px 28px' : '72px 24px 32px', color: '#fff' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr 1fr',
              gap: isMobile ? 36 : 48,
              marginBottom: isMobile ? 40 : 56,
            }}>
              <div>
                <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 28, fontWeight: 800, marginBottom: 16 }}>
                  Book<span style={{ color: '#f59e0b' }}>Ease</span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, lineHeight: 1.7, maxWidth: 300, marginBottom: 24 }}>
                  {t('landing.footerDesc')}
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[
                    <ShieldCheck size={16} />,
                    <CreditCard size={16} />,
                    <Globe size={16} />,
                  ].map((icon, i) => (
                    <div key={i} style={{
                      width: 36, height: 36, borderRadius: 8,
                      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'rgba(255,255,255,0.4)',
                    }}>
                      {icon}
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer link columns — 3 cols on desktop, stacked on mobile */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : '1fr',
                gap: isMobile ? 24 : 0,
                gridColumn: isMobile ? '1' : 'auto',
              }}>
                {[
                  { title: t('landing.footerProduct'), links: [t('landing.footerFeatures'), t('landing.footerPricing'), t('landing.footerDemo'), t('landing.footerChangelog')] },
                  { title: t('landing.footerResources'), links: [t('landing.footerBlog'), t('landing.footerHelp'), t('landing.footerApi'), t('landing.footerCommunity')] },
                  { title: t('landing.footerCompany'), links: [t('landing.footerAbout'), t('landing.footerCareers'), t('landing.footerPrivacyPolicy'), t('landing.footerTerms')] },
                ].map((col, i) => (
                  isMobile ? (
                    <div key={i}>
                      <h4 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, fontSize: 14, marginBottom: 14 }}>{col.title}</h4>
                      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {col.links.map((link, j) => (
                          <li key={j}>
                            <a href="#" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, textDecoration: 'none' }}>{link}</a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null
                ))}
              </div>

              {/* Desktop only: individual columns */}
              {!isMobile && [
                { title: t('landing.footerProduct'), links: [t('landing.footerFeatures'), t('landing.footerPricing'), t('landing.footerDemo'), t('landing.footerChangelog')] },
                { title: t('landing.footerResources'), links: [t('landing.footerBlog'), t('landing.footerHelp'), t('landing.footerApi'), t('landing.footerCommunity')] },
                { title: t('landing.footerCompany'), links: [t('landing.footerAbout'), t('landing.footerCareers'), t('landing.footerPrivacyPolicy'), t('landing.footerTerms')] },
              ].map((col, i) => (
                <div key={i}>
                  <h4 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, fontSize: 15, marginBottom: 20 }}>{col.title}</h4>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {col.links.map((link, j) => (
                      <li key={j}>
                        <a href="#" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, textDecoration: 'none' }}>{link}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div style={{
              borderTop: '1px solid rgba(255,255,255,0.07)',
              paddingTop: 28,
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'flex-start' : 'center',
              gap: 12,
              flexWrap: 'wrap',
            }}>
              <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>
                © {new Date().getFullYear()} BookEase Inc. by Avenirya Solutions X Yash Kolnure
              </p>
              <div style={{ display: 'flex', gap: 24 }}>
                {[t('landing.footerPrivacy'), t('landing.footerTerms'), t('landing.footerCookies')].map((item, i) => (
                  <a key={i} href="#" style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13, textDecoration: 'none' }}>{item}</a>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* ── WHATSAPP BUTTON ── */}
      <a href="https://wa.me/918767640530?text=Hello%20BookEase%20Team" target="_blank" rel="noopener noreferrer">
        <button className="whatsapp-btn" title="Chat with us on WhatsApp">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
        </button>
      </a>
    </>
  );
};

export default LandingPage;