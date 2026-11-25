import React from 'react';
import { Coins, Loader2, LockKeyhole, Infinity as InfinityIcon } from 'lucide-react';
import { TOKEN_PACKS, TokenPack, tokenPackPriceUsd } from '../lib/tokens';

interface TokenPacksProps {
  /** Signed in with Google (a supporter). */
  isSupporter: boolean;
  /** Live balance; null while unknown (signed out, loading, or the wallet can't be read yet). */
  balance: number | null;
  busyPack: TokenPack | null;
  error: string | null;
  onBuy: (pack: TokenPack) => void;
}

// One word each, so all three packs line up on a phone (every pack is US$1 a token).
const PACK_TAGLINES: Record<TokenPack, string> = {
  10: 'Starter',
  50: 'Popular',
  100: 'Champion',
};

/** Front-page token packs — visible before logging in; buying starts with a Google log-in. */
export const TokenPacks: React.FC<TokenPacksProps> = ({ isSupporter, balance, busyPack, error, onBuy }) => (
  <section
    id="tokens"
    aria-labelledby="tokens-heading"
    data-agent-id="token-packs"
    data-testid="token-packs"
    className="scroll-mt-40 rounded-3xl bg-gradient-to-br from-[#0F2557] via-[#1E3A8A] to-[#7F1D1D] text-white p-4 sm:p-6 shadow-xl border border-amber-400/40 space-y-4"
  >
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="space-y-1">
        <h2 id="tokens-heading" className="text-lg sm:text-2xl font-extrabold tracking-tight flex items-center gap-2">
          <Coins className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300" aria-hidden="true" />
          Supporter Tokens
        </h2>
        <p className="text-xs sm:text-sm text-blue-100">
          <strong className="text-amber-300">1 token = US$1</strong> · buy 10, 50 or 100 ·{' '}
          <span className="inline-flex items-center gap-1 font-bold text-amber-200">
            <InfinityIcon className="w-3.5 h-3.5" aria-hidden="true" /> tokens never expire
          </span>
        </p>
      </div>
      {isSupporter && (
        <div
          data-testid="token-balance"
          className="rounded-2xl bg-white/10 border border-amber-300/40 px-3 py-2 text-right"
        >
          <span className="block text-[10px] font-extrabold uppercase tracking-widest text-amber-200">
            Your balance
          </span>
          <span className="text-lg font-extrabold tabular-nums text-amber-300">
            {balance === null ? '—' : `${balance.toLocaleString('en-US')} token${balance === 1 ? '' : 's'}`}
          </span>
        </div>
      )}
    </div>

    <div className="grid grid-cols-3 gap-2 sm:gap-4" role="group" aria-label="Token packs">
      {TOKEN_PACKS.map((pack) => {
        const busy = busyPack === pack;
        const price = tokenPackPriceUsd(pack);
        return (
          <button
            key={pack}
            type="button"
            onClick={() => onBuy(pack)}
            disabled={busyPack !== null}
            aria-label={`Buy ${pack} tokens for US$${price}`}
            data-agent-id={`buy-tokens-${pack}`}
            data-testid={`buy-tokens-${pack}`}
            className={`relative rounded-2xl bg-[#FFFDF7] text-slate-900 p-2.5 sm:p-4 text-center shadow-lg border-2 transition-all hover:-translate-y-0.5 hover:shadow-2xl disabled:hover:translate-y-0 disabled:opacity-80 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300 ${
              pack === 50 ? 'border-amber-400' : 'border-transparent'
            }`}
          >
            <span className="block text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-rose-700">
              {PACK_TAGLINES[pack]}
            </span>
            <span className="block text-2xl sm:text-4xl font-extrabold tabular-nums text-[#0F2557] leading-tight">
              {pack}
            </span>
            <span className="block text-[10px] sm:text-xs font-bold text-slate-500">tokens</span>
            <span className="mt-1.5 sm:mt-2 inline-flex items-center justify-center gap-1 w-full h-8 sm:h-9 rounded-xl bg-[#0F2557] text-amber-300 text-xs sm:text-sm font-extrabold">
              {busy ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                  <span className="sr-only sm:not-sr-only">Opening…</span>
                </>
              ) : (
                <>Buy ${price}</>
              )}
            </span>
          </button>
        );
      })}
    </div>

    {error && (
      <p role="alert" data-testid="token-error" className="text-xs font-bold text-amber-100 bg-rose-900/60 border border-rose-300/40 rounded-xl px-3 py-2">
        {error}
      </p>
    )}

    <p className="text-[10px] sm:text-[11px] text-blue-100/90 flex items-start gap-1.5">
      <LockKeyhole className="w-3.5 h-3.5 shrink-0 mt-px text-amber-300" aria-hidden="true" />
      <span>
        Secure checkout by Stripe — card details never touch this site.{' '}
        {isSupporter
          ? 'Tokens are added to your balance as soon as Stripe confirms the payment.'
          : 'You log in with Google first: your first Google log-in makes you a supporter.'}
      </span>
    </p>
  </section>
);
