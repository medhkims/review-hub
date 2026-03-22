import { SupportTicketRepository } from '../repositories/supportTicketRepository';
import { SupportTicketEntity } from '../entities/supportTicketEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class GetAllSupportTicketsUseCase {
  constructor(private readonly repo: SupportTicketRepository) {}

  async execute(): Promise<Either<Failure, SupportTicketEntity[]>> {
    return this.repo.getAllSupportTickets();
  }
}
