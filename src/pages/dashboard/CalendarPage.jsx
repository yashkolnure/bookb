import { useEffect, useState, useCallback } from 'react';
import { appointmentAPI } from '../../api/api';
import { ChevronLeft, ChevronRight, Clock, Phone, Mail, User } from 'lucide-react';
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
  // Returns array of { date: Date | null } for the calendar grid (Mon-start)
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Convert to Mon-start: Sun(0)->6, Mon(1)->0 ...
  const offset = (firstDay + 6) % 7;
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  return cells;
}

export default function CalendarPage() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedAppts, setSelectedAppts] = useState([]);
  const [dayLoading, setDayLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  // Load all appointments for the visible month (up to 200)
  const loadMonth = useCallback(async (year, month) => {
    setLoading(true);
    try {
      // We fetch all and filter client-side (provider list supports date filter per-day only)
      // Fetch with a high limit for the month
      const res = await appointmentAPI.getProviderList({ limit: 200, page: 1 });
      setAppointments(res.data.appointments || []);
    } catch {
      toast.error('Could not load appointments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMonth(viewYear, viewMonth); }, [viewYear, viewMonth, loadMonth]);

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

  // Group appointments by date string yyyy-mm-dd
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
    const dayAppts = (apptByDate[key] || []).sort((a, b) => a.startTime.localeCompare(b.startTime));
    setSelectedAppts(dayAppts);
  };

  const changeStatus = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const res = await appointmentAPI.updateStatus(id, newStatus);
      const updated = res.data.appointment;
      setAppointments(prev => prev.map(a => a._id === id ? updated : a));
      setSelectedAppts(prev => prev.map(a => a._id === id ? updated : a));
      toast.success(`Marked as ${newStatus}`);
    } catch { toast.error('Failed'); } finally { setUpdatingId(null); }
  };

  const cells = getDaysInMonth(viewYear, viewMonth);

  const todayKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  return (
    <div className="cal-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Calendar</h1>
          <p className="page-subtitle">View and manage your booked appointments by date</p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => {
          setViewYear(today.getFullYear()); setViewMonth(today.getMonth());
          selectDate(today);
        }}>Today</button>
      </div>

      <div className="cal-layout">
        {/* Left: Calendar */}
        <div className="cal-main-col">
          <div className="card cal-card">
            {/* Month nav */}
            <div className="cal-nav">
              <button className="btn btn-ghost btn-sm" onClick={prevMonth}><ChevronLeft size={18}/></button>
              <h2 className="cal-month-title">{MONTHS[viewMonth]} {viewYear}</h2>
              <button className="btn btn-ghost btn-sm" onClick={nextMonth}><ChevronRight size={18}/></button>
            </div>

            {/* Day headers */}
            <div className="cal-dow-row">
              {DAYS_HEADER.map(d => <div key={d} className="cal-dow-cell">{d}</div>)}
            </div>

            {/* Cells */}
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

                  // Count by status
                  const counts = {};
                  dayAppts.forEach(a => { counts[a.status] = (counts[a.status] || 0) + 1; });

                  return (
                    <div
                      key={key}
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
                      {dayAppts.length > 0 && (
                        <div className="cal-cell-total">{dayAppts.length}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Legend */}
            <div className="cal-legend">
              {Object.entries(STATUS_COLORS).map(([status, colors]) => (
                <div key={status} className="cal-legend-item">
                  <div className="cal-dot" style={{ background: colors.dot }} />
                  <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly summary */}
          <div className="card cal-month-summary">
            <div className="cal-summary-title">
              {MONTHS[viewMonth]} Overview
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

        {/* Right: Day detail panel */}
        <div className="cal-detail-col">
          {!selectedDate ? (
            <div className="cal-no-date card">
              <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
              <h3>Select a date</h3>
              <p>Click any date on the calendar to see appointments for that day.</p>
            </div>
          ) : (
            <div className="cal-day-panel card">
              <div className="cal-day-header">
                <div>
                  <div className="cal-day-label">
                    {selectedDate.toLocaleDateString('en-IN', { weekday: 'long' })}
                  </div>
                  <div className="cal-day-date">
                    {selectedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
                <div className="cal-day-count">
                  {selectedAppts.length} <span>appt{selectedAppts.length !== 1 ? 's' : ''}</span>
                </div>
              </div>

              {selectedAppts.length === 0 ? (
                <div className="cal-no-appts">
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🏖️</div>
                  <p>No appointments on this day</p>
                </div>
              ) : (
                <div className="cal-appt-list">
                  {selectedAppts.map(a => {
                    const colors = STATUS_COLORS[a.status] || {};
                    return (
                      <div key={a._id} className="cal-appt-card" style={{ borderLeftColor: colors.dot || 'var(--border)' }}>
                        <div className="cal-appt-time">
                          <Clock size={13} />
                          {a.startTime} – {a.endTime}
                        </div>
                        <div className="cal-appt-service">{a.service?.name || 'Service'}</div>
                        <div className="cal-appt-customer">
                          <div className="cal-cust-row"><User size={12} /> {a.customer.name}</div>
                          <div className="cal-cust-row"><Phone size={12} /> {a.customer.phone}</div>
                          {a.customer.email && <div className="cal-cust-row"><Mail size={12} /> {a.customer.email}</div>}
                        </div>
                        <div className="cal-appt-footer">
                          <span className={`badge badge-${a.status}`}>{a.status}</span>
                          <span className="cal-appt-amount">₹{a.totalAmount}</span>
                        </div>

                        {/* Quick actions */}
                        {['pending','confirmed'].includes(a.status) && (
                          <div className="cal-appt-actions">
                            {a.status === 'pending' && (
                              <button
                                className="btn btn-success btn-sm"
                                style={{ fontSize: 12 }}
                                disabled={updatingId === a._id}
                                onClick={() => changeStatus(a._id, 'confirmed')}
                              >
                                {updatingId === a._id ? <span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /> : '✓ Confirm'}
                              </button>
                            )}
                            {a.status === 'confirmed' && (
                              <button
                                className="btn btn-primary btn-sm"
                                style={{ fontSize: 12 }}
                                disabled={updatingId === a._id}
                                onClick={() => changeStatus(a._id, 'completed')}
                              >
                                {updatingId === a._id ? <span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /> : '✓ Complete'}
                              </button>
                            )}
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ fontSize: 12, color: 'var(--error)' }}
                              disabled={updatingId === a._id}
                              onClick={() => changeStatus(a._id, 'cancelled')}
                            >
                              Cancel
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
