import React from 'react';
import { CheckCircle2, Clock, Undo2, XCircle } from 'lucide-react';
import { MerchantProfile, MerchantReview, ReviewStatus } from '../types/contracts';
import { Stars } from './StarRating';

interface ReviewModerationPanelProps {
  reviews: MerchantReview[];
  merchants: MerchantProfile[];
  /** 'pending' moves a decision back into the queue (undo). */
  onModerate: (reviewId: string, status: ReviewStatus) => void;
}

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export const ReviewModerationPanel: React.FC<ReviewModerationPanelProps> = ({ reviews, merchants, onModerate }) => {
  const businessName = (merchantId: string) =>
    merchants.find((m) => m.id === merchantId)?.businessName ?? merchantId;
  // Oldest first, so the queue is handled in the order people wrote them.
  const pending = reviews
    .filter((r) => r.status === 'pending')
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const decided = reviews
    .filter((r) => r.status !== 'pending' && r.moderatedAt)
    .sort((a, b) => (b.moderatedAt ?? '').localeCompare(a.moderatedAt ?? ''))
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-lg space-y-4">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            Review Moderation — {pending.length} waiting
          </h3>
          <p className="text-xs text-slate-500">
            Reviews only appear on a merchant's reviews list (and count toward their rating and search
            rank) after you approve them.
          </p>
        </div>

        {pending.length === 0 ? (
          <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400" data-testid="moderation-empty">
            ✓ All caught up — no reviews waiting.
          </p>
        ) : (
          <ul className="space-y-3">
            {pending.map((review) => (
              <li
                key={review.id}
                data-testid={`moderation-item-${review.id}`}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                    {businessName(review.merchantId)}{' '}
                    <span className="font-mono text-[10px] text-amber-600">({review.id})</span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    by {review.reviewerName} · {formatDateTime(review.createdAt)}
                  </span>
                </div>
                <Stars value={review.rating} />
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">{review.comment}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => onModerate(review.id, 'approved')}
                    data-agent-id={`approve-review-${review.id}`}
                    data-testid={`approve-review-${review.id}`}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve &amp; publish
                  </button>
                  <button
                    type="button"
                    onClick={() => onModerate(review.id, 'rejected')}
                    data-agent-id={`reject-review-${review.id}`}
                    data-testid={`reject-review-${review.id}`}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {decided.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Recently moderated</h4>
          <ul className="space-y-2">
            {decided.map((review) => (
              <li
                key={review.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <div className="font-bold truncate">
                    <span
                      className={`mr-1.5 px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        review.status === 'approved'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-rose-600 text-white'
                      }`}
                    >
                      {review.status}
                    </span>
                    {businessName(review.merchantId)} · {review.reviewerName} · {review.rating}★
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">{review.comment}</div>
                </div>
                <button
                  type="button"
                  onClick={() => onModerate(review.id, 'pending')}
                  data-testid={`undo-review-${review.id}`}
                  className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-bold flex items-center gap-1"
                >
                  <Undo2 className="w-3 h-3" /> Undo
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
