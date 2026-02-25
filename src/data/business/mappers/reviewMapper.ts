import { ReviewModel } from '../models/reviewModel';
import { ReviewEntity } from '@/domain/business/entities/reviewEntity';

export class ReviewMapper {
  static toEntity(model: ReviewModel): ReviewEntity {
    return {
      id: model.id,
      authorId: model.author_id,
      authorName: model.author_name,
      authorAvatarUrl: model.author_avatar_url,
      rating: model.rating,
      text: model.text,
      createdAt: model.created_at.toDate(),
    };
  }
}
