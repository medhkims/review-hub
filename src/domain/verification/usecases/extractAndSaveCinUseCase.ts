import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';
import { VerificationRepository } from '../repositories/verificationRepository';

export class ExtractAndSaveCinUseCase {
  constructor(private readonly verificationRepository: VerificationRepository) {}

  execute(verificationId: string): Promise<Either<Failure, string | null>> {
    return this.verificationRepository.extractAndSaveCin(verificationId);
  }
}
