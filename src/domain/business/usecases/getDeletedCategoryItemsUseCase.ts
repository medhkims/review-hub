import { CategoryRepository, DeletedItemsResult } from '../repositories/categoryRepository';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class GetDeletedCategoryItemsUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(): Promise<Either<Failure, DeletedItemsResult>> {
    return this.categoryRepository.getDeletedItems();
  }
}
