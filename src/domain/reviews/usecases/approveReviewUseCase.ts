import { ReviewRepository } from '../repositories/reviewRepository';
import { NotificationRepository } from '@/domain/notifications/repositories/notificationRepository';
import { Either, right } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export interface ApproveReviewParams {
  reviewId: string;
  userId: string;
  businessName: string;
}

export class ApproveReviewUseCase {
  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(params: ApproveReviewParams): Promise<Either<Failure, void>> {
    const result = await this.reviewRepository.approveReview(params.reviewId);
    if (result.isRight()) {
      this.notificationRepository.createNotification({
        userId: params.userId,
        type: 'review_approved',
        title: 'Review Published',
        body: `Your review for "${params.businessName}" has been approved and is now live!`,
        referenceId: params.reviewId,
        referenceType: 'review',
        imageUrl: null,
      });
    }
    return result.isRight() ? right(undefined) : result;
  }
}
