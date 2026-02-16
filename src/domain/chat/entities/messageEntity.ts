export interface MessageEntity {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: Date;
  isPending: boolean;
}
