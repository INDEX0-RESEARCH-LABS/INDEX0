/**
 * Subscription Plan Modal — @index0/ide-web
 * High-fidelity sovereign billing and subscription management modal displaying
 * Community, Professional, and Sovereign Enterprise tiers with active quota meters.
 */

import React, { useState, useMemo } from 'react';
import {
  Check,
  Zap,
  Shield,
  Crown,
  CreditCard,
  X,
  Clock,
  Cpu,
  Sparkles,
  AlertCircle,
  Database
} from 'lucide-react';
import type { SubscriptionTier } from '@index0/contracts';

export interface IPlanQuotaInfo {
  tokensPerMonth: number;
  concurrentSandboxes: number;
  overageAllowed: boolean;
}

export interface ISubscriptionTierCard {
  code: string;
  tier: SubscriptionTier;
  name: string;
  description: string;
  amountCentsMonthly: number;
  amountCentsAnnual: number;
  trialPeriodDays: number;
  quotas: IPlanQuotaInfo;
  features: string[];
  isPopular?: boolean;
  badge?: string;
  colorAccent: string;
}

/**
 * Authoritative 3 subscription tiers mirroring infra/lago/plans.json
 */
export const AUTHORITATIVE_PLANS: Record<string, ISubscriptionTierCard> = {
  plan_free: {
    code: 'plan_free',
    tier: 'free',
    name: 'Community Developer',
    description: 'Free tier for personal exploration and open-source contributions',
    amountCentsMonthly: 0,
    amountCentsAnnual: 0,
    trialPeriodDays: 0,
    quotas: {
      tokensPerMonth: 300000,
      concurrentSandboxes: 1,
      overageAllowed: false
    },
    features: [
      '300K Tokens / month',
      '1 Concurrent MicroVM sandbox',
      'Standard MCP Tools (filesystem, search)',
      'Local Firecracker microVM execution',
      'Community forum support'
    ],
    colorAccent: '#94a3b8'
  },
  plan_pro: {
    code: 'plan_pro',
    tier: 'pro',
    name: 'Professional Engineer',
    description: 'Full sovereign AI IDE runtime with generous limits and metered overage',
    amountCentsMonthly: 2900,
    amountCentsAnnual: 2320, // 20% annual discount ($23.20/mo)
    trialPeriodDays: 14,
    quotas: {
      tokensPerMonth: 1000000,
      concurrentSandboxes: 5,
      overageAllowed: true
    },
    features: [
      '1,000,000 Tokens / month',
      '5 Concurrent MicroVM sandboxes',
      'Metered overage: $0.03 / 1K tokens',
      'Sandbox overage: $0.01 / min runtime',
      'Full Model Context Protocol (MCP) suite',
      'Temporal workflow orchestration & persistence',
      'OpenMeter live usage rating'
    ],
    isPopular: true,
    badge: 'MOST POPULAR',
    colorAccent: '#818cf8'
  },
  plan_enterprise: {
    code: 'plan_enterprise',
    tier: 'enterprise',
    name: 'Sovereign Enterprise',
    description: 'Dedicated sovereign cluster with priority execution and volume discounts',
    amountCentsMonthly: 49900,
    amountCentsAnnual: 39920, // 20% annual discount ($399.20/mo)
    trialPeriodDays: 30,
    quotas: {
      tokensPerMonth: 50000000,
      concurrentSandboxes: 50,
      overageAllowed: true
    },
    features: [
      '50,000,000 Tokens / month',
      '50 Concurrent MicroVM sandboxes',
      'Volume discounted overage: $0.02 / 1K tokens',
      'Dedicated self-hosted cluster deployment',
      'Custom Zitadel SSO / SAML / RBAC',
      'Dedicated Temporal workers & isolated pools',
      '24/7 Dedicated engineering SLA'
    ],
    badge: 'ENTERPRISE SOVEREIGNTY',
    colorAccent: '#f59e0b'
  }
};

export interface ISubscriptionPlanModalProps {
  currentPlanCode?: string;
  currentTokensUsed?: number;
  currentSandboxesActive?: number;
  onSelectPlan?: (planCode: string) => void;
  onClose?: () => void;
  className?: string;
}

export const SubscriptionPlanModal: React.FC<ISubscriptionPlanModalProps> = ({
  currentPlanCode = 'plan_free',
  currentTokensUsed = 142500,
  currentSandboxesActive = 1,
  onSelectPlan,
  onClose,
  className = ''
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string>(currentPlanCode);

  const activePlan = useMemo(
    () => AUTHORITATIVE_PLANS[currentPlanCode] || AUTHORITATIVE_PLANS.plan_free,
    [currentPlanCode]
  );

  const tokenUsagePercent = useMemo(() => {
    const quota = activePlan.quotas.tokensPerMonth;
    if (!quota || quota === 0) return 0;
    const pct = Number(((currentTokensUsed / quota) * 100).toFixed(1));
    return Math.min(pct, 100);
  }, [currentTokensUsed, activePlan]);

  const handlePlanAction = (planCode: string) => {
    setSelectedPlan(planCode);
    if (onSelectPlan) {
      onSelectPlan(planCode);
    }
  };

  return (
    <div
      className={`index0-subscription-modal ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        background: '#0a0c14',
        color: '#e2e8f0',
        overflow: 'hidden',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
      }}
      data-testid="subscription-plan-modal"
    >
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          background: '#121524',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.3)'
            }}
          >
            <Crown size={18} color="#f59e0b" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <strong style={{ fontSize: '1rem', color: '#f8fafc' }}>
                INDEX0 Sovereign Subscription & Rating Plans
              </strong>
              <span
                style={{
                  background: 'rgba(99, 102, 241, 0.2)',
                  color: '#a5b4fc',
                  border: '1px solid rgba(99, 102, 241, 0.35)',
                  borderRadius: '4px',
                  padding: '1px 8px',
                  fontSize: '0.68rem',
                  fontWeight: 600
                }}
              >
                Current: {activePlan.name}
              </span>
            </div>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px' }}>
              Metered by OpenMeter • Rated & Billed by Lago Engine (Port 3001)
            </div>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Close billing modal"
            data-testid="billing-modal-close-btn"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Main Body */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        {/* Active Quota Usage Meter Banner */}
        <div
          style={{
            background: 'rgba(18, 21, 36, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}
          data-testid="quota-usage-banner"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={16} color="#38bdf8" />
              <strong style={{ fontSize: '0.85rem', color: '#f1f5f9' }}>
                Active Monthly Quota Meter ({activePlan.name})
              </strong>
            </div>
            <span
              style={{
                fontSize: '0.72rem',
                color: activePlan.quotas.overageAllowed ? '#34d399' : '#f59e0b',
                background: activePlan.quotas.overageAllowed
                  ? 'rgba(16, 185, 129, 0.15)'
                  : 'rgba(245, 158, 11, 0.15)',
                padding: '2px 8px',
                borderRadius: '4px',
                border: activePlan.quotas.overageAllowed
                  ? '1px solid rgba(16, 185, 129, 0.3)'
                  : '1px solid rgba(245, 158, 11, 0.3)',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {activePlan.quotas.overageAllowed ? (
                <>
                  <Check size={11} color="#34d399" />
                  <span>Metered Overage Active</span>
                </>
              ) : (
                <>
                  <AlertCircle size={11} color="#f59e0b" />
                  <span>Usage Capped (No Overage)</span>
                </>
              )}
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
              alignItems: 'center'
            }}
          >
            {/* Tokens Usage Meter */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8' }}>
                <span>Monthly Tokens Consumed</span>
                <span style={{ color: '#e2e8f0', fontWeight: 600 }}>
                  {currentTokensUsed.toLocaleString()} / {activePlan.quotas.tokensPerMonth.toLocaleString()} ({tokenUsagePercent}%)
                </span>
              </div>
              <div
                style={{
                  height: '8px',
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${tokenUsagePercent}%`,
                    background:
                      tokenUsagePercent > 85
                        ? '#ef4444'
                        : tokenUsagePercent > 60
                        ? '#f59e0b'
                        : 'linear-gradient(90deg, #6366f1, #38bdf8)',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
            </div>

            {/* Sandbox Concurrency Gauge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                <Clock size={16} color="#34d399" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Active MicroVM Sandboxes</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>
                    {currentSandboxesActive} / {activePlan.quotas.concurrentSandboxes} Active
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                <CreditCard size={16} color="#818cf8" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Billing Engine</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8' }}>
                    Lago v1.12 Sovereign
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Billing Cycle Toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}
          data-testid="billing-cycle-toggle"
        >
          <span
            style={{
              fontSize: '0.8rem',
              color: billingCycle === 'monthly' ? '#f8fafc' : '#94a3b8',
              fontWeight: billingCycle === 'monthly' ? 600 : 400
            }}
          >
            Monthly Billing
          </span>

          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
            style={{
              width: '44px',
              height: '24px',
              borderRadius: '12px',
              background: billingCycle === 'annual' ? '#6366f1' : 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              padding: '2px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: billingCycle === 'annual' ? 'flex-end' : 'flex-start',
              transition: 'all 0.2s ease'
            }}
            data-testid="billing-cycle-switch"
          >
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: '#fff'
              }}
            />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                fontSize: '0.8rem',
                color: billingCycle === 'annual' ? '#f8fafc' : '#94a3b8',
                fontWeight: billingCycle === 'annual' ? 600 : 400
              }}
            >
              Annual Billing
            </span>
            <span
              style={{
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                borderRadius: '4px',
                padding: '1px 6px',
                fontSize: '0.68rem',
                fontWeight: 700
              }}
            >
              SAVE 20%
            </span>
          </div>
        </div>

        {/* 3-Tier Plan Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
            gap: '18px'
          }}
          data-testid="plan-cards-grid"
        >
          {Object.values(AUTHORITATIVE_PLANS).map((plan) => {
            const isCurrent = currentPlanCode === plan.code;
            const isSelected = selectedPlan === plan.code;
            const priceCents = billingCycle === 'annual' ? plan.amountCentsAnnual : plan.amountCentsMonthly;
            const priceDollars = (priceCents / 100).toFixed(2).replace(/\.00$/, '');

            return (
              <div
                key={plan.code}
                style={{
                  background: isCurrent
                    ? 'rgba(99, 102, 241, 0.08)'
                    : isSelected
                    ? 'rgba(56, 189, 248, 0.06)'
                    : 'rgba(18, 21, 36, 0.7)',
                  border: isCurrent
                    ? '2px solid #6366f1'
                    : isSelected
                    ? '2px solid #38bdf8'
                    : plan.isPopular
                    ? '1px solid rgba(129, 140, 248, 0.4)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '22px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  position: 'relative',
                  boxShadow: plan.isPopular
                    ? '0 10px 30px rgba(99, 102, 241, 0.15)'
                    : 'none'
                }}
                data-testid={`plan-card-${plan.code}`}
              >
                {/* Header Badge */}
                {plan.badge && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-10px',
                      right: '16px',
                      background: plan.isPopular ? '#6366f1' : '#f59e0b',
                      color: '#fff',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase'
                    }}
                  >
                    {plan.badge}
                  </div>
                )}

                {/* Plan Info */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {plan.code === 'plan_enterprise' ? (
                      <Crown size={18} color="#f59e0b" />
                    ) : plan.code === 'plan_pro' ? (
                      <Zap size={18} color="#818cf8" />
                    ) : (
                      <Shield size={18} color="#94a3b8" />
                    )}
                    <h3 style={{ fontSize: '1.1rem', margin: 0, color: '#f8fafc', fontWeight: 700 }}>
                      {plan.name}
                    </h3>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px', minHeight: '36px' }}>
                    {plan.description}
                  </p>
                </div>

                {/* Pricing Display */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc' }}>
                    ${priceDollars}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    / month {billingCycle === 'annual' && plan.amountCentsMonthly > 0 ? '(billed annually)' : ''}
                  </span>
                </div>

                {/* Free Trial Tag */}
                {plan.trialPeriodDays > 0 ? (
                  <div style={{ fontSize: '0.72rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Sparkles size={12} />
                    <span>Includes {plan.trialPeriodDays}-day free trial</span>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    Free forever for open-source
                  </div>
                )}

                {/* Quota Highlights */}
                <div
                  style={{
                    background: 'rgba(0, 0, 0, 0.25)',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    fontSize: '0.72rem',
                    color: '#cbd5e1'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Monthly Token Quota:</span>
                    <strong style={{ color: '#e2e8f0' }}>{plan.quotas.tokensPerMonth.toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#94a3b8' }}>Concurrent Sandboxes:</span>
                    <strong style={{ color: '#e2e8f0' }}>{plan.quotas.concurrentSandboxes} MicroVMs</strong>
                  </div>
                </div>

                {/* Features List */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#cbd5e1', textTransform: 'uppercase' }}>
                    Included Features:
                  </div>
                  {plan.features.map((feature, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        fontSize: '0.75rem',
                        color: '#cbd5e1'
                      }}
                    >
                      <Check size={14} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Action / Upgrade Button */}
                <button
                  onClick={() => handlePlanAction(plan.code)}
                  disabled={isCurrent}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    border: isCurrent ? '1px solid rgba(255, 255, 255, 0.15)' : 'none',
                    background: isCurrent
                      ? 'rgba(255, 255, 255, 0.05)'
                      : plan.isPopular
                      ? 'linear-gradient(90deg, #6366f1, #4f46e5)'
                      : 'rgba(255, 255, 255, 0.1)',
                    color: isCurrent ? '#94a3b8' : '#fff',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: isCurrent ? 'default' : 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                  data-testid={`plan-action-btn-${plan.code}`}
                >
                  {isCurrent ? (
                    'Current Plan'
                  ) : plan.code === 'plan_enterprise' ? (
                    'Upgrade to Enterprise'
                  ) : (
                    'Upgrade to Pro'
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footnote on Sovereign Infrastructure */}
        <div
          style={{
            padding: '12px 16px',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.72rem',
            color: '#94a3b8'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Database size={13} color="#38bdf8" />
            <span>
              Sovereign rating calculations powered by Lago API container on port 3001 with ClickHouse OpenMeter event sink.
            </span>
          </div>
          <span style={{ color: '#34d399', fontWeight: 600 }}>Option A Compliant</span>
        </div>
      </div>
    </div>
  );
};
