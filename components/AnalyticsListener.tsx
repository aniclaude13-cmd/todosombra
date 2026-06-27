'use client';

import { useEffect } from 'react';
import { track } from '@/lib/analytics';

export default function AnalyticsListener() {
  useEffect(() => {
    function handler(e: MouseEvent) {
      const target = (e.target as HTMLElement)?.closest('[data-track]') as HTMLElement | null;
      if (!target) return;
      const event = target.dataset.track;
      if (!event) return;
      const params: Record<string, string> = {};
      Object.entries(target.dataset).forEach(([k, v]) => {
        if (k === 'track' || !v) return;
        if (k.startsWith('trackParam')) {
          const key = k.slice('trackParam'.length).replace(/^./, (c) => c.toLowerCase());
          params[key] = v;
        }
      });
      track(event as Parameters<typeof track>[0], params);
    }

    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  return null;
}
