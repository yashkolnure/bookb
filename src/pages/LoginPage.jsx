import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import './AuthPages.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success(t('auth.welcomeBackToast'));
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || t('auth.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <Link to="/" className="auth-logo">BookKromess</Link>
        <div className="auth-brand-tagline">{t('auth.tagline')}</div>
        <div className="auth-brand-decor" aria-hidden />
      </div>
      <div className="auth-form-side">
        <div className="auth-form-wrap animate-fadeUp">
          <div className="auth-header">
            <h1>{t('auth.welcomeBack')}</h1>
            <p>{t('auth.signInSubtitle')}</p>
          </div>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">{t('auth.emailAddress')}</label>
              <input
                type="email" className="form-input" placeholder="you@example.com"
                value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                required autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('auth.password')}</label>
              <input
                type="password" className="form-input" placeholder="••••••••"
                value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? <span className="spinner" /> : t('auth.signIn')}
            </button>
          </form>
          <p className="auth-switch">
            {t('auth.noAccount')} <Link to="/register">{t('auth.createStore')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
