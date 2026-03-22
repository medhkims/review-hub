import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';
import { VerificationEntity } from '../entities/verificationEntity';
import { VerificationRepository } from '../repositories/verificationRepository';

export class GetUserVerificationUseCase {
  constructor(private readonly verificationRepository: VerificationRepository) {}

  async execute(userId: string): Promise<Either<Failure, VerificationEntity | null>> {
    return this.verificationRepository.getUserVerification(userId);
  }
}
