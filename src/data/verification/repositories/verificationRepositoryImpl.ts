import { VerificationRepository, SubmitVerificationParams } from '@/domain/verification/repositories/verificationRepository';
import { VerificationEntity, VerificationStatus } from '@/domain/verification/entities/verificationEntity';
import { Either, left, right } from '@/core/types/either';
import { Failure, ServerFailure } from '@/core/error/failures';
import { ServerException } from '@/core/error/exceptions';
import { VerificationRemoteDataSource } from '../datasources/verificationRemoteDataSource';
import { VerificationMapper } from '../mappers/verificationMapper';

export class VerificationRepositoryImpl implements VerificationRepository {
  constructor(private readonly remote: VerificationRemoteDataSource) {}

  async submitVerification(params: SubmitVerificationParams): Promise<Either<Failure, VerificationEntity>> {
    try {
      const idCardUrl = await this.remote.uploadIdCard(
        params.userId,
        params.idCardImageUri,
        params.idCardMimeType,
      );
      const model = await this.remote.submitVerification(
        params.userId,
        params.userEmail,
        params.userName,
        params.fullName,
        params.phoneNumber,
        idCardUrl,
      );
      return right(VerificationMapper.toEntity(model));
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to submit verification';
      return left(new ServerFailure(msg));
    }
  }

  async getUserVerification(userId: string): Promise<Either<Failure, VerificationEntity | null>> {
    try {
      const model = await this.remote.getUserVerification(userId);
      if (!model) return right(null);
      return right(VerificationMapper.toEntity(model));
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch verification';
      return left(new ServerFailure(msg));
    }
  }

  async getPendingVerifications(): Promise<Either<Failure, VerificationEntity[]>> {
    try {
      const models = await this.remote.getPendingVerifications();
      return right(models.map(VerificationMapper.toEntity));
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch pending verifications';
      return left(new ServerFailure(msg));
    }
  }

  async getVerificationsByStatus(status: VerificationStatus): Promise<Either<Failure, VerificationEntity[]>> {
    try {
      const models = await this.remote.getVerificationsByStatus(status);
      return right(models.map(VerificationMapper.toEntity));
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch verifications';
      return left(new ServerFailure(msg));
    }
  }

  async updateVerificationStatus(
    id: string,
    status: VerificationStatus,
    reviewedBy: string,
    rejectionReason?: string,
  ): Promise<Either<Failure, void>> {
    try {
      await this.remote.updateVerificationStatus(id, status, reviewedBy, rejectionReason);
      return right(undefined);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to update verification status';
      return left(new ServerFailure(msg));
    }
  }

  async sendOtp(phoneNumber: string): Promise<Either<Failure, void>> {
    try {
      await this.remote.sendOtp(phoneNumber);
      return right(undefined);
    } catch (error: unknown) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      const msg = error instanceof Error ? error.message : 'Failed to send OTP';
      return left(new ServerFailure(msg));
    }
  }

  async verifyOtp(phoneNumber: string, code: string): Promise<Either<Failure, void>> {
    try {
      await this.remote.verifyOtp(phoneNumber, code);
      return right(undefined);
    } catch (error: unknown) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      const msg = error instanceof Error ? error.message : 'Failed to verify OTP';
      return left(new ServerFailure(msg));
    }
  }
}
