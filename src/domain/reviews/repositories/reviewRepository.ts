import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';
import { CreateReviewInput } from '../entities/createReviewInput';

export interface ReviewRepository {
  createReview(userId: string, input: CreateReviewInput): Promise<Either<Failure, string>>;
}
