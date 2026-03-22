import { FaqModel } from '../models/faqModel';
import { FaqEntity } from '@/domain/faq/entities/faqEntity';

export class FaqMapper {
  static toEntity(model: FaqModel): FaqEntity {
    return {
      id: model.id,
      question: model.question,
      answer: model.answer,
      order: model.order,
      isActive: model.is_active,
      createdAt: model.created_at.toDate(),
      updatedAt: model.updated_at.toDate(),
    };
  }
}
