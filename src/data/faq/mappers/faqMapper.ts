import { FaqModel } from '../models/faqModel';
import { FaqAudience, FaqEntity } from '@/domain/faq/entities/faqEntity';

const VALID_AUDIENCES: FaqAudience[] = ['user', 'business', 'moderator'];
const ALL_AUDIENCES: FaqAudience[] = ['user', 'business', 'moderator'];

function normaliseAudience(raw: string | string[]): FaqAudience[] {
  if (Array.isArray(raw)) {
    const filtered = raw.filter((a): a is FaqAudience => VALID_AUDIENCES.includes(a as FaqAudience));
    return filtered.length > 0 ? filtered : ALL_AUDIENCES;
  }
  // backward compat: old single-string values
  if (raw === 'all') return ALL_AUDIENCES;
  if (VALID_AUDIENCES.includes(raw as FaqAudience)) return [raw as FaqAudience];
  return ALL_AUDIENCES;
}

export class FaqMapper {
  static toEntity(model: FaqModel): FaqEntity {
    return {
      id: model.id,
      question: model.question,
      answer: model.answer,
      order: model.order,
      audience: normaliseAudience(model.audience),
      isActive: model.is_active,
      createdAt: model.created_at.toDate(),
      updatedAt: model.updated_at.toDate(),
    };
  }
}
