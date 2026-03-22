import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';
import { FaqEntity } from '../entities/faqEntity';
import { FaqRepository } from '../repositories/faqRepository';

export class GetAdminFaqsUseCase {
  constructor(private readonly faqRepository: FaqRepository) {}

  async execute(): Promise<Either<Failure, FaqEntity[]>> {
    return this.faqRepository.getAllFaqs();
  }
}
