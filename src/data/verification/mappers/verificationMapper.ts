import { VerificationModel } from '../models/verificationModel';
import { VerificationEntity, VerificationStatus } from '@/domain/verification/entities/verificationEntity';

function deriveStatus(s: string): VerificationStatus {
  switch (s) {
    case 'approved': return 'approved';
    case 'rejected': return 'rejected';
    default:         return 'pending';
  }
}

export class VerificationMapper {
  static toEntity(model: VerificationModel): VerificationEntity {
    return {
      id: model.id,
      userId: model.user_id,
      userEmail: model.user_email,
      userName: model.user_name,
      fullName: model.full_name,
      phoneNumber: model.phone_number,
      idCardUrl: model.id_card_url,
      status: deriveStatus(model.status),
      submittedAt: model.submitted_at?.toDate?.() ?? new Date(),
      reviewedAt: model.reviewed_at?.toDate?.() ?? null,
      reviewedBy: model.reviewed_by,
      rejectionReason: model.rejection_reason,
    };
  }
}
