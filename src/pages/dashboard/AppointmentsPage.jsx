import { useEffect, useState } from 'react';
import { appointmentAPI } from '../../api/api';
import { Search, Filter, ChevronLeft, ChevronRight, Check, X, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import './ServicesPage.css';

const STATUS_OPTIONS = ['', 'pending', 'confirmed', 'completed', 'cancelled'];

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [updatingId, setUpdatingId] = useState(null);
  const [selected, setSelected] = useState(null);

  const load = (p = page, s = status, d = date) => {
    setLoading(true);
    const params = { page: p, limit: 15 };
    if (s) params.status = s;
    if (d) params.date = d;
    appointmentAPI.getProviderList(params)
      .then(r => {
        setAppointments(r.data.appointments);
        setTotalPages(r.data.pages);
        setTotal(r.data.total);
      })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(page, status, date); }, [page, status, date]);

  const changeStatus = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const res = await appointmentAPI.updateStatus(id, newStatus);
      setAppointments(prev => prev.map(a => a._id === id ? res.data.appointment : a));
      if (selected?._id === id) setSelected(res.data.appointment);
      toast.success(`Marked as ${newStatus}`);
    } catch { toast.error('Failed'); } finally { setUpdatingId(null); }
  };

  const handleFilter = (newStatus) => { setStatus(newStatus); setPage(1); };
  const handleDate = (d) => { setDate(d); setPage(1); };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Appointments</h1>
          <p className="page-subtitle">{total} total appointments</p>
        </div>
      </div>

      {/* Filters */}
      <div className="appt-filters card">
        <div className="filter-group">
          <label className="form-label">Status</label>
          <div className="filter-tabs">
            {STATUS_OPTIONS.map(s => (
              <button key={s||'all'} className={`filter-tab ${status===s?'active':''}`} onClick={() => handleFilter(s)}>
                {s ? s.charAt(0).toUpperCase()+s.slice(1) : 'All'}
              </button>
            ))}
          </div>
        </div>
        <div className="filter-group">
          <label className="form-label">Filter by Date</label>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <input type="date" className="form-input" style={{width:'auto'}} value={date} onChange={e => handleDate(e.target.value)} />
            {date && <button className="btn btn-ghost btn-sm" onClick={() => handleDate('')}><X size={14}/></button>}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="page-loading" style={{minHeight:'30vh'}}><div className="spinner" style={{width:28,height:28,borderWidth:3}}/></div>
      ) : appointments.length === 0 ? (
        <div className="empty-state" style={{border:'1px solid var(--border)',borderRadius:'var(--radius-lg)',background:'var(--warm-white)'}}>
          <div className="empty-state-icon">📅</div>
          <h3>No appointments found</h3>
          <p>Try adjusting your filters.</p>
        </div>
      ) : (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Date & Time</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(a => (
                  <tr key={a._id} style={{cursor:'pointer'}} onClick={() => setSelected(a)}>
                    <td><code style={{fontSize:12}}>#{a.appointmentId}</code></td>
                    <td>
                      <div style={{fontWeight:600,fontSize:14}}>{a.customer.name}</div>
                      <div style={{fontSize:12,color:'var(--ink-muted)'}}>{a.customer.phone}</div>
                    </td>
                    <td style={{fontSize:14}}>{a.service?.name}</td>
                    <td style={{fontSize:13}}>
                      <div>{new Date(a.appointmentDate).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</div>
                      <div style={{color:'var(--ink-muted)'}}>{a.startTime}</div>
                    </td>
                    <td style={{fontWeight:600}}>₹{a.totalAmount}</td>
                    <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{display:'flex',gap:4}}>
                        {a.status === 'pending' && (
                          <button className="btn btn-success btn-sm" disabled={updatingId===a._id}
                            onClick={() => changeStatus(a._id, 'confirmed')}>
                            <Check size={13}/> Confirm
                          </button>
                        )}
                        {a.status === 'confirmed' && (
                          <button className="btn btn-primary btn-sm" disabled={updatingId===a._id}
                            onClick={() => changeStatus(a._id, 'completed')}>
                            <Clock size={13}/> Complete
                          </button>
                        )}
                        {['pending','confirmed'].includes(a.status) && (
                          <button className="btn btn-ghost btn-sm" disabled={updatingId===a._id}
                            onClick={() => changeStatus(a._id, 'cancelled')}>
                            <X size={13}/>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button className="btn btn-outline btn-sm" disabled={page===1} onClick={() => setPage(p=>p-1)}>
                <ChevronLeft size={14}/> Prev
              </button>
              <span>Page {page} of {totalPages}</span>
              <button className="btn btn-outline btn-sm" disabled={page===totalPages} onClick={() => setPage(p=>p+1)}>
                Next <ChevronRight size={14}/>
              </button>
            </div>
          )}
        </>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setSelected(null)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Appointment #{selected.appointmentId}</h2>
              <button className="modal-close" onClick={() => setSelected(null)}>×</button>
            </div>
            <div className="appt-detail">
              <div className="detail-section">
                <div className="detail-sec-title">Customer</div>
                <div className="detail-row-d"><span>Name</span><span>{selected.customer.name}</span></div>
                <div className="detail-row-d"><span>Email</span><span>{selected.customer.email}</span></div>
                <div className="detail-row-d"><span>Phone</span><span>{selected.customer.phone}</span></div>
                {selected.customer.notes && <div className="detail-row-d"><span>Notes</span><span>{selected.customer.notes}</span></div>}
              </div>
              <div className="detail-section">
                <div className="detail-sec-title">Appointment</div>
                <div className="detail-row-d"><span>Service</span><span>{selected.service?.name}</span></div>
                <div className="detail-row-d"><span>Date</span><span>{new Date(selected.appointmentDate).toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}</span></div>
                <div className="detail-row-d"><span>Time</span><span>{selected.startTime} – {selected.endTime}</span></div>
                <div className="detail-row-d"><span>Status</span><span className={`badge badge-${selected.status}`}>{selected.status}</span></div>
              </div>
              <div className="detail-section">
                <div className="detail-sec-title">Payment</div>
                <div className="detail-row-d"><span>Original</span><span>₹{selected.originalPrice}</span></div>
                {selected.discountAmount > 0 && <div className="detail-row-d"><span>Discount</span><span style={{color:'var(--success)'}}>−₹{selected.discountAmount}</span></div>}
                <div className="detail-row-d"><span>Total</span><strong>₹{selected.totalAmount}</strong></div>
                <div className="detail-row-d"><span>Payment</span><span className={`badge badge-${selected.payment?.status==='paid'?'paid':'pending'}`}>{selected.payment?.status||'pending'}</span></div>
              </div>
              {selected.cancellationReason && (
                <div style={{padding:'12px',background:'#fce4ec20',borderRadius:8,border:'1px solid var(--error)',fontSize:14}}>
                  <strong>Cancellation:</strong> {selected.cancellationReason}
                </div>
              )}
            </div>
            {/* Actions */}
            <div style={{display:'flex',gap:8,marginTop:20,flexWrap:'wrap'}}>
              {selected.status === 'pending' && (
                <button className="btn btn-success" onClick={() => changeStatus(selected._id, 'confirmed')} disabled={updatingId===selected._id}>
                  <Check size={15}/> Confirm
                </button>
              )}
              {selected.status === 'confirmed' && (
                <button className="btn btn-primary" onClick={() => changeStatus(selected._id, 'completed')} disabled={updatingId===selected._id}>
                  <Clock size={15}/> Mark Completed
                </button>
              )}
              {['pending','confirmed'].includes(selected.status) && (
                <button className="btn btn-danger" onClick={() => changeStatus(selected._id, 'cancelled')} disabled={updatingId===selected._id}>
                  <X size={15}/> Cancel
                </button>
              )}
              <button className="btn btn-outline" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
