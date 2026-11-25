import React, { useState } from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { MerchantProfile, MerchantReview, ReviewFormSchema, UserSession } from '../types/contracts';
import { approvedReviewsFor, RatingSummary } from '../lib/reviews';
import { Modal } from './Modal';
import { RatingBadge, StarInput, Stars } from './StarRating';

interface MerchantReviewsDialogProps {
  merchant: MerchantProfile;
  /** All reviews; the dialog shows this merchant's approved ones and the viewer's own. */
  reviews: MerchantReview[];
  rating: RatingSummary;
  session: UserSession | null;
  onSubmitReview: (input: { rating: number; comment: string }) => void;
  onRequestRegister: () => void;
  onClose: () => void;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export const MerchantReviewsDialog: React.FC<MerchantReviewsDialogProps> = ({
  merchant,
  reviews,
  rating,
  session,
  onSubmitReview,
  onRequestRegister,
  onClose,
}) => {
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  const published = approvedReviewsFor(reviews, merchant.id);
  const myReview = session?.userId
    ? reviews.find((r) => r.merchantId === merchant.id && r.reviewerUserId === session.userId)
    : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = ReviewFormSchema.safeParse({ rating: stars, comment });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || 'Please check your review.');
      return;
    }
    onSubmitReview(parsed.data);
  };

  let writeSection: React.ReactNode;
  if (!session?.userId) {
    writeSection = (
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="text-slate-700 dark:text-slate-300">Register (or sign in) to review this business.</span>
        <button
          type="button"
          onClick={onRequestRegister}
          data-testid="reviews-register-btn"
          className="px-3 py-1.5 rounded-lg bg-[#0F2557] text-amber-300 text-[11px] font-extrabold"
        >
          Register to review
        </button>
      </div>
    );
  } else if (session.merchantId === merchant.id) {
    writeSection = <p className="text-xs text-slate-600 dark:text-slate-400">You can't review your own business.</p>;
  } else if (myReview) {
    writeSection = (
      <p className="text-xs font-bold text-slate-700 dark:text-slate-300" data-testid="reviews-my-status">
        {myReview.status === 'pending' && '⏳ Thanks! Your review is waiting for approval by our team.'}
        {myReview.status === 'approved' && '✅ Your review is published below.'}
        {myReview.status === 'rejected' && 'Your review wasn’t approved for publishing.'}
      </p>
    );
  } else {
    writeSection = (
      <form onSubmit={handleSubmit} className="space-y-2">
        <StarInput value={stars} onChange={setStars} idPrefix="review" />
        <label htmlFor="review-comment" className="sr-only">
          Your review
        </label>
        <textarea
          id="review-comment"
          rows={3}
          maxLength={600}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={`How was ${merchant.businessName}?`}
          data-testid="review-comment-textarea"
          className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
        />
        {error && (
          <div role="alert" className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 p-2 rounded-lg">
            {error}
          </div>
        )}
        <button
          type="submit"
          data-testid="submit-review-btn"
          className="px-4 py-2 rounded-xl bg-[#0F2557] dark:bg-amber-500 text-white dark:text-slate-950 text-xs font-extrabold"
        >
          Submit review for approval
        </button>
      </form>
    );
  }

  return (
    <Modal titleId="reviews-dialog-title" onClose={onClose} testId="reviews-dialog">
      <div className="flex items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600">Reviews</span>
          <h3 id="reviews-dialog-title" className="text-lg font-extrabold text-slate-900 dark:text-white">
            {merchant.businessName}
          </h3>
          <div className="text-xs" data-testid="reviews-dialog-summary">
            <RatingBadge summary={rating} />
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close reviews"
          data-testid="close-reviews-dialog-btn"
          className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
        <p className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          Every review is checked by the I Want A Visa team before it's published.
        </p>
        {writeSection}
      </div>

      <ul className="space-y-3 max-h-[45vh] overflow-y-auto" aria-label="Published reviews" data-testid="reviews-list">
        {published.length === 0 ? (
          <li className="text-xs text-slate-500 dark:text-slate-400">No published reviews yet — be the first.</li>
        ) : (
          published.map((review) => (
            <li key={review.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Stars value={review.rating} />
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {review.reviewerName} · {formatDate(review.createdAt)}
                </span>
              </div>
              <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">{review.comment}</p>
            </li>
          ))
        )}
      </ul>
    </Modal>
  );
};
