import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';
import { VerificationRepository } from '../repositories/verificationRepository';

export class VerifyVerificationOtpUseCase {
  constructor(private readonly verificationRepository: VerificationRepository) {}

  async execute(phoneNumber: string, code: string): Promise<Either<Failure, void>> {
    return this.verificationRepository.verifyOtp(phoneNumber, code);
  }
}
