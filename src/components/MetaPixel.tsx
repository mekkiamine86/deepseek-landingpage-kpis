'use client';

import { useEffect } from 'react';
import { loadMetaPixel, deferToIdleOrInteraction } from '@/lib/tracking';

interface MetaPixelProps {
  pixelId: string;
  contentName?: string;
  contentId?: string;
  price?: string;
}

export default function MetaPixel({
  pixelId,
  contentName,
  contentId,
  price,
}: MetaPixelProps) {
  useEffect(() => {
    if (!pixelId) return;
    deferToIdleOrInteraction(() => loadMetaPixel(pixelId, contentName, contentId, price));
  }, [pixelId, contentName, contentId, price]);

  return null;
}
