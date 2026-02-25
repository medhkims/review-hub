import { ProfileRepository } from '../repositories/profileRepository';
import { ProfileEntity } from '../entities/profileEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class UpdateProfileUseCase {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async execute(userId: string, updates: Partial<ProfileEntity>): Promise<Either<Failure, ProfileEntity>> {
    return this.profileRepository.updateProfile(userId, updates);
  }
}
