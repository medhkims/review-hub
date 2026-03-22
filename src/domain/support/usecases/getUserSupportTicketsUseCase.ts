import { SupportTicketRepository } from '../repositories/supportTicketRepository';
import { SupportTicketEntity } from '../entities/supportTicketEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class GetUserSupportTicketsUseCase {
  constructor(private readonly repo: SupportTicketRepository) {}

  async execute(userId: string): Promise<Either<Failure, SupportTicketEntity[]>> {
    return this.repo.getUserSupportTickets(userId);
  }
}
