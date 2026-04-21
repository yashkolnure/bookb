import { useEffect, useState, useRef } from 'react';
import { storeAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { Upload, Link as LinkIcon, CreditCard, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import './ServicesPage.css';
import './StoreSettingsPage.css';

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const CATEGORIES = ['salon','clinic','fitness','consulting','beauty','education','other'];

export default function StoreSettingsPage() {
  const { store: authStore, setStore: setAuthStore } = useAuth();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('general');
  const [copied, setCopied] = useState(false);
  const logoRef = useRef(); const bannerRef = useRef();

  useEffect(() => {
    storeAPI.getMyStore().then(r => {
      const s = r.data.store;
      // Ensure businessHours has all days
      const hours = DAYS.map(day => {
        const found = s.businessHours?.find(h => h.day === day);
        return found || { day, isOpen: false, openTime: '09:00', closeTime: '18:00' };
      });
      setStore({ ...s, businessHours: hours });
    }).catch(() => toast.error('Failed to load store')).finally(() => setLoading(false));
  }, []);

  const set = (k, v) => setStore(p => ({ ...p, [k]: v }));
  const setNested = (k, nk, v) => setStore(p => ({ ...p, [k]: { ...p[k], [nk]: v } }));

  const saveGeneral = async () => {
    setSaving(true);
    try {
      const res = await storeAPI.updateMyStore({
        name: store.name, description: store.description, category: store.category,
        phone: store.phone, email: store.email, website: store.website,
        address: store.address, socialLinks: store.socialLinks,
        businessHours: store.businessHours, currency: store.currency,
      });
      setStore(res.data.store);
      if (setAuthStore) setAuthStore(res.data.store);
      toast.success('Store settings saved');
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const WP_USERNAME = "yashkolnure58@gmail.com";
const WP_APP_PASSWORD = "05mq iTLF UvJU dyaz 7KxQ 8pyc";
const WP_SITE_URL = "https://website.avenirya.com";

// Generate the Auth header
const AUTH_HEADER = `Basic ${btoa(`${WP_USERNAME}:${WP_APP_PASSWORD}`)}`;
const WP_API_URL = `${WP_SITE_URL}/wp-json/wp/v2/media`;
const uploadFile = async (file, type) => {
  setSaving(true);
  const toastId = toast.loading(`Uploading ${type}...`);
  try {
    const wpFormData = new FormData();
    wpFormData.append('file', file);
    wpFormData.append('title', `${store.name} ${type}`);
    wpFormData.append('status', 'publish');

    const wpRes = await fetch(WP_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': AUTH_HEADER,
        'Content-Disposition': `attachment; filename="${file.name}"`,
      },
      body: wpFormData,
    });

    if (!wpRes.ok) throw new Error('WordPress upload failed');

    const wpData = await wpRes.json();
    const wordpressImageUrl = wpData.source_url; // This is the https://website.avenirya.com/... link

    // CRITICAL: Update your DB with the NEW WordPress URL
    const res = await storeAPI.updateMyStore({
      [type]: wordpressImageUrl 
    });

    // Update local state immediately so the UI changes without a refresh
    const updatedStore = res.data.store;
    setStore(updatedStore);

    if (setAuthStore) setAuthStore(updatedStore);

    toast.success(`${type} updated successfully!`, { id: toastId });

  } catch (err) {
    console.error("Upload Error:", err);
    toast.error('Upload failed', { id: toastId });
  } finally {
    setSaving(false);
  }
};
  const copyLink = () => {
    const link = `${window.location.origin}/store/${store?.slug}`;
    navigator.clipboard.writeText(link).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  if (loading) return <div className="page-loading" style={{minHeight:'40vh'}}><div className="spinner" style={{width:32,height:32,borderWidth:3}}/></div>;
  if (!store) return null;

  const storeLink = `${window.location.origin}/store/${store.slug}`;
  const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5003';

  return (
    <div style={{maxWidth:780}}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Store Settings</h1>
          <p className="page-subtitle">Manage your store details and configuration</p>
        </div>
      </div>

      {/* Store link */}
      <div className="card store-link-card">
        <div className="store-link-label"><LinkIcon size={15}/> Your Booking Link</div>
        <div className="store-link-row">
          <div className="store-link-url">{storeLink}</div>
          <button className="btn btn-outline btn-sm" onClick={copyLink}>
            {copied ? <><Check size={14}/> Copied!</> : <><Copy size={14}/> Copy</>}
          </button>
          <a href={`/store/${store.slug}`} target="_blank" rel="noopener" className="btn btn-primary btn-sm">Visit →</a>
        </div>
      </div>

      <div className="tabs">
        {[['general','General'],['media','Media'],['hours','Business Hours'],['payment','Payment']].map(([k,l]) => (
          <button key={k} className={`tab ${tab===k?'active':''}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {/* General */}
      {tab === 'general' && (
        <div className="card animate-fadeIn">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Store Name</label>
              <input className="form-input" value={store.name||''} onChange={e=>set('name',e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-input" value={store.category||'other'} onChange={e=>set('category',e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" rows={3} value={store.description||''} onChange={e=>set('description',e.target.value)} placeholder="Tell customers about your store..." />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" value={store.phone||''} onChange={e=>set('phone',e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" value={store.email||''} onChange={e=>set('email',e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Website</label>
              <input className="form-input" placeholder="https://..." value={store.website||''} onChange={e=>set('website',e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Currency</label>
              <select className="form-input" value={store.currency||'INR'} onChange={e=>set('currency',e.target.value)}>
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>
          <h3 style={{margin:'20px 0 12px',fontSize:'1rem'}}>Address</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Street</label>
              <input className="form-input" value={store.address?.street||''} onChange={e=>setNested('address','street',e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">City</label>
              <input className="form-input" value={store.address?.city||''} onChange={e=>setNested('address','city',e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">State</label><input className="form-input" value={store.address?.state||''} onChange={e=>setNested('address','state',e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Country</label><input className="form-input" value={store.address?.country||''} onChange={e=>setNested('address','country',e.target.value)} /></div>
          </div>
          <h3 style={{margin:'20px 0 12px',fontSize:'1rem'}}>Social Links</h3>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Instagram</label><input className="form-input" placeholder="https://instagram.com/..." value={store.socialLinks?.instagram||''} onChange={e=>setNested('socialLinks','instagram',e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Facebook</label><input className="form-input" placeholder="https://facebook.com/..." value={store.socialLinks?.facebook||''} onChange={e=>setNested('socialLinks','facebook',e.target.value)} /></div>
          </div>
          <button className="btn btn-primary" onClick={saveGeneral} disabled={saving}>
            {saving ? <span className="spinner"/> : 'Save Changes'}
          </button>
        </div>
      )}

      {/* Media */}
      {tab === 'media' && (
        <div className="card animate-fadeIn">
          <div className="media-section">
            <div className="media-label">Store Logo</div>
 <div className="media-preview logo-preview">
  {store.logo ? (
    <img 
      // If it's a full URL (WP), use it. Otherwise, don't fallback to localhost in production.
      src={store.logo.startsWith('http') ? store.logo : `${BASE_URL}${store.logo}`} 
      alt="Logo" 
      style={{width:'100%',height:'100%',objectFit:'cover'}}
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = "https://placehold.co/100x100?text=No+Image";
      }}
    />
  ) : (
    <div className="media-placeholder">{store.name?.[0]}</div>
  )}
</div>
            <input ref={logoRef} type="file" accept="image/*" style={{display:'none'}} onChange={e => e.target.files[0] && uploadFile(e.target.files[0],'logo')} />
            <button className="btn btn-outline btn-sm" onClick={() => logoRef.current.click()}>
              <Upload size={14}/> Upload Logo
            </button>
          </div>
          <div className="divider"/>
          <div className="media-section">
            <div className="media-label">Store Banner</div>
  <div className="media-preview banner-preview">
    {store.banner ? (
      <img 
        // Check if banner starts with http. If so, use it directly.
        src={store.banner.startsWith('http') ? store.banner : `${BASE_URL}${store.banner}`} 
        alt="Banner" 
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        onError={(e) => {
          e.target.onerror = null; 
          e.target.src = "https://placehold.co/600x200?text=Image+Load+Error";
        }}
      />
    ) : (
      <div className="media-placeholder" style={{ fontSize: '1.2rem' }}>No banner uploaded</div>
    )}
  </div>
            <input ref={bannerRef} type="file" accept="image/*" style={{display:'none'}} onChange={e => e.target.files[0] && uploadFile(e.target.files[0],'banner')} />
            <button className="btn btn-outline btn-sm" onClick={() => bannerRef.current.click()}>
              <Upload size={14}/> Upload Banner
            </button>
          </div>
        </div>
      )}

      {/* Hours */}
      {tab === 'hours' && (
        <div className="card animate-fadeIn">
          <p style={{color:'var(--ink-muted)',fontSize:14,marginBottom:20}}>Set your general business hours. These are displayed on your store page.</p>
          <div className="hours-editor">
            {DAYS.map(day => {
              const h = store.businessHours?.find(b => b.day === day) || { day, isOpen:false, openTime:'09:00', closeTime:'18:00' };
              const updateH = (k, v) => set('businessHours', store.businessHours.map(b => b.day===day ? {...b,[k]:v} : b));
              return (
                <div key={day} className="hours-edit-row">
                  <div style={{display:'flex',alignItems:'center',gap:10,minWidth:90}}>
                    <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}>
                      <input type="checkbox" checked={h.isOpen} onChange={e=>updateH('isOpen',e.target.checked)} style={{width:16,height:16}} />
                      <span style={{fontWeight:600,fontSize:14}}>{day}</span>
                    </label>
                  </div>
                  {h.isOpen ? (
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <input type="time" className="form-input" value={h.openTime} onChange={e=>updateH('openTime',e.target.value)} style={{width:130}} />
                      <span style={{fontSize:13,color:'var(--ink-muted)'}}>to</span>
                      <input type="time" className="form-input" value={h.closeTime} onChange={e=>updateH('closeTime',e.target.value)} style={{width:130}} />
                    </div>
                  ) : (
                    <span style={{fontSize:13,color:'var(--ink-muted)',fontStyle:'italic'}}>Closed</span>
                  )}
                </div>
              );
            })}
          </div>
          <button className="btn btn-primary" style={{marginTop:24}} onClick={saveGeneral} disabled={saving}>
            {saving ? <span className="spinner"/> : 'Save Hours'}
          </button>
        </div>
      )}

      {/* Payment */}
      {tab === 'payment' && (
        <div className="card animate-fadeIn">
          <PaymentSettings store={store} setStore={setStore} />
        </div>
      )}
    </div>
  );
}

function PaymentSettings({ store, setStore }) {
  const [form, setForm] = useState({ provider: store.paymentGateway?.provider || 'manual', apiKey: '', secretKey: '' });
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const res = await storeAPI.updatePayment(form);
      setStore(p => ({ ...p, paymentGateway: { ...p.paymentGateway, ...form, isConnected: true } }));
      toast.success('Payment gateway updated');
    } catch { toast.error('Failed'); } finally { setSaving(false); }
  };

  const togglePayment = async () => {
    setToggling(true);
    try {
      const res = await storeAPI.togglePayment(!store.paymentEnabled);
      setStore(p => ({ ...p, paymentEnabled: res.data.store.paymentEnabled }));
      toast.success(res.data.store.paymentEnabled ? 'Payments enabled' : 'Payments disabled');
    } catch { toast.error('Failed'); } finally { setToggling(false); }
  };

  return (
    <div>
      <div className="payment-toggle-row">
        <div>
          <div style={{fontWeight:600,marginBottom:4}}>Accept Payments Online</div>
          <div style={{fontSize:13,color:'var(--ink-muted)'}}>Allow customers to pay at checkout</div>
        </div>
        <button className={`toggle-btn ${store.paymentEnabled ? 'on' : ''}`} onClick={togglePayment} disabled={toggling}>
          <div className="toggle-thumb"/>
        </button>
      </div>
      <div className="divider"/>
      <div className="form-group">
        <label className="form-label">Payment Provider</label>
        <select className="form-input" value={form.provider} onChange={e => setForm(p=>({...p,provider:e.target.value}))}>
          <option value="manual">Manual / Cash</option>
          <option value="razorpay">Razorpay</option>
          <option value="stripe">Stripe</option>
          <option value="paypal">PayPal</option>
        </select>
      </div>
      {form.provider !== 'manual' && (
        <>
          <div className="form-group">
            <label className="form-label">API Key / Client ID</label>
            <input className="form-input" type="password" placeholder="Enter your API key" value={form.apiKey} onChange={e=>setForm(p=>({...p,apiKey:e.target.value}))} />
          </div>
          <div className="form-group">
            <label className="form-label">Secret Key</label>
            <input className="form-input" type="password" placeholder="Enter your secret key" value={form.secretKey} onChange={e=>setForm(p=>({...p,secretKey:e.target.value}))} />
          </div>
        </>
      )}
      {store.paymentGateway?.isConnected && (
        <div className="badge badge-confirmed" style={{marginBottom:16}}>✓ Payment gateway connected</div>
      )}
      <button className="btn btn-primary" onClick={save} disabled={saving}>
        {saving ? <span className="spinner"/> : 'Save Payment Settings'}
      </button>
    </div>
  );
}
