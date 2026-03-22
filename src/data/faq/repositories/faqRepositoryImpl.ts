import { FaqRepository } from '@/domain/faq/repositories/faqRepository';
import { FaqEntity } from '@/domain/faq/entities/faqEntity';
import { Either, left, right } from '@/core/types/either';
import { Failure, ServerFailure } from '@/core/error/failures';
import { ServerException } from '@/core/error/exceptions';
import { FaqRemoteDataSource } from '../datasources/faqRemoteDataSource';
import { FaqMapper } from '../mappers/faqMapper';

export class FaqRepositoryImpl implements FaqRepository {
  constructor(private readonly remote: FaqRemoteDataSource) {}

  async getFaqs(): Promise<Either<Failure, FaqEntity[]>> {
    try {
      const models = await this.remote.getFaqs();
      return right(models.map(FaqMapper.toEntity));
    } catch (error) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      return left(new ServerFailure('Failed to fetch FAQs'));
    }
  }

  async getAllFaqs(): Promise<Either<Failure, FaqEntity[]>> {
    try {
      const models = await this.remote.getAllFaqs();
      return right(models.map(FaqMapper.toEntity));
    } catch (error) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      return left(new ServerFailure('Failed to fetch all FAQs'));
    }
  }

  async createFaq(question: string, answer: string, order: number): Promise<Either<Failure, FaqEntity>> {
    try {
      const model = await this.remote.createFaq(question, answer, order);
      return right(FaqMapper.toEntity(model));
    } catch (error) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      return left(new ServerFailure('Failed to create FAQ'));
    }
  }

  async updateFaq(id: string, question: string, answer: string, order: number): Promise<Either<Failure, FaqEntity>> {
    try {
      const model = await this.remote.updateFaq(id, question, answer, order);
      return right(FaqMapper.toEntity(model));
    } catch (error) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      return left(new ServerFailure('Failed to update FAQ'));
    }
  }

  async deleteFaq(id: string): Promise<Either<Failure, void>> {
    try {
      await this.remote.deleteFaq(id);
      return right(undefined);
    } catch (error) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      return left(new ServerFailure('Failed to delete FAQ'));
    }
  }
}
