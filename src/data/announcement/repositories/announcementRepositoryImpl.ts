import { AnnouncementRepository, CreateAnnouncementParams } from '@/domain/announcement/repositories/announcementRepository';
import { AnnouncementEntity } from '@/domain/announcement/entities/announcementEntity';
import { AnnouncementRemoteDataSource } from '../datasources/announcementRemoteDataSource';
import { AnnouncementMapper } from '../mappers/announcementMapper';
import { Either, left, right } from '@/core/types/either';
import { Failure, ServerFailure } from '@/core/error/failures';
import { ServerException } from '@/core/error/exceptions';
import { Timestamp } from 'firebase/firestore';

export class AnnouncementRepositoryImpl implements AnnouncementRepository {
  constructor(private readonly remote: AnnouncementRemoteDataSource) {}

  async getAnnouncements(businessId: string): Promise<Either<Failure, AnnouncementEntity[]>> {
    try {
      const models = await this.remote.getAnnouncements(businessId);
      const entities = models.map(AnnouncementMapper.toEntity);
      return right(entities);
    } catch (error) {
      if (error instanceof ServerException) {
        return left(new ServerFailure(error.message));
      }
      return left(new ServerFailure('Failed to fetch announcements'));
    }
  }

  async createAnnouncement(businessId: string, data: CreateAnnouncementParams): Promise<Either<Failure, AnnouncementEntity>> {
    try {
      const model = await this.remote.createAnnouncement(businessId, {
        title: data.title,
        description: data.description,
        image_url: data.imageUrl ?? null,
        valid_until: data.validUntil ?? null,
      });
      return right(AnnouncementMapper.toEntity(model));
    } catch (error) {
      if (error instanceof ServerException) {
        return left(new ServerFailure(error.message));
      }
      return left(new ServerFailure('Failed to create announcement'));
    }
  }

  async updateAnnouncement(businessId: string, announcementId: string, data: Partial<CreateAnnouncementParams>): Promise<Either<Failure, void>> {
    try {
      const firestoreData: Record<string, unknown> = {};
      if (data.title !== undefined) firestoreData.title = data.title;
      if (data.description !== undefined) firestoreData.description = data.description;
      if (data.imageUrl !== undefined) firestoreData.image_url = data.imageUrl;
      if (data.validUntil !== undefined) {
        firestoreData.valid_until = data.validUntil ? Timestamp.fromDate(data.validUntil) : null;
      }
      await this.remote.updateAnnouncement(businessId, announcementId, firestoreData);
      return right(undefined);
    } catch (error) {
      if (error instanceof ServerException) {
        return left(new ServerFailure(error.message));
      }
      return left(new ServerFailure('Failed to update announcement'));
    }
  }

  async deleteAnnouncement(businessId: string, announcementId: string): Promise<Either<Failure, void>> {
    try {
      await this.remote.deleteAnnouncement(businessId, announcementId);
      return right(undefined);
    } catch (error) {
      if (error instanceof ServerException) {
        return left(new ServerFailure(error.message));
      }
      return left(new ServerFailure('Failed to delete announcement'));
    }
  }
}
