import { CategoryEntity } from '../entities/categoryEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export interface CategoryRepository {
  getCategories(): Promise<Either<Failure, CategoryEntity[]>>;
}
