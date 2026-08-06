import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const META_API_VERSION = 'v19.0';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || 'deepseek-landingpage-kpis.vercel.app';

function sha256Hex(input: string): string {
  return crypto.createHash('sha256').update(input, 'utf8').digest('hex');
}

function extractEmail(payload: unknown): string {
  const data = (payload as Record<string, unknown>)?.data as Record<string, unknown> | undefined;
  const candidates: unknown[] = [];

  if (typeof payload === 'object' && payload !== null) {
    candidates.push(
      (payload as Record<string, unknown>).customer_email,
      (payload as Record<string, unknown>).email,
      data?.customer_email,
      data?.email,
      (data?.customer as Record<string, unknown> | undefined)?.email,
      (data?.member as Record<string, unknown> | undefined)?.email,
      (data?.buyer as Record<string, unknown> | undefined)?.email,
      (data?.checkout as Record<string, unknown> | undefined)?.customer_email
    );
  }

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim().toLowerCase();
    }
  }
  return '';
}

function extractAmount(payload: unknown): { value: number; currency: string } {
  const data = (payload as Record<string, unknown>)?.data as Record<string, unknown> | undefined;
  let amount: unknown;
  let currency = 'USD';

  if (typeof payload === 'object' && payload !== null) {
    amount =
      data?.amount_cents ??
      data?.amount ??
      data?.total ??
      data?.price ??
      data?.subtotal ??
      (data?.checkout as Record<string, unknown> | undefined)?.amount_cents ??
      (data?.checkout as Record<string, unknown> | undefined)?.total;
  }

  if (typeof data === 'object' && data !== null && typeof data.currency === 'string') {
    currency = data.currency.toUpperCase();
  }

  let numeric = Number(amount);
  if (!Number.isFinite(numeric)) numeric = 0;

  if (String(amount).includes('cents') || Number(amount) > 1000) {
    numeric = numeric / 100;
  }

  return { value: numeric, currency };
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const action =
      String((payload as Record<string, unknown>).action ?? '') ||
      String((payload as Record<string, unknown>).type ?? '') ||
      String((payload as Record<string, unknown>).event ?? '');

    const purchaseEvents = new Set(['payment.completed', 'payment_succeeded', 'payment.succeeded', 'invoice.paid', 'checkout.session.completed']);
    if (!purchaseEvents.has(action)) {
      return NextResponse.json({ success: true, message: 'Event received but not processed' });
    }

    const pixelId = process.env.META_PIXEL_ID;
    const accessToken = process.env.META_ACCESS_TOKEN;

    if (!pixelId || !accessToken) {
      console.error('Whop webhook: META_PIXEL_ID or META_ACCESS_TOKEN is not configured');
      return NextResponse.json({ error: 'Meta CAPI not configured' }, { status: 500 });
    }

    const email = extractEmail(payload);
    if (!email) {
      console.error('Whop webhook: no customer email found in payload');
      return NextResponse.json({ success: true, message: 'No email in payload, skipped CAPI dispatch' });
    }

    const emailHash = sha256Hex(email);
    const { value, currency } = extractAmount(payload);

    const eventPayload = {
      data: [
        {
          event_name: 'Purchase',
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'website',
          event_source_url: `https://${SITE_URL}`,
          user_data: {
            em: [emailHash],
          },
          custom_data: {
            currency,
            value,
          },
        },
      ],
      access_token: accessToken,
    };

    const capiResponse = await fetch(`https://graph.facebook.com/${META_API_VERSION}/${pixelId}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventPayload),
    });

    let capiResult: Record<string, unknown> | null = null;
    try {
      capiResult = await capiResponse.json();
    } catch {
      const rawText = await capiResponse.text();
      console.error('Whop webhook: Meta CAPI returned non-JSON response', {
        status: capiResponse.status,
        body: rawText.slice(0, 500),
      });
    }

    if (!capiResponse.ok || capiResult?.error) {
      console.error('Whop webhook: Meta CAPI rejected event', capiResult || { status: capiResponse.status });
      return NextResponse.json({ error: 'Meta CAPI dispatch failed' }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Whop webhook error:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
