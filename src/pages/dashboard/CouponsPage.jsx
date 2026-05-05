import { useEffect, useState } from 'react';
import { couponAPI } from '../../api/api';
import { useTranslation } from 'react-i18next';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import './ServicesPage.css';

const emptyCoupon = { code:'', description:'', type:'percentage', value:'', minOrderAmount:'', maxDiscount:'', usageLimit:'', expiresAt:'', isActive:true };

function CouponModal({ coupon, onClose, onSaved }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(coupon ? { ...coupon, code: coupon.code, expiresAt: coupon.expiresAt ? coupon.expiresAt.split('T')[0] : '' } : emptyCoupon);
  const [saving, setSaving] = useState(false);
  const isEdit = !!coupon?._id;
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.code || !form.value) { toast.error(t('coupons.codeRequired')); return; }
    setSaving(true);
    try {
      const data = {
        ...form,
        code: form.code.toUpperCase(),
        value: Number(form.value),
        minOrderAmount: Number(form.minOrderAmount)||0,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        expiresAt: form.expiresAt || null,
      };
      if (isEdit) { await couponAPI.update(coupon._id, data); toast.success(t('coupons.couponUpdated')); }
      else { await couponAPI.create(data); toast.success(t('coupons.couponCreated')); }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? t('coupons.editCoupon') : t('coupons.newCoupon')}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">{t('coupons.couponCode')} *</label>
            <input className="form-input" placeholder="SAVE20" value={form.code}
              onChange={e => set('code', e.target.value.toUpperCase())} style={{textTransform:'uppercase',letterSpacing:'0.08em',fontWeight:600}} autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">{t('coupons.type')} *</label>
            <select className="form-input" value={form.type} onChange={e => set('type', e.target.value)}>
              <option value="percentage">{t('coupons.percentage')}</option>
              <option value="fixed">{t('coupons.fixedAmount')}</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">{t('common.notes')}</label>
          <input className="form-input" placeholder="e.g. 20% off all services" value={form.description} onChange={e => set('description', e.target.value)} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">{t('coupons.discountValue')} * {form.type==='percentage' ? '(%)' : '(₹)'}</label>
            <input type="number" className="form-input" placeholder={form.type==='percentage'?'20':'100'} value={form.value} onChange={e => set('value', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">{t('coupons.minOrderAmount')}</label>
            <input type="number" className="form-input" placeholder="0" value={form.minOrderAmount} onChange={e => set('minOrderAmount', e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          {form.type === 'percentage' && (
            <div className="form-group">
              <label className="form-label">{t('coupons.maxDiscount')}</label>
              <input type="number" className="form-input" placeholder={t('coupons.unlimitedPlaceholder')} value={form.maxDiscount||''} onChange={e => set('maxDiscount', e.target.value)} />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">{t('coupons.usageLimit')}</label>
            <input type="number" className="form-input" placeholder={t('coupons.unlimitedPlaceholder')} value={form.usageLimit||''} onChange={e => set('usageLimit', e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">{t('coupons.expiryDate')}</label>
            <input type="date" className="form-input" value={form.expiresAt||''} onChange={e => set('expiresAt', e.target.value)} />
          </div>
          <div className="form-group" style={{justifyContent:'flex-end',paddingBottom:0}}>
            <label className="form-label">{t('common.active')}</label>
            <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',marginTop:4}}>
              <input type="checkbox" checked={form.isActive} onChange={e=>set('isActive',e.target.checked)} style={{width:16,height:16}} />
              <span style={{fontSize:14}}>{t('coupons.isActive')}</span>
            </label>
          </div>
        </div>
        <div style={{display:'flex',gap:12,justifyContent:'flex-end',marginTop:16}}>
          <button className="btn btn-outline" onClick={onClose}>{t('common.cancel')}</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <span className="spinner"/> : isEdit ? t('common.save') : t('coupons.createCoupon')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CouponsPage() {
  const { t } = useTranslation();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const load = () => {
    setLoading(true);
    couponAPI.list().then(r => setCoupons(r.data.coupons)).catch(()=>{}).finally(()=>setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm(t('coupons.deleteConfirm'))) return;
    setDeletingId(id);
    try { await couponAPI.delete(id); toast.success(t('coupons.deleted')); load(); }
    catch { toast.error('Failed'); } finally { setDeletingId(null); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('coupons.title')}</h1>
          <p className="page-subtitle">{t('coupons.subtitle')}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('new')}>
          <Plus size={16}/> {t('coupons.createCoupon')}
        </button>
      </div>

      {loading ? (
        <div className="page-loading" style={{minHeight:'30vh'}}><div className="spinner" style={{width:28,height:28,borderWidth:3}}/></div>
      ) : coupons.length === 0 ? (
        <div className="empty-state" style={{border:'1px solid var(--border)',borderRadius:'var(--radius-lg)',background:'var(--warm-white)'}}>
          <div className="empty-state-icon">🏷️</div>
          <h3>{t('coupons.noCoupons')}</h3>
          <p>{t('coupons.createFirst')}</p>
          <button className="btn btn-primary" onClick={() => setModal('new')}><Plus size={16}/> {t('coupons.createCoupon')}</button>
        </div>
      ) : (
        <div className="coupons-grid">
          {coupons.map(c => (
            <div key={c._id} className={`coupon-card card ${!c.isActive ? 'coupon-inactive' : ''}`}>
              <div className="coupon-header">
                <div className="coupon-code">{c.code}</div>
                <div className="coupon-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => setModal(c)}><Edit2 size={14}/></button>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(c._id)} disabled={deletingId===c._id}>
                    {deletingId===c._id ? <span className="spinner"/> : <Trash2 size={14}/>}
                  </button>
                </div>
              </div>
              <div className="coupon-value">
                {c.type === 'percentage' ? `${c.value}% ${t('coupons.off')}` : `₹${c.value} ${t('coupons.off')}`}
              </div>
              {c.description && <p className="coupon-desc">{c.description}</p>}
              <div className="coupon-meta">
                {c.minOrderAmount > 0 && <span>Min ₹{c.minOrderAmount}</span>}
                {c.maxDiscount && <span>Max ₹{c.maxDiscount}</span>}
                {c.usageLimit && <span>{c.usedCount}/{c.usageLimit} {t('coupons.used')}</span>}
                {!c.usageLimit && <span>{c.usedCount} {t('coupons.used')}</span>}
                {c.expiresAt && <span>{t('coupons.expires')} {new Date(c.expiresAt).toLocaleDateString()}</span>}
              </div>
              {!c.isActive && <div className="badge badge-cancelled" style={{marginTop:8}}>{t('coupons.inactive')}</div>}
            </div>
          ))}
        </div>
      )}

      {modal && (
        <CouponModal
          coupon={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); }}
        />
      )}
    </div>
  );
}
