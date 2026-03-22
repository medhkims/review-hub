import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';
import { FaqEntity } from '../entities/faqEntity';
import { FaqRepository } from '../repositories/faqRepository';

export class UpdateFaqUseCase {
  constructor(private readonly faqRepository: FaqRepository) {}

  async execute(id: string, question: string, answer: string, order: number): Promise<Either<Failure, FaqEntity>> {
    return this.faqRepository.updateFaq(id, question, answer, order);
  }
}
