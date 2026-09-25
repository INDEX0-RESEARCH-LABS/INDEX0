import { NextResponse } from 'next/server';

const PLAN_RATES: Record<string, { inrMonthly: number; inrAnnual: number; usdMonthly: number; usdAnnual: number; name: string }> = {
  plan_pro: {
    inrMonthly: 240000,
    inrAnnual: 192000,
    usdMonthly: 2900,
    usdAnnual: 2320,
    name: 'Professional Engineer'
  },
  plan_enterprise: {
    inrMonthly: 4000000,
    inrAnnual: 3200000,
    usdMonthly: 49900,
    usdAnnual: 39920,
    name: 'Sovereign Enterprise'
  }
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { planCode = 'plan_pro', currency = 'INR', billingCycle = 'monthly', customerId } = body;

    const plan = PLAN_RATES[planCode];
    if (!plan) {
      return NextResponse.json(
        { error: `Invalid planCode '${planCode}'. Must be 'plan_pro' or 'plan_enterprise'.` },
        { status: 400 }
      );
    }

    const isAnnual = billingCycle === 'annual';
    const amount = currency === 'INR'
      ? (isAnnual ? plan.inrAnnual : plan.inrMonthly)
      : (isAnnual ? plan.usdAnnual : plan.usdMonthly);

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder';
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // If live/test Razorpay keys are configured, create order via Razorpay API
    if (keySecret && !keySecret.includes('placeholder')) {
      const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${authHeader}`
        },
        body: JSON.stringify({
          amount,
          currency,
          receipt: `rcpt_${Date.now()}`,
          notes: {
            planCode,
            billingCycle,
            customerId: customerId || 'dev-customer'
          }
        })
      });

      if (rzpRes.ok) {
        const orderData = await rzpRes.json();
        return NextResponse.json({
          orderId: orderData.id,
          amount: orderData.amount,
          currency: orderData.currency,
          keyId,
          planCode,
          name: plan.name,
          description: `${plan.name} (${billingCycle})`
        });
      }
    }

    // Dev/Offline sovereign simulation fallback
    const simulatedOrderId = `order_sim_${Date.now().toString(36)}`;
    return NextResponse.json({
      orderId: simulatedOrderId,
      amount,
      currency,
      keyId,
      planCode,
      name: plan.name,
      description: `${plan.name} (${billingCycle}) - Sovereign Dev Mode`
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error creating Razorpay order' },
      { status: 500 }
    );
  }
}
