'use client';

import { useEffect } from 'react';

interface WhopCheckoutEmbedProps {
  planId: string;
  theme?: 'light' | 'dark';
  accentColor?: string;
  borderRadius?: number;
  className?: string;
}

export default function WhopCheckoutEmbed({
  planId,
  theme = 'light',
  accentColor = '#059669',
  borderRadius = 10,
  className,
}: WhopCheckoutEmbedProps) {
  useEffect(() => {
    if (document.querySelector('script[data-whop-checkout-loader]')) return;
    const script = document.createElement('script');
    script.src = 'https://js.whop.com/static/checkout/loader.js';
    script.async = true;
    script.dataset.whopCheckoutLoader = 'true';
    document.head.appendChild(script);
  }, []);

  return (
    <div
      className={className}
      data-whop-checkout-plan-id={planId}
      data-whop-checkout-theme={theme}
      data-whop-checkout-theme-accent-color={accentColor}
      data-whop-checkout-theme-border-radius={borderRadius}
    />
  );
}
