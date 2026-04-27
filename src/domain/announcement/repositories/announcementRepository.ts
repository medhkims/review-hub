import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';
import { AnnouncementEntity } from '../entities/announcementEntity';

export interface CreateAnnouncementParams {
  title: string;
  description: string;
  imageUrl?: string | null;
  validUntil?: Date | null;
}

export interface AnnouncementRepository {
  getAnnouncements(businessId: string): Promise<Either<Failure, AnnouncementEntity[]>>;
  createAnnouncement(businessId: string, data: CreateAnnouncementParams): Promise<Either<Failure, AnnouncementEntity>>;
  updateAnnouncement(businessId: string, announcementId: string, data: Partial<CreateAnnouncementParams>): Promise<Either<Failure, void>>;
  deleteAnnouncement(businessId: string, announcementId: string): Promise<Either<Failure, void>>;
}
