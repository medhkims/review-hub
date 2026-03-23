import { BusinessRepository } from '../repositories/businessRepository';
import { CommentEntity } from '../entities/commentEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';
import { NotificationRepository } from '@/domain/notifications/repositories/notificationRepository';

export interface AddReviewCommentNotifContext {
  reviewAuthorId: string;
  actorId: string;
  actorName: string;
  businessName: string;
}

export class AddReviewCommentUseCase {
  constructor(
    private readonly businessRepository: BusinessRepository,
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(
    reviewId: string,
    text: string,
    notif?: AddReviewCommentNotifContext,
  ): Promise<Either<Failure, CommentEntity>> {
    const result = await this.businessRepository.addReviewComment(reviewId, text);
    if (result.isRight() && notif && notif.actorId !== notif.reviewAuthorId && notif.reviewAuthorId) {
      this.notificationRepository.createNotification({
        userId: notif.reviewAuthorId,
        type: 'review_comment',
        title: 'New Comment on Your Review',
        body: `${notif.actorName} commented on your review for ${notif.businessName}`,
        referenceId: reviewId,
        referenceType: 'review',
      });
    }
    return result;
  }
}
