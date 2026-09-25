import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {
  PhoneVerificationModal,
  COUNTRY_CODES
} from '../dist/components/PhoneVerificationModal.js';
import {
  PhoneVerificationModal as IndexPhoneVerificationModal
} from '../dist/index.js';
import { ZitadelOidcClient } from '../dist/auth/oidcClient.js';

describe('Dev 3: Sovereign Phone Verification & Anti-Sybil Modal (@index0/ide-web)', () => {
  it('should export PhoneVerificationModal from barrel export', () => {
    assert.strictEqual(typeof IndexPhoneVerificationModal, 'function');
    assert.strictEqual(IndexPhoneVerificationModal, PhoneVerificationModal);
  });

  it('should define standard country codes with India (+91) as primary option', () => {
    assert.ok(Array.isArray(COUNTRY_CODES));
    assert.ok(COUNTRY_CODES.length >= 5);
    const india = COUNTRY_CODES.find((c) => c.code === '+91');
    assert.ok(india, 'Must include +91 for India');
    assert.strictEqual(india?.flag, '🇮🇳');
  });

  it('should instantiate PhoneVerificationModal React element with default properties', () => {
    const element = React.createElement(PhoneVerificationModal, {
      isOpen: true
    });

    assert.strictEqual(element.type, PhoneVerificationModal);
    assert.strictEqual(element.props.isOpen, true);
  });

  it('should instantiate PhoneVerificationModal with custom callbacks', () => {
    let verifiedNumber = '';
    let closed = false;

    const element = React.createElement(PhoneVerificationModal, {
      isOpen: true,
      initialPhoneNumber: '+919876543210',
      onVerified: (num: string) => {
        verifiedNumber = num;
      },
      onClose: () => {
        closed = true;
      }
    });

    assert.strictEqual(element.props.initialPhoneNumber, '+919876543210');
    assert.strictEqual(typeof element.props.onVerified, 'function');
    assert.strictEqual(typeof element.props.onClose, 'function');
  });

  it('should support sending and verifying OTP in ZitadelOidcClient', async () => {
    const client = new ZitadelOidcClient();

    const sendRes = await client.sendPhoneOtp('+919876543210');
    assert.strictEqual(sendRes.success, true);
    assert.ok(sendRes.message.includes('+919876543210'));

    const verifyRes = await client.verifyPhoneOtp('+919876543210', '123456');
    assert.strictEqual(verifyRes.success, true);
    assert.strictEqual(verifyRes.phoneVerified, true);
    assert.strictEqual(verifyRes.user?.phoneNumber, '+919876543210');
  });

  it('should support social authorization request generation for github and google', async () => {
    const client = new ZitadelOidcClient();

    const githubReq = await client.createSocialAuthorizationRequest('github', 'state_gh_123');
    assert.strictEqual(githubReq.provider, 'github');
    assert.ok(githubReq.authorizationUrl.includes('idp_hint=github'));

    const googleReq = await client.createSocialAuthorizationRequest('google', 'state_goog_123');
    assert.strictEqual(googleReq.provider, 'google');
    assert.ok(googleReq.authorizationUrl.includes('idp_hint=google'));
  });
});
