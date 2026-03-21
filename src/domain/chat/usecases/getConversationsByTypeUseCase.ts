import { ChatRepository } from '../repositories/chatRepository';
import { ConversationEntity, ConversationType } from '../entities/conversationEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class GetConversationsByTypeUseCase {
  constructor(private readonly chatRepository: ChatRepository) {}

  async execute(type: ConversationType): Promise<Either<Failure, ConversationEntity[]>> {
    return this.chatRepository.getConversationsByType(type);
  }
}
