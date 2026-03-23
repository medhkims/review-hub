import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';
import { FaqAudience, FaqEntity } from '../entities/faqEntity';
import { FaqRepository } from '../repositories/faqRepository';

export class UpdateFaqUseCase {
  constructor(private readonly faqRepository: FaqRepository) {}

  async execute(id: string, question: string, answer: string, order: number, audience: FaqAudience[]): Promise<Either<Failure, FaqEntity>> {
    return this.faqRepository.updateFaq(id, question, answer, order, audience);
  }
}
