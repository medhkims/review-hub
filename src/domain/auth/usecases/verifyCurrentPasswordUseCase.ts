import { AuthRepository } from '../repositories/authRepository';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class VerifyCurrentPasswordUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(currentPassword: string): Promise<Either<Failure, void>> {
    return this.authRepository.verifyCurrentPassword(currentPassword);
  }
}
