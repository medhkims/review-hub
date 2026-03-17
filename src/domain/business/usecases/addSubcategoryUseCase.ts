import { CategoryRepository } from '../repositories/categoryRepository';
import { SubcategoryEntity } from '../entities/subcategoryEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class AddSubcategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(categoryId: string, name: string): Promise<Either<Failure, SubcategoryEntity>> {
    return this.categoryRepository.addSubcategory(categoryId, name);
  }
}
