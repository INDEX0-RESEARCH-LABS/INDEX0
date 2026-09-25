import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name = 'Sovereign Developer' } = body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Valid email address is required.' },
        { status: 400 }
      );
    }

    const listmonkUrl = process.env.LISTMONK_API_URL || 'http://localhost:9001';
    const listmonkUser = process.env.LISTMONK_API_USER || 'listmonk_admin';
    const listmonkToken = process.env.LISTMONK_API_TOKEN;

    // If Listmonk API is active, forward subscriber
    if (listmonkToken && !listmonkToken.includes('placeholder')) {
      const authHeader = Buffer.from(`${listmonkUser}:${listmonkToken}`).toString('base64');
      await fetch(`${listmonkUrl}/api/subscribers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${authHeader}`
        },
        body: JSON.stringify({
          email,
          name,
          status: 'enabled',
          lists: [1] // Default general newsletter list
        })
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to the INDEX0 Sovereign Newsletter via Listmonk.'
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Newsletter subscription failed' },
      { status: 500 }
    );
  }
}
