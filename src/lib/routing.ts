import { MERCHANT_OFFER_CATEGORY_IDS, MerchantOfferCategory } from '../types/contracts';
import {
  AGENT_SERVICE_QUERY_PARAM,
  COMMUNITY_POST_QUERY_PARAM,
  OFFER_QUERY_PARAM,
  POSTCARD_QUERY_PARAMS,
} from './share';

export const MAIN_SECTION_TABS = [
  'all',
  'categories',
  'guides',
  'agents',
  'rentals',
  'merchants',
  'digital-tech',
  'admin',
] as const;

export type MainSectionTab = (typeof MAIN_SECTION_TABS)[number];

// Extra hashes already advertised in public/sitemap.xml, plus a friendly alias.
const HASH_ALIASES: Record<string, MainSectionTab> = {
  visas: 'guides',
  community: 'digital-tech',
  offers: 'merchants',
};

export interface AppRoute {
  /** null when the URL names no section, so the caller keeps its default tab. */
  tab: MainSectionTab | null;
  /** Offer ID from a shared postcard link (?offer=OFR-123456). */
  offerId: string | null;
  /** Agent service from a shared postcard link (?agent=AGT-PP-001). */
  agentServiceId: string | null;
  /** Community post from a shared postcard link (?post=COMM-001). */
  communityPostId: string | null;
  /** Selected category on the Categories page (#categories/massage). */
  categoryId: MerchantOfferCategory | null;
}

const NO_POSTCARD = { offerId: null, agentServiceId: null, communityPostId: null } as const;

function isMainSectionTab(value: string): value is MainSectionTab {
  return (MAIN_SECTION_TABS as readonly string[]).includes(value);
}

function isCategory(value: string): value is MerchantOfferCategory {
  return (MERCHANT_OFFER_CATEGORY_IDS as readonly string[]).includes(value);
}

export function parseAppRoute(href: string): AppRoute {
  const url = new URL(href);
  const param = (name: string) => url.searchParams.get(name)?.trim().slice(0, 40) || null;

  // A shared postcard link wins over any #hash (one postcard per link).
  const offerId = param(OFFER_QUERY_PARAM);
  if (offerId) return { ...NO_POSTCARD, tab: 'merchants', offerId, categoryId: null };
  const agentServiceId = param(AGENT_SERVICE_QUERY_PARAM);
  if (agentServiceId) return { ...NO_POSTCARD, tab: 'agents', agentServiceId, categoryId: null };
  const communityPostId = param(COMMUNITY_POST_QUERY_PARAM);
  if (communityPostId) return { ...NO_POSTCARD, tab: 'digital-tech', communityPostId, categoryId: null };

  let hash = url.hash.replace(/^#\/?/, '');
  try {
    hash = decodeURIComponent(hash);
  } catch {
    // Malformed percent-encoding — fall through with the raw value.
  }
  const [head = '', sub = ''] = hash.toLowerCase().split('/');

  if (isMainSectionTab(head)) {
    return {
      ...NO_POSTCARD,
      tab: head,
      categoryId: head === 'categories' && isCategory(sub) ? sub : null,
    };
  }
  // Own-property check so "#constructor" etc. can't resolve to Object.prototype members.
  return {
    ...NO_POSTCARD,
    tab: Object.hasOwn(HASH_ALIASES, head) ? HASH_ALIASES[head] : null,
    categoryId: null,
  };
}

/** URL for an in-app tab (optionally "#tab/sub"): drops any shared-postcard parameter. */
export function buildTabUrl(href: string, tab: MainSectionTab, sub?: string): string {
  const url = new URL(href);
  POSTCARD_QUERY_PARAMS.forEach((name) => url.searchParams.delete(name));
  url.hash = sub ? `${tab}/${sub}` : tab;
  return url.toString();
}

/** URL that pins one postcard (?offer=ID), as used by share links. */
export function buildOfferUrl(href: string, offerId: string): string {
  const url = new URL(href);
  POSTCARD_QUERY_PARAMS.forEach((name) => url.searchParams.delete(name));
  url.searchParams.set(OFFER_QUERY_PARAM, offerId);
  url.hash = '';
  return url.toString();
}
