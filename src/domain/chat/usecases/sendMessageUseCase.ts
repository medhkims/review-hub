import { ChatRepository } from '../repositories/chatRepository';
import { MessageEntity } from '../entities/messageEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class SendMessageUseCase {
  constructor(private readonly chatRepository: ChatRepository) {}

  async execute(conversationId: string, text: string): Promise<Either<Failure, MessageEntity>> {
    return this.chatRepository.sendMessage(conversationId, text);
  }
}
