import { AuthRepository } from '../repositories/authRepository';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class VerifyEmailOtpUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(email: string, code: string): Promise<Either<Failure, void>> {
    return this.authRepository.verifyEmailOtp(email, code);
  }
}
