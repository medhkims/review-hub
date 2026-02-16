import { ProfileEntity } from '../entities/profileEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export interface ProfileRepository {
  getProfile(userId: string): Promise<Either<Failure, ProfileEntity>>;
  updateProfile(profile: Partial<ProfileEntity>): Promise<Either<Failure, ProfileEntity>>;
}
