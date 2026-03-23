import { BusinessRepository } from '../repositories/businessRepository';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';
import { NotificationRepository } from '@/domain/notifications/repositories/notificationRepository';

export interface LikeReplyNotifContext {
  replyAuthorId: string;
  actorId: string;
  actorName: string;
  reviewId: string;
}

export class LikeReplyUseCase {
  constructor(
    private readonly businessRepository: BusinessRepository,
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(replyId: string, notif?: LikeReplyNotifContext): Promise<Either<Failure, void>> {
    const result = await this.businessRepository.likeReply(replyId);
    if (result.isRight() && notif && notif.actorId !== notif.replyAuthorId && notif.replyAuthorId) {
      this.notificationRepository.createNotification({
        userId: notif.replyAuthorId,
        type: 'reply_like',
        title: 'Someone Liked Your Answer',
        body: `${notif.actorName} liked your answer`,
        referenceId: notif.reviewId,
        referenceType: 'review',
      });
    }
    return result;
  }
}
