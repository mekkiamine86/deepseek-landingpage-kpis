# Whop → Email Delivery Webhook (Flask on Vercel)

A micro Python webhook that listens for successful payments from [Whop](https://whop.com),
then emails the customer a thank-you message with direct download links for the digital
book and the Excel files bundle.

Built with Flask, deployed as a Vercel Serverless Function (Python runtime), and sends
email through [Resend](https://resend.com).

```
Customer buys on Whop
        │
        ▼
Whop sends POST /whop-webhook   (event = payment.succeeded)
        │
        ▼
Vercel Serverless Function (Flask, api/index.py)
        │  1. verifies the HMAC signature (Standard Webhooks spec)
        │  2. checks the event type + payment status
        │  3. extracts the customer email (data.user.email)
        ▼
Resend API ──► Thank-you email with download links
```

## Project layout

```
whop-webhook/
├── api/
│   └── index.py                 # Flask app — the Vercel Serverless Function
├── scripts/
│   └── send_test_event.py       # Signs + sends a fake payment.succeeded locally
├── requirements.txt             # flask, resend
├── vercel.json                  # Maps /whop-webhook to the function
├── .python-version              # Python 3.12 for the Vercel runtime
├── .env.example                 # Copy to .env for local development
└── README.md
```

## How the webhook behaves

- **POST only.** `GET /` is a health check; anything else returns `405`.
- **Signature verification.** Whop signs every request per the [Standard Webhooks spec](https://github.com/standard-webhooks/standard-webhooks):
  headers `webhook-id`, `webhook-timestamp`, `webhook-signature` (`v1,<base64-hmac-sha256>`),
  with the signed content `{id}.{timestamp}.{body}` and your `whsec_…` secret.
  Requests that fail verification return `401`.
- **Event validation.** Only `type == "payment.succeeded"` (the `event` field is accepted
  as a fallback) is processed; other events return `200 {"ignored": true}`. If a
  `data.status` field is present it must be `"succeeded"`.
- **Email extraction.** Tries `data.user.email`, then `data.member.email`,
  `data.membership.email`, `data.customer.email`, and finally a top-level `data.email`.
- **Email delivery.** Uses the Resend Python SDK to send an immediate HTML + text email
  with a thank-you message, reassurance copy, and two download buttons.
- **Idempotency.** Duplicate deliveries (Whop sends at-least-once) are deduped in-memory
  using `webhook-id` for 24 hours. If email delivery fails, the handler returns `500` so
  Whop retries; the dedupe only records a successful send.
- **Fast acknowledgement.** All success/ignored paths return `2xx` immediately; Whop
  retries non-`2xx` responses.

> Note: the in-memory dedupe is per warm instance. For very high volumes, swap it for
> Vercel KV or Redis keyed by `webhook-id`.

## Environment variables

| Variable                  | Required | Purpose                                                        |
| ------------------------- | -------- | -------------------------------------------------------------- |
| `RESEND_API_KEY`          | Yes      | Resend API key (`re_…`). https://resend.com/api-keys            |
| `WHOP_WEBHOOK_SECRET`     | Yes*     | `whsec_…` secret from the Whop webhook you create. See below.   |
| `EMAIL_FROM`              | No       | Sender, e.g. `Restaurant Survival Toolkit <deliveries@yourdomain.com>`. Must use a domain verified in Resend. |
| `SUPPORT_EMAIL`           | No       | Reply-to address.                                               |
| `BOOK_DOWNLOAD_URL`       | No       | Public URL of the digital book (PDF). Defaults to a Supabase Storage placeholder. |
| `EXCEL_BUNDLE_DOWNLOAD_URL` | No     | Public URL of the Excel bundle. Defaults to a Supabase Storage placeholder. |

*Signature verification is skipped locally if `WHOP_WEBHOOK_SECRET` is unset (handy for
quick tests), but you should set it before deploying.

## Local development

This project targets the Vercel Python runtime. Python 3.9+ works locally.

```powershell
# PowerShell (Windows)
cd whop-webhook
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

```bash
# bash / macOS / Linux
cd whop-webhook
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Fill in the real values in `.env`, then start the server:

```powershell
$env:RESEND_API_KEY="re_xxx"
$env:WHOP_WEBHOOK_SECRET="whsec_testsecret"
$env:EMAIL_FROM="Restaurant Survival Toolkit <deliveries@yourdomain.com>"
$env:BOOK_DOWNLOAD_URL="https://<project-ref>.supabase.co/storage/v1/object/public/freebies/restaurant-survival-toolkit-2026.pdf"
$env:EXCEL_BUNDLE_DOWNLOAD_URL="https://<project-ref>.supabase.co/storage/v1/object/public/freebies/restaurant-survival-toolkit-2026.xlsx"
python api\index.py
```

> Note: Flask does not read `.env` automatically — either export the variables as above,
> or run with `python-dotenv`. Keep it simple: set them in your terminal / your Vercel
> project dashboard.

The server listens on http://localhost:8000.

### Send a test payment event

From a second terminal, run the included script (it signs the request exactly like Whop):

```powershell
$env:WHOP_WEBHOOK_SECRET="whsec_testsecret"
python scripts\send_test_event.py --email you@example.com
```

Expected output:

```
STATUS: 200
BODY: {"ok": true, "email_id": "..."}
```

If you leave `WHOP_WEBHOOK_SECRET` unset on the server, verification is skipped, so any
secret value (or none) still passes.

## Deploy to Vercel

Deploy the `whop-webhook` folder as its own Vercel project (it is independent of the
Next.js app in the repo root).

### Option A — Vercel CLI

```powershell
npm i -g vercel
cd whop-webhook
vercel login
vercel deploy
```

Follow the prompts (or `vercel --yes`). The first deploy creates the project and returns
a URL like `https://whop-webhook-xxxx.vercel.app`.

### Option B — Git / Dashboard

1. Push the `whop-webhook` folder to its own GitHub repository (or import this repo and
   set **Root Directory** to `whop-webhook`).
2. In Vercel, **Add New → Project** → import the repo.
3. Framework Preset auto-detects **Flask** (it sees `requirements.txt` + `api/index.py`).
   Python version is pinned to 3.12 via `.python-version`.
4. Deploy.

### Set the environment variables on Vercel

Either with the CLI:

```powershell
vercel env add RESEND_API_KEY
vercel env add WHOP_WEBHOOK_SECRET
vercel env add EMAIL_FROM
vercel env add BOOK_DOWNLOAD_URL
vercel env add EXCEL_BUNDLE_DOWNLOAD_URL
vercel redeploy
```

…or in the dashboard: **Project → Settings → Environment Variables**, add each value for
the relevant environments, then redeploy.

Verify the deployment is live:

```
https://<your-project>.vercel.app/
# {"service": "whop-webhook", "status": "ok"}
```

## Link the webhook with Whop

1. Go to the [Whop developer dashboard](https://whop.com/dashboard/developer) (the
   **Developer** tab).
2. Click **Create Webhook**.
3. Set the URL to your deployed endpoint:
   ```
   https://<your-project>.vercel.app/whop-webhook
   ```
4. Select the events. Subscribe to at least **`payment.succeeded`**.
5. Make sure the webhook is on **API version `v1`**.
6. Copy the webhook secret (starts with `whsec_`) and save it as `WHOP_WEBHOOK_SECRET`
   in the Vercel project environment variables, then redeploy.

### Test it

- Use the **Send test payload** button in the webhook settings in Whop (the event
  `payment.succeeded` supports test payloads). The event reaches your endpoint signed
  with the real secret — check Vercel function logs for
  `delivery email sent for payment …` and your inbox for the email.
- Whop delivers **at least once**; the webhook is designed to be idempotent, so retries
  won't double-send. Always answer with `2xx` as fast as possible — any non-`2xx` is
  retried by Whop.

## Hosting the downloadable files (Supabase Storage)

The email links point to public Supabase Storage URLs (defaults are placeholders):

1. Create a bucket (e.g. `freebies`) in your Supabase project → **Storage**.
2. Upload the digital book and the Excel bundle.
3. Make the files public (bucket-level public, or create a public policy) so the links
   work without auth.
4. Copy the **public URLs**:
   ```
   https://<project-ref>.supabase.co/storage/v1/object/public/freebies/restaurant-survival-toolkit-2026.pdf
   https://<project-ref>.supabase.co/storage/v1/object/public/freebies/restaurant-survival-toolkit-2026.xlsx
   ```
5. Set them as `BOOK_DOWNLOAD_URL` and `EXCEL_BUNDLE_DOWNLOAD_URL` on Vercel and redeploy.

> Tip: keep files behind a signed URL if you want the links to expire. The email template
> already reassures customers you will resend a fresh link if one stops working.

## Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| `401 invalid signature` | `WHOP_WEBHOOK_SECRET` doesn't match the webhook's secret, or the clock on your local machine is skewed by more than 5 minutes. |
| `400 customer email not found` | The webhook lacks the `member:email:read` permission, or the payload used a different shape — check Vercel logs for the full payload dump. |
| `500 email delivery failed` | `RESEND_API_KEY` missing/invalid, or `EMAIL_FROM` uses a domain not verified in Resend. Resend only delivers `onboarding@resend.dev` to your own account email. |
| No webhook received | The webhook is disabled in Whop, the URL is wrong, or it isn't subscribed to `payment.succeeded`. Use Whop's test-payload button to confirm. |
| Local tests pass but production fails | Confirm the env vars exist in the Vercel project (not just `.env`) and redeploy after changing them. |

## Production hardening

- Move the in-memory dedupe to Vercel KV / Redis when volume grows.
- Consider checking `payload["data"]["id"]` (payment id) as an extra dedupe key.
- Rotate `WHOP_WEBHOOK_SECRET` and `RESEND_API_KEY` if ever exposed.
- Point `EMAIL_FROM` at a verified domain to guarantee delivery (SPF/DKIM).
