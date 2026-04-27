import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';
import { AnnouncementEntity } from '../entities/announcementEntity';
import { AnnouncementRepository } from '../repositories/announcementRepository';

export class GetAnnouncementsUseCase {
  constructor(private readonly repository: AnnouncementRepository) {}

  async execute(businessId: string): Promise<Either<Failure, AnnouncementEntity[]>> {
    return this.repository.getAnnouncements(businessId);
  }
}
