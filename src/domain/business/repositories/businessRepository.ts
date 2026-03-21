import { BusinessEntity } from '../entities/businessEntity';
import { BusinessDetailEntity } from '../entities/businessDetailEntity';
import { ReviewEntity } from '../entities/reviewEntity';
import { CommentEntity, ReplyEntity } from '../entities/commentEntity';
import { ActiveCategoryInfoEntity } from '../entities/activeCategoryInfoEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export interface RegisterBusinessParams {
  businessName: string;
  category: string;
  subCategories: string[];
  email: string;
  phone: string;
  location: string;
  website: string;
  facebook: string;
  instagram: string;
}

export interface SubmitBusinessParams {
  businessName: string;
  categoryId: string;
  categoryName: string;
  location: string;
  website?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  isAdminSubmit?: boolean;
}

export interface DuplicateCheckResult {
  exact: { id: string; name: string } | null;
  similar: { id: string; name: string } | null;
}

export interface BusinessRepository {
  getFeaturedBusinesses(): Promise<Either<Failure, BusinessEntity[]>>;
  getNewBusinesses(): Promise<Either<Failure, BusinessEntity[]>>;
  getBusinessesByCategory(categoryId: string): Promise<Either<Failure, BusinessEntity[]>>;
  searchBusinesses(query: string, categoryId?: string | null): Promise<Either<Failure, BusinessEntity[]>>;
  fuzzySearchBusiness(query: string, categoryId?: string | null): Promise<Either<Failure, BusinessEntity | null>>;
  toggleFavorite(businessId: string, userId: string): Promise<Either<Failure, boolean>>;
  getBusinessDetail(businessId: string, skipTracking?: boolean): Promise<Either<Failure, BusinessDetailEntity>>;
  getBusinessReviews(businessId: string): Promise<Either<Failure, ReviewEntity[]>>;
  getBusinessByOwnerId(userId: string): Promise<Either<Failure, BusinessDetailEntity | null>>;
  registerBusiness(params: RegisterBusinessParams): Promise<Either<Failure, string>>;
  updateBusiness(businessId: string, data: Record<string, unknown>): Promise<Either<Failure, void>>;
  getActiveCategoryInfo(): Promise<Either<Failure, ActiveCategoryInfoEntity>>;
  submitBusiness(params: SubmitBusinessParams): Promise<Either<Failure, string>>;
  checkBusinessDuplicate(name: string, categoryId: string): Promise<Either<Failure, DuplicateCheckResult>>;
  uploadBusinessImage(businessId: string, imageUri: string, type: 'cover' | 'logo' | 'menu'): Promise<Either<Failure, string>>;
  getPendingBusinesses(): Promise<Either<Failure, BusinessDetailEntity[]>>;
  getApprovedBusinesses(): Promise<Either<Failure, BusinessDetailEntity[]>>;
  getRejectedBusinesses(): Promise<Either<Failure, BusinessDetailEntity[]>>;
  acceptBusiness(businessId: string): Promise<Either<Failure, void>>;
  rejectBusiness(businessId: string): Promise<Either<Failure, void>>;
  suspendBusiness(businessId: string): Promise<Either<Failure, void>>;
  reApproveBusiness(businessId: string): Promise<Either<Failure, void>>;
  getSuspendedBusinesses(): Promise<Either<Failure, BusinessDetailEntity[]>>;
  incrementSearchCount(businessId: string): Promise<Either<Failure, void>>;
  incrementGlobalSearchCount(): Promise<Either<Failure, void>>;
  reportBusiness(params: ReportBusinessParams): Promise<Either<Failure, void>>;
  likeReview(reviewId: string): Promise<Either<Failure, void>>;
  unlikeReview(reviewId: string): Promise<Either<Failure, void>>;
  incrementReviewView(reviewId: string): Promise<Either<Failure, void>>;
  getReviewComments(reviewId: string): Promise<Either<Failure, CommentEntity[]>>;
  addReviewComment(reviewId: string, text: string): Promise<Either<Failure, CommentEntity>>;
  addCommentReply(commentId: string, reviewId: string, text: string): Promise<Either<Failure, ReplyEntity>>;
}

export interface ReportBusinessParams {
  businessId: string;
  businessName: string;
  reason: string;
  reportedByUserId: string;
  reporterDisplayName: string;
}
