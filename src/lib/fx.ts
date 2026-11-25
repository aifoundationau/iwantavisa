/**
 * USD → KHR (Cambodian riel) rate from the Frankfurter API (https://frankfurter.dev, v2 —
 * the v1 / api.frankfurter.app endpoints don't carry KHR). Prices in the app are USD only;
 * the footer converts them to riel. Cached in localStorage so each visitor fetches at most
 * every few hours.
 */
export const FRANKFURTER_USD_KHR_URL = 'https://api.frankfurter.dev/v2/rates?base=USD&quotes=KHR';

const CACHE_KEY = 'iwantavisa:fx:USD-KHR';
const CACHE_MAX_AGE_MS = 6 * 60 * 60 * 1000;

export interface UsdKhrRate {
  /** Riel per 1 US dollar, e.g. 4080.69 */
  rate: number;
  /** Date the rate applies to (YYYY-MM-DD), as reported by Frankfurter. */
  date: string;
}

/** Picks the KHR row out of a Frankfurter v2 response; null if it's missing or malformed. */
export function parseFrankfurterKhr(body: unknown): UsdKhrRate | null {
  if (!Array.isArray(body)) return null;
  const row = body.find(
    (r): r is { quote: string; rate: number; date: string } =>
      typeof r === 'object' && r !== null && (r as { quote?: unknown }).quote === 'KHR'
  );
  if (!row || typeof row.rate !== 'number' || !Number.isFinite(row.rate) || row.rate <= 0) return null;
  return { rate: row.rate, date: typeof row.date === 'string' ? row.date : '' };
}

function readCache(now: number): UsdKhrRate | null {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null') as
      | (UsdKhrRate & { fetchedAt: number })
      | null;
    if (cached && now - cached.fetchedAt < CACHE_MAX_AGE_MS && cached.rate > 0) {
      return { rate: cached.rate, date: cached.date };
    }
  } catch {
    // Corrupt or unavailable storage — fetch fresh.
  }
  return null;
}

export async function fetchUsdToKhr(signal?: AbortSignal): Promise<UsdKhrRate> {
  const now = Date.now();
  const cached = readCache(now);
  if (cached) return cached;

  const response = await fetch(FRANKFURTER_USD_KHR_URL, { signal });
  if (!response.ok) throw new Error(`Frankfurter responded ${response.status}`);
  const rate = parseFrankfurterKhr(await response.json());
  if (!rate) throw new Error('Frankfurter returned no KHR rate');

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ...rate, fetchedAt: now }));
  } catch {
    // Storage full or blocked — the rate still works for this visit.
  }
  return rate;
}

/** USD amount → whole riel (riel has no cents in everyday use). */
export function usdToKhr(usd: number, rate: number): number {
  return Math.round(usd * rate);
}

export function formatKhr(riel: number): string {
  return `${riel.toLocaleString('en-US')} ៛`;
}
