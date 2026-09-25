import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phoneNumber } = body;

    if (!phoneNumber || typeof phoneNumber !== 'string') {
      return NextResponse.json(
        { error: 'Valid phoneNumber is required (e.g. +919876543210).' },
        { status: 400 }
      );
    }

    const cleanNumber = phoneNumber.replace(/[\s-]/g, '');
    if (!cleanNumber.startsWith('+') || cleanNumber.length < 8) {
      return NextResponse.json(
        { error: 'Phone number must include international country code (E.164 format, e.g. +919876543210).' },
        { status: 400 }
      );
    }

    const smsProvider = process.env.SMS_PROVIDER || 'mock';
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
    const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

    // If real Twilio credentials are provided, dispatch real SMS
    if (smsProvider === 'twilio' && twilioSid && !twilioSid.includes('placeholder')) {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const messageBody = `Your INDEX0 AI Sovereign verification code is: ${generatedOtp}. Do not share this code.`;

      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
      const authHeader = Buffer.from(`${twilioSid}:${twilioAuth}`).toString('base64');
      const params = new URLSearchParams({
        To: cleanNumber,
        From: twilioFrom || '',
        Body: messageBody
      });

      await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });
    }

    return NextResponse.json({
      success: true,
      message: `Verification code dispatched to ${cleanNumber}. (Demo OTP: 123456)`,
      expiresInSeconds: 300
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to dispatch phone verification OTP' },
      { status: 500 }
    );
  }
}
