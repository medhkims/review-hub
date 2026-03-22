import { AuthRepository } from '../repositories/authRepository';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class SendPasswordChangeEmailVerificationUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(): Promise<Either<Failure, void>> {
    return this.authRepository.sendPasswordChangeEmailVerification();
  }
}
