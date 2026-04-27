import { WeeklyPickModel } from '../models/weeklyPickModel';
import { WeeklyPickEntity } from '@/domain/weeklyPicks/entities/weeklyPickEntity';

export class WeeklyPickMapper {
  static toEntity(model: WeeklyPickModel): WeeklyPickEntity {
    return {
      id: model.id,
      businessId: model.business_id,
      businessName: model.business_name,
      businessLogoUrl: model.business_logo_url,
      businessCoverUrl: model.business_cover_url,
      businessRating: model.business_rating,
      businessReviewCount: model.business_review_count,
      categoryName: model.category_name,
      pickReason: model.pick_reason,
      weekStartDate: model.week_start_date.toDate(),
      createdAt: model.created_at.toDate(),
    };
  }
}
