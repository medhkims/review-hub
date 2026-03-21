import { TicketRepository } from '../repositories/ticketRepository';
import { TicketEntity } from '../entities/ticketEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class GetTicketsUseCase {
  constructor(private readonly ticketRepository: TicketRepository) {}

  async execute(): Promise<Either<Failure, TicketEntity[]>> {
    return this.ticketRepository.getTickets();
  }
}
