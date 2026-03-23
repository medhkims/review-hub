import { SupportTicketEntity } from '../entities/supportTicketEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export interface SupportTicketRepository {
  submitSupportTicket(
    subject: string,
    message: string,
    category: string,
    userId: string,
    userEmail: string,
    userName: string,
  ): Promise<Either<Failure, SupportTicketEntity>>;
  getUserSupportTickets(userId: string): Promise<Either<Failure, SupportTicketEntity[]>>;
  getAllSupportTickets(): Promise<Either<Failure, SupportTicketEntity[]>>;
  replyToSupportTicket(
    ticketId: string,
    adminReply: string,
    status: string,
  ): Promise<Either<Failure, void>>;
}
