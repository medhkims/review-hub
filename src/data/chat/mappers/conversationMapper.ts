import { ConversationModel } from '../models/conversationModel';
import { ConversationEntity } from '@/domain/chat/entities/conversationEntity';

export class ConversationMapper {
  static toEntity(model: ConversationModel): ConversationEntity {
    return {
      id: model.id,
      participantIds: model.participant_ids,
      lastMessage: model.last_message,
      lastMessageAt: model.last_message_at.toDate(),
      unreadCount: model.unread_count,
    };
  }
}
