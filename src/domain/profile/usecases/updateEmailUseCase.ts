import { ProfileRepository } from '../repositories/profileRepository';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class UpdateEmailUseCase {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async execute(userId: string, newEmail: string): Promise<Either<Failure, void>> {
    return this.profileRepository.updateEmail(userId, newEmail);
  }
}
