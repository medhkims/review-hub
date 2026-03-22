import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';
import { FaqRepository } from '../repositories/faqRepository';

export class DeleteFaqUseCase {
  constructor(private readonly faqRepository: FaqRepository) {}

  async execute(id: string): Promise<Either<Failure, void>> {
    return this.faqRepository.deleteFaq(id);
  }
}
