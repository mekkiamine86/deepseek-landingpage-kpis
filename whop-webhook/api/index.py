import base64
import hashlib
import hmac
import html
import json
import logging
import os
import time

import resend
from flask import Flask, jsonify, request

app = Flask(__name__)

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("whop-webhook")

PAYMENT_SUCCEEDED = "payment.succeeded"
SIGNATURE_TOLERANCE_SECONDS = 300
DEDUPE_WINDOW_SECONDS = 86400
WHOP_SECRET_PREFIX = "whsec_"

_processed_webhooks = {}


def _is_duplicate(webhook_id):
    if not webhook_id:
        return False
    received_at = _processed_webhooks.get(webhook_id)
    if received_at is None:
        return False
    if time.time() - received_at > DEDUPE_WINDOW_SECONDS:
        _processed_webhooks.pop(webhook_id, None)
        return False
    return True


def _mark_processed(webhook_id):
    if webhook_id:
        _processed_webhooks[webhook_id] = time.time()


def _verify_signature(payload_bytes, headers):
    secret = os.environ.get("WHOP_WEBHOOK_SECRET")
    if not secret:
        logger.warning("WHOP_WEBHOOK_SECRET is not set; skipping signature verification")
        return True

    webhook_id = headers.get("webhook-id")
    webhook_timestamp = headers.get("webhook-timestamp")
    webhook_signature = headers.get("webhook-signature")
    if not (webhook_id and webhook_timestamp and webhook_signature):
        return False

    try:
        timestamp = float(webhook_timestamp)
    except (TypeError, ValueError):
        return False

    if abs(time.time() - timestamp) > SIGNATURE_TOLERANCE_SECONDS:
        return False

    try:
        raw_secret = secret[len(WHOP_SECRET_PREFIX):] if secret.startswith(WHOP_SECRET_PREFIX) else secret
        key = base64.b64decode(raw_secret + "==")

        signed_content = (
            webhook_id.encode("utf-8")
            + b"."
            + str(int(timestamp)).encode("utf-8")
            + b"."
            + payload_bytes
        )
        expected = base64.b64encode(
            hmac.new(key, signed_content, hashlib.sha256).digest()
        ).decode("utf-8")

        for versioned_signature in webhook_signature.split(" "):
            version, separator, signature = versioned_signature.partition(",")
            if separator and version == "v1" and hmac.compare_digest(signature, expected):
                return True
    except Exception as exc:
        logger.error("signature verification failed: %s", exc)
        return False

    return False


def _extract_email(data):
    if not isinstance(data, dict):
        return None
    for key in ("user", "member", "membership", "customer"):
        node = data.get(key)
        if isinstance(node, dict):
            email = node.get("email")
            if isinstance(email, str) and "@" in email:
                return email
    email = data.get("email")
    return email if isinstance(email, str) and "@" in email else None


def _extract_name(data):
    if not isinstance(data, dict):
        return None
    for key in ("user", "member", "customer"):
        node = data.get(key)
        if isinstance(node, dict) and isinstance(node.get("name"), str):
            return node["name"]
    return None


def _download_links():
    book_url = os.environ.get(
        "BOOK_DOWNLOAD_URL",
        "https://<project-ref>.supabase.co/storage/v1/object/public/freebies/restaurant-survival-toolkit-2026.pdf",
    )
    excel_url = os.environ.get(
        "EXCEL_BUNDLE_DOWNLOAD_URL",
        "https://<project-ref>.supabase.co/storage/v1/object/public/freebies/restaurant-survival-toolkit-2026.xlsx",
    )
    return book_url, excel_url


def _build_email(customer_email, customer_name, product_title, book_url, excel_url):
    product = product_title or "Restaurant Survival Toolkit 2026"
    first_name = (customer_name or customer_email.split("@")[0]).strip() or "there"

    subject = f"Your {product} is ready to download"

    text = f"""Hello {first_name},

Thank you for purchasing {product}. Your payment has been confirmed and your files are ready to download right now.

Download links:
- Digital book (PDF): {book_url}
- Excel files bundle: {excel_url}

Everything you bought is yours to keep. If a download link ever stops working, just reply to this email and we will send you a fresh one.

Best regards,
The {product} Team
"""

    html_body = f"""<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border:1px solid #e6e6e6;border-radius:8px;overflow:hidden;">
            <tr>
              <td style="background-color:#1B365D;padding:28px 32px;text-align:center;">
                <h1 style="margin:0;color:#ffffff;font-size:22px;line-height:1.3;">Your order is complete</h1>
                <p style="margin:8px 0 0;color:#D4AF37;font-size:14px;">تم تأكيد طلبك بنجاح</p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <p style="margin:0 0 16px;font-size:16px;color:#333333;">Hello {html.escape(first_name)},</p>
                <p style="margin:0 0 16px;font-size:15px;color:#444444;line-height:1.6;">
                  Thank you for purchasing <strong>{html.escape(product)}</strong>. Your payment was processed
                  successfully and your files are ready to download right now.
                </p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
                  <tr>
                    <td style="padding:8px 0;">
                      <a href="{html.escape(book_url)}" style="display:block;text-align:center;background-color:#1B365D;color:#ffffff;text-decoration:none;font-size:15px;font-weight:bold;padding:16px 24px;border-radius:6px;">Download the Digital Book (PDF)</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;">
                      <a href="{html.escape(excel_url)}" style="display:block;text-align:center;background-color:#996515;color:#ffffff;text-decoration:none;font-size:15px;font-weight:bold;padding:16px 24px;border-radius:6px;">Download the Excel Files Bundle</a>
                    </td>
                  </tr>
                </table>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FFF8E7;border-left:4px solid #D4AF37;">
                  <tr>
                    <td style="padding:16px 20px;">
                      <p style="margin:0;font-size:13px;color:#6b5b2e;line-height:1.6;">
                        Everything you bought is yours to keep. If a download link ever stops working,
                        just reply to this email and we will send you a fresh one.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="background-color:#1B365D;padding:16px 32px;text-align:center;">
                <p style="margin:0;color:#ffffff;font-size:12px;">{html.escape(product)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>"""

    return {
        "from": os.environ.get("EMAIL_FROM", "Restaurant Survival Toolkit <onboarding@resend.dev>"),
        "to": [customer_email],
        "reply_to": os.environ.get("SUPPORT_EMAIL", "support@example.com"),
        "subject": subject,
        "html": html_body,
        "text": text,
    }


def _send_email(params):
    resend.api_key = os.environ.get("RESEND_API_KEY")
    if not resend.api_key:
        raise RuntimeError("RESEND_API_KEY is not set")
    return resend.Emails.send(params)


@app.route("/", methods=["GET"])
def health():
    return jsonify({"service": "whop-webhook", "status": "ok"})


@app.route("/whop-webhook", methods=["POST"])
def whop_webhook():
    payload_bytes = request.get_data(cache=False)
    if not payload_bytes:
        return jsonify({"error": "empty request body"}), 400

    headers = {key.lower(): value for key, value in request.headers.items()}
    if not _verify_signature(payload_bytes, headers):
        logger.warning("rejected webhook with invalid signature")
        return jsonify({"error": "invalid signature"}), 401

    webhook_id = headers.get("webhook-id", "")
    if _is_duplicate(webhook_id):
        return jsonify({"ok": True, "duplicate": True}), 200

    try:
        payload = json.loads(payload_bytes.decode("utf-8"))
    except (ValueError, UnicodeDecodeError):
        return jsonify({"error": "invalid JSON payload"}), 400

    event_type = payload.get("type") or payload.get("event")
    if event_type != PAYMENT_SUCCEEDED:
        logger.info("ignoring unhandled event: %s", event_type)
        return jsonify({"ok": True, "ignored": True, "event": event_type}), 200

    data = payload.get("data")
    if isinstance(data, dict) and data.get("status") and data.get("status") != "succeeded":
        logger.warning("ignoring non-succeeded payment: %s", data.get("status"))
        return jsonify({"ok": True, "ignored": True, "reason": "payment not succeeded"}), 200

    customer_email = _extract_email(data)
    if not customer_email:
        logger.error("no customer email found in payload: %s", json.dumps(payload))
        return jsonify({"error": "customer email not found"}), 400

    customer_name = _extract_name(data)
    payment_id = data.get("id") if isinstance(data, dict) else None
    product = data.get("product") if isinstance(data, dict) else None
    product_title = product.get("title") if isinstance(product, dict) else None
    book_url, excel_url = _download_links()

    params = _build_email(customer_email, customer_name, product_title, book_url, excel_url)
    try:
        result = _send_email(params)
        _mark_processed(webhook_id)
        email_id = result.get("id") if isinstance(result, dict) else None
        logger.info("delivery email sent for payment %s to %s", payment_id, customer_email)
        return jsonify({"ok": True, "email_id": email_id}), 200
    except Exception as exc:
        logger.exception("failed to send delivery email for payment %s", payment_id)
        return jsonify({"error": "email delivery failed", "detail": str(exc)}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8000"))
    app.run(host="0.0.0.0", port=port)
