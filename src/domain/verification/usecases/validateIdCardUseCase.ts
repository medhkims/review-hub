import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';
import { VerificationRepository } from '../repositories/verificationRepository';

export class ValidateIdCardUseCase {
  constructor(private readonly verificationRepository: VerificationRepository) {}

  execute(imageBase64: string): Promise<Either<Failure, { isValid: boolean; cinNumber: string | null }>> {
    return this.verificationRepository.validateIdCard(imageBase64);
  }
}
