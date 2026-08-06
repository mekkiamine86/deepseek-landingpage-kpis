'use client';

import { useRef } from 'react';

interface WhopCheckoutButtonProps {
  planId: string;
  children: React.ReactNode;
  className?: string;
  accentColor?: string;
}

declare global {
  interface Window {
    WhopCheckout?: {
      open: (options: {
        planId: string;
        theme?: 'light' | 'dark';
        accentColor?: string;
        borderRadius?: number;
      }) => void;
    };
  }
}

export default function WhopCheckoutButton({
  planId,
  children,
  className,
  accentColor = '#059669',
}: WhopCheckoutButtonProps) {
  const scriptRequested = useRef(false);

  const ensureLoaded = () => {
    if (scriptRequested.current) return;
    scriptRequested.current = true;
    if (document.querySelector('script[data-whop-checkout-loader]')) return;
    const script = document.createElement('script');
    script.src = 'https://js.whop.com/static/checkout/loader.js';
    script.async = true;
    script.dataset.whopCheckoutLoader = 'true';
    document.head.appendChild(script);
  };

  const handleClick = () => {
    ensureLoaded();
    if (window.WhopCheckout) {
      window.WhopCheckout.open({
        planId,
        theme: 'light',
        accentColor,
        borderRadius: 10,
      });
    } else {
      window.open(`https://whop.com/checkout/${planId}`, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <button type="button" onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
