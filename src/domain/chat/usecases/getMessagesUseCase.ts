import { ChatRepository } from '../repositories/chatRepository';
import { MessageEntity } from '../entities/messageEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class GetMessagesUseCase {
  constructor(private readonly chatRepository: ChatRepository) {}

  async execute(conversationId: string): Promise<Either<Failure, MessageEntity[]>> {
    return this.chatRepository.getMessages(conversationId);
  }
}
