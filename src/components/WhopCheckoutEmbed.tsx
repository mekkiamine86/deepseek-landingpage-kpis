'use client';

import { useEffect, useRef, useState } from 'react';

interface WhopCheckoutEmbedProps {
  planId: string;
  theme?: 'light' | 'dark';
  accentColor?: string;
  borderRadius?: number;
}

export default function WhopCheckoutEmbed({
  planId,
  theme = 'light',
  accentColor = '#059669',
  borderRadius = 10,
}: WhopCheckoutEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setLoaded(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setLoaded(true);
          observer.disconnect();
        }
      },
      { rootMargin: '500px 0px', threshold: 0.01 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onBuyClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest?.('.btn-buy')) {
        setLoaded(true);
      }
    };
    document.addEventListener('click', onBuyClick);
    return () => document.removeEventListener('click', onBuyClick);
  }, []);

  const handleBuyClick = () => {
    if (isLoading) return;
    setIsLoading(true);
    setLoaded(true);
  };

  // Clear the loading overlay once the Whop iframe actually renders
  useEffect(() => {
    if (!loaded || !isLoading) return;
    const shell = containerRef.current;
    if (!shell) return;
    const clearLoading = () => setIsLoading(false);
    let iframeListener: HTMLIFrameElement | null = null;
    let mutationObserver: MutationObserver | null = null;
    const fallbackTimer = window.setTimeout(clearLoading, 8000);

    const bindIframe = (iframe: HTMLIFrameElement) => {
      iframeListener = iframe;
      iframe.addEventListener('load', clearLoading, { once: true });
    };

    const existingIframe = shell.querySelector('iframe');
    if (existingIframe) {
      bindIframe(existingIframe);
      return () => {
        window.clearTimeout(fallbackTimer);
        iframeListener?.removeEventListener('load', clearLoading);
        mutationObserver?.disconnect();
      };
    }

    mutationObserver = new MutationObserver(() => {
      const iframe = shell.querySelector('iframe');
      if (iframe && iframe !== iframeListener) bindIframe(iframe);
    });
    mutationObserver.observe(shell, { childList: true, subtree: true });
    return () => {
      window.clearTimeout(fallbackTimer);
      iframeListener?.removeEventListener('load', clearLoading);
      mutationObserver?.disconnect();
    };
  }, [loaded, isLoading]);

  useEffect(() => {
    if (!loaded) return;
    if (document.querySelector('script[data-whop-checkout-loader]')) return;
    const script = document.createElement('script');
    script.src = 'https://js.whop.com/static/checkout/loader.js';
    script.async = true;
    script.dataset.whopCheckoutLoader = 'true';
    document.head.appendChild(script);
  }, [loaded]);

  useEffect(() => {
    if (!loaded) return;
    const shell = containerRef.current?.querySelector('[data-whop-checkout-shell]');
    if (!shell || shell.querySelector('whop-express-checkout-button')) return;
    const button = document.createElement('whop-express-checkout-button');
    button.setAttribute('plan-id', planId);
    button.setAttribute('return-url', 'https://www.matjaroq.com/');
    button.setAttribute('environment', 'production');
    button.setAttribute('skip-redirect', 'true');
    button.setAttribute('theme', 'dark');
    button.setAttribute('theme-accent-color', 'gold');
    shell.prepend(button);
    const onMethodResolved = (event: Event) => {
      const detail = (event as CustomEvent).detail as { rendered?: string } | undefined;
      if (detail?.rendered === 'none') {
        button.style.display = 'none';
      }
    };
    button.addEventListener('express-method-resolved', onMethodResolved);
    return () => button.removeEventListener('express-method-resolved', onMethodResolved);
  }, [loaded, planId]);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {loaded ? (
        <div data-whop-checkout-shell className="flex flex-col gap-3 min-h-[420px]">
          <div
            data-whop-checkout-plan-id={planId}
            data-whop-checkout-theme={theme}
            data-whop-checkout-theme-accent-color={accentColor}
            data-whop-checkout-theme-border-radius={borderRadius}
            data-whop-checkout-collect-phone-numbers="false"
            data-whop-checkout-hide-address="true"
            data-whop-checkout-skip-redirect="true"
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={handleBuyClick}
          disabled={isLoading}
          className="flex w-full min-h-[420px] flex-col items-center justify-center gap-3 rounded-xl border border-[#D4AF37]/50 bg-gradient-to-b from-[#D4AF37]/15 to-transparent p-6 text-center transition-colors hover:border-[#D4AF37] hover:from-[#D4AF37]/25"
          aria-label="فتح الدفع الآمن عبر Whop"
        >
          <span className="text-4xl" aria-hidden>
            🛒
          </span>
          <span className="font-black text-lg text-white">إتمام الشراء الآمن عبر Whop</span>
          <span className="btn-buy px-8 py-3 rounded-xl text-base">اضغط للدفع الآن</span>
          <span className="text-xs text-neutral-400">🔒 دفع مشفّر — Visa / Mastercard / Apple Pay / Google Pay</span>
        </button>
      )}
      {loaded && isLoading && (
        <div
          className="absolute inset-0 z-10 flex min-h-[420px] flex-col items-center justify-center gap-3 rounded-xl bg-[#001a0b]/90 backdrop-blur-sm"
          role="status"
          aria-live="polite"
        >
          <div
            className="h-10 w-10 animate-spin rounded-full border-2 border-[#D4AF37] border-t-transparent"
            aria-hidden
          />
          <span className="text-sm font-bold text-white">جاري فتح بوابة الدفع...</span>
        </div>
      )}
    </div>
  );
}
