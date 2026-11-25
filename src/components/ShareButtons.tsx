import React, { useEffect, useState } from 'react';
import {
  Check,
  Facebook,
  Link2,
  Linkedin,
  Mail,
  MessageCircle,
  Send,
  Share2,
} from 'lucide-react';
import { buildShareTargetUrl, copyToClipboard, ShareTarget } from '../lib/share';

interface ShareButtonsProps {
  /** Link back into the web app (see buildOfferShareUrl). */
  url: string;
  title: string;
  text: string;
  idPrefix: string;
}

const XLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" className={className}>
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);

const SHARE_TARGETS: {
  id: ShareTarget;
  label: string;
  actionLabel: string;
  icon: React.ReactNode;
}[] = [
  {
    id: 'facebook',
    label: 'Facebook',
    actionLabel: 'Share on Facebook',
    icon: <Facebook className="w-3.5 h-3.5 text-[#1877F2]" />,
  },
  {
    id: 'x',
    label: 'X',
    actionLabel: 'Share on X',
    icon: <XLogo className="w-3 h-3 text-black dark:text-white" />,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    actionLabel: 'Share on LinkedIn',
    icon: <Linkedin className="w-3.5 h-3.5 text-[#0A66C2] dark:text-sky-400" />,
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    actionLabel: 'Share on WhatsApp',
    icon: <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />,
  },
  {
    id: 'telegram',
    label: 'Telegram',
    actionLabel: 'Share on Telegram',
    icon: <Send className="w-3.5 h-3.5 text-[#229ED9]" />,
  },
  {
    id: 'email',
    label: 'Email',
    actionLabel: 'Share by email',
    icon: <Mail className="w-3.5 h-3.5 text-amber-600" />,
  },
];

const PILL_CLASS =
  'inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500';

export const ShareButtons: React.FC<ShareButtonsProps> = ({ url, title, text, idPrefix }) => {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';
  const payload = { url, title, text };

  useEffect(() => {
    if (copyState === 'idle') return;
    const timer = window.setTimeout(() => setCopyState('idle'), 2000);
    return () => window.clearTimeout(timer);
  }, [copyState]);

  const handleCopy = async () => {
    setCopyState((await copyToClipboard(url)) ? 'copied' : 'failed');
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share(payload);
    } catch {
      // Dismissed by the user or blocked — the explicit buttons remain available.
    }
  };

  return (
    <div role="group" aria-label="Share this postcard" className="flex flex-wrap items-center gap-1.5">
      <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 dark:text-slate-400 mr-1">
        Share
      </span>

      {canNativeShare && (
        <button
          type="button"
          onClick={handleNativeShare}
          aria-label="Share using your device"
          title="Share using your device"
          data-agent-id={`share-native-${idPrefix}`}
          data-testid={`share-native-${idPrefix}`}
          className={PILL_CLASS}
        >
          <Share2 className="w-3.5 h-3.5 text-rose-700 dark:text-amber-400" />
          <span>Share…</span>
        </button>
      )}

      {SHARE_TARGETS.map((target) => (
        <a
          key={target.id}
          href={buildShareTargetUrl(target.id, payload)}
          target={target.id === 'email' ? undefined : '_blank'}
          rel="noopener noreferrer"
          aria-label={target.actionLabel}
          title={target.actionLabel}
          data-agent-id={`share-${target.id}-${idPrefix}`}
          data-testid={`share-${target.id}-${idPrefix}`}
          className={PILL_CLASS}
        >
          {target.icon}
          <span className="hidden sm:inline">{target.label}</span>
        </a>
      ))}

      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy link to this postcard"
        title="Copy link"
        data-agent-id={`share-copy-${idPrefix}`}
        data-testid={`share-copy-${idPrefix}`}
        className={PILL_CLASS}
      >
        {copyState === 'copied' ? (
          <Check className="w-3.5 h-3.5 text-emerald-600" />
        ) : (
          <Link2 className="w-3.5 h-3.5 text-slate-500" />
        )}
        <span className={copyState === 'idle' ? 'hidden sm:inline' : undefined}>
          {copyState === 'copied' ? 'Copied!' : copyState === 'failed' ? 'Copy failed' : 'Copy link'}
        </span>
      </button>

      <span aria-live="polite" className="sr-only">
        {copyState === 'copied' ? 'Link copied to clipboard' : copyState === 'failed' ? 'Could not copy the link' : ''}
      </span>
    </div>
  );
};
