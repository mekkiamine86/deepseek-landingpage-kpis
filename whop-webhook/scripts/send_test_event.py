import argparse
import base64
import hashlib
import hmac
import json
import os
import time
import urllib.request

WHOP_SECRET_PREFIX = "whsec_"


def _sign(webhook_id, secret, payload_bytes):
    raw_secret = secret[len(WHOP_SECRET_PREFIX):] if secret.startswith(WHOP_SECRET_PREFIX) else secret
    key = base64.b64decode(raw_secret + "==")
    timestamp = str(int(time.time()))
    signed_content = f"{webhook_id}.{timestamp}.".encode("utf-8") + payload_bytes
    signature = base64.b64encode(hmac.new(key, signed_content, hashlib.sha256).digest()).decode("utf-8")
    return timestamp, f"v1,{signature}"


def main():
    parser = argparse.ArgumentParser(description="Send a signed payment.succeeded test event to the webhook")
    parser.add_argument("--url", default=os.environ.get("WEBHOOK_URL", "http://localhost:8000/whop-webhook"))
    parser.add_argument("--secret", default=os.environ.get("WHOP_WEBHOOK_SECRET", "whsec_testsecret"))
    parser.add_argument("--email", default="customer@example.com")
    args = parser.parse_args()

    payload = {
        "id": "evt_test_123",
        "type": "payment.succeeded",
        "api_version": "v1",
        "timestamp": int(time.time()),
        "data": {
            "id": "pay_test_123",
            "status": "succeeded",
            "substatus": "succeeded",
            "currency": "usd",
            "total": 49.0,
            "user": {
                "id": "user_test_123",
                "name": "Test Customer",
                "email": args.email,
            },
            "product": {
                "id": "prod_test_123",
                "title": "Restaurant Survival Toolkit 2026",
            },
            "plan": {"id": "plan_test_123"},
        },
    }

    payload_bytes = json.dumps(payload).encode("utf-8")
    webhook_id = "msg_test_123"
    timestamp, signature = _sign(webhook_id, args.secret, payload_bytes)

    request = urllib.request.Request(
        args.url,
        data=payload_bytes,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "webhook-id": webhook_id,
            "webhook-timestamp": timestamp,
            "webhook-signature": signature,
        },
    )

    with urllib.request.urlopen(request) as response:
        print("STATUS:", response.status)
        print("BODY:", response.read().decode("utf-8"))


if __name__ == "__main__":
    main()
