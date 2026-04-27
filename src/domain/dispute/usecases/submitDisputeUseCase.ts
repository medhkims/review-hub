import { DisputeRepository, SubmitDisputeParams } from '../repositories/disputeRepository';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class SubmitDisputeUseCase {
  constructor(private readonly disputeRepository: DisputeRepository) {}

  async execute(params: SubmitDisputeParams): Promise<Either<Failure, string>> {
    return this.disputeRepository.submitDispute(params);
  }
}
