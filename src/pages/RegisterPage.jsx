import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import './AuthPages.css';

const categories = ['salon','clinic','fitness','consulting','beauty','education','other'];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [form, setForm] = useState({ name:'', email:'', password:'', storeName:'', storeCategory:'other' });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error(t('auth.passwordTooShort')); return; }
    setLoading(true);
    try {
      await register(form);
      toast.success(t('auth.storeCreated'));
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || t('auth.registrationFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <Link to="/" className="auth-logo">BookKromess</Link>
        <div className="auth-brand-tagline">{t('auth.registerTagline')}</div>
        <div className="auth-brand-bullets">
          <div>{t('auth.bullet1')}</div>
          <div>{t('auth.bullet2')}</div>
          <div>{t('auth.bullet3')}</div>
        </div>
        <div className="auth-brand-decor" aria-hidden />
      </div>
      <div className="auth-form-side">
        <div className="auth-form-wrap animate-fadeUp">
          <div className="auth-header">
            <h1>{t('auth.createYourStore')}</h1>
            <p>{t('auth.registerSubtitle')}</p>
          </div>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t('auth.yourName')}</label>
                <input className="form-input" placeholder="Jane Smith" value={form.name}
                  onChange={e => set('name', e.target.value)} required autoFocus />
              </div>
              <div className="form-group">
                <label className="form-label">{t('auth.email')}</label>
                <input type="email" className="form-input" placeholder="you@example.com" value={form.email}
                  onChange={e => set('email', e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">{t('auth.password')}</label>
              <input type="password" className="form-input" placeholder={t('auth.minPassword')} value={form.password}
                onChange={e => set('password', e.target.value)} required />
            </div>
            <div className="auth-section-divider">
              <span>{t('auth.yourStore')}</span>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t('auth.storeName')}</label>
                <input className="form-input" placeholder="Glow Salon & Spa" value={form.storeName}
                  onChange={e => set('storeName', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">{t('auth.category')}</label>
                <select className="form-input" value={form.storeCategory} onChange={e => set('storeCategory', e.target.value)}>
                  {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-gold btn-full btn-lg" disabled={loading}>
              {loading ? <span className="spinner" style={{borderTopColor:'#fff'}} /> : t('auth.createMyStore')}
            </button>
          </form>
          <p className="auth-switch">
            {t('auth.alreadyHaveAccount')} <Link to="/login">{t('auth.signInLink')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
