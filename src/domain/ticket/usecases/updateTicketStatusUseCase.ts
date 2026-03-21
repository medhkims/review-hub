import { TicketRepository } from '../repositories/ticketRepository';
import { TicketStatus } from '../entities/ticketEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class UpdateTicketStatusUseCase {
  constructor(private readonly ticketRepository: TicketRepository) {}

  async execute(
    ticketId: string,
    status: TicketStatus,
    assignee?: { id: string; name: string; role: 'admin' | 'moderator' },
  ): Promise<Either<Failure, void>> {
    return this.ticketRepository.updateTicketStatus(ticketId, status, assignee);
  }
}
