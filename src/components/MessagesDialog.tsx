import React, { useEffect } from 'react';
import { ArrowLeft, MessageCircle, X } from 'lucide-react';
import { MerchantMessage, MerchantProfile } from '../types/contracts';
import { conversationThread, listConversations } from '../lib/messages';
import { ConversationView } from './ConversationView';
import { Modal } from './Modal';

export interface MessageContext {
  offerId: string;
  offerHeadline: string;
}

interface MessagesDialogProps {
  userId: string;
  messages: MerchantMessage[];
  merchants: MerchantProfile[];
  /** Open straight into this merchant's conversation (e.g. from a postcard); null shows the list. */
  merchantId: string | null;
  /** Postcard context attached to a new conversation. */
  context: MessageContext | null;
  onSelectMerchant: (merchantId: string | null) => void;
  onSend: (merchantId: string, body: string, context: MessageContext | null) => void;
  onMarkRead: (merchantId: string) => void;
  onClose: () => void;
}

export const MessagesDialog: React.FC<MessagesDialogProps> = ({
  userId,
  messages,
  merchants,
  merchantId,
  context,
  onSelectMerchant,
  onSend,
  onMarkRead,
  onClose,
}) => {
  const merchant = merchantId ? merchants.find((m) => m.id === merchantId) ?? null : null;
  const thread = merchant ? conversationThread(messages, merchant.id, userId) : [];
  const unreadInThread = thread.some((m) => m.from === 'merchant' && !m.readByRecipient);

  // Opening a conversation marks the merchant's replies as read.
  useEffect(() => {
    if (merchant && unreadInThread) onMarkRead(merchant.id);
  }, [merchant, unreadInThread, onMarkRead]);

  const conversations = listConversations(messages, { role: 'user', userId });
  const businessName = (id: string) => merchants.find((m) => m.id === id)?.businessName ?? 'Merchant';

  return (
    <Modal titleId="messages-dialog-title" onClose={onClose} testId="messages-dialog">
      <div className="flex items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2 min-w-0">
          {merchant && (
            <button
              type="button"
              onClick={() => onSelectMerchant(null)}
              aria-label="Back to all conversations"
              data-testid="messages-back-btn"
              className="w-8 h-8 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="min-w-0">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-600">Messages</span>
            <h3 id="messages-dialog-title" className="text-lg font-extrabold text-slate-900 dark:text-white truncate">
              {merchant ? merchant.businessName : 'Your conversations'}
            </h3>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close messages"
          data-testid="close-messages-dialog-btn"
          className="w-8 h-8 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {merchant ? (
        <>
          <ConversationView
            thread={thread}
            viewerRole="user"
            counterpartName={merchant.businessName}
            contextHeadline={thread.find((m) => m.offerHeadline)?.offerHeadline ?? context?.offerHeadline}
            onSend={(body) => onSend(merchant.id, body, thread.length === 0 ? context : null)}
            idPrefix="user-chat"
          />
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            {merchant.businessName} sees your name only — your phone, email and Telegram stay private.
          </p>
        </>
      ) : conversations.length === 0 ? (
        <p className="text-sm text-slate-600 dark:text-slate-400">
          No conversations yet. Tap <strong>Message</strong> on any merchant postcard to start one.
        </p>
      ) : (
        <ul className="space-y-2" data-testid="messages-conversation-list">
          {conversations.map((conversation) => (
            <li key={conversation.merchantId}>
              <button
                type="button"
                onClick={() => onSelectMerchant(conversation.merchantId)}
                data-testid={`messages-open-${conversation.merchantId}`}
                className="w-full text-left p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-amber-400 flex items-start gap-3"
              >
                <MessageCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                      {businessName(conversation.merchantId)}
                    </span>
                    {conversation.unread > 0 && (
                      <span className="shrink-0 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-rose-600 text-white">
                        {conversation.unread} new
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                    {conversation.lastMessage.from === 'user' ? 'You: ' : ''}
                    {conversation.lastMessage.body}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
};
