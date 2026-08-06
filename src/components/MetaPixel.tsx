'use client';

import { useEffect } from 'react';
import { loadMetaPixel } from '@/lib/tracking';

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
    loadMetaPixel(pixelId, contentName, contentId, price);
  }, [pixelId, contentName, contentId, price]);

  return null;
}
