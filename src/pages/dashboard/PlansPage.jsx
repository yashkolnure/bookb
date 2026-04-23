import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storeAPI } from '../../api/api';
import { Check, Clock, Shield, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import './PlansPage.css';

const PLANS = [
  {
    id: 'free',
    name: '7 Day Free Trial',
    price: '₹0',
    period: '/ 7 days',
    buttonText: 'Free Trial',
    features: [
      '50 Bookings / month',
      'Basic Analytics',
      'Email Confirmations',
      'Custom booking page URL',
      'Standard Support',
    ],
    popular: false,
  },
  {
    id: 'quarterly',
    name: 'Quarterly',
    price: '₹1,999',
    period: '/ 3 months',
    buttonText: 'Get Quarterly',
    features: [
      'Unlimited Bookings',
      'SMS + Email Reminders',
      'Custom Branding & Logo',
      'Advanced Analytics',
      'Priority Support',
      '0% Transaction Fees',
    ],
    popular: false,
  },
  {
    id: 'halfyearly',
    name: 'Half Yearly',
    price: '₹3,499',
    period: '/ 6 months',
    buttonText: 'Get Half Yearly',
    features: [
      'Everything in Quarterly',
      'Multi-staff Accounts',
      'Custom Domain Support',
      'API Access',
      'Advanced Coupons & Offers',
      'Dedicated Support',
    ],
    popular: true,
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: '₹5,999',
    period: '/ 1 year',
    buttonText: 'Get Yearly',
    features: [
      'Everything in Half Yearly',
      'White-label Domain',
      'Dedicated Account Manager',
      'Custom Integrations',
      'SLA Uptime Guarantee',
      'Early Feature Access',
    ],
    popular: false,
  },
];

export default function PlansPage() {
  const { store, setStore } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  // Always fetch fresh subscription info from server on mount
  const fetchSubscription = async () => {
    setFetchLoading(true);
    try {
      const res = await storeAPI.getSubscription();
      if (res.data.success) {
        setSubscription(res.data.subscription);
        // Keep context/localStorage in sync
        if (store) {
          const updated = { ...store, subscription: res.data.subscription };
          setStore(updated);
          localStorage.setItem('store', JSON.stringify(updated));
        }
      }
    } catch (err) {
      // Fallback to context data if API fails
      setSubscription(store?.subscription || null);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const handleUpgrade = async (planId) => {
    if (planId === 'free') return;
    if (subscription?.planId === planId) return;
    setUpgradeLoading(true);
    try {
      const res = await storeAPI.upgradePlan(planId);
      if (res.data.success) {
        const updatedStore = res.data.store;
        const newSub = updatedStore.subscription;
        setSubscription(newSub);
        setStore(updatedStore);
        localStorage.setItem('store', JSON.stringify(updatedStore));
        toast.success(`Successfully upgraded to ${newSub?.planName}!`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upgrade failed. Please try again.');
    } finally {
      setUpgradeLoading(false);
    }
  };

  const expiryDate = subscription?.expiryDate
    ? new Date(subscription.expiryDate).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : '—';

  const daysLeft = subscription?.expiryDate
    ? Math.ceil((new Date(subscription.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  const isExpired = daysLeft !== null && daysLeft <= 0;
  const isActive = subscription?.status === 'active' && !isExpired;

  return (
    <div className="plans-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Subscription Plan</h1>
          <p className="page-subtitle">Choose the best plan for your business growth</p>
        </div>
        <button className="plans-refresh-btn" onClick={fetchSubscription} disabled={fetchLoading} title="Refresh subscription info">
          <RefreshCw size={15} className={fetchLoading ? 'spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Current Plan Status */}
      <div className="card current-plan-card">
        {fetchLoading ? (
          <div className="plans-skeleton">Loading subscription info...</div>
        ) : (
          <>
            <div className="plan-status-info">
              <div className="status-icon"><Clock size={24} /></div>
              <div>
                <div className="status-label">Current Plan</div>
                <div className="status-value">{subscription?.planName || 'No Active Plan'}</div>
              </div>
              <div className="status-divider" />
              <div>
                <div className="status-label">Expires On</div>
                <div className={`status-value ${isExpired ? 'expiring-soon' : ''}`}>{expiryDate}</div>
              </div>
              {daysLeft !== null && (
                <>
                  <div className="status-divider" />
                  <div>
                    <div className="status-label">Days Remaining</div>
                    <div className={`status-value ${daysLeft <= 7 ? 'expiring-soon' : ''}`}>
                      {isExpired ? 'Expired' : `${daysLeft} days`}
                    </div>
                  </div>
                </>
              )}
              {subscription?.startDate && (
                <>
                  <div className="status-divider" />
                  <div>
                    <div className="status-label">Started On</div>
                    <div className="status-value">
                      {new Date(subscription.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className={`badge ${isExpired ? 'badge-canceled' : isActive ? 'badge-confirmed' : 'badge-pending'}`}>
              {isExpired ? 'Expired' : isActive ? 'Active' : subscription?.status || 'Inactive'}
            </div>
          </>
        )}
      </div>

      {/* Pricing Grid */}
      <div className="pricing-grid pricing-grid-4">
        {PLANS.map((plan) => {
          const isCurrentPlan = !fetchLoading && subscription?.planId === plan.id;
          return (
            <div key={plan.id} className={`plan-card ${plan.popular ? 'popular' : ''} ${isCurrentPlan ? 'current' : ''}`}>
              {plan.tag && <div className="popular-tag">{plan.tag}</div>}
              {isCurrentPlan && <div className="current-plan-ribbon">✓ Your Plan</div>}
              <div className="plan-header">
                <h3 className="plan-name">{plan.name}</h3>
                <div className="plan-price">
                  <span className="amount">{plan.price}</span>
                  <span className="period">{plan.period}</span>
                </div>
              </div>
              <ul className="plan-features">
                {plan.features.map((feat, i) => (
                  <li key={i}>
                    <Check size={15} className="text-primary" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`btn ${isCurrentPlan ? 'btn-current' : plan.popular ? 'btn-primary' : 'btn-outline'} btn-full`}
                onClick={() => handleUpgrade(plan.id)}
                disabled={upgradeLoading || fetchLoading || isCurrentPlan || plan.id === 'free'}
              >
                {upgradeLoading && !isCurrentPlan ? 'Processing...' : isCurrentPlan ? '✓ Current Plan' : plan.buttonText}
              </button>
            </div>
          );
        })}
      </div>

      <div className="plans-guarantee">
        <Shield size={16} />
        <span>All plans include core features. Prices are inclusive of all taxes. Contact support to switch plans.</span>
      </div>
    </div>
  );
}