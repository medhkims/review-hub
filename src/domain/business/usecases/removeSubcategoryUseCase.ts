import { CategoryRepository } from '../repositories/categoryRepository';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class RemoveSubcategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(categoryId: string, subcategoryId: string): Promise<Either<Failure, void>> {
    return this.categoryRepository.removeSubcategory(categoryId, subcategoryId);
  }
}
