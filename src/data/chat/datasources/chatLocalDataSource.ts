import { ConversationModel } from '../models/conversationModel';
import { MessageModel } from '../models/messageModel';

export interface ChatLocalDataSource {
  getCachedConversations(): Promise<ConversationModel[]>;
  getCachedMessages(conversationId: string): Promise<MessageModel[]>;
  cacheConversations(conversations: ConversationModel[]): Promise<void>;
  cacheMessages(conversationId: string, messages: MessageModel[]): Promise<void>;
}

export class ChatLocalDataSourceImpl implements ChatLocalDataSource {
  // TODO: Implement local caching for offline queue support

  async getCachedConversations(): Promise<ConversationModel[]> {
    return [];
  }

  async getCachedMessages(_conversationId: string): Promise<MessageModel[]> {
    return [];
  }

  async cacheConversations(_conversations: ConversationModel[]): Promise<void> {
    // No-op for now
  }

  async cacheMessages(
    _conversationId: string,
    _messages: MessageModel[],
  ): Promise<void> {
    // No-op for now
  }
}
