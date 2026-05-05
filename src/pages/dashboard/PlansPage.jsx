import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { storeAPI } from '../../api/api';
import { Check, Clock, Shield, RefreshCw, X, Phone, Mail, MessageCircle } from 'lucide-react';
import './PlansPage.css';

const PLANS = [
  {
    id: 'free',
    name: '7 Day Free Trial',
    price: '₹0',
    period: '/ 7 days',
    features: ['50 Bookings / month','Basic Analytics','Email Confirmations','Custom booking page URL','Standard Support'],
    popular: false,
  },
  {
    id: 'quarterly',
    name: 'Quarterly',
    price: '₹1,999',
    period: '/ 3 months',
    features: ['Unlimited Bookings','SMS + Email Reminders','Custom Branding & Logo','Advanced Analytics','Priority Support','0% Transaction Fees'],
    popular: false,
  },
  {
    id: 'halfyearly',
    name: 'Half Yearly',
    price: '₹3,499',
    period: '/ 6 months',
    features: ['Everything in Quarterly','Multi-staff Accounts','Custom Domain Support','API Access','Advanced Coupons & Offers','Dedicated Support'],
    popular: true,
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: '₹5,999',
    period: '/ 1 year',
    features: ['Everything in Half Yearly','White-label Domain','Dedicated Account Manager','Custom Integrations','SLA Uptime Guarantee','Early Feature Access'],
    popular: false,
  },
];

export default function PlansPage() {
  const { store, setStore } = useAuth();
  const { t } = useTranslation();
  const [subscription, setSubscription] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

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
    } finally { setFetchLoading(false); }
  };

  useEffect(() => { fetchSubscription(); }, []);

  const handlePlanClick = (plan) => {
    if (subscription?.planId === plan.id) return;
    setSelectedPlan(plan);
    setShowContactModal(true);
  };

  const expiryDate = subscription?.expiryDate
    ? new Date(subscription.expiryDate).toLocaleDateString()
    : '—';
  const daysLeft = subscription?.expiryDate
    ? Math.ceil((new Date(subscription.expiryDate) - new Date()) / (1000*60*60*24))
    : null;
  const isExpired = daysLeft !== null && daysLeft <= 0;
  const isActive = subscription?.status === 'active' && !isExpired;

  return (
    <div className="plans-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('plans.title')}</h1>
          <p className="page-subtitle">{t('plans.subtitle')}</p>
        </div>
        <button className="plans-refresh-btn" onClick={fetchSubscription} disabled={fetchLoading}>
          <RefreshCw size={15} className={fetchLoading ? 'spin' : ''} />
          {t('common.refresh')}
        </button>
      </div>

      <div className="card current-plan-card">
        {fetchLoading ? (
          <div className="plans-skeleton">{t('plans.loading')}</div>
        ) : (
          <>
            <div className="plan-status-info">
              <div className="status-icon"><Clock size={24}/></div>
              <div>
                <div className="status-label">{t('plans.currentPlan')}</div>
                <div className="status-value">{subscription?.planName || t('plans.noActivePlan')}</div>
              </div>
              <div className="status-divider"/>
              <div>
                <div className="status-label">{t('plans.expiresOn')}</div>
                <div className={`status-value ${isExpired ? 'expiring-soon' : ''}`}>{expiryDate}</div>
              </div>
              {daysLeft !== null && (
                <>
                  <div className="status-divider"/>
                  <div>
                    <div className="status-label">{t('plans.daysRemaining')}</div>
                    <div className={`status-value ${daysLeft <= 7 ? 'expiring-soon' : ''}`}>
                      {isExpired ? t('plans.expired') : `${daysLeft} ${t('plans.days')}`}
                    </div>
                  </div>
                </>
              )}
              {subscription?.startDate && (
                <>
                  <div className="status-divider"/>
                  <div>
                    <div className="status-label">{t('plans.startedOn')}</div>
                    <div className="status-value">{new Date(subscription.startDate).toLocaleDateString()}</div>
                  </div>
                </>
              )}
            </div>
            <div className={`badge ${isExpired ? 'badge-canceled' : isActive ? 'badge-confirmed' : 'badge-pending'}`}>
              {isExpired ? t('plans.expired') : isActive ? t('common.active') : subscription?.status || t('common.inactive')}
            </div>
          </>
        )}
      </div>

      <div className="pricing-grid pricing-grid-4">
        {PLANS.map((plan) => {
          const isCurrentPlan = !fetchLoading && subscription?.planId === plan.id;
          return (
            <div key={plan.id} className={`plan-card ${plan.popular ? 'popular' : ''} ${isCurrentPlan ? 'current' : ''}`}>
              {isCurrentPlan && <div className="current-plan-ribbon">{t('plans.yourPlan')}</div>}
              <div className="plan-header">
                <h3 className="plan-name">{plan.name}</h3>
                <div className="plan-price">
                  <span className="amount">{plan.price}</span>
                  <span className="period">{plan.period}</span>
                </div>
              </div>
              <ul className="plan-features">
                {plan.features.map((feat, i) => (
                  <li key={i}><Check size={15} className="text-primary"/><span>{feat}</span></li>
                ))}
              </ul>
              <button
                className={`btn ${isCurrentPlan ? 'btn-current' : plan.popular ? 'btn-primary' : 'btn-outline'} btn-full`}
                onClick={() => handlePlanClick(plan)}
                disabled={isCurrentPlan || fetchLoading}
              >
                {isCurrentPlan ? t('plans.yourPlan') : t('plans.upgradePlan')}
              </button>
            </div>
          );
        })}
      </div>

      <div className="plans-guarantee">
        <Shield size={16}/>
        <span>{t('plans.contactSupport')}</span>
      </div>

      {showContactModal && (
        <div className="plans-modal-overlay" onClick={() => setShowContactModal(false)}>
          <div className="plans-modal" onClick={(e) => e.stopPropagation()}>
            <button className="plans-modal-close" onClick={() => setShowContactModal(false)}><X size={18}/></button>
            <div className="plans-modal-icon">🎯</div>
            <h3 className="plans-modal-title">{t('plans.interestedIn', { planName: selectedPlan?.name })}</h3>
            <p className="plans-modal-subtitle">{t('plans.upgradeDesc')}</p>
            <div className="plans-contact-options">
              <a href={`tel:${import.meta.env.VITE_SUPPORT_PHONE}`} className="plans-contact-card">
                <div className="plans-contact-icon plans-contact-icon-phone"><Phone size={20}/></div>
                <div>
                  <div className="plans-contact-label">{t('plans.callUs')}</div>
                  <div className="plans-contact-value">{import.meta.env.VITE_SUPPORT_PHONE}</div>
                </div>
              </a>
              <a href={`mailto:${import.meta.env.VITE_SUPPORT_EMAIL}`} className="plans-contact-card">
                <div className="plans-contact-icon plans-contact-icon-email"><Mail size={20}/></div>
                <div>
                  <div className="plans-contact-label">{t('plans.emailUs')}</div>
                  <div className="plans-contact-value">{import.meta.env.VITE_SUPPORT_EMAIL}</div>
                </div>
              </a>
              <a href={`https://wa.me/${import.meta.env.VITE_SUPPORT_WHATSAPP}`} target="_blank" rel="noreferrer" className="plans-contact-card">
                <div className="plans-contact-icon plans-contact-icon-whatsapp"><MessageCircle size={20}/></div>
                <div>
                  <div className="plans-contact-label">{t('plans.whatsapp')}</div>
                  <div className="plans-contact-value">{t('plans.chatWithUs')}</div>
                </div>
              </a>
            </div>
            <p className="plans-modal-note">
              {t('plans.availability')} <strong>{t('plans.availabilityHours')}</strong>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
