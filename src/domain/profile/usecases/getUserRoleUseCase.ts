import { ProfileRepository } from '../repositories/profileRepository';
import { UserRole } from '../entities/userRole';
import { Either, left, right } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class GetUserRoleUseCase {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async execute(userId: string): Promise<Either<Failure, UserRole>> {
    const result = await this.profileRepository.getProfile(userId);
    return result.fold<Either<Failure, UserRole>>(
      (failure) => left(failure),
      (profile) => right(profile.role),
    );
  }
}
