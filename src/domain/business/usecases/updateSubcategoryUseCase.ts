import { CategoryRepository } from '../repositories/categoryRepository';
import { SubcategoryEntity } from '../entities/subcategoryEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class UpdateSubcategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(
    categoryId: string,
    subcategoryId: string,
    name: string,
  ): Promise<Either<Failure, SubcategoryEntity>> {
    return this.categoryRepository.updateSubcategory(categoryId, subcategoryId, name);
  }
}
