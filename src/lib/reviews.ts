import { MerchantReview } from '../types/contracts';

export interface RatingSummary {
  /** Mean of approved ratings, or null when there are none. */
  average: number | null;
  count: number;
}

export const NO_RATING: RatingSummary = { average: null, count: 0 };

/** Ratings from superadmin-approved reviews only, keyed by merchantId. */
export function buildRatingIndex(reviews: MerchantReview[]): Map<string, RatingSummary> {
  const totals = new Map<string, { sum: number; count: number }>();
  for (const review of reviews) {
    if (review.status !== 'approved') continue;
    const total = totals.get(review.merchantId) ?? { sum: 0, count: 0 };
    total.sum += review.rating;
    total.count += 1;
    totals.set(review.merchantId, total);
  }
  const index = new Map<string, RatingSummary>();
  totals.forEach((total, merchantId) =>
    index.set(merchantId, { average: total.sum / total.count, count: total.count })
  );
  return index;
}

/** Published reviews for one merchant, newest first. */
export function approvedReviewsFor(reviews: MerchantReview[], merchantId: string): MerchantReview[] {
  return reviews
    .filter((r) => r.merchantId === merchantId && r.status === 'approved')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * Bayesian average: few reviews are pulled toward a neutral prior, so a single 5★ review
 * doesn't outrank a merchant with twenty 4.8★ reviews.
 */
export const REVIEW_PRIOR = { mean: 3.5, weight: 3 } as const;

export function bayesianRating(summary: RatingSummary): number {
  const sum = (summary.average ?? 0) * summary.count;
  return (REVIEW_PRIOR.mean * REVIEW_PRIOR.weight + sum) / (REVIEW_PRIOR.weight + summary.count);
}
