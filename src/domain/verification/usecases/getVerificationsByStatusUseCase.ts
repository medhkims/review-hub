import { VerificationRepository } from '../repositories/verificationRepository';
import { VerificationEntity, VerificationStatus } from '../entities/verificationEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class GetVerificationsByStatusUseCase {
  constructor(private readonly verificationRepository: VerificationRepository) {}

  async execute(status: VerificationStatus): Promise<Either<Failure, VerificationEntity[]>> {
    return this.verificationRepository.getVerificationsByStatus(status);
  }
}
