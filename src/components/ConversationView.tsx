import React, { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { MerchantMessage, MessageFormSchema } from '../types/contracts';

interface ConversationViewProps {
  thread: MerchantMessage[];
  /** Whose messages are "mine" (right-aligned). */
  viewerRole: 'user' | 'merchant';
  counterpartName: string;
  /** The postcard the conversation is about. */
  contextHeadline?: string;
  onSend: (body: string) => void;
  idPrefix: string;
}

const formatTime = (iso: string) =>
  new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export const ConversationView: React.FC<ConversationViewProps> = ({
  thread,
  viewerRole,
  counterpartName,
  contextHeadline,
  onSend,
  idPrefix,
}) => {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Keep the newest message in view (scrolls the thread only, not the page).
  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTop = list.scrollHeight;
  }, [thread.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = MessageFormSchema.safeParse({ body: draft });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || 'Write a message first');
      return;
    }
    onSend(parsed.data.body);
    setDraft('');
  };

  return (
    <div className="space-y-3">
      {contextHeadline && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          📮 About: <span className="font-bold text-slate-700 dark:text-slate-300">{contextHeadline}</span>
        </p>
      )}
      <div
        ref={listRef}
        role="log"
        aria-live="polite"
        aria-label={`Conversation with ${counterpartName}`}
        data-testid={`${idPrefix}-thread`}
        className="max-h-72 overflow-y-auto space-y-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
      >
        {thread.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Start the conversation — {counterpartName} will reply here.
          </p>
        ) : (
          thread.map((message) => {
            const mine = message.from === viewerRole;
            return (
              <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                    mine
                      ? 'bg-[#0F2557] text-white rounded-br-md'
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-md'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{message.body}</p>
                  <p className={`mt-1 text-[10px] ${mine ? 'text-blue-200' : 'text-slate-400'}`}>
                    {mine ? 'You' : counterpartName} · {formatTime(message.sentAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        <label htmlFor={`${idPrefix}-reply`} className="sr-only">
          Message to {counterpartName}
        </label>
        <textarea
          id={`${idPrefix}-reply`}
          rows={2}
          maxLength={1000}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            // Enter sends; Shift+Enter adds a new line.
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
          placeholder={`Message ${counterpartName}…`}
          data-testid={`${idPrefix}-reply-input`}
          className="flex-1 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
        />
        <button
          type="submit"
          aria-label="Send message"
          data-testid={`${idPrefix}-send-btn`}
          className="h-10 px-4 rounded-xl bg-[#0F2557] dark:bg-amber-500 text-amber-300 dark:text-slate-950 text-xs font-extrabold flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" /> Send
        </button>
      </form>
      {error && (
        <div role="alert" className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-300 p-2 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
};
