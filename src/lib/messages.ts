import { MerchantMessage } from '../types/contracts';

export type MessageViewer = { role: 'merchant'; merchantId: string } | { role: 'user'; userId: string };

export interface ConversationSummary {
  merchantId: string;
  userId: string;
  userName: string;
  offerHeadline?: string;
  lastMessage: MerchantMessage;
  /** Messages the viewer hasn't read yet. */
  unread: number;
}

const isForViewer = (message: MerchantMessage, viewer: MessageViewer) =>
  viewer.role === 'merchant' ? message.merchantId === viewer.merchantId : message.userId === viewer.userId;

const isUnreadForViewer = (message: MerchantMessage, viewer: MessageViewer) =>
  !message.readByRecipient && message.from !== viewer.role;

/** The viewer's conversations, most recent activity first. */
export function listConversations(
  messages: MerchantMessage[],
  viewer: MessageViewer
): ConversationSummary[] {
  const byKey = new Map<string, ConversationSummary>();
  for (const message of messages) {
    if (!isForViewer(message, viewer)) continue;
    const key = `${message.merchantId}:${message.userId}`;
    const existing = byKey.get(key);
    const unread = isUnreadForViewer(message, viewer) ? 1 : 0;
    if (!existing) {
      byKey.set(key, {
        merchantId: message.merchantId,
        userId: message.userId,
        userName: message.userName,
        offerHeadline: message.offerHeadline,
        lastMessage: message,
        unread,
      });
      continue;
    }
    existing.unread += unread;
    if (message.sentAt > existing.lastMessage.sentAt) existing.lastMessage = message;
    if (message.offerHeadline) existing.offerHeadline = existing.offerHeadline ?? message.offerHeadline;
  }
  return [...byKey.values()].sort((a, b) => b.lastMessage.sentAt.localeCompare(a.lastMessage.sentAt));
}

/** One conversation, oldest message first. */
export function conversationThread(
  messages: MerchantMessage[],
  merchantId: string,
  userId: string
): MerchantMessage[] {
  return messages
    .filter((m) => m.merchantId === merchantId && m.userId === userId)
    .sort((a, b) => a.sentAt.localeCompare(b.sentAt));
}

export function unreadCount(messages: MerchantMessage[], viewer: MessageViewer): number {
  return messages.filter((m) => isForViewer(m, viewer) && isUnreadForViewer(m, viewer)).length;
}

/** Marks the other party's messages in a conversation as read; returns the same array if nothing changed. */
export function markConversationRead(
  messages: MerchantMessage[],
  merchantId: string,
  userId: string,
  reader: 'user' | 'merchant'
): MerchantMessage[] {
  let changed = false;
  const next = messages.map((m) => {
    if (m.merchantId !== merchantId || m.userId !== userId || m.from === reader || m.readByRecipient) {
      return m;
    }
    changed = true;
    return { ...m, readByRecipient: true };
  });
  return changed ? next : messages;
}
