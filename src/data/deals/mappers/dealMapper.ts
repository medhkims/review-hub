import { DealModel } from '../models/dealModel';
import { DealEntity } from '@/domain/deals/entities/dealEntity';

export class DealMapper {
  static toEntity(model: DealModel): DealEntity {
    return {
      id: model.id,
      businessId: model.business_id,
      businessName: model.business_name,
      businessLogoUrl: model.business_logo_url,
      businessCoverUrl: model.business_cover_url,
      title: model.title,
      description: model.description,
      discountPercent: model.discount_percent,
      validUntil: model.valid_until.toDate(),
      isActive: model.is_active,
      createdAt: model.created_at.toDate(),
      menuCategoryName: model.menu_category_name,
      originalPrice: model.original_price,
      currency: model.currency,
      maxDiscountPercent: model.max_discount_percent,
      dealCount: model.deal_count,
    };
  }
}
