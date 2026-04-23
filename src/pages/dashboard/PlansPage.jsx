import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storeAPI } from '../../api/api';
import { Check, Clock, Shield, RefreshCw, X, Phone, Mail, MessageCircle } from 'lucide-react';
import './PlansPage.css';

const PLANS = [
  {
    id: 'free',
    name: '7 Day Free Trial',
    price: '₹0',
    period: '/ 7 days',
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
    tag: 'GREAT VALUE',
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
    tag: 'MOST POPULAR',
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
    tag: 'BEST DEAL',
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
  const [fetchLoading, setFetchLoading] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  
const email=process.env.email;
const phone=process.env.phone;

  const fetchSubscription = async () => {
    setFetchLoading(true);
    try {
      const res = await storeAPI.getSubscription();
      if (res.data.success) {
        setSubscription(res.data.subscription);
        if (store) {
          const updated = { ...store, subscription: res.data.subscription };
          setStore(updated);
          localStorage.setItem('store', JSON.stringify(updated));
        }
      }
    } catch {
      setSubscription(store?.subscription || null);
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => { fetchSubscription(); }, []);

  const handlePlanClick = (plan) => {
    if (subscription?.planId === plan.id) return;
    setSelectedPlan(plan);
    setShowContactModal(true);
  };

  const expiryDate = subscription?.expiryDate
    ? new Date(subscription.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
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
        <button className="plans-refresh-btn" onClick={fetchSubscription} disabled={fetchLoading}>
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
                onClick={() => handlePlanClick(plan)}
                disabled={isCurrentPlan || fetchLoading}
              >
                {isCurrentPlan ? '✓ Current Plan' : 'Upgrade to this Plan'}
              </button>
            </div>
          );
        })}
      </div>

      <div className="plans-guarantee">
        <Shield size={16} />
        <span>To upgrade or change your plan, please contact our customer support team.</span>
      </div>

      {/* Contact Customer Care Modal */}
      {showContactModal && (
        <div className="plans-modal-overlay" onClick={() => setShowContactModal(false)}>
          <div className="plans-modal" onClick={(e) => e.stopPropagation()}>
            <button className="plans-modal-close" onClick={() => setShowContactModal(false)}>
              <X size={18} />
            </button>

            <div className="plans-modal-icon">🎯</div>
            <h3 className="plans-modal-title">Interested in {selectedPlan?.name}?</h3>
            <p className="plans-modal-subtitle">
              To upgrade your plan, please reach out to our support team. We'll get you set up right away!
            </p>

            <div className="plans-contact-options">
              <a href={`tel:${phone}`} className="plans-contact-card">
                <div className="plans-contact-icon plans-contact-icon-phone">
                  <Phone size={20} />
                </div>
                <div>
                  <div className="plans-contact-label">Call Us</div>
                  <div className="plans-contact-value">+</div>
                </div>
              </a>

              <a href={`mailto:${email}`} className="plans-contact-card">
                <div className="plans-contact-icon plans-contact-icon-email">
                  <Mail size={20} />
                </div>
                <div>
                  <div className="plans-contact-label">Email Us</div>
                  <div className="plans-contact-value">{email}</div>
                </div>
              </a>

              <a
                href={`https://wa.me/${phone}`}
                target="_blank"
                rel="noreferrer"
                className="plans-contact-card"
              >
                <div className="plans-contact-icon plans-contact-icon-whatsapp">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <div className="plans-contact-label">WhatsApp</div>
                  <div className="plans-contact-value">Chat with us</div>
                </div>
              </a>
            </div>

            <p className="plans-modal-note">
              Our team is available <strong>Mon–Sat, 10am–7pm IST</strong>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}