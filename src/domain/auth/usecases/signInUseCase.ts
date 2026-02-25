import { AuthRepository } from '../repositories/authRepository';
import { UserEntity } from '../entities/userEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class SignInUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(email: string, password: string): Promise<Either<Failure, UserEntity>> {
    return this.authRepository.signIn(email, password);
  }
}
