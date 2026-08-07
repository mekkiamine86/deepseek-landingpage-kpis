'use client';

import { useRef, useState } from 'react';

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
  const [isLoading, setIsLoading] = useState(false);

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

  const openCheckout = () => {
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

  const handleClick = () => {
    if (isLoading) return;
    ensureLoaded();
    setIsLoading(true);

    if (window.WhopCheckout) {
      openCheckout();
      setIsLoading(false);
      return;
    }

    let attempts = 0;
    const poll = window.setInterval(() => {
      attempts += 1;
      if (window.WhopCheckout) {
        window.clearInterval(poll);
        openCheckout();
        setIsLoading(false);
      } else if (attempts >= 30) {
        window.clearInterval(poll);
        window.open(`https://whop.com/checkout/${planId}`, '_blank', 'noopener,noreferrer');
        setIsLoading(false);
      }
    }, 100);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      aria-busy={isLoading}
      className={`${className ?? ''} ${
        isLoading ? 'flex items-center justify-center gap-2 cursor-wait' : ''
      }`}
    >
      {isLoading ? (
        <>
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
          </svg>
          <span>جاري فتح بوابة الدفع...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
