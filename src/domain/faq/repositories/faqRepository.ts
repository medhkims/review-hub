import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';
import { FaqEntity } from '../entities/faqEntity';

export interface FaqRepository {
  getFaqs(): Promise<Either<Failure, FaqEntity[]>>;
  getAllFaqs(): Promise<Either<Failure, FaqEntity[]>>;
  createFaq(question: string, answer: string, order: number): Promise<Either<Failure, FaqEntity>>;
  updateFaq(id: string, question: string, answer: string, order: number): Promise<Either<Failure, FaqEntity>>;
  deleteFaq(id: string): Promise<Either<Failure, void>>;
}
