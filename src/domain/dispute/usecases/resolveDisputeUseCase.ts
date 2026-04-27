import { DisputeRepository, ResolveDisputeParams } from '../repositories/disputeRepository';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class ResolveDisputeUseCase {
  constructor(
    private readonly disputeRepository: DisputeRepository,
  ) {}

  async execute(params: ResolveDisputeParams): Promise<Either<Failure, void>> {
    return this.disputeRepository.resolveDispute(params);
  }
}
