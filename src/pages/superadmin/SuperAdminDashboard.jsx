import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  return new Date(d).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

function daysLeft(expiry) {
  if (!expiry) return null;
  return Math.ceil((new Date(expiry) - new Date()) / (1000 * 60 * 60 * 24));
}

function StatusBadge({ account }) {
  const { t } = useTranslation();
  const { subscription, storeActive } = account;
  if (!storeActive) return <span className="sa-badge sa-badge-suspended">{t('superadmin.suspended')}</span>;
  if (subscription?.status === 'canceled') return <span className="sa-badge sa-badge-canceled">{t('superadmin.cancelSub')}</span>;
  const days = daysLeft(subscription?.expiryDate);
  if (days !== null && days <= 0) return <span className="sa-badge sa-badge-expired">{t('superadmin.expired')}</span>;
  if (days !== null && days <= 7) return <span className="sa-badge sa-badge-expiring">Expiring ({days}d)</span>;
  return <span className="sa-badge sa-badge-active">{t('common.active')}</span>;
}

export default function SuperAdminDashboard() {
  const { t } = useTranslation();
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
    } finally { setActionLoading(false); }
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
    } finally { setActionLoading(false); }
  };

  const handleRevoke = async (action, storeId) => {
    setActionLoading(true);
    try {
      const id = storeId || selectedAccount?.storeId;
      if (!id) return toast.error('No account selected') && setActionLoading(false);
      await superAdminAPI.revokeAccount(id, action);
      toast.success(`Account ${action === 'activate' ? 'activated' : 'suspended'}`);
      closeModal();
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally { setActionLoading(false); }
  };

  const handleCancelSubscription = async (account) => {
    if (!window.confirm(`Cancel subscription for ${account.storeName}?`)) return;
    try {
      await superAdminAPI.cancelSubscription(account.storeId);
      toast.success('Subscription canceled');
      loadData();
    } catch { toast.error('Failed'); }
  };

  const logout = () => {
    localStorage.removeItem('superadmin_token');
    navigate('/superadmin/login');
  };

  if (loading) {
    return (
      <div className="sa-loading">
        <div className="sa-spinner" />
        <p>{t('superadmin.loadingData')}</p>
      </div>
    );
  }

  return (
    <div className="sa-dashboard">
      {/* Header */}
      <div className="sa-header">
        <div className="sa-header-left">
          <span className="sa-logo">🛡️ Avenirya</span>
          <span className="sa-header-title">{t('superadmin.dashboardTitle')}</span>
        </div>
        <button className="sa-logout-btn" onClick={logout}>{t('superadmin.logout')}</button>
      </div>

      <div className="sa-content">
        {/* Stats */}
        {stats && (
          <div className="sa-stats-grid">
            <div className="sa-stat-card">
              <div className="sa-stat-value">{stats.totalAccounts}</div>
              <div className="sa-stat-label">{t('superadmin.totalAccounts')}</div>
            </div>
            <div className="sa-stat-card sa-stat-green">
              <div className="sa-stat-value">{stats.activeSubscriptions}</div>
              <div className="sa-stat-label">{t('superadmin.activeSubscriptions')}</div>
            </div>
            <div className="sa-stat-card sa-stat-red">
              <div className="sa-stat-value">{stats.expiredSubscriptions}</div>
              <div className="sa-stat-label">{t('superadmin.expired')}</div>
            </div>
            <div className="sa-stat-card sa-stat-orange">
              <div className="sa-stat-value">{stats.suspendedAccounts}</div>
              <div className="sa-stat-label">{t('superadmin.suspended')}</div>
            </div>
            <div className="sa-stat-card sa-stat-blue">
              <div className="sa-stat-value">{stats.newAccountsThisMonth}</div>
              <div className="sa-stat-label">{t('superadmin.new30days')}</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="sa-filters">
          <input
            className="sa-search"
            type="text"
            placeholder={t('superadmin.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="sa-select" value={filterPlan} onChange={(e) => setFilterPlan(e.target.value)}>
            <option value="all">{t('superadmin.allPlans')}</option>
            {PLANS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
          <select className="sa-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">{t('superadmin.allStatus')}</option>
            <option value="active">{t('common.active')}</option>
            <option value="expired">{t('superadmin.expired')}</option>
            <option value="suspended">{t('superadmin.suspended')}</option>
          </select>
          <button className="sa-refresh-btn" onClick={loadData}>{t('superadmin.refresh')}</button>
        </div>

        {/* Accounts Table */}
        <div className="sa-table-wrapper">
          <table className="sa-table">
            <thead>
              <tr>
                <th>{t('superadmin.storeOwner')}</th>
                <th>{t('superadmin.registered')}</th>
                <th>{t('superadmin.plan')}</th>
                <th>{t('superadmin.started')}</th>
                <th>{t('superadmin.expires')}</th>
                <th>{t('superadmin.status')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="7" className="sa-no-data">{t('superadmin.noAccounts')}</td></tr>
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
                        <div className="sa-days-left">
                          {t('superadmin.daysLeft', { count: daysLeft(account.subscription.expiryDate) })}
                        </div>
                      )}
                    </td>
                    <td><StatusBadge account={account} /></td>
                    <td>
                      <div className="sa-actions">
                        <button className="sa-action-btn sa-btn-plan" onClick={() => openModal('plan', account)} title={t('superadmin.planAction')}>
                          📋 {t('superadmin.planAction')}
                        </button>
                        <button className="sa-action-btn sa-btn-extend" onClick={() => openModal('extend', account)} title={t('superadmin.extend')}>
                          📅 {t('superadmin.extend')}
                        </button>
                        {account.storeActive ? (
                          <button className="sa-action-btn sa-btn-suspend" onClick={() => openModal('revoke', account)} title={t('superadmin.suspend')}>
                            🚫 {t('superadmin.suspend')}
                          </button>
                        ) : (
                          <button className="sa-action-btn sa-btn-activate" onClick={() => handleRevoke('activate', account.storeId)} title={t('superadmin.activate')}>
                            ✅ {t('superadmin.activate')}
                          </button>
                        )}
                        <button className="sa-action-btn sa-btn-cancel" onClick={() => handleCancelSubscription(account)} title={t('superadmin.cancelSub')}>
                          ✕ {t('superadmin.cancelSub')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="sa-table-footer">
          {t('superadmin.showingAccounts', { count: filtered.length, total: accounts.length })}
        </div>
      </div>

      {/* Change Plan Modal */}
      {modal === 'plan' && (
        <div className="sa-modal-overlay" onClick={closeModal}>
          <div className="sa-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{t('superadmin.changePlan')}</h3>
            <p className="sa-modal-subtitle">
              Store: <strong>{selectedAccount?.storeName}</strong><br />
              {t('superadmin.currentPlanLabel')}: <strong>{selectedAccount?.subscription?.planName}</strong>
            </p>
            <div className="sa-field">
              <label>{t('superadmin.selectNewPlan')}</label>
              <select className="sa-select" value={modalData.planId || ''} onChange={(e) => setModalData({ planId: e.target.value })}>
                <option value="">{t('superadmin.choosePlan')}</option>
                {PLANS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
            <div className="sa-modal-actions">
              <button className="sa-modal-cancel" onClick={closeModal}>{t('common.cancel')}</button>
              <button className="sa-modal-confirm" onClick={handleChangePlan} disabled={actionLoading}>
                {actionLoading ? t('superadmin.saving') : t('superadmin.updatePlan')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Extend Expiry Modal */}
      {modal === 'extend' && (
        <div className="sa-modal-overlay" onClick={closeModal}>
          <div className="sa-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{t('superadmin.extendExpiry')}</h3>
            <p className="sa-modal-subtitle">
              Store: <strong>{selectedAccount?.storeName}</strong><br />
              {t('superadmin.currentExpiry')}: <strong>{formatDate(selectedAccount?.subscription?.expiryDate)}</strong>
            </p>
            <div className="sa-field">
              <label>{t('superadmin.extendByDays')}</label>
              <input
                type="number"
                placeholder={t('superadmin.daysPlaceholder')}
                className="sa-input"
                value={modalData.days || ''}
                onChange={(e) => setModalData({ days: e.target.value })}
              />
            </div>
            <div className="sa-field-divider">{t('superadmin.orExactDate')}</div>
            <div className="sa-field">
              <label>{t('superadmin.setExactDate')}</label>
              <input
                type="date"
                className="sa-input"
                value={modalData.newExpiryDate || ''}
                onChange={(e) => setModalData({ newExpiryDate: e.target.value })}
              />
            </div>
            <div className="sa-modal-actions">
              <button className="sa-modal-cancel" onClick={closeModal}>{t('common.cancel')}</button>
              <button className="sa-modal-confirm" onClick={handleExtend} disabled={actionLoading}>
                {actionLoading ? t('superadmin.saving') : t('superadmin.extendExpiry')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revoke / Suspend Modal */}
      {modal === 'revoke' && (
        <div className="sa-modal-overlay" onClick={closeModal}>
          <div className="sa-modal" onClick={(e) => e.stopPropagation()}>
            <h3>⚠️ {t('superadmin.suspendAccount')}</h3>
            <p className="sa-modal-subtitle">
              {t('superadmin.suspendConfirmMsg')}:<br />
              <strong>{selectedAccount?.storeName}</strong> ({selectedAccount?.user?.email})<br /><br />
              {t('superadmin.suspendWarning')}
            </p>
            <div className="sa-modal-actions">
              <button className="sa-modal-cancel" onClick={closeModal}>{t('common.cancel')}</button>
              <button className="sa-modal-danger" onClick={() => handleRevoke('suspend')} disabled={actionLoading}>
                {actionLoading ? t('superadmin.suspending') : t('superadmin.yesSuspend')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
