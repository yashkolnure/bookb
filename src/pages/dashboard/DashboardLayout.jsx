import { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard, Calendar, Scissors, Tag, Star,
  Settings, LogOut, ExternalLink, Menu, X, ChevronDown, Coins, CalendarDays, Globe
} from 'lucide-react';
import './DashboardLayout.css';

const ALL_LANGS = [
  { code: 'en' }, { code: 'hi' }, { code: 'bn' }, { code: 'te' },
  { code: 'mr' }, { code: 'ta' }, { code: 'gu' }, { code: 'kn' },
  { code: 'ml' }, { code: 'or' }, { code: 'pa' }, { code: 'ur' },
  { code: 'as' }, { code: 'ne' },
];

function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const langs = ALL_LANGS.map(l => ({ code: l.code, label: t(`language.${l.code}`) }));
  const activeLng = (i18n.language || 'en').split('-')[0];
  const current = langs.find(l => l.code === activeLng) || langs[0];

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(p => !p)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px',
          background: 'none', border: '1px solid var(--border)', borderRadius: 8,
          cursor: 'pointer', fontSize: 13, color: 'var(--ink-muted)', width: '100%',
        }}
      >
        <Globe size={14} />
        <span style={{ flex: 1, textAlign: 'left' }}>{current.label}</span>
        <ChevronDown size={12} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', bottom: '110%', left: 0, background: 'var(--warm-white)',
          border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.14)', minWidth: 160, zIndex: 200,
          maxHeight: 260, overflowY: 'auto',
        }}>
          {langs.map(l => (
            <button
              key={l.code}
              onClick={() => { i18n.changeLanguage(l.code); setOpen(false); }}
              style={{
                display: 'block', width: '100%', textAlign: 'left', padding: '9px 14px',
                background: activeLng === l.code ? 'var(--bg-soft)' : 'none',
                border: 'none', cursor: 'pointer', fontSize: 13,
                fontWeight: activeLng === l.code ? 600 : 400,
                color: 'var(--ink)',
                borderBottom: '1px solid var(--border)',
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

export default function DashboardLayout() {
  const { user, store, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const nav = [
    { to: '/dashboard', icon: <LayoutDashboard size={18}/>, label: t('nav.overview'), end: true },
    { to: '/dashboard/appointments', icon: <Calendar size={18}/>, label: t('nav.appointments') },
    { to: '/dashboard/calendar', icon: <CalendarDays size={18}/>, label: t('nav.myCalendar') },
    { to: '/dashboard/services', icon: <Scissors size={18}/>, label: t('nav.services') },
    { to: '/dashboard/coupons', icon: <Tag size={18}/>, label: t('nav.coupons') },
    { to: '/dashboard/reviews', icon: <Star size={18}/>, label: t('nav.reviews') },
    { to: '/dashboard/settings', icon: <Settings size={18}/>, label: t('nav.storeSettings') },
    { to: '/dashboard/plans', icon: <Coins size={18}/>, label: t('nav.plans') },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo">BookKromess</Link>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}><X size={18}/></button>
        </div>

        {store && (
          <div className="sidebar-store">
            <div className="sidebar-store-avatar">{store.name?.[0]}</div>
            <div className="sidebar-store-info">
              <div className="sidebar-store-name">{store.name}</div>
              <a href={`/store/${store.slug}`} target="_blank" rel="noopener" className="sidebar-store-link">
                {t('common.viewStore')} <ExternalLink size={11}/>
              </a>
            </div>
          </div>
        )}

        <nav className="sidebar-nav">
          {nav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">{user?.name?.[0]}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-email">{user?.email}</div>
            </div>
          </div>
          <div style={{ padding: '0 16px 12px' }}>
            <LanguageSwitcher />
          </div>
          <button className="sidebar-logout" onClick={handleLogout}>
            <LogOut size={16}/> {t('common.signOut')}
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <button className="topbar-menu-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={20}/>
          </button>
          <div className="topbar-right">
            {store?.slug && (
              <a href={`/store/${store.slug}`} target="_blank" rel="noopener" className="btn btn-outline btn-sm">
                <ExternalLink size={14}/> {t('nav.viewStore')}
              </a>
            )}
          </div>
        </header>
        <div className="dashboard-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
