import { NextRequest, NextResponse } from 'next/server';
import { contact } from '@/lib/config';

// Simple in-memory rate limit. This resets whenever the serverless function
// cold-starts, which is fine as a first line of defence but is NOT durable
// across instances — for stricter protection, swap in Upstash Redis or a
// similar edge-compatible store. See docs/DEPLOYMENT.md.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const hits = new Map<string, number[]>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const timestamps = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  timestamps.push(now);
  hits.set(key, timestamps);
  return timestamps.length > MAX_REQUESTS;
}

type Body = {
  name?: string;
  email?: string;
  phone?: string;
  orderNumber?: string;
  enquiryType?: string;
  subject?: string;
  message?: string;
  company?: string; // honeypot
};

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

  // Honeypot tripped — pretend success, do nothing further.
  if (body.company) return NextResponse.json({ ok: true });

  const { name, email, enquiryType, subject, message } = body;
  if (!name || !email || !enquiryType || !subject || !message) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_FORM_TO_EMAIL || contact.email;

  if (!apiKey) {
    // Not configured yet — fail loudly in logs rather than pretending to send.
    console.error('[contact] RESEND_API_KEY is not set — message was NOT delivered.', {
      name,
      email,
      enquiryType,
      subject,
    });
    return NextResponse.json(
      { error: "We couldn't send that just now — please email us directly." },
      { status: 503 }
    );
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'LUNARO Transmissions <transmissions@lunaro.in>',
        to: [toEmail],
        reply_to: email,
        subject: `[${enquiryType}] ${subject}`,
        text: [
          `Name: ${name}`,
          `Email: ${email}`,
          body.phone ? `Phone: ${body.phone}` : null,
          body.orderNumber ? `Order Number: ${body.orderNumber}` : null,
          `Enquiry Type: ${enquiryType}`,
          '',
          message,
        ]
          .filter(Boolean)
          .join('\n'),
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error('[contact] Resend API error', res.status, text);
      return NextResponse.json({ error: 'Message could not be sent' }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[contact] Unexpected error sending message', err);
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
