import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
    return service?.blockedDates?.some(bd => new Date(bd).toDateString() === date.toDateString());
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
            <button key={i}
              className={`cal-day ${!d ? 'cal-empty' : ''} ${blocked ? 'cal-blocked' : 'cal-available'} ${isSelected ? 'cal-selected' : ''} ${isToday ? 'cal-today' : ''}`}
              disabled={blocked || !d}
              onClick={() => d && onSelect(`${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`)}
            >{d}</button>
          );
        })}
      </div>
    </div>
  );
}

/* Helper: calculate price based on pricingType */
function calcPrice(service, durationMin) {
  if (!service) return 0;
  const basePrice = service.discountedPrice || service.price;
  if (!service.pricingType || service.pricingType === 'fixed') return basePrice;
  const unitMap = { per_hour: 60, per_30min: 30, per_15min: 15 };
  const unit = unitMap[service.pricingType] || 60;
  return Math.round((basePrice / unit) * durationMin);
}

export default function BookingPage() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [service, setService] = useState(null);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
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
  // Duration for time-based pricing
  const [sessionDuration, setSessionDuration] = useState(null);

  useEffect(() => {
    serviceAPI.getById(serviceId)
      .then(r => {
        const svc = r.data.service;
        setService(svc);
        setStore(svc.store);
        // Set default duration
        if (svc.pricingType && svc.pricingType !== 'fixed') {
          setSessionDuration(svc.minDuration || svc.duration || 60);
        }
      })
      .catch(() => toast.error(t('booking.serviceNotFound')))
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

  const isTimeBased = service?.pricingType && service.pricingType !== 'fixed';
  const effectiveDuration = isTimeBased ? sessionDuration : (service?.duration || 60);
  const computedPrice = service ? calcPrice(service, effectiveDuration) : 0;
  const finalAmount = couponResult ? couponResult.finalAmount : computedPrice;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const storeId2 = typeof store === 'object' ? store._id : store;
      const res = await couponAPI.validate({ code: couponCode, storeId: storeId2, amount: computedPrice });
      setCouponResult(res.data);
      toast.success(t('booking.couponApplied', { amount: res.data.discountAmount }));
    } catch (err) {
      toast.error(err.response?.data?.message || t('booking.invalidCoupon'));
      setCouponResult(null);
    } finally { setCouponLoading(false); }
  };

  const handleSubmit = async () => {
    const { name, email, phone } = customer;
    if (!name || !email || !phone) { toast.error(t('booking.fillRequired')); return; }
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
        durationMinutes: isTimeBased ? effectiveDuration : undefined,
      });
      setAppointment(res.data.appointment);
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || t('booking.bookingFailed'));
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="page-loading"><div className="spinner" style={{width:36,height:36,borderWidth:3}}/><p>{t('booking.loadingService')}</p></div>;
  if (!service) return <div className="page-loading"><p>{t('booking.serviceNotFound')}</p><Link to="/" className="btn btn-primary">{t('common.goHome')}</Link></div>;

  const storeSlug = typeof store === 'object' ? store.slug : '';
  const hasDiscount = service.discountedPrice && service.discountedPrice < service.price;

  // Duration step options for time-based pricing
  const unitMap = { per_hour: 60, per_30min: 30, per_15min: 15 };
  const unit = isTimeBased ? (unitMap[service.pricingType] || 60) : 60;
  const minDur = service.minDuration || unit;
  const maxDur = service.maxDuration || (unit * 8);
  const durationOptions = [];
  if (isTimeBased) {
    for (let d = minDur; d <= maxDur; d += unit) durationOptions.push(d);
  }

  return (
    <div className="booking-page">
      <div className="booking-nav">
        <div className="container">
          <Link to={storeSlug ? `/store/${storeSlug}` : '/'} className="btn btn-ghost btn-sm">
            <ChevronLeft size={16}/> {typeof store === 'object' ? store.name : t('common.back')}
          </Link>
          <span className="booking-nav-title">{t('booking.bookAppointment')}</span>
        </div>
      </div>

      {step < 3 && (
        <div className="booking-steps">
          <div className="container">
            <div className="steps-bar">
              {[t('booking.step1'), t('booking.step2')].map((s,i) => (
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
        {step < 3 && (
          <div className="booking-main animate-fadeIn">
            {/* Step 1 */}
            {step === 1 && (
              <div className="booking-card card">
                <h2 className="booking-section-title">{t('booking.chooseDatetime')}</h2>
                <Calendar selectedDate={selectedDate} onSelect={setSelectedDate} service={service}/>

                {/* Duration picker for time-based pricing */}
                {isTimeBased && (
                  <div className="slots-section">
                    <h3 className="slots-title">{t('booking.selectDuration')}</h3>
                    <div className="slots-grid">
                      {durationOptions.map(d => (
                        <button key={d}
                          className={`slot-btn ${sessionDuration === d ? 'active' : ''}`}
                          onClick={() => { setSessionDuration(d); setCouponResult(null); }}>
                          {d} {t('common.min')}
                        </button>
                      ))}
                    </div>
                    {sessionDuration && (
                      <div style={{ marginTop: 10, fontSize: 14, color: 'var(--ink-muted)', fontWeight: 600 }}>
                        {t('booking.pricePreview', { amount: calcPrice(service, sessionDuration) })}
                      </div>
                    )}
                  </div>
                )}

                {selectedDate && (
                  <div className="slots-section">
                    <h3 className="slots-title">{t('booking.availableSlots', { date: new Date(selectedDate+'T00:00').toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long'}) })}</h3>
                    {slotsLoading ? (
                      <div style={{display:'flex',gap:8,alignItems:'center',padding:'16px 0'}}><div className="spinner"/><span style={{color:'var(--ink-muted)',fontSize:14}}>{t('booking.loadingSlots')}</span></div>
                    ) : slots.length === 0 ? (
                      <p className="slots-empty">{t('booking.noSlots')}</p>
                    ) : (
                      <div className="slots-grid">
                        {slots.map(s => (
                          <button key={s.startTime} className={`slot-btn ${selectedSlot?.startTime===s.startTime?'active':''}`}
                            onClick={() => setSelectedSlot(s)}>{s.startTime}</button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {service.options?.length > 0 && (
                  <div className="service-options-section">
                    <h3 className="slots-title">{t('booking.serviceOptions')}</h3>
                    {service.options.map(opt => (
                      <div key={opt.label} className="form-group">
                        <label className="form-label">{opt.label}</label>
                        <select className="form-input" value={selectedOptions[opt.label]||''} onChange={e => setSelectedOptions(p=>({...p,[opt.label]:e.target.value}))}>
                          <option value="">{t('booking.selectLabel', { option: opt.label })}</option>
                          {opt.values.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                )}

                <div className="booking-step-footer">
                  <button className="btn btn-primary btn-lg"
                    disabled={!selectedDate || !selectedSlot || (isTimeBased && !sessionDuration)}
                    onClick={() => setStep(2)}>
                    {t('booking.continue')} <ChevronRight size={16}/>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 — Details + inline summary + confirm */}
            {step === 2 && (
              <div className="booking-card card">
                <h2 className="booking-section-title">{t('booking.yourDetails')}</h2>
                <p className="booking-note">{t('booking.noAccountRequired')}</p>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label"><User size={13}/> {t('booking.fullName')} *</label>
                    <input className="form-input" placeholder="Jane Smith" value={customer.name}
                      onChange={e => setCustomer(p=>({...p,name:e.target.value}))} required autoFocus/>
                  </div>
                  <div className="form-group">
                    <label className="form-label"><Phone size={13}/> {t('booking.phoneNumber')} *</label>
                    <input className="form-input" placeholder="+91 98765 43210" value={customer.phone}
                      onChange={e => setCustomer(p=>({...p,phone:e.target.value}))} required/>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label"><Mail size={13}/> {t('booking.emailAddress')} *</label>
                  <input type="email" className="form-input" placeholder="jane@example.com" value={customer.email}
                    onChange={e => setCustomer(p=>({...p,email:e.target.value}))} required/>
                </div>
                <div className="form-group">
                  <label className="form-label"><FileText size={13}/> {t('booking.notesOptional')}</label>
                  <textarea className="form-input" placeholder={t('booking.notesPlaceholder')} value={customer.notes}
                    onChange={e => setCustomer(p=>({...p,notes:e.target.value}))} rows={2}/>
                </div>

                <div className="coupon-section">
                  <h3 className="slots-title"><Tag size={15}/> {t('booking.haveCoupon')}</h3>
                  <div className="coupon-input-row">
                    <input className="form-input" placeholder={t('booking.enterCoupon')} value={couponCode}
                      onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponResult(null); }}/>
                    <button className="btn btn-outline" onClick={applyCoupon} disabled={couponLoading || !couponCode}>
                      {couponLoading ? <span className="spinner"/> : t('booking.apply')}
                    </button>
                    {couponResult && <button className="btn btn-ghost" onClick={() => { setCouponResult(null); setCouponCode(''); }}><X size={16}/></button>}
                  </div>
                  {couponResult && (
                    <div className="coupon-success">
                      <Check size={14}/> {t('booking.couponApplied', { amount: couponResult.discountAmount })}
                    </div>
                  )}
                </div>

                {/* Inline booking summary — replaces the old separate review step */}
                <div className="booking-inline-summary">
                  <h3 className="inline-sum-title">{t('booking.reviewBooking')}</h3>
                  <div className="review-summary">
                    <div className="review-row">
                      <span>{t('common.date')}</span>
                      <span>{new Date(selectedDate+'T00:00').toLocaleDateString(undefined,{weekday:'short',day:'numeric',month:'long'})}</span>
                    </div>
                    <div className="review-row">
                      <span>{t('booking.time')}</span>
                      <span>{selectedSlot?.startTime} – {selectedSlot?.endTime}</span>
                    </div>
                    {isTimeBased && sessionDuration && (
                      <div className="review-row">
                        <span>{t('booking.duration')}</span>
                        <span>{sessionDuration} {t('common.minutes')}</span>
                      </div>
                    )}
                    {Object.entries(selectedOptions).map(([k,v]) => v && (
                      <div key={k} className="review-row"><span>{k}</span><span>{v}</span></div>
                    ))}
                    <div className="divider"/>
                    <div className="review-row">
                      <span>{t('booking.servicePrice')}</span>
                      <span>₹{computedPrice}</span>
                    </div>
                    {couponResult && (
                      <div className="review-row discount-row">
                        <span>{t('common.discount')} ({couponResult.coupon.code})</span>
                        <span>−₹{couponResult.discountAmount}</span>
                      </div>
                    )}
                    <div className="review-row total-row">
                      <span>{t('common.total')}</span>
                      <span>₹{finalAmount}</span>
                    </div>
                  </div>
                </div>

                <div className="booking-step-footer">
                  <button className="btn btn-outline" onClick={() => setStep(1)}>
                    <ChevronLeft size={16}/> {t('common.back')}
                  </button>
                  <button className="btn btn-gold btn-lg" onClick={handleSubmit}
                    disabled={submitting || !customer.name || !customer.email || !customer.phone}>
                    {submitting
                      ? <span className="spinner" style={{borderTopColor:'#fff'}}/>
                      : t('booking.confirmBooking')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3 - Done */}
        {step === 3 && appointment && (
          <div className="booking-done animate-fadeUp">
            <div className="done-icon">✓</div>
            <h2>{t('booking.bookingConfirmed')}</h2>
            <p>{t('booking.confirmationDesc')} <strong>{appointment.customer.email}</strong>.</p>
            <div className="done-details card">
              <div className="review-row"><span>{t('booking.appointmentId')}</span><strong>{appointment.appointmentId}</strong></div>
              <div className="review-row"><span>{t('booking.service')}</span><span>{service.name}</span></div>
              <div className="review-row"><span>{t('common.date')}</span><span>{new Date(selectedDate+'T00:00').toLocaleDateString(undefined,{weekday:'short',day:'numeric',month:'long'})}</span></div>
              <div className="review-row"><span>{t('booking.time')}</span><span>{selectedSlot?.startTime}</span></div>
              <div className="review-row total-row"><span>{t('booking.totalPaid')}</span><span>₹{appointment.totalAmount}</span></div>
            </div>
            <div className="done-actions">
              <Link to={`/appointments/${appointment._id}/manage?token=${appointment.managementToken}`} className="btn btn-primary">
                {t('booking.manageAppointment')}
              </Link>
              <Link to={storeSlug ? `/store/${storeSlug}` : '/'} className="btn btn-outline">
                {t('booking.backToStore')}
              </Link>
            </div>
          </div>
        )}

        {/* Sidebar */}
        {step < 3 && (
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
                <div className="sum-row"><Clock size={14}/> {effectiveDuration} {t('common.minutes')}</div>
                {hasDiscount && !isTimeBased && <div className="sum-row" style={{textDecoration:'line-through',color:'var(--ink-muted)'}}>₹{service.price}</div>}
                <div className="sum-price">₹{finalAmount}</div>
                {couponResult && <div className="sum-saving">{t('booking.youSave', { amount: couponResult.discountAmount })}</div>}
              </div>
              {selectedDate && selectedSlot && (
                <>
                  <div className="divider"/>
                  <div className="sum-selection">
                    <div className="sum-sel-label">{t('booking.selected')}</div>
                    <div className="sum-sel-val">{new Date(selectedDate+'T00:00').toLocaleDateString(undefined,{weekday:'short',day:'numeric',month:'short'})}</div>
                    <div className="sum-sel-val">{selectedSlot.startTime} – {selectedSlot.endTime}</div>
                    {isTimeBased && sessionDuration && <div className="sum-sel-val">{sessionDuration} {t('common.minutes')}</div>}
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
