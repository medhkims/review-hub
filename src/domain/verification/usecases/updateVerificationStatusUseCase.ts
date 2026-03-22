import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';
import { VerificationRepository } from '../repositories/verificationRepository';
import { VerificationStatus } from '../entities/verificationEntity';

export class UpdateVerificationStatusUseCase {
  constructor(private readonly verificationRepository: VerificationRepository) {}

  async execute(
    id: string,
    status: VerificationStatus,
    reviewedBy: string,
    rejectionReason?: string,
  ): Promise<Either<Failure, void>> {
    return this.verificationRepository.updateVerificationStatus(id, status, reviewedBy, rejectionReason);
  }
}
