import { WeeklyPickRepository, CreateWeeklyPickParams } from '@/domain/weeklyPicks/repositories/weeklyPickRepository';
import { WeeklyPickEntity } from '@/domain/weeklyPicks/entities/weeklyPickEntity';
import { WeeklyPickRemoteDataSource } from '../datasources/weeklyPickRemoteDataSource';
import { WeeklyPickMapper } from '../mappers/weeklyPickMapper';
import { Either, left, right } from '@/core/types/either';
import { Failure, ServerFailure } from '@/core/error/failures';
import { Timestamp } from 'firebase/firestore';

export class WeeklyPickRepositoryImpl implements WeeklyPickRepository {
  constructor(private readonly remote: WeeklyPickRemoteDataSource) {}

  async getWeeklyPicks(): Promise<Either<Failure, WeeklyPickEntity[]>> {
    try {
      const models = await this.remote.getWeeklyPicks();
      return right(models.map(WeeklyPickMapper.toEntity));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load weekly picks';
      return left(new ServerFailure(message));
    }
  }

  async getAllWeeklyPicks(): Promise<Either<Failure, WeeklyPickEntity[]>> {
    try {
      const models = await this.remote.getAllWeeklyPicks();
      return right(models.map(WeeklyPickMapper.toEntity));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load weekly picks';
      return left(new ServerFailure(message));
    }
  }

  async createWeeklyPick(params: CreateWeeklyPickParams): Promise<Either<Failure, string>> {
    try {
      const now = Timestamp.now();
      const id = await this.remote.createWeeklyPick({
        business_id: params.businessId,
        business_name: params.businessName,
        business_logo_url: params.businessLogoUrl,
        business_cover_url: params.businessCoverUrl,
        business_rating: params.businessRating,
        business_review_count: params.businessReviewCount,
        category_name: params.categoryName,
        pick_reason: params.pickReason,
        week_start_date: now,
        created_at: now,
      });
      return right(id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create weekly pick';
      return left(new ServerFailure(message));
    }
  }

  async deleteWeeklyPick(id: string): Promise<Either<Failure, void>> {
    try {
      await this.remote.deleteWeeklyPick(id);
      return right(undefined);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete weekly pick';
      return left(new ServerFailure(message));
    }
  }
}
