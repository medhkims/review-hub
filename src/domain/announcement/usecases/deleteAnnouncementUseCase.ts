import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';
import { AnnouncementRepository } from '../repositories/announcementRepository';

export class DeleteAnnouncementUseCase {
  constructor(private readonly repository: AnnouncementRepository) {}

  async execute(businessId: string, announcementId: string): Promise<Either<Failure, void>> {
    return this.repository.deleteAnnouncement(businessId, announcementId);
  }
}
