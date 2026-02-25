import { CategoryRepository } from '../repositories/categoryRepository';
import { CategoryEntity } from '../entities/categoryEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class GetCategoriesUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(): Promise<Either<Failure, CategoryEntity[]>> {
    return this.categoryRepository.getCategories();
  }
}
