import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { serviceAPI, appointmentAPI, couponAPI } from '../api/api';
import { Clock, ChevronLeft, ChevronRight, Tag, X, Check, User, Mail, Phone, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import './BookingPage.css';

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function Calendar({ selectedDate, onSelect, service }) {
  const [viewDate, setViewDate] = useState(new Date());
  const today = new Date(); today.setHours(0,0,0,0);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const isBlocked = (d) => {
    if (!d) return true;
    const date = new Date(year, month, d);
    if (date < today) return true;
    const dayName = DAYS[date.getDay()];
    const avail = service?.availability?.find(a => a.day === dayName);
    if (!avail || !avail.isAvailable || !avail.slots?.length) return true;
    const blocked = service?.blockedDates?.some(bd => new Date(bd).toDateString() === date.toDateString());
    return blocked;
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const selected = selectedDate ? new Date(selectedDate) : null;

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const todayMonth = today.getMonth(); const todayYear = today.getFullYear();
  const canPrev = year > todayYear || (year === todayYear && month > todayMonth);

  return (
    <div className="cal">
      <div className="cal-header">
        <button className="btn btn-ghost btn-sm" onClick={prevMonth} disabled={!canPrev}><ChevronLeft size={16}/></button>
        <span className="cal-title">{MONTHS[month]} {year}</span>
        <button className="btn btn-ghost btn-sm" onClick={nextMonth}><ChevronRight size={16}/></button>
      </div>
      <div className="cal-grid">
        {DAYS.map(d => <div key={d} className="cal-dow">{d[0]}</div>)}
        {cells.map((d, i) => {
          const date = d ? new Date(year, month, d) : null;
          const blocked = isBlocked(d);
          const isSelected = selected && date && selected.toDateString() === date.toDateString();
          const isToday = date && date.toDateString() === today.toDateString();
          return (
            <button
              key={i}
              className={`cal-day ${!d ? 'cal-empty' : ''} ${blocked ? 'cal-blocked' : 'cal-available'} ${isSelected ? 'cal-selected' : ''} ${isToday ? 'cal-today' : ''}`}
              disabled={blocked || !d}
              onClick={() => d && onSelect(`${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`)}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function BookingPage() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1); // 1=datetime, 2=details, 3=confirm, 4=done
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponResult, setCouponResult] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [customer, setCustomer] = useState({ name:'', email:'', phone:'', notes:'' });
  const [submitting, setSubmitting] = useState(false);
  const [appointment, setAppointment] = useState(null);

  useEffect(() => {
    serviceAPI.getById(serviceId)
      .then(r => { setService(r.data.service); setStore(r.data.service.store); })
      .catch(() => toast.error('Service not found'))
      .finally(() => setLoading(false));
  }, [serviceId]);

  useEffect(() => {
    if (!selectedDate) return;
    setSelectedSlot(null); setSlots([]);
    setSlotsLoading(true);
    serviceAPI.getSlots(serviceId, selectedDate)
      .then(r => setSlots(r.data.slots))
      .catch(() => toast.error('Could not load slots'))
      .finally(() => setSlotsLoading(false));
  }, [selectedDate, serviceId]);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const price = service.discountedPrice || service.price;
      const res = await couponAPI.validate({ code: couponCode, storeId: store._id || store, amount: price });
      setCouponResult(res.data);
      toast.success(`Coupon applied! Saved ₹${res.data.discountAmount}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
      setCouponResult(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleSubmit = async () => {
    const { name, email, phone } = customer;
    if (!name || !email || !phone) { toast.error('Please fill all required fields'); return; }
    setSubmitting(true);
    try {
      const storeId = typeof store === 'object' ? store._id : store;
      const opts = Object.entries(selectedOptions).map(([label, value]) => ({ label, value }));
      const res = await appointmentAPI.create({
        serviceId, storeId,
        appointmentDate: selectedDate,
        startTime: selectedSlot.startTime,
        customer,
        selectedOptions: opts,
        couponCode: couponResult ? couponCode : undefined,
      });
      setAppointment(res.data.appointment);
      setStep(4);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="page-loading"><div className="spinner" style={{width:36,height:36,borderWidth:3}}/><p>Loading service...</p></div>;
  if (!service) return <div className="page-loading"><p>Service not found.</p><Link to="/" className="btn btn-primary">Go Home</Link></div>;

  const storeId = typeof store === 'object' ? store._id : store;
  const storeSlug = typeof store === 'object' ? store.slug : '';
  const price = service.discountedPrice || service.price;
  const hasDiscount = service.discountedPrice && service.discountedPrice < service.price;
  const finalAmount = couponResult ? couponResult.finalAmount : price;

  return (
    <div className="booking-page">
      <div className="booking-nav">
        <div className="container">
          <Link to={storeSlug ? `/store/${storeSlug}` : '/'} className="btn btn-ghost btn-sm">
            <ChevronLeft size={16}/> {typeof store === 'object' ? store.name : 'Back'}
          </Link>
          <span className="booking-nav-title">Book Appointment</span>
        </div>
      </div>

      {step < 4 && (
        <div className="booking-steps">
          <div className="container">
            <div className="steps-bar">
              {['Date & Time','Your Details','Review & Pay'].map((s,i) => (
                <div key={s} className={`step-item ${step>i+1?'done':''} ${step===i+1?'active':''}`}>
                  <div className="step-num">{step>i+1 ? <Check size={13}/> : i+1}</div>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="container booking-layout">
        {step < 4 && (
          <div className="booking-main animate-fadeIn">
            {/* Step 1 */}
            {step === 1 && (
              <div className="booking-card card">
                <h2 className="booking-section-title">Choose Date & Time</h2>
                <Calendar selectedDate={selectedDate} onSelect={setSelectedDate} service={service} />
                {selectedDate && (
                  <div className="slots-section">
                    <h3 className="slots-title">Available Slots for {new Date(selectedDate+'T00:00').toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}</h3>
                    {slotsLoading ? (
                      <div style={{display:'flex',gap:8,alignItems:'center',padding:'16px 0'}}><div className="spinner"/><span style={{color:'var(--ink-muted)',fontSize:14}}>Loading slots...</span></div>
                    ) : slots.length === 0 ? (
                      <p className="slots-empty">No slots available for this date.</p>
                    ) : (
                      <div className="slots-grid">
                        {slots.map(s => (
                          <button key={s.startTime}
                            className={`slot-btn ${selectedSlot?.startTime===s.startTime?'active':''}`}
                            onClick={() => setSelectedSlot(s)}>
                            {s.startTime}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {service.options?.length > 0 && (
                  <div className="service-options-section">
                    <h3 className="slots-title">Service Options</h3>
                    {service.options.map(opt => (
                      <div key={opt.label} className="form-group">
                        <label className="form-label">{opt.label}</label>
                        <select className="form-input" value={selectedOptions[opt.label]||''} onChange={e => setSelectedOptions(p=>({...p,[opt.label]:e.target.value}))}>
                          <option value="">Select {opt.label}</option>
                          {opt.values.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                )}
                <div className="booking-step-footer">
                  <button className="btn btn-primary btn-lg" disabled={!selectedDate || !selectedSlot}
                    onClick={() => setStep(2)}>
                    Continue <ChevronRight size={16}/>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="booking-card card">
                <h2 className="booking-section-title">Your Details</h2>
                <p className="booking-note">No account required — just fill in your details and you're set.</p>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label"><User size={13}/> Full Name *</label>
                    <input className="form-input" placeholder="Jane Smith" value={customer.name}
                      onChange={e => setCustomer(p=>({...p,name:e.target.value}))} required autoFocus />
                  </div>
                  <div className="form-group">
                    <label className="form-label"><Phone size={13}/> Phone Number *</label>
                    <input className="form-input" placeholder="+91 98765 43210" value={customer.phone}
                      onChange={e => setCustomer(p=>({...p,phone:e.target.value}))} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label"><Mail size={13}/> Email Address *</label>
                  <input type="email" className="form-input" placeholder="jane@example.com" value={customer.email}
                    onChange={e => setCustomer(p=>({...p,email:e.target.value}))} required />
                </div>
                <div className="form-group">
                  <label className="form-label"><FileText size={13}/> Notes (optional)</label>
                  <textarea className="form-input" placeholder="Any special requests or notes..." value={customer.notes}
                    onChange={e => setCustomer(p=>({...p,notes:e.target.value}))} rows={3} />
                </div>

                {/* Coupon */}
                <div className="coupon-section">
                  <h3 className="slots-title"><Tag size={15}/> Have a coupon?</h3>
                  <div className="coupon-input-row">
                    <input className="form-input" placeholder="Enter coupon code" value={couponCode}
                      onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponResult(null); }} />
                    <button className="btn btn-outline" onClick={applyCoupon} disabled={couponLoading || !couponCode}>
                      {couponLoading ? <span className="spinner"/> : 'Apply'}
                    </button>
                    {couponResult && <button className="btn btn-ghost" onClick={() => { setCouponResult(null); setCouponCode(''); }}><X size={16}/></button>}
                  </div>
                  {couponResult && (
                    <div className="coupon-success">
                      <Check size={14}/> Coupon <strong>{couponResult.coupon.code}</strong> applied — saving ₹{couponResult.discountAmount}
                    </div>
                  )}
                </div>

                <div className="booking-step-footer">
                  <button className="btn btn-outline" onClick={() => setStep(1)}><ChevronLeft size={16}/> Back</button>
                  <button className="btn btn-primary btn-lg" onClick={() => setStep(3)}
                    disabled={!customer.name || !customer.email || !customer.phone}>
                    Review Booking <ChevronRight size={16}/>
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="booking-card card">
                <h2 className="booking-section-title">Review & Confirm</h2>
                <div className="review-summary">
                  <div className="review-row">
                    <span>Date</span>
                    <span>{new Date(selectedDate+'T00:00').toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</span>
                  </div>
                  <div className="review-row">
                    <span>Time</span>
                    <span>{selectedSlot?.startTime} – {selectedSlot?.endTime}</span>
                  </div>
                  <div className="review-row">
                    <span>Name</span>
                    <span>{customer.name}</span>
                  </div>
                  <div className="review-row">
                    <span>Email</span>
                    <span>{customer.email}</span>
                  </div>
                  <div className="review-row">
                    <span>Phone</span>
                    <span>{customer.phone}</span>
                  </div>
                  {Object.entries(selectedOptions).map(([k,v]) => v && (
                    <div key={k} className="review-row"><span>{k}</span><span>{v}</span></div>
                  ))}
                  <div className="divider"/>
                  <div className="review-row">
                    <span>Service Price</span>
                    <span>₹{price}</span>
                  </div>
                  {couponResult && (
                    <div className="review-row discount-row">
                      <span>Discount ({couponResult.coupon.code})</span>
                      <span>−₹{couponResult.discountAmount}</span>
                    </div>
                  )}
                  <div className="review-row total-row">
                    <span>Total</span>
                    <span>₹{finalAmount}</span>
                  </div>
                </div>
                <div className="booking-step-footer">
                  <button className="btn btn-outline" onClick={() => setStep(2)}><ChevronLeft size={16}/> Back</button>
                  <button className="btn btn-gold btn-lg" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? <span className="spinner" style={{borderTopColor:'#fff'}}/> : 'Confirm Booking →'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4 - Done */}
        {step === 4 && appointment && (
          <div className="booking-done animate-fadeUp">
            <div className="done-icon">✓</div>
            <h2>Booking Confirmed!</h2>
            <p>Your appointment has been successfully booked. You'll receive a confirmation email at <strong>{appointment.customer.email}</strong>.</p>
            <div className="done-details card">
              <div className="review-row"><span>Appointment ID</span><strong>{appointment.appointmentId}</strong></div>
              <div className="review-row"><span>Service</span><span>{service.name}</span></div>
              <div className="review-row"><span>Date</span><span>{new Date(selectedDate+'T00:00').toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'long'})}</span></div>
              <div className="review-row"><span>Time</span><span>{selectedSlot?.startTime}</span></div>
              <div className="review-row total-row"><span>Total Paid</span><span>₹{appointment.totalAmount}</span></div>
            </div>
            <div className="done-actions">
              <Link to={`/appointments/${appointment._id}/manage?token=${appointment.managementToken}`} className="btn btn-primary">
                Manage Appointment
              </Link>
              <Link to={storeSlug ? `/store/${storeSlug}` : '/'} className="btn btn-outline">
                Back to Store
              </Link>
            </div>
          </div>
        )}

        {/* Sidebar */}
        {step < 4 && (
          <div className="booking-sidebar">
            <div className="card service-summary-card">
              <div className="service-sum-header">
                <div className="service-sum-icon">{service.name[0]}</div>
                <div>
                  <h3>{service.name}</h3>
                  {typeof store === 'object' && <p>{store.name}</p>}
                </div>
              </div>
              <div className="divider"/>
              <div className="service-sum-details">
                <div className="sum-row"><Clock size={14}/> {service.duration} minutes</div>
                {hasDiscount && <div className="sum-row" style={{textDecoration:'line-through',color:'var(--ink-muted)'}}>₹{service.price}</div>}
                <div className="sum-price">₹{finalAmount}</div>
                {couponResult && <div className="sum-saving">You save ₹{couponResult.discountAmount}</div>}
              </div>
              {selectedDate && selectedSlot && (
                <>
                  <div className="divider"/>
                  <div className="sum-selection">
                    <div className="sum-sel-label">Selected</div>
                    <div className="sum-sel-val">{new Date(selectedDate+'T00:00').toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'})}</div>
                    <div className="sum-sel-val">{selectedSlot.startTime} – {selectedSlot.endTime}</div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
