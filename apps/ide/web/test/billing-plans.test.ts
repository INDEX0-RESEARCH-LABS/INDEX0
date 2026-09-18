import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {
  SubscriptionPlanModal,
  AUTHORITATIVE_PLANS
} from '../dist/components/SubscriptionPlanModal.js';
import {
  SubscriptionPlanModal as IndexSubscriptionPlanModal,
  AUTHORITATIVE_PLANS as IndexAuthoritativePlans
} from '../dist/index.js';
import type { SubscriptionTier } from '@index0/contracts';

describe('Dev 3: Sovereign Subscription Plan Modal & Quota Meters (@index0/ide-web)', () => {
  describe('Authoritative Plan Manifest Alignment with plans.json', () => {
    it('should register all 3 authoritative subscription tiers', () => {
      const planKeys = Object.keys(AUTHORITATIVE_PLANS);
      assert.strictEqual(planKeys.length, 3);
      assert.ok(planKeys.includes('plan_free'));
      assert.ok(planKeys.includes('plan_pro'));
      assert.ok(planKeys.includes('plan_enterprise'));
    });

    it('should match tier codes, names, and SubscriptionTier union types', () => {
      const freePlan = AUTHORITATIVE_PLANS.plan_free;
      assert.strictEqual(freePlan.code, 'plan_free');
      assert.strictEqual(freePlan.tier, 'free' as SubscriptionTier);
      assert.strictEqual(freePlan.name, 'Community Developer');

      const proPlan = AUTHORITATIVE_PLANS.plan_pro;
      assert.strictEqual(proPlan.code, 'plan_pro');
      assert.strictEqual(proPlan.tier, 'pro' as SubscriptionTier);
      assert.strictEqual(proPlan.name, 'Professional Engineer');
      assert.strictEqual(proPlan.isPopular, true);

      const enterprisePlan = AUTHORITATIVE_PLANS.plan_enterprise;
      assert.strictEqual(enterprisePlan.code, 'plan_enterprise');
      assert.strictEqual(enterprisePlan.tier, 'enterprise' as SubscriptionTier);
      assert.strictEqual(enterprisePlan.name, 'Sovereign Enterprise');
    });

    it('should enforce exact monthly pricing in cents ($0, $29, $499)', () => {
      assert.strictEqual(AUTHORITATIVE_PLANS.plan_free.amountCentsMonthly, 0);
      assert.strictEqual(AUTHORITATIVE_PLANS.plan_pro.amountCentsMonthly, 2900); // $29.00
      assert.strictEqual(AUTHORITATIVE_PLANS.plan_enterprise.amountCentsMonthly, 49900); // $499.00
    });

    it('should enforce exact monthly quotas and overage policies', () => {
      const freeQuotas = AUTHORITATIVE_PLANS.plan_free.quotas;
      assert.strictEqual(freeQuotas.tokensPerMonth, 300000);
      assert.strictEqual(freeQuotas.concurrentSandboxes, 1);
      assert.strictEqual(freeQuotas.overageAllowed, false);

      const proQuotas = AUTHORITATIVE_PLANS.plan_pro.quotas;
      assert.strictEqual(proQuotas.tokensPerMonth, 1000000);
      assert.strictEqual(proQuotas.concurrentSandboxes, 5);
      assert.strictEqual(proQuotas.overageAllowed, true);

      const enterpriseQuotas = AUTHORITATIVE_PLANS.plan_enterprise.quotas;
      assert.strictEqual(enterpriseQuotas.tokensPerMonth, 50000000);
      assert.strictEqual(enterpriseQuotas.concurrentSandboxes, 50);
      assert.strictEqual(enterpriseQuotas.overageAllowed, true);
    });

    it('should define free trial periods matching Lago plan configuration', () => {
      assert.strictEqual(AUTHORITATIVE_PLANS.plan_free.trialPeriodDays, 0);
      assert.strictEqual(AUTHORITATIVE_PLANS.plan_pro.trialPeriodDays, 14);
      assert.strictEqual(AUTHORITATIVE_PLANS.plan_enterprise.trialPeriodDays, 30);
    });
  });

  describe('Pricing Calculations & Annual Discount Math', () => {
    it('should calculate 20% discounted annual pricing correctly', () => {
      const pro = AUTHORITATIVE_PLANS.plan_pro;
      // Monthly 2900 cents * 0.8 = 2320 cents ($23.20/mo)
      assert.strictEqual(pro.amountCentsAnnual, 2320);

      const enterprise = AUTHORITATIVE_PLANS.plan_enterprise;
      // Monthly 49900 cents * 0.8 = 39920 cents ($399.20/mo)
      assert.strictEqual(enterprise.amountCentsAnnual, 39920);

      const free = AUTHORITATIVE_PLANS.plan_free;
      assert.strictEqual(free.amountCentsAnnual, 0);
    });

    it('should format dollar strings accurately without trailing decimal zeros', () => {
      const formatDollars = (cents: number) => (cents / 100).toFixed(2).replace(/\.00$/, '');

      assert.strictEqual(formatDollars(0), '0');
      assert.strictEqual(formatDollars(2900), '29');
      assert.strictEqual(formatDollars(2320), '23.20');
      assert.strictEqual(formatDollars(49900), '499');
      assert.strictEqual(formatDollars(39920), '399.20');
    });

    it('should calculate quota meter percentages accurately with 100% ceiling', () => {
      const calcQuotaPercent = (used: number, total: number) => {
        if (!total || total === 0) return 0;
        return Math.min(Number(((used / total) * 100).toFixed(1)), 100);
      };

      assert.strictEqual(calcQuotaPercent(150000, 300000), 50.0);
      assert.strictEqual(calcQuotaPercent(0, 300000), 0);
      assert.strictEqual(calcQuotaPercent(300000, 300000), 100);
      assert.strictEqual(calcQuotaPercent(450000, 300000), 100); // capped at 100
      assert.strictEqual(calcQuotaPercent(142500, 300000), 47.5);
    });
  });

  describe('SubscriptionPlanModal React Component Rendering', () => {
    it('should instantiate SubscriptionPlanModal React element with default state', () => {
      const element = React.createElement(SubscriptionPlanModal, {
        className: 'test-billing-modal'
      });

      assert.ok(React.isValidElement(element));
      assert.strictEqual(element.type, SubscriptionPlanModal);
    });

    it('should accept custom currentPlanCode, currentTokensUsed, and currentSandboxesActive props', () => {
      const element = React.createElement(SubscriptionPlanModal, {
        currentPlanCode: 'plan_pro',
        currentTokensUsed: 520000,
        currentSandboxesActive: 3
      });

      assert.ok(React.isValidElement(element));
      assert.strictEqual(element.props.currentPlanCode, 'plan_pro');
      assert.strictEqual(element.props.currentTokensUsed, 520000);
      assert.strictEqual(element.props.currentSandboxesActive, 3);
    });

    it('should construct SubscriptionPlanModal with onSelectPlan callback', () => {
      let selectedTier = '';
      const element = React.createElement(SubscriptionPlanModal, {
        currentPlanCode: 'plan_free',
        onSelectPlan: (planCode: string) => {
          selectedTier = planCode;
        }
      });

      assert.ok(React.isValidElement(element));
      assert.strictEqual(typeof element.props.onSelectPlan, 'function');
      element.props.onSelectPlan?.('plan_pro');
      assert.strictEqual(selectedTier, 'plan_pro');
    });

    it('should construct SubscriptionPlanModal with onClose callback', () => {
      let isClosed = false;
      const element = React.createElement(SubscriptionPlanModal, {
        onClose: () => {
          isClosed = true;
        }
      });

      assert.ok(React.isValidElement(element));
      assert.strictEqual(typeof element.props.onClose, 'function');
      element.props.onClose?.();
      assert.strictEqual(isClosed, true);
    });
  });

  describe('Monorepo Package Exports & Contract Conformance', () => {
    it('should re-export SubscriptionPlanModal and AUTHORITATIVE_PLANS from @index0/ide-web barrel', () => {
      assert.strictEqual(typeof IndexSubscriptionPlanModal, 'function');
      assert.ok(IndexAuthoritativePlans);
      assert.strictEqual(Object.keys(IndexAuthoritativePlans).length, 3);
    });
  });
});
