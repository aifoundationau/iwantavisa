import React from 'react';

interface PriceBadgeProps {
  priceUsd: number;
  /** e.g. "/mo" for monthly rents */
  suffix?: string;
  idPrefix: string;
}

/** Prices are shown in US dollars only; the footer converts to riel (KHR). */
export const PriceBadge: React.FC<PriceBadgeProps> = ({ priceUsd, suffix = '', idPrefix }) => {
  const usd = Math.round(priceUsd).toLocaleString('en-US');
  return (
    <span
      data-agent-id={`price-badge-${idPrefix}`}
      data-testid={`price-badge-${idPrefix}`}
      aria-label={`${usd} US dollars${suffix === '/mo' ? ' per month' : ''}`}
      className="inline-flex items-baseline gap-1 rounded-xl bg-amber-500/15 dark:bg-amber-400/15 border border-amber-500/40 px-3 py-1.5 text-xs font-extrabold text-amber-900 dark:text-amber-300 whitespace-nowrap"
    >
      ${usd}
      <span className="text-[10px] font-bold opacity-75">USD{suffix}</span>
    </span>
  );
};
