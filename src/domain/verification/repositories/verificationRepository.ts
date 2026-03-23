import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';
import { VerificationEntity, VerificationStatus } from '../entities/verificationEntity';

export interface SubmitVerificationParams {
  userId: string;
  userEmail: string;
  userName: string;
  fullName: string;
  phoneNumber: string;
  idCardImageUri: string;
  idCardMimeType?: string;
  cinNumber?: string | null;
}

export interface VerificationRepository {
  submitVerification(params: SubmitVerificationParams): Promise<Either<Failure, VerificationEntity>>;
  getUserVerification(userId: string): Promise<Either<Failure, VerificationEntity | null>>;
  getPendingVerifications(): Promise<Either<Failure, VerificationEntity[]>>;
  getVerificationsByStatus(status: VerificationStatus): Promise<Either<Failure, VerificationEntity[]>>;
  updateVerificationStatus(
    id: string,
    status: VerificationStatus,
    reviewedBy: string,
    rejectionReason?: string,
  ): Promise<Either<Failure, void>>;
  sendOtp(phoneNumber: string): Promise<Either<Failure, void>>;
  verifyOtp(phoneNumber: string, code: string): Promise<Either<Failure, void>>;
  validateIdCard(imageBase64: string): Promise<Either<Failure, { isValid: boolean; cinNumber: string | null }>>;
  extractAndSaveCin(verificationId: string): Promise<Either<Failure, string | null>>;
}
