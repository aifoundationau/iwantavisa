/**
 * Share-link helpers for postcards: merchant offers, agent services and community posts.
 *
 * Share URLs carry the postcard in a query parameter (?offer=OFR-123456, ?agent=AGT-PP-001,
 * ?post=COMM-001) rather than a #hash: a future server/edge route can read query parameters to
 * render per-postcard OpenGraph previews, whereas hashes never reach the server.
 */

export const OFFER_QUERY_PARAM = 'offer';
export const AGENT_SERVICE_QUERY_PARAM = 'agent';
export const COMMUNITY_POST_QUERY_PARAM = 'post';
/** Every parameter that pins a shared postcard. */
export const POSTCARD_QUERY_PARAMS = [OFFER_QUERY_PARAM, AGENT_SERVICE_QUERY_PARAM, COMMUNITY_POST_QUERY_PARAM] as const;

/** Canonical public base URL: VITE_APP_DOMAIN when configured, else this origin + Vite base path. */
export function getAppBaseUrl(): string {
  const configured = import.meta.env.VITE_APP_DOMAIN?.trim();
  if (configured) return `${configured.replace(/\/+$/, '')}/`;
  return new URL(import.meta.env.BASE_URL, window.location.origin).href;
}

function buildPostcardShareUrl(param: (typeof POSTCARD_QUERY_PARAMS)[number], id: string): string {
  const url = new URL(getAppBaseUrl());
  url.searchParams.set(param, id);
  return url.toString();
}

/** The link every share button points at — it opens the postcard back in the web app. */
export function buildOfferShareUrl(offerId: string): string {
  return buildPostcardShareUrl(OFFER_QUERY_PARAM, offerId);
}

/** An agent service postcard: opens Agent Services with the postcard pinned on top. */
export function buildAgentServiceShareUrl(serviceId: string): string {
  return buildPostcardShareUrl(AGENT_SERVICE_QUERY_PARAM, serviceId);
}

/** A community post postcard: opens the Tech Community with the postcard pinned on top. */
export function buildCommunityPostShareUrl(postId: string): string {
  return buildPostcardShareUrl(COMMUNITY_POST_QUERY_PARAM, postId);
}

export interface SharePayload {
  url: string;
  title: string;
  text: string;
}

export type ShareTarget = 'facebook' | 'x' | 'linkedin' | 'whatsapp' | 'telegram' | 'email';

export function buildShareTargetUrl(target: ShareTarget, { url, title, text }: SharePayload): string {
  const encodedUrl = encodeURIComponent(url);
  switch (target) {
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    case 'x':
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodedUrl}`;
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    case 'whatsapp':
      return `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
    case 'telegram':
      return `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(text)}`;
    case 'email':
      return `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`;
  }
}

/**
 * Copies text to the clipboard. Falls back to a hidden textarea where the async
 * Clipboard API is unavailable (e.g. the dev server opened over plain-http LAN).
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Permission denied or unsupported — try the legacy path below.
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    document.body.removeChild(textarea);
    return copied;
  } catch {
    return false;
  }
}
