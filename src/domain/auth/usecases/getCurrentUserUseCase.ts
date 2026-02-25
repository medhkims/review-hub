import { AuthRepository } from '../repositories/authRepository';
import { UserEntity } from '../entities/userEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class GetCurrentUserUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(): Promise<Either<Failure, UserEntity | null>> {
    return this.authRepository.getCurrentUser();
  }
}
