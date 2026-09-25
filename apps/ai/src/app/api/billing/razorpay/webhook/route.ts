import { NextResponse } from 'next/server';
import crypto from 'node:crypto';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify webhook signature if secret is configured
    if (webhookSecret && !webhookSecret.includes('placeholder')) {
      if (!signature) {
        return NextResponse.json(
          { error: 'Missing x-razorpay-signature header' },
          { status: 400 }
        );
      }

      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');

      if (expectedSignature !== signature) {
        return NextResponse.json(
          { error: 'Invalid webhook signature' },
          { status: 401 }
        );
      }
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;

    switch (eventType) {
      case 'payment.captured':
      case 'order.paid': {
        const payment = event.payload?.payment?.entity;
        // Payment settled successfully
        console.log(`[Razorpay Webhook] Payment captured: ${payment?.id} for amount: ${payment?.amount}`);
        break;
      }
      case 'subscription.charged': {
        const subscription = event.payload?.subscription?.entity;
        console.log(`[Razorpay Webhook] Subscription charged: ${subscription?.id}`);
        break;
      }
      case 'subscription.cancelled':
      case 'subscription.halted': {
        const subscription = event.payload?.subscription?.entity;
        console.log(`[Razorpay Webhook] Subscription cancelled/halted: ${subscription?.id}`);
        break;
      }
      default: {
        console.log(`[Razorpay Webhook] Received unhandled event: ${eventType}`);
        break;
      }
    }

    return NextResponse.json({ status: 'ok', received: true, event: eventType });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
