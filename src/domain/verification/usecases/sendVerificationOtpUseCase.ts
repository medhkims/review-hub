import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';
import { VerificationRepository } from '../repositories/verificationRepository';

export class SendVerificationOtpUseCase {
  constructor(private readonly verificationRepository: VerificationRepository) {}

  async execute(phoneNumber: string): Promise<Either<Failure, void>> {
    return this.verificationRepository.sendOtp(phoneNumber);
  }
}
