'use client';

import { useEffect, useRef } from 'react';

interface MetaPixelProps {
  pixelId: string;
  contentName?: string;
  contentId?: string;
  price?: string;
}

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

export default function MetaPixel({
  pixelId,
  contentName,
  contentId,
  price,
}: MetaPixelProps) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (!pixelId || firedRef.current) return;
    firedRef.current = true;

    const head = document.head;
    const script = document.createElement('script');
    script.innerHTML = `
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
    `;
    head.appendChild(script);
  }, [pixelId, contentName, contentId, price]);

  return null;
}
