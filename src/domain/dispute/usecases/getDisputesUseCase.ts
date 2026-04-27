import { DisputeRepository } from '../repositories/disputeRepository';
import { DisputeEntity, DisputeStatus } from '../entities/disputeEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class GetDisputesUseCase {
  constructor(private readonly disputeRepository: DisputeRepository) {}

  async execute(status?: DisputeStatus): Promise<Either<Failure, DisputeEntity[]>> {
    return this.disputeRepository.getDisputes(status);
  }
}
