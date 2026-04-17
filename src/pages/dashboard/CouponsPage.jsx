import { useEffect, useState } from 'react';
import { couponAPI } from '../../api/api';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import './ServicesPage.css';

const emptyCoupon = { code:'', description:'', type:'percentage', value:'', minOrderAmount:'', maxDiscount:'', usageLimit:'', expiresAt:'', isActive:true };

function CouponModal({ coupon, onClose, onSaved }) {
  const [form, setForm] = useState(coupon ? { ...coupon, code: coupon.code, expiresAt: coupon.expiresAt ? coupon.expiresAt.split('T')[0] : '' } : emptyCoupon);
  const [saving, setSaving] = useState(false);
  const isEdit = !!coupon?._id;
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.code || !form.value) { toast.error('Code and value are required'); return; }
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
      if (isEdit) { await couponAPI.update(coupon._id, data); toast.success('Coupon updated'); }
      else { await couponAPI.create(data); toast.success('Coupon created'); }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit Coupon' : 'New Coupon'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Coupon Code *</label>
            <input className="form-input" placeholder="SAVE20" value={form.code}
              onChange={e => set('code', e.target.value.toUpperCase())} style={{textTransform:'uppercase', letterSpacing:'0.08em', fontWeight:600}} autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Type *</label>
            <select className="form-input" value={form.type} onChange={e => set('type', e.target.value)}>
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (₹)</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <input className="form-input" placeholder="e.g. 20% off all services" value={form.description} onChange={e => set('description', e.target.value)} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Discount Value * {form.type==='percentage' ? '(%)' : '(₹)'}</label>
            <input type="number" className="form-input" placeholder={form.type==='percentage'?'20':'100'} value={form.value} onChange={e => set('value', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Min Order Amount (₹)</label>
            <input type="number" className="form-input" placeholder="0" value={form.minOrderAmount} onChange={e => set('minOrderAmount', e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          {form.type === 'percentage' && (
            <div className="form-group">
              <label className="form-label">Max Discount Cap (₹)</label>
              <input type="number" className="form-input" placeholder="Leave blank for unlimited" value={form.maxDiscount||''} onChange={e => set('maxDiscount', e.target.value)} />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Usage Limit</label>
            <input type="number" className="form-input" placeholder="Leave blank for unlimited" value={form.usageLimit||''} onChange={e => set('usageLimit', e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Expiry Date</label>
            <input type="date" className="form-input" value={form.expiresAt||''} onChange={e => set('expiresAt', e.target.value)} />
          </div>
          <div className="form-group" style={{justifyContent:'flex-end', paddingBottom:0}}>
            <label className="form-label">Active</label>
            <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',marginTop:4}}>
              <input type="checkbox" checked={form.isActive} onChange={e=>set('isActive',e.target.checked)} style={{width:16,height:16}} />
              <span style={{fontSize:14}}>Coupon is active</span>
            </label>
          </div>
        </div>
        <div style={{display:'flex',gap:12,justifyContent:'flex-end',marginTop:16}}>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <span className="spinner"/> : isEdit ? 'Save Changes' : 'Create Coupon'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CouponsPage() {
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
    if (!confirm('Delete this coupon?')) return;
    setDeletingId(id);
    try { await couponAPI.delete(id); toast.success('Deleted'); load(); }
    catch { toast.error('Failed'); } finally { setDeletingId(null); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Coupons</h1>
          <p className="page-subtitle">Create discount codes for your customers</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('new')}>
          <Plus size={16}/> Create Coupon
        </button>
      </div>

      {loading ? (
        <div className="page-loading" style={{minHeight:'30vh'}}><div className="spinner" style={{width:28,height:28,borderWidth:3}}/></div>
      ) : coupons.length === 0 ? (
        <div className="empty-state" style={{border:'1px solid var(--border)',borderRadius:'var(--radius-lg)',background:'var(--warm-white)'}}>
          <div className="empty-state-icon">🏷️</div>
          <h3>No coupons yet</h3>
          <p>Create your first discount code to attract more bookings.</p>
          <button className="btn btn-primary" onClick={() => setModal('new')}><Plus size={16}/> Create Coupon</button>
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
                {c.type === 'percentage' ? `${c.value}% OFF` : `₹${c.value} OFF`}
              </div>
              {c.description && <p className="coupon-desc">{c.description}</p>}
              <div className="coupon-meta">
                {c.minOrderAmount > 0 && <span>Min ₹{c.minOrderAmount}</span>}
                {c.maxDiscount && <span>Max ₹{c.maxDiscount}</span>}
                {c.usageLimit && <span>{c.usedCount}/{c.usageLimit} used</span>}
                {!c.usageLimit && <span>{c.usedCount} used</span>}
                {c.expiresAt && <span>Expires {new Date(c.expiresAt).toLocaleDateString('en-IN')}</span>}
              </div>
              {!c.isActive && <div className="badge badge-cancelled" style={{marginTop:8}}>Inactive</div>}
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
