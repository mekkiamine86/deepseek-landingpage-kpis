/**
 * Meta Marketing API campaign builder — «كيف لا يُغلق مطعمك؟» (Saudi)
 *
 * Creates: 1 Sales campaign → 3 ad sets (one creative each) → 3 ads.
 * Everything is created PAUSED so nothing spends before review.
 *
 * Requires Node >= 18 (built-in fetch, zero dependencies).
 *
 * Environment variables (or edit CONFIG below):
 *   META_ACCESS_TOKEN    – long-lived page/ads access token
 *   META_AD_ACCOUNT_ID   – e.g. act_1234567890
 *   META_PAGE_ID         – Facebook Page id for the ad account
 *   META_IMAGE_HASH      – image_hash from a prior upload (see upload note)
 *   META_LINK            – landing page URL (defaults to matjaroq.com product)
 *
 * Run:  node scripts/meta-campaign-builder.mjs
 */

const GRAPH_VERSION = "v25.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

const CONFIG = {
  accessToken: process.env.META_ACCESS_TOKEN,
  adAccountId: process.env.META_AD_ACCOUNT_ID, // e.g. "act_123"
  pageId: process.env.META_PAGE_ID,
  imageHash: process.env.META_IMAGE_HASH,
  link: process.env.META_LINK || "https://www.matjaroq.com/how-not-to-close-your-restaurant",
  campaignName: "DSK_Sales_RestaurantBook_SA",
  dailyBudgetCents: 1000, // $10 per ad set during testing
  ageMin: 25,
  ageMax: 65,
  countries: ["SA"],
  interestQueries: [
    "Restaurant",
    "Food & Beverage",
    "Entrepreneurship",
    "Small Business",
  ],
};

const CREATIVES = [
  {
    name: "DSK_Adset_V1_Sales_CashFlow",
    adName: "DSK_Ad_V1_PAS_CashFlow",
    message:
      "مبيعات مطعمك مرتفعة، لكن حسابك البنكي خالٍ في آخر الشهر؟ \u{1F4B8}\n\n" +
      "المشكلة ليست قلة الزبائن، بل التسريبات الصامتة: تكلفة المواد، الهدر، والسرقات الصغيرة التي تلتهم ربحك.\n\n" +
      "الدليل العملي «كيف لا يُغلق مطعمك؟» يعطيك أنظمة ضبط التكاليف + 3 ملفات إكسل سعودية جاهزة تحوّل أرقامك إلى ربح حقيقي. التسليم فوري عبر Whop.",
    headline: "مبيعات مرتفعة وحساب فارغ؟",
    description: "دليل عملي + 3 أنظمة إكسل سعودية",
    utmContent: "creative1",
  },
  {
    name: "DSK_Adset_V2_Sales_60Percent",
    adName: "DSK_Ad_V2_AIDA_60Percent",
    message:
      "60% من المطاعم تُغلق في عامها الأول. \u{1F628}\n\n" +
      "الفرق بين من يصمد ومن يُغلق: أرقام واضحة وأنظمة تشغيلية قبل فوات الأوان.\n\n" +
      "تعلّم خطوة بخطوة: دراسة الجدوى، المتطلبات القانونية، قائمة الطعام، التسويق، والمصفوفة الأسبوعية التي تكشف الخلل مبكراً. نسختك تنتظرك عبر Whop.",
    headline: "لا تدخل نادي الـ 60%",
    description: "8 فصول عملية تحمي مطعمك من الإغلاق",
    utmContent: "creative2",
  },
  {
    name: "DSK_Adset_V3_Sales_Fatoora",
    adName: "DSK_Ad_V3_BAB_Fatoora",
    message:
      "مطعمك يكسب… أم يكسب الجميع إلا أنت؟ \u{1F914}\n\n" +
      "من التخبط والتسعير العشوائي، إلى لوحة أرقام تقود قرارك: نقطة التعادل، هامش الربح، والتزام كامل بمتطلبات «فاتورة» والضريبة.\n\n" +
      "الدليل السعودي «كيف لا يُغلق مطعمك؟» + ملفات إكسل جاهزة. ابدأ اليوم بضغطة واحدة عبر Whop.",
    headline: "أرقام تحمي مطعمك وتلتزم بـ«فاتورة»",
    description: "أنظمة إكسل للقرارات والالتزام القانوني",
    utmContent: "creative3",
  },
];

// ---------------------------------------------------------------- helpers

async function api(path, params) {
  const body = new URLSearchParams({ access_token: CONFIG.accessToken, ...params });
  const res = await fetch(`${GRAPH_BASE}/${path}`, {
    method: "POST",
    body,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  const json = await res.json();
  if (!res.ok || json.error) {
    throw new Error(
      `Meta API error on ${path}: ${JSON.stringify(json.error || json)}`
    );
  }
  return json;
}

async function resolveInterest(query) {
  const url = `${GRAPH_BASE}/search?type=adinterest&q=${encodeURIComponent(query)}&access_token=${CONFIG.accessToken}`;
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || json.error || !Array.isArray(json.data) || json.data.length === 0) {
    throw new Error(`No interest found for: ${query}`);
  }
  const top = json.data[0];
  return { id: top.id, name: top.name };
}

async function createCampaign() {
  const res = await api(`act_${CONFIG.adAccountId.replace(/^act_/, "")}/campaigns`, {
    name: CONFIG.campaignName,
    objective: "OUTCOME_SALES",
    status: "PAUSED",
    special_ad_categories: [],
    buying_type: "AUCTION",
  });
  console.log("Campaign created:", res.id);
  return res.id;
}

async function createAdSet(campaignId, interestIds, creative) {
  const targeting = {
    geo_locations: { countries: CONFIG.countries },
    age_min: CONFIG.ageMin,
    age_max: CONFIG.ageMax,
    targeting_automation: { advantage_plus: false },
    flexible_spec: [{ interests: interestIds }],
  };

  const res = await api(`act_${CONFIG.adAccountId.replace(/^act_/, "")}/adsets`, {
    name: creative.name,
    campaign_id: campaignId,
    daily_budget: CONFIG.dailyBudgetCents,
    billing_event: "IMPRESSIONS",
    optimization_goal: "PURCHASE",
    bid_strategy: "LOWEST_COST_WITHOUT_CAP",
    status: "PAUSED",
    targeting: JSON.stringify(targeting),
  });
  console.log("Ad set created:", res.id, "->", creative.name);
  return res.id;
}

async function createAd(adSetId, creative) {
  const utmLink =
    CONFIG.link +
    `?utm_source=meta&utm_medium=cpc&utm_campaign=DSK_restaurant_book_SA&utm_content=${creative.utmContent}`;

  const creativePayload = {
    object_story_spec: {
      page_id: CONFIG.pageId,
      link_data: {
        link: utmLink,
        message: creative.message,
        name: creative.headline,
        description: creative.description,
        image_hash: CONFIG.imageHash,
        call_to_action_type: "LEARN_MORE",
      },
    },
  };

  const res = await api(`act_${CONFIG.adAccountId.replace(/^act_/, "")}/ads`, {
    name: creative.adName,
    adset_id: adSetId,
    status: "PAUSED",
    creative: JSON.stringify(creativePayload),
  });
  console.log("Ad created:", res.id, "->", creative.adName);
  return res.id;
}

// ------------------------------------------------------------------- main

async function main() {
  if (!CONFIG.accessToken || !CONFIG.adAccountId || !CONFIG.pageId || !CONFIG.imageHash) {
    throw new Error(
      "Missing config. Set META_ACCESS_TOKEN, META_AD_ACCOUNT_ID, META_PAGE_ID, META_IMAGE_HASH."
    );
  }

  const interestIds = [];
  for (const q of CONFIG.interestQueries) {
    const interest = await resolveInterest(q);
    interestIds.push({ id: interest.id, name: interest.name });
    console.log(`Interest resolved: ${interest.name} (${interest.id})`);
  }

  const campaignId = await createCampaign();

  for (const creative of CREATIVES) {
    const adSetId = await createAdSet(campaignId, interestIds, creative);
    await createAd(adSetId, creative);
  }

  console.log(
    "\nDone. Campaign, ad sets and ads created PAUSED for review.\n" +
      `Campaign: ${campaignId}\nLink: ${CONFIG.link}\nReview in Ads Manager before enabling.`
  );
}

main().catch((err) => {
  console.error("\nFailed:", err.message);
  process.exit(1);
});
