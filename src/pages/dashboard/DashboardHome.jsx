import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { storeAPI, appointmentAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { TrendingUp, Calendar, DollarSign, Clock, ChevronRight, ExternalLink } from 'lucide-react';
import './DashboardHome.css';

function StatCard({ label, value, sub, icon, color }) {
  return (
    <div className="stat-card card">
      <div className="stat-icon" style={{background: color+'18', color}}>{icon}</div>
      <div className="stat-body">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
    </div>
  );
}

function getGreeting(t) {
  const h = new Date().getHours();
  if (h < 12) return t('dashboard.goodMorning');
  if (h < 17) return t('dashboard.goodAfternoon');
  return t('dashboard.goodEvening');
}

export default function DashboardHome() {
  const { store, user } = useAuth();
  const { t } = useTranslation();
  const [analytics, setAnalytics] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      storeAPI.getAnalytics(),
      appointmentAPI.getProviderList({ limit: 5 })
    ]).then(([a, r]) => {
      setAnalytics(a.data.analytics);
      setRecent(r.data.appointments);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const growth = analytics ? (
    analytics.lastMonthAppointments > 0
      ? Math.round((analytics.thisMonthAppointments - analytics.lastMonthAppointments) / analytics.lastMonthAppointments * 100)
      : analytics.thisMonthAppointments > 0 ? 100 : 0
  ) : 0;

  if (loading) return (
    <div className="page-loading" style={{minHeight:'50vh'}}>
      <div className="spinner" style={{width:36,height:36,borderWidth:3}}/>
    </div>
  );

  return (
    <div className="dash-home">
      <div className="dash-welcome">
        <div>
          <h1>{getGreeting(t)}, {user?.name?.split(' ')[0]} 👋</h1>
          <p>{t('dashboard.subtitle', { storeName: store?.name || 'your store' })}</p>
        </div>
        {store?.slug && (
          <a href={`/store/${store.slug}`} target="_blank" rel="noopener" className="btn btn-outline btn-sm">
            {t('dashboard.storeLink')} <ExternalLink size={13}/>
          </a>
        )}
      </div>

      <div className="stats-grid">
        <StatCard
          label={t('dashboard.totalAppointments')}
          value={analytics?.totalAppointments ?? '—'}
          sub={t('dashboard.thisMonthSub', { count: analytics?.thisMonthAppointments })}
          icon={<Calendar size={20}/>}
          color="var(--gold)"
        />
        <StatCard
          label={t('dashboard.thisMonth')}
          value={analytics?.thisMonthAppointments ?? '—'}
          sub={growth !== 0 ? `${growth > 0 ? '+' : ''}${growth}% ${t('dashboard.vsLastMonth')}` : t('dashboard.vsLastMonth')}
          icon={<TrendingUp size={20}/>}
          color="var(--sage)"
        />
        <StatCard
          label={t('dashboard.revenueCollected')}
          value={analytics?.totalRevenue ? `₹${analytics.totalRevenue.toLocaleString()}` : '₹0'}
          sub={t('dashboard.fromPaid')}
          icon={<DollarSign size={20}/>}
          color="var(--terracotta)"
        />
        <StatCard
          label={t('dashboard.pending')}
          value={analytics?.statusBreakdown?.pending ?? 0}
          sub={t('dashboard.awaitingConfirmation')}
          icon={<Clock size={20}/>}
          color="var(--ink-muted)"
        />
      </div>

      {analytics?.statusBreakdown && (
        <div className="status-breakdown card">
          <h3 className="breakdown-title">{t('dashboard.statusBreakdown')}</h3>
          <div className="breakdown-bars">
            {[
              { key:'pending',   label: t('appointments.pending'),   color:'#c07000' },
              { key:'confirmed', label: t('appointments.confirmed'), color:'var(--success)' },
              { key:'completed', label: t('appointments.completed'), color:'#1565c0' },
              { key:'cancelled', label: t('appointments.cancelled'), color:'var(--error)' },
            ].map(({ key, label, color }) => {
              const count = analytics.statusBreakdown[key] || 0;
              const total = analytics.totalAppointments || 1;
              const pct = Math.round(count / total * 100);
              return (
                <div key={key} className="breakdown-row">
                  <span className="breakdown-label">{label}</span>
                  <div className="breakdown-bar-wrap">
                    <div className="breakdown-bar" style={{ width: `${pct}%`, background: color }}/>
                  </div>
                  <span className="breakdown-count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="recent-section">
        <div className="recent-header">
          <h3>{t('dashboard.recentAppointments')}</h3>
          <Link to="/dashboard/appointments" className="btn btn-ghost btn-sm">
            {t('dashboard.viewAll')} <ChevronRight size={14}/>
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="empty-state" style={{padding:'40px 24px',border:'1px solid var(--border)',borderRadius:'var(--radius-lg)',background:'var(--warm-white)'}}>
            <div className="empty-state-icon">📅</div>
            <h3>{t('dashboard.noAppointmentsYet')}</h3>
            <p>{t('dashboard.shareLink')}</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t('dashboard.id')}</th>
                  <th>{t('dashboard.customer')}</th>
                  <th>{t('dashboard.service')}</th>
                  <th>{t('common.date')}</th>
                  <th>{t('common.time')}</th>
                  <th>{t('common.amount')}</th>
                  <th>{t('common.status')}</th>
                </tr>
              </thead>
              <tbody>
                {recent.map(a => (
                  <tr key={a._id}>
                    <td><code style={{fontSize:12}}>#{a.appointmentId}</code></td>
                    <td><div style={{fontWeight:600}}>{a.customer.name}</div><div style={{fontSize:12,color:'var(--ink-muted)'}}>{a.customer.email}</div></td>
                    <td>{a.service?.name}</td>
                    <td style={{fontSize:13}}>{new Date(a.appointmentDate).toLocaleDateString()}</td>
                    <td style={{fontSize:13}}>{a.startTime}</td>
                    <td>₹{a.totalAmount}</td>
                    <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
