import { BusinessRepository } from '../repositories/businessRepository';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';
import { NotificationRepository } from '@/domain/notifications/repositories/notificationRepository';

export interface DislikeReplyNotifContext {
  replyAuthorId: string;
  actorId: string;
  actorName: string;
  reviewId: string;
}

export class DislikeReplyUseCase {
  constructor(
    private readonly businessRepository: BusinessRepository,
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(replyId: string, notif?: DislikeReplyNotifContext): Promise<Either<Failure, void>> {
    const result = await this.businessRepository.dislikeReply(replyId);
    if (result.isRight() && notif && notif.actorId !== notif.replyAuthorId && notif.replyAuthorId) {
      this.notificationRepository.createNotification({
        userId: notif.replyAuthorId,
        type: 'reply_dislike',
        title: 'Someone Disliked Your Answer',
        body: `${notif.actorName} disliked your answer`,
        referenceId: notif.reviewId,
        referenceType: 'review',
      });
    }
    return result;
  }
}
