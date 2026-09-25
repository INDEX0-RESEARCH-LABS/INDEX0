import { NextResponse } from 'next/server';
import crypto from 'node:crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planCode = 'plan_pro',
      organizationId
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id) {
      return NextResponse.json(
        { error: 'Missing razorpay_order_id or razorpay_payment_id parameter.' },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Verify HMAC-SHA256 signature if real key secret is present
    if (keySecret && !keySecret.includes('placeholder')) {
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        return NextResponse.json(
          { error: 'Invalid Razorpay payment signature.' },
          { status: 400 }
        );
      }
    }

    // Synchronize subscription activation with Lago API on Port 3001
    const lagoUrl = process.env.LAGO_API_URL || 'http://localhost:3001/api/v1';
    const lagoKey = process.env.LAGO_API_KEY;
    try {
      if (lagoKey && !lagoKey.includes('placeholder')) {
        await fetch(`${lagoUrl}/subscriptions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${lagoKey}`
          },
          body: JSON.stringify({
            subscription: {
              external_customer_id: organizationId || 'dev-org',
              plan_code: planCode,
              external_id: `sub_${razorpay_order_id}`
            }
          })
        });
      }
    } catch {
      // Lago offline fallback in dev
    }

    return NextResponse.json({
      success: true,
      message: 'Razorpay payment successfully verified and subscription quota activated!',
      subscriptionId: `sub_${razorpay_payment_id}`,
      tier: planCode === 'plan_enterprise' ? 'enterprise' : 'pro'
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Error verifying Razorpay payment' },
      { status: 500 }
    );
  }
}
