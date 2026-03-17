import { CategoryRepository } from '../repositories/categoryRepository';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class RecoverCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(categoryId: string, withSubcategories: boolean): Promise<Either<Failure, void>> {
    return this.categoryRepository.recoverCategory(categoryId, withSubcategories);
  }
}
