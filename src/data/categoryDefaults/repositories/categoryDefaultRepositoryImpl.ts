import { Either, left, right } from '@/core/types/either';
import { Failure, ServerFailure } from '@/core/error/failures';
import { ServerException } from '@/core/error/exceptions';
import { CategoryDefaultRepository, UpdateCategoryDefaultParams } from '@/domain/categoryDefaults/repositories/categoryDefaultRepository';
import { CategoryDefaultEntity } from '@/domain/categoryDefaults/entities/categoryDefaultEntity';
import { CategoryDefaultRemoteDataSource } from '../datasources/categoryDefaultRemoteDataSource';
import { CategoryDefaultMapper } from '../mappers/categoryDefaultMapper';

export class CategoryDefaultRepositoryImpl implements CategoryDefaultRepository {
  constructor(private readonly remote: CategoryDefaultRemoteDataSource) {}

  async getCategoryDefaults(): Promise<Either<Failure, CategoryDefaultEntity[]>> {
    try {
      const models = await this.remote.getCategoryDefaults();
      return right(models.map(CategoryDefaultMapper.toEntity));
    } catch (error) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      return left(new ServerFailure('Failed to load category defaults'));
    }
  }

  async updateCategoryDefault(
    categoryId: string,
    params: UpdateCategoryDefaultParams,
  ): Promise<Either<Failure, CategoryDefaultEntity>> {
    try {
      const model = await this.remote.updateCategoryDefault(categoryId, params);
      return right(CategoryDefaultMapper.toEntity(model));
    } catch (error) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      return left(new ServerFailure('Failed to update category default'));
    }
  }
}
