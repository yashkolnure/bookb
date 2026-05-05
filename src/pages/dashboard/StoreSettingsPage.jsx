import { useEffect, useState, useRef } from 'react';
import { storeAPI } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Upload, Link as LinkIcon, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import './ServicesPage.css';
import './StoreSettingsPage.css';

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const CATEGORIES = ['salon','clinic','fitness','consulting','beauty','education','other'];

export default function StoreSettingsPage() {
  const { store: authStore, setStore: setAuthStore } = useAuth();
  const { t } = useTranslation();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('general');
  const [copied, setCopied] = useState(false);
  const logoRef = useRef(); const bannerRef = useRef();

  useEffect(() => {
    storeAPI.getMyStore().then(r => {
      const s = r.data.store;
      const hours = DAYS.map(day => {
        const found = s.businessHours?.find(h => h.day === day);
        return found || { day, isOpen: false, openTime: '09:00', closeTime: '18:00' };
      });
      setStore({ ...s, businessHours: hours });
    }).catch(() => toast.error(t('settings.failedLoad'))).finally(() => setLoading(false));
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
        businessHours: store.businessHours, currency: store.currency, theme: store.theme,
      });
      setStore(res.data.store);
      if (setAuthStore) setAuthStore(res.data.store);
      toast.success(t('settings.storeSaved'));
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const WP_USERNAME = "yashkolnure58@gmail.com";
  const WP_APP_PASSWORD = "05mq iTLF UvJU dyaz 7KxQ 8pyc";
  const WP_SITE_URL = "https://website.avenirya.com";
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
        headers: { 'Authorization': AUTH_HEADER, 'Content-Disposition': `attachment; filename="${file.name}"` },
        body: wpFormData,
      });
      if (!wpRes.ok) throw new Error('WordPress upload failed');
      const wpData = await wpRes.json();
      const res = await storeAPI.updateMyStore({ [type]: wpData.source_url });
      const updatedStore = res.data.store;
      setStore(updatedStore);
      if (setAuthStore) setAuthStore(updatedStore);
      toast.success(`${type} updated successfully!`, { id: toastId });
    } catch (err) {
      toast.error('Upload failed', { id: toastId });
    } finally { setSaving(false); }
  };

  const copyLink = () => {
    const link = `${window.location.origin}/store/${store?.slug}`;
    navigator.clipboard.writeText(link).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  if (loading) return <div className="page-loading" style={{minHeight:'40vh'}}><div className="spinner" style={{width:32,height:32,borderWidth:3}}/></div>;
  if (!store) return null;

  const storeLink = `${window.location.origin}/store/${store.slug}`;
  const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5003';

  const tabs = [
    ['general', t('settings.tabGeneral')],
    ['media', t('settings.tabMedia')],
    ['hours', t('settings.tabHours')],
    ['payment', t('settings.tabPayment')],
    ['theme', t('settings.tabTheme')],
  ];

  return (
    <div style={{maxWidth:780}}>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('settings.title')}</h1>
          <p className="page-subtitle">{t('settings.subtitle')}</p>
        </div>
      </div>

      <div className="card store-link-card">
        <div className="store-link-label"><LinkIcon size={15}/> {t('settings.bookingLink')}</div>
        <div className="store-link-row">
          <div className="store-link-url">{storeLink}</div>
          <button className="btn btn-outline btn-sm" onClick={copyLink}>
            {copied ? <><Check size={14}/> {t('common.copied')}</> : <><Copy size={14}/> {t('common.copy')}</>}
          </button>
          <a href={`/store/${store.slug}`} target="_blank" rel="noopener" className="btn btn-primary btn-sm">{t('common.visit')} →</a>
        </div>
      </div>

      <div className="tabs">
        {tabs.map(([k,l]) => (
          <button key={k} className={`tab ${tab===k?'active':''}`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === 'general' && (
        <div className="card animate-fadeIn">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{t('settings.storeName')}</label>
              <input className="form-input" value={store.name||''} onChange={e=>set('name',e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">{t('settings.category')}</label>
              <select className="form-input" value={store.category||'other'} onChange={e=>set('category',e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">{t('settings.description')}</label>
            <textarea className="form-input" rows={3} value={store.description||''} onChange={e=>set('description',e.target.value)} placeholder={t('settings.descPlaceholder')} />
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">{t('settings.phone')}</label><input className="form-input" value={store.phone||''} onChange={e=>set('phone',e.target.value)} /></div>
            <div className="form-group"><label className="form-label">{t('settings.email')}</label><input type="email" className="form-input" value={store.email||''} onChange={e=>set('email',e.target.value)} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">{t('settings.website')}</label><input className="form-input" placeholder="https://..." value={store.website||''} onChange={e=>set('website',e.target.value)} /></div>
            <div className="form-group">
              <label className="form-label">{t('settings.currency')}</label>
              <select className="form-input" value={store.currency||'INR'} onChange={e=>set('currency',e.target.value)}>
                <option value="INR">INR (₹)</option><option value="USD">USD ($)</option><option value="EUR">EUR (€)</option><option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>
          <h3 style={{margin:'20px 0 12px',fontSize:'1rem'}}>{t('settings.address')}</h3>
          <div className="form-row">
            <div className="form-group"><label className="form-label">{t('settings.street')}</label><input className="form-input" value={store.address?.street||''} onChange={e=>setNested('address','street',e.target.value)} /></div>
            <div className="form-group"><label className="form-label">{t('settings.city')}</label><input className="form-input" value={store.address?.city||''} onChange={e=>setNested('address','city',e.target.value)} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">{t('settings.state')}</label><input className="form-input" value={store.address?.state||''} onChange={e=>setNested('address','state',e.target.value)} /></div>
            <div className="form-group"><label className="form-label">{t('settings.country')}</label><input className="form-input" value={store.address?.country||''} onChange={e=>setNested('address','country',e.target.value)} /></div>
          </div>
          <h3 style={{margin:'20px 0 12px',fontSize:'1rem'}}>{t('settings.socialLinks')}</h3>
          <div className="form-row">
            <div className="form-group"><label className="form-label">{t('settings.instagram')}</label><input className="form-input" placeholder="https://instagram.com/..." value={store.socialLinks?.instagram||''} onChange={e=>setNested('socialLinks','instagram',e.target.value)} /></div>
            <div className="form-group"><label className="form-label">{t('settings.facebook')}</label><input className="form-input" placeholder="https://facebook.com/..." value={store.socialLinks?.facebook||''} onChange={e=>setNested('socialLinks','facebook',e.target.value)} /></div>
          </div>
          <button className="btn btn-primary" onClick={saveGeneral} disabled={saving}>
            {saving ? <span className="spinner"/> : t('common.save')}
          </button>
        </div>
      )}

      {tab === 'media' && (
        <div className="card animate-fadeIn">
          <div className="media-section">
            <div className="media-label">{t('settings.storeLogo')}</div>
            <div className="media-preview logo-preview">
              {store.logo ? (
                <img src={store.logo.startsWith('http') ? store.logo : `${BASE_URL}${store.logo}`} alt="Logo"
                  style={{width:'100%',height:'100%',objectFit:'cover'}}
                  onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100?text=No+Image"; }}/>
              ) : <div className="media-placeholder">{store.name?.[0]}</div>}
            </div>
            <input ref={logoRef} type="file" accept="image/*" style={{display:'none'}} onChange={e => e.target.files[0] && uploadFile(e.target.files[0],'logo')} />
            <button className="btn btn-outline btn-sm" onClick={() => logoRef.current.click()}>
              <Upload size={14}/> {t('common.uploadLogo')}
            </button>
          </div>
          <div className="divider"/>
          <div className="media-section">
            <div className="media-label">{t('settings.storeBanner')}</div>
            <div className="media-preview banner-preview">
              {store.banner ? (
                <img src={store.banner.startsWith('http') ? store.banner : `${BASE_URL}${store.banner}`} alt="Banner"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x200?text=Image+Load+Error"; }}/>
              ) : <div className="media-placeholder" style={{ fontSize: '1.2rem' }}>{t('settings.noBannerUploaded')}</div>}
            </div>
            <input ref={bannerRef} type="file" accept="image/*" style={{display:'none'}} onChange={e => e.target.files[0] && uploadFile(e.target.files[0],'banner')} />
            <button className="btn btn-outline btn-sm" onClick={() => bannerRef.current.click()}>
              <Upload size={14}/> {t('common.uploadBanner')}
            </button>
          </div>
        </div>
      )}

      {tab === 'hours' && (
        <div className="card animate-fadeIn">
          <p style={{color:'var(--ink-muted)',fontSize:14,marginBottom:20}}>{t('settings.hoursNote')}</p>
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
                  ) : <span style={{fontSize:13,color:'var(--ink-muted)',fontStyle:'italic'}}>{t('common.closed')}</span>}
                </div>
              );
            })}
          </div>
          <button className="btn btn-primary" style={{marginTop:24}} onClick={saveGeneral} disabled={saving}>
            {saving ? <span className="spinner"/> : t('settings.saveHours')}
          </button>
        </div>
      )}

      {tab === 'payment' && (
        <div className="card animate-fadeIn">
          <PaymentSettings store={store} setStore={setStore} />
        </div>
      )}

      {tab === 'theme' && (
        <div className="card animate-fadeIn">
          <h3 style={{fontSize:'1rem',fontWeight:700,marginBottom:4}}>{t('settings.themeTitle')}</h3>
          <p style={{color:'var(--ink-muted)',fontSize:14,marginBottom:24}}>{t('settings.themeNote')}</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:14}}>
            {[
              { id:'classic', name:'Classic',  colors:['#f59e0b','#1e3a5f','#f8fafc'],   dark:false },
              { id:'minimal', name:'Minimal',  colors:['#18181b','#52525b','#fafafa'],   dark:false },
              { id:'ocean',   name:'Ocean',    colors:['#0ea5e9','#0369a1','#f0f9ff'],   dark:false },
              { id:'nature',  name:'Nature',   colors:['#16a34a','#14532d','#f0fdf4'],   dark:false },
              { id:'sunset',  name:'Sunset',   colors:['#f97316','#c2410c','#fff7ed'],   dark:false },
              { id:'rose',    name:'Rose',     colors:['#e11d48','#be123c','#fff1f2'],   dark:false },
              { id:'luxury',  name:'Luxury',   colors:['#c084fc','#2d1b4e','#0d0b14'],   dark:true  },
            ].map(t2 => {
              const active = (store.theme || 'classic') === t2.id;
              return (
                <button key={t2.id}
                  onClick={() => {
                    const updated = { ...store, theme: t2.id };
                    setStore(updated);
                    storeAPI.updateMyStore({ theme: t2.id })
                      .then(r => { setStore(r.data.store); if (setAuthStore) setAuthStore(r.data.store); toast.success(`Theme changed to ${t2.name}`); })
                      .catch(() => toast.error('Failed to save theme'));
                  }}
                  style={{
                    border: active ? '2.5px solid var(--primary)' : '2px solid var(--border)',
                    borderRadius: 14, overflow: 'hidden', cursor: 'pointer',
                    background: 'none', padding: 0, position: 'relative',
                    transition: 'box-shadow 0.18s',
                    boxShadow: active ? '0 0 0 4px rgba(var(--primary-rgb),0.15)' : 'none',
                  }}
                >
                  <div style={{height:72,background:`linear-gradient(135deg, ${t2.colors[1]} 0%, ${t2.colors[0]} 100%)`,display:'flex',alignItems:'flex-end',justifyContent:'flex-end',padding:'0 8px 8px 0'}}>
                    {active && <span style={{background:'#fff',borderRadius:'50%',width:20,height:20,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,color:'#16a34a',fontWeight:900}}>✓</span>}
                  </div>
                  <div style={{background:t2.colors[2],padding:'8px 12px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:6}}>
                    <span style={{fontSize:13,fontWeight:active?700:600,color:t2.dark?'#e9d5ff':'#0f172a'}}>{t2.name}</span>
                    <span style={{width:12,height:12,borderRadius:'50%',background:t2.colors[0],border:'2px solid rgba(0,0,0,0.12)',flexShrink:0}}/>
                  </div>
                </button>
              );
            })}
          </div>
          <div style={{marginTop:20,padding:'14px 16px',borderRadius:10,background:'var(--bg-soft)',fontSize:13,color:'var(--ink-muted)',display:'flex',gap:10,alignItems:'flex-start'}}>
            <span style={{fontSize:16}}>💡</span>
            <span>{t('settings.themeHint')}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function PaymentSettings({ store, setStore }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ provider: store.paymentGateway?.provider || 'manual', apiKey: '', secretKey: '' });
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await storeAPI.updatePayment(form);
      setStore(p => ({ ...p, paymentGateway: { ...p.paymentGateway, ...form, isConnected: true } }));
      toast.success(t('settings.paymentUpdated'));
    } catch { toast.error('Failed'); } finally { setSaving(false); }
  };

  const togglePayment = async () => {
    setToggling(true);
    try {
      const res = await storeAPI.togglePayment(!store.paymentEnabled);
      setStore(p => ({ ...p, paymentEnabled: res.data.store.paymentEnabled }));
      toast.success(res.data.store.paymentEnabled ? t('settings.paymentsEnabled') : t('settings.paymentsDisabled'));
    } catch { toast.error('Failed'); } finally { setToggling(false); }
  };

  return (
    <div>
      <div className="payment-toggle-row">
        <div>
          <div style={{fontWeight:600,marginBottom:4}}>{t('settings.acceptPayments')}</div>
          <div style={{fontSize:13,color:'var(--ink-muted)'}}>{t('settings.allowCustomers')}</div>
        </div>
        <button className={`toggle-btn ${store.paymentEnabled ? 'on' : ''}`} onClick={togglePayment} disabled={toggling}>
          <div className="toggle-thumb"/>
        </button>
      </div>
      <div className="divider"/>
      <div className="form-group">
        <label className="form-label">{t('settings.paymentProvider')}</label>
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
            <label className="form-label">{t('settings.apiKey')}</label>
            <input className="form-input" type="password" placeholder={t('settings.apiKeyPlaceholder')} value={form.apiKey} onChange={e=>setForm(p=>({...p,apiKey:e.target.value}))} />
          </div>
          <div className="form-group">
            <label className="form-label">{t('settings.secretKey')}</label>
            <input className="form-input" type="password" placeholder={t('settings.secretKeyPlaceholder')} value={form.secretKey} onChange={e=>setForm(p=>({...p,secretKey:e.target.value}))} />
          </div>
        </>
      )}
      {store.paymentGateway?.isConnected && (
        <div className="badge badge-confirmed" style={{marginBottom:16}}>{t('settings.paymentConnected')}</div>
      )}
      <button className="btn btn-primary" onClick={save} disabled={saving}>
        {saving ? <span className="spinner"/> : t('settings.savePayment')}
      </button>
    </div>
  );
}
