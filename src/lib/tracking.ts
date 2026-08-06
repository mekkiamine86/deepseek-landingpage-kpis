export interface TrackableProduct {
  metaPixelId?: string | null;
  tiktokPixelId?: string | null;
  snapchatPixelId?: string | null;
  googleAdsId?: string | null;
  gtmId?: string | null;
  linkedInPartnerId?: string | null;
  hubSpotId?: string | null;
}

const loaded = new Set<string>();

export function isPixelLoaded(key: string): boolean {
  return loaded.has(key);
}

function markLoaded(key: string) {
  loaded.add(key);
}

function appendInlineScript(code: string) {
  const script = document.createElement('script');
  script.innerHTML = code;
  document.head.appendChild(script);
}

export function onFirstInteraction(cb: () => void) {
  const events = ['pointerdown', 'keydown', 'scroll', 'touchstart'];
  let fired = false;
  const trigger = () => {
    if (fired) return;
    fired = true;
    for (const event of events) {
      window.removeEventListener(event, trigger);
    }
    cb();
  };
  for (const event of events) {
    window.addEventListener(event, trigger, { passive: true });
  }
  return trigger;
}

export function whenIdle(cb: () => void, timeout = 3000) {
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(() => cb(), { timeout });
  } else {
    window.setTimeout(cb, 1);
  }
}

export function deferToIdleOrInteraction(cb: () => void) {
  onFirstInteraction(cb);
  whenIdle(cb);
}

export function loadMetaPixel(
  pixelId: string,
  contentName?: string,
  contentId?: string,
  price?: string,
) {
  const key = `meta:${pixelId}`;
  if (!pixelId || loaded.has(key)) return;
  markLoaded(key);

  appendInlineScript(`
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '${pixelId}');
    fbq('track', 'PageView');
    ${contentName ? `fbq('track', 'ViewContent', { content_type: 'product', content_name: '${contentName}', content_ids: ['${contentId}'], value: ${price || '90'}, currency: 'USD' });` : ''}
  `);
}

export function loadTikTokPixel(pixelId: string) {
  const key = `tiktok:${pixelId}`;
  if (!pixelId || loaded.has(key)) return;
  markLoaded(key);

  appendInlineScript(`
    !function (w, d, t) {
      w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
      ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
      ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
      for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
      ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
      ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";
      ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};
      var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;
      var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
      ttq.load('${pixelId}');
      ttq.page();
    }(window, document, 'ttq');
  `);
}

export function loadSnapchatPixel(pixelId: string) {
  const key = `snapchat:${pixelId}`;
  if (!pixelId || loaded.has(key)) return;
  markLoaded(key);

  appendInlineScript(`
    (function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function()
    {a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
    a.queue=[];var s='script';r=t.createElement(s);
    r.async=!0;r.src=n;var u=t.getElementsByTagName(s)[0];
    u.parentNode.insertBefore(r,u);})(window,document,
    'https://sc-static.net/scevent.min.js');
    snaptr('init', '${pixelId}');
    snaptr('track', 'PAGE_VIEW');
  `);
}

export function loadGoogleAds(googleAdsId: string) {
  const googleId = googleAdsId.split('/')[0];
  const key = `google:${googleId}`;
  if (!googleId || loaded.has(key)) return;
  markLoaded(key);

  const head = document.head;
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${googleId}`;
  script.async = true;
  head.appendChild(script);

  const inline = document.createElement('script');
  inline.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${googleId}');
  `;
  head.appendChild(inline);
}

export function loadGoogleTagManager(gtmId: string) {
  const key = `gtm:${gtmId}`;
  if (!gtmId || loaded.has(key)) return;
  markLoaded(key);

  appendInlineScript(`
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${gtmId}');
  `);
}

export function loadLinkedInInsight(partnerId: string) {
  const key = `linkedin:${partnerId}`;
  if (!partnerId || loaded.has(key)) return;
  markLoaded(key);

  appendInlineScript(`
    _linkedin_partner_id = '${partnerId}';
    window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
    window._linkedin_data_partner_ids.push(_linkedin_partner_id);
    (function(l) {
      if (!l) { window.lintrk = function(a, b) { window.lintrk.q.push([a, b]); }; window.lintrk.q = []; }
      var s = document.getElementsByTagName('script')[0];
      var b = document.createElement('script');
      b.type = 'text/javascript'; b.async = true;
      b.src = 'https://snap.licdn.com/li.lms-analytics/insight.min.js';
      s.parentNode.insertBefore(b, s);
    })(window.lintrk);
  `);
}

export function loadHubSpot(hubspotId: string) {
  const key = `hubspot:${hubspotId}`;
  if (!hubspotId || loaded.has(key)) return;
  markLoaded(key);

  const script = document.createElement('script');
  script.src = `https://js.hs-scripts.com/${hubspotId}.js`;
  script.async = true;
  script.defer = true;
  script.id = 'hs-script-loader';
  document.head.appendChild(script);
}

export function loadProductPixels(product: TrackableProduct) {
  if (product.metaPixelId) loadMetaPixel(product.metaPixelId);
  if (product.tiktokPixelId) loadTikTokPixel(product.tiktokPixelId);
  if (product.snapchatPixelId) loadSnapchatPixel(product.snapchatPixelId);
  if (product.googleAdsId) loadGoogleAds(product.googleAdsId);
  if (product.gtmId) loadGoogleTagManager(product.gtmId);
  if (product.linkedInPartnerId) loadLinkedInInsight(product.linkedInPartnerId);
  if (product.hubSpotId) loadHubSpot(product.hubSpotId);
}

export function deferMarketingScripts(product: TrackableProduct) {
  const run = () => loadProductPixels(product);
  deferToIdleOrInteraction(run);
}
