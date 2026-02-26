import { ChatRepository } from '../repositories/chatRepository';
import { ConversationEntity } from '../entities/conversationEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class GetConversationsUseCase {
  constructor(private readonly chatRepository: ChatRepository) {}

  async execute(): Promise<Either<Failure, ConversationEntity[]>> {
    return this.chatRepository.getConversations();
  }
}
