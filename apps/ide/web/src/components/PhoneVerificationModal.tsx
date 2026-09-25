/**
 * Phone Verification Modal — @index0/ide-web
 * High-fidelity sovereign modal anchoring developer accounts to exactly ONE verified mobile phone number.
 * Enforces anti-Sybil protection, quota integrity, and cross-social account linking.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Smartphone,
  ShieldCheck,
  X,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Lock,
  ArrowRight
} from 'lucide-react';
import type { IPhoneOtpSendResponse, IPhoneOtpVerifyResponse } from '@index0/contracts';
import { ZitadelOidcClient } from '../auth/oidcClient.js';

export interface IPhoneVerificationModalProps {
  isOpen?: boolean;
  oidcClient?: ZitadelOidcClient;
  initialPhoneNumber?: string;
  onVerified?: (phoneNumber: string) => void;
  onClose?: () => void;
  className?: string;
}

export const COUNTRY_CODES = [
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+1', country: 'United States / Canada', flag: '🇺🇸' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' }
];

export const PhoneVerificationModal: React.FC<IPhoneVerificationModalProps> = ({
  isOpen = true,
  oidcClient,
  initialPhoneNumber = '',
  onVerified,
  onClose,
  className = ''
}) => {
  const [countryCode, setCountryCode] = useState<string>('+91');
  const [rawPhone, setRawPhone] = useState<string>(initialPhoneNumber.replace(/^\+\d+/, ''));
  const [step, setStep] = useState<'input' | 'otp' | 'verified'>('input');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState<number>(0);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Client instance fallback
  const client = useRef(oidcClient || new ZitadelOidcClient()).current;

  // Countdown timer effect
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  if (!isOpen) return null;

  const fullPhoneNumber = `${countryCode}${rawPhone.trim()}`;

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    const cleanNumber = rawPhone.replace(/\D/g, '');
    if (cleanNumber.length < 7 || cleanNumber.length > 15) {
      setErrorMessage('Please enter a valid mobile phone number.');
      return;
    }

    setIsSending(true);
    try {
      const res: IPhoneOtpSendResponse = await client.sendPhoneOtp(fullPhoneNumber);
      if (res.success) {
        setStep('otp');
        setCountdown(60);
        setInfoMessage(res.message || `Verification code dispatched to ${fullPhoneNumber}`);
        // Focus first OTP field
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      } else {
        setErrorMessage(res.message || 'Failed to send verification code. Try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error sending SMS. Please retry.');
    } finally {
      setIsSending(false);
    }
  };

  const handleOtpDigitChange = (index: number, val: string) => {
    const sanitized = val.replace(/\D/g, '').slice(-1);
    const updated = [...otpDigits];
    updated[index] = sanitized;
    setOtpDigits(updated);

    // Auto-advance focus
    if (sanitized && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all 6 digits entered
    if (sanitized && index === 5 && updated.every((d) => d.length === 1)) {
      submitOtp(updated.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const submitOtp = async (codeToSubmit?: string) => {
    const otp = codeToSubmit || otpDigits.join('');
    if (otp.length !== 6) {
      setErrorMessage('Please enter all 6 digits of the verification code.');
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);
    try {
      const res: IPhoneOtpVerifyResponse = await client.verifyPhoneOtp(fullPhoneNumber, otp);
      if (res.success && res.phoneVerified) {
        setStep('verified');
        setInfoMessage('Mobile identity verified and anchored to your account!');
        if (onVerified) {
          onVerified(fullPhoneNumber);
        }
      } else {
        setErrorMessage(res.message || 'Invalid or expired OTP code.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification error. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div
      className={`index0-phone-verification-backdrop ${className}`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(5, 7, 14, 0.85)',
        backdropFilter: 'blur(8px)',
        padding: '16px',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
      }}
      data-testid="phone-verification-modal"
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: '#0d111e',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 24px',
            background: '#13182b',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Smartphone size={18} color="#818cf8" />
            </div>
            <div>
              <strong style={{ fontSize: '0.95rem', color: '#f8fafc' }}>
                Anchor Sovereign Identity
              </strong>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                1 Verified Phone Number = 1 Human Developer
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
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              data-testid="phone-modal-close-btn"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Sybil Protection Notice */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '8px',
              background: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              fontSize: '0.74rem',
              color: '#c7d2fe',
              lineHeight: 1.45
            }}
          >
            <Lock size={15} color="#818cf8" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>
              To maintain fair token quota distribution and prevent Sybil bot farms, every developer
              account (GitHub or Google) must be anchored to <strong>one unique mobile number</strong>.
            </span>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.75rem',
                color: '#fca5a5'
              }}
              data-testid="phone-error-msg"
            >
              <AlertTriangle size={15} color="#ef4444" style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {infoMessage && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(52, 211, 153, 0.1)',
                border: '1px solid rgba(52, 211, 153, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.75rem',
                color: '#86efac'
              }}
              data-testid="phone-info-msg"
            >
              <CheckCircle2 size={15} color="#34d399" style={{ flexShrink: 0 }} />
              <span>{infoMessage}</span>
            </div>
          )}

          {/* STEP 1: Phone Number Input */}
          {step === 'input' && (
            <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#e2e8f0' }}>
                  Mobile Phone Number
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    style={{
                      background: '#1a2035',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      padding: '10px 8px',
                      fontSize: '0.82rem',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                    data-testid="phone-country-select"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code} ({c.country})
                      </option>
                    ))}
                  </select>

                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={rawPhone}
                    onChange={(e) => setRawPhone(e.target.value)}
                    autoFocus
                    style={{
                      flex: 1,
                      background: '#1a2035',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      padding: '10px 12px',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                    data-testid="phone-number-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSending || !rawPhone.trim()}
                style={{
                  padding: '11px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isSending
                    ? 'rgba(99, 102, 241, 0.5)'
                    : 'linear-gradient(90deg, #6366f1, #4f46e5)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: isSending ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'opacity 0.2s'
                }}
                data-testid="send-otp-btn"
              >
                {isSending ? (
                  'Dispatching SMS...'
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: 6-Digit OTP Verification */}
          {step === 'otp' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                  Sent to: <strong style={{ color: '#f8fafc' }}>{fullPhoneNumber}</strong>
                </span>
                <button
                  onClick={() => setStep('input')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#818cf8',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Change
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    style={{
                      width: '46px',
                      height: '52px',
                      background: '#1a2035',
                      border: digit
                        ? '1px solid #6366f1'
                        : '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      textAlign: 'center',
                      outline: 'none'
                    }}
                    data-testid={`otp-input-${idx}`}
                  />
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button
                  type="button"
                  disabled={countdown > 0 || isSending}
                  onClick={() => handleSendOtp()}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: countdown > 0 ? '#64748b' : '#818cf8',
                    fontSize: '0.74rem',
                    cursor: countdown > 0 ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  data-testid="resend-otp-btn"
                >
                  <RotateCcw size={12} />
                  <span>
                    {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend code'}
                  </span>
                </button>

                <button
                  type="button"
                  disabled={isVerifying || otpDigits.some((d) => !d)}
                  onClick={() => submitOtp()}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'linear-gradient(90deg, #6366f1, #4f46e5)',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '0.78rem',
                    cursor: isVerifying ? 'not-allowed' : 'pointer'
                  }}
                  data-testid="verify-otp-btn"
                >
                  {isVerifying ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Verification Success */}
          {step === 'verified' && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '14px',
                padding: '16px 0'
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(52, 211, 153, 0.15)',
                  border: '1px solid rgba(52, 211, 153, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ShieldCheck size={32} color="#34d399" />
              </div>
              <div style={{ textAlign: 'center' }}>
                <strong style={{ fontSize: '1rem', color: '#f8fafc', display: 'block' }}>
                  Identity Anchored &amp; Verified
                </strong>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                  Your mobile number {fullPhoneNumber} is securely linked.
                </span>
              </div>

              {onClose && (
                <button
                  onClick={onClose}
                  style={{
                    marginTop: '8px',
                    padding: '9px 24px',
                    borderRadius: '8px',
                    background: '#1a2035',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#f8fafc',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  data-testid="phone-verified-continue-btn"
                >
                  Continue to Sovereign IDE
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
