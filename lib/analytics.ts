type GtagEvent =
  | 'view_configurator'
  | 'select_product'
  | 'configure_step'
  | 'generate_quote'
  | 'submit_lead'
  | 'submit_lead_express'
  | 'submit_lead_pro'
  | 'click_whatsapp'
  | 'click_via_rapida'
  | 'click_partner_seal'
  | 'click_financiacion';

type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (command: string, eventName: string, params?: EventParams) => void;
    dataLayer?: unknown[];
  }
}

export function track(event: GtagEvent, params?: EventParams) {
  if (typeof window === 'undefined') return;
  if (typeof window.gtag !== 'function') {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.debug('[analytics]', event, params);
    }
    return;
  }
  try {
    window.gtag('event', event, params);
  } catch {
    // Silent fail — analytics never breaks the app
  }
}

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || '';
