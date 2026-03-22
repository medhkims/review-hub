import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';
import { VerificationEntity } from '../entities/verificationEntity';
import { VerificationRepository, SubmitVerificationParams } from '../repositories/verificationRepository';

export class SubmitVerificationUseCase {
  constructor(private readonly verificationRepository: VerificationRepository) {}

  async execute(params: SubmitVerificationParams): Promise<Either<Failure, VerificationEntity>> {
    return this.verificationRepository.submitVerification(params);
  }
}
