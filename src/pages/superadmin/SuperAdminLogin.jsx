import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { superAdminAPI } from '../../api/api';
import toast from 'react-hot-toast';
import './SuperAdmin.css';

export default function SuperAdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await superAdminAPI.login({ email, password });
      if (res.data.success) {
        localStorage.setItem('superadmin_token', res.data.token);
        toast.success('Welcome, Super Admin!');
        navigate('/superadmin/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sa-login-wrapper">
      <div className="sa-login-card">
        <div className="sa-login-header">
          <div className="sa-shield-icon">🛡️</div>
          <h1>Super Admin</h1>
          <p>Avenirya Platform Control</p>
        </div>
        <form onSubmit={handleLogin} className="sa-login-form">
          <div className="sa-field">
            <label>Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@avenirya.com"
              required
              autoComplete="off"
            />
          </div>
          <div className="sa-field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              required
            />
          </div>
          <button type="submit" className="sa-login-btn" disabled={loading}>
            {loading ? 'Authenticating...' : 'Access Dashboard'}
          </button>
        </form>
        <p className="sa-login-notice">🔒 Restricted access. This page is not publicly linked.</p>
      </div>
    </div>
  );
}
