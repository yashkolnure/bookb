import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { superAdminAPI } from '../../api/api';
import toast from 'react-hot-toast';
import './SuperAdmin.css';

const PLANS = [
  { id: 'free', label: '7-Day Free Trial' },
  { id: 'quarterly', label: 'Quarterly (3 Months)' },
  { id: 'halfyearly', label: 'Half Yearly (6 Months)' },
  { id: 'yearly', label: 'Yearly (1 Year)' },
];

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function daysLeft(expiry) {
  if (!expiry) return null;
  const diff = new Date(expiry) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function StatusBadge({ account }) {
  const { subscription, storeActive } = account;
  if (!storeActive) return <span className="sa-badge sa-badge-suspended">Suspended</span>;
  if (subscription?.status === 'canceled') return <span className="sa-badge sa-badge-canceled">Canceled</span>;
  const days = daysLeft(subscription?.expiryDate);
  if (days !== null && days <= 0) return <span className="sa-badge sa-badge-expired">Expired</span>;
  if (days !== null && days <= 7) return <span className="sa-badge sa-badge-expiring">Expiring ({days}d)</span>;
  return <span className="sa-badge sa-badge-active">Active</span>;
}

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [modal, setModal] = useState(null); // 'plan' | 'extend' | 'revoke'
  const [modalData, setModalData] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('superadmin_token');
    if (!token) { navigate('/superadmin/login'); return; }
    loadData();
  }, []);

  useEffect(() => {
    let result = [...accounts];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(a =>
        a.storeName?.toLowerCase().includes(q) ||
        a.user?.name?.toLowerCase().includes(q) ||
        a.user?.email?.toLowerCase().includes(q)
      );
    }
    if (filterPlan !== 'all') result = result.filter(a => a.subscription?.planId === filterPlan);
    if (filterStatus === 'active') result = result.filter(a => a.storeActive && a.subscription?.status !== 'canceled' && daysLeft(a.subscription?.expiryDate) > 0);
    if (filterStatus === 'expired') result = result.filter(a => daysLeft(a.subscription?.expiryDate) <= 0);
    if (filterStatus === 'suspended') result = result.filter(a => !a.storeActive);
    setFiltered(result);
  }, [search, filterPlan, filterStatus, accounts]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, accountsRes] = await Promise.all([
        superAdminAPI.getStats(),
        superAdminAPI.getAccounts(),
      ]);
      setStats(statsRes.data.stats);
      setAccounts(accountsRes.data.accounts);
    } catch (err) {
      if (err.response?.status === 401) { navigate('/superadmin/login'); return; }
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type, account) => {
    setSelectedAccount(account);
    setModalData({});
    setModal(type);
  };

  const closeModal = () => { setModal(null); setSelectedAccount(null); setModalData({}); };

  const handleChangePlan = async () => {
    if (!modalData.planId) return toast.error('Select a plan');
    setActionLoading(true);
    try {
      await superAdminAPI.changePlan(selectedAccount.storeId, modalData.planId);
      toast.success('Plan updated successfully');
      closeModal();
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change plan');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExtend = async () => {
    if (!modalData.days && !modalData.newExpiryDate) return toast.error('Enter days or a date');
    setActionLoading(true);
    try {
      await superAdminAPI.extendExpiry(selectedAccount.storeId, modalData);
      toast.success('Expiry date updated');
      closeModal();
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to extend');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevoke = async (action, storeId) => {
    setActionLoading(true);
    try {
      const id = storeId || selectedAccount?.storeId;
      if (!id) return toast.error("No account selected") && setActionLoading(false);
      await superAdminAPI.revokeAccount(id, action);
      toast.success(`Account ${action === 'activate' ? 'activated' : 'suspended'}`);
      closeModal();
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelSubscription = async (account) => {
    if (!window.confirm(`Cancel subscription for ${account.storeName}?`)) return;
    try {
      await superAdminAPI.cancelSubscription(account.storeId);
      toast.success('Subscription canceled');
      loadData();
    } catch {
      toast.error('Failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('superadmin_token');
    navigate('/superadmin/login');
  };

  if (loading) {
    return (
      <div className="sa-loading">
        <div className="sa-spinner"></div>
        <p>Loading admin data...</p>
      </div>
    );
  }

  return (
    <div className="sa-dashboard">
      {/* Header */}
      <div className="sa-header">
        <div className="sa-header-left">
          <span className="sa-logo">🛡️ Avenirya</span>
          <span className="sa-header-title">Super Admin Dashboard</span>
        </div>
        <button className="sa-logout-btn" onClick={logout}>Logout</button>
      </div>

      <div className="sa-content">
        {/* Stats */}
        {stats && (
          <div className="sa-stats-grid">
            <div className="sa-stat-card">
              <div className="sa-stat-value">{stats.totalAccounts}</div>
              <div className="sa-stat-label">Total Accounts</div>
            </div>
            <div className="sa-stat-card sa-stat-green">
              <div className="sa-stat-value">{stats.activeSubscriptions}</div>
              <div className="sa-stat-label">Active Subscriptions</div>
            </div>
            <div className="sa-stat-card sa-stat-red">
              <div className="sa-stat-value">{stats.expiredSubscriptions}</div>
              <div className="sa-stat-label">Expired</div>
            </div>
            <div className="sa-stat-card sa-stat-orange">
              <div className="sa-stat-value">{stats.suspendedAccounts}</div>
              <div className="sa-stat-label">Suspended</div>
            </div>
            <div className="sa-stat-card sa-stat-blue">
              <div className="sa-stat-value">{stats.newAccountsThisMonth}</div>
              <div className="sa-stat-label">New (30 days)</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="sa-filters">
          <input
            className="sa-search"
            type="text"
            placeholder="Search by name, email, store..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="sa-select" value={filterPlan} onChange={(e) => setFilterPlan(e.target.value)}>
            <option value="all">All Plans</option>
            {PLANS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
          <select className="sa-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="suspended">Suspended</option>
          </select>
          <button className="sa-refresh-btn" onClick={loadData}>↻ Refresh</button>
        </div>

        {/* Accounts Table */}
        <div className="sa-table-wrapper">
          <table className="sa-table">
            <thead>
              <tr>
                <th>Store / Owner</th>
                <th>Registered</th>
                <th>Plan</th>
                <th>Started</th>
                <th>Expires</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="7" className="sa-no-data">No accounts found</td></tr>
              ) : (
                filtered.map((account) => (
                  <tr key={account.storeId} className={!account.storeActive ? 'sa-row-suspended' : ''}>
                    <td>
                      <div className="sa-account-name">{account.storeName}</div>
                      <div className="sa-account-email">{account.user?.name} · {account.user?.email}</div>
                    </td>
                    <td>{formatDate(account.user?.registeredAt)}</td>
                    <td>
                      <span className="sa-plan-tag">{account.subscription?.planName || '—'}</span>
                    </td>
                    <td>{formatDate(account.subscription?.startDate)}</td>
                    <td>
                      <span className={daysLeft(account.subscription?.expiryDate) <= 0 ? 'sa-expired-date' : ''}>
                        {formatDate(account.subscription?.expiryDate)}
                      </span>
                      {daysLeft(account.subscription?.expiryDate) > 0 && (
                        <div className="sa-days-left">{daysLeft(account.subscription?.expiryDate)}d left</div>
                      )}
                    </td>
                    <td><StatusBadge account={account} /></td>
                    <td>
                      <div className="sa-actions">
                        <button className="sa-action-btn sa-btn-plan" onClick={() => openModal('plan', account)} title="Change Plan">
                          📋 Plan
                        </button>
                        <button className="sa-action-btn sa-btn-extend" onClick={() => openModal('extend', account)} title="Extend Expiry">
                          📅 Extend
                        </button>
                        {account.storeActive ? (
                          <button className="sa-action-btn sa-btn-suspend" onClick={() => openModal('revoke', account)} title="Suspend">
                            🚫 Suspend
                          </button>
                        ) : (
                          <button className="sa-action-btn sa-btn-activate" onClick={() => handleRevoke('activate', account.storeId)} title="Activate">
                            ✅ Activate
                          </button>
                        )}
                        <button className="sa-action-btn sa-btn-cancel" onClick={() => handleCancelSubscription(account)} title="Cancel Subscription">
                          ✕ Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="sa-table-footer">Showing {filtered.length} of {accounts.length} accounts</div>
      </div>

      {/* Change Plan Modal */}
      {modal === 'plan' && (
        <div className="sa-modal-overlay" onClick={closeModal}>
          <div className="sa-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Change Plan</h3>
            <p className="sa-modal-subtitle">
              Store: <strong>{selectedAccount?.storeName}</strong><br />
              Current Plan: <strong>{selectedAccount?.subscription?.planName}</strong>
            </p>
            <div className="sa-field">
              <label>Select New Plan</label>
              <select className="sa-select" value={modalData.planId || ''} onChange={(e) => setModalData({ planId: e.target.value })}>
                <option value="">— Choose Plan —</option>
                {PLANS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
            <div className="sa-modal-actions">
              <button className="sa-modal-cancel" onClick={closeModal}>Cancel</button>
              <button className="sa-modal-confirm" onClick={handleChangePlan} disabled={actionLoading}>
                {actionLoading ? 'Saving...' : 'Update Plan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Extend Expiry Modal */}
      {modal === 'extend' && (
        <div className="sa-modal-overlay" onClick={closeModal}>
          <div className="sa-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Extend Expiry</h3>
            <p className="sa-modal-subtitle">
              Store: <strong>{selectedAccount?.storeName}</strong><br />
              Current Expiry: <strong>{formatDate(selectedAccount?.subscription?.expiryDate)}</strong>
            </p>
            <div className="sa-field">
              <label>Extend by Days</label>
              <input
                type="number"
                placeholder="e.g. 30"
                className="sa-input"
                value={modalData.days || ''}
                onChange={(e) => setModalData({ days: e.target.value })}
              />
            </div>
            <div className="sa-field-divider">— or set exact date —</div>
            <div className="sa-field">
              <label>Set Exact Expiry Date</label>
              <input
                type="date"
                className="sa-input"
                value={modalData.newExpiryDate || ''}
                onChange={(e) => setModalData({ newExpiryDate: e.target.value })}
              />
            </div>
            <div className="sa-modal-actions">
              <button className="sa-modal-cancel" onClick={closeModal}>Cancel</button>
              <button className="sa-modal-confirm" onClick={handleExtend} disabled={actionLoading}>
                {actionLoading ? 'Saving...' : 'Extend Expiry'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revoke / Suspend Modal */}
      {modal === 'revoke' && (
        <div className="sa-modal-overlay" onClick={closeModal}>
          <div className="sa-modal" onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ Suspend Account</h3>
            <p className="sa-modal-subtitle">
              Are you sure you want to <strong>suspend</strong> the account for:<br />
              <strong>{selectedAccount?.storeName}</strong> ({selectedAccount?.user?.email})?<br /><br />
              This will deactivate their store and cancel their subscription. You can reactivate it later.
            </p>
            <div className="sa-modal-actions">
              <button className="sa-modal-cancel" onClick={closeModal}>Cancel</button>
              <button className="sa-modal-danger" onClick={() => handleRevoke('suspend')} disabled={actionLoading}>
                {actionLoading ? 'Suspending...' : 'Yes, Suspend Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}