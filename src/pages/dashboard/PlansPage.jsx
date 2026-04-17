import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storeAPI } from '../../api/api'; 
import { Check, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import './PlansPage.css';

const PLANS = [
  {
    id: 'free',
    name: '7 Day Free Trial',
    price: '₹0',
    period: '/ 7 days',
    buttonText: 'Start for Free',
    features: ['50 Bookings / month', 'Stripe & PayPal integration', 'Basic Analytics', 'Email Confirmations', 'Custom booking page URL'],
    popular: false
  },
  {
    id: 'pro',
    name: 'Professional',
    price: '₹899',
    period: '/ 1 month',
    buttonText: 'Get Professional',
    tag: 'MOST POPULAR',
    features: ['Unlimited Bookings', 'SMS + Email Reminders', 'Custom Branding & Logo', 'Advanced Analytics', 'Priority Support', '0% Transaction Fees'],
    popular: true
  },
  {
    id: 'business',
    name: 'Business',
    price: '₹4,999',
    period: '/ 1 year',
    buttonText: 'Go Business',
    features: ['Multi-staff Accounts', 'White-label Domain', 'API Access', 'Dedicated Account Manager', 'Custom Integrations', 'SLA Uptime Guarantee'],
    popular: false
  }
];

export default function PlansPage() {
  // 1. Destructured correctly from useAuth
  const { store, setStore } = useAuth(); 
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async (planId) => {
    if (planId === 'free') return;

    setLoading(true);
    console.log('Initiating upgrade for:', planId);
    
    try {
      // 2. Using the storeAPI helper from your api.js
      const res = await storeAPI.upgradePlan(planId); 
      
      if (res.data.success) {
        const updatedStore = res.data.store;

        // 3. Update global state and persist to localStorage
        setStore(updatedStore); 
        localStorage.setItem('store', JSON.stringify(updatedStore));
        
        toast.success(`Successfully upgraded to ${updatedStore.subscription?.planName}!`);
      }
    } catch (err) {
      console.error('Upgrade error:', err);
      toast.error(err.response?.data?.message || 'Upgrade failed. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Safely format the date using nested subscription object
  const expiryDate = store?.subscription?.expiryDate 
    ? new Date(store.subscription.expiryDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }) 
    : 'No active trial found';

  return (
    <div className="plans-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Subscription Plan</h1>
          <p className="page-subtitle">Choose the best plan for your business growth</p>
        </div>
      </div>

      {/* Current Plan Status */}
      <div className="card current-plan-card">
        <div className="plan-status-info">
          <div className="status-icon"><Clock size={24} /></div>
          <div>
            <div className="status-label">Current Plan</div>
            {/* 5. Accessing nested subscription field */}
            <div className="status-value">{store?.subscription?.planName || 'Free Trial'}</div>
          </div>
          <div className="status-divider"></div>
          <div>
            <div className="status-label">Expires On</div>
            <div className="status-value">{expiryDate}</div>
          </div>
        </div>
        <div className="badge badge-confirmed">Active</div>
      </div>

      {/* Pricing Grid */}
      <div className="pricing-grid">
        {PLANS.map((plan) => {
          // Check if this plan is currently active
          const isCurrentPlan = store?.subscription?.planId === plan.id;

          return (
            <div key={plan.id} className={`plan-card ${plan.popular ? 'popular' : ''}`}>
              {plan.popular && <div className="popular-tag">{plan.tag}</div>}
              
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
                    <Check size={16} className="text-primary" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <button 
                className={`btn ${plan.popular ? 'btn-primary' : 'btn-outline'} btn-full`}
                onClick={() => handleUpgrade(plan.id)}
                disabled={loading || isCurrentPlan}
              >
                {isCurrentPlan ? 'Current Plan' : plan.buttonText}
              </button>
            </div>
          );
        })}
      </div>
      
      <p className="plans-footer-note">
        All plans include core features. Prices are inclusive of all taxes.
      </p>
    </div>
  );
}