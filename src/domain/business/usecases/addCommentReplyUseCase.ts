import { BusinessRepository } from '../repositories/businessRepository';
import { ReplyEntity } from '../entities/commentEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';
import { NotificationRepository } from '@/domain/notifications/repositories/notificationRepository';

export interface AddCommentReplyNotifContext {
  commentAuthorId: string;
  actorId: string;
  actorName: string;
  businessName: string;
}

export class AddCommentReplyUseCase {
  constructor(
    private readonly businessRepository: BusinessRepository,
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(
    commentId: string,
    reviewId: string,
    text: string,
    replyingToName?: string,
    notif?: AddCommentReplyNotifContext,
  ): Promise<Either<Failure, ReplyEntity>> {
    const result = await this.businessRepository.addCommentReply(commentId, reviewId, text, replyingToName);
    if (result.isRight() && notif && notif.actorId !== notif.commentAuthorId && notif.commentAuthorId) {
      this.notificationRepository.createNotification({
        userId: notif.commentAuthorId,
        type: 'comment_reply',
        title: 'New Reply to Your Comment',
        body: `${notif.actorName} replied to your comment on ${notif.businessName}`,
        referenceId: reviewId,
        referenceType: 'review',
      });
    }
    return result;
  }
}
