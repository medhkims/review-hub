import { TicketRepository } from '@/domain/ticket/repositories/ticketRepository';
import { TicketEntity, TicketStatus } from '@/domain/ticket/entities/ticketEntity';
import { TicketRemoteDataSource } from '../datasources/ticketRemoteDataSource';
import { TicketMapper } from '../mappers/ticketMapper';
import { Either, left, right } from '@/core/types/either';
import { Failure, ServerFailure } from '@/core/error/failures';
import { ServerException } from '@/core/error/exceptions';

const STATUS_MAP: Record<TicketStatus, string> = {
  OPEN:        'pending',
  IN_PROGRESS: 'in_progress',
  RESOLVED:    'resolved',
  CLOSED:      'closed',
};

export class TicketRepositoryImpl implements TicketRepository {
  constructor(private readonly remote: TicketRemoteDataSource) {}

  async getTickets(): Promise<Either<Failure, TicketEntity[]>> {
    try {
      const models = await this.remote.getTickets();
      return right(models.map(TicketMapper.toEntity));
    } catch (error) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      return left(new ServerFailure('Failed to fetch tickets'));
    }
  }

  async updateTicketStatus(
    ticketId: string,
    status: TicketStatus,
    assignee?: { id: string; name: string; role: 'admin' | 'moderator' },
  ): Promise<Either<Failure, void>> {
    try {
      await this.remote.updateTicketStatus(ticketId, STATUS_MAP[status], assignee);
      return right(undefined);
    } catch (error) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      return left(new ServerFailure('Failed to update ticket status'));
    }
  }
}
