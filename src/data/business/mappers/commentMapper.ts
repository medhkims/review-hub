import { CommentModel, ReplyModel } from '../models/commentModel';
import { CommentEntity, ReplyEntity } from '@/domain/business/entities/commentEntity';

export class CommentMapper {
  static replyToEntity(model: ReplyModel): ReplyEntity {
    return {
      id: model.id,
      commentId: model.comment_id,
      reviewId: model.review_id,
      authorId: model.user_id,
      authorName: model.author_name ?? `User ${model.user_id.slice(0, 6)}`,
      authorAvatarUrl: model.author_avatar_url ?? null,
      text: model.text,
      createdAt: model.created_at.toDate(),
    };
  }

  static toEntity(model: CommentModel, replies: ReplyEntity[] = []): CommentEntity {
    return {
      id: model.id,
      reviewId: model.review_id,
      authorId: model.user_id,
      authorName: model.author_name ?? `User ${model.user_id.slice(0, 6)}`,
      authorAvatarUrl: model.author_avatar_url ?? null,
      text: model.text,
      createdAt: model.created_at.toDate(),
      replyCount: model.reply_count ?? replies.length,
      replies,
    };
  }
}
