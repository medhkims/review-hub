import { AuthRepository } from '../repositories/authRepository';
import { UserEntity } from '../entities/userEntity';
import { UserRole } from '@/domain/profile/entities/userRole';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class SignUpUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(
    email: string,
    password: string,
    displayName: string,
    role?: UserRole,
    phoneNumber?: string,
  ): Promise<Either<Failure, UserEntity>> {
    return this.authRepository.signUp(email, password, displayName, role, phoneNumber);
  }
}
