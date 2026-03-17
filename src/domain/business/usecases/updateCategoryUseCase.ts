import { CategoryRepository } from '../repositories/categoryRepository';
import { CategoryEntity } from '../entities/categoryEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class UpdateCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(
    categoryId: string,
    name: string,
    icon: string,
    logoUri?: string,
  ): Promise<Either<Failure, CategoryEntity>> {
    return this.categoryRepository.updateCategory(categoryId, name, icon, logoUri);
  }
}
