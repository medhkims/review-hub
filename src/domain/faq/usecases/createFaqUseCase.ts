import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';
import { FaqAudience, FaqEntity } from '../entities/faqEntity';
import { FaqRepository } from '../repositories/faqRepository';

export class CreateFaqUseCase {
  constructor(private readonly faqRepository: FaqRepository) {}

  async execute(question: string, answer: string, order: number, audience: FaqAudience[]): Promise<Either<Failure, FaqEntity>> {
    return this.faqRepository.createFaq(question, answer, order, audience);
  }
}
