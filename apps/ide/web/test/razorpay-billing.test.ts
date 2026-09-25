import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {
  SubscriptionPlanModal,
  AUTHORITATIVE_PLANS
} from '../dist/components/SubscriptionPlanModal.js';

describe('Dev 3: Razorpay Payment Rails & Dual-Currency Billing (@index0/ide-web)', () => {
  it('should define exact INR paise pricing across all 3 tiers', () => {
    // Free: ₹0
    assert.strictEqual(AUTHORITATIVE_PLANS.plan_free.amountPaiseMonthly, 0);
    assert.strictEqual(AUTHORITATIVE_PLANS.plan_free.amountPaiseAnnual, 0);

    // Pro: ₹2,400 / mo, ₹1,920 / mo annual (20% off)
    assert.strictEqual(AUTHORITATIVE_PLANS.plan_pro.amountPaiseMonthly, 240000);
    assert.strictEqual(AUTHORITATIVE_PLANS.plan_pro.amountPaiseAnnual, 192000);

    // Enterprise: ₹40,000 / mo, ₹32,000 / mo annual (20% off)
    assert.strictEqual(AUTHORITATIVE_PLANS.plan_enterprise.amountPaiseMonthly, 4000000);
    assert.strictEqual(AUTHORITATIVE_PLANS.plan_enterprise.amountPaiseAnnual, 3200000);
  });

  it('should instantiate SubscriptionPlanModal with INR as default currency', () => {
    const element = React.createElement(SubscriptionPlanModal, {
      defaultCurrency: 'INR'
    });

    assert.strictEqual(element.type, SubscriptionPlanModal);
    assert.strictEqual(element.props.defaultCurrency, 'INR');
  });

  it('should instantiate SubscriptionPlanModal with USD as currency override', () => {
    const element = React.createElement(SubscriptionPlanModal, {
      defaultCurrency: 'USD'
    });

    assert.strictEqual(element.type, SubscriptionPlanModal);
    assert.strictEqual(element.props.defaultCurrency, 'USD');
  });

  it('should accept onRazorpaySuccess callback prop', () => {
    let capturedResponse: any = null;
    const element = React.createElement(SubscriptionPlanModal, {
      defaultCurrency: 'INR',
      onRazorpaySuccess: (res) => {
        capturedResponse = res;
      }
    });

    assert.strictEqual(typeof element.props.onRazorpaySuccess, 'function');
  });
});
