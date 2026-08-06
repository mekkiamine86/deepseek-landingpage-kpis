# Meta Ads Purchase Campaign — Execution Brief

> Build this campaign inside Meta Business Manager / Ads Manager. This brief is the paste-ready
> configuration. The web code (Pixel PageView + ViewContent) is already deployed on the landing page.

---

## 1. Campaign Architecture

| Setting | Value |
|---|---|
| **Campaign Objective** | Conversions (Sales) |
| **Optimization Event** | **Purchase** (Meta Pixel event) |
| **Budget** | Advantage+ campaign budget (CBO), single budget at campaign level |
| **Bid Strategy** | Lowest cost (Meta automated) |
| **Special Ad Category** | None / select only if required by account |

## 2. Targeting — Broad, Content-Led

| Setting | Value |
|---|---|
| **Age** | 25–65 (leave open) |
| **Gender** | All |
| **Locations** | Saudi Arabia (all regions) + GCC countries (UAE, Kuwait, Qatar, Bahrain, Oman) if budget allows |
| **Detailed Targeting** | **None — open targeting.** Do not stack interests. Let Meta's algorithm learn from the creative + landing content. |
| **Audience Suggestion** | Do NOT apply "Advantage+ audience". Leave unconstrained for full algorithmic reach. |

## 3. Ad Set / Ad Level

- **1 campaign → 1–3 ad sets** (each with a different creative variant for learning, all CBO-pooled).
- **Advantage+ placements** (Auto placements): Facebook, Instagram, Stories, Reels, Marketplace, Messenger.
- **No placement exclusions** in the learning phase.

## 4. Ad Copy (embed exactly)

**Primary Text:**
```
خلف الأبواب المغلقة للمطاعم التي تبدو مزدحمة، هناك أرقام تنزف بصمت في التدفقات النقدية والهدر التشغيلي.

كمستثمر أو صاحب مطعم، أنت تعلم أن 'المبيعات المرتفعة' لا تعني دائماً 'أرباحاً صافية'. لهذا السبب، قمنا بصياغة الدليل العملي المخصص لإيقاف النزيف المالي الفوري في السوق الخليجي والسعودي.

بدون تظاهر بالتخفيضات وبدون تعقيدات أكاديمية؛ مصفوفة فحص مالي وإجراءات تشغيلية واضحة تحمي استثمارك من الفشل التشغيلي الشائع.

🔗 احصل على النسخة الرقمية الفاخرة وحملها فوراً من خلال صفحتنا الرسمية.
```

**Headline:**
```
دليل حماية أرباح المطاعم من الهدر الخفي | تحميل رقمي فوري
```

**Description (optional field):**
```
دليل عملي مخصص للسوق السعودي — مصفوفة فحص مالي + نموذج إكسيل للتدفقات النقدية.
```

**CTA Button:** `Learn More` (المزيد) — or `Order Now` (اطلب الآن). Recommend **Learn More** for high-ticket.

**Destination URL:** the deployed landing page root URL (Forest Green landing with embedded Whop checkout), e.g. `https://<your-domain>/`

## 5. Creative Direction (3D / Video)

| Rule | Requirement |
|---|---|
| **Asset type** | 3D book mockup (loop video 1080×1080 or 1080×1920) or high-res static 3D render |
| **Background** | Deep Forest Green (`#001a0b` / `#00562a` gradients) |
| **Lighting** | Crisp, editorial, high-contrast product studio light |
| **Style** | Premium / luxury — muted gold (`#D4AF37`) accents |
| **Forbidden** | Human faces, low-quality stock photos, distracting music |
| **Text overlay** | Book cover visible + small headline tag; keep minimal |

## 6. Launch Sequence

1. Create campaign → Conversion objective → optimization = Purchase.
2. Set CBO budget (start ~$50–100/day, scale +20% every 3–4 days after 25–50 conversions).
3. Add creative variant(s) per ad set, copy per Section 4.
4. Set to **Active** (or Schedule start date).
5. Track via Pixel PageView/ViewContent (live) + Purchase (see Tracking note).

---

## ⚠️ Purchase Tracking — Critical Note

The landing page checkout is an **embedded Whop iframe** (cross-origin). Your own `fbq` JavaScript
**cannot see the purchase** inside Whop's domain. PageView + ViewContent already fire on our page.
For the **Purchase** optimization event to work you MUST do ONE of:

1. **Whop Dashboard → connect your Meta Pixel** (Whop fires the Purchase server-side on completion)
   — recommended, gives Meta the Purchase signal it needs to optimize.
2. **Whop Webhook → your server → Meta Conversions API (CAPI)** — server-to-server, most accurate.
   Requires a webhook endpoint + Meta CAPI token (not currently built).

Until a Purchase signal reaches Meta, the campaign will have no conversion event to optimize for.
Confirm the Whop↔Pixel connection is active before setting the campaign Active.
