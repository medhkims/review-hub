import { PostModel } from '../models/postModel';
import { PostEntity } from '@/domain/feed/entities/postEntity';

export class PostMapper {
  static toEntity(model: PostModel, isLiked: boolean): PostEntity {
    return {
      id: model.id,
      authorId: model.author_id,
      authorName: model.author_name,
      authorAvatarUrl: model.author_avatar_url,
      content: model.content,
      imageUrl: model.image_url,
      likesCount: model.likes_count,
      commentsCount: model.comments_count,
      isLiked,
      createdAt: model.created_at.toDate(),
    };
  }
}
