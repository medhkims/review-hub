import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';
import { CategoryDefaultRepository } from '../repositories/categoryDefaultRepository';
import { CategoryDefaultEntity } from '../entities/categoryDefaultEntity';

export class GetCategoryDefaultsUseCase {
  constructor(private readonly repository: CategoryDefaultRepository) {}

  async execute(): Promise<Either<Failure, CategoryDefaultEntity[]>> {
    return this.repository.getCategoryDefaults();
  }
}
