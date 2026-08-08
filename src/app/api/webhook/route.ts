import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'node:crypto';

const PAYMENT_SUCCEEDED_EVENTS = new Set([
  'payment.succeeded',
  'payment_succeeded',
  'payment.completed',
  'invoice.paid',
  'checkout.session.completed',
  'membership.activated',
]);

const ACCEPTED_PAYMENT_STATUSES = new Set(['succeeded', 'paid', 'completed']);

const SIGNATURE_TOLERANCE_SECONDS = 300;
const DEDUPE_WINDOW_SECONDS = 86400;
const WHOP_SECRET_PREFIX = 'whsec_';

const processedWebhookIds = new Map<string, number>();

function isDuplicate(webhookId: string): boolean {
  if (!webhookId) return false;
  const receivedAt = processedWebhookIds.get(webhookId);
  if (receivedAt === undefined) return false;
  if (Date.now() / 1000 - receivedAt > DEDUPE_WINDOW_SECONDS) {
    processedWebhookIds.delete(webhookId);
    return false;
  }
  return true;
}

function markProcessed(webhookId: string): void {
  if (webhookId) {
    processedWebhookIds.set(webhookId, Date.now() / 1000);
  }
}

function verifySignature(rawBody: string, headers: Headers): boolean {
  const secret = process.env.WHOP_WEBHOOK_SECRET;
  if (!secret) {
    console.warn('[whop-webhook] WHOP_WEBHOOK_SECRET is not set; skipping signature verification');
    return true;
  }

  const msgId = headers.get('webhook-id');
  const msgTimestamp = headers.get('webhook-timestamp');
  const msgSignature = headers.get('webhook-signature');
  if (!msgId || !msgTimestamp || !msgSignature) {
    console.warn('[whop-webhook] missing signature headers');
    return false;
  }

  const timestamp = Number(msgTimestamp);
  if (!Number.isFinite(timestamp)) return false;
  if (Math.abs(Date.now() / 1000 - timestamp) > SIGNATURE_TOLERANCE_SECONDS) {
    console.warn('[whop-webhook] webhook timestamp outside tolerance window');
    return false;
  }

  const rawSecret = secret.startsWith(WHOP_SECRET_PREFIX)
    ? secret.slice(WHOP_SECRET_PREFIX.length)
    : secret;
  const key = Buffer.from(`${rawSecret}==`, 'base64');
  const signedContent = `${msgId}.${Math.floor(timestamp)}.${rawBody}`;
  const expected = createHmac('sha256', key).update(signedContent, 'utf8').digest('base64');

  const expectedBuffer = Buffer.from(expected);
  for (const versionedSignature of msgSignature.split(' ')) {
    const [version, signature] = versionedSignature.split(',');
    if (version !== 'v1' || !signature) continue;
    const receivedBuffer = Buffer.from(signature);
    if (
      expectedBuffer.length === receivedBuffer.length &&
      timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      return true;
    }
  }
  return false;
}

function deepFind(value: unknown, keys: string[], maxDepth = 6): string {
  let found = '';
  const walk = (node: unknown, depth: number): void => {
    if (found || depth > maxDepth || typeof node !== 'object' || node === null) return;
    if (Array.isArray(node)) {
      for (const item of node) walk(item, depth + 1);
      return;
    }
    const record = node as Record<string, unknown>;
    for (const key of Object.keys(record)) {
      if (keys.includes(key)) {
        const candidate = record[key];
        if (typeof candidate === 'string' && candidate.trim()) {
          found = candidate.trim();
          return;
        }
      }
    }
    for (const value of Object.values(record)) {
      if (typeof value === 'object') walk(value, depth + 1);
    }
  };
  walk(value, 0);
  return found;
}

function extractEmail(payload: unknown): string {
  const email = deepFind(payload, ['email', 'customer_email']);
  return email && email.includes('@') ? email.toLowerCase() : '';
}

function extractName(payload: unknown): string {
  return deepFind(payload, ['name', 'customer_name', 'first_name', 'buyer_name']);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildEmail(params: {
  name: string;
  product: string;
  bookUrl: string;
  excelUrl: string;
}): { subject: string; html: string; text: string } {
  const { name, product, bookUrl, excelUrl } = params;
  const greeting = name ? `أهلاً ${name}،` : 'أهلاً بك،';
  const subject = `ملفاتك جاهزة — ${product}`;

  const text = `مرحباً،\n\nشكراً لشرائك ${product}. تم تأكيد عملية الدفع بنجاح وملفاتك جاهزة للتحميل الآن.\n\nروابط التحميل:\n- الكتاب الرقمي (PDF): ${bookUrl}\n- حزمة ملفات الإكسل: ${excelUrl}\n\nكل ما اشتريته ملكك بشكل دائم. إذا توقف أي رابط عن العمل، ردّ على هذا البريد وسنرسل لك رابطاً جديداً فوراً.\n\nمع تحيات،\nفريق ${product}`;

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
  <body style="margin:0;padding:0;background-color:#f4f4f4;font-family:'Segoe UI',Tahoma,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border:1px solid #e6e6e6;border-radius:8px;overflow:hidden;">
            <tr>
              <td style="background-color:#1B365D;padding:28px 32px;text-align:center;">
                <h1 style="margin:0;color:#ffffff;font-size:22px;line-height:1.4;">تم تأكيد طلبك بنجاح</h1>
                <p style="margin:8px 0 0;color:#D4AF37;font-size:14px;">Your order is complete</p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <p style="margin:0 0 16px;font-size:16px;color:#333333;">${greeting}</p>
                <p style="margin:0 0 16px;font-size:15px;color:#444444;line-height:1.9;">
                  شكراً لشرائك <strong>${escapeHtml(product)}</strong>. تم تأكيد عملية الدفع بنجاح
                  وملفاتك جاهزة للتحميل الآن.
                </p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
                  <tr>
                    <td style="padding:8px 0;">
                      <a href="${escapeHtml(bookUrl)}" style="display:block;text-align:center;background-color:#1B365D;color:#ffffff;text-decoration:none;font-size:15px;font-weight:bold;padding:16px 24px;border-radius:6px;">تحميل الكتاب الرقمي (PDF)</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;">
                      <a href="${escapeHtml(excelUrl)}" style="display:block;text-align:center;background-color:#996515;color:#ffffff;text-decoration:none;font-size:15px;font-weight:bold;padding:16px 24px;border-radius:6px;">تحميل حزمة ملفات الإكسل</a>
                    </td>
                  </tr>
                </table>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FFF8E7;border-right:4px solid #D4AF37;">
                  <tr>
                    <td style="padding:16px 20px;">
                      <p style="margin:0;font-size:13px;color:#6b5b2e;line-height:1.9;">
                        كل ما اشتريته ملكك بشكل دائم. إذا توقف أي رابط عن العمل، ردّ على هذا البريد
                        وسنرسل لك رابطاً جديداً فوراً.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="background-color:#1B365D;padding:16px 32px;text-align:center;">
                <p style="margin:0;color:#ffffff;font-size:12px;">${escapeHtml(product)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, html, text };
}

async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ id: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not set');
  }

  const from = process.env.EMAIL_FROM || 'Restaurant Survival Toolkit <onboarding@resend.dev>';
  const body: Record<string, unknown> = {
    from,
    to: [params.to],
    subject: params.subject,
    html: params.html,
    text: params.text,
  };
  if (process.env.SUPPORT_EMAIL) {
    body.reply_to = process.env.SUPPORT_EMAIL;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const result = (await response.json().catch(() => ({}))) as {
    id?: string;
    message?: string;
  };

  if (!response.ok) {
    throw new Error(`Resend API error ${response.status}: ${JSON.stringify(result)}`);
  }

  return { id: result.id ?? '' };
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    if (!rawBody.trim()) {
      return NextResponse.json({ error: 'request body is empty' }, { status: 400 });
    }

    if (!verifySignature(rawBody, request.headers)) {
      return NextResponse.json({ error: 'invalid webhook signature' }, { status: 401 });
    }

    const webhookId = request.headers.get('webhook-id') ?? '';
    if (isDuplicate(webhookId)) {
      return NextResponse.json({ success: true, duplicate: true });
    }

    let payload: unknown;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'invalid JSON payload' }, { status: 400 });
    }

    const record = (payload ?? {}) as Record<string, unknown>;
    const eventType = String(record.type ?? record.event ?? record.action ?? '');

    if (!PAYMENT_SUCCEEDED_EVENTS.has(eventType)) {
      console.log(`[whop-webhook] ignoring unhandled event: "${eventType}"`);
      return NextResponse.json({ success: true, ignored: true, event: eventType });
    }

    const data = record.data as Record<string, unknown> | undefined;
    const status = typeof data?.status === 'string' ? data.status.toLowerCase() : '';
    if (status && !ACCEPTED_PAYMENT_STATUSES.has(status)) {
      console.warn(`[whop-webhook] ignoring payment with status "${status}"`);
      return NextResponse.json({
        success: true,
        ignored: true,
        reason: 'payment not succeeded',
      });
    }

    const customerEmail = extractEmail(payload);
    if (!customerEmail) {
      console.error('[whop-webhook] no customer email found in payload', JSON.stringify(payload));
      return NextResponse.json({ error: 'customer email not found' }, { status: 400 });
    }

    const bookUrl = process.env.BOOK_DOWNLOAD_URL;
    const excelUrl = process.env.EXCEL_BUNDLE_DOWNLOAD_URL;
    if (!bookUrl || !excelUrl) {
      console.error('[whop-webhook] BOOK_DOWNLOAD_URL or EXCEL_BUNDLE_DOWNLOAD_URL is not configured');
      return NextResponse.json({ error: 'download URLs not configured' }, { status: 500 });
    }

    const product = process.env.PRODUCT_TITLE || 'حقيبة بقاء المطاعم 2026';
    const { subject, html, text } = buildEmail({
      name: extractName(payload),
      product,
      bookUrl,
      excelUrl,
    });

    try {
      const result = await sendEmail({ to: customerEmail, subject, html, text });
      markProcessed(webhookId);
      console.log(`[whop-webhook] delivery email sent to ${customerEmail} (${result.id})`);
      return NextResponse.json({ success: true, email_id: result.id });
    } catch (error) {
      console.error('[whop-webhook] email delivery failed', error);
      return NextResponse.json({ error: 'email delivery failed' }, { status: 500 });
    }
  } catch (error) {
    console.error('[whop-webhook] unexpected error', error);
    return NextResponse.json({ error: 'webhook processing failed' }, { status: 500 });
  }
}
