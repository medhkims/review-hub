import { WeeklyPickEntity } from '../entities/weeklyPickEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export interface CreateWeeklyPickParams {
  businessId: string;
  businessName: string;
  businessLogoUrl: string | null;
  businessCoverUrl: string | null;
  businessRating: number;
  businessReviewCount: number;
  categoryName: string;
  pickReason: string;
}

export interface WeeklyPickRepository {
  getWeeklyPicks(): Promise<Either<Failure, WeeklyPickEntity[]>>;
  getAllWeeklyPicks(): Promise<Either<Failure, WeeklyPickEntity[]>>;
  createWeeklyPick(params: CreateWeeklyPickParams): Promise<Either<Failure, string>>;
  deleteWeeklyPick(id: string): Promise<Either<Failure, void>>;
}
