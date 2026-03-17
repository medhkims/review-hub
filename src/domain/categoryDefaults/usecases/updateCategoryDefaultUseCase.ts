import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';
import { CategoryDefaultRepository, UpdateCategoryDefaultParams } from '../repositories/categoryDefaultRepository';
import { CategoryDefaultEntity } from '../entities/categoryDefaultEntity';

export class UpdateCategoryDefaultUseCase {
  constructor(private readonly repository: CategoryDefaultRepository) {}

  async execute(
    categoryId: string,
    params: UpdateCategoryDefaultParams,
  ): Promise<Either<Failure, CategoryDefaultEntity>> {
    return this.repository.updateCategoryDefault(categoryId, params);
  }
}
