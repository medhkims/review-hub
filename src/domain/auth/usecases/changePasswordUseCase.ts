import { AuthRepository } from '../repositories/authRepository';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class ChangePasswordUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(currentPassword: string, newPassword: string): Promise<Either<Failure, void>> {
    return this.authRepository.changePassword(currentPassword, newPassword);
  }
}
