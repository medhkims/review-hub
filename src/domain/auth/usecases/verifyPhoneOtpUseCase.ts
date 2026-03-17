import { AuthRepository } from '../repositories/authRepository';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class VerifyPhoneOtpUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(businessId: string, code: string): Promise<Either<Failure, void>> {
    return this.authRepository.verifyPhoneOtp(businessId, code);
  }
}
