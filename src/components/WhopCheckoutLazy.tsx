'use client';

import dynamic from 'next/dynamic';

interface WhopCheckoutLazyProps {
  planId: string;
}

const WhopCheckoutEmbed = dynamic(() => import('./WhopCheckoutEmbed'), {
  ssr: false,
  loading: () => (
    <div className="flex w-full min-h-[420px] items-center justify-center rounded-xl bg-white/[0.03]">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-[#D4AF37] border-t-transparent"
        aria-hidden
      />
    </div>
  ),
});

export default function WhopCheckoutLazy({ planId }: WhopCheckoutLazyProps) {
  return <WhopCheckoutEmbed planId={planId} />;
}
