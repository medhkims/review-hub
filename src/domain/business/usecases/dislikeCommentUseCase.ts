import { BusinessRepository } from '../repositories/businessRepository';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';
import { NotificationRepository } from '@/domain/notifications/repositories/notificationRepository';

export interface DislikeCommentNotifContext {
  commentAuthorId: string;
  actorId: string;
  actorName: string;
  reviewId: string;
}

export class DislikeCommentUseCase {
  constructor(
    private readonly businessRepository: BusinessRepository,
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(commentId: string, notif?: DislikeCommentNotifContext): Promise<Either<Failure, void>> {
    const result = await this.businessRepository.dislikeComment(commentId);
    if (result.isRight() && notif && notif.actorId !== notif.commentAuthorId && notif.commentAuthorId) {
      this.notificationRepository.createNotification({
        userId: notif.commentAuthorId,
        type: 'comment_dislike',
        title: 'Someone Disliked Your Comment',
        body: `${notif.actorName} disliked your comment`,
        referenceId: notif.reviewId,
        referenceType: 'review',
      });
    }
    return result;
  }
}
