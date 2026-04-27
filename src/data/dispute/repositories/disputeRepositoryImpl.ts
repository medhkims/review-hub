import { DisputeRepository, SubmitDisputeParams, ResolveDisputeParams } from '@/domain/dispute/repositories/disputeRepository';
import { DisputeRemoteDataSource } from '../datasources/disputeRemoteDataSource';
import { DisputeMapper } from '../mappers/disputeMapper';
import { DisputeEntity, DisputeStatus } from '@/domain/dispute/entities/disputeEntity';
import { Either, left, right } from '@/core/types/either';
import { Failure, ServerFailure } from '@/core/error/failures';
import { ServerException } from '@/core/error/exceptions';

export class DisputeRepositoryImpl implements DisputeRepository {
  constructor(private readonly remote: DisputeRemoteDataSource) {}

  async submitDispute(params: SubmitDisputeParams): Promise<Either<Failure, string>> {
    try {
      const id = await this.remote.submitDispute({
        review_id: params.reviewId,
        business_id: params.businessId,
        business_name: params.businessName,
        review_author_id: params.reviewAuthorId,
        review_author_name: params.reviewAuthorName,
        review_text: params.reviewText,
        review_rating: params.reviewRating,
        disputed_by_id: params.disputedById,
        disputed_by_name: params.disputedByName,
        disputed_by_email: params.disputedByEmail,
        reason: params.reason,
        explanation: params.explanation,
        evidence_urls: params.evidenceUrls,
        status: 'pending',
      });
      return right(id);
    } catch (error) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      return left(new ServerFailure('Failed to submit dispute'));
    }
  }

  async getDisputes(status?: DisputeStatus): Promise<Either<Failure, DisputeEntity[]>> {
    try {
      const models = await this.remote.getDisputes(status);
      return right(models.map(DisputeMapper.toEntity));
    } catch (error) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      return left(new ServerFailure('Failed to fetch disputes'));
    }
  }

  async getDisputesByReview(reviewId: string): Promise<Either<Failure, DisputeEntity[]>> {
    try {
      const models = await this.remote.getDisputesByReview(reviewId);
      return right(models.map(DisputeMapper.toEntity));
    } catch (error) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      return left(new ServerFailure('Failed to fetch disputes for review'));
    }
  }

  async resolveDispute(params: ResolveDisputeParams): Promise<Either<Failure, void>> {
    try {
      await this.remote.resolveDispute(
        params.disputeId,
        params.status,
        params.adminNotes,
        params.resolvedById,
      );
      if (params.removeReview) {
        // Get the dispute to find the review ID
        const disputes = await this.remote.getDisputes();
        const dispute = disputes.find((d) => d.id === params.disputeId);
        if (dispute) {
          await this.remote.removeReview(dispute.review_id);
        }
      }
      return right(undefined);
    } catch (error) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      return left(new ServerFailure('Failed to resolve dispute'));
    }
  }
}
