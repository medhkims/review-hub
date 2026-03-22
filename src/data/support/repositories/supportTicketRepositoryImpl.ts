import { SupportTicketRepository } from '@/domain/support/repositories/supportTicketRepository';
import { SupportTicketEntity } from '@/domain/support/entities/supportTicketEntity';
import { SupportTicketRemoteDataSource } from '../datasources/supportTicketRemoteDataSource';
import { SupportTicketMapper } from '../mappers/supportTicketMapper';
import { Either, left, right } from '@/core/types/either';
import { Failure, ServerFailure } from '@/core/error/failures';
import { ServerException } from '@/core/error/exceptions';

export class SupportTicketRepositoryImpl implements SupportTicketRepository {
  constructor(private readonly remote: SupportTicketRemoteDataSource) {}

  async submitSupportTicket(
    subject: string,
    message: string,
    category: string,
    userId: string,
    userEmail: string,
    userName: string,
  ): Promise<Either<Failure, SupportTicketEntity>> {
    try {
      const model = await this.remote.submitTicket(subject, message, category, userId, userEmail, userName);
      return right(SupportTicketMapper.toEntity(model));
    } catch (error) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      return left(new ServerFailure('Failed to submit support ticket'));
    }
  }

  async getUserSupportTickets(userId: string): Promise<Either<Failure, SupportTicketEntity[]>> {
    try {
      const models = await this.remote.getUserTickets(userId);
      return right(models.map(SupportTicketMapper.toEntity));
    } catch (error) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      return left(new ServerFailure('Failed to fetch support tickets'));
    }
  }

  async getAllSupportTickets(): Promise<Either<Failure, SupportTicketEntity[]>> {
    try {
      const models = await this.remote.getAllTickets();
      return right(models.map(SupportTicketMapper.toEntity));
    } catch (error) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      return left(new ServerFailure('Failed to fetch all support tickets'));
    }
  }
}
