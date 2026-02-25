import { BusinessEntity } from '../entities/businessEntity';
import { BusinessDetailEntity } from '../entities/businessDetailEntity';
import { ReviewEntity } from '../entities/reviewEntity';
import { RegisterBusinessParams } from '../usecases/registerBusinessUseCase';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export interface BusinessRepository {
  getFeaturedBusinesses(): Promise<Either<Failure, BusinessEntity[]>>;
  getBusinessesByCategory(categoryId: string): Promise<Either<Failure, BusinessEntity[]>>;
  searchBusinesses(query: string): Promise<Either<Failure, BusinessEntity[]>>;
  toggleFavorite(businessId: string, userId: string): Promise<Either<Failure, boolean>>;
  getBusinessDetail(businessId: string): Promise<Either<Failure, BusinessDetailEntity>>;
  getBusinessReviews(businessId: string): Promise<Either<Failure, ReviewEntity[]>>;
  getBusinessByOwnerId(userId: string): Promise<Either<Failure, BusinessDetailEntity | null>>;
  registerBusiness(params: RegisterBusinessParams): Promise<Either<Failure, string>>;
  updateBusiness(businessId: string, data: Record<string, unknown>): Promise<Either<Failure, void>>;
}
