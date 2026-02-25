import { ProfileRepository } from '../repositories/profileRepository';
import { ProfileEntity } from '../entities/profileEntity';
import { UserRole, isValidRole } from '../entities/userRole';
import { Either, left } from '@/core/types/either';
import { Failure, ValidationFailure } from '@/core/error/failures';

export class UpdateUserRoleUseCase {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async execute(userId: string, newRole: UserRole): Promise<Either<Failure, ProfileEntity>> {
    if (!isValidRole(newRole)) {
      return left(new ValidationFailure('Invalid role specified'));
    }
    return this.profileRepository.updateProfile(userId, { role: newRole });
  }
}
