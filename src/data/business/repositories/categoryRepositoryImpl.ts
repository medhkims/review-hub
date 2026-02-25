import { CategoryRepository } from '@/domain/business/repositories/categoryRepository';
import { CategoryEntity } from '@/domain/business/entities/categoryEntity';
import { CategoryRemoteDataSource } from '../datasources/categoryRemoteDataSource';
import { CategoryMapper } from '../mappers/categoryMapper';
import { Either, left, right } from '@/core/types/either';
import { Failure, ServerFailure } from '@/core/error/failures';
import { ServerException } from '@/core/error/exceptions';

export class CategoryRepositoryImpl implements CategoryRepository {
  constructor(private readonly remote: CategoryRemoteDataSource) {}

  async getCategories(): Promise<Either<Failure, CategoryEntity[]>> {
    try {
      const models = await this.remote.getCategories();
      const entities = models.map((model, index) => CategoryMapper.toEntity(model, index));
      return right(entities);
    } catch (error) {
      if (error instanceof ServerException) {
        return left(new ServerFailure(error.message));
      }
      return left(new ServerFailure('Failed to fetch categories'));
    }
  }
}
