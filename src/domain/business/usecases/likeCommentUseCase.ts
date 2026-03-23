import { BusinessRepository } from '../repositories/businessRepository';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';
import { NotificationRepository } from '@/domain/notifications/repositories/notificationRepository';

export interface LikeCommentNotifContext {
  commentAuthorId: string;
  actorId: string;
  actorName: string;
  reviewId: string;
}

export class LikeCommentUseCase {
  constructor(
    private readonly businessRepository: BusinessRepository,
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(commentId: string, notif?: LikeCommentNotifContext): Promise<Either<Failure, void>> {
    const result = await this.businessRepository.likeComment(commentId);
    if (result.isRight() && notif && notif.actorId !== notif.commentAuthorId && notif.commentAuthorId) {
      this.notificationRepository.createNotification({
        userId: notif.commentAuthorId,
        type: 'comment_like',
        title: 'Someone Liked Your Comment',
        body: `${notif.actorName} liked your comment`,
        referenceId: notif.reviewId,
        referenceType: 'review',
      });
    }
    return result;
  }
}
