import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';
import { VerificationEntity } from '../entities/verificationEntity';
import { VerificationRepository } from '../repositories/verificationRepository';

export class GetPendingVerificationsUseCase {
  constructor(private readonly verificationRepository: VerificationRepository) {}

  async execute(): Promise<Either<Failure, VerificationEntity[]>> {
    return this.verificationRepository.getPendingVerifications();
  }
}
