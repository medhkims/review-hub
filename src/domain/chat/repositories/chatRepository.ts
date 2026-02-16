import { ConversationEntity } from '../entities/conversationEntity';
import { MessageEntity } from '../entities/messageEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export interface ChatRepository {
  getConversations(): Promise<Either<Failure, ConversationEntity[]>>;
  getMessages(conversationId: string): Promise<Either<Failure, MessageEntity[]>>;
  sendMessage(conversationId: string, text: string): Promise<Either<Failure, MessageEntity>>;
}
