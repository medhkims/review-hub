export type ConversationType = 'business' | 'moderator';

export interface ConversationEntity {
  id: string;
  participantIds: string[];
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
  conversationType?: ConversationType;
}
