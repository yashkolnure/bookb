import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { serviceAPI } from '../../api/api';
import {
  Plus, Edit2, Trash2, Clock, Tag, Star,
  ChevronDown, ChevronUp, X, Check, Image as ImageIcon, Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import './ServicesPage.css';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const WP_USERNAME = "yashkolnure58@gmail.com";
const WP_APP_PASSWORD = "05mq iTLF UvJU dyaz 7KxQ 8pyc";
const WP_SITE_URL = "https://website.avenirya.com";
const AUTH_HEADER = `Basic ${btoa(`${WP_USERNAME}:${WP_APP_PASSWORD}`)}`;
const WP_API_URL = `${WP_SITE_URL}/wp-json/wp/v2/media`;

const emptyService = {
  name: '', description: '', category: '', tags: '', price: '',
  discountedPrice: '', duration: 60, isActive: true, images: [],
  availability: DAYS.map(day => ({ day, isAvailable: false, slots: [] })),
  options: [],
  pricingType: 'fixed', minDuration: 60, maxDuration: 180,
};

// ── Time helpers ──────────────────────────────────────────────────────────────
function timeToMins(str) {
  const [h, m] = str.split(':').map(Number);
  return h * 60 + m;
}
function minsToTime(m) {
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}
function buildSlots(startStr, endStr, intervalMin, breakStartStr, breakEndStr) {
  const slots = [];
  let cur = timeToMins(startStr);
  const end = timeToMins(endStr);
  const bS = breakStartStr ? timeToMins(breakStartStr) : null;
  const bE = breakEndStr ? timeToMins(breakEndStr) : null;
  const iv = Number(intervalMin);
  while (cur + iv <= end) {
    const slotEnd = cur + iv;
    if (bS !== null && bE !== null && cur < bE && slotEnd > bS) { cur = bE; continue; }
    slots.push({ startTime: minsToTime(cur), endTime: minsToTime(slotEnd) });
    cur = slotEnd;
  }
  return slots;
}

// ── Slot Generator Panel ──────────────────────────────────────────────────────
function SlotGeneratorPanel({ availability, onChange }) {
  const { t } = useTranslation();
  const [genStart, setGenStart] = useState('09:00');
  const [genEnd, setGenEnd] = useState('18:00');
  const [genInterval, setGenInterval] = useState(30);
  const [genBreakStart, setGenBreakStart] = useState('');
  const [genBreakEnd, setGenBreakEnd] = useState('');
  const [applyDays, setApplyDays] = useState([...WEEKDAYS]);

  const toggleApplyDay = (day) =>
    setApplyDays(p => p.includes(day) ? p.filter(d => d !== day) : [...p, day]);

  const handleGenerate = () => {
    if (timeToMins(genStart) >= timeToMins(genEnd)) { toast.error('End time must be after start time'); return; }
    const newSlots = buildSlots(genStart, genEnd, genInterval, genBreakStart || null, genBreakEnd || null);
    if (!newSlots.length) { toast.error('No slots could be generated with these settings'); return; }
    onChange(availability.map(da =>
      applyDays.includes(da.day) ? { ...da, isAvailable: true, slots: newSlots } : da
    ));
    toast.success(t('services.slotAdded'));
  };

  const handleCopyToAll = () => {
    const src = availability.find(d => d.isAvailable && d.slots.length > 0);
    if (!src) { toast.error('Enable at least one day with slots first'); return; }
    onChange(availability.map(da => ({ ...da, isAvailable: true, slots: [...src.slots] })));
    toast.success(t('services.copyToAll'));
  };

  const handleCopyToWeekdays = () => {
    const src = availability.find(d => d.isAvailable && d.slots.length > 0);
    if (!src) { toast.error('Enable at least one day with slots first'); return; }
    onChange(availability.map(da =>
      WEEKDAYS.includes(da.day) ? { ...da, isAvailable: true, slots: [...src.slots] } : da
    ));
    toast.success(t('services.copyToWeekdays'));
  };

  return (
    <div className="slot-generator">
      <div className="slot-gen-title"><Zap size={14} />{t('services.slotGenerator')}</div>

      <div className="slot-gen-row">
        <div className="form-group" style={{ flex: 1, minWidth: 100 }}>
          <label className="form-label">{t('services.startTime')}</label>
          <input type="time" className="form-input form-input-sm" value={genStart} onChange={e => setGenStart(e.target.value)} />
        </div>
        <div className="form-group" style={{ flex: 1, minWidth: 100 }}>
          <label className="form-label">{t('services.endTime')}</label>
          <input type="time" className="form-input form-input-sm" value={genEnd} onChange={e => setGenEnd(e.target.value)} />
        </div>
        <div className="form-group" style={{ flex: 1, minWidth: 100 }}>
          <label className="form-label">{t('services.interval')}</label>
          <select className="form-input form-input-sm" value={genInterval} onChange={e => setGenInterval(e.target.value)}>
            <option value={15}>15 min</option>
            <option value={30}>30 min</option>
            <option value={45}>45 min</option>
            <option value={60}>1 hr</option>
            <option value={90}>1.5 hr</option>
            <option value={120}>2 hr</option>
          </select>
        </div>
        <div className="form-group" style={{ flex: 1, minWidth: 100 }}>
          <label className="form-label">{t('services.breakStart')} <span className="form-optional">(opt)</span></label>
          <input type="time" className="form-input form-input-sm" value={genBreakStart} onChange={e => setGenBreakStart(e.target.value)} />
        </div>
        <div className="form-group" style={{ flex: 1, minWidth: 100 }}>
          <label className="form-label">{t('services.breakEnd')} <span className="form-optional">(opt)</span></label>
          <input type="time" className="form-input form-input-sm" value={genBreakEnd} onChange={e => setGenBreakEnd(e.target.value)} />
        </div>
      </div>

      <div className="slot-gen-days-row">
        <span className="form-label" style={{ marginRight: 8, flexShrink: 0 }}>{t('services.applyToDays')}:</span>
        <div className="slot-gen-days">
          {DAYS.map(day => (
            <button key={day} type="button"
              className={`slot-day-btn ${applyDays.includes(day) ? 'active' : ''}`}
              onClick={() => toggleApplyDay(day)}>
              {day}
            </button>
          ))}
        </div>
      </div>

      <div className="slot-gen-actions">
        <button type="button" className="btn btn-primary btn-sm" onClick={handleGenerate}>
          <Zap size={13} />{t('services.generateSlots')}
        </button>
        <button type="button" className="btn btn-outline btn-sm" onClick={handleCopyToWeekdays}>
          {t('services.copyToWeekdays')}
        </button>
        <button type="button" className="btn btn-outline btn-sm" onClick={handleCopyToAll}>
          {t('services.copyToAll')}
        </button>
      </div>
    </div>
  );
}

// ── Per-Day Slot Display ──────────────────────────────────────────────────────
function DaySlotEditor({ dayAvail, onChange }) {
  const { t } = useTranslation();
  const [addOpen, setAddOpen] = useState(false);
  const [newStart, setNewStart] = useState('09:00');
  const [newEnd, setNewEnd] = useState('09:30');

  const removeSlot = (i) => onChange({ ...dayAvail, slots: dayAvail.slots.filter((_, idx) => idx !== i) });
  const clearAll = () => onChange({ ...dayAvail, slots: [] });
  const addManual = () => {
    if (!newStart || !newEnd || timeToMins(newStart) >= timeToMins(newEnd)) {
      toast.error('Pick a valid start and end time'); return;
    }
    onChange({ ...dayAvail, slots: [...dayAvail.slots, { startTime: newStart, endTime: newEnd }] });
    setAddOpen(false);
  };

  return (
    <div className="slot-editor">
      {dayAvail.slots.length > 0 && (
        <div className="slot-editor-header">
          <span className="slot-count-badge">{dayAvail.slots.length} slots</span>
          <button className="slot-action-link" type="button" onClick={clearAll}>{t('services.clearAll')}</button>
        </div>
      )}
      <div className="slot-editor-slots">
        {dayAvail.slots.length === 0
          ? <span className="slot-empty-hint">{t('services.noSlots')}</span>
          : dayAvail.slots.map((s, i) => (
              <div key={i} className="slot-chip">
                {s.startTime}–{s.endTime}
                <button type="button" onClick={() => removeSlot(i)}><X size={12} /></button>
              </div>
            ))}
      </div>
      {!addOpen ? (
        <button className="slot-add-link" type="button" onClick={() => setAddOpen(true)}>+ Add slot manually</button>
      ) : (
        <div className="slot-add-row">
          <input type="time" className="form-input" value={newStart} onChange={e => setNewStart(e.target.value)} style={{ flex: 1 }} />
          <span>–</span>
          <input type="time" className="form-input" value={newEnd} onChange={e => setNewEnd(e.target.value)} style={{ flex: 1 }} />
          <button className="btn btn-outline btn-sm" type="button" onClick={addManual}>{t('common.add')}</button>
          <button className="btn btn-ghost btn-sm" type="button" onClick={() => setAddOpen(false)}><X size={13} /></button>
        </div>
      )}
    </div>
  );
}

// ── Image Manager ─────────────────────────────────────────────────────────────
function ImageManager({ images, onChange }) {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (images.length >= 8) { toast.error('Maximum 8 images allowed'); return; }
    setUploading(true);
    const toastId = toast.loading('Uploading image...');
    try {
      const wpFormData = new FormData();
      wpFormData.append('file', file);
      wpFormData.append('title', file.name);
      wpFormData.append('status', 'publish');
      const wpRes = await fetch(WP_API_URL, {
        method: 'POST',
        headers: { 'Authorization': AUTH_HEADER, 'Content-Disposition': `attachment; filename="${file.name}"` },
        body: wpFormData,
      });
      if (!wpRes.ok) { const err = await wpRes.json(); console.error('WP Error:', err); throw new Error('WordPress upload failed'); }
      const wpData = await wpRes.json();
      onChange([...images, wpData.source_url]);
      toast.success('Image added!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Upload failed', { id: toastId });
    } finally { setUploading(false); e.target.value = ''; }
  };

  const removeImage = (idx) => onChange(images.filter((_, i) => i !== idx));
  const setAsCover = (idx) => {
    const arr = [...images];
    const [sel] = arr.splice(idx, 1);
    arr.unshift(sel);
    onChange(arr);
  };

  return (
    <div className="image-manager">
      <div className="wp-upload-zone" onClick={() => !uploading && fileInputRef.current.click()}>
        <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileUpload} />
        {uploading ? <div className="spinner" /> : <><Plus size={24} /><span>Upload Image to WordPress</span></>}
      </div>
      {images.length > 0 ? (
        <div className="image-grid" style={{ marginTop: 16 }}>
          {images.map((url, idx) => (
            <div key={url + idx} className={`image-thumb ${idx === 0 ? 'image-thumb-primary' : ''}`}>
              <img src={url} alt="" />
              {idx === 0 && <div className="primary-badge">Cover</div>}
              <div className="image-thumb-actions">
                {idx > 0 && <button className="thumb-action-btn" title="Set as cover" onClick={() => setAsCover(idx)}><Check size={11} /></button>}
                <button className="thumb-action-btn thumb-del" title="Remove" onClick={() => removeImage(idx)}><X size={11} /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="image-empty">
          <ImageIcon size={28} />
          <p>No images uploaded yet</p>
        </div>
      )}
    </div>
  );
}

// ── Image Viewer (lightbox) ───────────────────────────────────────────────────
function ImageViewer({ images, startIdx, onClose }) {
  const [idx, setIdx] = useState(startIdx);
  useEffect(() => {
    const fn = e => {
      if (e.key === 'ArrowLeft') setIdx(p => Math.max(0, p - 1));
      if (e.key === 'ArrowRight') setIdx(p => Math.min(images.length - 1, p + 1));
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [images.length, onClose]);

  return (
    <div className="modal-overlay" onClick={onClose} style={{ background: 'rgba(0,0,0,0.88)', zIndex: 2000 }}>
      <div onClick={e => e.stopPropagation()} style={{ position: 'relative', textAlign: 'center' }}>
        <img src={images[idx]} alt="" style={{ maxWidth: '88vw', maxHeight: '78vh', borderRadius: 8, objectFit: 'contain', display: 'block' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 14 }}>
          <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} disabled={idx === 0} onClick={() => setIdx(p => p - 1)}>← Prev</button>
          <span style={{ color: '#fff', fontSize: 13 }}>{idx + 1} / {images.length}</span>
          <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} disabled={idx === images.length - 1} onClick={() => setIdx(p => p + 1)}>Next →</button>
        </div>
        <button onClick={onClose} style={{ position: 'absolute', top: -14, right: -14, width: 32, height: 32, borderRadius: '50%', background: '#fff', border: 'none', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>×</button>
      </div>
    </div>
  );
}

// ── Service Modal ─────────────────────────────────────────────────────────────
function ServiceModal({ service, onClose, onSaved }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(service ? {
    ...service,
    tags: (service.tags || []).join(', '),
    images: service.images || [],
    pricingType: service.pricingType || 'fixed',
    minDuration: service.minDuration || 60,
    maxDuration: service.maxDuration || 180,
    availability: DAYS.map(day => {
      const found = service.availability?.find(a => a.day === day);
      return found || { day, isAvailable: false, slots: [] };
    }),
  } : emptyService);
  const [saving, setSaving] = useState(false);
  const [avOpen, setAvOpen] = useState(false);
  const [imgOpen, setImgOpen] = useState(true);
  const isEdit = !!service?._id;
  const isTimeBased = form.pricingType && form.pricingType !== 'fixed';

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const toggleDay = (day) => set('availability', form.availability.map(a => a.day === day ? { ...a, isAvailable: !a.isAvailable } : a));
  const updateDay = (day, val) => set('availability', form.availability.map(a => a.day === day ? val : a));

  const handleSave = async () => {
    if (!form.name || !form.price || !form.duration) { toast.error(t('services.fillRequired')); return; }
    setSaving(true);
    try {
      const data = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        price: Number(form.price),
        discountedPrice: form.discountedPrice ? Number(form.discountedPrice) : null,
        duration: Number(form.duration),
        pricingType: form.pricingType || 'fixed',
        minDuration: form.minDuration ? Number(form.minDuration) : undefined,
        maxDuration: form.maxDuration ? Number(form.maxDuration) : undefined,
      };
      if (isEdit) { await serviceAPI.update(service._id, data); toast.success(t('services.serviceUpdated')); }
      else { await serviceAPI.create(data); toast.success(t('services.serviceCreated')); }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 720 }}>
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? t('services.editService') : t('services.newService')}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {/* Basic Information */}
        <div className="modal-section-label">{t('services.basicInfo')}</div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">{t('services.serviceName')} *</label>
            <input className="form-input" placeholder={t('services.serviceNamePlaceholder')} value={form.name} onChange={e => set('name', e.target.value)} autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">{t('auth.category')}</label>
            <input className="form-input" placeholder={t('services.categoryPlaceholder')} value={form.category} onChange={e => set('category', e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">{t('services.description')}</label>
          <textarea className="form-input" rows={3} placeholder={t('services.descriptionPlaceholder')} value={form.description} onChange={e => set('description', e.target.value)} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">{t('services.price_label')} *</label>
            <input type="number" className="form-input" placeholder={t('services.pricePlaceholder')} value={form.price} onChange={e => set('price', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">{t('services.discountedPrice')}</label>
            <input type="number" className="form-input" placeholder={t('services.discountedPricePlaceholder')} value={form.discountedPrice || ''} onChange={e => set('discountedPrice', e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">{t('services.durationMinutes')} *</label>
            <input type="number" className="form-input" placeholder="60" value={form.duration} onChange={e => set('duration', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">{t('services.tags')}</label>
            <input className="form-input" placeholder={t('services.tagsPlaceholder')} value={form.tags} onChange={e => set('tags', e.target.value)} />
          </div>
        </div>

        {/* Pricing Type */}
        <div className="modal-section-label" style={{ marginTop: 12 }}>{t('services.pricingType')}</div>
        <div className="form-row">
          <div className="form-group" style={{ flex: 2 }}>
            <label className="form-label">{t('services.pricingType')}</label>
            <select className="form-input" value={form.pricingType} onChange={e => set('pricingType', e.target.value)}>
              <option value="fixed">{t('services.fixedPrice')}</option>
              <option value="per_hour">{t('services.perHour')}</option>
              <option value="per_30min">{t('services.per30min')}</option>
              <option value="per_15min">{t('services.per15min')}</option>
            </select>
          </div>
          {isTimeBased && (
            <>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">{t('services.minDuration')}</label>
                <input type="number" className="form-input" placeholder="30" value={form.minDuration} onChange={e => set('minDuration', e.target.value)} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">{t('services.maxDuration')}</label>
                <input type="number" className="form-input" placeholder="180" value={form.maxDuration} onChange={e => set('maxDuration', e.target.value)} />
              </div>
            </>
          )}
        </div>
        {isTimeBased && (
          <div className="pricing-hint">
            💡 {t('services.rateLabel')}: ₹{form.price || '—'} {
              form.pricingType === 'per_hour' ? '/ hr' :
              form.pricingType === 'per_30min' ? '/ 30 min' : '/ 15 min'
            }
          </div>
        )}

        {/* Images accordion */}
        <div className="avail-section" style={{ marginTop: 16, marginBottom: 8 }}>
          <button className="avail-toggle" onClick={() => setImgOpen(p => !p)}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ImageIcon size={15} /> {t('services.images')} ({form.images.length})
            </span>
            {imgOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {imgOpen && (
            <div style={{ padding: 16 }}>
              <ImageManager images={form.images} onChange={v => set('images', v)} />
            </div>
          )}
        </div>

        {/* Availability accordion */}
        <div className="avail-section">
          <button className="avail-toggle" onClick={() => setAvOpen(p => !p)}>
            <span>{t('services.availability')}</span>
            {avOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {avOpen && (
            <div className="avail-days">
              {/* Slot Generator Panel */}
              <SlotGeneratorPanel
                availability={form.availability}
                onChange={v => set('availability', v)}
              />

              {/* Per-day toggles + slot display */}
              {form.availability.map(da => (
                <div key={da.day} className={`avail-day ${da.isAvailable ? 'avail-day-on' : ''}`}>
                  <div className="avail-day-header">
                    <button className={`day-toggle ${da.isAvailable ? 'on' : ''}`} type="button" onClick={() => toggleDay(da.day)}>
                      {da.isAvailable ? <Check size={13} /> : <span style={{ width: 13 }} />}
                    </button>
                    <span className="avail-day-name">{da.day}</span>
                    {da.isAvailable && (
                      <span className="avail-day-count">{da.slots.length} slots</span>
                    )}
                  </div>
                  {da.isAvailable && (
                    <DaySlotEditor dayAvail={da} onChange={val => updateDay(da.day, val)} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
          <button className="btn btn-outline" onClick={onClose}>{t('common.cancel')}</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <span className="spinner" /> : isEdit ? t('common.save') : t('services.createService')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ServicesPage() {
  const { t } = useTranslation();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [viewer, setViewer] = useState(null);

  const load = () => {
    setLoading(true);
    serviceAPI.getMyServices()
      .then(r => setServices(r.data.services))
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm(t('services.deactivateConfirm'))) return;
    setDeletingId(id);
    try {
      await serviceAPI.delete(id);
      toast.success(t('services.serviceDeactivated'));
      load();
    } catch { toast.error('Failed'); }
    finally { setDeletingId(null); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('services.title')}</h1>
          <p className="page-subtitle">{t('services.subtitle')}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('new')}>
          <Plus size={16} />{t('services.addService')}
        </button>
      </div>

      {loading ? (
        <div className="page-loading" style={{ minHeight: '40vh' }}>
          <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
        </div>
      ) : services.length === 0 ? (
        <div className="empty-state" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--warm-white)' }}>
          <div className="empty-state-icon">✂️</div>
          <h3>{t('services.noServices')}</h3>
          <p>{t('services.addFirst')}</p>
          <button className="btn btn-primary" onClick={() => setModal('new')}>
            <Plus size={16} />{t('services.addService')}
          </button>
        </div>
      ) : (
        <div className="services-list">
          {services.map(s => (
            <div key={s._id} className={`svc-row card ${!s.isActive ? 'svc-inactive' : ''}`}>
              <div className="svc-row-main">
                <div
                  className="svc-row-cover"
                  onClick={() => s.images?.length > 0 && setViewer({ images: s.images, startIdx: 0 })}
                  title={s.images?.length > 0 ? 'Click to view images' : ''}
                  style={{ cursor: s.images?.length > 0 ? 'pointer' : 'default' }}
                >
                  {s.images?.[0] ? (
                    <>
                      <img src={s.images[0]} alt={s.name} onError={e => { e.currentTarget.style.display = 'none'; }} />
                      {s.images.length > 1 && <div className="svc-img-count">+{s.images.length - 1}</div>}
                    </>
                  ) : (
                    <div className="svc-row-icon-letter">{s.name[0]}</div>
                  )}
                </div>

                <div className="svc-row-info">
                  <div className="svc-row-name">{s.name}</div>
                  {s.description && <div className="svc-row-desc">{s.description}</div>}
                  <div className="svc-row-meta">
                    <span><Clock size={12} /> {s.duration}{t('common.min')}</span>
                    {s.category && <span><Tag size={12} /> {s.category}</span>}
                    {s.rating?.count > 0 && <span><Star size={12} /> {s.rating.average?.toFixed(1)} ({s.rating.count})</span>}
                    <span>{s.totalBookings} {t('services.bookings')}</span>
                    {s.images?.length > 0 && (
                      <span style={{ color: 'var(--gold)' }}>
                        <ImageIcon size={12} /> {s.images.length} {s.images.length !== 1 ? t('services.photos_plural') : t('services.photos')}
                      </span>
                    )}
                    {s.pricingType && s.pricingType !== 'fixed' && (
                      <span className="badge badge-gold" style={{ fontSize: 10 }}>
                        {s.pricingType === 'per_hour' ? t('services.perHour') :
                         s.pricingType === 'per_30min' ? t('services.per30min') : t('services.per15min')}
                      </span>
                    )}
                    {!s.isActive && <span className="badge badge-cancelled">{t('common.inactive')}</span>}
                  </div>
                </div>
              </div>

              <div className="svc-row-right">
                <div className="svc-row-price">
                  {s.discountedPrice ? (
                    <>
                      <span className="svc-price-main">₹{s.discountedPrice}</span>
                      <span className="svc-price-orig">₹{s.price}</span>
                    </>
                  ) : (
                    <span className="svc-price-main">₹{s.price}</span>
                  )}
                </div>
                <div className="svc-row-actions">
                  <button className="btn btn-outline btn-sm" onClick={() => setModal(s)}>
                    <Edit2 size={14} />{t('common.edit')}
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(s._id)} disabled={deletingId === s._id}>
                    {deletingId === s._id ? <span className="spinner" /> : <Trash2 size={14} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <ServiceModal
          service={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); }}
        />
      )}

      {viewer && (
        <ImageViewer images={viewer.images} startIdx={viewer.startIdx} onClose={() => setViewer(null)} />
      )}
    </div>
  );
}
