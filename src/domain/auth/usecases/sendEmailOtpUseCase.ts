import { AuthRepository } from '../repositories/authRepository';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class SendEmailOtpUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(email: string): Promise<Either<Failure, void>> {
    return this.authRepository.sendEmailOtp(email);
  }
}
