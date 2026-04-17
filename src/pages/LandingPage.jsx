import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, Zap, Shield, TrendingUp, ChevronRight,
  Check, ArrowRight, Smartphone, Layers, Plus, Minus,
  Play, ShieldCheck, CreditCard, Star, X, MessageCircle,
  Clock, Users, DollarSign, Bell, Globe, Award, ChevronDown
} from 'lucide-react';

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

const features = [
  {
    icon: <Zap size={22} />,
    title: 'Launch in 60 Seconds',
    desc: 'Get a custom booking page with your brand, services, and pricing. No code. No designer. No delays.',
    outcome: 'Your clients book — you sleep.',
  },
  {
    icon: <Calendar size={22} />,
    title: 'Zero Double Bookings',
    desc: 'Smart calendar sync with Google, Outlook & iCal. BookEase blocks your time automatically.',
    outcome: 'Never apologise for overlaps again.',
  },
  {
    icon: <DollarSign size={22} />,
    title: 'Get Paid Upfront',
    desc: 'Collect payments before every session via Stripe or PayPal. 0% commission, always.',
    outcome: 'Cash in hand before you show up.',
  },
  {
    icon: <Bell size={22} />,
    title: 'Auto Reminders',
    desc: 'Automated SMS & email reminders cut no-shows by up to 80%. Set it once, forget it.',
    outcome: 'Your schedule stays full.',
  },
  {
    icon: <TrendingUp size={22} />,
    title: 'See What\'s Working',
    desc: 'Revenue trends, peak hours, repeat clients. Know exactly where your growth comes from.',
    outcome: 'Data-driven decisions made easy.',
  },
  {
    icon: <Smartphone size={22} />,
    title: 'Run It from Your Phone',
    desc: 'Manage bookings, reschedule, and chat with clients from any browser. No app download.',
    outcome: 'Your business, from your pocket.',
  },
];

const steps = [
  {
    num: '01',
    icon: <Globe size={28} />,
    title: 'Build Your Store',
    desc: 'Add your services, set prices, and personalise your page. Takes under 2 minutes.',
  },
  {
    num: '02',
    icon: <ArrowRight size={28} />,
    title: 'Share Your Link',
    desc: 'Post it on Instagram, WhatsApp, or your website. Clients book directly — no back-and-forth.',
  },
  {
    num: '03',
    icon: <CreditCard size={28} />,
    title: 'Get Booked & Paid',
    desc: 'Receive instant payment, automatic confirmation, and SMS reminders. All on autopilot.',
  },
];

const plans = [
  {
    name: 'Starter',
    price: '0',
    tag: '7 Day Free Trial',
    features: [
      '50 Bookings / month',
      'Stripe & PayPal integration',
      'Basic Analytics',
      'Email Confirmations',
      'Custom booking page URL',
    ],
    days: '/ 7 days',
    popular: false,
    cta: 'Start for Free',
  },
  {
    name: 'Professional',
    price: '899',
    tag: 'Most Popular',
    features: [
      'Unlimited Bookings',
      'SMS + Email Reminders',
      'Custom Branding & Logo',
      'Advanced Analytics',
      'Priority Support',
      '0% Transaction Fees',
    ],
    days: '/ 1 month',
    popular: true,
    cta: 'Get Professional',
  },
  {
    name: 'Business',
    price: '4999',
    tag: 'Scale Up',
    features: [
      'Multi-staff Accounts',
      'White-label Domain',
      'API Access',
      'Dedicated Account Manager',
      'Custom Integrations',
      'SLA Uptime Guarantee',
    ],
    days: '/ 1 year',
    popular: false,
    cta: 'Go Business',
  },
];

const faqs = [
  { q: 'Do I need any technical skills to get started?', a: 'None at all. BookEase is built for busy professionals, not developers. If you can fill out a form, you can launch your store.' },
  { q: 'What payment methods are supported?', a: 'We support Stripe and PayPal out of the box, covering credit cards, debit cards, UPI (via Stripe India), and wallets. More gateways coming soon.' },
  { q: 'Will my clients need to download an app?', a: 'No. Your storefront is a fully responsive web app that works perfectly in any browser — mobile or desktop. Zero friction for your clients.' },
  { q: 'What happens if I want to cancel?', a: 'Cancel anytime — no lock-in, no cancellation fees. Your data is yours; we provide a full export before you leave.' },
  { q: 'Is my payment data secure?', a: 'Yes. All transactions are processed by Stripe or PayPal. We are PCI-DSS compliant and never store raw card data on our servers.' },
];

const useCases = [
  { emoji: '💆', label: 'Beauty & Wellness' },
  { emoji: '🏋️', label: 'Fitness Trainers' },
  { emoji: '📸', label: 'Photographers' },
  { emoji: '🧑‍💼', label: 'Consultants' },
  { emoji: '🎓', label: 'Tutors & Coaches' },
  { emoji: '✂️', label: 'Salons & Spas' },
  { emoji: '🧘', label: 'Yoga Instructors' },
  { emoji: '🩺', label: 'Healthcare Pros' },
];

/* ─── Main Component ─── */
const LandingPage = () => {
  const [activeFaq, setActiveFaq] = useState(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [exitPopupDismissed, setExitPopupDismissed] = useState(false);

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

  return (
    <>
      <FontLoader />

      {/* ── STICKY TOP BAR ── */}
      <div
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 999,
          background: 'linear-gradient(90deg, #0f172a 0%, #1e293b 100%)',
          padding: '12px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
          transition: 'transform 0.35s ease',
          transform: showStickyBar ? 'translateY(0)' : 'translateY(-100%)',
          boxShadow: '0 2px 20px rgba(0,0,0,0.25)',
        }}
      >
        <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: 14, fontFamily: 'Bricolage Grotesque, sans-serif' }}>
          🔥 Limited offer: FREE trial Available for 7 Days
        </span>
        <Link to="/register" style={{
          background: '#f59e0b', color: '#0f172a',
          padding: '8px 20px', borderRadius: 999,
          fontWeight: 800, fontSize: 13, textDecoration: 'none',
          fontFamily: 'Bricolage Grotesque, sans-serif',
          transition: 'background 0.2s',
        }}>
          Claim Offer →
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
            background: '#fff', borderRadius: 24, padding: 40, maxWidth: 480, width: '100%',
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
            <h3 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 26, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
              Wait! Don't miss this.
            </h3>
            <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>
              Start your <strong>Professional plan free for 7 days</strong>. No credit card. Cancel anytime. Just results.
            </p>
            <Link to="/register" onClick={() => setShowExitPopup(false)} style={{
              display: 'block', background: '#f59e0b', color: '#0f172a',
              padding: '14px 32px', borderRadius: 14, fontWeight: 800,
              fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 16,
              textDecoration: 'none', marginBottom: 12,
            }}>
              Start My Free Trial →
            </Link>
            <button
              onClick={() => { setShowExitPopup(false); setExitPopupDismissed(true); }}
              style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 13, cursor: 'pointer' }}
            >
              No thanks, I prefer manual bookings
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
            padding: '16px 24px',
          }}>
            <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 26, fontWeight: 800, color: '#0f172a' }}>
              Book<span style={{ color: '#f59e0b' }}>Ease</span>
            </div>
            <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
              <a href="#features" style={{ fontSize: 14, fontWeight: 500, color: '#64748b', textDecoration: 'none' }}>Features</a>
              <a href="#how-it-works" style={{ fontSize: 14, fontWeight: 500, color: '#64748b', textDecoration: 'none' }}>How it works</a>
              <a href="#pricing" style={{ fontSize: 14, fontWeight: 500, color: '#64748b', textDecoration: 'none' }}>Pricing</a>
              <a href="#faq" style={{ fontSize: 14, fontWeight: 500, color: '#64748b', textDecoration: 'none' }}>FAQ</a>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <Link to="/login" style={{ fontSize: 14, fontWeight: 600, color: '#334155', textDecoration: 'none' }}>Sign in</Link>
              <Link to="/register" style={{
                background: '#0f172a', color: '#fff',
                padding: '10px 22px', borderRadius: 999,
                fontSize: 14, fontWeight: 700, textDecoration: 'none',
                fontFamily: 'Bricolage Grotesque, sans-serif',
                boxShadow: '0 4px 14px rgba(15,23,42,0.18)',
              }}>
                Get Started Free
              </Link>
            </div>
          </div>
        </nav>

        {/* ══════════════════ HERO ══════════════════ */}
        <section className="hero-bg" style={{ padding: '96px 24px 80px', position: 'relative', overflow: 'hidden' }}>
          {/* Decorative blobs */}
          <div style={{
            position: 'absolute', top: -100, right: -100, width: 500, height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: -50, left: -80, width: 350, height: 350,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
            <div style={{ animation: 'fadeUp 0.7s ease forwards' }}>
              {/* Badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#fef3c7', border: '1px solid rgba(245,158,11,0.3)',
                borderRadius: 999, padding: '6px 14px',
                fontSize: 13, fontWeight: 600, color: '#92400e', marginBottom: 24,
              }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', display: 'inline-block', animation: 'pulse-ring 2s ease-out infinite' }} />
                 Next Gen System — reduce no-shows by 80%
              </div>

              <h1 style={{
                fontFamily: 'Bricolage Grotesque, sans-serif',
                fontSize: 'clamp(40px, 5vw, 68px)',
                fontWeight: 800, lineHeight: 1.08,
                color: '#0f172a', marginBottom: 24,
                letterSpacing: '-1.5px',
              }}>
                Get Fully Booked<br />
                <span style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  Without the Chaos.
                </span>
              </h1>

              <p style={{ fontSize: 18, lineHeight: 1.7, color: '#475569', maxWidth: 480, marginBottom: 36 }}>
                The booking platform built for coaches, salons, and service professionals. Automate scheduling, payments, and reminders — so you focus on clients, not coordination.
              </p>

              <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
                <Link to="/register" style={{
                  background: '#f59e0b', color: '#0f172a',
                  padding: '16px 32px', borderRadius: 14,
                  fontSize: 16, fontWeight: 800, textDecoration: 'none',
                  fontFamily: 'Bricolage Grotesque, sans-serif',
                  boxShadow: '0 8px 28px rgba(245,158,11,0.4)',
                  transition: 'all 0.2s',
                }}>
                  Start Free — No Credit Card
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
                  }}>
                    <Play size={16} fill="#0f172a" />
                  </span>
                  Watch 2-min Demo
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
                    <strong style={{ color: '#0f172a' }}>4.9/5</strong> from 2,000+ professionals
                  </p>
                </div>
              </div>
            </div>

            {/* Hero card */}
            <div style={{ position: 'relative', animation: 'fadeUp 0.7s 0.2s ease both' }}>
              <div style={{
                background: '#fff', borderRadius: 24,
                padding: 24, boxShadow: '0 30px 80px rgba(0,0,0,0.12)',
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
                      <p style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', fontFamily: 'Bricolage Grotesque, sans-serif' }}>{s.val}</p>
                    </div>
                  ))}
                </div>
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CreditCard size={18} color="#16a34a" />
                  </div>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: 0.5 }}>New Booking Confirmed</p>
                    <p style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', fontFamily: 'Bricolage Grotesque, sans-serif' }}>+₹2,400 received • Rahul M.</p>
                  </div>
                </div>
              </div>

              {/* Floating badges */}
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
        <section style={{ padding: '96px 24px', background: '#fff' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: 2 }}>Sound familiar?</span>
              <h2 style={{
                fontFamily: 'Bricolage Grotesque, sans-serif',
                fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800, color: '#0f172a',
                marginTop: 8, letterSpacing: '-1px',
              }}>
                Still Managing Bookings Manually?
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 40, alignItems: 'center' }}>
              {/* Pain points */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { emoji: '😩', text: 'Chasing clients on WhatsApp for confirmations' },
                  { emoji: '💸', text: 'No-shows costing you revenue every week' },
                  { emoji: '📅', text: 'Double bookings and scheduling conflicts' },
                  { emoji: '⏰', text: 'Hours wasted on manual payment follow-ups' },
                  { emoji: '😰', text: 'No visibility into your revenue or growth' },
                ].map((p, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    background: '#fef2f2', border: '1px solid #fecaca',
                    borderRadius: 14, padding: '14px 18px',
                  }}>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{p.emoji}</span>
                    <span style={{ fontSize: 14, color: '#7f1d1d', fontWeight: 500, lineHeight: 1.4 }}>{p.text}</span>
                  </div>
                ))}
              </div>

              {/* Arrow */}
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(245,158,11,0.4)',
                }}>
                  <ArrowRight size={24} color="#fff" />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' }}>
                  Book<br />Ease
                </span>
              </div>

              {/* Solutions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { emoji: '✅', text: 'Clients self-book from your page — no messages needed' },
                  { emoji: '📲', text: 'Automated SMS reminders eliminate no-shows' },
                  { emoji: '📆', text: 'Smart calendar sync prevents double bookings' },
                  { emoji: '💳', text: 'Payments collected upfront, automatically' },
                  { emoji: '📊', text: 'Real-time dashboard shows revenue and trends' },
                ].map((s, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    background: '#f0fdf4', border: '1px solid #bbf7d0',
                    borderRadius: 14, padding: '14px 18px',
                  }}>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{s.emoji}</span>
                    <span style={{ fontSize: 14, color: '#14532d', fontWeight: 500, lineHeight: 1.4 }}>{s.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════ USE CASES ══════════════════ */}
        <section style={{ padding: '72px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 }}>
              Perfect for
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
              {useCases.map((u, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: '#fff', border: '1px solid #e2e8f0', borderRadius: 999,
                  padding: '10px 20px',
                  fontSize: 14, fontWeight: 600, color: '#334155',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s',
                  cursor: 'default',
                }}>
                  <span style={{ fontSize: 20 }}>{u.emoji}</span>
                  {u.label}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════ HOW IT WORKS ══════════════════ */}
        <section id="how-it-works" style={{ padding: '96px 24px', background: '#fff' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: 2 }}>
              Simple by design
            </span>
            <h2 style={{
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontSize: 'clamp(30px, 4vw, 48px)', fontWeight: 800, color: '#0f172a',
              marginTop: 8, marginBottom: 16, letterSpacing: '-1px',
            }}>
              From Sign-up to First Booking in Minutes
            </h2>
            <p style={{ color: '#64748b', fontSize: 16, maxWidth: 520, margin: '0 auto 64px' }}>
              No tutorials, no setup calls. BookEase is so intuitive, most users go live within 4 minutes.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, position: 'relative' }}>
              {/* Connecting line */}
              <div style={{
                position: 'absolute', top: 36, left: 'calc(16.66% + 36px)',
                width: 'calc(66.66% - 72px)', height: 2,
                background: 'linear-gradient(90deg, #f59e0b 0%, rgba(245,158,11,0.2) 100%)',
              }} />

              {steps.map((step, i) => (
                <div key={i} style={{ textAlign: 'center', position: 'relative' }}>
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
                    Step {step.num}
                  </span>
                  <h3 style={{
                    fontFamily: 'Bricolage Grotesque, sans-serif',
                    fontSize: 22, fontWeight: 700, color: '#0f172a', marginBottom: 10,
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
                padding: '16px 32px', borderRadius: 14,
                fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, fontSize: 16,
                textDecoration: 'none', boxShadow: '0 8px 24px rgba(15,23,42,0.2)',
              }}>
                <Play size={18} fill="#fff" />
                Watch the Full Demo
              </Link>
            </div>
          </div>
        </section>

        {/* ══════════════════ FEATURES ══════════════════ */}
        <section id="features" style={{ padding: '96px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: 2 }}>
                Built for performance
              </span>
              <h2 style={{
                fontFamily: 'Bricolage Grotesque, sans-serif',
                fontSize: 'clamp(30px, 4vw, 48px)', fontWeight: 800, color: '#0f172a',
                marginTop: 8, letterSpacing: '-1px',
              }}>
                Everything You Need. Nothing You Don't.
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
              {features.map((feature, i) => (
                <div key={i} className="card-hover" style={{
                  background: '#fff', borderRadius: 20, padding: 28,
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
                  <h3 style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
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
        <section style={{ padding: '96px 24px', background: '#0f172a', position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', top: -100, right: -100, width: 400, height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: 2 }}>
                Real stories
              </span>
              <h2 style={{
                fontFamily: 'Bricolage Grotesque, sans-serif',
                fontSize: 'clamp(30px, 4vw, 48px)', fontWeight: 800, color: '#fff',
                marginTop: 8, letterSpacing: '-1px',
              }}>
                Professionals Love BookEase
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: 12, fontSize: 16 }}>
                Over 2,000 service businesses trust us to run their bookings.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
              {testimonials.map((t, i) => (
                <div key={i} className="card-hover" style={{
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 20, padding: 28,
                  backdropFilter: 'blur(10px)',
                }}>
                  <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
                    {[...Array(t.stars)].map((_, j) => <Star key={j} size={16} fill="#f59e0b" color="#f59e0b" />)}
                  </div>
                  <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>
                    "{t.text}"
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%',
                      background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, fontWeight: 800, color: '#0f172a',
                      fontFamily: 'Bricolage Grotesque, sans-serif',
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
            <div style={{ marginTop: 56, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
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
        <section id="pricing" style={{ padding: '96px 24px', background: '#f8fafc' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: 2 }}>
                Pricing
              </span>
              <h2 style={{
                fontFamily: 'Bricolage Grotesque, sans-serif',
                fontSize: 'clamp(30px, 4vw, 48px)', fontWeight: 800, color: '#0f172a',
                marginTop: 8, letterSpacing: '-1px',
              }}>
                Simple, Honest Pricing
              </h2>
              <p style={{ color: '#64748b', marginTop: 12, fontSize: 16 }}>
                No hidden fees. No transaction cuts. Just one transparent price.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, alignItems: 'start' }}>
              {plans.map((plan, i) => (
                <div key={i} style={{
                  borderRadius: 24, padding: 32,
                  border: plan.popular ? '2px solid #f59e0b' : '1px solid #e2e8f0',
                  background: plan.popular ? '#0f172a' : '#fff',
                  boxShadow: plan.popular ? '0 24px 60px rgba(15,23,42,0.18)' : '0 4px 20px rgba(0,0,0,0.05)',
                  transform: plan.popular ? 'scale(1.04)' : 'none',
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
                      fontSize: 52, fontWeight: 800,
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
              🔒 No hidden fees · Cancel anytime · 0% transaction commission
            </p>
          </div>
        </section>

        {/* ══════════════════ FAQ ══════════════════ */}
        <section id="faq" style={{ padding: '96px 24px', background: '#fff' }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: 2 }}>
                Got questions?
              </span>
              <h2 style={{
                fontFamily: 'Bricolage Grotesque, sans-serif',
                fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#0f172a',
                marginTop: 8, letterSpacing: '-1px',
              }}>
                Frequently Asked Questions
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {faqs.map((faq, i) => (
                <div key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <button
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '20px 0', background: 'none', border: 'none', cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{
                      fontFamily: 'Bricolage Grotesque, sans-serif',
                      fontSize: 17, fontWeight: 700,
                      color: activeFaq === i ? '#f59e0b' : '#0f172a',
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
          padding: '96px 24px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)',
            width: 600, height: 600, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
            <span style={{ fontSize: 40, display: 'block', marginBottom: 20 }}>🚀</span>
            <h2 style={{
              fontFamily: 'Bricolage Grotesque, sans-serif',
              fontSize: 'clamp(32px, 5vw, 58px)', fontWeight: 800, color: '#fff',
              letterSpacing: '-1.5px', marginBottom: 20, lineHeight: 1.1,
            }}>
              Ready to Automate Your<br />
              <span style={{ color: '#f59e0b' }}>Bookings & Grow Faster?</span>
            </h2>
            <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, marginBottom: 40, maxWidth: 500, margin: '0 auto 40px' }}>
              Join 2,000+ professionals already using BookEase to save time, reduce no-shows, and grow their revenue.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" style={{
                background: '#f59e0b', color: '#0f172a',
                padding: '18px 40px', borderRadius: 14,
                fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800, fontSize: 17,
                textDecoration: 'none', boxShadow: '0 10px 32px rgba(245,158,11,0.45)',
              }}>
                Start Free — No Credit Card
              </Link>
              <Link to="/demo" style={{
                border: '1px solid rgba(255,255,255,0.2)', color: '#fff',
                padding: '18px 32px', borderRadius: 14,
                fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700, fontSize: 16,
                textDecoration: 'none', background: 'rgba(255,255,255,0.07)',
              }}>
                Book a Demo
              </Link>
            </div>
            <p style={{ marginTop: 24, fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
              Setup takes 4 minutes · No credit card required · Cancel anytime
            </p>
          </div>
        </section>

        {/* ══════════════════ FOOTER ══════════════════ */}
        <footer style={{ background: '#060d1a', padding: '72px 24px 32px', color: '#fff' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 56 }}>
              <div>
                <div style={{ fontFamily: 'Bricolage Grotesque, sans-serif', fontSize: 28, fontWeight: 800, marginBottom: 16 }}>
                  Book<span style={{ color: '#f59e0b' }}>Ease</span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, lineHeight: 1.7, maxWidth: 300, marginBottom: 24 }}>
                  The all-in-one platform for service professionals to automate scheduling, secure payments, and scale operations.
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

              {[
                { title: 'Product', links: ['Features', 'Pricing', 'Demo', 'Changelog'] },
                { title: 'Resources', links: ['Blog', 'Help Center', 'API Docs', 'Community'] },
                { title: 'Company', links: ['About Us', 'Careers', 'Privacy Policy', 'Terms'] },
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
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16,
            }}>
              <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13 }}>
                © {new Date().getFullYear()} BookEase Inc. by Avenirya Solutions X Yash Kolnure
              </p>
              <div style={{ display: 'flex', gap: 24 }}>
                {['Privacy', 'Terms', 'Cookies'].map((item, i) => (
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