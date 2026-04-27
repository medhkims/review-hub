import { AuthRepository } from '../repositories/authRepository';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class DeleteAccountUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(): Promise<Either<Failure, void>> {
    return this.authRepository.deleteAccount();
  }
}
