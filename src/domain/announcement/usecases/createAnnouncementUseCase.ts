import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';
import { AnnouncementEntity } from '../entities/announcementEntity';
import { AnnouncementRepository, CreateAnnouncementParams } from '../repositories/announcementRepository';

export class CreateAnnouncementUseCase {
  constructor(private readonly repository: AnnouncementRepository) {}

  async execute(businessId: string, data: CreateAnnouncementParams): Promise<Either<Failure, AnnouncementEntity>> {
    return this.repository.createAnnouncement(businessId, data);
  }
}
