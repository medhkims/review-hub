import { DisputeModel } from '../models/disputeModel';
import { DisputeEntity, DisputeStatus, DisputeReason } from '@/domain/dispute/entities/disputeEntity';

export class DisputeMapper {
  static toEntity(model: DisputeModel): DisputeEntity {
    return {
      id: model.id,
      reviewId: model.review_id,
      businessId: model.business_id,
      businessName: model.business_name,
      reviewAuthorId: model.review_author_id,
      reviewAuthorName: model.review_author_name,
      reviewText: model.review_text,
      reviewRating: model.review_rating,
      disputedById: model.disputed_by_id,
      disputedByName: model.disputed_by_name,
      disputedByEmail: model.disputed_by_email,
      reason: model.reason as DisputeReason,
      explanation: model.explanation,
      evidenceUrls: model.evidence_urls ?? [],
      status: model.status as DisputeStatus,
      adminNotes: model.admin_notes ?? null,
      createdAt: model.created_at?.toDate() ?? new Date(),
      resolvedAt: model.resolved_at?.toDate() ?? null,
      resolvedById: model.resolved_by_id ?? null,
      reviewerNotifiedAt: model.reviewer_notified_at?.toDate() ?? null,
      reviewerResponse: model.reviewer_response ?? null,
    };
  }
}
