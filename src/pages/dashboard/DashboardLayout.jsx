import { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Calendar, Scissors, Tag, Star,
  Settings, LogOut, ExternalLink, Menu, X, ChevronDown, Coins, CalendarDays
} from 'lucide-react';
import './DashboardLayout.css';

const nav = [
  { to: '/dashboard', icon: <LayoutDashboard size={18}/>, label: 'Overview', end: true },
  { to: '/dashboard/appointments', icon: <Calendar size={18}/>, label: 'Appointments' },
  { to: '/dashboard/calendar', icon: <CalendarDays size={18}/>, label: 'My Calendar' },
  { to: '/dashboard/services', icon: <Scissors size={18}/>, label: 'Services' },
  { to: '/dashboard/coupons', icon: <Tag size={18}/>, label: 'Coupons' },
  { to: '/dashboard/reviews', icon: <Star size={18}/>, label: 'Reviews' },
  { to: '/dashboard/settings', icon: <Settings size={18}/>, label: 'Store Settings' },
  { to: '/dashboard/plans', icon: <Coins size={18}/>, label: 'Plans' },
];

export default function DashboardLayout() {
  const { user, store, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo">BookEase</Link>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}><X size={18}/></button>
        </div>

        {store && (
          <div className="sidebar-store">
            <div className="sidebar-store-avatar">{store.name?.[0]}</div>
            <div className="sidebar-store-info">
              <div className="sidebar-store-name">{store.name}</div>
              <a href={`/store/${store.slug}`} target="_blank" rel="noopener" className="sidebar-store-link">
                View store <ExternalLink size={11}/>
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
          <button className="sidebar-logout" onClick={handleLogout}>
            <LogOut size={16}/> Sign Out
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
                <ExternalLink size={14}/> View Store
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
