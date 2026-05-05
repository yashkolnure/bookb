import { useEffect, useState, useCallback, useRef } from 'react';
import { appointmentAPI, calendarAPI } from '../../api/api';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Clock, Phone, Mail, User, Star, Trash2, Loader, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import './CalendarPage.css';

const DAYS_HEADER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const STATUS_COLORS = {
  pending:   { bg: '#fff3e0', text: '#c07000', dot: '#f59e0b' },
  confirmed: { bg: '#e8f5e9', text: '#2e7d32', dot: '#22c55e' },
  completed: { bg: '#e3f2fd', text: '#1565c0', dot: '#3b82f6' },
  cancelled: { bg: '#fce4ec', text: '#c62828', dot: '#ef4444' },
};

function getDaysInMonth(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = (firstDay + 6) % 7;
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  return cells;
}

// ── Provider metadata ──────────────────────────────────────────────────────────
const PROVIDERS = [
  {
    id: 'google',
    label: 'Google Calendar',
    icon: (
      <svg width="20" height="20" viewBox="0 0 48 48">
        <path fill="#4285F4" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.2l6.8-6.8C35.7 2.2 30.2 0 24 0 14.8 0 6.9 5.3 3 13l7.9 6.1C12.7 13.1 17.9 9.5 24 9.5z"/>
        <path fill="#34A853" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.6-4.8 7.3l7.5 5.8C43.8 37.5 46.5 31.4 46.5 24.5z"/>
        <path fill="#FBBC05" d="M10.9 28.6C10.3 26.9 10 25.1 10 23.2s.3-3.7.9-5.4L3 11.6C1.1 15.2 0 19.3 0 23.2c0 3.9 1 7.6 2.7 10.9l8.2-5.5z"/>
        <path fill="#EA4335" d="M24 48c6.5 0 12-2.1 16-5.7l-7.5-5.8c-2.1 1.4-4.8 2.2-8.5 2.2-6 0-11.1-3.6-12.9-8.7l-8.2 5.5C6.9 42.7 14.8 48 24 48z"/>
      </svg>
    ),
  },
  {
    id: 'microsoft',
    label: 'Microsoft Outlook',
    icon: (
      <svg width="20" height="20" viewBox="0 0 48 48">
        <path fill="#0072C6" d="M28 8H48v32H28z"/>
        <path fill="#0072C6" d="M0 8l28 4v24L0 40z"/>
        <circle fill="#fff" cx="14" cy="24" r="8"/>
        <ellipse fill="#0072C6" cx="14" cy="24" rx="5" ry="8"/>
      </svg>
    ),
  },
  {
    id: 'apple',
    label: 'Apple Calendar',
    icon: (
      <svg width="20" height="20" viewBox="0 0 48 48">
        <rect fill="#f05138" width="48" height="48" rx="10"/>
        <path fill="#fff" d="M24 10c1.8 0 3.4 1.5 3.4 3.3v1.2h4.5c.8 0 1.4.6 1.4 1.4v19.8c0 .8-.6 1.4-1.4 1.4H16.1c-.8 0-1.4-.6-1.4-1.4V15.9c0-.8.6-1.4 1.4-1.4h4.5v-1.2C20.6 11.5 22.2 10 24 10zm0 3.3c-.5 0-.9.4-.9.9v1.2h1.8v-1.2c0-.5-.4-.9-.9-.9zM20 21h-1.5v1.5H20V21zm0 4h-1.5v1.5H20V25zm0 4h-1.5v1.5H20V29zm4-8h-1.5v1.5H24V21zm0 4h-1.5v1.5H24V25zm0 4h-1.5v1.5H24V29zm4-8h-1.5v1.5H28V21zm0 4h-1.5v1.5H28V25z"/>
      </svg>
    ),
  },
];

// ── CalendarSyncPanel ─────────────────────────────────────────────────────────
function CalendarSyncPanel() {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [appleForm, setAppleForm] = useState({ open: false, email: '', password: '', saving: false });
  const [connecting, setConnecting] = useState(null);
  const didHandleParam = useRef(false);

  const loadConnections = useCallback(async () => {
    try {
      const res = await calendarAPI.getConnections();
      setConnections(res.data.connections || []);
    } catch {
      /* silently fail — calendar section is non-critical */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  // Handle OAuth redirect back (?connected=google or ?error=...)
  useEffect(() => {
    if (didHandleParam.current) return;
    const params = new URLSearchParams(window.location.search);
    const connected = params.get('connected');
    const error = params.get('error');
    if (connected) {
      toast.success(`${connected.charAt(0).toUpperCase() + connected.slice(1)} Calendar connected!`);
      loadConnections();
      didHandleParam.current = true;
      const clean = window.location.pathname;
      window.history.replaceState({}, '', clean);
    } else if (error) {
      toast.error(`Calendar connection failed: ${decodeURIComponent(error)}`);
      didHandleParam.current = true;
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [loadConnections]);

  const handleOAuth = async (providerId) => {
    setConnecting(providerId);
    try {
      const res = await calendarAPI.getAuthUrl(providerId);
      window.location.href = res.data.authUrl;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to get auth URL';
      toast.error(msg);
      setConnecting(null);
    }
  };

  const handleAppleConnect = async () => {
    if (!appleForm.email || !appleForm.password) {
      toast.error('Enter your Apple ID email and app-specific password');
      return;
    }
    setAppleForm(f => ({ ...f, saving: true }));
    try {
      await calendarAPI.connectApple({ email: appleForm.email, password: appleForm.password });
      toast.success('Apple Calendar connected!');
      setAppleForm({ open: false, email: '', password: '', saving: false });
      loadConnections();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Apple connection failed');
      setAppleForm(f => ({ ...f, saving: false }));
    }
  };

  const handleDisconnect = async (id, label) => {
    if (!window.confirm(`Disconnect ${label}?`)) return;
    try {
      await calendarAPI.disconnect(id);
      toast.success(`${label} disconnected`);
      loadConnections();
    } catch {
      toast.error('Failed to disconnect');
    }
  };

  const handleSetDefault = async (id, label) => {
    try {
      await calendarAPI.setDefault(id);
      toast.success(`${label} set as default calendar`);
      loadConnections();
    } catch {
      toast.error('Failed to set default');
    }
  };

  const connectedMap = {};
  connections.forEach(c => { connectedMap[c.provider] = c; });

  return (
    <div style={{
      background: '#fff',
      border: '1px solid var(--border, #e2e8f0)',
      borderRadius: 16,
      marginBottom: 16,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <button
        onClick={() => setCollapsed(c => !c)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer',
          borderBottom: collapsed ? 'none' : '1px solid var(--border, #e2e8f0)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>📅</span>
          <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text, #0f172a)' }}>Calendar Sync</span>
          {connections.length > 0 && (
            <span style={{
              background: '#dcfce7', color: '#16a34a', fontSize: 11, fontWeight: 700,
              padding: '2px 8px', borderRadius: 999,
            }}>
              {connections.length} connected
            </span>
          )}
        </div>
        {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
      </button>

      {!collapsed && (
        <div style={{ padding: '12px 18px 16px' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}>
              <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : (
            PROVIDERS.map(p => {
              const conn = connectedMap[p.id];
              return (
                <div key={p.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 0',
                  borderBottom: '1px solid var(--border, #f1f5f9)',
                }}>
                  {/* Icon */}
                  <div style={{ flexShrink: 0 }}>{p.icon}</div>

                  {/* Label + status */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text, #0f172a)' }}>{p.label}</div>
                    {conn ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <CheckCircle size={11} color="#16a34a" />
                        <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 500 }}>
                          {conn.email || 'Connected'}
                          {conn.isDefault && <span style={{ marginLeft: 6, color: '#f59e0b' }}>★ Default</span>}
                        </span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <AlertCircle size={11} color="#94a3b8" />
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>Not connected</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                    {conn ? (
                      <>
                        {!conn.isDefault && (
                          <button
                            onClick={() => handleSetDefault(conn._id, p.label)}
                            title="Set as default for outbound events"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4 }}
                          >
                            <Star size={15} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDisconnect(conn._id, p.label)}
                          title="Disconnect"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 4 }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    ) : (
                      p.id === 'apple' ? (
                        <button
                          onClick={() => setAppleForm(f => ({ ...f, open: !f.open }))}
                          style={{
                            fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 8,
                            border: '1px solid var(--border, #e2e8f0)', background: '#f8fafc',
                            cursor: 'pointer', color: 'var(--text, #0f172a)',
                          }}
                        >
                          Connect
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOAuth(p.id)}
                          disabled={connecting === p.id}
                          style={{
                            fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 8,
                            border: '1px solid var(--border, #e2e8f0)', background: '#f8fafc',
                            cursor: connecting === p.id ? 'not-allowed' : 'pointer',
                            color: 'var(--text, #0f172a)', opacity: connecting === p.id ? 0.6 : 1,
                          }}
                        >
                          {connecting === p.id ? <Loader size={12} style={{ animation: 'spin 1s linear infinite' }} /> : 'Connect'}
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Apple inline form */}
          {appleForm.open && !connectedMap['apple'] && (
            <div style={{
              marginTop: 12, padding: '14px 16px',
              background: '#f8fafc', borderRadius: 12,
              border: '1px solid var(--border, #e2e8f0)',
            }}>
              <p style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>
                Use an <strong>app-specific password</strong> — not your Apple ID password.{' '}
                <a href="https://support.apple.com/en-us/102654" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>
                  How to create one →
                </a>
              </p>
              <input
                type="email"
                placeholder="Apple ID (your iCloud email)"
                value={appleForm.email}
                onChange={e => setAppleForm(f => ({ ...f, email: e.target.value }))}
                style={{
                  width: '100%', marginBottom: 8, padding: '8px 12px', borderRadius: 8,
                  border: '1px solid var(--border, #e2e8f0)', fontSize: 13, outline: 'none',
                }}
              />
              <input
                type="password"
                placeholder="App-specific password (xxxx-xxxx-xxxx-xxxx)"
                value={appleForm.password}
                onChange={e => setAppleForm(f => ({ ...f, password: e.target.value }))}
                style={{
                  width: '100%', marginBottom: 10, padding: '8px 12px', borderRadius: 8,
                  border: '1px solid var(--border, #e2e8f0)', fontSize: 13, outline: 'none',
                }}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handleAppleConnect}
                  disabled={appleForm.saving}
                  style={{
                    flex: 1, padding: '8px', borderRadius: 8, border: 'none',
                    background: '#0f172a', color: '#fff', fontWeight: 600, fontSize: 13,
                    cursor: appleForm.saving ? 'not-allowed' : 'pointer', opacity: appleForm.saving ? 0.7 : 1,
                  }}
                >
                  {appleForm.saving ? 'Connecting…' : 'Connect Apple Calendar'}
                </button>
                <button
                  onClick={() => setAppleForm({ open: false, email: '', password: '', saving: false })}
                  style={{
                    padding: '8px 14px', borderRadius: 8, background: 'none',
                    border: '1px solid var(--border, #e2e8f0)', cursor: 'pointer', fontSize: 13,
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 10, lineHeight: 1.5 }}>
            Connected calendars hide busy slots from customers and receive new bookings automatically. The ★ default calendar receives outbound events.
          </p>
        </div>
      )}
    </div>
  );
}

export default function CalendarPage() {
  const { t } = useTranslation();
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedAppts, setSelectedAppts] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);

  const loadMonth = useCallback(async () => {
    setLoading(true);
    try {
      const res = await appointmentAPI.getProviderList({ limit: 200, page: 1 });
      setAppointments(res.data.appointments || []);
    } catch {
      toast.error('Could not load appointments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMonth(); }, [viewYear, viewMonth, loadMonth]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
    setSelectedDate(null);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
    setSelectedDate(null);
  };

  const apptByDate = {};
  appointments.forEach(a => {
    const d = new Date(a.appointmentDate);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    if (!apptByDate[key]) apptByDate[key] = [];
    apptByDate[key].push(a);
  });

  const selectDate = (date) => {
    if (!date) return;
    setSelectedDate(date);
    const key = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    setSelectedAppts((apptByDate[key] || []).sort((a, b) => a.startTime.localeCompare(b.startTime)));
  };

  const changeStatus = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const res = await appointmentAPI.updateStatus(id, newStatus);
      const updated = res.data.appointment;
      setAppointments(prev => prev.map(a => a._id === id ? updated : a));
      setSelectedAppts(prev => prev.map(a => a._id === id ? updated : a));
      toast.success(t('appointments.markAs', { status: newStatus }));
    } catch { toast.error('Failed'); } finally { setUpdatingId(null); }
  };

  const cells = getDaysInMonth(viewYear, viewMonth);
  const todayKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  return (
    <div className="cal-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('calendar.title')}</h1>
          <p className="page-subtitle">{t('calendar.subtitle')}</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => {
          setViewYear(today.getFullYear()); setViewMonth(today.getMonth());
          selectDate(today);
        }}>{t('common.today')}</button>
      </div>

      <div className="cal-layout">
        <div className="cal-main-col">
          <div className="card cal-card">
            <div className="cal-nav">
              <button className="btn btn-ghost btn-sm" onClick={prevMonth}><ChevronLeft size={18}/></button>
              <h2 className="cal-month-title">{MONTHS[viewMonth]} {viewYear}</h2>
              <button className="btn btn-ghost btn-sm" onClick={nextMonth}><ChevronRight size={18}/></button>
            </div>

            <div className="cal-dow-row">
              {DAYS_HEADER.map(d => <div key={d} className="cal-dow-cell">{d}</div>)}
            </div>

            {loading ? (
              <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}>
                <div className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
              </div>
            ) : (
              <div className="cal-cells">
                {cells.map((date, i) => {
                  if (!date) return <div key={`empty-${i}`} className="cal-cell cal-cell-empty" />;
                  const key = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
                  const dayAppts = apptByDate[key] || [];
                  const isToday = key === todayKey;
                  const isSelected = selectedDate && selectedDate.toDateString() === date.toDateString();
                  const isPast = date < today && !isToday;
                  const counts = {};
                  dayAppts.forEach(a => { counts[a.status] = (counts[a.status] || 0) + 1; });
                  return (
                    <div key={key}
                      className={`cal-cell ${isToday ? 'cal-cell-today' : ''} ${isSelected ? 'cal-cell-selected' : ''} ${isPast ? 'cal-cell-past' : ''} ${dayAppts.length > 0 ? 'cal-cell-has-appts' : ''}`}
                      onClick={() => selectDate(date)}
                    >
                      <div className="cal-cell-date">{date.getDate()}</div>
                      {dayAppts.length > 0 && (
                        <div className="cal-cell-dots">
                          {Object.entries(counts).slice(0, 3).map(([status, count]) => (
                            <div key={status} className="cal-dot-group">
                              <div className="cal-dot" style={{ background: STATUS_COLORS[status]?.dot || '#999' }} />
                              {count > 1 && <span className="cal-dot-count">{count}</span>}
                            </div>
                          ))}
                        </div>
                      )}
                      {dayAppts.length > 0 && <div className="cal-cell-total">{dayAppts.length}</div>}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="cal-legend">
              {Object.entries(STATUS_COLORS).map(([status, colors]) => (
                <div key={status} className="cal-legend-item">
                  <div className="cal-dot" style={{ background: colors.dot }} />
                  <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card cal-month-summary">
            <div className="cal-summary-title">
              {t('calendar.overview', { month: MONTHS[viewMonth] })}
            </div>
            <div className="cal-summary-stats">
              {['pending','confirmed','completed','cancelled'].map(s => {
                const count = appointments.filter(a => {
                  const d = new Date(a.appointmentDate);
                  return d.getFullYear() === viewYear && d.getMonth() === viewMonth && a.status === s;
                }).length;
                return (
                  <div key={s} className="cal-summary-stat">
                    <div className="cal-summary-dot" style={{ background: STATUS_COLORS[s]?.dot }} />
                    <div className="cal-summary-count">{count}</div>
                    <div className="cal-summary-label">{s.charAt(0).toUpperCase()+s.slice(1)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="cal-detail-col">
          <CalendarSyncPanel />
          {!selectedDate ? (
            <div className="cal-no-date card">
              <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
              <h3>{t('calendar.selectDate')}</h3>
              <p>{t('calendar.clickDate')}</p>
            </div>
          ) : (
            <div className="cal-day-panel card">
              <div className="cal-day-header">
                <div>
                  <div className="cal-day-label">{selectedDate.toLocaleDateString(undefined, { weekday: 'long' })}</div>
                  <div className="cal-day-date">{selectedDate.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                </div>
                <div className="cal-day-count">
                  {selectedAppts.length} <span>{selectedAppts.length !== 1 ? t('calendar.appts') : t('calendar.appt')}</span>
                </div>
              </div>

              {selectedAppts.length === 0 ? (
                <div className="cal-no-appts">
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🏖️</div>
                  <p>{t('calendar.noAppointments')}</p>
                </div>
              ) : (
                <div className="cal-appt-list">
                  {selectedAppts.map(a => {
                    const colors = STATUS_COLORS[a.status] || {};
                    return (
                      <div key={a._id} className="cal-appt-card" style={{ borderLeftColor: colors.dot || 'var(--border)' }}>
                        <div className="cal-appt-time"><Clock size={13}/>{a.startTime} – {a.endTime}</div>
                        <div className="cal-appt-service">{a.service?.name || 'Service'}</div>
                        <div className="cal-appt-customer">
                          <div className="cal-cust-row"><User size={12}/> {a.customer.name}</div>
                          <div className="cal-cust-row"><Phone size={12}/> {a.customer.phone}</div>
                          {a.customer.email && <div className="cal-cust-row"><Mail size={12}/> {a.customer.email}</div>}
                        </div>
                        <div className="cal-appt-footer">
                          <span className={`badge badge-${a.status}`}>{a.status}</span>
                          <span className="cal-appt-amount">₹{a.totalAmount}</span>
                        </div>
                        {['pending','confirmed'].includes(a.status) && (
                          <div className="cal-appt-actions">
                            {a.status === 'pending' && (
                              <button className="btn btn-success btn-sm" style={{ fontSize: 12 }} disabled={updatingId === a._id}
                                onClick={() => changeStatus(a._id, 'confirmed')}>
                                {updatingId === a._id ? <span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /> : `✓ ${t('appointments.confirm')}`}
                              </button>
                            )}
                            {a.status === 'confirmed' && (
                              <button className="btn btn-primary btn-sm" style={{ fontSize: 12 }} disabled={updatingId === a._id}
                                onClick={() => changeStatus(a._id, 'completed')}>
                                {updatingId === a._id ? <span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /> : `✓ ${t('appointments.complete')}`}
                              </button>
                            )}
                            <button className="btn btn-ghost btn-sm" style={{ fontSize: 12, color: 'var(--error)' }} disabled={updatingId === a._id}
                              onClick={() => changeStatus(a._id, 'cancelled')}>
                              {t('appointments.cancelled')}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
