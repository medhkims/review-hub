import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';
import { DisputeEntity, DisputeStatus } from '../entities/disputeEntity';

export interface SubmitDisputeParams {
  reviewId: string;
  businessId: string;
  businessName: string;
  reviewAuthorId: string;
  reviewAuthorName: string;
  reviewText: string;
  reviewRating: number;
  disputedById: string;
  disputedByName: string;
  disputedByEmail: string;
  reason: string;
  explanation: string;
  evidenceUrls: string[];
}

export interface ResolveDisputeParams {
  disputeId: string;
  status: DisputeStatus;
  adminNotes: string;
  resolvedById: string;
  removeReview: boolean;
}

export interface DisputeRepository {
  submitDispute(params: SubmitDisputeParams): Promise<Either<Failure, string>>;
  getDisputes(status?: DisputeStatus): Promise<Either<Failure, DisputeEntity[]>>;
  getDisputesByReview(reviewId: string): Promise<Either<Failure, DisputeEntity[]>>;
  resolveDispute(params: ResolveDisputeParams): Promise<Either<Failure, void>>;
}
