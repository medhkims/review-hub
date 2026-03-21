import { TicketEntity, TicketStatus } from '../entities/ticketEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export interface TicketRepository {
  getTickets(): Promise<Either<Failure, TicketEntity[]>>;
  updateTicketStatus(
    ticketId: string,
    status: TicketStatus,
    assignee?: { id: string; name: string; role: 'admin' | 'moderator' },
  ): Promise<Either<Failure, void>>;
}
