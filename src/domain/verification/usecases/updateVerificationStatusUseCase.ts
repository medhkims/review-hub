import { Either, right } from '@/core/types/either';
import { Failure } from '@/core/error/failures';
import { VerificationRepository } from '../repositories/verificationRepository';
import { VerificationStatus } from '../entities/verificationEntity';
import { NotificationRepository } from '@/domain/notifications/repositories/notificationRepository';

export interface UpdateVerificationStatusParams {
  id: string;
  status: VerificationStatus;
  reviewedBy: string;
  userId: string;
  userName: string;
  rejectionReason?: string;
}

export class UpdateVerificationStatusUseCase {
  constructor(
    private readonly verificationRepository: VerificationRepository,
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(params: UpdateVerificationStatusParams): Promise<Either<Failure, void>> {
    const result = await this.verificationRepository.updateVerificationStatus(
      params.id,
      params.status,
      params.reviewedBy,
      params.rejectionReason,
    );

    if (result.isRight()) {
      if (params.status === 'approved') {
        this.notificationRepository.createNotification({
          userId: params.userId,
          type: 'verification_approved',
          title: 'Account Verified',
          body: 'Your identity verification has been approved. Your account is now verified!',
          referenceId: params.id,
          referenceType: 'verification',
          imageUrl: null,
        });
      } else if (params.status === 'rejected') {
        this.notificationRepository.createNotification({
          userId: params.userId,
          type: 'verification_rejected',
          title: 'Verification Rejected',
          body: params.rejectionReason
            ? `Your identity verification was rejected: ${params.rejectionReason}`
            : 'Your identity verification was rejected. Please resubmit with valid documents.',
          referenceId: params.id,
          referenceType: 'verification',
          imageUrl: null,
        });
      }
    }

    return result.isRight() ? right(undefined) : result;
  }
}
