import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './AuthPages.css';

const categories = ['salon','clinic','fitness','consulting','beauty','education','other'];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', email:'', password:'', storeName:'', storeCategory:'other' });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form);
      toast.success('Store created! Welcome to BookEase 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <Link to="/" className="auth-logo">BookEase</Link>
        <div className="auth-brand-tagline">Your store, your rules. Launch in minutes.</div>
        <div className="auth-brand-bullets">
          <div>✦ Instant booking URL</div>
          <div>✦ No credit card needed</div>
          <div>✦ Your payment gateway</div>
        </div>
        <div className="auth-brand-decor" aria-hidden />
      </div>
      <div className="auth-form-side">
        <div className="auth-form-wrap animate-fadeUp">
          <div className="auth-header">
            <h1>Create your store</h1>
            <p>Set up your service booking business for free</p>
          </div>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Your Name</label>
                <input className="form-input" placeholder="Jane Smith" value={form.name}
                  onChange={e => set('name', e.target.value)} required autoFocus />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" placeholder="you@example.com" value={form.email}
                  onChange={e => set('email', e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-input" placeholder="Min. 6 characters" value={form.password}
                onChange={e => set('password', e.target.value)} required />
            </div>
            <div className="auth-section-divider">
              <span>Your Store</span>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Store Name</label>
                <input className="form-input" placeholder="Glow Salon & Spa" value={form.storeName}
                  onChange={e => set('storeName', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-input" value={form.storeCategory} onChange={e => set('storeCategory', e.target.value)}>
                  {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-gold btn-full btn-lg" disabled={loading}>
              {loading ? <span className="spinner" style={{borderTopColor:'#fff'}} /> : 'Create My Store →'}
            </button>
          </form>
          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
