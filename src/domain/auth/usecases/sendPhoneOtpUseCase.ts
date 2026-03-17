import { AuthRepository } from '../repositories/authRepository';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class SendPhoneOtpUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(phone: string): Promise<Either<Failure, void>> {
    return this.authRepository.sendPhoneOtp(phone);
  }
}
