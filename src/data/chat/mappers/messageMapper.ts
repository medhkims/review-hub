import { MessageModel } from '../models/messageModel';
import { MessageEntity } from '@/domain/chat/entities/messageEntity';

export class MessageMapper {
  static toEntity(model: MessageModel): MessageEntity {
    return {
      id: model.id,
      conversationId: model.conversation_id,
      senderId: model.sender_id,
      text: model.text,
      createdAt: model.created_at.toDate(),
      isPending: model.is_pending,
    };
  }
}
