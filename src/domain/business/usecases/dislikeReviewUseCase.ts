import { BusinessRepository } from '../repositories/businessRepository';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';
import { NotificationRepository } from '@/domain/notifications/repositories/notificationRepository';

export interface DislikeReviewNotifContext {
  reviewAuthorId: string;
  actorId: string;
  actorName: string;
  businessName: string;
}

export class DislikeReviewUseCase {
  constructor(
    private readonly businessRepository: BusinessRepository,
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(reviewId: string, notif?: DislikeReviewNotifContext): Promise<Either<Failure, void>> {
    const result = await this.businessRepository.dislikeReview(reviewId);
    if (result.isRight() && notif && notif.actorId !== notif.reviewAuthorId && notif.reviewAuthorId) {
      this.notificationRepository.createNotification({
        userId: notif.reviewAuthorId,
        type: 'review_dislike',
        title: 'Someone Disliked Your Review',
        body: `${notif.actorName} disliked your review for ${notif.businessName}`,
        referenceId: reviewId,
        referenceType: 'review',
      });
    }
    return result;
  }
}
