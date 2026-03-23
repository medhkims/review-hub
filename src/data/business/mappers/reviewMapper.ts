import { ReviewModel } from '../models/reviewModel';
import { ReviewEntity } from '@/domain/business/entities/reviewEntity';

export class ReviewMapper {
  static toEntity(model: ReviewModel): ReviewEntity {
    return {
      id: model.id,
      authorId: model.user_id,
      authorName: model.author_name ?? `User ${model.user_id.slice(0, 6)}`,
      authorAvatarUrl: model.author_avatar_url ?? null,
      rating: model.overall_rating,
      text: model.review_text ?? '',
      photoUrls: model.photo_urls ?? [],
      createdAt: model.created_at.toDate(),
      likeCount: model.like_count ?? 0,
      viewCount: model.view_count ?? 0,
      commentCount: model.comment_count ?? 0,
      isLikedByCurrentUser: model.is_liked_by_current_user ?? false,
      dislikeCount: model.dislike_count ?? 0,
      isDislikedByCurrentUser: model.is_disliked_by_current_user ?? false,
    };
  }
}
