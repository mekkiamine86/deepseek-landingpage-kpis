'use client';

import { useEffect, useRef } from 'react';

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
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (scriptLoaded.current) return;
    scriptLoaded.current = true;

    const inject = () => {
      if (window.WhopCheckout) return;
      const script = document.createElement('script');
      script.src = 'https://js.whop.com/static/checkout/loader.js';
      script.async = true;
      document.head.appendChild(script);
    };

    inject();
  }, []);

  const handleClick = () => {
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
