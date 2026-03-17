import { BusinessRepository, SubmitBusinessParams } from '../repositories/businessRepository';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class SubmitBusinessUseCase {
  constructor(private readonly businessRepository: BusinessRepository) {}

  async execute(params: SubmitBusinessParams): Promise<Either<Failure, string>> {
    return this.businessRepository.submitBusiness(params);
  }
}
