import { CategoryRepository } from '../repositories/categoryRepository';
import { CategoryEntity } from '../entities/categoryEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class GetCategoriesForAdminUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(): Promise<Either<Failure, CategoryEntity[]>> {
    return this.categoryRepository.getCategoriesForAdmin();
  }
}
