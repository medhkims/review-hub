import { SupportTicketRepository } from '../repositories/supportTicketRepository';
import { SupportTicketEntity } from '../entities/supportTicketEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class SubmitSupportTicketUseCase {
  constructor(private readonly repo: SupportTicketRepository) {}

  async execute(
    subject: string,
    message: string,
    category: string,
    userId: string,
    userEmail: string,
    userName: string,
  ): Promise<Either<Failure, SupportTicketEntity>> {
    return this.repo.submitSupportTicket(subject, message, category, userId, userEmail, userName);
  }
}
