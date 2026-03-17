import { ReviewRepository } from '../repositories/reviewRepository';
import { NotificationRepository } from '@/domain/notifications/repositories/notificationRepository';
import { Either, right } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export interface RejectReviewParams {
  reviewId: string;
  userId: string;
  businessName: string;
}

export class RejectReviewUseCase {
  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(params: RejectReviewParams): Promise<Either<Failure, void>> {
    const result = await this.reviewRepository.rejectReview(params.reviewId);
    if (result.isRight()) {
      this.notificationRepository.createNotification({
        userId: params.userId,
        type: 'review_rejected',
        title: 'Review Not Published',
        body: `Your review for "${params.businessName}" was not approved at this time.`,
        referenceId: params.reviewId,
        referenceType: 'review',
        imageUrl: null,
      });
    }
    return result.isRight() ? right(undefined) : result;
  }
}
