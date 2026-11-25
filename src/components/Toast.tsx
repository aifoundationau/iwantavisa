import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ToastMessage {
  /** Changes for every new message (restarts the timer). */
  id: number;
  tone: 'success' | 'info';
  text: string;
}

const TONE_CLASS: Record<ToastMessage['tone'], string> = {
  success: 'bg-emerald-700 border-emerald-300/50',
  info: 'bg-[#0F2557] border-amber-400/50',
};

/**
 * A short notice above the footer bar; it dismisses itself after 9 seconds. The live region stays
 * mounted (empty) so screen readers announce each new message.
 */
export const Toast: React.FC<{ message: ToastMessage | null; onDismiss: () => void }> = ({ message, onDismiss }) => {
  const messageId = message?.id;
  useEffect(() => {
    if (messageId === undefined) return;
    const timer = window.setTimeout(onDismiss, 9000);
    return () => window.clearTimeout(timer);
  }, [messageId, onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[70] w-[calc(100%-1.5rem)] max-w-md pointer-events-none"
    >
      {message && (
        <div
          data-testid="toast"
          className={`pointer-events-auto rounded-2xl border shadow-2xl text-white text-xs sm:text-sm font-bold px-4 py-3 flex items-start gap-3 ${TONE_CLASS[message.tone]}`}
        >
          <span className="flex-1">{message.text}</span>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss"
            data-testid="toast-dismiss-btn"
            className="shrink-0 w-6 h-6 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
