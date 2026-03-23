import { SupportTicketRepository } from '../repositories/supportTicketRepository';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';
import { NotificationRepository } from '@/domain/notifications/repositories/notificationRepository';

export interface ReplyToSupportTicketNotifContext {
  userId: string;
  subject: string;
}

export class ReplyToSupportTicketUseCase {
  constructor(
    private readonly supportTicketRepository: SupportTicketRepository,
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(
    ticketId: string,
    adminReply: string,
    status: string,
    notif?: ReplyToSupportTicketNotifContext,
  ): Promise<Either<Failure, void>> {
    const result = await this.supportTicketRepository.replyToSupportTicket(ticketId, adminReply, status);
    if (result.isRight() && notif && notif.userId && adminReply.trim()) {
      this.notificationRepository.createNotification({
        userId: notif.userId,
        type: 'support_reply',
        title: 'Support Has Replied to Your Ticket',
        body: `Your ticket "${notif.subject}" has received a reply`,
        referenceId: ticketId,
        referenceType: 'support_ticket',
      });
    }
    return result;
  }
}
